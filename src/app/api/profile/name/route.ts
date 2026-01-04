import { NextResponse } from "next/server"
import { PrismaClient } from "@/generated/prisma"
import { requireAuth } from "@/lib/auth"
import { z } from "zod"

const prisma = new PrismaClient()

const changeNameSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
})

export async function PUT(req: Request) {
  try {
    const user = await requireAuth()
    const body = await req.json()

    // Validate input
    const validationResult = changeNameSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      )
    }

    const { name } = validationResult.data

    // Update name
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { name },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    })

    return NextResponse.json({
      message: "Name updated successfully",
      user: updatedUser,
    })
  } catch (error) {
    console.error("Error updating name:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}
