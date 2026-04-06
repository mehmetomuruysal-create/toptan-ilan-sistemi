import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const { handlers, signIn, signOut, auth } = NextAuth({
  // 1. Adapter eklemezsen sihirli bağlantı token'ları DB'ye yazılamaz
  // @ts-ignore veya as any kullanarak tip uyuşmazlığını geçiyoruz
adapter: PrismaAdapter(prisma) as any,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      id: "credentials",
      name: "credentials",
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

        // Şifre kontrolü
        const sifreDogru = await bcrypt.compare(
          credentials.password as string,
          user.password
        )
        
        if (!sifreDogru) return null

        // E-posta onay kontrolü (Şifre doğruysa bakılır)
        if (!user.epostaOnaylandi) {
          throw new Error("Lütfen giriş yapmadan önce e-posta adresinizi onaylayın.")
        }

        return {
          id: String(user.id),
          email: user.email,
          name: `${user.ad} ${user.soyad}`.trim(),
          rol: user.hesapTuru,
          isAdmin: user.isAdmin,
        }
      }
    }),
    // Magic Link için özel authorize mantığı
    Credentials({
      id: "magic-link-verify",
      name: "magic-link-verify",
      credentials: {
        token: { label: "Token", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.token) return null

        const user = await prisma.user.findFirst({
          where: { 
            emailVerifyToken: credentials.token as string,
            epostaOnaylandi: true // Sadece onaylıları alalım
          }
        })

        if (!user) return null

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
  pages: {
    signIn: "/giris",
    error: "/giris", // Hata durumunda giriş sayfasına dön
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // İlk girişte user bilgilerini token'a yaz
      if (user) {
        token.id = user.id;
        token.rol = (user as any).rol;
        token.isAdmin = (user as any).isAdmin;
      }
      return token;
    },
    async session({ session, token }) {
      // Token'daki bilgileri session'a aktar
      if (session.user && token) {
        (session.user as any).id = token.id;
        (session.user as any).rol = token.rol;
        (session.user as any).isAdmin = token.isAdmin;
      }
      return session;
    }
  }
})