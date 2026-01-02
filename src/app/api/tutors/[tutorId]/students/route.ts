import { NextResponse } from "next/server"
import { PrismaClient } from "@/generated/prisma"
import { requireRole } from "@/lib/auth"
import { z } from "zod"

const prisma = new PrismaClient()

const addStudentSchema = z.object({
  studentEmail: z.string().email("Invalid email address"),
})

// GET /api/tutors/[tutorId]/students - Get all students for a tutor
export async function GET(
  req: Request,
  { params }: { params: Promise<{ tutorId: string }> }
) {
  try {
    const user = await requireRole("TUTOR")
    const { tutorId } = await params

    // Ensure tutors can only access their own students
    if (user.id !== tutorId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    // Get tutor profile
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { userId: tutorId }
    })

    if (!tutorProfile) {
      return NextResponse.json(
        { error: "Tutor profile not found" },
        { status: 404 }
      )
    }

    const studentRelations = await prisma.tutorStudent.findMany({
      where: { tutorProfileId: tutorProfile.id },
      include: {
        studentProfile: {
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

    const students = studentRelations.map(relation => ({
      ...relation.studentProfile.user,
      profileId: relation.studentProfile.id,
    }))

    return NextResponse.json({ students })
  } catch (error) {
    console.error("Error fetching students:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}

// POST /api/tutors/[tutorId]/students - Add a student to tutor by email
export async function POST(
  req: Request,
  { params }: { params: Promise<{ tutorId: string }> }
) {
  try {
    const user = await requireRole("TUTOR")
    const { tutorId } = await params

    // Ensure tutors can only add students to themselves
    if (user.id !== tutorId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    const body = await req.json()

    // Validate input
    const validationResult = addStudentSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      )
    }

    const { studentEmail } = validationResult.data

    // Get tutor profile
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { userId: tutorId }
    })

    if (!tutorProfile) {
      return NextResponse.json(
        { error: "Tutor profile not found" },
        { status: 404 }
      )
    }

    // Check if student exists
    const student = await prisma.user.findUnique({
      where: { email: studentEmail },
      include: {
        studentProfile: true
      }
    })

    if (!student) {
      // Student doesn't exist - need to send invitation
      return NextResponse.json(
        {
          error: "Student not found",
          needsInvitation: true,
          message: "This student hasn't registered yet. Send them an invitation to join Tutorio."
        },
        { status: 404 }
      )
    }

    // Verify the user is actually a student
    if (student.role !== "STUDENT") {
      return NextResponse.json(
        { error: "This user is not a student" },
        { status: 400 }
      )
    }

    if (!student.studentProfile) {
      return NextResponse.json(
        { error: "Student profile not found" },
        { status: 404 }
      )
    }

    // Check if relationship already exists
    const existingRelation = await prisma.tutorStudent.findUnique({
      where: {
        tutorProfileId_studentProfileId: {
          tutorProfileId: tutorProfile.id,
          studentProfileId: student.studentProfile.id,
        }
      }
    })

    if (existingRelation) {
      return NextResponse.json(
        { error: "This student is already added" },
        { status: 409 }
      )
    }

    // Create tutor-student relationship
    const relation = await prisma.tutorStudent.create({
      data: {
        tutorProfileId: tutorProfile.id,
        studentProfileId: student.studentProfile.id,
      },
      include: {
        studentProfile: {
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

    return NextResponse.json(
      {
        message: "Student added successfully",
        student: {
          ...relation.studentProfile.user,
          profileId: relation.studentProfile.id,
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error adding student:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}
