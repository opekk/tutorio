"use client"

import { useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { NavLink } from './NavLink'
import { LanguageSwitcher } from '../LanguageSwitcher'

interface SidebarProps {
  role: 'STUDENT' | 'TUTOR' | 'ADMIN'
  userName: string
  userEmail: string
  locale: string
}

export function Sidebar({ role, userName, userEmail, locale }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const t = useTranslations('navigation')
  const tAuth = useTranslations('auth')

  // Define navigation items based on role
  const tutorNavItems = [
    {
      href: `/${locale}/dashboard`,
      label: t('dashboard'),
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      href: `/${locale}/dashboard/students`,
      label: t('students'),
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      href: `/${locale}/dashboard/questions`,
      label: t('questions'),
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      href: `/${locale}/dashboard/assignments`,
      label: t('assignments'),
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
    },
  ]

  const studentNavItems = [
    {
      href: `/${locale}/dashboard`,
      label: t('dashboard'),
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      href: `/${locale}/dashboard/student/assignments`,
      label: t('myAssignments'),
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
    },
  ]

  const navItems = role === 'TUTOR' ? tutorNavItems : studentNavItems

  const sidebarContent = (
    <>
      {/* Logo/Brand */}
      <div className={`flex items-center gap-2 px-3 py-4 border-b border-border ${collapsed ? 'justify-center' : ''}`}>
        <Link href={`/${locale}/dashboard`} className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary flex-shrink-0">
            <span className="text-xl font-bold text-white">T</span>
          </div>
          {!collapsed && (
            <span className="text-xl font-bold text-primary">Tutorio</span>
          )}
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1" aria-label={t('menu')}>
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            collapsed={collapsed}
          />
        ))}
      </nav>

      {/* Divider */}
      <div className="border-t border-border" />

      {/* Footer: Language Switcher + User Profile + Logout */}
      <div className={`px-3 py-4 space-y-3 ${collapsed ? 'items-center' : ''}`}>
        {!collapsed && (
          <>
            {/* Language Switcher */}
            <div className="flex justify-center">
              <LanguageSwitcher />
            </div>

            {/* User Profile Link */}
            <Link
              href={`/${locale}/dashboard/profile`}
              className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-surface-secondary transition-colors"
            >
              {/* Avatar with initials */}
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white text-base font-semibold tracking-tight flex-shrink-0">
                {userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </div>

              {/* Name and role */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">{userName}</p>
                <p className="text-xs text-text-tertiary">
                  {role === 'TUTOR' ? tAuth('tutor') : role === 'STUDENT' ? tAuth('student') : 'Admin'}
                </p>
              </div>
            </Link>

            {/* Logout Button */}
            <button
              onClick={async () => {
                const { signOut } = await import('next-auth/react')
                await signOut({ redirect: false })
                window.location.href = `/${locale}/login`
              }}
              className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-error hover:bg-error-bg transition-colors"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>{tAuth('logout')}</span>
            </button>
          </>
        )}

        {/* Collapse button (desktop only) */}
        {!collapsed && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex items-center justify-center w-full px-3 py-2 text-xs text-text-tertiary hover:text-text-secondary transition-colors"
            aria-label={collapsed ? t('expand') : t('collapse')}
          >
            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
            {t('collapse')}
          </button>
        )}

        {collapsed && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex items-center justify-center w-full px-2 py-2 text-text-tertiary hover:text-text-secondary transition-colors"
            aria-label={t('expand')}
            title={t('expand')}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
    </>
  )

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden fixed top-4 left-4 z-50 flex items-center justify-center h-10 w-10 rounded-lg bg-surface border border-border shadow-md"
        aria-label={t('menu')}
      >
        <svg className="h-6 w-6 text-text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {mobileMenuOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col h-screen bg-surface border-r border-border transition-all duration-300 ${
          collapsed ? 'w-16' : 'w-60'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="md:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer */}
          <aside className="md:hidden fixed left-0 top-0 bottom-0 w-64 bg-surface border-r border-border z-50 flex flex-col">
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  )
}
