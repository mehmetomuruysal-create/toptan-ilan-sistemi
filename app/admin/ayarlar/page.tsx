import { prisma } from "@/lib/prisma"
import RatioManager from "@/components/admin/RatioManager"
import { Settings, LayoutGrid, Rocket, Info, Landmark, ShieldCheck } from "lucide-react"

export default async function AdminSettingsPage() {
  // 🚀 1. Veritabanından mevcut global ayarları çek (SystemSettings tablosu)
  const systemSettings = await prisma.systemSettings.findFirst();
  
  // 🚀 2. Kategorileri çek (Kategori bazlı oranlar için)
  const kategoriler = await prisma.category.findMany({
    orderBy: { name: 'asc' }
  });

  // Varsayılan değerler (Eğer tablo boşsa "Anayasa" değerlerini kullan)
  const defaultValues = {
    totalComm: systemSettings?.defaultTotalComm ?? 15.0,
    initRatio: systemSettings?.defaultInitRatio ?? 0.75,
    refRatio: systemSettings?.defaultRefRatio ?? 2.25,
  };

  return (
    <div className="min-h-screen bg-white p-8 md:p-20">
      <div className="max-w-6xl mx-auto space-y-20">
        
        {/* --- SAYFA BAŞLIĞI --- */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b-4 border-gray-900 pb-12">
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-900 rounded-[2rem] flex items-center justify-center text-white shadow-2xl rotate-3">
                <Landmark size={32} />
              </div>
              <h1 className="text-6xl font-black italic uppercase tracking-tighter text-gray-900 leading-none">
                Para <span className="text-blue-600">Merkezi</span>
              </h1>
            </div>
            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.3em] ml-2">
              Finansal Dağıtım ve Komisyon Yönetim Üssü
            </p>
          </div>
          
          <div className="bg-gray-50 px-8 py-4 rounded-[2rem] border border-gray-100 flex items-center gap-4 shadow-sm">
            <ShieldCheck className="text-green-500" size={24} />
            <div>
              <p className="text-[10px] font-black uppercase text-gray-400 leading-none mb-1">Sistem Durumu</p>
              <p className="text-xs font-black uppercase italic text-gray-900">Hesaplama Motoru Aktif</p>
            </div>
          </div>
        </header>

        {/* --- 1. GLOBAL SİSTEM AYARLARI --- */}
        <section className="space-y-8">
          <div className="flex items-center gap-3 ml-4">
            <Settings size={20} className="text-blue-600 animate-spin-slow" />
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-gray-900 italic">Global Dağıtım Anahtarı</h2>
          </div>
          
          <RatioManager 
            title="Sistem Geneli Varsayılan Oranlar" 
            type="global"
            initialData={defaultValues} 
          />
          
          <div className="px-10 py-8 bg-blue-50 rounded-[3rem] border border-blue-100 flex items-start gap-6 relative overflow-hidden">
            <Info size={32} className="text-blue-600 shrink-0 mt-1" />
            <div className="space-y-2 relative z-10">
              <p className="text-xs font-black text-blue-900 uppercase italic">Kritik Bilgi:</p>
              <p className="text-[11px] font-bold text-blue-800 uppercase italic leading-relaxed opacity-80">
                Buradaki oranlar Mingax'ın "Fabrika Ayarları"dır. İlan veya Kategori bazlı bir istisna 
                tanımlanmadığı sürece tüm sistem bu oranlar üzerinden "Tasarruf Farkı (Diff)" dağıtır.
              </p>
            </div>
            <div className="absolute -right-8 -bottom-8 opacity-5">
                <Settings size={120} />
            </div>
          </div>
        </section>

        {/* --- 2. KATEGORİ BAZLI ÖZEL AYARLAR --- */}
        <section className="space-y-8 pt-10">
          <div className="flex items-center gap-3 ml-4">
            <LayoutGrid size={20} className="text-purple-600" />
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-gray-900 italic">Kategori İstisnaları</h2>
          </div>
          
          <div className="grid grid-cols-1 gap-12">
             {kategoriler.length > 0 ? (
               kategoriler.map((kat) => (
                 <div key={kat.id} className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-[3.5rem] blur opacity-5 group-hover:opacity-10 transition duration-1000"></div>
                    <RatioManager 
                        id={kat.id}
                        title={`${kat.name}`} 
                        type="special"
                        initialData={{
                            totalComm: kat.commRatio ?? defaultValues.totalComm,
                            initRatio: kat.initRatio ?? defaultValues.initRatio,
                            refRatio: kat.refRatio ?? defaultValues.refRatio
                        }}
                    />
                 </div>
               ))
             ) : (
               <div className="p-20 bg-gray-50 rounded-[4rem] text-center border-4 border-dashed border-gray-100">
                  <p className="text-gray-400 font-black italic uppercase text-lg tracking-widest">Henüz Kategori Tanımlanmadı.</p>
               </div>
             )}
          </div>
        </section>

        {/* --- 3. KAMPANYA MODU --- */}
        <section className="space-y-8 pt-10">
          <div className="flex items-center gap-3 ml-4">
            <Rocket size={20} className="text-orange-600" />
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-gray-900 italic">Flaş Kampanya Motoru</h2>
          </div>
          <div className="p-20 bg-gray-900 rounded-[4rem] text-center relative overflow-hidden shadow-2xl group transition-all duration-500 hover:scale-[1.01]">
             <div className="relative z-10 space-y-8">
                <h3 className="text-white font-black italic uppercase tracking-tighter text-3xl">
                  Global Kampanya Aktif Değil
                </h3>
                <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.3em] max-w-md mx-auto leading-relaxed">
                  Tüm kategorileri ve ilanları etkileyecek tek seferlik büyük bir indirim/ödül haftası başlatabilirsiniz.
                </p>
                <button className="bg-white text-gray-900 px-16 py-6 rounded-2xl font-black uppercase text-xs tracking-[0.3em] hover:bg-blue-600 hover:text-white transition-all shadow-2xl">
                    Kampanya Kurulumu Başlat
                </button>
             </div>
             
             {/* Animasyonlu Arka Plan Efektleri */}
             <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full group-hover:bg-blue-600/20 transition-all duration-700"></div>
             <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/10 blur-[120px] rounded-full group-hover:bg-purple-600/20 transition-all duration-700"></div>
          </div>
        </section>

      </div>
    </div>
  )
}