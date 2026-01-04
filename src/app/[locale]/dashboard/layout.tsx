import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { Sidebar } from '@/components/navigation/Sidebar'

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const user = await getCurrentUser()

  // Redirect to login if not authenticated
  if (!user) {
    redirect(`/${locale}/login`)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar Navigation */}
      <Sidebar
        role={user.role}
        userName={user.name}
        userEmail={user.email}
        locale={locale}
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
