"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2, Package, Info } from "lucide-react"

export default function IlanEkleSayfasi() {
  const router = useRouter()
  const [yukleniyor, setYukleniyor] = useState(false)
  const [hata, setHata] = useState("")

  // Dinamik Barem State'i (En az 1 tane boş barem ile başlar)
  const [baremler, setBaremler] = useState([{ miktar: "", fiyat: "" }])

  const baremEkle = () => {
    setBaremler([...baremler, { miktar: "", fiyat: "" }])
  }

  const baremSil = (index: number) => {
    if (baremler.length === 1) return // En az 1 barem kalmak zorunda
    const yeniBaremler = [...baremler]
    yeniBaremler.splice(index, 1)
    setBaremler(yeniBaremler)
  }

  const baremDegistir = (index: number, alan: "miktar" | "fiyat", deger: string) => {
    const yeniBaremler = [...baremler]
    yeniBaremler[index][alan] = deger
    setBaremler(yeniBaremler)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setYukleniyor(true)
    setHata("")

    const formData = new FormData(e.currentTarget)
    
    // Normal inputları obje haline getir
    const data = Object.fromEntries(formData.entries())
    
    // Dinamik baremleri objeye ekle
    const payload = {
      ...data,
      baremler: baremler.map(b => ({ miktar: Number(b.miktar), fiyat: Number(b.fiyat) }))
    }

    try {
      const res = await fetch("/api/ilan-ekle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      const sonuc = await res.json()

      if (res.ok) {
        alert("İlan başarıyla oluşturuldu!")
        router.push("/") // Veya satıcı paneline yönlendir
      } else {
        setHata(sonuc.hata || "Bir hata oluştu")
      }
    } catch (error) {
      setHata("Sunucu ile bağlantı kurulamadı.")
    } finally {
      setYukleniyor(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 my-8 bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="flex items-center gap-3 mb-8 pb-4 border-b">
        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
          <Package size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Yeni İlan Oluştur</h1>
          <p className="text-gray-500 text-sm">Grup alım sistemine (C2M) yeni bir ürün ekleyin.</p>
        </div>
      </div>

      {hata && <div className="p-4 bg-red-50 text-red-600 rounded-xl mb-6 font-medium">{hata}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* TEMEL BİLGİLER */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">Temel Bilgiler</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">İlan Başlığı</label>
              <input type="text" name="baslik" required className="mt-1 w-full p-2.5 border rounded-xl" placeholder="Örn: 10.000 mAh Taşınabilir Şarj Aleti" />
            </div>
            
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Ürün Açıklaması</label>
              <textarea name="aciklama" rows={3} className="mt-1 w-full p-2.5 border rounded-xl resize-none" placeholder="Ürün detaylarını buraya girin..."></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Kategori</label>
              <select name="kategori" className="mt-1 w-full p-2.5 border rounded-xl bg-white">
                <option value="elektronik">Elektronik</option>
                <option value="giyim">Giyim & Moda</option>
                <option value="ev-yasam">Ev & Yaşam</option>
                <option value="diger">Diğer</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Ürün URL (Görsel vb.)</label>
              <input type="url" name="urunUrl" className="mt-1 w-full p-2.5 border rounded-xl" placeholder="https://..." />
            </div>
          </div>
        </div>

        {/* SATIŞ VE BAREM AYARLARI */}
        <div className="space-y-4 pt-4 border-t">
          <h2 className="text-lg font-semibold text-gray-800">Satış ve Hedef Ayarları</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Piyasa Perakende Fiyatı (TL)</label>
              <input type="number" name="perakendeFiyat" required className="mt-1 w-full p-2.5 border rounded-xl" placeholder="Örn: 500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Kampanya Bitiş Tarihi</label>
              <input type="date" name="bitisTarihi" required className="mt-1 w-full p-2.5 border rounded-xl" />
            </div>
          </div>

          {/* DİNAMİK BAREM BÖLÜMÜ */}
          <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-semibold text-blue-900">Miktar ve Fiyat Baremleri</h3>
                <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                  <Info size={14} /> Hedeflenen toplam sayı ve toptan fiyat son bareme göre otomatik belirlenir.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {baremler.map((barem, index) => (
                <div key={index} className="flex items-center gap-3 bg-white p-3 rounded-xl border shadow-sm relative group">
                  <span className="w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-600 font-bold rounded-lg text-sm">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 block mb-1">Ulaşılması Gereken Adet</label>
                    <input 
                      type="number" 
                      value={barem.miktar} 
                      onChange={(e) => baremDegistir(index, "miktar", e.target.value)}
                      placeholder="Örn: 100" 
                      required 
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 block mb-1">Bu Adetteki Birim Fiyat (TL)</label>
                    <input 
                      type="number" 
                      value={barem.fiyat} 
                      onChange={(e) => baremDegistir(index, "fiyat", e.target.value)}
                      placeholder="Örn: 450" 
                      required 
                      className="w-full p-2 border rounded-lg"
                    />
                  </div>
                  {baremler.length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => baremSil(index)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg mt-5 transition"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button 
              type="button" 
              onClick={baremEkle}
              className="mt-4 flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-100/50 hover:bg-blue-100 px-4 py-2 rounded-lg transition"
            >
              <Plus size={16} /> Yeni Barem Ekle
            </button>
          </div>
        </div>

        {/* MİNİMUM ALIM LİMİTLERİ */}
        <div className="space-y-4 pt-4 border-t">
          <h2 className="text-lg font-semibold text-gray-800">Minimum Alım Limitleri</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Bireysel Müşteri</label>
              <input type="number" name="minMiktarBireysel" defaultValue={1} className="mt-1 w-full p-2.5 border rounded-xl" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">KOBİ Müşteri</label>
              <input type="number" name="minMiktarKobi" defaultValue={5} className="mt-1 w-full p-2.5 border rounded-xl" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Kurumsal Müşteri</label>
              <input type="number" name="minMiktarKurumsal" defaultValue={20} className="mt-1 w-full p-2.5 border rounded-xl" />
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={yukleniyor}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:opacity-90 transition disabled:opacity-50 mt-8"
        >
          {yukleniyor ? "İlan Oluşturuluyor..." : "İlanı Yayına Al"}
        </button>
      </form>
    </div>
  )
}