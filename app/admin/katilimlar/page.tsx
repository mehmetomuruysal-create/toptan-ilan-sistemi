import { prisma } from "@/lib/prisma"

export default async function AdminKatilimlar() {
  const participants = await prisma.participant.findMany({
    include: {
      kullanici: true,
      havuz: { 
        include: { 
          ilan: true 
        } 
      },
    },
    orderBy: { id: "desc" },
  })

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Katılım Talepleri</h1>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <th className="px-6 py-4">İlan Başlığı</th>
              <th className="px-6 py-4">Kullanıcı</th>
              <th className="px-6 py-4">Talep Miktarı</th>
              <th className="px-6 py-4">Talep Durumu</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {participants.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">
                  {p.havuz?.ilan?.baslik || "Silinmiş İlan"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {p.kullanici.ad} {p.kullanici.soyad}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 font-semibold">
                  {p.talepMiktari} Adet
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    p.durum === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                    p.durum === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {/* Şemadaki 'durum' alanını kullanıyoruz */}
                    {p.durum} 
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}