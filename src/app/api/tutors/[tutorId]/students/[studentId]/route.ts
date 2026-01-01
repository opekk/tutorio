import { NextResponse } from "next/server"
import { PrismaClient } from "@/generated/prisma"
import { requireRole } from "@/lib/auth"

const prisma = new PrismaClient()

// DELETE /api/tutors/[tutorId]/students/[studentId] - Remove student from tutor
export async function DELETE(
  req: Request,
  { params }: { params: { tutorId: string; studentId: string } }
) {
  try {
    const user = await requireRole("TUTOR")

    // Ensure tutors can only remove students from themselves
    if (user.id !== params.tutorId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    // Get tutor profile
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { userId: params.tutorId }
    })

    if (!tutorProfile) {
      return NextResponse.json(
        { error: "Tutor profile not found" },
        { status: 404 }
      )
    }

    // Get student profile
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: params.studentId }
    })

    if (!studentProfile) {
      return NextResponse.json(
        { error: "Student profile not found" },
        { status: 404 }
      )
    }

    // Check if relationship exists
    const relation = await prisma.tutorStudent.findUnique({
      where: {
        tutorProfileId_studentProfileId: {
          tutorProfileId: tutorProfile.id,
          studentProfileId: studentProfile.id,
        }
      }
    })

    if (!relation) {
      return NextResponse.json(
        { error: "Student relationship not found" },
        { status: 404 }
      )
    }

    // Delete the tutor-student relationship
    await prisma.tutorStudent.delete({
      where: {
        tutorProfileId_studentProfileId: {
          tutorProfileId: tutorProfile.id,
          studentProfileId: studentProfile.id,
        }
      }
    })

    return NextResponse.json(
      { message: "Student removed successfully" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error removing student:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}
