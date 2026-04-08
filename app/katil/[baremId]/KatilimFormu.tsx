"use client"
import { useState, useEffect } from "react"
import { CreditCard, MapPin, ShoppingBag, ArrowRight, CheckCircle2, Plus } from "lucide-react"
// Doğru yol ve doğru dosya adı (küçük harf address-modal)
import AddressModal from "../../../components/AddressModal"

export default function KatilimFormu({ barem, ilan, adresler: ilkAdresler }: any) {
  const [step, setStep] = useState(1)
  const [adet, setAdet] = useState(barem.miktar)
  const [adresler, setAdresler] = useState(ilkAdresler || [])
  const [seciliAdres, setSeciliAdres] = useState("")
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false)

  // Sayfa yüklendiğinde varsayılan adresi seç
  useEffect(() => {
    if (adresler.length > 0) {
      const varsayilan = adresler.find((a: any) => a.isVarsayilanTeslimat)
      setSeciliAdres(varsayilan ? varsayilan.id : adresler[0].id)
    }
  }, [adresler])

  // Yeni adres eklendiğinde listeyi güncelle
  const yeniAdresleriGetir = async () => {
    try {
      const res = await fetch("/api/adres/liste")
      if (res.ok) {
        const data = await res.json()
        setAdresler(data)
        if (data.length > 0) {
          // En son eklenen adresi seç
          setSeciliAdres(data[data.length - 1].id)
        }
      }
    } catch (error) {
      console.error("Adres listesi güncellenemedi:", error)
    }
  }

  const toplamTutar = adet * barem.fiyat
  const depozitoTutari = (toplamTutar * ilan.depozitoOrani) / 100

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
      {/* İlerleme Çubuğu */}
      <div className="flex h-2 bg-gray-100">
        <div className={`transition-all duration-500 bg-blue-600 ${step === 1 ? 'w-1/3' : step === 2 ? 'w-2/3' : 'w-full'}`} />
      </div>

      <div className="p-8">
        {/* ADIM 1: ADET SEÇİMİ */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="flex items-center gap-3 mb-2">
              <ShoppingBag className="text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Miktar Belirleyin</h2>
            </div>
            <p className="text-gray-500 text-sm">Bu barem için minimum <strong>{barem.miktar} adet</strong> sipariş vermelisiniz.</p>
            
            <input 
              type="number" 
              min={barem.miktar}
              value={adet}
              onChange={(e) => setAdet(Math.max(barem.miktar, parseInt(e.target.value) || 0))}
              className="w-full text-4xl font-black p-6 border-2 border-gray-100 rounded-2xl focus:border-blue-600 focus:outline-none transition-colors"
            />
            
            <div className="bg-blue-50 p-4 rounded-xl">
              <div className="flex justify-between text-sm mb-1 text-blue-700 font-medium">
                <span>Birim Fiyat:</span>
                <span>₺{barem.fiyat}</span>
              </div>
              <div className="flex justify-between text-lg font-black text-blue-900">
                <span>Toplam Tutar:</span>
                <span>₺{toplamTutar.toLocaleString()}</span>
              </div>
            </div>

            <button 
              onClick={() => setStep(2)}
              className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all"
            >
              Adres Bilgilerine Geç <ArrowRight size={20} />
            </button>
          </div>
        )}

        {/* ADIM 2: ADRES SEÇİMİ */}
       {/* ADIM 2: ADRES SEÇİMİ */}
{step === 2 && (
  <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
    <div className="flex items-center justify-between border-b pb-4">
      <div className="flex items-center gap-3">
        <div className="bg-blue-100 p-2 rounded-lg">
          <MapPin className="text-blue-600" size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Teslimat Adresi</h2>
          <p className="text-sm text-gray-500">Ürünlerin gönderileceği adresi seçin</p>
        </div>
      </div>
      <button 
        onClick={() => setIsAddressModalOpen(true)}
        className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:bg-blue-50 border border-blue-200 px-4 py-2 rounded-xl transition-all shadow-sm"
      >
        <Plus size={18} /> Yeni Adres Ekle
      </button>
    </div>

    <div className="grid gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar py-2">
      {adresler.map((adres: any) => (
        <div 
          key={adres.id}
          onClick={() => setSeciliAdres(adres.id)}
          className={`relative group p-5 rounded-2xl border-2 transition-all duration-200 cursor-pointer ${
            seciliAdres === adres.id 
            ? 'border-blue-600 bg-blue-50 shadow-md ring-2 ring-blue-600/10' 
            : 'border-gray-100 bg-white hover:border-blue-200 hover:shadow-sm'
          }`}
        >
          {/* Seçili İkonu (Sağ Üstte Kabarık) */}
          {seciliAdres === adres.id && (
            <div className="absolute -top-3 -right-3 bg-blue-600 text-white rounded-full p-1 shadow-lg border-2 border-white">
              <CheckCircle2 size={20} strokeWidth={3} />
            </div>
          )}

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${
                seciliAdres === adres.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                {adres.baslik}
              </span>
              <span className="font-bold text-gray-900">{adres.teslimAlacakKisi}</span>
            </div>
            
            <p className="text-sm text-gray-600 mt-2 leading-relaxed">
              {adres.adresSatiri}
            </p>
            <p className="text-sm font-medium text-gray-500 italic">
              {adres.ilce} / {adres.il}
            </p>
          </div>
        </div>
      ))}
      
      {adresler.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50">
          <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
            <MapPin className="text-gray-300" size={32} />
          </div>
          <p className="text-gray-500 font-medium mb-4">Henüz bir adres eklemediniz.</p>
          <button 
            onClick={() => setIsAddressModalOpen(true)}
            className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all"
          >
            İlk Adresimi Şimdi Ekle
          </button>
        </div>
      )}

    </div>

    <div className="flex gap-4 pt-4">
      <button 
        onClick={() => setStep(1)} 
        className="flex-1 py-4 font-bold text-gray-500 bg-gray-50 border border-gray-200 rounded-2xl hover:bg-gray-100 transition-colors"
      >
        Geri Dön
      </button>
      <button 
        onClick={() => setStep(3)}
        disabled={!seciliAdres}
        className="flex-[2] bg-gray-900 text-white py-4 rounded-2xl font-black text-lg hover:bg-black transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-xl shadow-gray-200 flex items-center justify-center gap-2"
      >
        Ödeme Özetine Geç <ArrowRight size={20} />
      </button>
    </div>
  </div>
)}
        {/* ADIM 3: ÖDEME ÖZETİ */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="flex items-center gap-3">
              <CreditCard className="text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Ödeme Onayı</h2>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6 space-y-4 border border-gray-100">
              <div className="flex justify-between text-gray-600 text-sm">
                <span>Sipariş Miktarı</span>
                <span className="font-semibold text-gray-900">{adet} Adet</span>
              </div>
              <div className="flex justify-between items-center py-5 border-y border-dashed border-gray-200">
                <div className="leading-tight">
                  <span className="block font-bold text-gray-900 text-lg">Depozito Tutarı</span>
                  <span className="text-[10px] text-orange-600 font-bold uppercase tracking-wider">Toplamın %{ilan.depozitoOrani}'i</span>
                </div>
                <span className="text-3xl font-black text-blue-600">₺{depozitoTutari.toLocaleString()}</span>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg text-[11px] text-blue-700 leading-relaxed text-center italic">
                Ürünler tedarik edilip kargolanmadan önce kalan ₺{(toplamTutar - depozitoTutari).toLocaleString()} tutarı için bilgilendirileceksiniz.
              </div>
            </div>

            <button 
              className="w-full bg-green-600 text-white py-5 rounded-2xl font-black text-xl hover:bg-green-700 shadow-xl shadow-green-100 transition-all flex items-center justify-center gap-3"
            >
              GÜVENLİ ÖDEME YAP
            </button>
            <button onClick={() => setStep(2)} className="w-full py-2 text-sm text-gray-400 font-medium hover:text-gray-600">Teslimat Adresini Düzenle</button>
          </div>
        )}
      </div>

      {/* MODAL ENTEGRASYONU */}
      <AddressModal 
        isOpen={isAddressModalOpen} 
        onClose={() => {
          setIsAddressModalOpen(false);
          yeniAdresleriGetir();
        }} 
      />
    </div>
  )
}