"use client"
import { useState } from "react"
import { CreditCard, MapPin, ShoppingBag, ArrowRight, CheckCircle2 } from "lucide-react"

export default function KatilimFormu({ barem, ilan, adresler }: any) {
  const [step, setStep] = useState(1)
  const [adet, setAdet] = useState(barem.miktar)
  const [seciliAdres, setSeciliAdres] = useState(adresler.find((a: any) => a.isVarsayilanTeslimat)?.id || "")

  const toplamTutar = adet * barem.fiyat
  const depozitoTutari = (toplamTutar * ilan.depozitoOrani) / 100

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Progress Bar */}
      <div className="flex h-2 bg-gray-100">
        <div className={`transition-all duration-500 bg-blue-600 ${step === 1 ? 'w-1/3' : step === 2 ? 'w-2/3' : 'w-full'}`} />
      </div>

      <div className="p-8">
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="flex items-center gap-3 mb-2">
              <ShoppingBag className="text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Kaç adet alacaksınız?</h2>
            </div>
            <p className="text-gray-500">Bu barem için minimum <strong>{barem.miktar} adet</strong> girmelisiniz.</p>
            
            <input 
              type="number" 
              min={barem.miktar}
              value={adet}
              onChange={(e) => setAdet(parseInt(e.target.value))}
              className="w-full text-4xl font-black p-6 border-2 border-gray-100 rounded-2xl focus:border-blue-600 focus:outline-none transition-colors"
            />
            
            <div className="bg-blue-50 p-4 rounded-xl">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-blue-700">Birim Fiyat:</span>
                <span className="font-bold text-blue-900">₺{barem.fiyat}</span>
              </div>
              <div className="flex justify-between text-lg">
                <span className="text-blue-700 font-bold">Toplam:</span>
                <span className="font-black text-blue-900">₺{toplamTutar.toLocaleString()}</span>
              </div>
            </div>

            <button 
              onClick={() => setStep(2)}
              disabled={adet < barem.miktar}
              className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all"
            >
              Teslimat Adresi Seç <ArrowRight size={20} />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="flex items-center gap-3">
              <MapPin className="text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Teslimat Adresi</h2>
            </div>

            <div className="grid gap-3">
              {adresler.map((adres: any) => (
                <div 
                  key={adres.id}
                  onClick={() => setSeciliAdres(adres.id)}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${seciliAdres === adres.id ? 'border-blue-600 bg-blue-50' : 'border-gray-100 hover:border-gray-200'}`}
                >
                  <div className="flex justify-between font-bold">
                    <span>{adres.baslik}</span>
                    {seciliAdres === adres.id && <CheckCircle2 size={20} className="text-blue-600" />}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{adres.adresSatiri} {adres.ilce}/{adres.il}</p>
                </div>
              ))}
              {adresler.length === 0 && (
                <p className="text-red-500">Henüz kayıtlı adresiniz yok. Lütfen profilinizden adres ekleyin.</p>
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 py-4 font-bold text-gray-500 bg-gray-100 rounded-2xl">Geri</button>
              <button 
                onClick={() => setStep(3)}
                disabled={!seciliAdres}
                className="flex-[2] bg-gray-900 text-white py-4 rounded-2xl font-bold"
              >
                Ödeme Özetine Geç
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="flex items-center gap-3">
              <CreditCard className="text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Ödeme Özeti</h2>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6 space-y-4 border border-gray-100">
              <div className="flex justify-between text-gray-600">
                <span>Ürün Toplam ({adet} adet)</span>
                <span>₺{toplamTutar.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-4 border-y border-dashed border-gray-200">
                <div className="leading-tight">
                  <span className="block font-bold text-gray-900">Ödenecek Depozito</span>
                  <span className="text-xs text-orange-600 font-medium">Toplamın %{ilan.depozitoOrani}'i</span>
                </div>
                <span className="text-3xl font-black text-blue-600">₺{depozitoTutari.toLocaleString()}</span>
              </div>
              <p className="text-[11px] text-gray-400 text-center">
                Kalan ₺{(toplamTutar - depozitoTutari).toLocaleString()} tutarı, hedef sayıya ulaşıldığında ve ürünler kargolanmadan önce tahsil edilecektir.
              </p>
            </div>

            <button 
              className="w-full bg-green-600 text-white py-5 rounded-2xl font-black text-xl hover:bg-green-700 shadow-xl shadow-green-100 transition-all flex items-center justify-center gap-3"
            >
              ÖDEMEYİ TAMAMLA
            </button>
            <button onClick={() => setStep(2)} className="w-full py-2 text-sm text-gray-400 font-medium">Adresi Değiştir</button>
          </div>
        )}
      </div>
    </div>
  )
}