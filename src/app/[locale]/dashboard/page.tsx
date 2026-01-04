import { getCurrentUser } from "@/lib/auth"
import Link from "next/link"
import { getTranslations, setRequestLocale } from 'next-intl/server'

export default async function DashboardPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const user = await getCurrentUser()

  // User is guaranteed to exist because of layout authentication
  const isTutor = user!.role === "TUTOR"
  const isStudent = user!.role === "STUDENT"
  const t = await getTranslations({ locale, namespace: 'dashboard' })
  const tAuth = await getTranslations({ locale, namespace: 'auth' })

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary">
            {t('welcome', { name: user!.name })}
          </h1>
          <p className="mt-2 text-text-secondary">
            {t('signedInAs', { role: isTutor ? tAuth('tutor').toLowerCase() : tAuth('student').toLowerCase() })}
          </p>
        </div>

        {/* Quick Actions */}
        {isTutor && (
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-text-primary">
              {t('quickActions')}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Link
                href={`/${locale}/dashboard/students`}
                className="card-interactive rounded-lg border border-border bg-surface p-6 hover:border-primary/20 hover:bg-surface-secondary transition-all"
              >
                <div className="flex items-center gap-3 mb-2">
                  <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <h3 className="font-semibold text-text-primary">
                    {t('students')}
                  </h3>
                </div>
                <p className="text-sm text-text-secondary">
                  {t('manageStudents')}
                </p>
              </Link>
              <Link
                href={`/${locale}/dashboard/questions`}
                className="card-interactive rounded-lg border border-border bg-surface p-6 hover:border-primary/20 hover:bg-surface-secondary transition-all"
              >
                <div className="flex items-center gap-3 mb-2">
                  <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="font-semibold text-text-primary">
                    {t('questions')}
                  </h3>
                </div>
                <p className="text-sm text-text-secondary">
                  {t('createQuestions')}
                </p>
              </Link>
              <Link
                href={`/${locale}/dashboard/assignments`}
                className="card-interactive rounded-lg border border-border bg-surface p-6 hover:border-primary/20 hover:bg-surface-secondary transition-all"
              >
                <div className="flex items-center gap-3 mb-2">
                  <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  <h3 className="font-semibold text-text-primary">
                    {t('assignments')}
                  </h3>
                </div>
                <p className="text-sm text-text-secondary">
                  {t('assignQuestions')}
                </p>
              </Link>
            </div>
          </div>
        )}

        {isStudent && (
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-text-primary">
              {t('quickActions')}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Link
                href={`/${locale}/dashboard/student/assignments`}
                className="card-interactive rounded-lg border border-border bg-surface p-6 hover:border-primary/20 hover:bg-surface-secondary transition-all"
              >
                <div className="flex items-center gap-3 mb-2">
                  <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  <h3 className="font-semibold text-text-primary">
                    {t('myAssignments')}
                  </h3>
                </div>
                <p className="text-sm text-text-secondary">
                  {t('viewAssignments')}
                </p>
              </Link>
              <div className="rounded-lg border border-border bg-surface p-6 opacity-50">
                <div className="flex items-center gap-3 mb-2">
                  <svg className="h-6 w-6 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <h3 className="font-semibold text-text-primary">
                    {t('myTutors')}
                  </h3>
                </div>
                <p className="text-sm text-text-secondary">
                  {t('comingSoon')}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
