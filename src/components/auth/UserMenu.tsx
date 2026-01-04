"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { signOut } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { useTranslations } from "next-intl"

interface UserMenuProps {
  name: string
  email: string
  role: "STUDENT" | "TUTOR" | "ADMIN"
}

export function UserMenu({ name, email, role }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string
  const t = useTranslations('auth')
  const tProfile = useTranslations('profile')

  // Get user initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => {
        document.removeEventListener("mousedown", handleClickOutside)
      }
    }
  }, [isOpen])

  async function handleSignOut() {
    await signOut({ redirect: false })
    router.push(`/${locale}/login`)
  }

  return (
    <div className="relative" ref={menuRef}>
      {/* User Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-surface-secondary transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="true"
        type="button"
      >
        {/* Avatar with initials - larger size for better readability */}
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white text-base font-semibold tracking-tight">
          {getInitials(name)}
        </div>

        {/* Name and role (hidden on mobile) */}
        <div className="hidden sm:block text-left">
          <p className="text-sm font-medium text-text-primary">{name}</p>
          <p className="text-xs text-text-tertiary">
            {role === "TUTOR" ? t('tutor') : role === "STUDENT" ? t('student') : t('role')}
          </p>
        </div>

        {/* Dropdown arrow */}
        <svg
          className={`h-4 w-4 text-text-secondary transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full w-64 rounded-lg border border-border bg-surface shadow-lg z-50 translate-y-2">
          

          {/* Menu items */}
          <div className="py-1">
            <Link
              href={`/${locale}/dashboard/profile`}
              className="flex items-center gap-2 px-4 py-2 text-sm text-text-primary hover:bg-surface-secondary transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              {tProfile('settings')}
            </Link>

            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-text-primary hover:bg-surface-secondary transition-colors"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              {t('logout')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
