"use client"

import { useTranslations } from "next-intl"

interface AccountStatisticsProps {
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
  role: "STUDENT" | "TUTOR" | "ADMIN"
}

export function AccountStatistics({ stats, role }: AccountStatisticsProps) {
  const t = useTranslations("profile")

  return (
    <div className="rounded-lg border border-border bg-surface p-6">
      <h3 className="text-lg font-semibold text-text-primary mb-4">
        {t("accountStatistics")}
      </h3>

      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-sm text-text-secondary">{t("memberSince")}</span>
          <span className="text-sm font-medium text-text-primary">
            {new Date(stats.createdAt).toLocaleDateString()}
          </span>
        </div>

        {stats.lastLoginAt && (
          <div className="flex justify-between">
            <span className="text-sm text-text-secondary">{t("lastLogin")}</span>
            <span className="text-sm font-medium text-text-primary">
              {new Date(stats.lastLoginAt).toLocaleString()}
            </span>
          </div>
        )}

        <div className="border-t border-border pt-3 mt-3">
          {role === "TUTOR" && (
            <>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-text-secondary">{t("studentsCount")}</span>
                <span className="text-sm font-medium text-text-primary">
                  {stats.studentsCount || 0}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-text-secondary">
                  {t("questionsCreated")}
                </span>
                <span className="text-sm font-medium text-text-primary">
                  {stats.questionsCount || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-text-secondary">
                  {t("assignmentsCreated")}
                </span>
                <span className="text-sm font-medium text-text-primary">
                  {stats.assignmentsCount || 0}
                </span>
              </div>
            </>
          )}

          {role === "STUDENT" && (
            <>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-text-secondary">{t("tutorsCount")}</span>
                <span className="text-sm font-medium text-text-primary">
                  {stats.tutorsCount || 0}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-text-secondary">
                  {t("assignmentsCount")}
                </span>
                <span className="text-sm font-medium text-text-primary">
                  {stats.assignmentsCount || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-text-secondary">
                  {t("questionsAnswered")}
                </span>
                <span className="text-sm font-medium text-text-primary">
                  {stats.answersCount || 0}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
