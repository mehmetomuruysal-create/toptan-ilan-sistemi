"use client"
import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { registerUser } from "@/app/actions/register"

export default function RegisterModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [mounted, setMounted] = useState(false)
  const [step, setStep] = useState(1)
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
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = 'unset'
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])

  if (!mounted || !isOpen) return null

  const updateForm = (field: string, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!form.ad.trim()) return setError("Ad alanı zorunludur.")
    if (!form.soyad.trim()) return setError("Soyad alanı zorunludur.")
    if (form.password !== form.confirmPassword) return setError("Şifreler eşleşmiyor! Lütfen aynı şifreyi tekrar girin.")
    if (form.telefon.length !== 10) return setError("Lütfen telefon numarasını başında sıfır olmadan 10 haneli olarak giriniz.")
    if (form.hesapTuru === "SATICI" && form.vergiNo.length !== 10) return setError("Vergi Numarası tam olarak 10 haneli olmalıdır.")

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

  const inputClass = "w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"

  const modalContent = (
    <div 
      className="fixed inset-0 z-[99999] overflow-y-auto bg-gray-900/60 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-6">
        <div 
          className="relative w-full max-w-xl bg-white rounded-[2rem] shadow-2xl p-6 sm:p-8 md:p-10 my-8 text-left align-middle transform transition-all animate-in fade-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()} 
        >
          <button onClick={onClose} className="absolute top-6 right-6 w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-gray-700 flex items-center justify-center transition-colors">
            ✕
          </button>

          {success ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">✓</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Kayıt Başarılı!</h2>
              <p className="text-gray-500">Aramıza hoş geldiniz. Şimdi giriş yapabilirsiniz.</p>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="mx-auto w-16 h-16 bg-blue-50 rounded-2xl mb-4 flex items-center justify-center text-blue-600 border border-blue-100">
                  <span className="text-2xl">👋</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-black text-gray-950 uppercase tracking-tight italic">Üye Ol</h1>
                <p className="text-sm text-gray-500 mt-2 font-medium">Mingax Toptan Dünyasına Katılın</p>
              </div>

              {error && <div className="bg-red-50 border border-red-100 text-red-700 p-4 rounded-xl mb-6 text-sm font-medium">{error}</div>}

              {step === 1 && (
                <div className="space-y-4">
                  <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center mb-4">Hesap Türünüzü Seçin</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => { updateForm("hesapTuru", "ALICI"); setStep(2); }} className="p-6 border-2 border-gray-100 rounded-[1.5rem] hover:border-blue-500 hover:bg-blue-50/50 transition-all bg-white text-center group">
                      <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">🛒</div>
                      <div className="font-black text-gray-900 text-sm tracking-tight">ALICI OLUYORUM</div>
                    </button>
                    <button onClick={() => { updateForm("hesapTuru", "SATICI"); setStep(2); }} className="p-6 border-2 border-gray-100 rounded-[1.5rem] hover:border-green-500 hover:bg-green-50/50 transition-all bg-white text-center group">
                      <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">🏪</div>
                      <div className="font-black text-gray-900 text-sm tracking-tight">SATICI OLUYORUM</div>
                    </button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                    <span className="font-black text-gray-800 text-sm uppercase tracking-tight bg-gray-50 px-3 py-1.5 rounded-lg">
                      {form.hesapTuru === "ALICI" ? "🛒 Alıcı Kaydı" : "🏪 Satıcı Kaydı"}
                    </span>
                    <button type="button" onClick={() => setStep(1)} className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline">
                      Tür Değiştir
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" placeholder="Ad" required className={inputClass} value={form.ad} onChange={e => updateForm("ad", e.target.value)} />
                    <input type="text" placeholder="Soyad" required className={inputClass} value={form.soyad} onChange={e => updateForm("soyad", e.target.value)} />
                  </div>
                  
                  <input type="email" placeholder="E-posta Adresi" required className={inputClass} value={form.email} onChange={e => updateForm("email", e.target.value)} />

                  <div>
                    <div className="flex gap-3">
                      <div className="w-[110px] shrink-0">
                        <select className={`${inputClass} appearance-none cursor-pointer`} value={form.ulkeKodu} onChange={e => updateForm("ulkeKodu", e.target.value)}>
                          <option value="+90">TR (+90)</option>
                          <option value="+1">US (+1)</option>
                          <option value="+44">UK (+44)</option>
                          <option value="+49">DE (+49)</option>
                        </select>
                      </div>
                      <div className="flex-1">
                        <input type="tel" placeholder="Telefon Numarası" required maxLength={10} className={inputClass} value={form.telefon} onChange={e => updateForm("telefon", e.target.value.replace(/\D/g, ''))} />
                      </div>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1.5 ml-1 font-medium uppercase tracking-wider">Başına 0 koymadan 10 haneli giriniz</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                      <input type={showPassword ? "text" : "password"} placeholder="Şifre" required minLength={8} className={inputClass} value={form.password} onChange={e => updateForm("password", e.target.value)} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600">
                        {showPassword ? "🙈" : "👁️"}
                      </button>
                    </div>
                    <div className="relative">
                      <input type={showConfirmPassword ? "text" : "password"} placeholder="Şifre Tekrar" required minLength={8} className={inputClass} value={form.confirmPassword} onChange={e => updateForm("confirmPassword", e.target.value)} />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600">
                        {showConfirmPassword ? "🙈" : "👁️"}
                      </button>
                    </div>
                  </div>

                  {form.hesapTuru === "ALICI" && (
                    <div className="pt-2">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Cinsiyet (İsteğe Bağlı)</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button type="button" onClick={() => updateForm("cinsiyet", "Kadın")} className={`py-2.5 rounded-xl border text-sm font-bold transition-colors ${form.cinsiyet === "Kadın" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}>Kadın</button>
                        <button type="button" onClick={() => updateForm("cinsiyet", "Erkek")} className={`py-2.5 rounded-xl border text-sm font-bold transition-colors ${form.cinsiyet === "Erkek" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}>Erkek</button>
                      </div>
                    </div>
                  )}

                  {form.hesapTuru === "SATICI" && (
                    <div className="p-5 bg-gray-50/50 rounded-2xl space-y-4 border border-gray-100 mt-2">
                      <input type="text" placeholder="Firma Adı" required className={inputClass} value={form.firmaAdi} onChange={e => updateForm("firmaAdi", e.target.value)} />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input type="text" placeholder="Vergi Dairesi" required className={inputClass} value={form.vergiDairesi} onChange={e => updateForm("vergiDairesi", e.target.value)} />
                        <input type="text" placeholder="Vergi No (10 Hane)" required maxLength={10} className={inputClass} value={form.vergiNo} onChange={e => updateForm("vergiNo", e.target.value.replace(/\D/g, ''))} />
                      </div>
                    </div>
                  )}

                  {form.hesapTuru === "ALICI" && (
                    <textarea placeholder="Teslimat Adresiniz (Opsiyonel)" rows={2} className={inputClass} value={form.teslimatAdresi} onChange={e => updateForm("teslimatAdresi", e.target.value)} />
                  )}

                  <div className="bg-gray-50 p-4 rounded-xl space-y-3 mt-6 border border-gray-100">
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input type="checkbox" required checked={form.sozlesmeOnay} onChange={e => updateForm("sozlesmeOnay", e.target.checked)} className="mt-0.5 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      <span className="text-xs text-gray-600 font-medium leading-relaxed group-hover:text-gray-900 transition-colors"><a href="#" className="text-blue-600 hover:underline font-bold">Üyelik Sözleşmesi</a> şartlarını okudum ve kabul ediyorum.</span>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input type="checkbox" checked={form.kampanyaOnay} onChange={e => updateForm("kampanyaOnay", e.target.checked)} className="mt-0.5 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      <span className="text-xs text-gray-600 font-medium leading-relaxed group-hover:text-gray-900 transition-colors">Bana özel fırsat ve kampanyalardan haberdar olmak istiyorum.</span>
                    </label>
                  </div>

                  <button type="submit" disabled={loading || !form.sozlesmeOnay} className="w-full bg-blue-600 text-white py-4 rounded-xl font-black uppercase tracking-widest text-sm hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 transition-all disabled:opacity-50 disabled:hover:shadow-none mt-2">
                    {loading ? "Doğrulanıyor..." : "Kayıt Ol"}
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}