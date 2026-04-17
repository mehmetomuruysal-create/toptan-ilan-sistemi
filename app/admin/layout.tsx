import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  HandHelping, 
  MapPin, 
  Landmark, 
  ArrowLeft 
} from "lucide-react"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // 🔐 GÜVENLİK MÜHRÜ
  const session = await auth()
  if (!session || !(session.user as any).isAdmin) {
    redirect("/")
  }

  const menuItems = [
    { label: "Dashboard", href: "/admin", icon: <LayoutDashboard size={18} /> },
    { label: "İlan Yönetimi", href: "/admin/ilanlar", icon: <Package size={18} /> },
    { label: "Kullanıcılar", href: "/admin/kullanicilar", icon: <Users size={18} /> },
    { label: "Katılımlar", href: "/admin/katilimlar", icon: <HandHelping size={18} /> },
    { label: "Adres Yönetimi", href: "/admin/adresler", icon: <MapPin size={18} /> },
    { label: "Para Merkezi", href: "/admin/ayarlar", icon: <Landmark size={18} className="text-blue-500" /> }, // 🚀 İşte o panel!
  ]

  return (
    <div className="min-h-screen bg-gray-50/50 flex">
      {/* --- MİNGAX ADMIN SIDEBAR --- */}
      <aside className="w-80 bg-gray-900 shadow-2xl h-screen sticky top-0 flex flex-col">
        {/* LOGO BÖLÜMÜ */}
        <div className="p-8 border-b border-white/5">
          <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">
            MİNGAX
          </h2>
          <p className="text-[9px] font-bold text-blue-400 uppercase tracking-[0.3em] mt-1 italic">
            Operasyon Merkezi
          </p>
        </div>

        {/* NAVİGASYON */}
        <nav className="flex-1 p-6 space-y-2">
          {menuItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href} 
              className="flex items-center gap-4 py-4 px-6 rounded-2xl text-gray-400 hover:text-white hover:bg-white/5 transition-all font-black italic uppercase text-[11px] tracking-widest group"
            >
              <span className="group-hover:scale-110 transition-transform">
                {item.icon}
              </span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* ALT KISIM */}
        <div className="p-6 border-t border-white/5">
          <Link 
            href="/" 
            className="flex items-center gap-4 py-4 px-6 rounded-2xl text-gray-500 hover:text-white font-black italic uppercase text-[10px] tracking-widest transition-all"
          >
            <ArrowLeft size={16} />
            Siteye Dön
          </Link>
        </div>
      </aside>

      {/* --- ANA İÇERİK --- */}
      <main className="flex-1 p-8 md:p-12 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}