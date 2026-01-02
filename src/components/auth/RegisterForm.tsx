"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"

export function RegisterForm() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [role, setRole] = useState<"STUDENT" | "TUTOR">("STUDENT")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    // Client-side validation
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Something went wrong")
        return
      }

      // Auto sign-in after registration
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Account created, but sign-in failed. Please try logging in.")
      } else {
        router.push("/dashboard")
        router.refresh()
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-6">
      <div className="space-y-4 rounded-md">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-text-primary">
            Full name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md border border-border bg-surface px-3 py-2 text-text-primary placeholder-text-tertiary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-3">
            I am a...
          </label>
          <div className="flex gap-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="role"
                value="STUDENT"
                checked={role === "STUDENT"}
                onChange={(e) => setRole(e.target.value as "STUDENT" | "TUTOR")}
                className="mr-2 h-4 w-4 border-border text-primary focus:ring-primary"
              />
              <span className="text-sm text-text-primary">
                Student
                <span className="block text-xs text-text-secondary">Looking for help with my studies</span>
              </span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="role"
                value="TUTOR"
                checked={role === "TUTOR"}
                onChange={(e) => setRole(e.target.value as "STUDENT" | "TUTOR")}
                className="mr-2 h-4 w-4 border-border text-primary focus:ring-primary"
              />
              <span className="text-sm text-text-primary">
                Tutor
                <span className="block text-xs text-text-secondary">I help students learn</span>
              </span>
            </label>
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-text-primary">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-md border border-border bg-surface px-3 py-2 text-text-primary placeholder-text-tertiary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
            placeholder="tutor@example.com"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-text-primary">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full rounded-md border border-border bg-surface px-3 py-2 text-text-primary placeholder-text-tertiary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
            placeholder="••••••••"
          />
        </div>
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-primary">
            Confirm password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="mt-1 block w-full rounded-md border border-border bg-surface px-3 py-2 text-text-primary placeholder-text-tertiary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
            placeholder="••••••••"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-error-bg border border-error-border p-3">
          <p className="text-sm text-error">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="flex w-full justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? "Creating account..." : "Create account"}
      </button>
    </form>
  )
}
