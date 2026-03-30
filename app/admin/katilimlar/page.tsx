import { prisma } from "@/lib/prisma"

export default async function AdminKatilimlar() {
  const participants = await prisma.participant.findMany({
    include: {
      kullanici: true,
      havuz: { include: { ilan: true } },
    },
    orderBy: { id: "desc" },
  })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Katılım Talepleri</h1>
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr><th className="px-4 py-2">İlan Başlığı</th><th className="px-4 py-2">Kullanıcı</th><th className="px-4 py-2">Talep Miktarı</th><th className="px-4 py-2">Ödeme Durumu</th></tr>
          </thead>
          <tbody>
            {participants.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="px-4 py-2">{p.havuz.ilan.baslik}</td>
                <td className="px-4 py-2">{p.kullanici.ad} {p.kullanici.soyad}</td>
                <td className="px-4 py-2">{p.talepMiktari}</td>
                <td className="px-4 py-2">{p.odemeDurumu}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}