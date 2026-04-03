"use client"
import { useRouter } from "next/navigation"

export default function AdresVarsayilanYap({ adresId, tip }: { adresId: number; tip: "teslimat" | "fatura" }) {
  const handleClick = async () => {
    const res = await fetch(`/api/adres/${adresId}/varsayilan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tip })
    })
    if (res.ok) {
      window.location.reload()
    } else {
      alert("İşlem başarısız")
    }
  }

  return (
    <button
      onClick={handleClick}
      className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
    >
      Varsayılan {tip === "teslimat" ? "Teslimat" : "Fatura"} Yap
    </button>
  )
}