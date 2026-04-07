"use client"
import { useState } from "react"
import Link from "next/link"
import { PlusCircle, LogOut } from "lucide-react"
import { useSession, signOut } from "next-auth/react"
import RegisterModal from "./RegisterModal"
import LoginModal from "./LoginModal"

export default function AuthButtons() {
  const { data: session, status } = useSession()
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)
  const [isLoginOpen, setIsLoginOpen] = useState(false)

  // Sistem oturumu kontrol ederken butonların yerinde boşluk olmasın diye iskelet gösteriyoruz
  if (status === "loading") {
    return <div className="flex gap-4"><div className="w-24 h-10 bg-gray-100 animate-pulse rounded-xl" /></div>
  }

  return (
    <div className="flex items-center gap-4">
      
      {/* --- EĞER KULLANICI GİRİŞ YAPMIŞSA --- */}
      {session ? (
        <>
          <Link 
            href="/ilan-ekle" 
            className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2.5 rounded-xl hover:shadow-md hover:opacity-90 transition-all font-medium text-sm"
          >
            <PlusCircle size={18} />
            İlan Ver
          </Link>

          <div className="flex items-center gap-3 ml-2 border-l border-gray-200 pl-4">
            <span className="text-sm font-bold text-gray-700 hidden md:block">
              {session.user?.name}
            </span>
            <button 
              onClick={() => signOut()} 
              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Çıkış Yap"
            >
              <LogOut size={18} />
            </button>
          </div>
        </>
      ) : (
        /* --- EĞER KULLANICI GİRİŞ YAPMAMIŞSA --- */
        <>
          <button 
            onClick={() => setIsLoginOpen(true)} 
            className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
          >
            Giriş Yap
          </button>
          
          <button 
            onClick={() => setIsRegisterOpen(true)} 
            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 hover:shadow-md transition-all"
          >
            Kayıt Ol
          </button>

          {/* Modallar (Sadece giriş yapmamışsa DOM'da barındırıyoruz) */}
          <LoginModal 
            isOpen={isLoginOpen} 
            onClose={() => setIsLoginOpen(false)} 
            onOpenRegister={() => {
              setIsLoginOpen(false)
              setIsRegisterOpen(true)
            }} 
          />
          <RegisterModal 
            isOpen={isRegisterOpen} 
            onClose={() => setIsRegisterOpen(false)} 
          />
        </>
      )}
    </div>
  )
}