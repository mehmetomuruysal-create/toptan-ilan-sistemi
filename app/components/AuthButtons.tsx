"use client"
import { useState } from "react"
import Link from "next/link"
import { PlusCircle } from "lucide-react"
import RegisterModal from "./RegisterModal"
import LoginModal from "./LoginModal"

export default function AuthButtons() {
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)
  const [isLoginOpen, setIsLoginOpen] = useState(false)

  return (
    <div className="flex items-center gap-4">
      {/* İlan Ver Butonu */}
      <Link 
        href="/ilan-ekle" 
        className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2.5 rounded-xl hover:shadow-md hover:opacity-90 transition-all font-medium text-sm"
      >
        <PlusCircle size={18} />
        İlan Ver
      </Link>

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

      <RegisterModal isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} />
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} onOpenRegister={() => setIsRegisterOpen(true)} />
    </div>
  )
}