"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"

interface ChangeNameFormProps {
  currentName: string
  onNameChanged?: () => void
}

export function ChangeNameForm({
  currentName,
  onNameChanged,
}: ChangeNameFormProps) {
  const t = useTranslations("profile")
  const tErrors = useTranslations("errors")
  const [name, setName] = useState(currentName)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/profile/name", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || tErrors("networkError"))
        return
      }

      setSuccess(t("nameUpdatedSuccess"))
      onNameChanged?.()
    } catch (error) {
      setError(tErrors("networkError"))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-6">
      <h3 className="text-lg font-semibold text-text-primary mb-4">
        {t("changeDisplayName")}
      </h3>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-text-primary"
          >
            {t("displayName")}
          </label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md border border-border bg-surface px-3 py-2 text-text-primary placeholder-text-tertiary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
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
          disabled={isLoading || name === currentName}
          className="w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? t("updating") : t("updateName")}
        </button>
      </form>
    </div>
  )
}
