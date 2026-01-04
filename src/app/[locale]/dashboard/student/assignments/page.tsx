import { requireRole } from "@/lib/auth"
import { StudentAssignmentList } from "@/components/students/StudentAssignmentList"
import Link from "next/link"
import { getTranslations, setRequestLocale } from 'next-intl/server'

export default async function StudentAssignmentsPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const user = await requireRole("STUDENT")
  const t = await getTranslations({ locale, namespace: 'assignments' })
  const tCommon = await getTranslations({ locale, namespace: 'common' })

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Link
              href={`/${locale}/dashboard`}
              className="text-text-secondary hover:text-primary transition-colors"
            >
              ← {t('backToDashboard')}
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-text-primary">
            {t('myAssignments')}
          </h1>
          <p className="mt-2 text-text-secondary">
            {t('completeYourQuestions')}
          </p>
        </div>

        <div className="rounded-lg border border-border bg-surface p-6 shadow-sm">
          <StudentAssignmentList studentId={user.id} />
        </div>
      </div>
    </div>
  )
}
