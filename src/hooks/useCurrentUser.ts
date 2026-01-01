"use client"

import { useSession } from "next-auth/react"

export function useCurrentUser() {
  const { data: session, status } = useSession()

  return {
    user: session?.user,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    isStudent: session?.user?.role === "STUDENT",
    isTutor: session?.user?.role === "TUTOR",
    isAdmin: session?.user?.role === "ADMIN",
  }
}
