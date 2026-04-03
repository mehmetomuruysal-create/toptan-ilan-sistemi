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
  const [hata, setHata] = useState("")
  const [otomatikGirisYapiliyor, setOtomatikGirisYapiliyor] = useState(false)

  // Otomatik giriş tetikleyicisi
  useEffect(() => {
    if (autoLoginToken) {
      setOtomatikGirisYapiliyor(true)
      signIn("verify-token", {
        token: autoLoginToken,
        redirect: false,
      }).then((res) => {
        if (res?.error) {
          setHata("Otomatik giriş başarısız veya token süresi dolmuş. Lütfen normal giriş yapın.")
          setOtomatikGirisYapiliyor(false)
        } else {
          router.push("/")
        }
      })
    }
  }, [autoLoginToken, router])

  async function handleGiris(e: React.FormEvent) {
    e.preventDefault()
    const sonuc = await signIn("credentials", {
      email,
      password: sifre,
      redirect: false,
    })
    if (sonuc?.error) {
      setHata("Email veya şifre hatalı")
    } else {
      router.push("/")
    }
  }

  // Kullanıcı mailden gelip otomatik giriş yaparken gösterilecek ekran
  if (otomatikGirisYapiliyor) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600 font-medium">Hesabınız onaylandı, giriş yapılıyor...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Giriş Yap</h1>

        {onay === "basarili" && !hata && (
          <div className="bg-green-100 text-green-700 p-3 rounded mb-4">
            ✅ E-posta adresiniz başarıyla onaylandı. Şimdi giriş yapabilirsiniz.
          </div>
        )}

        {hata && <p className="text-red-500 mb-4 bg-red-50 p-3 rounded">{hata}</p>}
        
        <form onSubmit={handleGiris} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Şifre</label>
            <input
              type="password"
              value={sifre}
              onChange={e => setSifre(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Giriş Yap
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Hesabın yok mu?{" "}
          <a href="/kayit" className="text-blue-600 hover:underline">Kayıt Ol</a>
        </p>
        <div className="text-center mt-2">
          <a href="/sifre-unuttum" className="text-sm text-gray-500 hover:underline">Şifremi Unuttum</a>
        </div>
      </div>
    </div>
  )
}

export default function GirisPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Yükleniyor...</p>
      </div>
    }>
      <GirisForm />
    </Suspense>
  )
}