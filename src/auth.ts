import NextAuth, { DefaultSession } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import { PrismaClient } from "@/generated/prisma"

const prisma = new PrismaClient()

// Extend NextAuth types for custom session data
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
    } & DefaultSession["user"]
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const tutor = await prisma.tutor.findUnique({
          where: { email: credentials.email as string }
        })

        if (!tutor) {
          return null
        }

        const isPasswordValid = await compare(
          credentials.password as string,
          tutor.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: tutor.id,
          email: tutor.email,
          name: tutor.name,
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
      }
      return session
    }
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  trustHost: true, // Required for Next.js 16
})
