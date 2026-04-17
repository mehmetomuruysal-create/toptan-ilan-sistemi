"use client"
import { useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import UserDropdown from "./UserDropdown"
import LoginModal from "./LoginModal"
import RegisterModal from "./RegisterModal"

export default function Navbar() {
  const { data: session, status } = useSession()
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)

  // Oturum yüklenirken butonların titrememesi için
  const isLoading = status === "loading"

  return (
    <>
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-[9999] border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex justify-between items-center">
          
          {/* 🚀 LOGO - Mingax Kimliği */}
          <Link href="/" className="text-3xl font-black text-blue-600 italic tracking-tighter hover:scale-105 transition-transform">
            MINGAX
          </Link>

          {/* SAĞ TARAF - AKSİYON ALANI */}
          <div className="flex items-center gap-4">
            {!isLoading && (
              <>
                {session ? (
                  /* ✅ GİRİŞ YAPILMIŞSA: Tüm yetki kontrolleri bu bileşenin içinde */
                  <UserDropdown />
                ) : (
                  /* ❌ GİRİŞ YAPILMAMIŞSA: Giriş ve Kayıt butonları */
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setIsLoginOpen(true)}
                      className="text-gray-900 font-black uppercase italic text-[11px] tracking-widest px-6 py-3 hover:text-blue-600 transition-colors"
                    >
                      GİRİŞ YAP
                    </button>
                    
                    <button 
                      onClick={() => setIsRegisterOpen(true)}
                      className="bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-black uppercase italic text-[11px] tracking-[0.15em] hover:bg-gray-900 shadow-xl shadow-blue-100 hover:shadow-gray-200 transition-all active:scale-95"
                    >
                      ÜCRETSİZ KATIL
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </nav>

      {/* MODALLAR */}
      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)}
        onOpenRegister={() => {
          setIsLoginOpen(false);
          setIsRegisterOpen(true);
        }}
      />

      <RegisterModal 
        isOpen={isRegisterOpen} 
        onClose={() => setIsRegisterOpen(false)} 
      />
    </>
  )
}