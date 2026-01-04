"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavLinkProps {
  href: string
  icon: React.ReactNode
  label: string
  collapsed?: boolean
}

export function NavLink({ href, icon, label, collapsed = false }: NavLinkProps) {
  const pathname = usePathname()

  // Check if the current path matches this nav item
  // For dashboard, only match exact path
  // For other paths, match if pathname starts with href
  const isActive = href === '/dashboard'
    ? pathname.endsWith('/dashboard')
    : pathname.includes(href)

  return (
    <Link
      href={href}
      className={`
        flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
        ${isActive
          ? 'bg-primary/10 text-primary border-l-4 border-primary'
          : 'text-text-secondary hover:text-text-primary hover:bg-surface-secondary border-l-4 border-transparent'
        }
        ${collapsed ? 'justify-center px-2' : ''}
      `}
      aria-current={isActive ? 'page' : undefined}
      title={collapsed ? label : undefined}
    >
      <span className={`flex-shrink-0 ${isActive ? 'text-primary' : ''}`}>
        {icon}
      </span>
      {!collapsed && (
        <span className="font-medium text-sm">
          {label}
        </span>
      )}
    </Link>
  )
}
