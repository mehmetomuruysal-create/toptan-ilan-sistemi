import { prisma } from "@/lib/prisma"
import AdminActions from "./AdminActions" // Butonları içeri aktarıyoruz

export default async function AdminDashboard() {
  const [totalUsers, totalListings, totalParticipants, activeListings] = await Promise.all([
    prisma.user.count(),
    prisma.listing.count(),
    prisma.participant.count(),
    // Prisma şemandaki Enum değerine (ACTIVE) göre güncellendi
    prisma.listing.count({ where: { durum: "ACTIVE" } }), 
  ])

  const recentListings = await prisma.listing.findMany({
    take: 5,
    orderBy: { olusturmaTarihi: "desc" },
    include: { satici: true },
  })

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Gösterge Paneli</h1>


      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded shadow border-t-4 border-blue-500">
          <div className="text-gray-500">Toplam Kullanıcı</div>
          <div className="text-2xl font-bold">{totalUsers}</div>
        </div>
        <div className="bg-white p-4 rounded shadow border-t-4 border-purple-500">
          <div className="text-gray-500">Toplam İlan</div>
          <div className="text-2xl font-bold">{totalListings}</div>
        </div>
        <div className="bg-white p-4 rounded shadow border-t-4 border-green-500">
          <div className="text-gray-500">Toplam Katılım</div>
          <div className="text-2xl font-bold">{totalParticipants}</div>
        </div>
        <div className="bg-white p-4 rounded shadow border-t-4 border-yellow-500">
          <div className="text-gray-500">Aktif İlan</div>
          <div className="text-2xl font-bold">{activeListings}</div>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-4">Son İlanlar</h2>
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">Başlık</th>
              <th className="px-4 py-2 text-left">Satıcı</th>
              <th className="px-4 py-2 text-left">Durum</th>
              <th className="px-4 py-2 text-left">Tarih</th>
            </tr>
          </thead>
          <tbody>
            {recentListings.map((ilan) => (
              <tr key={ilan.id} className="border-t">
                <td className="px-4 py-2 font-medium">{ilan.baslik}</td>
                <td className="px-4 py-2">{ilan.satici.ad} {ilan.satici.soyad}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    ilan.durum === "ACTIVE" ? "bg-green-100 text-green-700" : 
                    ilan.durum === "SUSPENDED" ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-700"
                  }`}>
                    {ilan.durum}
                  </span>
                </td>
                <td className="px-4 py-2 text-gray-500">
                  {new Date(ilan.olusturmaTarihi).toLocaleDateString("tr-TR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}