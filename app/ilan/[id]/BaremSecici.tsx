"use client"
import { useState } from "react"
import { CheckCircle2, Users, ArrowRight, ShieldCheck, Clock } from "lucide-react"
import Link from "next/link"

export default function BaremSecici({ baremler, perakendeFiyat, depozitoOrani, kalanGun }: any) {
  const [seciliBaremId, setSeciliBaremId] = useState(baremler[0]?.id)
  const seciliBarem = baremler.find((b: any) => b.id === seciliBaremId) || baremler[0]

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Üst Kısım: Zaman Sayacı */}
      <div className="bg-gray-900 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <Clock size={18} className="text-yellow-400" />
          <span className="text-sm font-bold uppercase tracking-tight">Kalan Süre:</span>
        </div>
        <span className={`text-sm font-black px-3 py-1 rounded-lg ${kalanGun <= 2 ? 'bg-red-500 animate-pulse' : 'bg-gray-800'} text-white`}>
          {kalanGun} GÜN
        </span>
      </div>

      <div className="p-6">
        <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
          <Users className="text-blue-600" size={20} />
          Fiyat Kademeleri
        </h3>

        {/* Dinamik Barem Kartları */}
        <div className="space-y-3 mb-6">
          {baremler.map((barem: any) => {
            const isSelected = seciliBaremId === barem.id
            const tasarruf = Math.round((1 - barem.fiyat / perakendeFiyat) * 100)

            return (
              <div
                key={barem.id}
                onClick={() => setSeciliBaremId(barem.id)}
                className={`group relative cursor-pointer p-4 rounded-2xl border-2 transition-all duration-300 ${
                  isSelected 
                    ? "border-blue-600 bg-blue-50 shadow-lg shadow-blue-100" 
                    : "border-gray-100 bg-white hover:border-blue-200"
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${isSelected ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                        HEDEF: {barem.miktar} ADET
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-gray-900 leading-none">₺{barem.fiyat}</span>
                      <span className="text-xs font-bold text-green-600">%{tasarruf} İndirim</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-transparent'}`}>
                      <CheckCircle2 size={14} />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Katılım Özeti */}
        <div className="bg-gray-50 rounded-2xl p-4 mb-6 border border-dashed border-gray-200">
          <div className="flex justify-between items-center mb-3 text-sm">
            <span className="text-gray-500 font-medium">Seçili Barem Hedefi:</span>
            <span className="font-bold text-gray-900">{seciliBarem.miktar} Adet</span>
          </div>
          <div className="flex justify-between items-center mb-1 text-sm">
            <span className="text-gray-500 font-medium">Depozito (%{depozitoOrani}):</span>
            <span className="font-black text-orange-600">₺{((seciliBarem.fiyat * depozitoOrani) / 100).toFixed(2)}</span>
          </div>
          <p className="text-[10px] text-gray-400 italic text-center mt-3">
             * Depozito, katılımınızı onaylamak için peşin alınır.
          </p>
        </div>

        <Link
          href={`/katil/${seciliBarem.id}`}
          className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-3 group"
        >
          ŞİMDİ KATIL
          <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
        </Link>

        <div className="mt-4 flex items-center justify-center gap-2 text-gray-400">
          <ShieldCheck size={16} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Güvenli Escrow Ödeme</span>
        </div>
      </div>
    </div>
  )
}