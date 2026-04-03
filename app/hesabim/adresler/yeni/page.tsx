"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { adresEkle } from "@/app/actions/adres"

export default function YeniAdresPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const data = {
      baslik: formData.get("baslik") as string,
      teslimAlacakKisi: formData.get("teslimAlacakKisi") as string,
      telefon: formData.get("telefon") as string,
      il: formData.get("il") as string,
      ilce: formData.get("ilce") as string,
      adresSatiri: formData.get("adresSatiri") as string,
      faturaTuru: "BIREYSEL" as const,
    }
    const result = await adresEkle(data)
    if (result.success) {
      router.push("/hesabim/adresler")
    } else {
      alert(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Yeni Adres</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input name="baslik" placeholder="Başlık (Ev, İş)" required className="w-full border p-2 rounded" />
        <input name="teslimAlacakKisi" placeholder="Teslim Alacak Kişi" required className="w-full border p-2 rounded" />
        <input name="telefon" placeholder="Telefon" required className="w-full border p-2 rounded" />
        <input name="il" placeholder="İl" required className="w-full border p-2 rounded" />
        <input name="ilce" placeholder="İlçe" required className="w-full border p-2 rounded" />
        <textarea name="adresSatiri" placeholder="Adres" required className="w-full border p-2 rounded" />
        <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">
          {loading ? "Kaydediliyor..." : "Kaydet"}
        </button>
      </form>
    </div>
  )
}