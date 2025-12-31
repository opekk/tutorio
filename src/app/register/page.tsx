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
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-md dark:bg-zinc-900">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-zinc-900 hover:underline dark:text-zinc-50">
              Sign in
            </Link>
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  )
}
