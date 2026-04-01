"use client"
import { signIn } from "next-auth/react"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense } from "react"

function GirisForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const onay = searchParams.get("onay")
  const [email, setEmail] = useState("")
  const [sifre, setSifre] = useState("")
  const [hata, setHata] = useState("")

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Giriş Yap</h1>

        {onay === "basarili" && (
          <div className="bg-green-100 text-green-700 p-3 rounded mb-4">
            ✅ E-posta adresiniz başarıyla onaylandı. Şimdi giriş yapabilirsiniz.
          </div>
        )}

        {hata && <p className="text-red-500 mb-4">{hata}</p>}
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
    <Suspense fallback={<div>Yükleniyor...</div>}>
      <GirisForm />
    </Suspense>
  )
}