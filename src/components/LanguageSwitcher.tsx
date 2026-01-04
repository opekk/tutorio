"use client"

import { useRouter, usePathname } from 'next/navigation'
import { useLocale } from 'next-intl'

export function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const switchLocale = (newLocale: string) => {
    // Remove the current locale from the pathname and add the new one
    const segments = pathname.split('/')
    segments[1] = newLocale
    const newPath = segments.join('/')
    router.push(newPath)
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => switchLocale('en')}
        className={`px-2 py-1 text-sm font-medium rounded transition-colors ${
          locale === 'en'
            ? 'bg-primary text-white'
            : 'text-text-secondary hover:text-text-primary hover:bg-surface-secondary'
        }`}
        aria-label="Switch to English"
      >
        EN
      </button>
      <span className="text-text-tertiary">|</span>
      <button
        onClick={() => switchLocale('pl')}
        className={`px-2 py-1 text-sm font-medium rounded transition-colors ${
          locale === 'pl'
            ? 'bg-primary text-white'
            : 'text-text-secondary hover:text-text-primary hover:bg-surface-secondary'
        }`}
        aria-label="Przełącz na polski"
      >
        PL
      </button>
    </div>
  )
}
