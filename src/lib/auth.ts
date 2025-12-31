import { auth } from "@/auth"
import { redirect } from "next/navigation"

export async function getCurrentUser() {
  const session = await auth()
  return session?.user
}

export async function requireAuth() {
  const session = await auth()
  if (!session) {
    redirect("/login")
  }
  return session.user
}
