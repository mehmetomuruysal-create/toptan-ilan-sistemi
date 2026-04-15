import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import AdminIlanlarClient from "./AdminIlanlarClient"
import { changeStatus, deleteAllListings, suspendAllListings } from "./actions"

export default async function AdminIlanlarPage() {
  const session = await auth()
  if (!session?.user?.isAdmin) redirect("/")

  const ilanlar = await prisma.listing.findMany({
    include: { 
      satici: true,
      images: true,    // 🖼️ Resimleri çekiyoruz
      documents: true  // 📂 Belgeleri çekiyoruz
    },
    orderBy: { olusturmaTarihi: "desc" },
  })

  return (
    <div className="p-4 md:p-10 bg-gray-50 min-h-screen">
      <AdminIlanlarClient 
        initialListings={JSON.parse(JSON.stringify(ilanlar))} 
        changeStatus={changeStatus}
        suspendAllListings={suspendAllListings}
        deleteAllListings={deleteAllListings}
      />
    </div>
  )
}