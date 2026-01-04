import { NextResponse } from "next/server"
import { PrismaClient } from "@/generated/prisma"
import { requireAuth } from "@/lib/auth"
import { compare } from "bcryptjs"
import { z } from "zod"

const prisma = new PrismaClient()

// GET /api/profile - Fetch current user's profile data and statistics
export async function GET() {
  try {
    const user = await requireAuth()

    // Fetch user with all profile data
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        lastLoginAt: true,
        lastEmailChange: true,
        lastPasswordChange: true,
        tutorProfile: {
          select: {
            id: true,
            _count: {
              select: {
                students: true,
                questionsCreated: true,
                assignmentsCreated: true,
              },
            },
          },
        },
        studentProfile: {
          select: {
            id: true,
            _count: {
              select: {
                tutors: true,
                assignmentsAssigned: true,
                answers: true,
              },
            },
          },
        },
      },
    })

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Build role-specific statistics
    const stats = {
      createdAt: userData.createdAt,
      lastLoginAt: userData.lastLoginAt,
      ...(userData.role === "TUTOR" &&
        userData.tutorProfile && {
          studentsCount: userData.tutorProfile._count.students,
          questionsCount: userData.tutorProfile._count.questionsCreated,
          assignmentsCount: userData.tutorProfile._count.assignmentsCreated,
        }),
      ...(userData.role === "STUDENT" &&
        userData.studentProfile && {
          tutorsCount: userData.studentProfile._count.tutors,
          assignmentsCount: userData.studentProfile._count.assignmentsAssigned,
          answersCount: userData.studentProfile._count.answers,
        }),
    }

    return NextResponse.json({
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        lastEmailChange: userData.lastEmailChange,
        lastPasswordChange: userData.lastPasswordChange,
      },
      stats,
    })
  } catch (error) {
    console.error("Error fetching profile:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}

// Schema for account deletion
const deleteAccountSchema = z.object({
  password: z.string().min(1, "Password is required"),
  confirmDelete: z.boolean().refine((val) => val === true, {
    message: "You must confirm account deletion",
  }),
})

// DELETE /api/profile - Delete user account
export async function DELETE(req: Request) {
  try {
    const user = await requireAuth()
    const body = await req.json()

    // Validate input
    const validationResult = deleteAccountSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      )
    }

    const { password } = validationResult.data

    // Fetch user data
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        password: true,
      },
    })

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Verify password
    const isPasswordValid = await compare(password, userData.password)
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Incorrect password" },
        { status: 401 }
      )
    }

    // Delete user (cascade deletes handle all relations)
    await prisma.user.delete({
      where: { id: user.id },
    })

    return NextResponse.json({
      message: "Account deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting account:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}
