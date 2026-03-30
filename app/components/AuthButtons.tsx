"use client"
import { useState } from "react"
import RegisterModal from "./RegisterModal"
import LoginModal from "./LoginModal"

export default function AuthButtons() {
  const[isRegisterOpen, setIsRegisterOpen] = useState(false)
  const [isLoginOpen, setIsLoginOpen] = useState(false)

  return (
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

      {/* Kayıt Modalı */}
      <RegisterModal 
        isOpen={isRegisterOpen} 
        onClose={() => setIsRegisterOpen(false)} 
      />

      {/* Giriş Modalı */}
      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)}
        onOpenRegister={() => setIsRegisterOpen(true)} // "Hesabım yok, kayıt ol" butonu için
      />
    </>
  )
}