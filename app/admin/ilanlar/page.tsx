import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import AdminIlanlarClient from "./AdminIlanlarClient"
import { changeStatus } from "./actions" // 🚀 Sadece bireysel durum değişikliği kaldı

export default async function AdminIlanlarPage() {
  const session = await auth()
  
  // 🛡️ Yetki Kontrolü: Admin olmayan giremez
  if (!session?.user?.isAdmin) redirect("/")

  const ilanlar = await prisma.listing.findMany({
    include: { 
      satici: true,
      images: true,    // 🖼️ İnceleme için resimler mühürlendi
      documents: true  // 📂 Teknik belgeler mühürlendi
    },
    orderBy: { olusturmaTarihi: "desc" },
  })

  return (
    <div className="p-4 md:p-10 bg-gray-50 min-h-screen">
      {/* 🚀 Başlık ve Alt Başlık Operasyon Merkezi stiline uygun */}
      <div className="mb-10">
        <h1 className="text-5xl font-black italic uppercase tracking-tighter text-gray-900 leading-none">
          İlan <span className="text-blue-600">Denetimi</span>
        </h1>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] mt-3 ml-1 italic">
          Bireysel onay ve kalite kontrol merkezi
        </p>
      </div>

      <AdminIlanlarClient 
        initialListings={JSON.parse(JSON.stringify(ilanlar))} 
        changeStatus={changeStatus}
        // ❌ suspendAllListings ve deleteAllListings kaldırıldı!
      />
    </div>
  )
}