"use client"
import { useState } from "react"
import { adresEkle } from "@/app/actions/adres"

export default function AddressForm() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [faturaTuru, setFaturaTuru] = useState<"BIREYSEL" | "KURUMSAL">("BIREYSEL")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    const formData = new FormData(e.currentTarget)
    const data = {
      baslik: formData.get("baslik") as string,
      teslimAlacakKisi: formData.get("teslimAlacakKisi") as string,
      telefon: formData.get("telefon") as string,
      il: formData.get("il") as string,
      ilce: formData.get("ilce") as string,
      mahalle: formData.get("mahalle") as string || undefined,
      adresSatiri: formData.get("adresSatiri") as string,
      postaKodu: formData.get("postaKodu") as string || undefined,
      isVarsayilanTeslimat: formData.has("isVarsayilanTeslimat"),
      isVarsayilanFatura: formData.has("isVarsayilanFatura"),
      faturaTuru,
      tcKimlik: faturaTuru === "BIREYSEL" ? (formData.get("tcKimlik") as string) : undefined,
      firmaAdi: faturaTuru === "KURUMSAL" ? (formData.get("firmaAdi") as string) : undefined,
      vergiDairesi: faturaTuru === "KURUMSAL" ? (formData.get("vergiDairesi") as string) : undefined,
      vergiNo: faturaTuru === "KURUMSAL" ? (formData.get("vergiNo") as string) : undefined,
    }

    const result = await adresEkle(data)
    if (result.success) {
      setMessage("Adres başarıyla eklendi!")
      e.currentTarget.reset()
    } else {
      setMessage(result.error ?? "Bir hata oluştu")
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold">Yeni Adres Ekle</h2>
      <div>
        <label className="block text-sm font-medium">Adres Başlığı (Ev, İş, vb.)</label>
        <input name="baslik" required className="w-full border rounded px-3 py-2" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Teslim Alacak Kişi</label>
          <input name="teslimAlacakKisi" required className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Telefon</label>
          <input name="telefon" required className="w-full border rounded px-3 py-2" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium">İl</label>
          <input name="il" required className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">İlçe</label>
          <input name="ilce" required className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Mahalle (Opsiyonel)</label>
          <input name="mahalle" className="w-full border rounded px-3 py-2" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium">Adres Satırı</label>
        <textarea name="adresSatiri" required className="w-full border rounded px-3 py-2" rows={2} />
      </div>
      <div>
        <label className="block text-sm font-medium">Posta Kodu (Opsiyonel)</label>
        <input name="postaKodu" className="w-full border rounded px-3 py-2" />
      </div>
      <div className="flex gap-4">
        <label className="flex items-center gap-2">
          <input type="checkbox" name="isVarsayilanTeslimat" /> Varsayılan Teslimat Adresi
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="isVarsayilanFatura" /> Varsayılan Fatura Adresi
        </label>
      </div>
      <div>
        <label className="block text-sm font-medium">Fatura Türü</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input type="radio" name="faturaTuru" value="BIREYSEL" checked={faturaTuru === "BIREYSEL"} onChange={() => setFaturaTuru("BIREYSEL")} /> Bireysel
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="faturaTuru" value="KURUMSAL" checked={faturaTuru === "KURUMSAL"} onChange={() => setFaturaTuru("KURUMSAL")} /> Kurumsal
          </label>
        </div>
      </div>
      {faturaTuru === "BIREYSEL" && (
        <div>
          <label className="block text-sm font-medium">TC Kimlik No</label>
          <input name="tcKimlik" className="w-full border rounded px-3 py-2" />
        </div>
      )}
      {faturaTuru === "KURUMSAL" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium">Firma Adı</label>
            <input name="firmaAdi" className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium">Vergi Dairesi</label>
            <input name="vergiDairesi" className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium">Vergi No</label>
            <input name="vergiNo" className="w-full border rounded px-3 py-2" />
          </div>
        </div>
      )}
      <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50">
        {loading ? "Kaydediliyor..." : "Adres Ekle"}
      </button>
      {message && <p className="text-center text-sm text-gray-600">{message}</p>}
    </form>
  )
}