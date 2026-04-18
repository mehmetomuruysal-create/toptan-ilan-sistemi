import { prisma } from "@/lib/prisma"
import { Users, Package, Zap, Activity, ShieldAlert, Clock } from "lucide-react"
import Link from "next/link" // 🚀 Yönlendirme için şart

export default async function AdminDashboard() {
  const [pendingSellers, pendingListings, totalParticipants, activeListings] = await Promise.all([
    // 🚀 Sadece Onay Bekleyen Satıcılar
    prisma.user.count({ 
      where: { 
        hesapTuru: "SATICI", 
        onayDurumu: "PENDING" 
      } 
    }),
    // 🚀 Sadece Onay Bekleyen İlanlar
    prisma.listing.count({ 
      where: { durum: "PENDING" } 
    }),
    prisma.participant.count(),
    prisma.listing.count({ where: { durum: "ACTIVE" } }), 
  ])

  const recentListings = await prisma.listing.findMany({
    take: 5,
    orderBy: { olusturmaTarihi: "desc" },
    include: { satici: true },
  })

  return (
    <div className="space-y-12">
      {/* BAŞLIK */}
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-black italic uppercase tracking-tighter text-gray-900 leading-none">
            Operasyon <span className="text-blue-600">Merkezi</span>
          </h1>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] mt-3 ml-1">Kritik İşlem Takibi</p>
        </div>
        <div className="bg-white px-6 py-3 rounded-2xl border border-gray-100 flex items-center gap-3">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-[10px] font-black uppercase italic tracking-widest text-gray-600">Sistem Çevrimiçi</span>
        </div>
      </header>

      {/* İSTATİSTİK KARTLARI - YENİ DÜZEN */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <StatCard 
          label="Onay Bekleyen Satıcılar" 
          value={pendingSellers} 
          icon={<ShieldAlert />} 
          color="orange" 
          href="/admin/kullanicilar?filter=pending" // 🚀 Link mühürlendi
        />
        <StatCard 
          label="Onay Bekleyen İlanlar" 
          value={pendingListings} 
          icon={<Clock />} 
          color="blue" 
          href="/admin/ilanlar?filter=pending" // 🚀 Link mühürlendi
        />
        <StatCard label="Toplam Katılım" value={totalParticipants} icon={<Zap />} color="purple" />
        <StatCard label="Aktif Gruplar" value={activeListings} icon={<Activity />} color="green" />
      </div>

      {/* SON İLANLAR TABLOSU */}
      <section className="space-y-6">
        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 ml-4 italic">Son Hareketler</h2>
        <div className="bg-white rounded-[3rem] shadow-2xl shadow-gray-200/50 border border-gray-50 overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">İlan Başlığı</th>
                <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Tedarikçi</th>
                <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Durum</th>
                <th className="px-8 py-6 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Tarih</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentListings.map((ilan) => (
                <tr key={ilan.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <p className="font-black italic uppercase text-sm text-gray-900 group-hover:text-blue-600 transition-colors">{ilan.baslik}</p>
                  </td>
                  <td className="px-8 py-6 text-xs font-bold text-gray-500 uppercase">{ilan.satici.ad} {ilan.satici.soyad}</td>
                  <td className="px-8 py-6">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest italic ${
                      ilan.durum === "ACTIVE" ? "bg-green-50 text-green-600" : 
                      ilan.durum === "PENDING" ? "bg-orange-50 text-orange-600" : "bg-gray-100 text-gray-400"
                    }`}>
                      {ilan.durum}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase">
                    {new Date(ilan.olusturmaTarihi).toLocaleDateString("tr-TR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function StatCard({ label, value, icon, color, href }: any) {
  const colors: any = {
    blue: "text-blue-600 bg-blue-50 border-blue-100",
    purple: "text-purple-600 bg-purple-50 border-purple-100",
    orange: "text-orange-600 bg-orange-50 border-orange-100",
    green: "text-green-600 bg-green-50 border-green-100",
  }

  const CardContent = (
    <div className={`bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/30 flex items-center justify-between group hover:scale-[1.02] transition-all ${href ? 'cursor-pointer hover:border-blue-300' : ''}`}>
      <div className="space-y-2">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">{label}</p>
        <p className="text-4xl font-black italic tracking-tighter text-gray-900">{value}</p>
      </div>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${colors[color]} shadow-inner group-hover:rotate-12 transition-transform`}>
        {icon}
      </div>
    </div>
  );

  return href ? <Link href={href}>{CardContent}</Link> : CardContent;
}