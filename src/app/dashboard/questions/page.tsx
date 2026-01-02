import { requireRole } from "@/lib/auth"
import { QuestionForm } from "@/components/questions/QuestionForm"
import { QuestionList } from "@/components/questions/QuestionList"

export default async function QuestionsPage() {
  const user = await requireRole("TUTOR")

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary">
            Question Bank
          </h1>
          <p className="mt-2 text-text-secondary">
            Create and manage questions for your students
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Question Creation Form */}
          <div>
            <div className="rounded-lg border border-border bg-surface p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-text-primary">
                Create Question
              </h2>
              <QuestionForm tutorId={user.id} />
            </div>
          </div>

          {/* Question List */}
          <div>
            <div className="rounded-lg border border-border bg-surface p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-text-primary">
                Your Questions
              </h2>
              <QuestionList tutorId={user.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
