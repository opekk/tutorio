import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { PrismaClient, Role } from "@/generated/prisma"

const prisma = new PrismaClient()

export async function getCurrentUser() {
  const session = await auth()
  return session?.user
}

export async function requireAuth() {
  const session = await auth()
  if (!session) {
    redirect("/login")
  }
  return session.user
}

export async function getCurrentUserRole() {
  const user = await getCurrentUser()
  return user?.role
}

export async function requireRole(allowedRoles: Role | Role[]) {
  const user = await requireAuth()
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]

  if (!roles.includes(user.role)) {
    redirect("/dashboard")
  }

  return user
}

export async function getUserTutors(userId: string) {
  // First get the student profile
  const studentProfile = await prisma.studentProfile.findUnique({
    where: { userId },
    select: { id: true }
  })

  if (!studentProfile) {
    return []
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
            }
          }
        }
      }
    }
  })

  return tutorRelations.map(relation => ({
    ...relation.tutorProfile.user,
    profileId: relation.tutorProfile.id,
  }))
}

export async function getUserStudents(userId: string) {
  // First get the tutor profile
  const tutorProfile = await prisma.tutorProfile.findUnique({
    where: { userId },
    select: { id: true }
  })

  if (!tutorProfile) {
    return []
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
            }
          }
        }
      }
    }
  })

  return studentRelations.map(relation => ({
    ...relation.studentProfile.user,
    profileId: relation.studentProfile.id,
  }))
}
