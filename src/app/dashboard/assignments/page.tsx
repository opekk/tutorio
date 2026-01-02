import { requireRole } from "@/lib/auth"
import { AssignmentsContainer } from "@/components/assignments/AssignmentsContainer"

export default async function AssignmentsPage() {
  const user = await requireRole("TUTOR")

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary">
            Assignments
          </h1>
          <p className="mt-2 text-text-secondary">
            Create and manage student assignments with practice questions
          </p>
        </div>

        <AssignmentsContainer tutorId={user.id} />
      </div>
    </div>
  )
}
