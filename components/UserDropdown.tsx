"use client"
import { useState, useRef, useEffect } from "react"
import { signOut, useSession } from "next-auth/react"
import Link from "next/link"
import { 
  User, 
  MapPin, 
  PlusCircle, 
  Wallet,
  LogOut, 
  ChevronDown,
  ShieldCheck,
  LayoutDashboard,
  Package // 🚀 EKLENDİ
} from "lucide-react"

export default function UserDropdown() {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsOpen(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  if (!session) return null

  const user = session.user as any
  const isAdmin = user?.isAdmin === true
  const isSatici = user?.hesapTuru === "SATICI"

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 bg-gray-900 text-white px-5 py-2.5 rounded-2xl hover:bg-blue-600 transition-all duration-300 shadow-xl shadow-gray-200 group"
      >
        <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center text-[11px] font-black italic">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div className="text-left hidden sm:block">
          <p className="text-[9px] font-bold text-blue-300 uppercase tracking-[0.2em] leading-none mb-1 italic">Panelim</p>
          <p className="text-xs font-black uppercase italic tracking-tighter">{user?.name}</p>
        </div>
        <ChevronDown size={14} className={`text-white/50 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-4 w-72 bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-100 py-6 z-[9999] animate-in fade-in zoom-in-95 duration-200">
          <div className="px-8 pb-4 border-b border-gray-50 mb-4">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic mb-1">Hesap Detayı</p>
            <p className="text-xs font-bold text-gray-800 truncate">{user?.email}</p>
          </div>

          <div className="px-3 space-y-1" onClick={() => setIsOpen(false)}>
            {/* 🚀 SATICI ÖZEL: İlan Ver Butonu */}
            {isSatici && (
              <MenuLink 
                href="/ilan-ekle" 
                icon={<PlusCircle size={18} className="text-blue-600" />} 
                label="Hızlı İlan Ver" 
                extraClass="bg-blue-50 text-blue-700 hover:bg-blue-100 mb-2"
              />
            )}

            <MenuLink href="/panel" icon={<LayoutDashboard size={18} />} label="Genel Bakış" />
            
           {/* 🚀 YENİ EKLENDİ: HERKES İÇİN PAKETLERİM */}
<MenuLink href="/profil/paketlerim" icon={<Package size={18} className="text-blue-500" />} label="Paketlerim" />

            <MenuLink href="/cuzdan" icon={<Wallet size={18} />} label="Cüzdanım" />
            <MenuLink href="/adreslerim" icon={<MapPin size={18} />} label="Adreslerim" />
            <MenuLink href="/profil/ayarlar" icon={<User size={18} />} label="Profil Ayarları" />
            
            {isAdmin && (
              <div className="pt-2">
                <MenuLink 
                  href="/admin" 
                  icon={<ShieldCheck size={18} className="text-orange-500" />} 
                  label="Admin Paneli" 
                  extraClass="bg-orange-50 text-orange-700 hover:bg-orange-100"
                />
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-50 px-4">
            <button 
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-full flex items-center gap-4 px-6 py-4 text-[11px] font-black uppercase italic tracking-[0.2em] text-red-500 hover:bg-red-50 rounded-[1.5rem] transition-all"
            >
              <LogOut size={18} /> Güvenli Çıkış
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function MenuLink({ href, icon, label, extraClass = "" }: { href: string, icon: any, label: string, extraClass?: string }) {
  return (
    <Link 
      href={href} 
      className={`flex items-center gap-4 px-6 py-4 text-[11px] font-black uppercase italic tracking-[0.15em] text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-[1.5rem] transition-all group ${extraClass}`}
    >
      <span className="group-hover:scale-110 transition-transform">{icon}</span> {label}
    </Link>
  )
}