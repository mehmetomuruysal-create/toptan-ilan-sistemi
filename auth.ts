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
          hesapTuru: user.hesapTuru,
          isAdmin: user.isAdmin,
          onayDurumu: user.onayDurumu,
          rol: user.hesapTuru, // TS susturucu
        }
      }
    }),
    Credentials({
      id: "verify-token", 
      credentials: { token: { type: "text" } },
      async authorize(credentials) {
        if (!credentials?.token) return null

        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { emailVerifyToken: credentials.token as string },
              { resetToken: credentials.token as string }
            ]
          }
        })

        if (!user) return null

        return {
          id: String(user.id),
          email: user.email,
          name: `${user.ad} ${user.soyad}`.trim(),
          hesapTuru: user.hesapTuru,
          isAdmin: user.isAdmin,
          onayDurumu: user.onayDurumu,
          rol: user.hesapTuru, // TS susturucu
        }
      }
    })
  ],
  callbacks: {
    // 🚀 Parametrelere : any ekleyerek TS'yi susturduk
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.isAdmin = user.isAdmin;
        token.onayDurumu = user.onayDurumu;
        token.hesapTuru = user.hesapTuru;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user && token) {
        (session.user as any).id = token.id;
        (session.user as any).isAdmin = token.isAdmin;
        (session.user as any).onayDurumu = token.onayDurumu;
        (session.user as any).hesapTuru = token.hesapTuru;
      }
      return session;
    }
  },
  pages: { 
    signIn: "/giris" 
  }
})