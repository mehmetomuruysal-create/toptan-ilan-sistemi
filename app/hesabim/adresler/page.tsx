import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function AdreslerPage() {
  const session = await auth()
  
  // Oturum kontrolü - email üzerinden yapalım
  if (!session?.user?.email) {
    redirect("/giris")
  }

  // Kullanıcıyı email ile bul
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true }
  })

  if (!user) {
    redirect("/giris")
  }

  const adresler = await prisma.address.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" }
  })

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-4">Adreslerim</h1>
      <Link href="/hesabim/adresler/yeni" className="bg-blue-600 text-white px-4 py-2 rounded inline-block mb-4">
        + Yeni Adres
      </Link>
      {adresler.length === 0 ? (
        <p className="mt-4">Henüz adres yok.</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {adresler.map(adres => (
            <li key={adres.id} className="border p-3 rounded">
              {adres.baslik} - {adres.adresSatiri}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}