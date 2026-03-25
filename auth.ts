import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Şifre", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string }
        })
        
        if (!user) return null
        
        const sifreDoğru = await bcrypt.compare(
          credentials.password as string,
          user.sifre
        )
        
        if (!sifreDoğru) return null
        
        return {
          id: String(user.id),
          email: user.email,
          name: user.adSoyad,
          rol: user.rol,
        }
      }
    })
  ],
  pages: {
    signIn: "/giris",
  },
  session: { strategy: "jwt" },
  callbacks: {
    jwt({ token, user }) {
      if (user) token.rol = (user as any).rol
      return token
    },
    session({ session, token }) {
      if (session.user) (session.user as any).rol = token.rol
      return session
    }
  }
})
