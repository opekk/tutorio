import { requireRole } from "@/lib/auth"
import { AssignmentQuestions } from "@/components/students/AssignmentQuestions"
import Link from "next/link"
import { getTranslations, setRequestLocale } from 'next-intl/server'

export default async function AssignmentDetailPage({
  params,
}: {
  params: Promise<{ assignmentId: string; locale: string }>
}) {
  const { assignmentId, locale } = await params
  setRequestLocale(locale)

  const user = await requireRole("STUDENT")
  const t = await getTranslations({ locale, namespace: 'assignments' })

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href={`/${locale}/dashboard/student/assignments`}
            className="text-sm text-text-secondary hover:text-primary transition-colors"
          >
            ← {t('backToDashboard')}
          </Link>
        </div>

        <AssignmentQuestions studentId={user.id} assignmentId={assignmentId} />
      </div>
    </div>
  )
}
