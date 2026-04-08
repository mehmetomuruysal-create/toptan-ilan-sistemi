"use client";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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
  const [mounted, setMounted] = useState(false);
  const [yukleniyor, setYukleniyor] = useState<string | null>(null);
  const [tamamlananlar, setTamamlananlar] = useState<string[]>([]);
  const [hata, setHata] = useState("");

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  const handleUpload = async (tip: string, file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      setHata("Dosya boyutu 5MB'dan küçük olmalıdır.");
      return;
    }

    setYukleniyor(tip);
    setHata("");

    try {
      // 1. GÜVENLİK: Dosya adındaki boşlukları ve sorunlu karakterleri tireye (-) çeviriyoruz
      const temizDosyaAdi = file.name
        .replace(/[^a-zA-Z0-9.\-]/g, '-') 
        .replace(/-+/g, '-'); 

      // 2. YÜKLEME: Client üzerinden güvenli yükleme yapıyoruz
      const newBlob = await upload(temizDosyaAdi, file, {
        access: 'public',
        handleUploadUrl: '/api/upload', // API rotamızdan onay alıyoruz
      });
      
      setTamamlananlar(prev => [...prev, tip]);
    } catch (error: any) {
      setHata("Dosya yüklenirken bir hata oluştu: " + (error.message || "Bilinmeyen Hata"));
      console.error("Yükleme Hatası:", error);
    } finally {
      setYukleniyor(null);
    }
  };

  if (!mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-md z-[99999] flex items-center justify-center p-4 overflow-y-auto">
      <div className="max-w-2xl w-full bg-white border border-gray-100 shadow-2xl rounded-[2.5rem] p-8 md:p-12 my-8 animate-in zoom-in-95 duration-300">
        <div className="text-center mb-10">
          <div className="bg-blue-50 text-blue-600 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
            <ShieldCheck size={40} />
          </div>
          <h2 className="text-3xl font-black text-gray-900 italic uppercase tracking-tight">Gümüş Onayı Gerekli</h2>
          <p className="text-gray-500 mt-2 font-medium">İlan verebilmek için kurumsal belgelerinizi yüklemelisiniz.</p>
        </div>

        {hata && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-2 text-sm font-bold border border-red-100">
            <AlertCircle size={18} /> {hata}
          </div>
        )}

        <div className="space-y-3">
          {BELGE_TIPLERI.map((belge) => (
            <div key={belge.key} className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-gray-50 rounded-2xl border-2 border-transparent hover:border-blue-100 transition-all gap-4">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl transition-colors ${tamamlananlar.includes(belge.key) ? "bg-green-100 text-green-600" : "bg-white text-gray-400 shadow-sm"}`}>
                  <FileText size={24} />
                </div>
                <div>
                  <span className="text-sm font-black text-gray-800 block">{belge.label}</span>
                  <span className="text-xs text-gray-400 uppercase font-bold tracking-tighter">Zorunlu Belge</span>
                </div>
              </div>
              
              {tamamlananlar.includes(belge.key) ? (
                <div className="bg-green-500 text-white p-2.5 rounded-full shadow-lg shadow-green-200 self-end sm:self-auto">
                  <CheckCircle size={20} />
                </div>
              ) : (
                <label className="relative cursor-pointer self-end sm:self-auto">
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*,.pdf"
                    onChange={(e) => e.target.files?.[0] && handleUpload(belge.key, e.target.files[0])}
                    disabled={yukleniyor !== null}
                  />
                  <div className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 justify-center ${
                    yukleniyor === belge.key 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-200 animate-pulse" 
                    : "bg-white border-2 border-gray-200 hover:bg-black hover:text-white shadow-sm hover:border-black"
                  }`}>
                    {yukleniyor === belge.key ? <Loader2 className="animate-spin" size={16} /> : <><Upload size={14}/> Seç & Yükle</>}
                  </div>
                </label>
              )}
            </div>
          ))}
        </div>

        <button 
          onClick={() => window.location.assign("/ilan-ekle")}
          disabled={tamamlananlar.length < 3}
          className="w-full mt-10 bg-blue-600 text-white py-5 rounded-[1.5rem] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none"
        >
          {tamamlananlar.length < 3 ? `En Az ${3 - tamamlananlar.length} Belge Daha` : "İncelemeye Gönder & Bitir"}
        </button>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}