"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { ChangeEmailForm } from "./ChangeEmailForm"
import { ChangePasswordForm } from "./ChangePasswordForm"
import { ChangeNameForm } from "./ChangeNameForm"
import { AccountStatistics } from "./AccountStatistics"
import { TutorsList } from "./TutorsList"
import { DeleteAccountSection } from "./DeleteAccountSection"

interface ProfileData {
  user: {
    id: string
    email: string
    name: string
    role: "STUDENT" | "TUTOR" | "ADMIN"
    lastEmailChange: string | null
    lastPasswordChange: string | null
  }
  stats: {
    createdAt: string
    lastLoginAt: string | null
    // Tutor stats
    studentsCount?: number
    questionsCount?: number
    assignmentsCount?: number
    // Student stats
    tutorsCount?: number
    answersCount?: number
  }
}

export function ProfileContainer() {
  const params = useParams()
  const locale = params.locale as string
  const t = useTranslations('profile')
  const tCommon = useTranslations('common')
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchProfile()
  }, [])

  async function fetchProfile() {
    try {
      const response = await fetch("/api/profile")
      if (!response.ok) {
        throw new Error("Failed to fetch profile")
      }
      const data = await response.json()
      setProfileData(data)
    } catch (error) {
      setError("Failed to load profile data")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-text-secondary">{tCommon('loading')}</p>
      </div>
    )
  }

  if (error || !profileData) {
    return (
      <div className="rounded-md bg-error-bg border border-error-border p-4">
        <p className="text-sm text-error">
          {error || t('failedToLoad')}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Account Info Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChangeNameForm
          currentName={profileData.user.name}
          onNameChanged={fetchProfile}
        />
        <AccountStatistics
          stats={profileData.stats}
          role={profileData.user.role}
        />
      </div>

      {/* Security Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChangeEmailForm
          currentEmail={profileData.user.email}
          lastEmailChange={profileData.user.lastEmailChange}
          onEmailChanged={fetchProfile}
        />
        <ChangePasswordForm
          lastPasswordChange={profileData.user.lastPasswordChange}
          onPasswordChanged={fetchProfile}
        />
      </div>

      {/* Role-Specific Sections */}
      {profileData.user.role === "STUDENT" && (
        <TutorsList studentId={profileData.user.id} />
      )}

      {profileData.user.role === "TUTOR" && (
        <div className="rounded-lg border border-border bg-surface p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            {t('studentManagement')}
          </h3>
          <p className="text-sm text-text-secondary mb-4">
            {t('youHaveStudents', { count: profileData.stats.studentsCount || 0 })}
          </p>
          <Link
            href={`/${locale}/dashboard/students`}
            className="inline-block rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover transition-colors"
          >
            {t('manageStudents')}
          </Link>
        </div>
      )}

      {/* Danger Zone */}
      <DeleteAccountSection />
    </div>
  )
}
