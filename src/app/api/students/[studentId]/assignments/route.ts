import { NextResponse } from "next/server"
import { PrismaClient } from "@/generated/prisma"
import { requireRole } from "@/lib/auth"

const prisma = new PrismaClient()

// GET /api/students/[studentId]/assignments - Get assignments for a student
export async function GET(
  req: Request,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const user = await requireRole("STUDENT")
    const { studentId } = await params

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

    // Get assignments for this student
    const assignments = await prisma.assignment.findMany({
      where: {
        assignedToProfileId: studentProfile.id,
      },
      include: {
        creator: {
          include: {
            user: {
              select: {
                id: true,
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
              },
            },
          },
          orderBy: { order: "asc" },
        },
      },
      orderBy: [
        { dueDate: "asc" }, // Soonest due date first
        { createdAt: "desc" },
      ],
    })

    // Calculate progress for each assignment
    const assignmentsWithProgress = await Promise.all(
      assignments.map(async (assignment) => {
        const questionIds = assignment.items.map((item) => item.questionId)
        const questionCount = questionIds.length

        // Get student's answers for this assignment
        const answers = await prisma.studentAnswer.findMany({
          where: {
            studentProfileId: studentProfile.id,
            questionId: {
              in: questionIds,
            },
          },
          select: {
            questionId: true,
            isCorrect: true,
          },
        })

        const answeredCount = answers.length
        const correctCount = answers.filter((a) => a.isCorrect).length

        return {
          id: assignment.id,
          title: assignment.title,
          dueDate: assignment.dueDate?.toISOString() || null,
          createdAt: assignment.createdAt.toISOString(),
          tutor: {
            id: assignment.creator.user.id,
            name: assignment.creator.user.name,
          },
          questionCount,
          answeredCount,
          correctCount,
        }
      })
    )

    return NextResponse.json({ assignments: assignmentsWithProgress })
  } catch (error) {
    console.error("Error fetching student assignments:", error)
    return NextResponse.json(
      { error: "Failed to fetch assignments" },
      { status: 500 }
    )
  }
}
