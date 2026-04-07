"use client"
import { signIn } from "next-auth/react"
import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"

function GirisForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const onay = searchParams.get("onay")
  const autoLoginToken = searchParams.get("autoLoginToken")

  const [email, setEmail] = useState("")
  const [sifre, setSifre] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [hata, setHata] = useState("")
  const [otomatikGirisYapiliyor, setOtomatikGirisYapiliyor] = useState(false)

  useEffect(() => {
    // 1. autoLoginToken varsa 'magic-link-verify' provider'ı ile giriş yap
    if (autoLoginToken) {
      setOtomatikGirisYapiliyor(true)
      
      // ÖNEMLİ: 'verify-token' olan ismi 'magic-link-verify' yaptık (auth.ts ile uyumlu)
      signIn("magic-link-verify", {
        token: autoLoginToken,
        redirect: false,
        callbackUrl: "/admin", // Giriş sonrası admin'e atar
      }).then((res) => {
        if (res?.error) {
          setHata("Otomatik giriş başarısız veya bağlantı geçersiz. Lütfen normal giriş yapın.")
          setOtomatikGirisYapiliyor(false)
        } else {
          // Başarılıysa admin paneline yönlendir
          router.push("/admin")
          router.refresh()
        }
      })
    }
  }, [autoLoginToken, router])

  async function handleGiris(e: React.FormEvent) {
    e.preventDefault()
    setHata("")
    
    const sonuc = await signIn("credentials", {
      email,
      password: sifre,
      redirect: false,
    })
    
    if (sonuc?.error) {
      setHata("Email veya şifre hatalı")
    } else {
      router.push("/admin")
      router.refresh()
    }
  }

  if (otomatikGirisYapiliyor) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600 font-medium">Sihirli bağlantı ile giriş yapılıyor...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Giriş Yap</h1>

        {onay === "basarili" && !hata && (
          <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-sm">
            ✅ E-posta adresiniz onaylandı. Giriş yapabilirsiniz.
          </div>
        )}

        {hata && <div className="text-red-500 mb-4 bg-red-50 p-3 rounded text-sm border border-red-100">{hata}</div>}
        
        <form onSubmit={handleGiris} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 text-left">Email</label>
            <input
              type="email"
              placeholder="E-posta adresiniz"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 text-left">Şifre</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Şifreniz"
                value={sifre}
                onChange={e => setSifre(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition shadow-sm"
          >
            Giriş Yap
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          Hesabın yok mu?{" "}
          <a href="/kayit" className="text-blue-600 font-medium hover:underline">Kayıt Ol</a>
        </p>
        <div className="text-center mt-3">
          <a href="/sifre-unuttum" className="text-xs text-gray-400 hover:underline">Şifremi Unuttum</a>
        </div>
      </div>
    </div>
  )
}

export default function GirisPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 italic">Sayfa yükleniyor...</p>
      </div>
    }>
      <GirisForm />
    </Suspense>
  )
}