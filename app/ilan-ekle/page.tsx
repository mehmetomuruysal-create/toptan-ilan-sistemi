"use client"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Loader2, Clock, ShieldAlert } from "lucide-react"

import BelgeOnayModal from "@/components/BelgeOnayModal"
import IlanEkleForm from "@/components/IlanEkleForm"

export default function IlanEklePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [showModal, setShowModal] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  
  // 🚀 Kullanıcının durumunu tutacağımız yeni stateler
  const [onayDurumu, setOnayDurumu] = useState<string | null>(null)
  const [belgeSayisi, setBelgeSayisi] = useState<number>(0)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/giris?callbackUrl=/ilan-ekle")
      return
    }
    
    const checkUserStatus = async () => {
      if (session?.user) {
        try {
          const res = await fetch("/api/user/status")
          const data = await res.json()
          
          // Gelen verileri state'e yazıyoruz ki sayfada kullanabilelim
          setOnayDurumu(data.onayDurumu)
          setBelgeSayisi(data.belgeSayisi)
          
          // Onaylı değilse ve belgeleri eksikse modalı direkt aç
          if (data.onayDurumu !== "APPROVED" && data.belgeSayisi < 5) {
            setShowModal(true)
          }
        } catch (error) {
          console.error("Durum çekilemedi:", error)
        }
      }
      setIsChecking(false)
    }

    if (status === "authenticated") checkUserStatus()
  }, [status, session, router])

  if (status === "loading" || isChecking) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-gray-900">
            Yeni İlan <span className="text-blue-600">Oluştur</span>
          </h1>
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-2 italic">
            Mingax Satıcı Paneli • Güvenli Ticaret Merkezi
          </p>
        </div>
        
        <div className="bg-white p-8 md:p-12 rounded-[3.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 min-h-[400px] flex flex-col justify-center">
          
          {/* 🚀 1. DURUM: YÖNETİCİ ONAYLAMIŞ - FORMU GÖSTER */}
          {onayDurumu === "APPROVED" ? (
            <IlanEkleForm saticiId={Number(session?.user?.id)} />
          ) : 
          
          /* 🚀 2. DURUM: BELGELER TAMAM AMA YÖNETİCİ ONAYI BEKLENİYOR */
          belgeSayisi >= 5 ? (
            <div className="text-center py-8 px-4 animate-in fade-in zoom-in-95 duration-500">
              <div className="w-24 h-24 bg-orange-50 text-orange-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-orange-100">
                <Clock size={48} />
              </div>
              <h2 className="text-3xl font-black uppercase italic tracking-tighter text-gray-900 mb-4">Evraklar İncelemede</h2>
              <p className="text-gray-500 font-bold text-sm max-w-md mx-auto leading-relaxed">
                Belgeleriniz başarıyla mühürlendi. Admin ekibimiz tarafından incelenip onaylandığı an burada ilan oluşturmaya başlayabilirsiniz.
              </p>
            </div>
          ) : 
          
          /* 🚀 3. DURUM: BELGELER EKSİK (Arka planda kalacak ekran) */
          (
            <div className="text-center py-8 px-4">
              <div className="w-24 h-24 bg-red-50 text-red-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-red-100">
                <ShieldAlert size={48} />
              </div>
              <h2 className="text-3xl font-black uppercase italic tracking-tighter text-gray-900 mb-4">Kısıtlı Erişim</h2>
              <p className="text-gray-500 font-bold text-sm max-w-md mx-auto leading-relaxed">
                İlan formuna erişmek için öncelikle satıcı doğrulama belgelerinizi yüklemelisiniz.
              </p>
              <button 
                onClick={() => setShowModal(true)} 
                className="mt-8 bg-gray-900 text-white px-8 py-4 rounded-2xl font-black uppercase italic text-[11px] tracking-widest hover:bg-blue-600 transition-all shadow-xl active:scale-95"
              >
                Belgeleri Yükle
              </button>
            </div>
          )}

        </div>
      </div>

      {showModal && (
        <BelgeOnayModal 
          userId={Number(session?.user?.id)} 
          onSuccess={() => {
            setShowModal(false);
            setBelgeSayisi(5); // 🚀 Modal kapandığında anında "İncelemede" ekranına geçmesi için state'i manuel 5 yapıyoruz.
          }} 
        />
      )}
    </div>
  )
}