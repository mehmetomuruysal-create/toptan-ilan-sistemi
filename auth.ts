import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers:[
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

        // YENİ: E-Posta Onay Kontrolü!
        if (!user.epostaOnaylandi) {
          throw new Error("Lütfen giriş yapmadan önce e-posta adresinizi onaylayın.")
        }
        
        const sifreDogru = await bcrypt.compare(
          credentials.password as string,
          user.password
        )
        
        if (!sifreDogru) return null
        
        return {
          id: String(user.id),
          email: user.email,
          name: `${user.ad} ${user.soyad}`.trim(),
          rol: user.hesapTuru,
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