import { requireRole } from "@/lib/auth"
import { StudentsContainer } from "@/components/students/StudentsContainer"
import { getTranslations, setRequestLocale } from 'next-intl/server'

export default async function StudentsPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const user = await requireRole("TUTOR")
  const t = await getTranslations({ locale, namespace: 'students' })

  return (
    <div className="p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary">
            {t('title')}
          </h1>
          <p className="mt-2 text-text-secondary">
            {t('description')}
          </p>
        </div>

        <StudentsContainer tutorId={user.id} locale={locale} />
      </div>
    </div>
  )
}
