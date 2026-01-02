import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { PrismaClient, Role } from "@/generated/prisma"
import { z } from "zod"

const prisma = new PrismaClient()

const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["STUDENT", "TUTOR"]),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()

    // Validate input
    const validationResult = registerSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      )
    }

    const { name, email, password, role } = validationResult.data

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await hash(password, 10)

    // Create user with appropriate profile
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role as Role,
        // Create profile based on role
        ...(role === "TUTOR" && {
          tutorProfile: {
            create: {}
          }
        }),
        ...(role === "STUDENT" && {
          studentProfile: {
            create: {}
          }
        }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        tutorProfile: {
          select: {
            id: true,
          }
        },
        studentProfile: {
          select: {
            id: true,
          }
        },
      }
    })

    return NextResponse.json(
      {
        message: "Account created successfully",
        user
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
