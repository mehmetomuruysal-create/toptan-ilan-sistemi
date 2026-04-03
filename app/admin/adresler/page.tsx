import { prisma } from "@/lib/prisma"
import Link from "next/link"

export default async function AdminAdreslerPage() {
  const adresler = await prisma.address.findMany({
    include: {
      user: {
        select: {
          id: true,
          ad: true,
          soyad: true,
          email: true,
          hesapTuru: true,
        }
      }
    },
    orderBy: { createdAt: "desc" }
  })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Adres Yönetimi</h1>
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Kullanıcı</th>
              <th className="px-4 py-2">Başlık</th>
              <th className="px-4 py-2">Teslim Alan</th>
              <th className="px-4 py-2">Telefon</th>
              <th className="px-4 py-2">Adres</th>
              <th className="px-4 py-2">Varsayılan Teslimat</th>
              <th className="px-4 py-2">Varsayılan Fatura</th>
              <th className="px-4 py-2">Fatura Türü</th>
              <th className="px-4 py-2">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {adresler.map(adres => (
              <tr key={adres.id} className="border-t">
                <td className="px-4 py-2">{adres.id}</td>
                <td className="px-4 py-2">
                  <Link href={`/admin/kullanicilar/${adres.user.id}`} className="text-blue-600 hover:underline">
                    {adres.user.ad} {adres.user.soyad}
                  </Link>
                </td>
                <td className="px-4 py-2">{adres.baslik}</td>
                <td className="px-4 py-2">{adres.teslimAlacakKisi}</td>
                <td className="px-4 py-2">{adres.telefon}</td>
                <td className="px-4 py-2">
                  {adres.adresSatiri}, {adres.ilce}/{adres.il}
                </td>
                <td className="px-4 py-2">{adres.isVarsayilanTeslimat ? "✅" : "❌"}</td>
                <td className="px-4 py-2">{adres.isVarsayilanFatura ? "✅" : "❌"}</td>
                <td className="px-4 py-2">{adres.faturaTuru === "BIREYSEL" ? "Bireysel" : "Kurumsal"}</td>
                <td className="px-4 py-2">
                  <form action={`/api/admin/adres/sil/${adres.id}`} method="POST">
                    <button className="bg-red-500 text-white px-2 py-1 rounded text-sm">Sil</button>
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