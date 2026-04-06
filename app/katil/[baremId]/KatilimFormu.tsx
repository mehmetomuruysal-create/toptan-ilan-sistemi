"use client"
import { useState, useEffect } from "react"
import { CreditCard, MapPin, ShoppingBag, ArrowRight, CheckCircle2, Plus } from "lucide-react"
import AddressModal from "@/components/AddressModal"

export default function KatilimFormu({ barem, ilan, adresler: ilkAdresler }: any) {
  const [step, setStep] = useState(1)
  const [adet, setAdet] = useState(barem.miktar)
  const [adresler, setAdresler] = useState(ilkAdresler)
  const [seciliAdres, setSeciliAdres] = useState("")
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false)

  // Sayfa ilk açıldığında varsa varsayılan adresi seç
  useEffect(() => {
    const varsayilan = adresler.find((a: any) => a.isVarsayilanTeslimat)
    if (varsayilan) setSeciliAdres(varsayilan.id)
    else if (adresler.length > 0) setSeciliAdres(adresler[0].id)
  }, [adresler])

  // Yeni adres eklendiğinde listeyi güncellemek için
  const yeniAdresleriGetir = async () => {
    try {
      const res = await fetch("/api/adres/liste")
      if (res.ok) {
        const data = await res.json()
        setAdresler(data)
        if (data.length > 0) {
          setSeciliAdres(data[data.length - 1].id)
        }
      }
    } catch (error) {
      console.error("Adresler güncellenirken hata oluştu:", error)
    }
  }

  const toplamTutar = adet * barem.fiyat
  const depozitoTutari = (toplamTutar * ilan.depozitoOrani) / 100

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Progress Bar */}
      <div className="flex h-2 bg-gray-100">
        <div className={`transition-all duration-500 bg-blue-600 ${step === 1 ? 'w-1/3' : step === 2 ? 'w-2/3' : 'w-full'}`} />
      </div>

      <div className="p-8">
        {/* ADIM 1: ADET SEÇİMİ */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="flex items-center gap-3 mb-2">
              <ShoppingBag className="text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Kaç adet alacaksınız?</h2>
            </div>
            <p className="text-gray-500 text-sm">Bu barem için minimum <strong>{barem.miktar} adet</strong> girmelisiniz.</p>
            
            <input 
              type="number" 
              min={barem.miktar}
              value={adet}
              onChange={(e) => setAdet(parseInt(e.target.value) || 0)}
              className="w-full text-4xl font-black p-6 border-2 border-gray-100 rounded-2xl focus:border-blue-600 focus:outline-none transition-colors"
            />
            
            <div className="bg-blue-50 p-4 rounded-xl">
              <div className="flex justify-between text-sm mb-1 text-blue-700 font-medium">
                <span>Birim Fiyat:</span>
                <span>₺{barem.fiyat}</span>
              </div>
              <div className="flex justify-between text-lg font-black text-blue-900">
                <span>Toplam:</span>
                <span>₺{toplamTutar.toLocaleString()}</span>
              </div>
            </div>

            <button 
              onClick={() => setStep(2)}
              disabled={adet < barem.miktar}
              className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all disabled:opacity-50"
            >
              Teslimat Adresi Seç <ArrowRight size={20} />
            </button>
          </div>
        )}

        {/* ADIM 2: ADRES SEÇİMİ */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MapPin className="text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">Teslimat Adresi</h2>
              </div>
              <button 
                onClick={() => setIsAddressModalOpen(true)}
                className="flex items-center gap-1 text-sm font-bold text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-all"
              >
                <Plus size={16} /> Yeni Ekle
              </button>
            </div>

            <div className="grid gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {adresler.map((adres: any) => (
                <div 
                  key={adres.id}
                  onClick={() => setSeciliAdres(adres.id)}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${seciliAdres === adres.id ? 'border-blue-600 bg-blue-50' : 'border-gray-100 hover:border-gray-200'}`}
                >
                  <div className="flex justify-between font-bold">
                    <span className="text-gray-900">{adres.baslik}</span>
                    {seciliAdres === adres.id && <CheckCircle2 size={20} className="text-blue-600" />}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{adres.adresSatiri} {adres.ilce}/{adres.il}</p>
                </div>
              ))}
              
              {adresler.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-gray-100 rounded-2xl">
                  <p className="text-gray-400 text-sm mb-4">Henüz kayıtlı bir adresiniz bulunmuyor.</p>
                  <button 
                    onClick={() => setIsAddressModalOpen(true)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-blue-700 shadow-lg"
                  >
                    İlk Adresimi Ekle
                  </button>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 py-4 font-bold text-gray-500 bg-gray-100 rounded-2xl">Geri</button>
              <button 
                onClick={() => setStep(3)}
                disabled={!seciliAdres}
                className="flex-[2] bg-gray-900 text-white py-4 rounded-2xl font-bold disabled:opacity-50"
              >
                Ödeme Özetine Geç
              </button>
            </div>
          </div>
        )}

        {/* ADIM 3: ÖDEME ÖZETİ */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="flex items-center gap-3">
              <CreditCard className="text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Ödeme Özeti</h2>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6 space-y-4 border border-gray-100">
              <div className="flex justify-between text-gray-600 text-sm">
                <span>Ürün Toplam ({adet} adet)</span>
                <span className="font-semibold text-gray-900">₺{toplamTutar.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-4 border-y border-dashed border-gray-200">
                <div className="leading-tight">
                  <span className="block font-bold text-gray-900">Ödenecek Depozito</span>
                  <span className="text-xs text-orange-600 font-medium">Toplamın %{ilan.depozitoOrani}'i</span>
                </div>
                <span className="text-3xl font-black text-blue-600">₺{depozitoTutari.toLocaleString()}</span>
              </div>
              <p className="text-[11px] text-gray-400 text-center leading-relaxed">
                Kalan ₺{(toplamTutar - depozitoTutari).toLocaleString()} tutarı, hedef sayıya ulaşıldığında ve ürünler kargolanmadan önce tahsil edilecektir.
              </p>
            </div>

            <button 
              className="w-full bg-green-600 text-white py-5 rounded-2xl font-black text-xl hover:bg-green-700 shadow-xl shadow-green-100 transition-all flex items-center justify-center gap-3"
            >
              ÖDEMEYİ TAMAMLA
            </button>
            <button onClick={() => setStep(2)} className="w-full py-2 text-sm text-gray-400 font-medium hover:text-gray-600 transition-colors">Adresi Değiştir</button>
          </div>
        )}
      </div>

      <AddressModal 
        isOpen={isAddressModalOpen} 
        onClose={() => {
          setIsAddressModalOpen(false)
          yeniAdresleriGetir()
        }} 
      />
    </div>
  )
}