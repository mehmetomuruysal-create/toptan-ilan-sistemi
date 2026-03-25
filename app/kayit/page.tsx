"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function KayitPage() {
  const [form, setForm] = useState({ adSoyad: "", email: "", sifre: "", rol: "alici" })
  const [hata, setHata] = useState("")
  const [yukleniyor, setYukleniyor] = useState(false)
  const router = useRouter()

  async function handleKayit(e: React.FormEvent) {
    e.preventDefault()
    setYukleniyor(true)
    setHata("")
    const res = await fetch("/api/kayit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (!res.ok) {
      setHata(data.hata || "Bir hata oluştu")
      setYukleniyor(false)
    } else {
      router.push("/giris")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Kayıt Ol</h1>
        {hata && <p className="text-red-500 mb-4">{hata}</p>}
        <form onSubmit={handleKayit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ad Soyad</label>
            <input
              type="text"
              value={form.adSoyad}
              onChange={e => setForm({...form, adSoyad: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({...form, email: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Şifre</label>
            <input
              type="password"
              value={form.sifre}
              onChange={e => setForm({...form, sifre: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hesap Türü</label>
            <select
              value={form.rol}
              onChange={e => setForm({...form, rol: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="alici">Alıcı</option>
              <option value="satici">Satıcı</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={yukleniyor}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {yukleniyor ? "Kaydediliyor..." : "Kayıt Ol"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Hesabın var mı?{" "}
          <a href="/giris" className="text-blue-600 hover:underline">Giriş Yap</a>
        </p>
      </div>
    </div>
  )
}
