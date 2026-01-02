import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { SignOutButton } from "@/components/auth/SignOutButton"

export default async function DashboardPage() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  const isTutor = session.user.role === "TUTOR"
  const isStudent = session.user.role === "STUDENT"

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-text-primary">
                Dashboard
              </h1>
              <p className="text-sm text-text-secondary">
                {isTutor ? "Tutor" : "Student"} Account
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-text-secondary">
                {session.user.email}
              </span>
              <SignOutButton />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-surface p-6 shadow">
          <h2 className="text-xl font-semibold text-text-primary">
            Welcome, {session.user.name}!
          </h2>
          <p className="mt-2 text-text-secondary">
            You are signed in as a {isTutor ? "tutor" : "student"}.
          </p>

          {isTutor && (
            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-medium text-text-primary">
                Quick Actions
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Link
                  href="/dashboard/students"
                  className="card-interactive rounded-lg border border-border p-4 hover:bg-surface-secondary transition-colors"
                >
                  <h4 className="font-medium text-text-primary">
                    👥 Students
                  </h4>
                  <p className="mt-1 text-sm text-text-secondary">
                    Manage your students
                  </p>
                </Link>
                <Link
                  href="/dashboard/questions"
                  className="card-interactive rounded-lg border border-border p-4 hover:bg-surface-secondary transition-colors"
                >
                  <h4 className="font-medium text-text-primary">
                    📝 Questions
                  </h4>
                  <p className="mt-1 text-sm text-text-secondary">
                    Create practice questions
                  </p>
                </Link>
                <Link
                  href="/dashboard/assignments"
                  className="card-interactive rounded-lg border border-border p-4 hover:bg-surface-secondary transition-colors"
                >
                  <h4 className="font-medium text-text-primary">
                    📋 Assignments
                  </h4>
                  <p className="mt-1 text-sm text-text-secondary">
                    Assign questions to students
                  </p>
                </Link>
              </div>
            </div>
          )}

          {isStudent && (
            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-medium text-text-primary">
                Quick Actions
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <Link
                  href="/dashboard/student/assignments"
                  className="card-interactive rounded-lg border border-border p-4 hover:bg-surface-secondary transition-colors"
                >
                  <h4 className="font-medium text-text-primary">
                    📋 My Assignments
                  </h4>
                  <p className="mt-1 text-sm text-text-secondary">
                    View and complete practice questions
                  </p>
                </Link>
                <div className="rounded-lg border border-border p-4 opacity-50">
                  <h4 className="font-medium text-text-primary">
                    👥 My Tutors
                  </h4>
                  <p className="mt-1 text-sm text-text-secondary">
                    Coming soon
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
