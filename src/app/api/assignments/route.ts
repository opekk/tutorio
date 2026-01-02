import { NextResponse } from "next/server"
import { PrismaClient } from "@/generated/prisma"
import { requireRole } from "@/lib/auth"
import { z } from "zod"

const prisma = new PrismaClient()

const assignmentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  studentProfileId: z.string(),
  questionIds: z.array(z.string()).min(1, "At least 1 question required"),
  dueDate: z.string(),
  tutorId: z.string(),
})

// GET /api/assignments - Get assignments for a tutor
export async function GET(req: Request) {
  try {
    const user = await requireRole("TUTOR")

    const { searchParams } = new URL(req.url)
    const tutorId = searchParams.get("tutorId")
    const studentProfileId = searchParams.get("studentProfileId")

    if (!tutorId) {
      return NextResponse.json(
        { error: "tutorId is required" },
        { status: 400 }
      )
    }

    // Verify ownership
    if (user.id !== tutorId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Get tutor profile
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { userId: tutorId },
    })

    if (!tutorProfile) {
      return NextResponse.json(
        { error: "Tutor profile not found" },
        { status: 404 }
      )
    }

    // Query assignments
    const assignments = await prisma.assignment.findMany({
      where: {
        creatorProfileId: tutorProfile.id,
        ...(studentProfileId && { assignedToProfileId: studentProfileId }),
      },
      include: {
        assignedTo: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        items: {
          include: {
            question: {
              include: {
                subject: {
                  select: {
                    name: true,
                  },
                },
                category: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: { order: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    // Calculate progress for each assignment
    const assignmentsWithProgress = await Promise.all(
      assignments.map(async (assignment) => {
        const questionCount = assignment.items.length

        // Count answered questions
        const answeredCount = await prisma.studentAnswer.count({
          where: {
            studentProfileId: assignment.assignedToProfileId,
            questionId: {
              in: assignment.items.map((item) => item.questionId),
            },
          },
        })

        // Count correct answers
        const correctCount = await prisma.studentAnswer.count({
          where: {
            studentProfileId: assignment.assignedToProfileId,
            questionId: {
              in: assignment.items.map((item) => item.questionId),
            },
            isCorrect: true,
          },
        })

        // Get answers for each question
        const answers = await prisma.studentAnswer.findMany({
          where: {
            studentProfileId: assignment.assignedToProfileId,
            questionId: {
              in: assignment.items.map((item) => item.questionId),
            },
          },
          select: {
            questionId: true,
            isCorrect: true,
          },
        })

        const answersByQuestionId = Object.fromEntries(
          answers.map((a) => [a.questionId, a.isCorrect])
        )

        return {
          id: assignment.id,
          title: assignment.title,
          dueDate: assignment.dueDate?.toISOString() || null,
          createdAt: assignment.createdAt.toISOString(),
          updatedAt: assignment.updatedAt.toISOString(),
          student: {
            id: assignment.assignedTo.user.id,
            name: assignment.assignedTo.user.name,
            email: assignment.assignedTo.user.email,
            profileId: assignment.assignedToProfileId,
          },
          questionCount,
          answeredCount,
          correctCount,
          questions: assignment.items.map((item) => ({
            id: item.question.id,
            text: item.question.text,
            order: item.order,
            subject: item.question.subject,
            category: item.question.category,
            isAnswered: answersByQuestionId[item.question.id] !== undefined,
            isCorrect: answersByQuestionId[item.question.id] ?? null,
          })),
        }
      })
    )

    return NextResponse.json({ assignments: assignmentsWithProgress })
  } catch (error) {
    console.error("Error fetching assignments:", error)
    return NextResponse.json(
      { error: "Failed to fetch assignments" },
      { status: 500 }
    )
  }
}

// POST /api/assignments - Create a new assignment
export async function POST(req: Request) {
  try {
    const user = await requireRole("TUTOR")

    const body = await req.json()

    // Validate input
    const validationResult = assignmentSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      )
    }

    const { title, studentProfileId, questionIds, dueDate, tutorId } =
      validationResult.data

    // Verify ownership
    if (user.id !== tutorId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Get tutor profile
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { userId: tutorId },
    })

    if (!tutorProfile) {
      return NextResponse.json(
        { error: "Tutor profile not found" },
        { status: 404 }
      )
    }

    // Verify student belongs to this tutor
    const tutorStudent = await prisma.tutorStudent.findFirst({
      where: {
        tutorProfileId: tutorProfile.id,
        studentProfileId,
      },
    })

    if (!tutorStudent) {
      return NextResponse.json(
        { error: "Student not found in your student list" },
        { status: 403 }
      )
    }

    // Verify all questions exist and belong to this tutor
    const questions = await prisma.question.findMany({
      where: {
        id: { in: questionIds },
        createdByProfileId: tutorProfile.id,
      },
    })

    if (questions.length !== questionIds.length) {
      return NextResponse.json(
        { error: "One or more questions not found or do not belong to you" },
        { status: 400 }
      )
    }

    // Create assignment with items
    const assignment = await prisma.assignment.create({
      data: {
        title,
        creatorProfileId: tutorProfile.id,
        assignedToProfileId: studentProfileId,
        dueDate: dueDate ? new Date(dueDate) : null,
        items: {
          create: questionIds.map((questionId, index) => ({
            questionId,
            order: index + 1,
          })),
        },
      },
      include: {
        assignedTo: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        items: {
          orderBy: { order: "asc" },
        },
      },
    })

    return NextResponse.json(
      {
        message: "Assignment created successfully",
        assignment: {
          id: assignment.id,
          title: assignment.title,
          dueDate: assignment.dueDate?.toISOString() || null,
          questionCount: assignment.items.length,
          student: {
            id: assignment.assignedTo.user.id,
            name: assignment.assignedTo.user.name,
            email: assignment.assignedTo.user.email,
            profileId: assignment.assignedToProfileId,
          },
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating assignment:", error)
    return NextResponse.json(
      { error: "Failed to create assignment" },
      { status: 500 }
    )
  }
}
