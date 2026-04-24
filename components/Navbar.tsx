"use client"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { PlusCircle, ShieldAlert, Package, Search, User, Heart } from "lucide-react"
import UserDropdown from "@/components/UserDropdown"
import LoginModal from "@/components/LoginModal"
import RegisterModal from "@/components/RegisterModal"

export default function Navbar() {
  const { data: session, status } = useSession()
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)
  
  // 🚀 CANLI DURUM TAKİBİ (Backend mantığı %100 korundu)
  const [liveStatus, setLiveStatus] = useState<string | null>(null)

  const isLoading = status === "loading"
  const user = session?.user as any

  useEffect(() => {
    if (session?.user) {
      fetch("/api/auth/status")
        .then(res => res.json())
        .then(data => {
          if (data.onayDurumu) setLiveStatus(data.onayDurumu)
        })
        .catch(() => setLiveStatus(user?.onayDurumu))
    }
  }, [session, user?.onayDurumu])

  const currentOnayDurumu = liveStatus || user?.onayDurumu
  const isSatici = user?.hesapTuru === "SATICI"
  const isApproved = currentOnayDurumu === "APPROVED"

  return (
    <>
      <header className="bg-white sticky top-0 z-[9999] font-sans">
        
        {/* 1. ÜST İNCE ŞERİT (Yardım, Satış Yap vb.) */}
        <div className="bg-white border-b border-gray-100 hidden md:block">
          <div className="max-w-[1200px] mx-auto px-4 flex justify-end items-center h-8 text-[12px] text-gray-500 gap-6">
            <Link href="#" className="hover:text-mingax-orange transition-colors">İndirim Kuponlarım</Link>
            <Link href="#" className="hover:text-mingax-orange transition-colors">Mingax'ta Satış Yap</Link>
            <Link href="#" className="hover:text-mingax-orange transition-colors">Hakkımızda</Link>
            <Link href="#" className="hover:text-mingax-orange transition-colors">Yardım & Destek</Link>
          </div>
        </div>

        {/* 2. ANA BAR (Logo, Arama, İkonlu Menüler) */}
        <div className="max-w-[1200px] mx-auto px-4 h-[72px] flex items-center gap-8 justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-4 shrink-0">
            <Link href="/" className="text-3xl font-black text-gray-900 hover:text-mingax-orange transition-colors tracking-tight">
              mingax
            </Link>
            
            {/* ONAY UYARISI */}
            {isSatici && !isApproved && (
              <div className="hidden lg:flex items-center gap-1.5 bg-orange-50 text-mingax-orange px-3 py-1.5 rounded-md border border-orange-100 animate-pulse">
                <ShieldAlert size={14} />
                <span className="text-xs font-bold">Onay Bekliyor</span>
              </div>
            )}
          </div>

          {/* Geniş Arama Çubuğu */}
          <div className="flex-1 max-w-3xl relative hidden md:block">
            <input 
              type="text" 
              placeholder="Aradığınız ürün, kategori veya markayı yazınız" 
              className="w-full bg-mingax-gray/80 border-2 border-transparent focus:border-mingax-orange focus:bg-white rounded-md py-3 pl-4 pr-12 text-sm text-gray-700 outline-none transition-all placeholder:text-gray-500"
            />
            <Search size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-mingax-orange cursor-pointer" />
          </div>

          {/* SAĞ TARAF: Kullanıcı İşlemleri (Sade ve İkonlu) */}
          <div className="flex items-center gap-6 shrink-0">
            {!isLoading && (
              <>
                {session ? (
                  <div className="flex items-center gap-6">
                    
                    {/* Satıcıysa İlan Ver Butonu */}
                    {isSatici && (
                      <Link 
                        href={isApproved ? "/ilan-ekle" : "#"} 
                        onClick={(e) => !isApproved && e.preventDefault()}
                        className={`hidden sm:flex items-center gap-1.5 text-sm font-semibold transition-all ${
                          isApproved ? "text-mingax-orange hover:underline" : "text-gray-300 cursor-not-allowed"
                        }`}
                      >
                        <PlusCircle size={18} />
                        İlan Ver
                      </Link>
                    )}

                    {/* Profil / UserDropdown Alanı */}
                    <div className="flex items-center gap-2 group cursor-pointer hover:text-mingax-orange transition-colors">
                      <User size={18} className="text-gray-700 group-hover:text-mingax-orange" />
                      <UserDropdown /> 
                    </div>

                    {/* Paketlerim (Siparişim muadili) */}
                    <Link href="/profil/paketlerim" className="hidden sm:flex items-center gap-2 group hover:text-mingax-orange transition-colors">
                      <Package size={18} className="text-gray-700 group-hover:text-mingax-orange" />
                      <span className="text-sm font-semibold text-gray-700 group-hover:text-mingax-orange">Paketlerim</span>
                    </Link>

                    {/* Favorilerim */}
                    <Link href="/favoriler" className="hidden lg:flex items-center gap-2 group hover:text-mingax-orange transition-colors">
                      <Heart size={18} className="text-gray-700 group-hover:text-mingax-orange" />
                      <span className="text-sm font-semibold text-gray-700 group-hover:text-mingax-orange">Favorilerim</span>
                    </Link>

                  </div>
                ) : (
                  <div className="flex items-center gap-6">
                    {/* GİRİŞ YAP */}
                    <div 
                      onClick={() => setIsLoginOpen(true)}
                      className="flex items-center gap-2 group cursor-pointer hover:text-mingax-orange transition-colors"
                    >
                      <User size={18} className="text-gray-700 group-hover:text-mingax-orange" />
                      <span className="text-sm font-semibold text-gray-700 group-hover:text-mingax-orange">Giriş Yap</span>
                    </div>

                    {/* FAVORİLERİM (Giriş yapmadan da görünebilir) */}
                    <div className="hidden sm:flex items-center gap-2 group cursor-pointer hover:text-mingax-orange transition-colors">
                      <Heart size={18} className="text-gray-700 group-hover:text-mingax-orange" />
                      <span className="text-sm font-semibold text-gray-700 group-hover:text-mingax-orange">Favorilerim</span>
                    </div>

                    {/* ÜYE OL */}
                    <div 
                      onClick={() => setIsRegisterOpen(true)}
                      className="flex items-center gap-2 group cursor-pointer hover:text-mingax-orange transition-colors"
                    >
                      <span className="text-sm font-semibold text-mingax-orange">Üye Ol</span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* 3. ALT KATEGORİ MENÜSÜ (Bant) */}
        <div className="border-b border-gray-200 hidden md:block">
          <div className="max-w-[1200px] mx-auto px-4 h-11 flex items-center gap-8 text-sm font-semibold text-gray-700">
            <Link href="#" className="border-b-2 border-mingax-orange text-mingax-orange pb-[11px] pt-[13px]">Gıda Toptan</Link>
            <Link href="#" className="hover:text-mingax-orange transition-colors">Elektronik</Link>
            <Link href="#" className="hover:text-mingax-orange transition-colors">Tekstil & Giyim</Link>
            <Link href="#" className="hover:text-mingax-orange transition-colors">Ambalaj & Kutu</Link>
            <Link href="#" className="hover:text-mingax-orange transition-colors">Yapı Market</Link>
            <Link href="#" className="hover:text-mingax-orange transition-colors">Kozmetik</Link>
            <Link href="#" className="hover:text-mingax-orange transition-colors flex items-center gap-1">
              Fırsat Ürünleri <span className="bg-[#f00] text-white text-[10px] px-1.5 py-0.5 rounded ml-1">Yeni</span>
            </Link>
          </div>
        </div>
      </header>

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