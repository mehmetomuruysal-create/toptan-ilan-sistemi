import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const { handlers, signIn, signOut, auth } = NextAuth({
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
          isAdmin: !!(user as any).isAdmin,
        }
      }
    }),
    Credentials({
      id: "verify-token",
      name: "verify-token",
      credentials: {
        token: { label: "Token", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.token) return null
        const user = await prisma.user.findFirst({
          where: { emailVerifyToken: credentials.token as string }
        })
        if (!user) return null
        if (!user.epostaOnaylandi) {
          throw new Error("E-posta adresiniz henüz onaylanmamış.")
        }
        return {
          id: String(user.id),
          email: user.email,
          name: `${user.ad} ${user.soyad}`.trim(),
          rol: user.hesapTuru,
          isAdmin: !!(user as any).isAdmin,
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
      if (user) {
        token.rol = (user as any).rol;
        token.isAdmin = !!(user as any).isAdmin;
        token.sub = (user as any).id; // ✅ id'yi token'a ekle
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as any).rol = token.rol ? token.rol : "ALICI";
        (session.user as any).isAdmin = token.isAdmin === true;
        (session.user as any).id = token.sub; // ✅ id'yi session'a ekle
      }
      return session;
    }
  }
})