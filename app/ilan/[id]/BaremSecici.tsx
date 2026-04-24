"use client"
import { useState } from "react"
import { Check, Users, ShoppingCart, ShieldCheck, Clock, TrendingDown, Info, Heart } from "lucide-react"
import Link from "next/link"

export default function BaremSecici({ baremler, perakendeFiyat, depozitoOrani, kalanGun }: any) {
  const [seciliBaremId, setSeciliBaremId] = useState(baremler[0]?.id)
  const seciliBarem = baremler.find((b: any) => b.id === seciliBaremId) || baremler[0]

  const tasarrufTutari = perakendeFiyat - seciliBarem.fiyat
  const indirimYuzdesi = Math.round((tasarrufTutari / perakendeFiyat) * 100)

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm sticky top-24 overflow-hidden">
      
      {/* 1. ÜST FİYAT ALANI (Trendyol Stili) */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-gray-400 line-through text-sm">₺{perakendeFiyat.toLocaleString()}</span>
          <span className="bg-red-50 text-red-600 text-xs font-bold px-2 py-0.5 rounded">%{indirimYuzdesi} İndirim</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-[#F27A1A]">₺{seciliBarem.fiyat.toLocaleString()}</span>
          <span className="text-sm font-semibold text-gray-500">/ adet</span>
        </div>
        
        {/* Kargo/Teslimat Rozeti */}
        <div className="mt-3 flex items-center gap-2">
           <div className="bg-green-50 text-green-700 text-[11px] font-bold px-2 py-1 rounded-md flex items-center gap-1">
             <ShieldCheck size={14} /> Mingax Güvencesiyle İade Garantili
           </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* 2. BAREM SEÇENEKLERİ (Varyant Seçimi gibi) */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-tight">Hedef Fiyat Seçiniz</h3>
            <div className="flex items-center gap-1 text-blue-600 text-xs font-semibold cursor-pointer hover:underline">
              <Info size={14} /> Nasıl Çalışır?
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            {baremler.map((barem: any) => {
              const isSelected = seciliBaremId === barem.id
              return (
                <div
                  key={barem.id}
                  onClick={() => setSeciliBaremId(barem.id)}
                  className={`relative cursor-pointer p-4 rounded-lg border-2 transition-all ${
                    isSelected 
                      ? "border-[#F27A1A] bg-orange-50/30" 
                      : "border-gray-100 hover:border-gray-300"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className={`text-xs font-bold uppercase ${isSelected ? 'text-[#F27A1A]' : 'text-gray-500'}`}>
                        Hedef: {barem.miktar} Adet
                      </p>
                      <p className="text-lg font-black text-gray-900">₺{barem.fiyat.toLocaleString()}</p>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 bg-[#F27A1A] rounded-full flex items-center justify-center text-white">
                        <Check size={14} strokeWidth={3} />
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 3. SOSYAL KANIT VE ZAMAN (Minimalist) */}
        <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 text-gray-600">
            <Users size={18} className="text-blue-500" />
            <span className="text-xs font-bold">12 kişi bu hedefte</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 border-l border-gray-200 pl-4">
            <Clock size={18} className="text-red-500" />
            <span className="text-xs font-bold">{kalanGun} gün kaldı</span>
          </div>
        </div>

        {/* 4. AKSİYON BUTONLARI (Trendyol Signature) */}
        <div className="flex gap-3 pt-2">
          <Link
            href={`/katil/${seciliBarem.id}`}
            className="flex-[4] bg-[#F27A1A] text-white py-4 rounded-lg font-bold text-sm uppercase hover:bg-[#d46a16] transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <ShoppingCart size={20} />
            Talebe Katıl
          </Link>
          <button className="flex-1 border border-gray-200 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all">
            <Heart size={24} />
          </button>
        </div>

        {/* Ödeme Detayı Özeti */}
        <div className="pt-4 mt-2">
           <div className="flex justify-between text-sm mb-2">
             <span className="text-gray-500 font-medium">Şimdi Ödenecek (%{depozitoOrani} Kapora)</span>
             <span className="font-bold text-gray-900">₺{((seciliBarem.fiyat * depozitoOrani) / 100).toLocaleString()}</span>
           </div>
           <p className="text-[10px] text-gray-400 leading-tight">
             * Grup tamamlandığında kalan tutar tahsil edilir. Hedef aşılmazsa tutar anında iade edilir.
           </p>
        </div>
      </div>
    </div>
  )
}