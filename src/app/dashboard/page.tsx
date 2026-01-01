import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { SignOutButton } from "@/components/auth/SignOutButton"

export default async function DashboardPage() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  const isTutor = session.user.role === "TUTOR"
  const isStudent = session.user.role === "STUDENT"

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                Dashboard
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {isTutor ? "Tutor" : "Student"} Account
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                {session.user.email}
              </span>
              <SignOutButton />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white p-6 shadow dark:bg-zinc-900">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Welcome, {session.user.name}!
          </h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            You are signed in as a {isTutor ? "tutor" : "student"}.
          </p>

          {isTutor && (
            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
                Tutor Features
              </h3>
              <ul className="list-inside list-disc space-y-2 text-zinc-600 dark:text-zinc-400">
                <li>Manage your students</li>
                <li>Create and assign questions</li>
                <li>Track student progress</li>
                <li>Add students by email</li>
              </ul>
              <div className="pt-4">
                <p className="text-sm text-zinc-500 dark:text-zinc-400 italic">
                  Features coming soon: Student management, question creation, and assignment tracking.
                </p>
              </div>
            </div>
          )}

          {isStudent && (
            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
                Student Features
              </h3>
              <ul className="list-inside list-disc space-y-2 text-zinc-600 dark:text-zinc-400">
                <li>View your assignments</li>
                <li>Complete practice questions</li>
                <li>Track your progress</li>
                <li>See your tutors</li>
              </ul>
              <div className="pt-4">
                <p className="text-sm text-zinc-500 dark:text-zinc-400 italic">
                  Features coming soon: Assignment viewing, question practice, and progress tracking.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
