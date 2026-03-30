import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

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

export default async function AdminKullanicilar() {
  const users = await prisma.user.findMany({
    orderBy: { id: "asc" },
  })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Kullanıcı Yönetimi</h1>
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr><th className="px-4 py-2">ID</th><th className="px-4 py-2">Ad Soyad</th><th className="px-4 py-2">E-posta</th><th className="px-4 py-2">Hesap Türü</th><th className="px-4 py-2">Admin</th><th className="px-4 py-2">İşlem</th></tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t">
                <td className="px-4 py-2">{user.id}</td>
                <td className="px-4 py-2">{user.ad} {user.soyad}</td>
                <td className="px-4 py-2">{user.email}</td>
                <td className="px-4 py-2">{user.hesapTuru}</td>
                <td className="px-4 py-2">{user.isAdmin ? "✅ Evet" : "❌ Hayır"}</td>
                <td className="px-4 py-2 space-x-2">
                  <form action={toggleAdmin.bind(null, user.id, user.isAdmin)} className="inline">
                    <button className="px-3 py-1 bg-yellow-500 text-white rounded text-sm">
                      {user.isAdmin ? "Admin Kaldır" : "Admin Yap"}
                    </button>
                  </form>
                  <form action={deleteUser.bind(null, user.id)} className="inline">
                    <button className="px-3 py-1 bg-red-500 text-white rounded text-sm">Sil</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}