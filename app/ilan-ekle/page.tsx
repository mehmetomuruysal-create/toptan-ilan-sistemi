"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"

const KATEGORILER = [
  { value: "elektronik", label: "💻 Elektronik & Bilişim" },
  { value: "temizlik", label: "🧴 Temizlik & Hijyen" },
  { value: "ofis", label: "🖨 Ofis Malzemeleri" },
  { value: "hammadde", label: "🏭 Hammadde & Sanayi" },
  { value: "endustri", label: "🛠 Endüstriyel Ekipman" },
  { value: "ambalaj", label: "📦 Ambalaj & Lojistik" },
  { value: "spor", label: "🏋️ Spor & Yaşam" },
  { value: "gida", label: "🍽 Gıda & İçecek" },
  { value: "insaat", label: "🏗 İnşaat & Yapı" },
  { value: "saglik", label: "🏥 Sağlık & Medikal" },
  { value: "diger", label: "📦 Diğer" },
]

export default function IlanEklePage() {
  const router = useRouter()
  const [adim, setAdim] = useState(1)
  const [hata, setHata] = useState("")
  const [yukleniyor, setYukleniyor] = useState(false)

  const [form, setForm] = useState({
    // Adım 1
    urunUrl: "",
    baslik: "",
    aciklama: "",
    kategori: "diger",
    perakendeFiyat: "",
    toptanFiyat: "",
    // Adım 2
    hedefKitle: "hepsi",
    minMiktarBireysel: "1",
    minMiktarKobi: "5",
    minMiktarKurumsal: "20",
    hedefSayi: "",
    bitisTarihi: "",
    teslimatYontemi: "kargo",
    indirimOrani: "15",
    // Adım 3
    depozitoOrani: "30",
    sozlesmeOnay: false,
    vazgecmeOnay: false,
  })

  function guncelle(alan: string, deger: string | boolean) {
    setForm(prev => ({ ...prev, [alan]: deger }))
  }

  async function handleSubmit() {
    setYukleniyor(true)
    setHata("")
    const res = await fetch("/api/ilan-ekle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        perakendeFiyat: parseFloat(form.perakendeFiyat),
        toptanFiyat: parseFloat(form.toptanFiyat),
        hedefSayi: parseInt(form.hedefSayi),
        minMiktarBireysel: parseInt(form.minMiktarBireysel),
        minMiktarKobi: parseInt(form.minMiktarKobi),
        minMiktarKurumsal: parseInt(form.minMiktarKurumsal),
        indirimOrani: parseInt(form.indirimOrani),
        depozitoOrani: parseInt(form.depozitoOrani),
      }),
    })
    const data = await res.json()
    if (!res.ok) {
      setHata(data.hata || "Bir hata oluştu")
      setYukleniyor(false)
    } else {
      router.push("/")
    }
  }

  const indirimYuzde = form.perakendeFiyat && form.toptanFiyat
    ? Math.round((1 - parseFloat(form.toptanFiyat) / parseFloat(form.perakendeFiyat)) * 100)
    : 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-3xl mx-auto px-4 py-3 flex justify-between items-center">
          <a href="/" className="text-blue-600 font-bold text-xl">← Toptan İlan</a>
          <span className="text-sm text-gray-500">Adım {adim} / 4</span>
        </div>
      </nav>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex gap-2">
            {["Ürün Bilgisi", "İhale Koşulları", "Depozito", "Önizleme"].map((label, i) => (
              <div key={i} className="flex-1">
                <div className={`h-2 rounded-full ${i + 1 <= adim ? "bg-blue-600" : "bg-gray-200"}`} />
                <p className={`text-xs mt-1 text-center ${i + 1 === adim ? "text-blue-600 font-medium" : "text-gray-400"}`}>
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {hata && <p className="text-red-500 mb-4 bg-red-50 p-3 rounded-lg">{hata}</p>}

        {/* ── ADIM 1: ÜRÜN BİLGİSİ ── */}
        {adim === 1 && (
          <div className="bg-white rounded-xl shadow-sm border p-6 space-y-5">
            <h2 className="text-xl font-bold text-gray-800">📦 Ürün Bilgisi</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ürün URL'si <span className="text-gray-400">(opsiyonel)</span>
              </label>
              <input
                type="url"
                value={form.urunUrl}
                onChange={e => guncelle("urunUrl", e.target.value)}
                placeholder="https://www.trendyol.com/urun/..."
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-400 mt-1">Ürün linkini girin, bilgiler otomatik doldurulacak (yakında)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                İlan Başlığı <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.baslik}
                onChange={e => guncelle("baslik", e.target.value)}
                placeholder="Örn: Organik Zeytinyağı 5L Teneke"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
              <select
                value={form.kategori}
                onChange={e => guncelle("kategori", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {KATEGORILER.map(k => (
                  <option key={k.value} value={k.value}>{k.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ürün Açıklaması</label>
              <textarea
                value={form.aciklama}
                onChange={e => guncelle("aciklama", e.target.value)}
                placeholder="Ürün hakkında detaylı bilgi verin..."
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-400 mt-1">{form.aciklama.length} / 1000 karakter</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Perakende Fiyat (₺) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={form.perakendeFiyat}
                  onChange={e => guncelle("perakendeFiyat", e.target.value)}
                  placeholder="250"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Toptan Fiyat (₺) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={form.toptanFiyat}
                  onChange={e => guncelle("toptanFiyat", e.target.value)}
                  placeholder="180"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {indirimYuzde > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-700 text-sm font-medium">
                ✅ %{indirimYuzde} indirim — Alıcılar bu fiyatla alacak
              </div>
            )}

            <button
              onClick={() => {
                if (!form.baslik || !form.perakendeFiyat || !form.toptanFiyat) {
                  setHata("Başlık ve fiyat alanları zorunludur")
                  return
                }
                if (parseFloat(form.toptanFiyat) >= parseFloat(form.perakendeFiyat)) {
                  setHata("Toptan fiyat perakende fiyattan düşük olmalı")
                  return
                }
                setHata("")
                setAdim(2)
              }}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Devam Et →
            </button>
          </div>
        )}

        {/* ── ADIM 2: İHALE KOŞULLARI ── */}
        {adim === 2 && (
          <div className="bg-white rounded-xl shadow-sm border p-6 space-y-5">
            <h2 className="text-xl font-bold text-gray-800">⚙️ İhale Koşulları</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hedef Katılımcı Kitlesi</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { value: "hepsi", label: "🌐 Hepsi" },
                  { value: "bireysel", label: "👤 Bireysel" },
                  { value: "kobi", label: "🏪 KOBİ" },
                  { value: "kurumsal", label: "🏢 Kurumsal" },
                ].map(k => (
                  <button
                    key={k.value}
                    type="button"
                    onClick={() => guncelle("hedefKitle", k.value)}
                    className={`p-3 rounded-lg border-2 text-sm font-medium transition ${
                      form.hedefKitle === k.value
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {k.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Sipariş Miktarları</label>
              <div className="space-y-3">
                {[
                  { key: "minMiktarBireysel", label: "👤 Bireysel" },
                  { key: "minMiktarKobi", label: "🏪 KOBİ / Esnaf" },
                  { key: "minMiktarKurumsal", label: "🏢 Kurumsal" },
                ].map(item => (
                  <div key={item.key} className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 w-36">{item.label}</span>
                    <input
                      type="number"
                      value={form[item.key as keyof typeof form] as string}
                      onChange={e => guncelle(item.key, e.target.value)}
                      min="1"
                      className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-400">adet</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hedef Toplam Adet <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={form.hedefSayi}
                  onChange={e => guncelle("hedefSayi", e.target.value)}
                  placeholder="50"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bitiş Tarihi <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={form.bitisTarihi}
                  onChange={e => guncelle("bitisTarihi", e.target.value)}
                  min={new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teslimat Yöntemi</label>
              <select
                value={form.teslimatYontemi}
                onChange={e => guncelle("teslimatYontemi", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="kargo">🏠 Her adrese ayrı kargo</option>
                <option value="merkezi">📍 Merkezi teslim noktası</option>
                <option value="depo">🏭 Alıcı depoya teslim</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hedef İndirim Oranı: %{form.indirimOrani}
              </label>
              <input
                type="range"
                min="5"
                max="40"
                value={form.indirimOrani}
                onChange={e => guncelle("indirimOrani", e.target.value)}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>%5</span><span>%40</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setAdim(1)}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition"
              >
                ← Geri
              </button>
              <button
                onClick={() => {
                  if (!form.hedefSayi || !form.bitisTarihi) {
                    setHata("Hedef adet ve bitiş tarihi zorunludur")
                    return
                  }
                  setHata("")
                  setAdim(3)
                }}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Devam Et →
              </button>
            </div>
          </div>
        )}

        {/* ── ADIM 3: DEPOZİTO ── */}
        {adim === 3 && (
          <div className="bg-white rounded-xl shadow-sm border p-6 space-y-5">
            <h2 className="text-xl font-bold text-gray-800">💰 Depozito & Koşullar</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Depozito Oranı: %{form.depozitoOrani}
              </label>
              <input
                type="range"
                min="10"
                max="50"
                value={form.depozitoOrani}
                onChange={e => guncelle("depozitoOrani", e.target.value)}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>%10</span><span>%50</span>
              </div>
            </div>

            {form.toptanFiyat && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                <p className="font-medium text-gray-700">📊 Örnek Hesaplama</p>
                <div className="flex justify-between">
                  <span className="text-gray-500">Toptan fiyat</span>
                  <span className="font-medium">₺{form.toptanFiyat}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Katılım anında ödenecek</span>
                  <span className="font-medium text-orange-600">
                    ₺{(parseFloat(form.toptanFiyat) * parseInt(form.depozitoOrani) / 100).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">İhale kapandığında kalan</span>
                  <span className="font-medium">
                    ₺{(parseFloat(form.toptanFiyat) * (1 - parseInt(form.depozitoOrani) / 100)).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.vazgecmeOnay}
                  onChange={e => guncelle("vazgecmeOnay", e.target.checked)}
                  className="mt-1"
                />
                <span className="text-sm text-orange-800">
                  <strong>Vazgeçme Politikası:</strong> Katılımcı ihaleden çekilirse depozito iade edilmez ve platform güvence fonuna aktarılır. Bu kural ihale sayfasında açıkça belirtilir.
                </span>
              </label>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.sozlesmeOnay}
                  onChange={e => guncelle("sozlesmeOnay", e.target.checked)}
                  className="mt-1"
                />
                <span className="text-sm text-gray-700">
                  Platform <strong>Şartlar ve Koşullarını</strong> okudum ve kabul ediyorum.
                </span>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setAdim(2)}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition"
              >
                ← Geri
              </button>
              <button
                onClick={() => {
                  if (!form.vazgecmeOnay || !form.sozlesmeOnay) {
                    setHata("Lütfen tüm onay kutularını işaretleyin")
                    return
                  }
                  setHata("")
                  setAdim(4)
                }}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Önizleme →
              </button>
            </div>
          </div>
        )}

        {/* ── ADIM 4: ÖNİZLEME ── */}
        {adim === 4 && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">🔍 İlan Önizleme</h2>

              <div className="bg-gray-50 rounded-xl p-5 border">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-lg text-gray-800">{form.baslik}</h3>
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm font-medium">
                    %{indirimYuzde} indirim
                  </span>
                </div>
                {form.aciklama && <p className="text-gray-500 text-sm mb-3">{form.aciklama}</p>}
                <div className="flex gap-4 mb-3">
                  <div>
                    <p className="text-xs text-gray-400 line-through">₺{form.perakendeFiyat}</p>
                    <p className="text-2xl font-bold text-blue-600">₺{form.toptanFiyat}</p>
                  </div>
                  <div className="text-sm text-gray-500">
                    <p>Hedef: <strong>{form.hedefSayi} adet</strong></p>
                    <p>Bitiş: <strong>{form.bitisTarihi}</strong></p>
                    <p>Depozito: <strong>%{form.depozitoOrani}</strong></p>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                    👤 Bireysel min. {form.minMiktarBireysel} adet
                  </span>
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                    🏪 KOBİ min. {form.minMiktarKobi} adet
                  </span>
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                    🏢 Kurumsal min. {form.minMiktarKurumsal} adet
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setAdim(3)}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition"
              >
                ← Geri
              </button>
              <button
                onClick={handleSubmit}
                disabled={yukleniyor}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
              >
                {yukleniyor ? "Yayınlanıyor..." : "🚀 İlanı Yayınla"}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}