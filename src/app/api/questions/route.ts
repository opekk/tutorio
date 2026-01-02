import { NextResponse } from "next/server"
import { PrismaClient } from "@/generated/prisma"
import { requireRole } from "@/lib/auth"
import { z } from "zod"

const prisma = new PrismaClient()

const questionSchema = z.object({
  text: z.string().min(1, "Question text is required"),
  subjectId: z.string(),
  categoryId: z.string(),
  tutorId: z.string(),
  answerOptions: z.array(
    z.object({
      text: z.string().min(1),
      isCorrect: z.boolean(),
      order: z.number(),
    })
  ).min(2, "At least 2 answer options required"),
})

// GET /api/questions - Get questions (with optional filtering)
export async function GET(req: Request) {
  try {
    await requireRole("TUTOR")

    const { searchParams } = new URL(req.url)
    const tutorId = searchParams.get("tutorId")
    const subjectId = searchParams.get("subjectId")
    const categoryId = searchParams.get("categoryId")

    const questions = await prisma.question.findMany({
      where: {
        ...(tutorId && {
          createdBy: {
            userId: tutorId,
          }
        }),
        ...(subjectId && { subjectId }),
        ...(categoryId && { categoryId }),
      },
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
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ questions })
  } catch (error) {
    console.error("Error fetching questions:", error)
    return NextResponse.json(
      { error: "Failed to fetch questions" },
      { status: 500 }
    )
  }
}

// POST /api/questions - Create a new question
export async function POST(req: Request) {
  try {
    const user = await requireRole("TUTOR")

    // Get tutor profile
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { userId: user.id }
    })

    if (!tutorProfile) {
      return NextResponse.json(
        { error: "Tutor profile not found" },
        { status: 404 }
      )
    }

    const body = await req.json()

    // Validate input
    const validationResult = questionSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      )
    }

    const { text, subjectId, categoryId, answerOptions } = validationResult.data

    // Create question with answer options
    const question = await prisma.question.create({
      data: {
        text,
        subjectId,
        categoryId,
        createdByProfileId: tutorProfile.id,
        answerOptions: {
          create: answerOptions,
        },
      },
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
    })

    return NextResponse.json(
      {
        message: "Question created successfully",
        question,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating question:", error)
    return NextResponse.json(
      { error: "Failed to create question" },
      { status: 500 }
    )
  }
}
