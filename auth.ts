import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma) as any,
  session: { strategy: "jwt" },
  providers: [
    // 1. Standart Şifreli Giriş
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
        }
      }
    }),
    // 2. Sihirli Bağlantı Girişi (İsim Giriş Sayfasıyla Aynı: verify-token)
    Credentials({
      id: "verify-token", 
      credentials: { token: { type: "text" } },
      async authorize(credentials) {
        if (!credentials?.token) return null

        // Token'ı hem emailVerifyToken hem de (varsa) şifre sıfırlama sütununda arayalım ki kaçmasın
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { emailVerifyToken: credentials.token as string },
              { resetToken: credentials.token as string }
            ]
          }
        })

        if (!user) return null

        // Giriş yaptığı an e-posta onayını da true yapalım (Garanti olsun)
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
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        (session.user as any).id = token.id;
        (session.user as any).rol = token.rol;
        (session.user as any).isAdmin = token.isAdmin;
      }
      return session;
    }
  },
  pages: { signIn: "/giris" }
})