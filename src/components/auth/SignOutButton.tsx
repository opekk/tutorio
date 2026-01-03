"use client"

import { signOut } from "next-auth/react"

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover transition-colors"
    >
      Sign out
    </button>
  )
}
