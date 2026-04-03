"use client"
import { useRouter } from "next/navigation"

async function adresSil(adresId: number) {
  const res = await fetch(`/api/adres/${adresId}`, { method: "DELETE" })
  if (res.ok) {
    window.location.reload()
  } else {
    alert("Silme işlemi başarısız")
  }
}

export default function AdresSil({ adresId }: { adresId: number }) {
  return (
    <button
      onClick={() => {
        if (confirm("Bu adresi silmek istediğinize emin misiniz?")) {
          adresSil(adresId)
        }
      }}
      className="text-sm text-red-600 hover:underline"
    >
      Sil
    </button>
  )
}