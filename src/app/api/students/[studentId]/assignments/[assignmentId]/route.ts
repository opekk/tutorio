import { NextResponse } from "next/server"
import { PrismaClient } from "@/generated/prisma"
import { requireRole } from "@/lib/auth"
import { z } from "zod"

const prisma = new PrismaClient()

const submitAnswerSchema = z.object({
  questionId: z.string(),
  answerOptionId: z.string(),
})

// GET /api/students/[studentId]/assignments/[assignmentId] - Get assignment details with questions
export async function GET(
  req: Request,
  { params }: { params: Promise<{ studentId: string; assignmentId: string }> }
) {
  try {
    const user = await requireRole("STUDENT")
    const { studentId, assignmentId } = await params

    // Ensure students can only access their own assignments
    if (user.id !== studentId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Get student profile
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: studentId },
    })

    if (!studentProfile) {
      return NextResponse.json(
        { error: "Student profile not found" },
        { status: 404 }
      )
    }

    // Get assignment with questions
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        creator: {
          include: {
            user: {
              select: {
                name: true,
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
                answerOptions: {
                  orderBy: { order: "asc" },
                },
              },
            },
          },
          orderBy: { order: "asc" },
        },
      },
    })

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      )
    }

    // Verify this assignment is for this student
    if (assignment.assignedToProfileId !== studentProfile.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Get student's answers for this assignment
    const questionIds = assignment.items.map((item) => item.questionId)
    const studentAnswers = await prisma.studentAnswer.findMany({
      where: {
        studentProfileId: studentProfile.id,
        questionId: {
          in: questionIds,
        },
      },
      select: {
        questionId: true,
        answerOptionId: true,
        isCorrect: true,
        attemptedAt: true,
      },
    })

    const answersByQuestionId = Object.fromEntries(
      studentAnswers.map((a) => [
        a.questionId,
        {
          answerOptionId: a.answerOptionId,
          isCorrect: a.isCorrect,
          attemptedAt: a.attemptedAt.toISOString(),
        },
      ])
    )

    return NextResponse.json({
      assignment: {
        id: assignment.id,
        title: assignment.title,
        dueDate: assignment.dueDate?.toISOString() || null,
        tutor: {
          name: assignment.creator.user.name,
        },
        questions: assignment.items.map((item) => ({
          id: item.question.id,
          text: item.question.text,
          order: item.order,
          subject: item.question.subject,
          category: item.question.category,
          answerOptions: item.question.answerOptions,
          studentAnswer: answersByQuestionId[item.question.id] || null,
        })),
      },
    })
  } catch (error) {
    console.error("Error fetching assignment:", error)
    return NextResponse.json(
      { error: "Failed to fetch assignment" },
      { status: 500 }
    )
  }
}

// POST /api/students/[studentId]/assignments/[assignmentId] - Submit answer
export async function POST(
  req: Request,
  { params }: { params: Promise<{ studentId: string; assignmentId: string }> }
) {
  try {
    const user = await requireRole("STUDENT")
    const { studentId, assignmentId } = await params

    // Ensure students can only submit their own answers
    if (user.id !== studentId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await req.json()

    // Validate input
    const validationResult = submitAnswerSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      )
    }

    const { questionId, answerOptionId } = validationResult.data

    // Get student profile
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: studentId },
    })

    if (!studentProfile) {
      return NextResponse.json(
        { error: "Student profile not found" },
        { status: 404 }
      )
    }

    // Verify assignment belongs to this student
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        items: {
          where: { questionId },
        },
      },
    })

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      )
    }

    if (assignment.assignedToProfileId !== studentProfile.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    if (assignment.items.length === 0) {
      return NextResponse.json(
        { error: "Question not found in this assignment" },
        { status: 404 }
      )
    }

    // Get the answer option to check if it's correct
    const answerOption = await prisma.answerOption.findUnique({
      where: { id: answerOptionId },
    })

    if (!answerOption) {
      return NextResponse.json(
        { error: "Answer option not found" },
        { status: 404 }
      )
    }

    if (answerOption.questionId !== questionId) {
      return NextResponse.json(
        { error: "Answer option does not belong to this question" },
        { status: 400 }
      )
    }

    // Create or update student answer
    const studentAnswer = await prisma.studentAnswer.upsert({
      where: {
        studentProfileId_questionId: {
          studentProfileId: studentProfile.id,
          questionId,
        },
      },
      create: {
        studentProfileId: studentProfile.id,
        questionId,
        answerOptionId,
        isCorrect: answerOption.isCorrect,
      },
      update: {
        answerOptionId,
        isCorrect: answerOption.isCorrect,
        attemptedAt: new Date(),
      },
    })

    return NextResponse.json({
      message: "Answer submitted successfully",
      isCorrect: studentAnswer.isCorrect,
      correctAnswerId: answerOption.isCorrect
        ? answerOptionId
        : undefined,
    })
  } catch (error) {
    console.error("Error submitting answer:", error)
    return NextResponse.json(
      { error: "Failed to submit answer" },
      { status: 500 }
    )
  }
}
