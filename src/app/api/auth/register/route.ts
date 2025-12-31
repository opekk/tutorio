import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { PrismaClient } from "@/generated/prisma"
import { z } from "zod"

const prisma = new PrismaClient()

const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()

    // Validate input
    const validationResult = registerSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      )
    }

    const { name, email, password } = validationResult.data

    // Check if tutor already exists
    const existingTutor = await prisma.tutor.findUnique({
      where: { email }
    })

    if (existingTutor) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await hash(password, 10)

    // Create tutor
    const tutor = await prisma.tutor.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      }
    })

    return NextResponse.json(
      {
        message: "Account created successfully",
        tutor
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}
