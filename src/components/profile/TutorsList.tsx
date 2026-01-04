"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"

interface Tutor {
  id: string
  name: string
  email: string
  profileId: string
  createdAt: string
}

interface TutorsListProps {
  studentId: string
}

export function TutorsList({ studentId }: TutorsListProps) {
  const t = useTranslations("profile")
  const tCommon = useTranslations("common")
  const [tutors, setTutors] = useState<Tutor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchTutors()
  }, [studentId])

  async function fetchTutors() {
    try {
      const response = await fetch(`/api/students/${studentId}/tutors`)
      if (!response.ok) {
        throw new Error("Failed to fetch tutors")
      }
      const data = await response.json()
      setTutors(data.tutors)
    } catch (error) {
      setError("Failed to load tutors")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-surface p-6">
        <p className="text-center text-text-secondary">{tCommon("loading")}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-md bg-error-bg border border-error-border p-4">
        <p className="text-sm text-error">{error}</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-6">
      <h3 className="text-lg font-semibold text-text-primary mb-4">
        {t("myTutors")}
      </h3>

      {tutors.length === 0 ? (
        <p className="text-sm text-text-secondary text-center py-4">
          {t("noTutorsYet")}
        </p>
      ) : (
        <div className="space-y-3">
          {tutors.map((tutor) => (
            <div
              key={tutor.id}
              className="flex items-center justify-between rounded-lg border border-border bg-surface-secondary p-4 hover:bg-surface-tertiary transition-colors"
            >
              <div>
                <h4 className="font-medium text-text-primary">{tutor.name}</h4>
                <p className="text-sm text-text-secondary">{tutor.email}</p>
                <p className="mt-1 text-xs text-text-tertiary">
                  {t("connectedSince", {
                    date: new Date(tutor.createdAt).toLocaleDateString(),
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
