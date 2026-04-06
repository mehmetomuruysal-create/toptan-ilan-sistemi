import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const { handlers, signIn, signOut, auth } = NextAuth({
  // Tip hatasını önlemek için as any ekledik
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

        if (!user || !user.password) return null

        const sifreDogru = await bcrypt.compare(
          credentials.password as string,
          user.password
        )
        
        if (!sifreDogru) return null

        if (!user.epostaOnaylandi) {
          throw new Error("Lütfen e-posta adresinizi onaylayın.")
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
    Credentials({
      id: "magic-link-verify",
      name: "magic-link-verify",
      credentials: {
        token: { label: "Token", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.token) return null

        // Token ile kullanıcıyı bul ve aynı zamanda onayla (veya onaylı mı bak)
        const user = await prisma.user.findFirst({
          where: { 
            emailVerifyToken: credentials.token as string
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
    error: "/giris",
  },
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
  }
})