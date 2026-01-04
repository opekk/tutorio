import { requireAuth } from "@/lib/auth"
import { ProfileContainer } from "@/components/profile/ProfileContainer"
import { getTranslations, setRequestLocale } from 'next-intl/server'

export default async function ProfilePage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const user = await requireAuth()
  const t = await getTranslations({ locale, namespace: 'profile' })

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary">
            {t('settings')}
          </h1>
          <p className="mt-2 text-text-secondary">
            {t('settingsDescription')}
          </p>
        </div>

        <ProfileContainer />
      </div>
    </div>
  )
}
