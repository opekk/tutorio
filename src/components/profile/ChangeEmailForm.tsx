"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"

interface ChangeEmailFormProps {
  currentEmail: string
  lastEmailChange: string | null
  onEmailChanged?: () => void
}

export function ChangeEmailForm({
  currentEmail,
  lastEmailChange,
  onEmailChanged,
}: ChangeEmailFormProps) {
  const t = useTranslations("profile")
  const tErrors = useTranslations("errors")
  const [newEmail, setNewEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Calculate if rate limited (7 days)
  const isRateLimited = lastEmailChange
    ? new Date(lastEmailChange).getTime() + 7 * 24 * 60 * 60 * 1000 >
      Date.now()
    : false

  const nextAvailableDate = lastEmailChange
    ? new Date(
        new Date(lastEmailChange).getTime() + 7 * 24 * 60 * 60 * 1000
      )
    : null

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/profile/email", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newEmail, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 429) {
          // Rate limited - show specific message with date
          setError(
            t("emailRateLimitExceeded", {
              date: new Date(data.nextAvailableDate).toLocaleDateString(),
            })
          )
        } else {
          setError(data.error || tErrors("networkError"))
        }
        return
      }

      setSuccess(t("emailUpdatedSuccess"))
      setNewEmail("")
      setPassword("")
      onEmailChanged?.()
    } catch (error) {
      setError(tErrors("networkError"))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-6">
      <h3 className="text-lg font-semibold text-text-primary mb-4">
        {t("changeEmail")}
      </h3>

      <div className="mb-4 text-sm text-text-secondary">
        {t("currentEmail")}: <span className="font-medium">{currentEmail}</span>
      </div>

      {isRateLimited && nextAvailableDate && (
        <div className="mb-4 rounded-md bg-info-bg border border-info-border p-3">
          <p className="text-sm text-info">
            {t("emailRateLimitExceeded", {
              date: nextAvailableDate.toLocaleDateString(),
            })}
          </p>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="newEmail"
            className="block text-sm font-medium text-text-primary"
          >
            {t("newEmail")}
          </label>
          <input
            id="newEmail"
            type="email"
            required
            disabled={isRateLimited}
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            className="mt-1 block w-full rounded-md border border-border bg-surface px-3 py-2 text-text-primary placeholder-text-tertiary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 transition-colors"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-text-primary"
          >
            {t("confirmPassword")}
          </label>
          <input
            id="password"
            type="password"
            required
            disabled={isRateLimited}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full rounded-md border border-border bg-surface px-3 py-2 text-text-primary placeholder-text-tertiary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 transition-colors"
          />
        </div>

        {error && (
          <div className="rounded-md bg-error-bg border border-error-border p-3">
            <p className="text-sm text-error">{error}</p>
          </div>
        )}

        {success && (
          <div className="rounded-md bg-success-bg border border-success-border p-3">
            <p className="text-sm text-success">{success}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || isRateLimited}
          className="w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? t("updating") : t("updateEmail")}
        </button>
      </form>
    </div>
  )
}
