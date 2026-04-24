import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { auth } from "@/auth"
import BaremSecici from "./BaremSecici"
import CampaignProgress from "./CampaignProgress"
import FavoriteButton from "@/components/FavoriteButton"
import UrunGalerisi from "@/components/UrunGalerisi" // 🚀 Yeni Nesil Galeri
import { 
  ShieldCheck, 
  Timer, 
  Truck, 
  ShieldAlert, 
  Zap,
  Star,
  ChevronRight,
  Info
} from "lucide-react"

export default async function IlanDetayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  const userId = session?.user?.id ? Number(session.user.id) : null

  const listing = await prisma.listing.findUnique({
    where: { id: parseInt(id) },
    include: { 
      satici: true,
      images: {
        orderBy: { siraNo: 'asc' } // 🚀 Resimleri sırasıyla çekiyoruz
      }, 
      category: true, 
      favoritedBy: userId ? { where: { userId } } : false,
      baremler: { 
        orderBy: { miktar: 'asc' }, 
        include: { katilimcilar: true } 
      } 
    }
  })

  if (!listing) notFound();

  const isFavorited = listing.favoritedBy && listing.favoritedBy.length > 0;
  const toplamKatilim = listing.baremler.reduce((acc: number, b: any) => acc + (b.katilimcilar?.length || 0), 0);
  const enDusukBaremFiyati = listing.baremler.length > 0 
    ? Math.min(...listing.baremler.map((b: any) => b.fiyat)) 
    : (listing.toptanFiyat || listing.perakendeFiyat);
  
  const kalanGun = Math.ceil((new Date(listing.bitisTarihi).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const isFirstBuyer = toplamKatilim === 0;

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* 1. Üst Navigasyon */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-[10000]">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[13px] text-gray-500">
            <Link href="/" className="hover:text-[#F27A1A]">Ana Sayfa</Link>
            <ChevronRight size={14} />
            <span className="font-semibold text-gray-900 truncate max-w-[200px] md:max-w-none">{listing.baslik}</span>
          </div>
          <div className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 animate-pulse">
            <Timer size={14} /> {kalanGun <= 0 ? "SÜRE DOLDU" : `SON ${kalanGun} GÜN`}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* SOL KOLON - Gelişmiş Galeri Sistemi */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 space-y-4">
               <div className="relative group">
                  {/* Favori Butonu */}
                  <div className="absolute top-4 right-4 z-20">
                    <FavoriteButton listingId={listing.id} isFavoritedInitial={isFavorited} />
                  </div>

                  {/* İlk Alıcı Rozeti */}
                  {isFirstBuyer && (
                    <div className="absolute top-4 left-4 z-20 bg-gray-900 text-white px-3 py-1.5 rounded text-[10px] font-bold flex items-center gap-2 shadow-xl">
                       <Zap size={12} className="text-yellow-400 fill-yellow-400" /> İLK ALICI ÖDÜLÜ
                    </div>
                  )}

                  {/* 🚀 ANA GALERİ KOMPONENTİ */}
                  <UrunGalerisi 
                    resimler={listing.images.map(img => ({
                      id: img.id,
                      url: img.url,
                      altText: img.altText || listing.baslik,
                      siraNo: img.siraNo
                    }))}
                    urunAdi={listing.baslik}
                  />
               </div>
            </div>
          </div>

          {/* SAĞ KOLON - Satın Alma Alanı */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white p-6 md:p-8 rounded-lg border border-gray-200 shadow-sm">
              
              {/* Başlık ve Satıcı */}
              <div className="space-y-2 border-b border-gray-100 pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl md:text-2xl font-normal text-gray-900 leading-tight">
                    <span className="font-bold text-[#F27A1A] uppercase mr-2">{listing.satici.firmaAdi || "Mingax Satıcı"}</span> 
                    {listing.baslik}
                  </h1>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-yellow-400">
                    <Star size={14} fill="currentColor" />
                    <Star size={14} fill="currentColor" />
                    <Star size={14} fill="currentColor" />
                    <Star size={14} fill="currentColor" />
                    <Star size={14} fill="currentColor" />
                    <span className="text-gray-400 ml-1 text-xs">(0 Değerlendirme)</span>
                  </div>
                  <div className="text-blue-600 font-semibold text-xs hover:underline cursor-pointer">
                    {listing.category?.name}
                  </div>
                </div>
              </div>

              {/* Barem ve Kampanya Alanı */}
              <div className="flex flex-col gap-8">
                <div className="w-full">
                  <BaremSecici 
                    baremler={JSON.parse(JSON.stringify(listing.baremler))} 
                    perakendeFiyat={listing.perakendeFiyat} 
                    depozitoOrani={listing.depozitoOrani}
                    kalanGun={kalanGun}
                  />
                </div>

                <div className="w-full">
                  <CampaignProgress 
                    listing={JSON.parse(JSON.stringify(listing))} 
                    toplamKatilim={toplamKatilim} 
                  />
                </div>
              </div>

              {/* Güvenlik Özellikleri */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8 mt-8 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-50 rounded-full text-gray-600"><Truck size={20} /></div>
                  <div className="text-[11px] text-gray-500 font-medium leading-tight">Hızlı Teslimat & Güvenli Kargo</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-50 rounded-full text-gray-600"><ShieldCheck size={20} /></div>
                  <div className="text-[11px] text-gray-500 font-medium leading-tight">Mingax Escrow Koruması</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-50 rounded-full text-gray-600"><Info size={20} /></div>
                  <div className="text-[11px] text-gray-500 font-medium leading-tight">Hedef Aşılmazsa Tutar İadesi</div>
                </div>
              </div>
            </div>

            {/* İade Banner */}
            <div className="bg-[#FFF0E5] border border-[#F27A1A]/20 p-4 rounded-lg flex items-start gap-3">
               <ShieldAlert className="text-[#F27A1A] shrink-0" size={20} />
               <p className="text-[12px] text-gray-700 leading-relaxed font-medium">
                  <strong>İade Garantisi:</strong> Bu bir grup alım ilanıdır. Belirlenen hedef tarihte barem limitlerine ulaşılamazsa ödediğiniz %{listing.depozitoOrani} kapora tutarı hiçbir kesinti olmadan cüzdanınıza iade edilir.
               </p>
            </div>

            {/* Açıklama Kutusu */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
              <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 text-sm font-bold text-gray-800 uppercase tracking-tight">
                Ürün Açıklaması
              </div>
              <div className="p-6">
                <div className="prose prose-sm max-w-none text-gray-600 font-normal leading-relaxed whitespace-pre-line">
                  {listing.aciklama}
                </div>
              </div>
            </div>

            {/* Mağaza Kartı */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 font-bold border border-gray-200 uppercase">
                   {listing.satici.ad[0]}{listing.satici.soyad[0]}
                </div>
                <div>
                   <h3 className="font-bold text-gray-900">{listing.satici.firmaAdi || "Mingax Mağazası"}</h3>
                   <div className="flex items-center gap-2 mt-1">
                      <div className="bg-green-500 text-white text-[10px] px-2 py-0.5 rounded font-bold">9.8</div>
                      <p className="text-[11px] text-gray-400 font-medium uppercase">Mağaza Puanı</p>
                   </div>
                </div>
              </div>
              <div className="flex gap-4">
                <button className="text-xs font-bold text-[#F27A1A] border border-[#F27A1A] px-6 py-2.5 rounded-lg hover:bg-[#FFF0E5] transition-all">Satıcıyı Takip Et</button>
                <button className="text-xs font-bold text-gray-600 border border-gray-200 px-6 py-2.5 rounded-lg hover:bg-gray-50 transition-all">Soru Sor</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}