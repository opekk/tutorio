import { DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"
import { Role } from "@/generated/prisma"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: Role
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    email: string
    name: string
    role: Role
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    email: string
    name: string
    role: Role
  }
}
