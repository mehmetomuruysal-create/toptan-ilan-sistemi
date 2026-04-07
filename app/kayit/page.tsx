"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react" // Oto-login için şart
import { Loader2, UserPlus, AlertCircle } from "lucide-react"

export default function KayitPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [hata, setHata] = useState("")

  const [formData, setFormData] = useState({
    ad: "",
    soyad: "",
    email: "",
    password: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setHata("")

    try {
      // 1. ADIM: Kayıt API'sine gönder
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (res.ok) {
        // 2. ADIM: KAYIT BAŞARILIYSA OTOMATİK GİRİŞ YAP
        const loginRes = await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false, // Sayfa yenilenmesin, biz yönlendireceğiz
        })

        if (loginRes?.ok) {
          // Giriş başarılı, ana sayfaya uçur
          router.push("/?kayit=basarili")
          router.refresh()
        } else {
          // Kayıt oldu ama oto-login takıldıysa login'e gönder
          router.push("/login?kayit=basarili")
        }
      } else {
        setHata(data.hata || "Kayıt sırasında bir hata oluştu.")
      }
    } catch (err) {
      setHata("Sunucuya bağlanılamadı. Lütfen internetinizi kontrol edin.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
            <UserPlus size={24} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Mingax'a Katıl</h1>
          <p className="text-gray-500 text-sm">Ücretsiz hesabınızı oluşturun.</p>
        </div>

        {hata && (
          <div className="flex items-center gap-2 text-red-600 mb-6 bg-red-50 p-4 rounded-xl text-sm border border-red-100">
            <AlertCircle size={18} />
            {hata}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Ad"
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none text-black bg-gray-50"
              onChange={(e) => setFormData({...formData, ad: e.target.value})}
            />
            <input
              type="text"
              placeholder="Soyad"
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none text-black bg-gray-50"
              onChange={(e) => setFormData({...formData, soyad: e.target.value})}
            />
          </div>
          <input
            type="email"
            placeholder="E-posta"
            required
            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none text-black bg-gray-50"
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
          <input
            type="password"
            placeholder="Şifre"
            required
            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none text-black bg-gray-50"
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg disabled:bg-gray-400 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : "Kaydol ve Başla"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Zaten hesabınız var mı?{" "}
          <a href="/login" className="text-blue-600 font-bold hover:underline">Giriş Yap</a>
        </p>
      </div>
    </div>
  )
}