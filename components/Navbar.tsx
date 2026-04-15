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

  // Oturum yüklenirken boşluk bırakmamak için (opsiyonel)
  const isLoading = status === "loading"

  return (
    <>
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-[9999] border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex justify-between items-center">
          
          {/* LOGO */}
          <Link href="/" className="text-3xl font-black text-blue-600 italic tracking-tighter">
            MINGAX
          </Link>

          {/* SAĞ TARAF - AKSİYON ALANI */}
          <div className="flex items-center gap-4">
            {!isLoading && (
              <>
                {session ? (
                  /* GİRİŞ YAPILMIŞSA: Senin o şık panelin */
                  <UserDropdown />
                ) : (
                  /* GİRİŞ YAPILMAMIŞSA: Giriş ve Kayıt butonları */
                  <>
                    <button 
                      onClick={() => setIsLoginOpen(true)}
                      className="text-gray-700 font-bold text-sm px-4 py-2 hover:text-blue-600 transition-colors"
                    >
                      GİRİŞ YAP
                    </button>
                    
                    <button 
                      onClick={() => setIsRegisterOpen(true)}
                      className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all"
                    >
                      ÜCRETSİZ KATIL
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </nav>

      {/* MODALLAR (Sadece tetiklendiğinde açılırlar) */}
      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)}
        onOpenRegister={() => {
          setIsLoginOpen(false);   // Giriş modalını kapat
          setIsRegisterOpen(true); // Kayıt modalını aç
        }}
      />

      <RegisterModal 
        isOpen={isRegisterOpen} 
        onClose={() => setIsRegisterOpen(false)} 
      />
    </>
  )
}