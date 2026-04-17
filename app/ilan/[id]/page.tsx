import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import BaremSecici from "./BaremSecici"
import CampaignProgress from "./CampaignProgress"
import { 
  ShieldCheck, 
  Timer, 
  ChevronLeft, 
  Award, 
  Truck, 
  ShieldAlert, 
  Zap,
  TrendingDown
} from "lucide-react"

export default async function IlanDetayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const listing = await prisma.listing.findUnique({
    where: { id: parseInt(id) },
    include: { 
      satici: true,
      images: true, 
      category: true, 
      baremler: { 
        orderBy: { miktar: 'asc' }, 
        include: { katilimcilar: true } 
      } 
    }
  })

  if (!listing) notFound();

  // 1. Toplam Katılım (Parametrelere tip verildi)
  const toplamKatilim = listing.baremler.reduce((acc: number, b: any) => acc + (b.katilimcilar?.length || 0), 0);

  // 2. En Düşük Barem Fiyatı (Null güvenliği sağlandı)
  const enDusukBaremFiyati = listing.baremler.length > 0 
    ? Math.min(...listing.baremler.map((b: any) => b.fiyat)) 
    : (listing.toptanFiyat || listing.perakendeFiyat);
  
  // 3. İndirim Yüzdesi (TS18047 hatası çözüldü: Değer varsa hesapla, yoksa 0 de)
  const indirimYuzde = (enDusukBaremFiyati && listing.perakendeFiyat)
    ? Math.round((1 - (enDusukBaremFiyati / listing.perakendeFiyat)) * 100)
    : 0;

  // 4. Kalan Gün Hesabı
  const kalanGun = Math.ceil((new Date(listing.bitisTarihi).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  // 5. İlk Alıcı Kontrolü
  const isFirstBuyer = toplamKatilim === 0;

  // Min miktar bilgisi baremlerden alınıyor (şemada yoksa)
  const minMiktarlar = {
    bireysel: listing.baremler[0]?.miktar || 1,
    kobi: listing.baremler[1]?.miktar || 5,
    kurumsal: listing.baremler[2]?.miktar || 10,
  }

  return (
    <div className="min-h-screen bg-white">
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="group flex items-center gap-2 text-gray-400 hover:text-blue-600 transition-all font-black uppercase text-[10px] tracking-widest italic">
            <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Geri Dön
          </Link>
          <div className="flex items-center gap-4">
             <div className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 italic">
                <Timer size={14} /> {kalanGun <= 0 ? "SÜRE DOLDU" : `${kalanGun} GÜN KALDI`}
             </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

          {/* SOL KOLON */}
          <div className="lg:col-span-7 space-y-12">
            
            <div className="space-y-4">
               <div className="aspect-[4/3] rounded-[3.5rem] bg-gray-50 overflow-hidden border border-gray-100 group shadow-sm">
                  {listing.images[0] ? (
                    <img src={listing.images[0].url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt={listing.baslik} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 font-black italic uppercase tracking-widest">Görsel Hazırlanıyor</div>
                  )}
               </div>
               <div className="grid grid-cols-4 gap-4">
                  {listing.images.map((img) => (
                    <div key={img.id} className="aspect-square rounded-3xl overflow-hidden border-2 border-gray-50 hover:border-blue-600 transition-all cursor-pointer shadow-sm">
                       <img src={img.url} className="w-full h-full object-cover" />
                    </div>
                  ))}
               </div>
            </div>

            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                 <span className="bg-gray-900 text-white px-4 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest italic">
                    {listing.category?.name ?? "Genel Fırsat"}
                 </span>
                 <span className="text-blue-600 font-black text-xs italic bg-blue-50 px-3 py-1 rounded-lg flex items-center gap-2">
                    <TrendingDown size={14} /> %{indirimYuzde}'ye Varan Grup Tasarrufu
                 </span>
              </div>
              <h1 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tighter uppercase italic leading-[0.9]">{listing.baslik}</h1>
              <div className="prose prose-lg max-w-none text-gray-500 font-medium leading-relaxed whitespace-pre-line">
                {listing.aciklama}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 flex gap-5 items-center">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm text-blue-600"><Truck size={28} /></div>
                  <div>
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 italic">Lojistik Güvencesi</p>
                     <p className="text-sm font-black text-gray-800 uppercase italic">
                       {listing.teslimatYontemleri?.includes("KARGO") ? "Sigortalı Adrese Teslim" : "Merkezi Dağıtım Noktası"}
                     </p>
                  </div>
               </div>
               <div className="p-8 bg-green-50/30 rounded-[2.5rem] border border-green-100 flex gap-5 items-center">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm text-green-600"><ShieldCheck size={28} /></div>
                  <div>
                     <p className="text-[10px] font-black text-green-700/50 uppercase tracking-widest mb-1 italic">Emanet Sistemi</p>
                     <p className="text-sm font-black text-green-800 uppercase italic">Mingax Escrow Koruması</p>
                  </div>
               </div>
            </div>

            <div className="p-8 bg-white rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-100/50 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center text-white text-xl font-black italic">
                   {listing.satici.ad[0]}{listing.satici.soyad[0]}
                </div>
                <div>
                   <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-black text-gray-900 text-lg uppercase italic tracking-tighter">{listing.satici.ad} {listing.satici.soyad}</h3>
                      <Award size={18} className="text-blue-600" />
                   </div>
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">{listing.satici.firmaAdi || "Mingax Onaylı İş Ortağı"}</p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <div className="flex gap-1 text-yellow-400 mb-1">
                   {[...Array(5)].map((_, i) => <Zap key={i} size={14} fill="currentColor" />)}
                </div>
                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest italic">Güven Skoru: {listing.satici.guvenPuani}/100</p>
              </div>
            </div>
          </div>

          {/* SAĞ KOLON */}
          <div className="lg:col-span-5 space-y-8">
            <div className="sticky top-32 space-y-8">
               
               {isFirstBuyer && (
                 <div className="bg-gray-900 p-8 rounded-[3rem] text-white relative overflow-hidden group">
                    <div className="relative z-10">
                       <Zap className="text-yellow-400 mb-4 animate-pulse" size={32} />
                       <h4 className="text-xl font-black italic tracking-tighter uppercase mb-2">Bu Alımı Sen Başlat!</h4>
                       <p className="text-xs text-gray-400 font-medium leading-relaxed">
                          İlk talebi sen oluştur, "Alım Öncüsü" ol ve bu ilandaki her satıştan %0.75 pay kazan.
                       </p>
                    </div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 blur-3xl rounded-full"></div>
                 </div>
               )}

               <CampaignProgress 
                  listing={JSON.parse(JSON.stringify(listing))} 
                  toplamKatilim={toplamKatilim} 
               />

               <BaremSecici 
                  baremler={JSON.parse(JSON.stringify(listing.baremler))} 
                  perakendeFiyat={listing.perakendeFiyat} 
                  depozitoOrani={listing.depozitoOrani}
                  kalanGun={kalanGun}
                  minMiktarlar={minMiktarlar}
               />
               
               <div className="px-8 py-6 bg-orange-50 rounded-[2.5rem] border border-orange-100 flex gap-4">
                  <ShieldAlert className="text-orange-600 shrink-0" size={24} />
                  <p className="text-[10px] font-bold text-orange-800 leading-relaxed uppercase italic">
                     İade Garantisi: Grup hedefi tamamlanmazsa ödediğiniz %{listing.depozitoOrani} kapora anında cüzdanınıza iade edilir.
                  </p>
               </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}