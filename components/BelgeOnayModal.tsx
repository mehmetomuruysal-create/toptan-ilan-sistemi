"use client";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { upload } from "@vercel/blob/client";
import { FileText, CheckCircle, Loader2, ShieldCheck, AlertCircle } from "lucide-react";

// 🚀 İŞTE MÜHÜR BURADA: Senin yazdığın toplu kayıt fonksiyonunu içeri alıyoruz
import { saveDocumentsAction } from "@/app/actions/documents";

export default function BelgeOnayModal({ 
  userId, 
  onSuccess 
}: { 
  userId: number; 
  onSuccess: () => void; 
}) {
  const [mounted, setMounted] = useState(false);
  const [yukleniyor, setYukleniyor] = useState<string | null>(null);
  const [hata, setHata] = useState("");

  // 🚀 YENİ MANTIK: Vercel'den dönen URL'leri doğrudan DB'ye yazmak yerine burada biriktiriyoruz
  const [yuklenenBelgeler, setYuklenenBelgeler] = useState<{tip: string, url: string}[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ekranda yeşil tik göstermek için biriken belgelerin sadece isimlerini (tiplerini) alıyoruz
  const tamamlananlar = yuklenenBelgeler.map(b => b.tip);

  const BELGE_TIPLERI = [
    { key: "VERGI_LEVHASI", label: "Vergi Levhası" },
    { key: "TICARI_SICIL", label: "Ticaret Sicil / Esnaf Sicil" },
    { key: "IMZA_SIRKULERI", label: "İmza Sirküleri" },
    { key: "FAALIYET_BELGESI", label: "Faaliyet Belgesi (Son 3 Ay)" },
    { key: "IBAN_BELGESI", label: "IBAN Doğrulama Belgesi" },
  ];

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  const trTemizle = (str: string) => {
    const map: any = { 'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u', 'Ç': 'C', 'Ğ': 'G', 'İ': 'I', 'Ö': 'O', 'Ş': 'S', 'Ü': 'U' };
    return str.replace(/[çğıöşüÇĞİÖŞÜ]/g, (m) => map[m]);
  }

  const handleUpload = async (tip: string, file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      setHata("Dosya boyutu 5MB'dan küçük olmalıdır.");
      return;
    }

    setYukleniyor(tip);
    setHata("");

    try {
      const temizAd = trTemizle(file.name).replace(/[^a-zA-Z0-9.\-]/g, '-');
      const benzersizAd = `docs/${userId}/${tip}-${Date.now()}-${temizAd}`;

      // 1. Dosyayı Vercel'e fırlat ve sonucun (URL'in) dönmesini bekle
      const blob = await upload(benzersizAd, file, {
        access: 'public',
        handleUploadUrl: '/api/upload',
        clientPayload: JSON.stringify({ userId, belgeTipi: tip }),
      });
      
      // 2. 🚀 Vercel URL verdi! Bunu state'e kaydediyoruz (Veritabanına en son gidecek)
      setYuklenenBelgeler(prev => [...prev, { tip, url: blob.url }]);

    } catch (error: any) {
      console.error(`❌ [${tip}] Yükleme Hatası Detayı:`, error);
      setHata(error.message ? `Hata: ${error.message}` : "Yükleme başarısız oldu. Lütfen tekrar deneyin.");
    } finally {
      setYukleniyor(null);
    }
  };

  // 🚀 FİNAL BUTONU İŞLEVİ: Tüm belgeler yüklenince burası çalışır ve veritabanına yazar
  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setHata("");

    // Biriken linkleri tek hamlede senin Action dosyana yolluyoruz
    const res = await saveDocumentsAction(yuklenenBelgeler);

    if (res.success) {
      onSuccess(); // İşlem başarılıysa modalı kapat!
    } else {
      setHata(res.error || "Belgeler veritabanına kaydedilirken bir hata oluştu.");
      setIsSubmitting(false);
    }
  };

  if (!mounted) return null;

  const hepsiTamam = tamamlananlar.length === BELGE_TIPLERI.length;

  return createPortal(
    <div className="fixed inset-0 bg-gray-900/90 backdrop-blur-xl z-[99999] flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-[3rem] p-8 md:p-12 shadow-[0_32px_64px_rgba(0,0,0,0.4)] border border-gray-100 animate-in zoom-in-95 duration-300">
        
        <div className="text-center mb-10">
          <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl transition-all duration-500 ${hepsiTamam ? 'bg-green-500 text-white shadow-green-100' : 'bg-blue-600 text-white shadow-blue-100'}`}>
            {hepsiTamam ? <CheckCircle size={40} /> : <ShieldCheck size={40} />}
          </div>
          <h2 className="text-3xl font-black uppercase italic tracking-tighter text-gray-900 leading-none">
            {hepsiTamam ? "Belgeler Mühürlendi" : "Satıcı Mührü"}
          </h2>
          <p className="text-gray-400 text-xs mt-3 font-bold uppercase tracking-widest italic">
            {hepsiTamam ? "Artık ilanı oluşturmaya hazırsınız" : "Tüm belgeleri eksiksiz yüklemeniz zorunludur"}
          </p>
        </div>

        {hata && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-[11px] font-black uppercase italic border border-red-100 flex items-center gap-3">
            <AlertCircle size={18} /> {hata}
          </div>
        )}

        <div className="space-y-3">
          {BELGE_TIPLERI.map((belge) => (
            <div key={belge.key} className="flex items-center justify-between p-5 bg-gray-50/50 rounded-2xl border border-gray-100 hover:border-blue-200 transition-all group">
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg transition-colors ${tamamlananlar.includes(belge.key) ? "bg-green-100 text-green-600" : "bg-white text-gray-400"}`}>
                  <FileText size={20} />
                </div>
                <span className="text-[11px] font-black uppercase italic tracking-wider text-gray-700">{belge.label}</span>
              </div>
              
              {tamamlananlar.includes(belge.key) ? (
                <div className="flex items-center gap-2 text-green-600 font-black text-[10px] uppercase italic animate-in fade-in slide-in-from-right-2">
                  <CheckCircle size={20} /> Onaylı
                </div>
              ) : (
                <label className="cursor-pointer">
                  <input 
                    type="file" className="hidden" accept="image/*,.pdf"
                    onChange={(e) => e.target.files?.[0] && handleUpload(belge.key, e.target.files[0])}
                    disabled={yukleniyor !== null || isSubmitting}
                  />
                  <div className="bg-gray-900 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase italic tracking-widest hover:bg-blue-600 transition-all shadow-lg active:scale-95">
                    {yukleniyor === belge.key ? <Loader2 className="animate-spin" size={16} /> : "Dosya Yükle"}
                  </div>
                </label>
              )}
            </div>
          ))}
        </div>

        <button 
          onClick={handleFinalSubmit} // 🚀 Artık düz onSuccess değil, DB'ye yazma fonksiyonunu çağırıyor
          disabled={!hepsiTamam || isSubmitting}
          className="w-full mt-10 bg-blue-600 text-white py-5 rounded-[1.5rem] font-black uppercase italic tracking-[0.2em] text-xs shadow-2xl shadow-blue-200 hover:bg-gray-900 disabled:bg-gray-100 disabled:text-gray-300 disabled:shadow-none transition-all active:scale-[0.98]"
        >
          {isSubmitting 
            ? <Loader2 className="animate-spin mx-auto" size={20} />
            : hepsiTamam 
              ? "EVRAKLARI MÜHÜRLE VE DEVAM ET" 
              : `EKSİK BELGE: ${BELGE_TIPLERI.length - tamamlananlar.length} ADET KALDI`
          }
        </button>
      </div>
    </div>,
    document.body
  );
}