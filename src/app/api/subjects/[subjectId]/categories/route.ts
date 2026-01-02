import { NextResponse } from "next/server"
import { PrismaClient } from "@/generated/prisma"
import { requireAuth } from "@/lib/auth"

const prisma = new PrismaClient()

// GET /api/subjects/[subjectId]/categories - Get all categories for a subject
export async function GET(
  req: Request,
  { params }: { params: Promise<{ subjectId: string }> }
) {
  try {
    await requireAuth()

    const { subjectId } = await params

    const categories = await prisma.category.findMany({
      where: { subjectId },
      orderBy: { order: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        order: true,
      },
    })

    return NextResponse.json({ categories })
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    )
  }
}
