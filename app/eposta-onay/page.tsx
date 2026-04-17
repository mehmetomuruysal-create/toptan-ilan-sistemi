import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"

export const viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
}

export default async function EpostaOnayPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ token: string }> 
}) {
  const { token } = await searchParams

  // 1. Token Kontrolü
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md">
          <div className="text-5xl mb-4">❌</div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Geçersiz Bağlantı</h1>
          <p className="text-gray-500 mb-6">Onay kodu eksik.</p>
          <Link href="/" className="text-blue-600 font-bold hover:underline">Ana Sayfaya Dön</Link>
        </div>
      </div>
    )
  }

  // 2. Kullanıcıyı Token ile Bulma (Güncel Şema ile Tam Uyumlu)
  const user = await prisma.user.findFirst({
    where: { 
      emailVerifyToken: token 
    }
  })

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md">
          <div className="text-5xl mb-4">❌</div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Geçersiz veya Kullanılmış Kod</h1>
          <p className="text-gray-500 mb-6">Bu onay kodu geçersiz veya daha önce kullanılmış.</p>
          <Link href="/" className="text-blue-600 font-bold hover:underline">Ana Sayfaya Dön</Link>
        </div>
      </div>
    )
  }

  // 3. Kullanıcıyı Onaylandı Olarak İşaretle
  // Alıcı ise doğrudan onaylıyoruz, Satıcı ise admin onayına (PENDING) bırakıyoruz.
  await prisma.user.update({
    where: { id: user.id },
    data: { 
      epostaOnaylandi: true,
      onayDurumu: user.hesapTuru === "ALICI" ? "APPROVED" : "PENDING"
    }
  })

  // 4. Sihirli Giriş (Auto-Login) API'sine Yönlendir
  // NOT: Token'ı burada silmiyoruz, auto-login API'si login işlemini tamamladıktan sonra silecek.
  redirect(`/api/auth/auto-login?token=${token}`)
}