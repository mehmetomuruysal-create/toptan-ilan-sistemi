import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma) as any,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      id: "credentials",
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string }
        })
        if (!user || !user.password) return null
        const isMatch = await bcrypt.compare(credentials.password as string, user.password)
        if (!isMatch) return null
        
        return {
          id: String(user.id),
          email: user.email,
          name: `${user.ad} ${user.soyad}`.trim(),
          rol: user.hesapTuru,
          isAdmin: user.isAdmin,
          // YENİ EKLEDİĞİMİZ KISIM:
          onayDurumu: user.onayDurumu, 
        }
      }
    }),
    Credentials({
      id: "verify-token", 
      credentials: { token: { type: "text" } },
      async authorize(credentials) {
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { emailVerifyToken: credentials?.token as string },
              { resetToken: credentials?.token as string }
            ]
          }
        })
        if (!user) return null

        if (!user.epostaOnaylandi) {
          await prisma.user.update({
            where: { id: user.id },
            data: { epostaOnaylandi: true }
          })
        }

        return {
          id: String(user.id),
          email: user.email,
          name: `${user.ad} ${user.soyad}`.trim(),
          rol: user.hesapTuru,
          isAdmin: user.isAdmin,
          // YENİ EKLEDİĞİMİZ KISIM:
          onayDurumu: user.onayDurumu,
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.rol = (user as any).rol;
        token.isAdmin = (user as any).isAdmin;
        // TOKEN'A EKLEDİK:
        token.onayDurumu = (user as any).onayDurumu;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        (session.user as any).id = token.id;
        (session.user as any).rol = token.rol;
        (session.user as any).isAdmin = token.isAdmin;
        // SESSION'A EKLEDİK (SAYFALAR BURADAN OKUYACAK):
        (session.user as any).onayDurumu = token.onayDurumu;
      }
      return session;
    }
  },
  pages: { signIn: "/giris" }
})