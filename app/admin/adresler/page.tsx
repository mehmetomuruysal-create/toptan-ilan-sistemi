import { prisma } from "@/lib/prisma"
import AdreslerClient from "./AdreslerClient"

export default async function Page() {
  const adresler = await prisma.address.findMany({
    include: {
      user: {
        select: {
          id: true,
          ad: true,
          soyad: true,
          email: true,
          hesapTuru: true,
        }
      }
    },
    orderBy: { createdAt: "desc" }
  })
  return <AdreslerClient initialAdresler={adresler} />
}