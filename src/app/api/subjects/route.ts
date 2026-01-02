import { NextResponse } from "next/server"
import { PrismaClient } from "@/generated/prisma"
import { requireAuth } from "@/lib/auth"

const prisma = new PrismaClient()

// GET /api/subjects - Get all subjects
export async function GET() {
  try {
    await requireAuth()

    const subjects = await prisma.subject.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    })

    return NextResponse.json({ subjects })
  } catch (error) {
    console.error("Error fetching subjects:", error)
    return NextResponse.json(
      { error: "Failed to fetch subjects" },
      { status: 500 }
    )
  }
}
