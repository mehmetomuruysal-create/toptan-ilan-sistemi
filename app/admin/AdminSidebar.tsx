"use client"
import { LayoutDashboard, Package, Users, Landmark, Settings, LogOut, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { label: "Gösterge Paneli", icon: LayoutDashboard, href: "/admin" },
    { label: "İlan Yönetimi", icon: Package, href: "/admin/ilanlar" },
    { label: "Kullanıcılar", icon: Users, href: "/admin/kullanicilar" },
    { label: "Para Merkezi", icon: Landmark, href: "/admin/ayarlar" }, // 🚀 İşte o meşhur yüzde paneli!
  ];

  return (
    <aside className="w-80 bg-gray-900 min-h-screen p-8 flex flex-col text-white sticky top-0">
      <div className="mb-12 px-4">
        <h2 className="text-3xl font-black italic uppercase tracking-tighter">MİNGAX</h2>
        <p className="text-[9px] font-bold text-blue-400 uppercase tracking-[0.3em] italic mt-1">Admin HQ</p>
      </div>

      <nav className="flex-1 space-y-3">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.label} 
              href={item.href}
              className={`flex items-center gap-4 px-6 py-5 rounded-[1.5rem] font-black italic uppercase text-[11px] tracking-widest transition-all ${
                isActive ? "bg-blue-600 text-white shadow-2xl shadow-blue-500/20" : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="pt-8 border-t border-white/5 space-y-4">
        <Link href="/" className="flex items-center gap-4 px-6 py-4 text-[10px] font-black uppercase italic text-gray-400 hover:text-white transition-all">
          <ArrowLeft size={16} /> Siteye Dön
        </Link>
      </div>
    </aside>
  );
}