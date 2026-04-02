import { auth, signOut } from "@/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import AuthButtons from "./components/AuthButtons"
export default async function Home() {
  const session = await auth()
  const ilanlar = await prisma.listing.findMany({
    include: { satici: true }
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-600">Toptan İlan</h1>
          <div className="flex items-center gap-4">
            {session ? (
              <>
                <span className="text-sm text-gray-600">
                  Hoş geldin, <strong>{session.user?.name}</strong>
                </span>
                {(session.user as any)?.rol === "satici" && (
                  <Link
                    href="/ilan-ekle"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
                  >
                    + İlan Ekle
                  </Link>
                )}
                <form action={async () => {
                  "use server"
                  await signOut({ redirectTo: "/" })
                }}>
                  <button className="text-sm text-gray-500 hover:text-red-500">
                    Çıkış
                  </button>
                </form>
              </>
            ) : (
              <AuthButtons />
            )}
          </div>
        </div>
      </nav>

      {/* İçerik */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Güncel Fırsatlar</h2>
        <p className="text-gray-500 mb-6">Birlikte alalım, toptan fiyatına alalım.</p>

        {ilanlar.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg">Henüz ilan eklenmemiş.</p>
            {session && (session.user as any)?.rol === "satici" && (
              <Link href="/ilan-ekle" className="mt-4 inline-block text-blue-600 hover:underline">
                İlk ilanı sen ekle →
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ilanlar.map(ilan => (
              <div key={ilan.id} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition p-5">
                <h3 className="font-bold text-gray-800 text-lg mb-2">{ilan.baslik}</h3>
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <p className="text-sm text-gray-400 line-through">₺{ilan.perakendeFiyat}</p>
                    <p className="text-xl font-bold text-blue-600">₺{ilan.toptanFiyat}</p>
                  </div>
                  <div className="bg-green-100 text-green-700 px-2 py-1 rounded-lg text-sm font-medium">
                    %{Math.round((1 - ilan.toptanFiyat / ilan.perakendeFiyat) * 100)} indirim
                  </div>
                </div>
                <div className="text-sm text-gray-500 mb-4">
                  Hedef: <strong>{ilan.hedefSayi} kişi</strong>
                </div>
                <Link
                  href={`/ilan/${ilan.id}`}
                  className="block w-full text-center bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
                >
                  İncele & Katıl
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
import MobileMenu from "./components/MobileMenu";

// ... navbar içinde
<div className="flex items-center gap-4">
  {/* Mevcut session/login/logout butonları */}
  {/* Mobil menüyü ekle: */}
  <MobileMenu />
</div>