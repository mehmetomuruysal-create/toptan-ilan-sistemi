import { prisma } from "@/lib/prisma"
import Link from "next/link"

export default async function EpostaOnayPage({ searchParams }: { searchParams: { token: string } }) {
  const token = searchParams.token

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50"><p className="text-red-500">Geçersiz bağlantı.</p></div>
    )
  }

  // Veritabanında bu koda sahip kullanıcıyı bul
  const user = await prisma.user.findFirst({ where: { emailVerifyToken: token } })

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

  // Kullanıcıyı bulduysak ONAYLA ve Kodu Sil
  await prisma.user.update({
    where: { id: user.id },
    data: { epostaOnaylandi: true, emailVerifyToken: null }
  })

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md border border-green-100">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">✓</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">E-posta Onaylandı!</h1>
        <p className="text-gray-500 mb-6">Harika! <b>{user.email}</b> adresi başarıyla doğrulandı. Artık hesabınıza giriş yapabilirsiniz.</p>
        <Link href="/" className="block w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition">
          SİTEYE GİT VE GİRİŞ YAP
        </Link>
      </div>
    </div>
  )
}