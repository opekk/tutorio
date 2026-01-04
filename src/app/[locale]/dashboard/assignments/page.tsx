import { requireRole } from "@/lib/auth"
import { AssignmentsContainer } from "@/components/assignments/AssignmentsContainer"
import { getTranslations, setRequestLocale } from 'next-intl/server'

export default async function AssignmentsPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const user = await requireRole("TUTOR")
  const t = await getTranslations({ locale, namespace: 'assignments' })

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary">
            {t('title')}
          </h1>
          <p className="mt-2 text-text-secondary">
            {t('description')}
          </p>
        </div>

        <AssignmentsContainer tutorId={user.id} />
      </div>
    </div>
  )
}
