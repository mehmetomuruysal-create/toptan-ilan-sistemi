import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { 
  ShieldAlert, 
  PlusCircle, 
  Package, 
  Wallet, 
  Settings,
  ArrowUpRight 
} from "lucide-react"

export default async function PanelPage() {
  const session = await auth()
  
  // 🔐 Güvenlik: Giriş yapmamışsa yönlendir
  if (!session) redirect("/giris")

  const user = session.user as any
  const isSatici = user?.hesapTuru === "SATICI"
  const isApproved = user?.onayDurumu === "APPROVED"

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      
      {/* 🚀 KRİTİK ONAY BANNERI (Sadece Onaysız Satıcılar Görür) */}
      {isSatici && !isApproved && (
        <div className="mb-12 p-8 bg-orange-50 border-2 border-orange-100 rounded-[3rem] flex flex-col md:flex-row items-center gap-8 shadow-2xl shadow-orange-100/30 animate-in slide-in-from-top duration-500">
          <div className="bg-white p-6 rounded-[2.5rem] text-orange-500 shadow-sm border border-orange-50 shrink-0">
            <ShieldAlert size={48} />
          </div>
          <div className="text-center md:text-left space-y-2">
            <h4 className="font-black uppercase text-lg tracking-[0.2em] text-orange-800 italic">Hesap Onayı Bekleniyor</h4>
            <p className="text-sm font-bold text-orange-700/80 leading-relaxed max-w-2xl">
              Satıcı profiliniz şu an inceleme aşamasında. İlanlarınızın yayına girmesi ve satış yapabilmeniz için lütfen belgelerinizi profil ayarlarından tamamlayın.
            </p>
          </div>
          <div className="md:ml-auto">
            <Link 
              href="/profil/ayarlar" 
              className="bg-orange-600 text-white px-10 py-5 rounded-2xl font-black uppercase italic text-xs tracking-widest hover:bg-orange-700 transition-all flex items-center gap-2"
            >
              Belgeleri Yükle
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      )}

      {/* --- PANEL BAŞLIĞI --- */}
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter uppercase italic leading-none mb-4">
            Hoş Geldin, {user?.name?.split(" ")[0]}
          </h1>
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest italic">
            {isSatici ? "SATICI PANELİ" : "ALICI PANELİ"} • {new Date().toLocaleDateString('tr-TR')}
          </p>
        </div>
        
        {isSatici && (
          <Link 
            href="/talep/yeni" 
            className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase italic text-xs tracking-widest hover:bg-gray-900 transition-all shadow-xl shadow-blue-100 flex items-center gap-3"
          >
            <PlusCircle size={20} />
            YENİ İLAN OLUŞTUR
          </Link>
        )}
      </div>

      {/* --- ÖZET KARTLARI --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard icon={<Package className="text-blue-600" />} label="AKTİF İLANLARIM" value="0" />
        <StatCard icon={<Wallet className="text-green-600" />} label="CÜZDAN BAKİYESİ" value="₺0,00" />
        <StatCard icon={<Settings className="text-purple-600" />} label="TAMAMLANAN TALEPLER" value="0" />
      </div>

    </div>
  )
}

function StatCard({ icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="bg-white p-8 rounded-[3rem] border border-gray-100 hover:shadow-2xl hover:shadow-gray-100 transition-all group">
      <div className="bg-gray-50 w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 italic">{label}</p>
      <p className="text-3xl font-black text-gray-900 italic tracking-tighter">{value}</p>
    </div>
  )
}