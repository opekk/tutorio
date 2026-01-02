import { requireRole } from "@/lib/auth"
import { StudentsContainer } from "@/components/students/StudentsContainer"

export default async function StudentsPage() {
  const user = await requireRole("TUTOR")

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary">
            My Students
          </h1>
          <p className="mt-2 text-text-secondary">
            Manage your students and their assignments
          </p>
        </div>

        <StudentsContainer tutorId={user.id} />
      </div>
    </div>
  )
}
