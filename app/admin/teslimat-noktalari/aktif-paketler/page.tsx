"use client";
import { useState, useEffect } from "react";
import { 
  Box, AlertTriangle, Clock, CheckCircle, Search, Filter, 
  RotateCcw, MapPin, Eye, Loader2, AlertCircle 
} from "lucide-react";

export default function AktifPaketlerPage() {
  const [paketler, setPaketler] = useState<any[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [seciliPaketler, setSeciliPaketler] = useState<string[]>([]);
  const [arama, setArama] = useState("");
  const [stats, setStats] = useState({ normal: 0, yaklasan: 0, uyari: 0, kritik: 0 });

  useEffect(() => {
    fetch("/api/admin/paketler/aktif")
      .then(res => res.json())
      .then(res => {
        if (res.success) {
          setPaketler(res.data);
          hesaplaIstatistikler(res.data);
        }
        setYukleniyor(false);
      })
      .catch(() => setYukleniyor(false));
  }, []);

  const hesaplaIstatistikler = (data: any[]) => {
    let s = { normal: 0, yaklasan: 0, uyari: 0, kritik: 0 };
    data.forEach(p => {
      // 6 günlük toplam süreden kalan günü çıkarıp, kaç gündür beklediğini buluyoruz
      const kalanGun = Math.ceil((new Date(p.sonAlimTarihi).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
      const beklemeGunu = 6 - kalanGun; 

      if (beklemeGunu >= 6) s.kritik++;
      else if (beklemeGunu === 5) s.uyari++;
      else if (beklemeGunu === 3 || beklemeGunu === 4) s.yaklasan++;
      else s.normal++; // 1 veya 2. gün
    });
    setStats(s);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) setSeciliPaketler(paketler.map(p => p.id));
    else setSeciliPaketler([]);
  };

  const handleSelect = (id: string) => {
    setSeciliPaketler(prev => prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]);
  };

  const filteredPaketler = paketler.filter(p => 
    p.id.toLowerCase().includes(arama.toLowerCase()) || 
    p.katilimId.toString().includes(arama) ||
    p.nokta?.ad.toLowerCase().includes(arama.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-8">
      
      {/* BAŞLIK */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl font-black uppercase italic text-gray-900 flex items-center gap-3">
            <Box className="text-blue-600" size={32} />
            Aktif Paket Takibi
          </h1>
          <p className="text-gray-400 font-bold mt-1 uppercase text-sm tracking-widest">
            Tüm teslimat noktalarındaki bekleyen paketlerin merkezi yönetimi
          </p>
        </div>
        
        {seciliPaketler.length > 0 && (
          <button className="bg-red-600 text-white px-8 py-4 rounded-2xl font-black uppercase flex items-center justify-center gap-2 hover:bg-red-700 transition-all shadow-xl active:scale-95 animate-in fade-in zoom-in duration-300">
            <RotateCcw size={20} /> Seçili ({seciliPaketler.length}) Paketi İade Et
          </button>
        )}
      </div>

      {/* SAYAÇLAR */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Normal (1-2 Gün)" value={stats.normal} color="text-blue-600" bg="bg-blue-50" border="border-blue-100" icon={<CheckCircle className="text-blue-500 opacity-50" size={48} />} />
        <StatCard title="Yaklaşıyor (3-4 Gün)" value={stats.yaklasan} color="text-yellow-600" bg="bg-yellow-50" border="border-yellow-100" icon={<Clock className="text-yellow-500 opacity-50" size={48} />} />
        <StatCard title="İade Uyarı (5. Gün)" value={stats.uyari} color="text-orange-600" bg="bg-orange-50" border="border-orange-100" icon={<AlertTriangle className="text-orange-500 opacity-50" size={48} />} />
        <StatCard title="Kritik (6. Gün - İade!)" value={stats.kritik} color="text-red-600" bg="bg-red-50" border="border-red-200 shadow-lg shadow-red-100" icon={<AlertCircle className="text-red-500 opacity-50" size={48} />} />
      </div>

      {/* FİLTRE VE TABLO */}
      <div className="bg-white border-2 border-gray-100 rounded-[2.5rem] shadow-sm overflow-hidden">
        
        <div className="p-6 border-b-2 border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6 bg-gray-50/50">
          <div className="flex items-center gap-4 w-full md:w-auto">
             <select className="bg-white border-2 border-gray-100 rounded-2xl px-4 py-4 text-sm font-bold text-gray-600 focus:outline-none focus:border-blue-500 w-full md:w-48">
                <option value="">Tüm Noktalar</option>
             </select>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
             <div className="relative w-full md:w-72">
               <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
               <input 
                 type="text" 
                 placeholder="Sipariş No veya ID Ara..." 
                 value={arama}
                 onChange={(e) => setArama(e.target.value)}
                 className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-100 rounded-2xl text-sm font-bold focus:outline-none focus:border-blue-500 transition-colors"
               />
             </div>
             <button className="p-4 bg-white border-2 border-gray-100 rounded-2xl text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors">
                <Filter size={18} />
             </button>
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          {yukleniyor ? (
             <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-blue-500" size={48}/></div>
          ) : filteredPaketler.length === 0 ? (
             <div className="p-20 text-center">
               <Box size={64} className="mx-auto text-gray-200 mb-4" />
               <h3 className="text-gray-400 font-black uppercase text-xl italic tracking-tighter">Aktif Paket Bulunamadı</h3>
               <p className="text-sm font-bold text-gray-400 mt-2">Şu an sistemde esnaflarda bekleyen paket yok.</p>
             </div>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50/80 text-gray-400 font-black uppercase text-[10px] tracking-widest border-b-2 border-gray-100">
                <tr>
                  <th className="px-6 py-5 w-10">
                    <input type="checkbox" onChange={handleSelectAll} checked={seciliPaketler.length === filteredPaketler.length && filteredPaketler.length > 0} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600" />
                  </th>
                  <th className="px-6 py-5">Paket & Sipariş</th>
                  <th className="px-6 py-5">Teslimat Noktası</th>
                  <th className="px-6 py-5">Kalan Süre</th>
                  <th className="px-6 py-5">Durum</th>
                  <th className="px-6 py-5 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-gray-50">
                 {filteredPaketler.map((paket) => {
                    const kalanGun = Math.ceil((new Date(paket.sonAlimTarihi).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
                    const beklemeGunu = 6 - kalanGun;
                    
                    let durumRenk = "bg-blue-100 text-blue-700";
                    let durumYazi = "Normal";
                    if (beklemeGunu >= 6) { durumRenk = "bg-red-100 text-red-700"; durumYazi = "Kritik İade"; }
                    else if (beklemeGunu === 5) { durumRenk = "bg-orange-100 text-orange-700"; durumYazi = "Uyarı"; }
                    else if (beklemeGunu === 3 || beklemeGunu === 4) { durumRenk = "bg-yellow-100 text-yellow-700"; durumYazi = "Yaklaşıyor"; }

                    return (
                      <tr key={paket.id} className={`transition-colors hover:bg-gray-50 ${seciliPaketler.includes(paket.id) ? 'bg-blue-50/50' : ''}`}>
                        <td className="px-6 py-6">
                          <input type="checkbox" checked={seciliPaketler.includes(paket.id)} onChange={() => handleSelect(paket.id)} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600" />
                        </td>
                        <td className="px-6 py-6">
                          <p className="font-black text-gray-900 text-sm uppercase italic">{paket.id}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Sipariş: #{paket.katilimId} • Alıcı ID: {paket.katilim?.user?.id}</p>
                        </td>
                        <td className="px-6 py-6">
                          <p className="font-bold text-gray-900 flex items-center gap-1"><MapPin size={14} className="text-blue-500"/> {paket.nokta?.ad || "Bilinmiyor"}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{paket.nokta?.ilce} / {paket.nokta?.il}</p>
                        </td>
                        <td className="px-6 py-6">
                          <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase ${durumRenk}`}>
                            Son {kalanGun} Gün
                          </span>
                        </td>
                        <td className="px-6 py-6">
                          <span className="font-bold text-gray-600 text-xs uppercase tracking-widest">{paket.durum.replace('_', ' ')}</span>
                        </td>
                        <td className="px-6 py-6 text-right">
                          <button className="p-2 bg-gray-100 text-gray-600 hover:bg-gray-900 hover:text-white rounded-xl transition-colors" title="Detay Görüntüle">
                            <Eye size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                 })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, color, bg, border, icon }: { title: string, value: number, color: string, bg: string, border: string, icon: any }) {
  return (
    <div className={`${bg} border-2 ${border} p-6 rounded-[2rem] relative overflow-hidden group hover:-translate-y-1 transition-all`}>
      <div className="absolute right-[-10px] bottom-[-10px] group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 relative z-10">{title}</h3>
      <p className={`text-5xl font-black italic tracking-tighter ${color} relative z-10`}>{value}</p>
    </div>
  );
}