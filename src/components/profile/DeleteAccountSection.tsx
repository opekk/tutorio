"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { signOut } from "next-auth/react"
import { useTranslations } from "next-intl"

export function DeleteAccountSection() {
  const t = useTranslations("profile")
  const tCommon = useTranslations("common")
  const tErrors = useTranslations("errors")
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string
  const [password, setPassword] = useState("")
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showDialog, setShowDialog] = useState(false)

  async function handleDelete() {
    if (!confirmDelete) {
      setError(t("confirmDeletionCheckbox"))
      return
    }

    setError("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/profile", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, confirmDelete }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || tErrors("networkError"))
        return
      }

      // Account deleted - sign out and redirect
      await signOut({ redirect: false })
      router.push(`/${locale}/login?deleted=true`)
    } catch (error) {
      setError(tErrors("networkError"))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="rounded-lg border border-error-border bg-error-bg/10 p-6">
      <h3 className="text-lg font-semibold text-error mb-2">{t("dangerZone")}</h3>
      <p className="text-sm text-text-secondary mb-4">
        {t("deleteAccountWarning")}
      </p>

      {!showDialog ? (
        <button
          onClick={() => setShowDialog(true)}
          className="rounded-md bg-error px-4 py-2 text-sm font-semibold text-white hover:bg-error/90 transition-colors"
        >
          {t("deleteAccount")}
        </button>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              {t("confirmAccountDeletion")}
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full rounded-md border border-border bg-surface px-3 py-2 text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="confirmDelete"
              checked={confirmDelete}
              onChange={(e) => setConfirmDelete(e.target.checked)}
              className="h-4 w-4 rounded border-border"
            />
            <label htmlFor="confirmDelete" className="text-sm text-text-primary">
              {t("confirmDeletionCheckbox")}
            </label>
          </div>

          {error && (
            <div className="rounded-md bg-error-bg border border-error-border p-3">
              <p className="text-sm text-error">{error}</p>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              disabled={isLoading || !confirmDelete}
              className="rounded-md bg-error px-4 py-2 text-sm font-semibold text-white hover:bg-error/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? t("deleting") : t("permanentlyDelete")}
            </button>
            <button
              onClick={() => {
                setShowDialog(false)
                setPassword("")
                setConfirmDelete(false)
                setError("")
              }}
              className="rounded-md bg-surface border border-border px-4 py-2 text-sm font-semibold text-text-primary hover:bg-surface-secondary transition-colors"
            >
              {tCommon("cancel")}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
