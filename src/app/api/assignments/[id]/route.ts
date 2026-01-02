import { NextResponse } from "next/server"
import { PrismaClient } from "@/generated/prisma"
import { requireRole } from "@/lib/auth"
import { z } from "zod"

const prisma = new PrismaClient()

const updateAssignmentSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  questionIds: z.array(z.string()).min(1, "At least 1 question required").optional(),
  dueDate: z.string().optional(),
})

// GET /api/assignments/[id] - Get single assignment with full details
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole("TUTOR")
    const { id } = await params

    // Get assignment with full details
    const assignment = await prisma.assignment.findUnique({
      where: { id },
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

    // Verify ownership (tutor can only access their own assignments)
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { userId: user.id },
    })

    if (!tutorProfile || assignment.creatorProfileId !== tutorProfile.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Get student answers
    const studentAnswers = await prisma.studentAnswer.findMany({
      where: {
        studentProfileId: assignment.assignedToProfileId,
        questionId: {
          in: assignment.items.map((item) => item.questionId),
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
        createdAt: assignment.createdAt.toISOString(),
        student: {
          id: assignment.assignedTo.user.id,
          name: assignment.assignedTo.user.name,
          email: assignment.assignedTo.user.email,
          profileId: assignment.assignedToProfileId,
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

// PUT /api/assignments/[id] - Update assignment
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole("TUTOR")
    const { id } = await params

    const body = await req.json()

    // Validate input
    const validationResult = updateAssignmentSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      )
    }

    const { title, questionIds, dueDate } = validationResult.data

    // Get assignment
    const assignment = await prisma.assignment.findUnique({
      where: { id },
    })

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      )
    }

    // Verify ownership
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { userId: user.id },
    })

    if (!tutorProfile || assignment.creatorProfileId !== tutorProfile.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // If questionIds provided, validate them
    if (questionIds) {
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

      // Delete old items and create new ones
      await prisma.assignmentItem.deleteMany({
        where: { assignmentId: id },
      })

      await prisma.assignmentItem.createMany({
        data: questionIds.map((questionId, index) => ({
          assignmentId: id,
          questionId,
          order: index + 1,
        })),
      })
    }

    // Update assignment
    const updatedAssignment = await prisma.assignment.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
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

    return NextResponse.json({
      message: "Assignment updated successfully",
      assignment: {
        id: updatedAssignment.id,
        title: updatedAssignment.title,
        dueDate: updatedAssignment.dueDate?.toISOString() || null,
        questionCount: updatedAssignment.items.length,
        student: {
          id: updatedAssignment.assignedTo.user.id,
          name: updatedAssignment.assignedTo.user.name,
          email: updatedAssignment.assignedTo.user.email,
          profileId: updatedAssignment.assignedToProfileId,
        },
      },
    })
  } catch (error) {
    console.error("Error updating assignment:", error)
    return NextResponse.json(
      { error: "Failed to update assignment" },
      { status: 500 }
    )
  }
}

// DELETE /api/assignments/[id] - Delete assignment
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole("TUTOR")
    const { id } = await params

    // Get assignment
    const assignment = await prisma.assignment.findUnique({
      where: { id },
    })

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      )
    }

    // Verify ownership
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { userId: user.id },
    })

    if (!tutorProfile || assignment.creatorProfileId !== tutorProfile.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Delete assignment (cascade will delete AssignmentItems)
    await prisma.assignment.delete({
      where: { id },
    })

    return NextResponse.json({
      message: "Assignment deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting assignment:", error)
    return NextResponse.json(
      { error: "Failed to delete assignment" },
      { status: 500 }
    )
  }
}
