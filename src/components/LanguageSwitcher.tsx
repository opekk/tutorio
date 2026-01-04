"use client"

import { usePathname, useRouter } from 'next/navigation'

export function LanguageSwitcher() {
  const router = useRouter()
  const pathname = usePathname()

  // Extract locale directly from pathname
  const locale = pathname.split('/')[1] || 'pl'

  const switchLocale = (newLocale: string) => {
    // Simply replace the locale in the current path
    const newPath = pathname.replace(/^\/(en|pl)/, `/${newLocale}`)
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
