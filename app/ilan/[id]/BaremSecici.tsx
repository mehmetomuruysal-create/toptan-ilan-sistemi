"use client"
import { useState } from "react"
import { CheckCircle2, Users, ArrowRight, ShieldCheck, Clock, TrendingDown } from "lucide-react"
import Link from "next/link"

export default function BaremSecici({ baremler, perakendeFiyat, depozitoOrani, kalanGun }: any) {
  const [seciliBaremId, setSeciliBaremId] = useState(baremler[0]?.id)
  const seciliBarem = baremler.find((b: any) => b.id === seciliBaremId) || baremler[0]

  // Davranış Uzmanı Notu: Tasarrufu rakamla göstermek her zaman daha ikna edicidir.
  const tasarrufTutari = perakendeFiyat - seciliBarem.fiyat

  return (
    <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200 border border-gray-100 overflow-hidden sticky top-24">
      
      {/* 🕒 ZAMAN SAYACI (Psikolojik Baskı - FOMO) */}
      <div className="bg-gray-900 p-5 flex items-center justify-between">
        <div className="flex items-center gap-3 text-white/50">
          <Clock size={20} className="text-blue-500" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] italic">Kalan Süre</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-black px-4 py-1.5 rounded-xl italic ${kalanGun <= 2 ? 'bg-red-600 text-white animate-pulse' : 'bg-white/10 text-white'}`}>
            {kalanGun} GÜN
          </span>
        </div>
      </div>

      <div className="p-8">
        <header className="mb-8">
          <h3 className="text-xs font-black text-blue-600 uppercase tracking-[0.3em] mb-2 flex items-center gap-2 italic">
            <TrendingDown size={14} /> Tasarruf Merdiveni
          </h3>
          <p className="text-gray-400 text-[10px] font-bold uppercase leading-relaxed">
            Hangi fiyat hedefine katılmak istersiniz? Hedef sayıya ulaşıldığında bu fiyattan alım yapacaksınız.
          </p>
        </header>

        {/* 📊 DİNAMİK BAREM KARTLARI */}
        <div className="space-y-4 mb-8">
          {baremler.map((barem: any) => {
            const isSelected = seciliBaremId === barem.id
            const tasarrufYuzde = Math.round((1 - barem.fiyat / perakendeFiyat) * 100)

            return (
              <div
                key={barem.id}
                onClick={() => setSeciliBaremId(barem.id)}
                className={`group relative cursor-pointer p-5 rounded-[2rem] border-2 transition-all duration-500 ${
                  isSelected 
                    ? "border-blue-600 bg-blue-50/50 shadow-xl shadow-blue-100/50 scale-[1.02]" 
                    : "border-gray-50 bg-gray-50/30 hover:border-blue-200 hover:bg-white"
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${isSelected ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white text-gray-400 border border-gray-100'}`}>
                        HEDEF: {barem.miktar} ADET
                      </span>
                      {tasarrufYuzde > 25 && !isSelected && (
                         <span className="text-[9px] font-black text-green-600 uppercase italic">Efsane Fırsat 🔥</span>
                      )}
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-3xl font-black italic tracking-tighter transition-colors ${isSelected ? 'text-blue-600' : 'text-gray-900'}`}>
                        ₺{barem.fiyat.toLocaleString()}
                      </span>
                      <span className="text-xs font-black text-green-600 uppercase italic">-%{tasarrufYuzde}</span>
                    </div>
                  </div>
                  
                  <div className={`w-10 h-10 rounded-2xl border-2 flex items-center justify-center transition-all duration-500 ${isSelected ? 'bg-blue-600 border-blue-600 text-white rotate-[360deg]' : 'bg-white border-gray-100 text-transparent'}`}>
                    <CheckCircle2 size={20} />
                  </div>
                </div>

                {/* Sosyal Kanıt Küçük Notu */}
                {isSelected && (
                  <div className="mt-4 pt-4 border-t border-blue-100 flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase italic animate-in fade-in slide-in-from-top-2">
                    <Users size={14} /> Bu hedefe odaklanan 12 kişi var
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* 💳 KATILIM ÖZETİ (PR & Güven Odaklı) */}
        <div className="bg-gray-900 rounded-[2rem] p-6 mb-8 text-white relative overflow-hidden">
          <div className="relative z-10 space-y-4">
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-500 italic">
              <span>Seçili Barem Birim Fiyatı</span>
              <span className="text-white">₺{seciliBarem.fiyat.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-blue-400 italic">
              <span>Birim Başı Tasarruf</span>
              <span>₺{tasarrufTutari.toLocaleString()}</span>
            </div>
            <div className="pt-4 border-t border-white/10 flex justify-between items-end">
               <div>
                  <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-1 italic">Ödenecek Depozito (%{depozitoOrani})</p>
                  <p className="text-3xl font-black italic text-white leading-none">
                    ₺{((seciliBarem.fiyat * depozitoOrani) / 100).toLocaleString()}
                  </p>
               </div>
               <ShieldCheck size={32} className="text-white/10" />
            </div>
          </div>
          {/* Arka Plan Dekoru */}
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-600/20 blur-3xl rounded-full"></div>
        </div>

        {/* AKSİYON BUTONU */}
        <Link
          href={`/katil/${seciliBarem.id}`}
          className="w-full bg-blue-600 text-white py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-700 transition-all shadow-2xl shadow-blue-200 flex items-center justify-center gap-3 group italic"
        >
          TALEBİNİ OLUŞTUR VE KATIL
          <ArrowRight className="group-hover:translate-x-2 transition-transform" size={18} />
        </Link>

        <p className="text-[8px] text-gray-400 font-black uppercase tracking-widest text-center mt-6 italic">
          Grup tamamlanmazsa depozitonuz anında iade edilir.
        </p>
      </div>
    </div>
  )
}