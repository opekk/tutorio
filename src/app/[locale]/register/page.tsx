import { RegisterForm } from "@/components/auth/RegisterForm"
import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { getTranslations, setRequestLocale } from 'next-intl/server'

export default async function RegisterPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const session = await auth()
  const t = await getTranslations({ locale, namespace: 'auth' })

  // Redirect if already logged in
  if (session) {
    redirect(`/${locale}/dashboard`)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 rounded-lg border border-border bg-surface p-8 shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-text-primary">
            {t('createAccount')}
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            {t('haveAccount')}{" "}
            <Link href={`/${locale}/login`} className="font-medium text-primary hover:text-primary-hover transition-colors">
              {t('signInHere')}
            </Link>
          </p>
        </div>
        <RegisterForm locale={locale} />
      </div>
    </div>
  )
}
