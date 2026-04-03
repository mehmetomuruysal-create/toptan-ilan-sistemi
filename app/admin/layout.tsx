import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session || !(session.user as any).isAdmin) {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        <aside className="w-64 bg-white shadow-md h-screen sticky top-0">
          <div className="p-4 font-bold text-xl border-b">Admin Panel</div>
          <nav className="p-4 space-y-2">
            <Link href="/admin" className="block py-2 px-3 rounded hover:bg-gray-100">Dashboard</Link>
            <Link href="/admin/ilanlar" className="block py-2 px-3 rounded hover:bg-gray-100">İlanlar</Link>
            <Link href="/admin/kullanicilar" className="block py-2 px-3 rounded hover:bg-gray-100">Kullanıcılar</Link>
            <Link href="/admin/katilimlar" className="block py-2 px-3 rounded hover:bg-gray-100">Katılımlar</Link>
            <Link href="/admin/adresler" className="block py-2 px-3 rounded hover:bg-gray-100">Adres Yönetimi</Link>
          </nav>
        </aside>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}