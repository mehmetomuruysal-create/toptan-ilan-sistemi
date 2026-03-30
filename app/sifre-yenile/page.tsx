"use client"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { resetPassword } from "@/app/actions/password-actions"

export default function SifreYenilePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token") // URL'deki güvenli kodu al

  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: "", text: "" })

  if (!token) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">Geçersiz bağlantı.</div>
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: "", text: "" })

    const result = await resetPassword(token, password)

    if (result.success) {
      setMessage({ type: "success", text: "Şifreniz başarıyla güncellendi. Yönlendiriliyorsunuz..." })
      setTimeout(() => router.push("/"), 3000)
    } else {
      setMessage({ type: "error", text: result.error || "Hata oluştu." })
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-gray-100">
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">Yeni Şifre Belirle</h1>
        <p className="text-center text-gray-500 mb-6 text-sm">Lütfen hesabınız için yeni ve güçlü bir şifre belirleyin.</p>

        {message.text && (
          <div className={`p-4 rounded-lg mb-6 text-sm ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="password" 
            placeholder="Yeni Şifreniz (En az 8 karakter)" 
            required 
            minLength={8}
            className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password} 
            onChange={e => setPassword(e.target.value)} 
          />
          <button 
            type="submit" 
            disabled={loading || message.type === "success"}
            className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Güncelleniyor..." : "ŞİFREYİ KAYDET"}
          </button>
        </form>
      </div>
    </div>
  )
}