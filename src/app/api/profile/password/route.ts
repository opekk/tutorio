import { NextResponse } from "next/server"
import { PrismaClient } from "@/generated/prisma"
import { requireAuth } from "@/lib/auth"
import { compare, hash } from "bcryptjs"
import { z } from "zod"

const prisma = new PrismaClient()

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
})

const PASSWORD_CHANGE_COOLDOWN_DAYS = 1

export async function PUT(req: Request) {
  try {
    const user = await requireAuth()
    const body = await req.json()

    // Validate input
    const validationResult = changePasswordSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      )
    }

    const { currentPassword, newPassword } = validationResult.data

    // Fetch user data
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        password: true,
        lastPasswordChange: true,
      },
    })

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Verify current password
    const isPasswordValid = await compare(currentPassword, userData.password)
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Incorrect current password" },
        { status: 401 }
      )
    }

    // Check rate limit
    if (userData.lastPasswordChange) {
      const cooldownEnd = new Date(userData.lastPasswordChange)
      cooldownEnd.setDate(
        cooldownEnd.getDate() + PASSWORD_CHANGE_COOLDOWN_DAYS
      )

      if (new Date() < cooldownEnd) {
        return NextResponse.json(
          {
            error: "Password change rate limit exceeded",
            nextAvailableDate: cooldownEnd.toISOString(),
            hoursRemaining: Math.ceil(
              (cooldownEnd.getTime() - new Date().getTime()) /
                (1000 * 60 * 60)
            ),
          },
          { status: 429 }
        )
      }
    }

    // Hash new password (10 rounds, matching registration)
    const hashedPassword = await hash(newPassword, 10)

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        lastPasswordChange: new Date(),
      },
    })

    return NextResponse.json({
      message: "Password updated successfully",
    })
  } catch (error) {
    console.error("Error updating password:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}
