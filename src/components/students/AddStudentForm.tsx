"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"

interface AddStudentFormProps {
  tutorId: string
  onStudentAdded?: () => void
}

export function AddStudentForm({ tutorId, onStudentAdded }: AddStudentFormProps) {
  const router = useRouter()
  const t = useTranslations('students')
  const tErrors = useTranslations('errors')
  const [studentEmail, setStudentEmail] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [needsInvitation, setNeedsInvitation] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSuccess("")
    setNeedsInvitation(false)
    setIsLoading(true)

    try {
      const response = await fetch(`/api/tutors/${tutorId}/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentEmail }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.needsInvitation) {
          setNeedsInvitation(true)
          setError(data.message)
        } else {
          setError(data.error || tErrors('somethingWentWrong'))
        }
        return
      }

      setSuccess(t('studentAddedSuccess', { name: data.student.name }))
      setStudentEmail("")
      router.refresh() // Refresh the student list
      onStudentAdded?.() // Trigger refresh in parent component
    } catch (error) {
      setError(tErrors('networkError'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="studentEmail"
          className="block text-sm font-medium text-text-primary"
        >
          {t('studentEmail')}
        </label>
        <input
          id="studentEmail"
          name="studentEmail"
          type="email"
          required
          value={studentEmail}
          onChange={(e) => setStudentEmail(e.target.value)}
          className="mt-1 block w-full rounded-md border border-border bg-surface px-3 py-2 text-text-primary placeholder-text-tertiary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
          placeholder="student@example.com"
        />
      </div>

      {error && (
        <div className="rounded-md bg-error-bg border border-error-border p-3">
          <p className="text-sm text-error">{error}</p>
          {needsInvitation && (
            <button
              type="button"
              className="mt-2 text-sm font-medium text-error underline hover:text-error-hover transition-colors"
              onClick={() => {
                // TODO: Implement invitation sending in Step 3
                alert("Invitation feature coming in Step 3!")
              }}
            >
              {t('sendInvitation')}
            </button>
          )}
        </div>
      )}

      {success && (
        <div className="rounded-md bg-success-bg border border-success-border p-3">
          <p className="text-sm text-success">{success}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="flex w-full justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? t('adding') : t('addStudentButton')}
      </button>
    </form>
  )
}
