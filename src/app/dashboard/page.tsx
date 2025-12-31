import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { SignOutButton } from "@/components/auth/SignOutButton"

export default async function DashboardPage() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              Dashboard
            </h1>
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
            This is your protected dashboard. You are signed in as {session.user.email}.
          </p>
        </div>
      </main>
    </div>
  )
}
