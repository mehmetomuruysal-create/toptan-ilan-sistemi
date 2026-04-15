"use client"
import { useState } from "react"
import { 
  Eye, CheckCircle, XCircle, AlertCircle, 
  FileText, Image as ImageIcon, ExternalLink, 
  PauseCircle, PlayCircle 
} from "lucide-react"

export default function AdminIlanlarClient({ 
  initialListings, 
  changeStatus, 
  suspendAllListings, 
  deleteAllListings 
}: any) {
  const [selectedListing, setSelectedListing] = useState<any>(null)

  // Durum Rozetleri
  const getStatusBadge = (status: string) => {
    const styles: any = {
      ACTIVE: "bg-green-50 text-green-600 border-green-100",
      PENDING: "bg-orange-50 text-orange-600 border-orange-100",
      SUSPENDED: "bg-amber-50 text-amber-600 border-amber-100",
      REJECTED: "bg-red-50 text-red-600 border-red-100",
      CANCELLED: "bg-gray-50 text-gray-400 border-gray-100",
    }
    const labels: any = {
      ACTIVE: "YAYINDA",
      PENDING: "ONAY BEKLİYOR",
      SUSPENDED: "ASKIYA ALINDI",
      REJECTED: "REDDEDİLDİ",
      CANCELLED: "İPTAL EDİLDİ",
    }
    return (
      <span className={`px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-widest ${styles[status] || styles.PENDING}`}>
        {labels[status] || status}
      </span>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* --- ÜST BAR --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic flex items-center gap-3">
            <AlertCircle className="text-blue-600" size={32} /> İlan Denetimi
          </h1>
          <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.3em] mt-2 italic">
            Mingax Kontrol Merkezi / Toplam {initialListings.length} İlan
          </p>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={() => confirm("Tüm ilanlar askıya alınsın mı?") && suspendAllListings()} 
            className="px-6 py-3 bg-white border border-gray-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-50 hover:border-amber-200 transition-all shadow-sm"
          >
            Tümünü Askıya Al
          </button>
          <button 
            onClick={() => confirm("DİKKAT: Tüm ilanlar kalıcı olarak silinecek. Onaylıyor musunuz?") && deleteAllListings()} 
            className="px-6 py-3 bg-white border border-red-100 text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-sm"
          >
            Sistemi Temizle
          </button>
        </div>
      </div>

      {/* --- TABLO --- */}
      <div className="bg-white rounded-[3rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">İlan & Satıcı</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">İçerik Analizi</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Durum</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Aksiyon</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {initialListings.map((ilan: any) => (
                <tr key={ilan.id} className="hover:bg-gray-50/50 transition-all group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 bg-gray-100 rounded-2xl overflow-hidden border border-gray-200 relative group-hover:scale-105 transition-transform">
                        {ilan.images[0] ? (
                          <img src={ilan.images[0].url} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="m-auto mt-5 text-gray-300" />
                        )}
                      </div>
                      <div>
                        <div className="font-black text-gray-900 uppercase italic leading-none text-lg tracking-tighter">{ilan.baslik}</div>
                        <div className="text-[10px] text-blue-600 font-black mt-1.5 uppercase tracking-widest">
                          {ilan.satici.firmaAdi || `${ilan.satici.ad} ${ilan.satici.soyad}`}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex justify-center gap-6">
                      <div className="text-center">
                        <div className="text-sm font-black text-gray-900">{ilan.images.length}</div>
                        <div className="text-[8px] font-black text-gray-400 uppercase">Görsel</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-black text-gray-900">{ilan.documents.length}</div>
                        <div className="text-[8px] font-black text-gray-400 uppercase">Döküman</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">{getStatusBadge(ilan.durum)}</td>
                  <td className="px-8 py-6 text-right">
                    <button 
                      onClick={() => setSelectedListing(ilan)}
                      className="bg-gray-900 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center gap-2 ml-auto shadow-lg shadow-gray-200"
                    >
                      <Eye size={16} /> Detayları Gör
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- 🚀 İNCELEME VE KARAR MODALI --- */}
      {selectedListing && (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[3.5rem] w-full max-w-5xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-8 md:p-10 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
              <div>
                <h2 className="text-3xl font-black text-gray-900 uppercase italic tracking-tighter leading-none">{selectedListing.baslik}</h2>
                <div className="flex items-center gap-3 mt-3">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">ID: #{selectedListing.id}</span>
                  {getStatusBadge(selectedListing.durum)}
                </div>
              </div>
              <button 
                onClick={() => setSelectedListing(null)} 
                className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all border border-gray-100"
              >
                <XCircle size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-8 md:p-10 grid grid-cols-1 lg:grid-cols-2 gap-12 overflow-y-auto max-h-[65vh]">
              {/* SOL: GALERİ */}
              <div className="space-y-6">
                <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                  <ImageIcon size={14} /> Ürün Galerisi
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  {selectedListing.images.map((img: any) => (
                    <div key={img.id} className="relative aspect-square rounded-[2rem] overflow-hidden border-4 border-gray-50 group">
                      <img src={img.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                  ))}
                </div>
              </div>

              {/* SAĞ: BELGELER & KARAR */}
              <div className="space-y-8">
                <div>
                  <h4 className="text-[10px] font-black text-purple-600 uppercase tracking-widest flex items-center gap-2 mb-4">
                    <FileText size={14} /> Sertifikalar & Kataloglar
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    {selectedListing.documents.length > 0 ? selectedListing.documents.map((doc: any) => (
                      <a 
                        key={doc.id} 
                        href={doc.url} 
                        target="_blank" 
                        className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl hover:bg-blue-50 border border-transparent hover:border-blue-100 transition-all group"
                      >
                        <span className="text-sm font-bold text-gray-700">{doc.name || "Ek Dosya"}</span>
                        <ExternalLink size={16} className="text-gray-300 group-hover:text-blue-600" />
                      </a>
                    )) : (
                      <div className="text-xs text-gray-400 italic bg-gray-50 p-4 rounded-2xl text-center">Bu ilan için döküman yüklenmemiş.</div>
                    )}
                  </div>
                </div>

                {/* 🛡️ ADMIN KARAR MERKEZİ */}
                <div className="p-8 bg-gray-900 rounded-[3rem] text-white">
                  <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-6 text-center italic">
                    Yetkili Karar Mekanizması
                  </div>
                  
                  <div className="flex flex-col gap-4">
                    {/* ANA AKSİYON: YAYINLA VEYA DURDUR */}
                    {selectedListing.durum !== "ACTIVE" ? (
                      <button 
                        onClick={async () => { await changeStatus(selectedListing.id, "ACTIVE"); setSelectedListing(null); }}
                        className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/50 flex items-center justify-center gap-2"
                      >
                        <PlayCircle size={18} /> İlanı Onayla & Yayınla
                      </button>
                    ) : (
                      <button 
                        onClick={async () => { await changeStatus(selectedListing.id, "CANCELLED"); setSelectedListing(null); }}
                        className="w-full bg-gray-800 text-gray-300 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-gray-700 transition-all flex items-center justify-center gap-2"
                      >
                        <PauseCircle size={18} /> Yayını Durdur
                      </button>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      {/* ASKIYA AL */}
                      <button 
                        onClick={async () => { await changeStatus(selectedListing.id, "SUSPENDED"); setSelectedListing(null); }}
                        className="bg-amber-500 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-amber-600 transition-all flex items-center justify-center gap-2"
                      >
                        <AlertCircle size={16} /> Askıya Al
                      </button>

                      {/* REDDET */}
                      <button 
                        onClick={async () => { await changeStatus(selectedListing.id, "REJECTED"); setSelectedListing(null); }}
                        className="bg-red-600 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                      >
                        <XCircle size={16} /> Reddet
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}