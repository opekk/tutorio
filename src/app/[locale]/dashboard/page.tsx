import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { UserMenu } from "@/components/auth/UserMenu"
import { getTranslations, setRequestLocale } from 'next-intl/server'

export default async function DashboardPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const session = await auth()

  if (!session) {
    redirect(`/${locale}/login`)
  }

  const isTutor = session.user.role === "TUTOR"
  const isStudent = session.user.role === "STUDENT"
  const t = await getTranslations({ locale, namespace: 'dashboard' })
  const tAuth = await getTranslations({ locale, namespace: 'auth' })

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-text-primary">
                {t('title')}
              </h1>
              <p className="text-sm text-text-secondary">
                {isTutor ? t('tutorAccount') : t('studentAccount')}
              </p>
            </div>
            <UserMenu
              name={session.user.name}
              email={session.user.email}
              role={session.user.role}
            />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-surface p-6 shadow">
          <h2 className="text-xl font-semibold text-text-primary">
            {t('welcome', { name: session.user.name })}
          </h2>
          <p className="mt-2 text-text-secondary">
            {t('signedInAs', { role: isTutor ? tAuth('tutor').toLowerCase() : tAuth('student').toLowerCase() })}
          </p>

          {isTutor && (
            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-medium text-text-primary">
                {t('quickActions')}
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Link
                  href={`/${locale}/dashboard/students`}
                  className="card-interactive rounded-lg border border-border p-4 hover:bg-surface-secondary transition-colors"
                >
                  <h4 className="font-medium text-text-primary">
                    👥 {t('students')}
                  </h4>
                  <p className="mt-1 text-sm text-text-secondary">
                    {t('manageStudents')}
                  </p>
                </Link>
                <Link
                  href={`/${locale}/dashboard/questions`}
                  className="card-interactive rounded-lg border border-border p-4 hover:bg-surface-secondary transition-colors"
                >
                  <h4 className="font-medium text-text-primary">
                    📝 {t('questions')}
                  </h4>
                  <p className="mt-1 text-sm text-text-secondary">
                    {t('createQuestions')}
                  </p>
                </Link>
                <Link
                  href={`/${locale}/dashboard/assignments`}
                  className="card-interactive rounded-lg border border-border p-4 hover:bg-surface-secondary transition-colors"
                >
                  <h4 className="font-medium text-text-primary">
                    📋 {t('assignments')}
                  </h4>
                  <p className="mt-1 text-sm text-text-secondary">
                    {t('assignQuestions')}
                  </p>
                </Link>
              </div>
            </div>
          )}

          {isStudent && (
            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-medium text-text-primary">
                {t('quickActions')}
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <Link
                  href={`/${locale}/dashboard/student/assignments`}
                  className="card-interactive rounded-lg border border-border p-4 hover:bg-surface-secondary transition-colors"
                >
                  <h4 className="font-medium text-text-primary">
                    📋 {t('myAssignments')}
                  </h4>
                  <p className="mt-1 text-sm text-text-secondary">
                    {t('viewAssignments')}
                  </p>
                </Link>
                <div className="rounded-lg border border-border p-4 opacity-50">
                  <h4 className="font-medium text-text-primary">
                    👥 {t('myTutors')}
                  </h4>
                  <p className="mt-1 text-sm text-text-secondary">
                    {t('comingSoon')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
