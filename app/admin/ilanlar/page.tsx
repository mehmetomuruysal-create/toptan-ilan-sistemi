import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { ListingStatus } from "@prisma/client"
// Actions dosyasından fonksiyonları içeri alıyoruz
import { changeStatus, deleteAllListings, suspendAllListings } from "./actions"

export default async function AdminIlanlar() {
  const ilanlar = await prisma.listing.findMany({
    include: { satici: true },
    orderBy: { olusturmaTarihi: "desc" },
  })

  // Durum Renkleri ve Etiketleri
  const getStatusBadge = (status: ListingStatus) => {
    // Record tipiyle TypeScript'e tüm olası enum değerlerini karşıladığımızı söylüyoruz
    const styles: Record<ListingStatus, string> = {
      ACTIVE: "bg-green-100 text-green-700 border-green-200",
      PENDING: "bg-yellow-100 text-yellow-700 border-yellow-200",
      SUSPENDED: "bg-red-100 text-red-700 border-red-200",
      CANCELLED: "bg-gray-100 text-gray-700 border-gray-200",
      COMPLETED: "bg-blue-100 text-blue-700 border-blue-200",
      REJECTED: "bg-rose-100 text-rose-700 border-rose-200", // Eklendi
    };
    
    const labels: Record<ListingStatus, string> = {
      ACTIVE: "AKTİF",
      PENDING: "BEKLİYOR",
      SUSPENDED: "ASKIYA ALINDI",
      CANCELLED: "İPTAL",
      COMPLETED: "TAMAMLANDI",
      REJECTED: "REDDEDİLDİ", // Eklendi
    };

    return (
      <span className={`px-2 py-1 rounded-full text-[10px] font-black border uppercase tracking-tighter ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <div className="p-6">
      {/* Üst Başlık ve Toplu İşlem Butonları */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic">İlan Yönetimi</h1>
          <div className="text-sm text-gray-500 font-bold uppercase tracking-widest mt-1">Toplam {ilanlar.length} İlan</div>
        </div>

        <div className="flex gap-3">
          <form action={suspendAllListings}>
            <button 
              type="submit"
              className="px-4 py-2.5 bg-white text-amber-600 border-2 border-amber-100 rounded-xl text-[10px] font-black hover:bg-amber-50 transition-all shadow-sm uppercase tracking-widest"
            >
              TÜMÜNÜ ASKIYA AL
            </button>
          </form>

          <form action={deleteAllListings}>
            <button 
              type="submit"
              className="px-4 py-2.5 bg-red-50 text-red-700 border-2 border-red-100 rounded-xl text-[10px] font-black hover:bg-red-600 hover:text-white transition-all shadow-sm uppercase tracking-widest"
            >
              TÜMÜNÜ SİL
            </button>
          </form>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50/50 font-black text-gray-400 text-[10px] uppercase tracking-[0.2em]">
            <tr>
              <th className="px-6 py-5 text-left">ID</th>
              <th className="px-6 py-5 text-left">İlan Detayı</th>
              <th className="px-6 py-5 text-left">Satıcı</th>
              <th className="px-6 py-5 text-left">Durum</th>
              <th className="px-6 py-5 text-center">Yönetim</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {ilanlar.map((ilan) => (
              <tr key={ilan.id} className="hover:bg-blue-50/30 transition-colors group">
                <td className="px-6 py-4 text-xs font-bold text-gray-400 italic">#{ilan.id}</td>
                <td className="px-6 py-4">
                  <Link href={`/ilan/${ilan.id}`} className="font-bold text-gray-900 hover:text-blue-600 transition-colors block">
                    {ilan.baslik}
                  </Link>
                  <span className="text-[10px] text-gray-400 font-medium">₺{ilan.toptanFiyat.toLocaleString()} / Adet</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-800">{ilan.satici.ad} {ilan.satici.soyad}</span>
                    <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest">{ilan.satici.firmaAdi || "Bireysel"}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {getStatusBadge(ilan.durum as ListingStatus)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-center gap-2">
                    {/* Tekil Durum Değiştirme */}
                    <form action={async () => {
                      "use server"
                      await changeStatus(ilan.id, ilan.durum === "ACTIVE" ? "CANCELLED" : "ACTIVE")
                    }}>
                      <button className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm ${
                        ilan.durum === "ACTIVE" 
                        ? "bg-amber-100 text-amber-700 hover:bg-amber-200" 
                        : "bg-green-600 text-white hover:bg-green-700 shadow-green-100"
                      }`}>
                        {ilan.durum === "ACTIVE" ? "Durdur" : "Yayınla"}
                      </button>
                    </form>

                    {/* Tekil Askıya Al / Reddet */}
                    {ilan.durum !== "SUSPENDED" && (
                      <form action={async () => {
                        "use server"
                        await changeStatus(ilan.id, "SUSPENDED")
                      }}>
                        <button className="px-4 py-2 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow-sm">
                          Askıya Al
                        </button>
                      </form>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}