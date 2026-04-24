"use client";
import { useState, useEffect } from "react";
import { 
  DollarSign, Settings, Wallet, TrendingUp, CreditCard, 
  Search, Filter, CheckCircle, Clock, Loader2, Save 
} from "lucide-react";

export default function KomisyonRaporuPage() {
  const [raporlar, setRaporlar] = useState<any[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [arama, setArama] = useState("");
  const [donem, setDonem] = useState("BU_AY");

  // Global Komisyon Ayarı State'leri
  const [globalKomisyon, setGlobalKomisyon] = useState({ miktar: 5.00, mingaxPayi: 60 });
  const [ayarlarKaydediliyor, setAyarlarKaydediliyor] = useState(false);

  // İleride API'den gelecek istatistikler
  const [stats, setStats] = useState({
    toplamKomisyon: 0,
    mingaxPayi: 0,
    esnafPayi: 0,
    odenmemis: 0
  });

  useEffect(() => {
    // API Simülasyonu
    setTimeout(() => {
      setRaporlar([]);
      setYukleniyor(false);
    }, 1000);
  }, [donem]);

  const handleGlobalAyarKaydet = (e: React.FormEvent) => {
    e.preventDefault();
    setAyarlarKaydediliyor(true);
    setTimeout(() => {
      alert("Global komisyon ayarları başarıyla güncellendi. (İleride yeni eklenen noktalara bu değerler atanacak)");
      setAyarlarKaydediliyor(false);
    }, 800);
  };

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-8">
      
      {/* 🚀 BAŞLIK BÖLÜMÜ VE DÖNEM SEÇİCİ */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl font-black uppercase italic text-gray-900 flex items-center gap-3">
            <DollarSign className="text-green-600" size={32} />
            Komisyon Raporu
          </h1>
          <p className="text-gray-400 font-bold mt-1 uppercase text-sm tracking-widest">
            Mingax Teslimat Ağı kazanç ve ödeme yönetimi
          </p>
        </div>
        
        <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
          <button onClick={() => setDonem("BU_HAFTA")} className={`px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest transition-all ${donem === 'BU_HAFTA' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>Bu Hafta</button>
          <button onClick={() => setDonem("BU_AY")} className={`px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest transition-all ${donem === 'BU_AY' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>Bu Ay</button>
          <button onClick={() => setDonem("TUM_ZAMANLAR")} className={`px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest transition-all ${donem === 'TUM_ZAMANLAR' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>Tümü</button>
        </div>
      </div>

      {/* 🚀 ÖZET KARTLARI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Toplam Havuz" value={`₺${stats.toplamKomisyon}`} color="text-gray-900" bg="bg-white" border="border-gray-100" icon={<Wallet className="text-gray-200" size={48} />} />
        <StatCard title="Mingax Net Kazanç" value={`₺${stats.mingaxPayi}`} color="text-blue-600" bg="bg-blue-50" border="border-blue-100" icon={<TrendingUp className="text-blue-500 opacity-50" size={48} />} />
        <StatCard title="Esnaf Toplam Hakediş" value={`₺${stats.esnafPayi}`} color="text-green-600" bg="bg-green-50" border="border-green-100" icon={<DollarSign className="text-green-500 opacity-50" size={48} />} />
        <StatCard title="Bekleyen Ödemeler" value={`₺${stats.odenmemis}`} color="text-orange-600" bg="bg-orange-50" border="border-orange-200 shadow-lg shadow-orange-100" icon={<Clock className="text-orange-500 opacity-50" size={48} />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 🚀 GLOBAL KOMİSYON AYARLARI (SOL KOLON) */}
        <div className="lg:col-span-1 bg-gray-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl h-max">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Settings size={120} />
          </div>
          
          <div className="relative z-10">
            <h2 className="text-xl font-black uppercase italic tracking-widest text-white mb-2 flex items-center gap-2">
               <Settings size={20} className="text-blue-400" /> Global Ayarlar
            </h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-8">Sisteme yeni eklenecek noktalara atanacak varsayılan oranlar.</p>
            
            <form onSubmit={handleGlobalAyarKaydet} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2">Paket Başı Komisyon (₺)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-black">₺</span>
                  <input type="number" step="0.01" value={globalKomisyon.miktar} onChange={e => setGlobalKomisyon({...globalKomisyon, miktar: parseFloat(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-10 pr-4 text-white font-black focus:outline-none focus:border-blue-500 transition-colors" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2">Mingax Payı (%)</label>
                <div className="flex items-center gap-4">
                  <input type="range" min="0" max="100" value={globalKomisyon.mingaxPayi} onChange={e => setGlobalKomisyon({...globalKomisyon, mingaxPayi: parseInt(e.target.value)})} className="w-full accent-blue-500" />
                  <span className="text-2xl font-black italic text-blue-400">%{globalKomisyon.mingaxPayi}</span>
                </div>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-2 text-right">Esnaf Payı: %{100 - globalKomisyon.mingaxPayi}</p>
              </div>

              <button disabled={ayarlarKaydediliyor} type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all flex justify-center items-center gap-2 mt-4">
                {ayarlarKaydediliyor ? <Loader2 size={16} className="animate-spin" /> : <><Save size={16}/> Ayarları Kaydet</>}
              </button>
            </form>
          </div>
        </div>

        {/* 🚀 NOKTA BAZLI ÖDEME TABLOSU (SAĞ KOLON) */}
        <div className="lg:col-span-2 bg-white border-2 border-gray-100 rounded-[2.5rem] shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b-2 border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50/50">
            <h2 className="text-sm font-black uppercase tracking-widest text-gray-800 flex items-center gap-2">
              <CreditCard size={18} className="text-green-600"/> Esnaf Hakediş Tablosu
            </h2>
            <div className="relative w-full md:w-64">
               <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
               <input type="text" placeholder="Esnaf Ara..." value={arama} onChange={(e) => setArama(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-100 rounded-xl text-xs font-bold focus:outline-none focus:border-green-500 transition-colors" />
            </div>
          </div>

          <div className="overflow-x-auto custom-scrollbar flex-1">
            {yukleniyor ? (
               <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-green-500" size={40}/></div>
            ) : raporlar.length === 0 ? (
               <div className="p-20 text-center">
                 <Wallet size={48} className="mx-auto text-gray-200 mb-4" />
                 <h3 className="text-gray-400 font-black uppercase text-xl italic tracking-tighter">Henüz Rapor Yok</h3>
                 <p className="text-xs font-bold text-gray-400 mt-2">Bu döneme ait teslimat veya komisyon hareketi bulunamadı.</p>
               </div>
            ) : (
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50/80 text-gray-400 font-black uppercase text-[10px] tracking-widest border-b-2 border-gray-100">
                  <tr>
                    <th className="px-6 py-4">Esnaf Noktası</th>
                    <th className="px-6 py-4 text-center">Teslimat Sayısı</th>
                    <th className="px-6 py-4 text-right">Toplam (₺)</th>
                    <th className="px-6 py-4 text-right text-blue-600">Mingax (₺)</th>
                    <th className="px-6 py-4 text-right text-green-600">Esnaf (₺)</th>
                    <th className="px-6 py-4 text-center">Durum</th>
                    <th className="px-6 py-4 text-right">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-gray-50">
                   {/* Gelecekte API'den gelen veriler burada map() edilecek. 
                       "Ödeme Yap" butonu tıklanınca modal açılıp KomisyonIslem tablosuna yazacak. */}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

// Ufak İstatistik Kartı Bileşeni
function StatCard({ title, value, color, bg, border, icon }: { title: string, value: string | number, color: string, bg: string, border: string, icon: any }) {
  return (
    <div className={`${bg} border-2 ${border} p-6 rounded-[2rem] relative overflow-hidden group hover:-translate-y-1 transition-all`}>
      <div className="absolute right-[-10px] bottom-[-10px] group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 relative z-10">{title}</h3>
      <p className={`text-4xl font-black italic tracking-tighter ${color} relative z-10`}>{value}</p>
    </div>
  );
}