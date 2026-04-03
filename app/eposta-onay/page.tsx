import { prisma } from "@/lib/prisma"
import { signIn } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function EpostaOnayPage({ searchParams }: { searchParams: Promise<{ token: string }> }) {
  const { token } = await searchParams

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md">
          <div className="text-5xl mb-4">❌</div>
          <h1 className="text-xl font-bold">Geçersiz Bağlantı</h1>
          <Link href="/" className="text-blue-600 mt-4 inline-block">Ana Sayfaya Dön</Link>
        </div>
      </div>
    )
  }

  const user = await prisma.user.findFirst({
    where: { emailVerifyToken: token }
  })

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md">
          <div className="text-5xl mb-4">❌</div>
          <h1 className="text-xl font-bold">Geçersiz veya Kullanılmış Kod</h1>
          <Link href="/" className="text-blue-600 mt-4 inline-block">Ana Sayfaya Dön</Link>
        </div>
      </div>
    )
  }

  // Kullanıcıyı onayla ve kodu temizle
  await prisma.user.update({
    where: { id: user.id },
    data: { epostaOnaylandi: true, emailVerifyToken: null }
  })

  // Otomatik giriş yap (verify-token provider ile)
  await signIn("verify-token", {
    token: token,
    redirect: false,
  })

  // Ana sayfaya yönlendir
  redirect("/")
}