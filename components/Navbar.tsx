"use client"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { PlusCircle, ShieldAlert } from "lucide-react"
import UserDropdown from "@/components/UserDropdown"
import LoginModal from "@/components/LoginModal"
import RegisterModal from "@/components/RegisterModal"

export default function Navbar() {
  const { data: session, status } = useSession()
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)
  
  // 🚀 CANLI DURUM TAKİBİ
  const [liveStatus, setLiveStatus] = useState<string | null>(null)

  const isLoading = status === "loading"
  const user = session?.user as any

  // 🔄 Kullanıcı onaylandığı an Navbar'ı güncellemek için canlı kontrol
  useEffect(() => {
    if (session?.user) {
      // API'den güncel durumu çek (Bu endpoint'i aşağıda belirteceğim)
      fetch("/api/auth/status")
        .then(res => res.json())
        .then(data => {
          if (data.onayDurumu) setLiveStatus(data.onayDurumu)
        })
        .catch(() => setLiveStatus(user?.onayDurumu)) // Hata olursa session'a dön
    }
  }, [session, user?.onayDurumu])

  // 🚀 Mantık: Eğer canlı veri geldiyse onu kullan, yoksa session'dakini kullan
  const currentOnayDurumu = liveStatus || user?.onayDurumu
  const isSatici = user?.hesapTuru === "SATICI"
  const isApproved = currentOnayDurumu === "APPROVED"

  return (
    <>
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-[9999] border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex justify-between items-center">
          
          <div className="flex items-center gap-6">
            <Link href="/" className="text-3xl font-black text-blue-600 italic tracking-tighter hover:scale-105 transition-transform">
              MINGAX
            </Link>

            {/* 🚀 ONAY UYARISI - Artık Canlı Veriye Bakıyor */}
            {isSatici && !isApproved && (
              <div 
                className="hidden lg:flex items-center gap-2 bg-orange-50 text-orange-700 px-4 py-2 rounded-full border border-orange-100 animate-pulse transition-all"
              >
                <ShieldAlert size={14} />
                <span className="text-[10px] font-black uppercase italic tracking-widest">Hesap Onay Bekliyor</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {!isLoading && (
              <>
                {session ? (
                  <div className="flex items-center gap-4">
                    {/* 🚀 İLAN VER BUTONU - Sadece Onaylı Satıcıya Full Görünür, Diğerine Kısıtlı */}
                    {isSatici && (
                      <Link 
                        href={isApproved ? "/ilan-ekle" : "#"} 
                        onClick={(e) => !isApproved && e.preventDefault()}
                        className={`hidden sm:flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-[11px] uppercase italic tracking-widest transition-all shadow-lg active:scale-95 ${
                          isApproved 
                          ? "bg-blue-600 text-white hover:bg-gray-900 shadow-blue-100" 
                          : "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
                        }`}
                      >
                        <PlusCircle size={16} />
                        İlan Ver
                      </Link>
                    )}
                    <UserDropdown />
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setIsLoginOpen(true)}
                      className="text-gray-900 font-black uppercase italic text-[11px] tracking-widest px-6 py-3 hover:text-blue-600 transition-colors"
                    >
                      GİRİŞ YAP
                    </button>
                    
                    <button 
                      onClick={() => setIsRegisterOpen(true)}
                      className="bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-black uppercase italic text-[11px] tracking-[0.15em] hover:bg-gray-900 shadow-xl shadow-blue-100 transition-all active:scale-95"
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