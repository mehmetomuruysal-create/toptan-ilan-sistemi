"use client"

import { signIn } from "next-auth/react"
import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2, CheckCircle2, AlertCircle, Eye, EyeOff } from "lucide-react"

function GirisForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const onay = searchParams.get("onay")
  const kayit = searchParams.get("kayit") // Kayıt sonrası yönlendirme için
  const autoLoginToken = searchParams.get("autoLoginToken")

  const [email, setEmail] = useState("")
  const [sifre, setSifre] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [hata, setHata] = useState("")
  const [yukleniyor, setYukleniyor] = useState(false)
  const [otomatikGirisYapiliyor, setOtomatikGirisYapiliyor] = useState(false)

  // Sihirli Bağlantı (Magic Link) Kontrolü
  useEffect(() => {
    if (autoLoginToken) {
      setOtomatikGirisYapiliyor(true)
      
      signIn("magic-link-verify", {
        token: autoLoginToken,
        redirect: false,
      }).then((res) => {
        if (res?.error) {
          setHata("Bağlantı geçersiz veya süresi dolmuş. Lütfen normal giriş yapın.")
          setOtomatikGirisYapiliyor(false)
        } else {
          router.push("/admin")
          router.refresh()
        }
      })
    }
  }, [autoLoginToken, router])

  // Normal Giriş Fonksiyonu
  async function handleGiris(e: React.FormEvent) {
    e.preventDefault()
    setHata("")
    setYukleniyor(true)
    
    const sonuc = await signIn("credentials", {
      email,
      password: sifre,
      redirect: false,
    })
    
    if (sonuc?.error) {
      setHata("E-posta adresi veya şifre hatalı.")
      setYukleniyor(false)
    } else {
      router.push("/admin")
      router.refresh()
    }
  }

  // Otomatik giriş ekranı (Magic Link kullanılıyorsa)
  if (otomatikGirisYapiliyor) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
        <p className="text-gray-600 font-medium">Güvenli giriş yapılıyor, lütfen bekleyin...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Mingax'a Giriş</h1>
          <p className="text-gray-500 mt-2">Hesabınıza erişmek için bilgilerinizi girin.</p>
        </div>

        {/* Başarı Mesajları */}
        {onay === "basarili" && (
          <div className="flex items-center gap-2 bg-green-50 text-green-700 p-4 rounded-xl mb-6 text-sm border border-green-100">
            <CheckCircle2 size={18} />
            E-posta adresiniz onaylandı. Giriş yapabilirsiniz.
          </div>
        )}
        
        {kayit === "basarili" && (
          <div className="flex items-center gap-2 bg-blue-50 text-blue-700 p-4 rounded-xl mb-6 text-sm border border-blue-100">
            <CheckCircle2 size={18} />
            Kaydınız başarıyla oluşturuldu! Hoş geldiniz.
          </div>
        )}

        {/* Hata Mesajı */}
        {hata && (
          <div className="flex items-center gap-2 text-red-600 mb-6 bg-red-50 p-4 rounded-xl text-sm border border-red-100">
            <AlertCircle size={18} />
            {hata}
          </div>
        )}
        
        <form onSubmit={handleGiris} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">E-posta</label>
            <input
              type="email"
              placeholder="ornek@firma.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-black bg-gray-50"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Şifre</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={sifre}
                onChange={e => setSifre(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-black bg-gray-50"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-blue-600 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={yukleniyor}
            className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2 disabled:bg-gray-400"
          >
            {yukleniyor ? <Loader2 className="animate-spin" size={20} /> : "Giriş Yap"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-600">
            Henüz hesabınız yok mu?{" "}
            <a href="/kayit" className="text-blue-600 font-bold hover:underline">Ücretsiz Kayıt Ol</a>
          </p>
          <div className="mt-3">
            <a href="/sifre-unuttum" className="text-xs text-gray-400 hover:text-blue-500 transition-colors">
              Şifremi Unuttum
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function GirisPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-gray-300" size={32} />
      </div>
    }>
      <GirisForm />
    </Suspense>
  )
}