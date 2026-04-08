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

export default function BelgeOnayModal({ userId }: { userId: number }) {
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
      const temizDosyaAdi = file.name.replace(/[^a-zA-Z0-9.\-]/g, '-').replace(/-+/g, '-');
      // Dosya çakışmasını önlemek için zaman damgası ekliyoruz
      const benzersizAd = `${Date.now()}-${temizDosyaAdi}`;

      await upload(benzersizAd, file, {
        access: 'public',
        handleUploadUrl: '/api/upload',
        clientPayload: JSON.stringify({ userId, belgeTipi: tip }),
      });
      
      setTamamlananlar(prev => [...prev, tip]);
    } catch (error: any) {
      setHata("Yükleme başarısız oldu.");
      console.error(error);
    } finally {
      setYukleniyor(null);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-md z-[99999] flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
        <div className="text-center mb-10">
          <div className="bg-blue-50 text-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-2xl font-black uppercase italic tracking-tight">Gümüş Onayı Gerekli</h2>
          <p className="text-gray-500 text-sm mt-1 font-medium">İlan verebilmek için belgeleri yüklemelisiniz.</p>
        </div>

        {hata && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-xs font-bold border border-red-100 flex items-center gap-2">
            <AlertCircle size={16} /> {hata}
          </div>
        )}

        <div className="space-y-3">
          {BELGE_TIPLERI.map((belge) => (
            <div key={belge.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border hover:border-blue-100 transition-all">
              <div className="flex items-center gap-3">
                <FileText size={20} className={tamamlananlar.includes(belge.key) ? "text-green-500" : "text-gray-400"} />
                <span className="text-sm font-bold text-gray-700">{belge.label}</span>
              </div>
              
              {tamamlananlar.includes(belge.key) ? (
                <CheckCircle size={20} className="text-green-500" />
              ) : (
                <label className="cursor-pointer">
                  <input 
                    type="file" className="hidden" accept="image/*,.pdf"
                    onChange={(e) => e.target.files?.[0] && handleUpload(belge.key, e.target.files[0])}
                    disabled={yukleniyor !== null}
                  />
                  <div className="bg-white border-2 border-gray-200 px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-black hover:text-white transition-all">
                    {yukleniyor === belge.key ? <Loader2 className="animate-spin" size={14} /> : "Seç & Yükle"}
                  </div>
                </label>
              )}
            </div>
          ))}
        </div>

        <button 
          onClick={() => window.location.assign("/ilan-ekle")}
          disabled={tamamlananlar.length < 3}
          className="w-full mt-8 bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest disabled:bg-gray-200 disabled:text-gray-400 transition-all"
        >
          {tamamlananlar.length < 3 ? `En Az ${3 - tamamlananlar.length} Belge Gerekli` : "İncelemeye Gönder & Bitir"}
        </button>
      </div>
    </div>,
    document.body
  );
}