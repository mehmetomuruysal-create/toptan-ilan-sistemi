"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Store, Map as MapIcon, Plus, List, CheckCircle, 
  Search, Filter, AlertCircle, Loader2, XCircle, Trash2, Edit, Eye
} from "lucide-react";
// 🚀 EĞER SERVER ACTION'I HENÜZ OLUŞTURMADIYSAN BU SATIRI ŞİMDİLİK YORUMA ALABİLİRSİN
import { noktaSil } from "@/app/actions/teslimat-noktalari";

export default function TeslimatNoktalariAdmin() {
  const [noktalar, setNoktalar] = useState<any[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [activeTab, setActiveTab] = useState<"TABLO" | "HARITA">("TABLO");
  const [arama, setArama] = useState("");

  // İstatistikler
  const [stats, setStats] = useState({ toplam: 0, aktif: 0, bugunTeslim: 0, bekleyen: 0 });

  useEffect(() => {
    fetchNoktalar();
  }, []);

  const fetchNoktalar = async () => {
    setYukleniyor(true);
    try {
      const res = await fetch("/api/admin/noktalar");
      const data = await res.json();
      setNoktalar(data);
      
      // Temel istatistikleri hesapla
      setStats({
        toplam: data.length,
        aktif: data.filter((n: any) => n.aktif).length,
        bugunTeslim: 0, // Bu veri için ileride /api/stats gibi bir endpoint yazacağız
        bekleyen: data.reduce((acc: number, n: any) => acc + (n.mevcutKapasite || 0), 0)
      });
    } catch (err) {
      console.error(err);
    } finally {
      setYukleniyor(false);
    }
  };

  const handleSil = async (id: number) => {
    if(!confirm("Bu noktayı silmek veya pasife almak istediğinize emin misiniz?")) return;
    
    try {
      const res = await noktaSil(id); // Server Action çalıştırılıyor
      if (res.success) {
        fetchNoktalar();
      } else {
        alert(res.error);
      }
    } catch (error) {
      alert("Silme işlemi için server action henüz hazır değil veya bir hata oluştu.");
    }
  };

  // Arama filtresi
  const filteredNoktalar = noktalar.filter(n => 
    n.ad.toLowerCase().includes(arama.toLowerCase()) || 
    n.esnafAdi.toLowerCase().includes(arama.toLowerCase()) ||
    n.ilce.toLowerCase().includes(arama.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-8">
      
      {/* 🚀 BAŞLIK VE YENİ NOKTA BUTONU */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl font-black uppercase italic text-gray-900 flex items-center gap-3">
            <Store className="text-blue-600" size={32} />
            Teslimat Ağı Yönetimi
          </h1>
          <p className="text-gray-400 font-bold mt-1 uppercase text-sm tracking-widest">
            Sistemdeki toplam {noktalar.length} aktif teslimat noktası
          </p>
        </div>
        
        {/* Modaldan vazgeçtik, artık özel Yeni Ekleme sayfasına gidiyoruz */}
        <Link 
          href="/admin/teslimat-noktalari/yeni"
          className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-black uppercase flex items-center justify-center gap-2 hover:bg-black transition-all shadow-xl active:scale-95"
        >
          <Plus size={20} /> Yeni Nokta Ekle
        </Link>
      </div>

      {/* 🚀 İSTATİSTİK KARTLARI (Yeni Mimari) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Toplam Nokta" value={stats.toplam} color="text-gray-900" bg="bg-white" border="border-gray-100" />
        <StatCard title="Aktif Nokta" value={stats.aktif} color="text-green-600" bg="bg-green-50" border="border-green-100" />
        <StatCard title="Bugün Teslim Edilen" value={stats.bugunTeslim} color="text-blue-600" bg="bg-blue-50" border="border-blue-100" />
        <StatCard title="Bekleyen Paket" value={stats.bekleyen} color="text-orange-600" bg="bg-orange-50" border="border-orange-100" />
      </div>

      {/* 🚀 ANA İÇERİK: FİLTRE VE TABLO */}
      <div className="bg-white border-2 border-gray-100 rounded-[2.5rem] shadow-sm overflow-hidden">
        
        {/* Kontrol Çubuğu (Tablar ve Arama) */}
        <div className="p-6 border-b-2 border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6 bg-gray-50/50">
          <div className="flex bg-gray-200/50 p-1 rounded-xl w-full md:w-auto">
            <button 
              onClick={() => setActiveTab("TABLO")}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-black uppercase text-xs tracking-widest transition-all ${activeTab === 'TABLO' ? 'bg-white text-gray-900 shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <List size={16} /> Tablo
            </button>
            <button 
              onClick={() => setActiveTab("HARITA")}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-black uppercase text-xs tracking-widest transition-all ${activeTab === 'HARITA' ? 'bg-white text-gray-900 shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <MapIcon size={16} /> Harita
            </button>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
             <div className="relative w-full md:w-72">
               <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
               <input 
                 type="text" 
                 placeholder="Nokta veya Esnaf Ara..." 
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

        {/* 🚀 TABLO GÖRÜNÜMÜ */}
        {activeTab === "TABLO" && (
          <div className="overflow-x-auto custom-scrollbar">
            {yukleniyor ? (
               <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-blue-500" size={48}/></div>
            ) : noktalar.length === 0 ? (
               <div className="p-16 text-center">
                 <AlertCircle size={48} className="mx-auto text-gray-300 mb-4" />
                 <h3 className="text-gray-500 font-black uppercase text-lg italic">Henüz teslimat noktası eklenmemiş</h3>
               </div>
            ) : filteredNoktalar.length === 0 ? (
               <div className="p-16 text-center text-gray-500 font-bold uppercase tracking-widest text-sm">
                 Aramanızla eşleşen nokta bulunamadı.
               </div>
            ) : (
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50/80 text-gray-400 font-black uppercase text-[10px] tracking-widest border-b-2 border-gray-100">
                  <tr>
                    <th className="px-8 py-5 rounded-tl-[2rem]">Nokta / Esnaf</th>
                    <th className="px-6 py-5">Lokasyon</th>
                    <th className="px-6 py-5">Kapasite & Doluluk</th>
                    <th className="px-6 py-5">Durum</th>
                    <th className="px-8 py-5 text-right rounded-tr-[2rem]">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-gray-50">
                  {filteredNoktalar.map((nokta) => {
                    const mevcut = nokta.mevcutKapasite || 0;
                    const max = nokta.maxKapasite || 1;
                    const pct = Math.min(100, (mevcut / max) * 100);
                    
                    return (
                      <tr key={nokta.id} className="hover:bg-blue-50/30 transition-colors group">
                        <td className="px-8 py-6">
                          <p className="font-black text-gray-900 text-base uppercase italic">{nokta.ad}</p>
                          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                            {nokta.esnafAdi} <span className="mx-1">•</span> {nokta.telefon}
                          </p>
                        </td>
                        <td className="px-6 py-6">
                          <p className="font-black text-gray-700">{nokta.ilce}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{nokta.il}</p>
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-black text-lg text-gray-900 italic tracking-tighter">{mevcut}</span>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">/ {max} Paket</span>
                          </div>
                          <div className="w-32 bg-gray-100 rounded-full h-2 overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${pct >= 80 ? 'bg-red-500' : pct >= 50 ? 'bg-orange-500' : 'bg-green-500'}`} 
                              style={{ width: `${pct}%` }} 
                            />
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          {nokta.geciciKapali ? (
                            <span className="bg-yellow-100 text-yellow-700 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase flex items-center gap-1 w-max"><AlertCircle size={12}/> Geçici Kapalı</span>
                          ) : nokta.aktif ? (
                            <span className="bg-green-100 text-green-700 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase flex items-center gap-1 w-max"><CheckCircle size={12}/> Aktif</span>
                          ) : (
                            <span className="bg-red-100 text-red-700 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase flex items-center gap-1 w-max"><XCircle size={12}/> Pasif</span>
                          )}
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex justify-end gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                            <Link href={`/admin/teslimat-noktalari/${nokta.id}`} className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition-colors" title="Detaylar">
                              <Eye size={18} />
                            </Link>
                            <Link href={`/admin/teslimat-noktalari/${nokta.id}/duzenle`} className="p-2 bg-gray-50 text-gray-600 hover:bg-gray-900 hover:text-white rounded-xl transition-colors" title="Düzenle">
                              <Edit size={18} />
                            </Link>
                            <button onClick={() => handleSil(nokta.id)} className="p-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-colors" title="Sil">
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* 🚀 HARİTA GÖRÜNÜMÜ */}
        {activeTab === "HARITA" && (
          <div className="h-[600px] w-full bg-gray-50 flex flex-col items-center justify-center border-t-2 border-gray-100">
             <MapIcon size={64} className="text-gray-300 mb-4" />
             <h3 className="text-xl font-black uppercase text-gray-400 italic">Harita Görünümü</h3>
             <p className="text-sm font-bold text-gray-400 mt-2">Bu alana Google Maps API entegre edilecektir.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Ufak İstatistik Kartı Bileşeni
function StatCard({ title, value, color, bg, border }: { title: string, value: number | string, color: string, bg: string, border: string }) {
  return (
    <div className={`${bg} border-2 ${border} p-6 rounded-[2rem] hover:shadow-lg transition-all`}>
      <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">{title}</h3>
      <p className={`text-4xl font-black italic tracking-tighter ${color}`}>{value}</p>
    </div>
  );
}