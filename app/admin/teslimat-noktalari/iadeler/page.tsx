"use client";
import { useState, useEffect } from "react";
import { 
  RotateCcw, PackageX, Truck, Archive, CheckCircle, 
  Search, Filter, Eye, Loader2, RefreshCcw, HandCoins
} from "lucide-react";
import Link from "next/link";

export default function IadelerPage() {
  const [iadeler, setIadeler] = useState<any[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [arama, setArama] = useState("");

  // İleride API'den gelecek dinamik istatistikler
  const [stats, setStats] = useState({
    bekleyen: 0, // Esnafta kurye bekleyenler
    yolda: 0,    // Kurye gidip aldı, yolda
    depoda: 0,   // Mingax deposuna ulaştı
    tamamlanan: 0 // Para iadesi yapıldı, süreç bitti
  });

  useEffect(() => {
    // API simülasyonu (İleride /api/admin/paketler/iadeler yazacağız)
    setTimeout(() => {
      setIadeler([]); 
      setYukleniyor(false);
    }, 1000);
  }, []);

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-8">
      
      {/* 🚀 BAŞLIK BÖLÜMÜ */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl font-black uppercase italic text-gray-900 flex items-center gap-3">
            <RotateCcw className="text-red-600" size={32} />
            İade Yönetimi
          </h1>
          <p className="text-gray-400 font-bold mt-1 uppercase text-sm tracking-widest">
            Noktalardan toplanacak, depoya dönen ve iadesi yapılacak paketler
          </p>
        </div>
      </div>

      {/* 🚀 ÜST KARTLAR (Master Plandaki Aşamalar) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Esnafta Bekleyen" value={stats.bekleyen} color="text-orange-600" bg="bg-orange-50" border="border-orange-100" icon={<PackageX className="text-orange-500 opacity-50" size={48} />} />
        <StatCard title="Kurye Yolda" value={stats.yolda} color="text-blue-600" bg="bg-blue-50" border="border-blue-100" icon={<Truck className="text-blue-500 opacity-50" size={48} />} />
        <StatCard title="Mingax Deposunda" value={stats.depoda} color="text-purple-600" bg="bg-purple-50" border="border-purple-100" icon={<Archive className="text-purple-500 opacity-50" size={48} />} />
        <StatCard title="Tamamlanan İade" value={stats.tamamlanan} color="text-green-600" bg="bg-green-50" border="border-green-100" icon={<CheckCircle className="text-green-500 opacity-50" size={48} />} />
      </div>

      {/* 🚀 TABLO VE FİLTRELER */}
      <div className="bg-white border-2 border-gray-100 rounded-[2.5rem] shadow-sm overflow-hidden">
        
        {/* Kontrol Çubuğu */}
        <div className="p-6 border-b-2 border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6 bg-gray-50/50">
          <div className="flex items-center gap-4 w-full md:w-auto">
             <select className="bg-white border-2 border-gray-100 rounded-2xl px-4 py-4 text-sm font-bold text-gray-600 focus:outline-none focus:border-red-500 w-full md:w-56">
                <option value="">Tüm Durumlar</option>
                <option value="IADE_BEKLIYOR">Esnafta Bekleyenler</option>
                <option value="MINGAX_DEPOSUNDA">Depoya Gelenler</option>
             </select>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
             <div className="relative w-full md:w-72">
               <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
               <input 
                 type="text" 
                 placeholder="Sipariş No, ID veya Nokta Ara..." 
                 value={arama}
                 onChange={(e) => setArama(e.target.value)}
                 className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:border-red-500 transition-colors"
               />
             </div>
             <button className="p-4 bg-white border-2 border-gray-100 rounded-2xl text-gray-600 hover:bg-gray-50 hover:text-red-600 transition-colors">
                <Filter size={18} />
             </button>
          </div>
        </div>

        {/* Tablo Görünümü */}
        <div className="overflow-x-auto custom-scrollbar">
          {yukleniyor ? (
             <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-red-500" size={48}/></div>
          ) : iadeler.length === 0 ? (
             <div className="p-24 text-center">
               <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-50 mb-6">
                 <RefreshCcw size={40} className="text-red-300" />
               </div>
               <h3 className="text-gray-400 font-black uppercase text-2xl italic tracking-tighter">İade Kaydı Bulunmuyor</h3>
               <p className="text-sm font-bold text-gray-400 mt-2 tracking-widest">Şu anda süreci devam eden bir iade paketi yok.</p>
             </div>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50/80 text-gray-400 font-black uppercase text-[10px] tracking-widest border-b-2 border-gray-100">
                <tr>
                  <th className="px-6 py-5">Paket & Sipariş</th>
                  <th className="px-6 py-5">İade Nedeni</th>
                  <th className="px-6 py-5">Teslimat Noktası (Nereden Alınacak?)</th>
                  <th className="px-6 py-5">Tarih</th>
                  <th className="px-6 py-5">Durum</th>
                  <th className="px-6 py-5 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-gray-50">
                {/* Buraya veri geldiğinde map() fonksiyonu dönecek.
                  Durum bazlı butonlar eklenecek:
                  - IADE_BEKLIYOR ise -> "Kurye Ata" butonu
                  - KURYE_YOLDA ise -> "Depoya Teslim Al" butonu
                  - MINGAX_DEPOSUNDA ise -> "Para İadesi Başlat" butonu
                */}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

// İstatistik Kartı Component'i
function StatCard({ title, value, color, bg, border, icon }: { title: string, value: number, color: string, bg: string, border: string, icon: any }) {
  return (
    <div className={`${bg} border-2 ${border} p-6 rounded-[2rem] relative overflow-hidden group hover:-translate-y-1 transition-all shadow-sm`}>
      <div className="absolute right-[-10px] bottom-[-10px] group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 relative z-10">{title}</h3>
      <p className={`text-5xl font-black italic tracking-tighter ${color} relative z-10`}>{value}</p>
    </div>
  );
}