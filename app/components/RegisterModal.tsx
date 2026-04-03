"use client"
import { useState, useEffect } from "react"
import { registerUser } from "@/app/actions/register"

export default function RegisterModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const[step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [form, setForm] = useState({
    hesapTuru: "ALICI",
    ad: "", soyad: "", email: "", ulkeKodu: "+90", telefon: "", password: "", confirmPassword: "",
    cinsiyet: "", sozlesmeOnay: false, kampanyaOnay: false,
    firmaAdi: "", vergiNo: "", vergiDairesi: "", adres: "", teslimatAdresi: ""
  })

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = 'unset'
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])

  if (!isOpen) return null

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
      setError("Şifreler eşleşmiyor! Lütfen aynı şifreyi tekrar girin.")
      return
    }
    if (form.telefon.length !== 10) {
      setError("Lütfen telefon numarasını başında sıfır olmadan 10 haneli olarak giriniz.")
      return
    }
    if (form.hesapTuru === "SATICI" && form.vergiNo.length !== 10) {
      setError("Vergi Numarası tam olarak 10 haneli olmalıdır.")
      return
    }

    setLoading(true)
    const result = await registerUser(form)
    
    if (result.success) {
      setSuccess(true)
      setTimeout(() => { onClose(); setSuccess(false); setStep(1); }, 3000)
    } else {
      setError(result.error || "Beklenmeyen bir hata oluştu.")
      setLoading(false)
    }
  }

  const inputClass = "w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-300 scrollbar-hide">
        <button onClick={onClose} className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center transition-colors">✕</button>

        {success ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">✓</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Kayıt Başarılı!</h2>
            <p className="text-gray-500">Aramıza hoş geldiniz. Şimdi giriş yapabilirsiniz.</p>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Üye Ol</h1>
              <p className="text-sm text-gray-500 mt-1">Mingax'a Katıl</p>
            </div>

            {error && <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-5 text-sm">{error}</div>}

            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-sm font-semibold text-gray-400 uppercase text-center mb-2">Hesap Türünüzü Seçin</h2>
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => { updateForm("hesapTuru", "ALICI"); setStep(2); }} className="p-6 border-2 border-gray-100 rounded-xl hover:border-blue-500 transition-all bg-white text-center">
                    <div className="text-3xl mb-2">🛒</div>
                    <div className="font-bold text-gray-900 text-sm">ALICI OLUYORUM</div>
                  </button>
                  <button onClick={() => { updateForm("hesapTuru", "SATICI"); setStep(2); }} className="p-6 border-2 border-gray-100 rounded-xl hover:border-green-500 transition-all bg-white text-center">
                    <div className="text-3xl mb-2">🏪</div>
                    <div className="font-bold text-gray-900 text-sm">SATICI OLUYORUM</div>
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
                  <span className="font-bold text-gray-800">{form.hesapTuru === "ALICI" ? "🛒 Alıcı Kaydı" : "🏪 Satıcı Kaydı"}</span>
                  <button type="button" onClick={() => setStep(1)} className="text-xs text-blue-600 hover:underline">Tür Değiştir</button>
                </div>

                {/* AD - SOYAD */}
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" placeholder="Ad" required className={inputClass} value={form.ad} onChange={e => updateForm("ad", e.target.value)} />
                  <input type="text" placeholder="Soyad" required className={inputClass} value={form.soyad} onChange={e => updateForm("soyad", e.target.value)} />
                </div>
                
                <input type="email" placeholder="E-posta Adresi" required className={inputClass} value={form.email} onChange={e => updateForm("email", e.target.value)} />

                {/* Telefon */}
                <div>
                  <div className="flex gap-3">
                    <div className="w-1/3">
                      <select className={`${inputClass} appearance-none cursor-pointer`} value={form.ulkeKodu} onChange={e => updateForm("ulkeKodu", e.target.value)}>
                        <option value="+90">TR (+90)</option>
                        <option value="+1">US (+1)</option>
                        <option value="+44">UK (+44)</option>
                        <option value="+49">DE (+49)</option>
                      </select>
                    </div>
                    <div className="w-2/3">
                      <input type="tel" placeholder="Telefon Numarası" required maxLength={10} className={inputClass} value={form.telefon} onChange={e => updateForm("telefon", e.target.value.replace(/\D/g, ''))} />
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 ml-1">Başına 0 koymadan 10 haneli giriniz (Örn: 5551234567)</p>
                </div>

                {/* Şifre */}
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} placeholder="Şifre" required minLength={8} className={inputClass} value={form.password} onChange={e => updateForm("password", e.target.value)} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600">
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>

                {/* Şifre Tekrar */}
                <div className="relative">
                  <input type={showConfirmPassword ? "text" : "password"} placeholder="Şifre Tekrar" required minLength={8} className={inputClass} value={form.confirmPassword} onChange={e => updateForm("confirmPassword", e.target.value)} />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600">
                    {showConfirmPassword ? "🙈" : "👁️"}
                  </button>
                </div>

                {/* Cinsiyet (Alıcı) */}
                {form.hesapTuru === "ALICI" && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">Cinsiyet (İsteğe Bağlı)</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button type="button" onClick={() => updateForm("cinsiyet", "Kadın")} className={`py-2 rounded-lg border text-sm font-medium transition-colors ${form.cinsiyet === "Kadın" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>Kadın</button>
                      <button type="button" onClick={() => updateForm("cinsiyet", "Erkek")} className={`py-2 rounded-lg border text-sm font-medium transition-colors ${form.cinsiyet === "Erkek" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>Erkek</button>
                    </div>
                  </div>
                )}

                {/* Satıcı Özel */}
                {form.hesapTuru === "SATICI" && (
                  <div className="p-4 bg-gray-50 rounded-xl space-y-3 border border-gray-100 mt-2">
                    <input type="text" placeholder="Firma Adı" required className={inputClass} value={form.firmaAdi} onChange={e => updateForm("firmaAdi", e.target.value)} />
                    <div className="grid grid-cols-2 gap-3">
                      <input type="text" placeholder="Vergi Dairesi" required className={inputClass} value={form.vergiDairesi} onChange={e => updateForm("vergiDairesi", e.target.value)} />
                      <input type="text" placeholder="Vergi No (10 Hane)" required maxLength={10} className={inputClass} value={form.vergiNo} onChange={e => updateForm("vergiNo", e.target.value.replace(/\D/g, ''))} />
                    </div>
                  </div>
                )}

                {/* Alıcı Teslimat Adresi */}
                {form.hesapTuru === "ALICI" && (
                  <textarea placeholder="Teslimat Adresiniz (Opsiyonel)" rows={2} className={inputClass} value={form.teslimatAdresi} onChange={e => updateForm("teslimatAdresi", e.target.value)} />
                )}

                {/* Onaylar */}
                <div className="space-y-3 mt-4">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input type="checkbox" required checked={form.sozlesmeOnay} onChange={e => updateForm("sozlesmeOnay", e.target.checked)} className="mt-1" />
                    <span className="text-xs text-gray-600"><a href="#" className="underline">Üyelik Sözleşmesi</a> şartlarını okudum ve kabul ediyorum.</span>
                  </label>
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.kampanyaOnay} onChange={e => updateForm("kampanyaOnay", e.target.checked)} className="mt-1" />
                    <span className="text-xs text-gray-600">Bana özel fırsat ve kampanyalardan haberdar olmak istiyorum.</span>
                  </label>
                </div>

                <button type="submit" disabled={loading || !form.sozlesmeOnay} className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-bold hover:bg-black transition-all disabled:opacity-50 mt-2">
                  {loading ? "Doğrulanıyor..." : "Kayıt Ol"}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  )
}