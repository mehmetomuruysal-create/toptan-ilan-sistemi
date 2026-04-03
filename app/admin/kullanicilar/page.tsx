import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import KullanicilarClient from "./KullanicilarClient"

async function toggleAdmin(userId: number, currentStatus: boolean) {
  "use server"
  await prisma.user.update({
    where: { id: userId },
    data: { isAdmin: !currentStatus },
  })
  redirect("/admin/kullanicilar")
}

async function deleteUser(userId: number) {
  "use server"
  await prisma.user.delete({ where: { id: userId } })
  redirect("/admin/kullanicilar")
}

export default async function AdminKullanicilarPage() {
  const users = await prisma.user.findMany({
    include: {
      adresler: true
    },
    orderBy: { id: "asc" },
  })

  return (
    <KullanicilarClient 
      initialUsers={users} 
      toggleAdminAction={toggleAdmin} 
      deleteUserAction={deleteUser} 
    />
  )
}
