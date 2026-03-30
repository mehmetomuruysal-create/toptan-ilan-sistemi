import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"

async function changeStatus(id: number, newStatus: string) {
  "use server"
  await prisma.listing.update({
    where: { id },
    data: { durum: newStatus },
  })
  redirect("/admin/ilanlar")
}

export default async function AdminIlanlar() {
  const ilanlar = await prisma.listing.findMany({
    include: { satici: true },
    orderBy: { olusturmaTarihi: "desc" },
  })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">İlan Yönetimi</h1>
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr><th className="px-4 py-2">ID</th><th className="px-4 py-2">Başlık</th><th className="px-4 py-2">Satıcı</th><th className="px-4 py-2">Durum</th><th className="px-4 py-2">İşlem</th></tr>
          </thead>
          <tbody>
            {ilanlar.map((ilan) => (
              <tr key={ilan.id} className="border-t">
                <td className="px-4 py-2">{ilan.id}</td>
                <td className="px-4 py-2"><Link href={`/ilan/${ilan.id}`} className="text-blue-600 hover:underline">{ilan.baslik}</Link></td>
                <td className="px-4 py-2">{ilan.satici.ad} {ilan.satici.soyad}</td>
                <td className="px-4 py-2">{ilan.durum}</td>
                <td className="px-4 py-2">
                  <form action={changeStatus.bind(null, ilan.id, ilan.durum === "aktif" ? "pasif" : "aktif")}>
                    <button className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600">
                      {ilan.durum === "aktif" ? "Pasif Yap" : "Aktif Yap"}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}