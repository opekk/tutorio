import { RegisterForm } from "@/components/auth/RegisterForm"
import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/auth"

export default async function RegisterPage() {
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
            Create your account
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary hover:text-primary-hover transition-colors">
              Sign in
            </Link>
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  )
}
