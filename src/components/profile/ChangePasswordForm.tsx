"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"

interface ChangePasswordFormProps {
  lastPasswordChange: string | null
  onPasswordChanged?: () => void
}

export function ChangePasswordForm({
  lastPasswordChange,
  onPasswordChanged,
}: ChangePasswordFormProps) {
  const t = useTranslations("profile")
  const tErrors = useTranslations("errors")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Calculate if rate limited (1 day)
  const isRateLimited = lastPasswordChange
    ? new Date(lastPasswordChange).getTime() + 1 * 24 * 60 * 60 * 1000 >
      Date.now()
    : false

  const nextAvailableDate = lastPasswordChange
    ? new Date(
        new Date(lastPasswordChange).getTime() + 1 * 24 * 60 * 60 * 1000
      )
    : null

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/profile/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 429) {
          // Rate limited - show specific message with hours
          setError(
            t("passwordRateLimitExceeded", {
              hours: data.hoursRemaining,
            })
          )
        } else {
          setError(data.error || tErrors("networkError"))
        }
        return
      }

      setSuccess(t("passwordUpdatedSuccess"))
      setCurrentPassword("")
      setNewPassword("")
      onPasswordChanged?.()
    } catch (error) {
      setError(tErrors("networkError"))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-6">
      <h3 className="text-lg font-semibold text-text-primary mb-4">
        {t("changePassword")}
      </h3>

      {isRateLimited && nextAvailableDate && (
        <div className="mb-4 rounded-md bg-info-bg border border-info-border p-3">
          <p className="text-sm text-info">
            {t("emailRateLimitExceeded", {
              date: nextAvailableDate.toLocaleString(),
            })}
          </p>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="currentPassword"
            className="block text-sm font-medium text-text-primary"
          >
            {t("currentPassword")}
          </label>
          <input
            id="currentPassword"
            type="password"
            required
            disabled={isRateLimited}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="mt-1 block w-full rounded-md border border-border bg-surface px-3 py-2 text-text-primary placeholder-text-tertiary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 transition-colors"
          />
        </div>

        <div>
          <label
            htmlFor="newPassword"
            className="block text-sm font-medium text-text-primary"
          >
            {t("newPassword")}
          </label>
          <input
            id="newPassword"
            type="password"
            required
            minLength={8}
            disabled={isRateLimited}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="mt-1 block w-full rounded-md border border-border bg-surface px-3 py-2 text-text-primary placeholder-text-tertiary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 transition-colors"
          />
          <p className="mt-1 text-xs text-text-tertiary">
            {t("passwordMinLength")}
          </p>
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
          {isLoading ? t("updating") : t("updatePassword")}
        </button>
      </form>
    </div>
  )
}
