import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"

export default async function IlanDetayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ilan = await prisma.listing.findUnique({
    where: { id: parseInt(id) },
    include: { satici: true }
  })

  if (!ilan) notFound()

  const indirimYuzde = Math.round((1 - ilan.toptanFiyat / ilan.perakendeFiyat) * 100)
  const kalanGun = Math.ceil((new Date(ilan.bitisTarihi).getTime() - Date.now()) / (1000 * 60 * 60 * 24))

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <Link href="/" className="text-blue-600 font-bold text-xl">← Toptan İlan</Link>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Sol Kolon */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="text-sm text-blue-600 font-medium">{ilan.kategori}</span>
                  <h1 className="text-2xl font-bold text-gray-800 mt-1">{ilan.baslik}</h1>
                </div>
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
                  %{indirimYuzde} indirim
                </span>
              </div>

              {ilan.aciklama && (
                <p className="text-gray-600 mb-4">{ilan.aciklama}</p>
              )}

              {/* Hedef Kitle */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                  👤 Bireysel min. {ilan.minMiktarBireysel} adet
                </span>
                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                  🏪 KOBİ min. {ilan.minMiktarKobi} adet
                </span>
                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                  🏢 Kurumsal min. {ilan.minMiktarKurumsal} adet
                </span>
              </div>

              {/* Teslimat */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-700 mb-2">🚚 Teslimat Yöntemi</p>
                <p className="text-sm text-gray-600">
                  {ilan.teslimatYontemi === "kargo" && "Her adrese ayrı kargo"}
                  {ilan.teslimatYontemi === "merkezi" && "Merkezi teslim noktası"}
                  {ilan.teslimatYontemi === "depo" && "Alıcı depoya teslim"}
                </p>
              </div>

              {/* 24 Saat İade */}
              <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                <span className="text-green-600">🔄</span>
                <span className="text-sm text-green-700 font-medium">
                  24 Saat İade Garantisi — Tedarikçi iptali veya teslimat gerçekleşmezse tam iade
                </span>
              </div>
            </div>

            {/* Tedarikçi (DÜZELTİLMİŞ) */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="font-bold text-gray-800 mb-3">Tedarikçi Bilgisi</h2>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                  {ilan.satici.ad[0]}{ilan.satici.soyad[0]}
                </div>
                <div>
                  <p className="font-medium text-gray-800">{ilan.satici.ad} {ilan.satici.soyad}</p>
                  <p className="text-sm text-gray-500">⭐ Güven Puanı: {ilan.satici.guvenPuani}</p>
                </div>
                <span className="ml-auto bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
                  ✓ Onaylı
                </span>
              </div>
            </div>
          </div>

          {/* Sağ Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-4">
              <div className="bg-gray-900 rounded-lg p-4 mb-4 text-center">
                <p className="text-gray-400 text-sm line-through">₺{ilan.perakendeFiyat}</p>
                <p className="text-3xl font-bold text-yellow-400">₺{ilan.toptanFiyat}</p>
                <p className="text-green-400 text-sm mt-1">%{indirimYuzde} tasarruf</p>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Hedef</span>
                  <span className="font-medium">{ilan.hedefSayi} adet</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Kalan Süre</span>
                  <span className={`font-medium ${kalanGun <= 1 ? "text-red-500" : kalanGun <= 3 ? "text-orange-500" : "text-gray-800"}`}>
                    {kalanGun} gün
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Depozito</span>
                  <span className="font-medium text-orange-600">%{ilan.depozitoOrani}</span>
                </div>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
                <p className="text-xs text-orange-700">
                  ⚠️ Katılım için toplam bedelin <strong>%{ilan.depozitoOrani}</strong>'i depozito olarak alınır. Vazgeçilirse iade edilmez.
                </p>
              </div>

              <Link
                href="/giris"
                className="block w-full text-center bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Katıl — %{ilan.depozitoOrani} Depozito
              </Link>

              <div className="mt-3 text-center text-xs text-gray-400">
                🔒 Ödeme Escrow hesabında güvende
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}