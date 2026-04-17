import { prisma } from "@/lib/prisma"

export default async function AdminKatilimlar() {
  // 🚀 Şemadaki gerçek ilişki isimleri: barem ve listing
  const participants = await prisma.participant.findMany({
    include: {
      kullanici: true,
      barem: { 
        include: { 
          listing: true 
        } 
      },
    },
    orderBy: { id: "desc" },
  })

  return (
    <div className="space-y-12">
      {/* BAŞLIK */}
      <header>
        <h1 className="text-5xl font-black italic uppercase tracking-tighter text-gray-900 leading-none">
          Katılım <span className="text-blue-600">Talepleri</span>
        </h1>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] mt-4 ml-1 italic">
          Sistemdeki Aktif Alım Grupları ve Üye Eşleşmeleri
        </p>
      </header>

      {/* TABLO KONTEYNER */}
      <div className="bg-white rounded-[3rem] shadow-2xl shadow-gray-200/50 border border-gray-50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 italic">İlan Bilgisi</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Katılımcı</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Miktar</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {participants.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/50 transition-all group">
                  <td className="px-8 py-6">
                    <p className="text-sm font-black italic uppercase text-gray-900 group-hover:text-blue-600 transition-colors">
                      {p.barem?.listing?.baslik || "Silinmiş İlan"}
                    </p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                      Barem: {p.barem?.miktar} Adet Eşiği
                    </p>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-xs font-black uppercase italic text-gray-700">
                      {p.kullanici.ad} {p.kullanici.soyad}
                    </p>
                    <p className="text-[10px] font-bold text-gray-400 lowercase italic">
                      {p.kullanici.email}
                    </p>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-lg font-black italic text-gray-900">{p.talepMiktari}</span>
                    <span className="text-[10px] font-bold text-gray-400 ml-1 uppercase">Adet</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest italic shadow-sm ${
                      p.durum === 'PENDING' ? 'bg-orange-50 text-orange-600' :
                      p.durum === 'CONFIRMED' ? 'bg-green-50 text-green-600' :
                      'bg-red-50 text-red-600'
                    }`}>
                      {p.durum === 'PENDING' ? 'Bekliyor' : 
                       p.durum === 'CONFIRMED' ? 'Onaylandı' : 'İptal'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}