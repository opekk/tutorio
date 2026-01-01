import { NextResponse } from "next/server"
import { PrismaClient } from "@/generated/prisma"
import { requireAuth } from "@/lib/auth"

const prisma = new PrismaClient()

// GET /api/students/[studentId]/tutors - Get all tutors for a student
export async function GET(
  req: Request,
  { params }: { params: { studentId: string } }
) {
  try {
    const user = await requireAuth()

    // Students can only view their own tutors
    // Tutors can view tutors of their students
    const isOwnData = user.id === params.studentId
    const isTutorCheckingStudent = user.role === "TUTOR"

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

    if (!isOwnData && isTutorCheckingStudent) {
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

      // Verify tutor has relationship with this student
      const hasRelationship = await prisma.tutorStudent.findFirst({
        where: {
          tutorProfileId: tutorProfile.id,
          studentProfileId: studentProfile.id,
        }
      })

      if (!hasRelationship) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 403 }
        )
      }
    } else if (!isOwnData) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    const tutorRelations = await prisma.tutorStudent.findMany({
      where: { studentProfileId: studentProfile.id },
      include: {
        tutorProfile: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
              }
            }
          }
        }
      }
    })

    const tutors = tutorRelations.map(relation => ({
      ...relation.tutorProfile.user,
      profileId: relation.tutorProfile.id,
    }))

    return NextResponse.json({ tutors })
  } catch (error) {
    console.error("Error fetching tutors:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}
