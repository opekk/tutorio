import { LoginForm } from "@/components/auth/LoginForm"
import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/auth"

export default async function LoginPage() {
  const session = await auth()

  // Redirect if already logged in
  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 rounded-lg border border-border bg-surface p-8 shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-text-primary">
            Sign in to Tutorio
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            Or{" "}
            <Link href="/register" className="font-medium text-primary hover:text-primary-hover transition-colors">
              create a new account
            </Link>
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
