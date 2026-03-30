"use client"
import { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { requestPasswordReset } from "@/app/actions/password-actions"

export default function LoginModal({ isOpen, onClose, onOpenRegister }: { isOpen: boolean, onClose: () => void, onOpenRegister: () => void }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [successMsg, setSuccessMsg] = useState("")
  const[showPassword, setShowPassword] = useState(false)

  // Görünüm State'i: "login" veya "forgot"
  const [view, setView] = useState<"login" | "forgot">("login")

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else {
      document.body.style.overflow = 'unset'
      setTimeout(() => { setView("login"); setError(""); setSuccessMsg(""); }, 300)
    }
    return () => { document.body.style.overflow = 'unset' }
  },[isOpen])

  if (!isOpen) return null

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(""); setLoading(true)

    const result = await signIn("credentials", { email, password, redirect: false })

    if (result?.error) {
      setError("Giriş başarısız. Bilgilerinizi yanlış girmiş veya e-posta adresinizi henüz onaylamamış olabilirsiniz.")
      setLoading(false)
    } else {
      onClose()
      router.refresh()
    }
  }

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(""); setSuccessMsg(""); setLoading(true)

    const result = await requestPasswordReset(email)
    if (result.success) {
      setSuccessMsg("Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.")
    } else {
      setError(result.error || "Bir hata oluştu.")
    }
    setLoading(false)
  }

  const inputClass = "w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 sm:p-10 animate-in zoom-in-95 duration-200 overflow-hidden">
        
        <button onClick={onClose} className="absolute top-6 right-6 w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center">✕</button>

        {view === "login" ? (
          <div className="animate-in slide-in-from-left-4 duration-300">
            <div className="text-center mb-8">
              <div className="text-4xl mx-auto mb-4">🔐</div>
              <h1 className="text-2xl font-extrabold text-gray-900">Tekrar Hoş Geldiniz</h1>
            </div>

            {error && <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 text-sm">{error}</div>}

            <form onSubmit={handleLogin} className="space-y-5">
              <input type="email" placeholder="E-posta Adresi" required className={inputClass} value={email} onChange={e => setEmail(e.target.value)} />
              <div>
                <label className="text-sm font-semibold text-gray-700 ml-1">Şifre</label>
                <div className="relative mt-1.5">
                  <input type={showPassword ? "text" : "password"} placeholder="••••••••" required className={inputClass} value={password} onChange={e => setPassword(e.target.value)} />
                  <button type="button" onMouseDown={() => setShowPassword(true)} onMouseUp={() => setShowPassword(false)} className="absolute right-4 top-3.5 text-gray-400">👁️</button>
                </div>
                {/* Şifremi unuttum artık input'un altında */}
                <div className="flex justify-end mt-2">
                  <button type="button" onClick={() => setView("forgot")} className="text-xs text-blue-600 font-medium hover:underline">Şifremi Unuttum</button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-black transition-all disabled:opacity-50">
                {loading ? "Bekleyin..." : "GİRİŞ YAP"}
              </button>
            </form>
            <div className="text-center mt-6 text-sm text-gray-600">
              Hesabınız yok mu? <button onClick={() => { onClose(); onOpenRegister(); }} className="text-blue-600 font-bold hover:underline">Kayıt Olun</button>
            </div>
          </div>
        ) : (
          <div className="animate-in slide-in-from-right-4 duration-300">
            <div className="text-center mb-8">
              <div className="text-4xl mx-auto mb-4">📬</div>
              <h1 className="text-2xl font-extrabold text-gray-900">Şifrenizi mi Unuttunuz?</h1>
              <p className="text-sm text-gray-500 mt-2">E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.</p>
            </div>

            {error && <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 text-sm">{error}</div>}
            {successMsg && <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-6 text-sm">{successMsg}</div>}

            <form onSubmit={handleForgot} className="space-y-5">
              <input type="email" placeholder="Kayıtlı E-posta Adresiniz" required className={inputClass} value={email} onChange={e => setEmail(e.target.value)} />
              
              <button type="submit" disabled={loading || !!successMsg} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50">
                {loading ? "Gönderiliyor..." : "Sıfırlama Linki Gönder"}
              </button>
            </form>
            <div className="text-center mt-6">
              <button onClick={() => setView("login")} className="text-sm text-gray-500 hover:text-gray-900 font-medium">← Giriş Ekranına Dön</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}