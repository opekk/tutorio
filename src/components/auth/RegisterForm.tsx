"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { useTranslations } from "next-intl"

interface RegisterFormProps {
  locale: string
}

export function RegisterForm({ locale }: RegisterFormProps) {
  const router = useRouter()
  const t = useTranslations('auth')
  const tCommon = useTranslations('common')
  const tErrors = useTranslations('errors')
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
      setError(t('passwordMismatch'))
      return
    }

    if (password.length < 8) {
      setError(t('passwordTooShort'))
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
        setError(data.error || tErrors('somethingWentWrong'))
        return
      }

      // Auto sign-in after registration
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError(t('invalidCredentials'))
      } else {
        router.push(`/${locale}/dashboard`)
        router.refresh()
      }
    } catch (error) {
      setError(tErrors('networkError'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-6">
      <div className="space-y-4 rounded-md">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-text-primary">
            {t('name')}
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
          <label htmlFor="email" className="block text-sm font-medium text-text-primary">
            {t('email')}
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
            {t('password')}
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
            {t('confirmPassword')}
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

        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            {t('chooseRole')}
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole("STUDENT")}
              className={`text-left p-3 border-2 rounded-lg transition-all ${
                role === "STUDENT"
                  ? "border-primary bg-info-bg"
                  : "border-border bg-surface hover:bg-surface-secondary"
              }`}
            >
              <div className="text-sm font-medium text-text-primary">{t('student')}</div>
              <div className="text-xs text-text-secondary mt-0.5">{t('studentDescription')}</div>
            </button>
            <button
              type="button"
              onClick={() => setRole("TUTOR")}
              className={`text-left p-3 border-2 rounded-lg transition-all ${
                role === "TUTOR"
                  ? "border-primary bg-info-bg"
                  : "border-border bg-surface hover:bg-surface-secondary"
              }`}
            >
              <div className="text-sm font-medium text-text-primary">{t('tutor')}</div>
              <div className="text-xs text-text-secondary mt-0.5">{t('tutorDescription')}</div>
            </button>
          </div>
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
        {isLoading ? tCommon('loading') : t('createAccount')}
      </button>
    </form>
  )
}
