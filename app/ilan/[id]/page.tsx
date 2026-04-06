import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import BaremSecici from "./BaremSecici" // Yeni oluşturacağımız istemci bileşeni

export default async function IlanDetayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const ilan = await prisma.listing.findUnique({
    where: { id: parseInt(id) },
    include: { 
      satici: true,
      baremler: { orderBy: { sira: 'asc' } } // Baremleri sırasıyla çekiyoruz
    }
  })

  if (!ilan) notFound()

  // En düşük fiyatlı (en son) baremi bulalım
  const enDusukFiyat = ilan.baremler.length > 0 
    ? Math.min(...ilan.baremler.map(b => b.fiyat)) 
    : ilan.toptanFiyat;

  const indirimYuzde = Math.round((1 - enDusukFiyat / ilan.perakendeFiyat) * 100)
  const kalanGun = Math.ceil((new Date(ilan.bitisTarihi).getTime() - Date.now()) / (1000 * 60 * 60 * 24))

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/" className="text-blue-600 font-bold text-xl flex items-center gap-2">
            <span>←</span> Toptan İlan
          </Link>
          <div className="text-xs text-gray-400 hidden sm:block">
            İlan ID: #{ilan.id} | Bitiş: {new Date(ilan.bitisTarihi).toLocaleDateString('tr-TR')}
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Sol Kolon: Ürün Detayları */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border p-6 sm:p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <nav className="flex gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">
                    <span className="bg-blue-50 px-2 py-1 rounded">{ilan.kategori}</span>
                  </nav>
                  <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight leading-tight">
                    {ilan.baslik}
                  </h1>
                </div>
                <div className="hidden sm:flex flex-col items-end text-right">
                  <span className="text-sm text-gray-400 line-through">₺{ilan.perakendeFiyat}</span>
                  <span className="text-2xl font-black text-green-600">-%{indirimYuzde}</span>
                </div>
              </div>

              {ilan.aciklama && (
                <div className="prose prose-blue max-w-none text-gray-600 mb-8 leading-relaxed">
                  {ilan.aciklama}
                </div>
              )}

              {/* Hedef Kitle Kılavuzu */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
                <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 text-center">
                  <span className="block text-2xl mb-1">👤</span>
                  <span className="block text-xs font-bold text-blue-800 uppercase">Bireysel</span>
                  <span className="text-sm font-medium text-blue-600">Min. {ilan.minMiktarBireysel} Adet</span>
                </div>
                <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 text-center">
                  <span className="block text-2xl mb-1">🏪</span>
                  <span className="block text-xs font-bold text-indigo-800 uppercase">KOBİ</span>
                  <span className="text-sm font-medium text-indigo-600">Min. {ilan.minMiktarKobi} Adet</span>
                </div>
                <div className="bg-purple-50/50 border border-purple-100 rounded-xl p-4 text-center">
                  <span className="block text-2xl mb-1">🏢</span>
                  <span className="block text-xs font-bold text-purple-800 uppercase">Kurumsal</span>
                  <span className="text-sm font-medium text-purple-600">Min. {ilan.minMiktarKurumsal} Adet</span>
                </div>
              </div>

              {/* Güvenlik Paneli */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-2xl">🚚</div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase">Teslimat</p>
                    <p className="text-sm font-semibold text-gray-700">
                      {ilan.teslimatYontemi === "kargo" ? "Adrese Kargo" : "Merkezi Teslimat"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-green-50/50 rounded-2xl border border-green-100">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-2xl">🛡️</div>
                  <div>
                    <p className="text-xs font-bold text-green-700 uppercase">Koruma</p>
                    <p className="text-sm font-semibold text-green-800">24 Saat İade Garantisi</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tedarikçi Kartı */}
            <div className="bg-white rounded-2xl shadow-sm border p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg">
                  {ilan.satici.ad[0]}{ilan.satici.soyad[0]}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                    {ilan.satici.ad} {ilan.satici.soyad}
                    <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-black uppercase">Onaylı</span>
                  </h3>
                  <p className="text-sm text-gray-500">Güven Puanı: <span className="text-yellow-500 font-bold">★ {ilan.satici.guvenPuani}</span></p>
                </div>
              </div>
              <button className="hidden sm:block text-sm font-bold text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl transition-all">
                Satıcı Profilini Gör
              </button>
            </div>
          </div>

          {/* Sağ Kolon: Dinamik Barem Seçici */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
               {/* Baremleri yönetecek client bileşeni buraya geliyor */}
               <BaremSecici 
                  baremler={ilan.baremler} 
                  perakendeFiyat={ilan.perakendeFiyat} 
                  depozitoOrani={ilan.depozitoOrani}
                  kalanGun={kalanGun}
               />
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}