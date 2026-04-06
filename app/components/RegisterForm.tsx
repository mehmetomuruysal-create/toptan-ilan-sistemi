"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { registerUser } from "@/app/actions/register"

export default function RegisterForm() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [form, setForm] = useState({
    hesapTuru: "ALICI",
    ad: "", soyad: "", email: "", 
    ulkeKodu: "+90",           // ✅ EKLENDI: varsayılan ülke kodu
    telefon: "", 
    password: "", confirmPassword: "",
    firmaAdi: "", vergiNo: "", vergiDairesi: "", adres: "", teslimatAdresi: "",
    kvkk: false
  })

  const updateForm = (field: string, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!form.ad.trim()) {
      setError("Ad alanı zorunludur.")
      return
    }
    if (!form.soyad.trim()) {
      setError("Soyad alanı zorunludur.")
      return
    }
    if (form.password !== form.confirmPassword) {
      setError("Şifreler eşleşmiyor.")
      return
    }
    // Telefon kontrolü: 10 haneli olmalı (sadece rakam)
    if (!/^\d{10}$/.test(form.telefon)) {
      setError("Telefon numarası başında sıfır olmadan 10 haneli olmalıdır.")
      return
    }
    if (form.hesapTuru === "SATICI" && form.vergiNo.length !== 10) {
      setError("Vergi Numarası 10 haneli olmalıdır.")
      return
    }

    setLoading(true)
    // backend'e ulkeKodu da gönderiliyor
    const result = await registerUser(form)
    
    if (result.success) {
      router.push("/giris?kayit=basarili")
    } else {
      setError(result.error || "Bir hata oluştu")
      setLoading(false)
    }
  }

  const inputClass = "w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 text-gray-800"

  return (
    <div className="w-full max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
      <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">Mingax'a Katıl</h1>
      <p className="text-center text-gray-500 mb-8">Profesyonel toptan alışveriş ağına hoş geldiniz.</p>

      {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm">{error}</div>}

      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-gray-700 mb-4 text-center">Hesap Türünüzü Seçin</h2>
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => { updateForm("hesapTuru", "ALICI"); setStep(2); }} className="py-12 border-2 border-gray-200 rounded-xl hover:border-blue-600 hover:bg-blue-50 transition group">
              <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">🛒</div>
              <div className="font-bold text-gray-700 group-hover:text-blue-700">ALICI OLUYORUM</div>
              <div className="text-xs text-gray-400 mt-2">Toptan fiyatına ürün almak istiyorum</div>
            </button>
            <button onClick={() => { updateForm("hesapTuru", "SATICI"); setStep(2); }} className="py-12 border-2 border-gray-200 rounded-xl hover:border-green-600 hover:bg-green-50 transition group">
              <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">🏪</div>
              <div className="font-bold text-gray-700 group-hover:text-green-700">SATICI OLUYORUM</div>
              <div className="text-xs text-gray-400 mt-2">Ürünlerimi toptan satmak istiyorum</div>
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <form onSubmit={handleSubmit} className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between mb-6 pb-4 border-b">
            <span className="font-semibold text-gray-700">{form.hesapTuru === "ALICI" ? "🛒 Alıcı Kaydı" : "🏪 Satıcı Kaydı"}</span>
            <button type="button" onClick={() => setStep(1)} className="text-sm text-blue-600 hover:underline">Tür Değiştir</button>
          </div>

          {/* AD - SOYAD */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <input type="text" placeholder="Ad" required className={inputClass} value={form.ad} onChange={e => updateForm("ad", e.target.value)} />
            <input type="text" placeholder="Soyad" required className={inputClass} value={form.soyad} onChange={e => updateForm("soyad", e.target.value)} />
          </div>
          
          {/* TELEFON + ÜLKE KODU */}
          <div className="flex gap-3">
            <div className="w-1/3">
              <select className={inputClass} value={form.ulkeKodu} onChange={e => updateForm("ulkeKodu", e.target.value)}>
                <option value="+90">🇹🇷 Türkiye (+90)</option>
                <option value="+1">🇺🇸 ABD (+1)</option>
                <option value="+44">🇬🇧 İngiltere (+44)</option>
                <option value="+49">🇩🇪 Almanya (+49)</option>
              </select>
            </div>
            <div className="w-2/3">
              <input type="tel" placeholder="Telefon (10 haneli, başında 0 olmadan)" required className={inputClass} value={form.telefon} onChange={e => updateForm("telefon", e.target.value.replace(/\D/g, '').slice(0,10))} />
            </div>
          </div>

          <input type="email" placeholder="E-posta Adresiniz" required className={inputClass} value={form.email} onChange={e => updateForm("email", e.target.value)} />

          {/* Şifre */}
          <div className="relative">
            <input type={showPassword ? "text" : "password"} placeholder="Şifreniz" required minLength={8} className={inputClass} value={form.password} onChange={e => updateForm("password", e.target.value)} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>

          {/* Şifre Tekrar */}
          <div className="relative">
            <input type={showConfirm ? "text" : "password"} placeholder="Şifre Tekrar" required minLength={8} className={inputClass} value={form.confirmPassword} onChange={e => updateForm("confirmPassword", e.target.value)} />
            <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
              {showConfirm ? "🙈" : "👁️"}
            </button>
          </div>

          {/* SATICI ÖZEL */}
          {form.hesapTuru === "SATICI" && (
            <div className="p-5 bg-gray-50 rounded-xl space-y-4 border border-gray-200 mt-6">
              <h3 className="font-semibold text-gray-700 mb-2">Kurumsal Bilgiler</h3>
              <input type="text" placeholder="Firma / Şirket Adı" required className={inputClass} value={form.firmaAdi} onChange={e => updateForm("firmaAdi", e.target.value)} />
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="Vergi Dairesi" required className={inputClass} value={form.vergiDairesi} onChange={e => updateForm("vergiDairesi", e.target.value)} />
                <input type="text" placeholder="Vergi Numarası (10 Hane)" required maxLength={10} className={inputClass} value={form.vergiNo} onChange={e => updateForm("vergiNo", e.target.value.replace(/\D/g, ''))} />
              </div>
              <textarea placeholder="Firma Adresiniz" required rows={2} className={inputClass} value={form.adres} onChange={e => updateForm("adres", e.target.value)} />
            </div>
          )}

          {/* KVKK */}
          <div className="flex items-start gap-3 mt-6">
            <input type="checkbox" id="kvkk" required checked={form.kvkk} onChange={e => updateForm("kvkk", e.target.checked)} className="mt-1 w-4 h-4 text-blue-600 rounded" />
            <label htmlFor="kvkk" className="text-sm text-gray-600 cursor-pointer">
              <a href="#" className="text-blue-600 hover:underline">KVKK Aydınlatma Metni</a>'ni ve <a href="#" className="text-blue-600 hover:underline">Üyelik Sözleşmesi</a>'ni okudum, onaylıyorum.
            </label>
          </div>

          <button type="submit" disabled={loading || !form.kvkk} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition disabled:opacity-50 mt-4 shadow-md">
            {loading ? "Kaydınız Oluşturuluyor..." : "KAYIT OL"}
          </button>
        </form>
      )}
    </div>
  )
}