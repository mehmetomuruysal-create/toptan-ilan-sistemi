"use client"
import { useState, useRef, useEffect } from "react"
import { signOut, useSession } from "next-auth/react"
import Link from "next/link"
import { 
  User, 
  MapPin, 
  PlusCircle, 
  LogOut, 
  ChevronDown,
  ShieldCheck
} from "lucide-react"

export default function UserDropdown() {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Menüyü kapatmak için yardımcı fonksiyon
  const closeDropdown = () => setIsOpen(false)

  // Dışarı tıklayınca kapatma
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  if (!session) return null

  const isAdmin = (session.user as any)?.isAdmin === true

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Tetikleyici Buton */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-2xl transition-all duration-200 border border-gray-100"
      >
        <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white text-xs font-black">
          {session.user?.name?.charAt(0).toUpperCase()}
        </div>
        <div className="text-left hidden sm:block">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Hesabım</p>
          <p className="text-sm font-black text-gray-900 leading-tight">{session.user?.name}</p>
        </div>
        <ChevronDown size={16} className={`text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menü */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-64 bg-white rounded-[2rem] shadow-2xl border border-gray-100 py-3 z-[100] animate-in fade-in zoom-in-95 duration-200">
          
          <div className="px-6 py-3 border-b border-gray-50 mb-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Hoş Geldin</p>
            <p className="text-sm font-black text-gray-800 truncate">{session.user?.email}</p>
          </div>

          {/* 🎯 Tıklama Yakalayıcı div: İçindeki herhangi bir Link'e basıldığında menüyü kapatır */}
          <div className="px-2 space-y-1" onClick={closeDropdown}>
            <MenuLink href="/profil" icon={<User size={18} />} label="Profilim" />
            <MenuLink href="/adreslerim" icon={<MapPin size={18} />} label="Adreslerim" />
            <MenuLink href="/ilan-ekle" icon={<PlusCircle size={18} />} label="İlan Ekle" />
            
            {isAdmin && (
              <MenuLink 
                href="/admin" 
                icon={<ShieldCheck size={18} className="text-orange-500" />} 
                label="Admin Paneli" 
                extraClass="bg-orange-50/50 text-orange-700 hover:bg-orange-100"
              />
            )}
          </div>

          <div className="mt-4 pt-2 border-t border-gray-50 px-2">
            <button 
              onClick={() => {
                closeDropdown();
                signOut({ callbackUrl: "/" });
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-2xl transition-colors"
            >
              <LogOut size={18} />
              Çıkış Yap
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
      className={`flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 rounded-2xl transition-colors ${extraClass}`}
    >
      {icon}
      {label}
    </Link>
  )
}