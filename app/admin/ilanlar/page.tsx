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
    const styles = {
      ACTIVE: "bg-green-100 text-green-700 border-green-200",
      PENDING: "bg-yellow-100 text-yellow-700 border-yellow-200",
      SUSPENDED: "bg-red-100 text-red-700 border-red-200",
      CANCELLED: "bg-gray-100 text-gray-700 border-gray-200",
      COMPLETED: "bg-blue-100 text-blue-700 border-blue-200",
    };
    
    const labels = {
      ACTIVE: "AKTİF",
      PENDING: "BEKLİYOR",
      SUSPENDED: "ASKIYA ALINDI",
      CANCELLED: "İPTAL",
      COMPLETED: "TAMAMLANDI"
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-bold border ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <div className="p-6">
      {/* Üst Başlık ve Toplu İşlem Butonları */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">İlan Yönetimi</h1>
          <div className="text-sm text-gray-500 font-medium">Toplam {ilanlar.length} İlan</div>
        </div>

        <div className="flex gap-3">
          {/* TÜMÜNÜ ASKIYA AL BUTONU */}
          <form action={suspendAllListings}>
            <button 
              type="submit"
              className="px-4 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-xs font-bold hover:bg-amber-100 transition shadow-sm"
              // Basit bir güvenlik kontrolü (İsteğe bağlı)
            >
              TÜMÜNÜ ASKIYA AL
            </button>
          </form>

          {/* TÜMÜNÜ SİL BUTONU */}
          <form action={deleteAllListings}>
            <button 
              type="submit"
              className="px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-bold hover:bg-red-100 transition shadow-sm"
            >
              TÜMÜNÜ SİL
            </button>
          </form>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 font-semibold text-gray-600 text-sm uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 text-left">ID</th>
              <th className="px-6 py-4 text-left">Başlık</th>
              <th className="px-6 py-4 text-left">Satıcı</th>
              <th className="px-6 py-4 text-left">Durum</th>
              <th className="px-6 py-4 text-center">İşlemler</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {ilanlar.map((ilan) => (
              <tr key={ilan.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm text-gray-500">#{ilan.id}</td>
                <td className="px-6 py-4 font-medium text-gray-900">
                  <Link href={`/ilan/${ilan.id}`} className="hover:text-blue-600 transition-colors">
                    {ilan.baslik}
                  </Link>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {ilan.satici.ad} {ilan.satici.soyad}
                </td>
                <td className="px-6 py-4">
                  {getStatusBadge(ilan.durum as ListingStatus)}
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex justify-center gap-2">
                    {/* Tekil Durum Değiştirme */}
                    <form action={async () => {
                      "use server"
                      await changeStatus(ilan.id, ilan.durum === "ACTIVE" ? "CANCELLED" : "ACTIVE")
                    }}>
                      <button className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        ilan.durum === "ACTIVE" 
                        ? "bg-amber-500 text-white hover:bg-amber-600" 
                        : "bg-green-500 text-white hover:bg-green-600"
                      }`}>
                        {ilan.durum === "ACTIVE" ? "Durdur" : "Yayına Al"}
                      </button>
                    </form>

                    {/* Tekil Askıya Al */}
                    {ilan.durum !== "SUSPENDED" && (
                      <form action={async () => {
                        "use server"
                        await changeStatus(ilan.id, "SUSPENDED")
                      }}>
                        <button className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition-all">
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