"use client";
import { useState } from "react";
import { upload } from "@vercel/blob/client";
import { FileText, Upload, CheckCircle, Loader2, ShieldCheck, AlertCircle } from "lucide-react";

const BELGE_TIPLERI = [
  { key: "VERGI_LEVHASI", label: "Vergi Levhası" },
  { key: "TICARI_SICIL", label: "Ticaret Sicil / Esnaf Sicil" },
  { key: "IMZA_SIRKULERI", label: "İmza Sirküleri" },
  { key: "FAALIYET_BELGESI", label: "Faaliyet Belgesi (Son 3 Ay)" },
  { key: "IBAN_BELGESI", label: "IBAN Doğrulama Belgesi" },
];

export default function BelgeOnayModal() {
  const [yukleniyor, setYukleniyor] = useState<string | null>(null);
  const [tamamlananlar, setTamamlananlar] = useState<string[]>([]);
  const [hata, setHata] = useState("");

  const handleUpload = async (tip: string, file: File) => {
    setYukleniyor(tip);
    setHata("");

    try {
      const newBlob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/upload',
      });

      // API tarafında onUploadCompleted zaten veritabanına yazıyor.
      setTamamlananlar(prev => [...prev, tip]);
    } catch (error) {
      setHata("Dosya yüklenirken bir hata oluştu.");
      console.error(error);
    } finally {
      setYukleniyor(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-white/95 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-y-auto">
      <div className="max-w-2xl w-full bg-white border border-gray-100 shadow-2xl rounded-[2.5rem] p-8 md:p-12 my-8">
        <div className="text-center mb-10">
          <div className="bg-blue-50 text-blue-600 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
            <ShieldCheck size={40} />
          </div>
          <h2 className="text-3xl font-black text-gray-900 italic uppercase tracking-tight">Gümüş Onayı Gerekli</h2>
          <p className="text-gray-500 mt-2 font-medium">İlan verebilmek için kurumsal belgelerinizi yüklemelisiniz.</p>
        </div>

        {hata && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-2 text-sm font-bold">
            <AlertCircle size={18} /> {hata}
          </div>
        )}

        <div className="space-y-3">
          {BELGE_TIPLERI.map((belge) => (
            <div key={belge.key} className="group flex items-center justify-between p-5 bg-gray-50 rounded-2xl border-2 border-transparent hover:border-blue-100 transition-all">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${tamamlananlar.includes(belge.key) ? "bg-green-100 text-green-600" : "bg-white text-gray-400"}`}>
                  <FileText size={24} />
                </div>
                <div>
                  <span className="text-sm font-black text-gray-800 block">{belge.label}</span>
                  <span className="text-xs text-gray-400 uppercase font-bold tracking-tighter">Zorunlu Belge</span>
                </div>
              </div>
              
              {tamamlananlar.includes(belge.key) ? (
                <div className="bg-green-500 text-white p-2 rounded-full shadow-lg shadow-green-100">
                  <CheckCircle size={24} />
                </div>
              ) : (
                <label className="relative cursor-pointer">
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*,.pdf"
                    onChange={(e) => e.target.files?.[0] && handleUpload(belge.key, e.target.files[0])}
                    disabled={yukleniyor !== null}
                  />
                  <div className="bg-white border-2 border-gray-100 shadow-sm px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2">
                    {yukleniyor === belge.key ? <Loader2 className="animate-spin" size={16} /> : <><Upload size={14}/> Seç</>}
                  </div>
                </label>
              )}
            </div>
          ))}
        </div>

        <button 
          onClick={() => window.location.reload()}
          disabled={tamamlananlar.length < 3}
          className="w-full mt-10 bg-blue-600 text-white py-5 rounded-[1.5rem] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none"
        >
          {tamamlananlar.length < 3 ? `En Az ${3 - tamamlananlar.length} Belge Daha` : "İncelemeye Gönder & Bitir"}
        </button>
        
        <p className="text-center text-[10px] text-gray-400 mt-6 font-bold uppercase tracking-widest">
          Mingax Güvenlik Ekibi tarafından 24 saat içinde incelenir.
        </p>
      </div>
    </div>
  );
}