"use client"
import { 
  Wallet, 
  Package, 
  User, 
  MessageSquarePlus, 
  LayoutDashboard,
  LogOut 
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function UserSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { 
      label: "Genel Bakış", 
      icon: LayoutDashboard, 
      href: "/profil" 
    },
    { 
      label: "Cüzdanım", 
      icon: Wallet, 
      href: "/cuzdan" 
    },
    { 
      label: "Yeni İlan Talebi", 
      icon: MessageSquarePlus, 
      href: "/talep/yeni" // 🚀 Başlatan (Initiator) olma yolu
    },
    { 
      label: "Katıldığım İlanlar", 
      icon: Package, 
      href: "/profil/ilanlar" 
    },
    { 
      label: "Profil Ayarları", 
      icon: User, 
      href: "/profil/ayarlar" 
    },
  ];

  return (
    <aside className="w-72 bg-white border-r border-gray-100 min-h-screen p-8 flex flex-col">
      {/* LOGO BÖLÜMÜ */}
      <div className="mb-12 px-4">
        <h2 className="text-3xl font-black italic uppercase tracking-tighter text-gray-900">
          MİNGAX
        </h2>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic mt-1">
          Kullanıcı Paneli
        </p>
      </div>

      {/* NAVİGASYON LİSTESİ */}
      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          
          return (
            <Link 
              key={item.label} 
              href={item.href}
              className={`flex items-center gap-4 px-6 py-5 rounded-2xl font-black italic uppercase text-[11px] tracking-widest transition-all group ${
                isActive 
                ? "bg-gray-900 text-white shadow-2xl shadow-gray-200" 
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <item.icon 
                size={18} 
                className={`transition-transform duration-300 ${
                  isActive ? "text-blue-400" : "group-hover:scale-110"
                }`} 
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* ALT KISIM / ÇIKIŞ */}
      <div className="pt-8 border-t border-gray-100">
        <button className="flex items-center gap-4 px-6 py-5 w-full rounded-2xl font-black italic uppercase text-[11px] tracking-widest text-red-500 hover:bg-red-50 transition-all">
          <LogOut size={18} />
          Çıkış Yap
        </button>
      </div>
    </aside>
  );
}