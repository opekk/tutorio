import { NextResponse } from "next/server"
import { PrismaClient } from "@/generated/prisma"
import { requireAuth } from "@/lib/auth"
import { compare } from "bcryptjs"
import { z } from "zod"

const prisma = new PrismaClient()

const changeEmailSchema = z.object({
  newEmail: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

const EMAIL_CHANGE_COOLDOWN_DAYS = 7

export async function PUT(req: Request) {
  try {
    const user = await requireAuth()
    const body = await req.json()

    // Validate input
    const validationResult = changeEmailSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      )
    }

    const { newEmail, password } = validationResult.data

    // Fetch user data
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        password: true,
        lastEmailChange: true,
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

    // Check rate limit
    if (userData.lastEmailChange) {
      const cooldownEnd = new Date(userData.lastEmailChange)
      cooldownEnd.setDate(
        cooldownEnd.getDate() + EMAIL_CHANGE_COOLDOWN_DAYS
      )

      if (new Date() < cooldownEnd) {
        return NextResponse.json(
          {
            error: "Email change rate limit exceeded",
            nextAvailableDate: cooldownEnd.toISOString(),
            daysRemaining: Math.ceil(
              (cooldownEnd.getTime() - new Date().getTime()) /
                (1000 * 60 * 60 * 24)
            ),
          },
          { status: 429 }
        )
      }
    }

    // Check if new email is already taken
    if (newEmail !== userData.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: newEmail },
      })

      if (existingUser) {
        return NextResponse.json(
          { error: "Email already in use" },
          { status: 409 }
        )
      }
    }

    // Update email
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        email: newEmail,
        lastEmailChange: new Date(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    })

    return NextResponse.json({
      message: "Email updated successfully",
      user: updatedUser,
    })
  } catch (error) {
    console.error("Error updating email:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}
