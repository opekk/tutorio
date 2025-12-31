"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"

export function RegisterForm() {
  const router = useRouter()
  const [name, setName] = useState("")
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
        body: JSON.stringify({ name, email, password }),
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
          <label htmlFor="name" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Full name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500"
            placeholder="John Doe"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
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
            className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500"
            placeholder="tutor@example.com"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
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
            className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500"
            placeholder="••••••••"
          />
        </div>
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
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
            className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500"
            placeholder="••••••••"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-3 dark:bg-red-900/20">
          <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="flex w-full justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {isLoading ? "Creating account..." : "Create account"}
      </button>
    </form>
  )
}
