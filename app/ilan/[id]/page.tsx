import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import BaremSecici from "./BaremSecici"
import CampaignProgress from "./CampaignProgress" // 🚀 Yeni stratejik bileşen
import { ShieldCheck, Timer, ChevronLeft, Award, Truck, ShieldAlert, Share2 } from "lucide-react"

export default async function IlanDetayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const ilan = await prisma.listing.findUnique({
    where: { id: parseInt(id) },
    include: { 
      satici: true,
      images: true, 
      baremler: { 
        orderBy: { miktar: 'asc' },
        include: { katilimcilar: true } // 🚀 Katılımcıları çekmemiz şart
      } 
    }
  })

  if (!ilan) notFound()

  // 📈 İstatiksel Hesaplamalar
  const toplamKatilim = ilan.baremler.reduce((acc, b) => acc + b.katilimcilar.length, 0);
  const enDusukBaremFiyati = ilan.baremler.length > 0 
    ? Math.min(...ilan.baremler.map(b => b.fiyat)) 
    : ilan.toptanFiyat;
  
  const indirimYuzde = Math.round((1 - enDusukBaremFiyati / ilan.perakendeFiyat) * 100)
  const kalanGun = Math.ceil((new Date(ilan.bitisTarihi).getTime() - Date.now()) / (1000 * 60 * 60 * 24))

  return (
    <div className="min-h-screen bg-white">
      {/* --- MINGAX ÜST NAV --- */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="group flex items-center gap-2 text-gray-400 hover:text-blue-600 transition-all font-black uppercase text-[10px] tracking-widest italic">
            <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Geri Dön
          </Link>
          <div className="flex items-center gap-4">
             <div className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                <Timer size={14} /> {kalanGun <= 0 ? "SÜRE DOLDU" : `${kalanGun} GÜN KALDI`}
             </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

          {/* SOL KOLON: GÖRSEL VE HİKAYE */}
          <div className="lg:col-span-7 space-y-12">
            
            <div className="space-y-4">
               <div className="aspect-[4/3] rounded-[3.5rem] bg-gray-50 overflow-hidden border border-gray-100 group shadow-sm">
                  {ilan.images[0] ? (
                    <img src={ilan.images[0].url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt={ilan.baslik} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 font-black italic">GÖRSEL YOK</div>
                  )}
               </div>
               <div className="grid grid-cols-4 gap-4">
                  {ilan.images.map((img) => (
                    <div key={img.id} className="aspect-square rounded-3xl overflow-hidden border-2 border-gray-50 hover:border-blue-600 transition-all cursor-pointer shadow-sm">
                       <img src={img.url} className="w-full h-full object-cover" />
                    </div>
                  ))}
               </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-3">
                 <span className="bg-blue-600 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest italic">{ilan.kategori}</span>
                 <span className="text-green-600 font-black text-xs italic">-%{indirimYuzde}'ye Varan Tasarruf</span>
              </div>
              <h1 className="text-5xl font-black text-gray-900 tracking-tighter uppercase italic leading-[0.9]">{ilan.baslik}</h1>
              <div className="prose prose-lg max-w-none text-gray-500 font-medium leading-relaxed whitespace-pre-line">
                {ilan.aciklama}
              </div>
            </div>

            {/* Güvenlik Kutuları (PR Uzmanı) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100 flex gap-5 items-center">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm text-blue-600"><Truck size={28} /></div>
                  <div>
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 italic">Lojistik</p>
                     <p className="text-sm font-black text-gray-800 uppercase italic">
                       {ilan.teslimatYontemi === "kargo" ? "Adrese Sigortalı Kargo" : "Merkezi Dağıtım"}
                     </p>
                  </div>
               </div>
               <div className="p-8 bg-green-50/30 rounded-[2.5rem] border border-green-100 flex gap-5 items-center">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm text-green-600"><ShieldCheck size={28} /></div>
                  <div>
                     <p className="text-[10px] font-black text-green-700/50 uppercase tracking-widest mb-1 italic">Havuz Sistemi</p>
                     <p className="text-sm font-black text-green-800 uppercase italic">Garantili Ödeme Modeli</p>
                  </div>
               </div>
            </div>

            {/* Satıcı Kartı */}
            <div className="p-8 bg-white rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-100/50 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center text-white text-xl font-black italic">
                   {ilan.satici.ad[0]}{ilan.satici.soyad[0]}
                </div>
                <div>
                   <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-black text-gray-900 text-lg uppercase italic tracking-tighter">{ilan.satici.ad} {ilan.satici.soyad}</h3>
                      <Award size={18} className="text-blue-600" />
                   </div>
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">{ilan.satici.firmaAdi || "Onaylı Bireysel Satıcı"}</p>
                </div>
              </div>
              <button className="bg-gray-50 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all italic">Satıcı Profili</button>
            </div>
          </div>

          {/* SAĞ KOLON: KAMPANYA VE AKSİYON (Davranış Uzmanı) */}
          <div className="lg:col-span-5 space-y-8">
            <div className="sticky top-32 space-y-8">
               
               {/* 🚀 1. Kampanya İlerleme ve Paylaşım (Viral Loop) */}
               <CampaignProgress 
                  ilan={JSON.parse(JSON.stringify(ilan))} 
                  toplamKatilim={toplamKatilim} 
               />

               {/* 🚀 2. Barem ve Alım Paneli */}
               <BaremSecici 
                  baremler={JSON.parse(JSON.stringify(ilan.baremler))} 
                  perakendeFiyat={ilan.perakendeFiyat} 
                  depozitoOrani={ilan.depozitoOrani}
                  kalanGun={kalanGun}
                  minMiktarlar={{ 
                    bireysel: ilan.minMiktarBireysel, 
                    kobi: ilan.minMiktarKobi, 
                    kurumsal: ilan.minMiktarKurumsal 
                  }}
               />
               
               <div className="px-8 py-5 bg-orange-50 rounded-[2rem] border border-orange-100 flex gap-4 shadow-sm">
                  <ShieldAlert className="text-orange-600 shrink-0" size={20} />
                  <p className="text-[10px] font-bold text-orange-800 leading-relaxed uppercase italic">
                     Güvenlik Notu: Hedeflenen grup sayısına ulaşılamazsa depozitonuz kesintisiz olarak hesabınıza iade edilir.
                  </p>
               </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}