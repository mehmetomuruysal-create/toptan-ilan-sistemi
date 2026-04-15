"use client";

import { useState } from "react";
import { upload } from "@vercel/blob/client";
import { saveDocumentsAction } from "@/app/actions/documents";
import { 
  ShieldCheck, UploadCloud, CheckCircle, 
  FileText, AlertCircle, ChevronLeft 
} from "lucide-react";
import Link from "next/link";

const DOC_TYPES = [
  { id: "vergi", label: "Vergi Levhası", tip: "VERGI_LEVHASI" },
  { id: "sicil", label: "Ticaret Sicil Gazetesi", tip: "TICARI_SICIL" },
  { id: "imza", label: "İmza Sirküleri", tip: "IMZA_SIRKULERI" },
  { id: "faaliyet", label: "Faaliyet Belgesi", tip: "FAALIYET_BELGESI" },
  { id: "iban", label: "IBAN Doğrulama Belgesi", tip: "IBAN_BELGESI" },
];

export default function DogrulamaSayfasi() {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [files, setFiles] = useState<{ [key: string]: string }>({});
  const [success, setSuccess] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldId: string) => {
    if (!e.target.files?.[0]) return;
    
    const file = e.target.files[0];
    setLoading(true);

    try {
      const newBlob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/upload',
      });

      setFiles(prev => ({ ...prev, [fieldId]: newBlob.url }));
    } catch (error) {
      alert("Dosya yüklenemedi, lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  const handleFinalSubmit = async () => {
    setSubmitting(true);
    
    // Belgeleri formatla
    const docData = DOC_TYPES.map(item => ({
      tip: item.tip,
      url: files[item.id]
    }));

    const result = await saveDocumentsAction(docData);
    
    if (result.success) {
      setSuccess(true);
    } else {
      alert(result.error);
    }
    setSubmitting(false);
  };

  if (success) {
    return (
      <div className="max-w-xl mx-auto py-24 px-4 text-center">
        <div className="bg-white p-12 rounded-[3rem] shadow-2xl border border-gray-100 flex flex-col items-center">
          <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-6">
            <CheckCircle size={48} />
          </div>
          <h1 className="text-3xl font-black text-gray-900 uppercase italic tracking-tighter mb-4">Başvurunuz Alındı!</h1>
          <p className="text-gray-500 font-medium mb-8">Belgeleriniz inceleme sırasına alındı. Admin onayından sonra "Gümüş Tedarikçi" rozetiniz tanımlanacaktır.</p>
          <Link href="/profil" className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-600 transition-all">
            PROFİLE DÖN
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <Link href="/profil" className="flex items-center gap-2 text-gray-400 hover:text-blue-600 font-bold mb-8 transition-colors group">
        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> GERİ DÖN
      </Link>

      <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-gray-100 relative overflow-hidden">
        {/* Dekoratif Arka Plan İkonu */}
        <ShieldCheck className="absolute -right-8 -top-8 text-blue-50/50" size={200} />

        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
              <ShieldCheck size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 uppercase italic tracking-tight leading-none">Gümüş Doğrulama</h1>
              <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-1">Tedarikçi Onay Süreci</p>
            </div>
          </div>

          <div className="bg-blue-50 p-6 rounded-3xl mb-10 flex gap-4 border border-blue-100">
            <AlertCircle className="text-blue-600 shrink-0" />
            <p className="text-sm text-blue-800 font-medium leading-relaxed">
              İlan verebilmek için aşağıdaki 5 belgeyi eksiksiz yüklemelisiniz. Belgeler güncel ve okunabilir olmalıdır.
            </p>
          </div>
          
          <div className="space-y-4">
            {DOC_TYPES.map((item) => (
              <div key={item.id} className={`group p-5 rounded-[2rem] border-2 transition-all ${files[item.id] ? 'border-green-100 bg-green-50/30' : 'border-gray-50 bg-gray-50/50 hover:border-blue-100'}`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${files[item.id] ? 'bg-green-500 text-white' : 'bg-white text-gray-400 shadow-sm'}`}>
                      {files[item.id] ? <CheckCircle size={20} /> : <FileText size={20} />}
                    </div>
                    <div>
                      <label className="block text-sm font-black text-gray-800 uppercase tracking-tight leading-none">{item.label}</label>
                      <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">Gerekli Evrak</p>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <input 
                      type="file" 
                      onChange={(e) => handleFileUpload(e, item.id)}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                    <div className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                      files[item.id] 
                      ? "bg-green-100 text-green-700" 
                      : "bg-white text-blue-600 shadow-sm hover:shadow-md border border-gray-100"
                    }`}>
                      {loading && !files[item.id] ? "YÜKLENİYOR..." : files[item.id] ? "DEĞİŞTİR" : "DOSYA SEÇ"}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={handleFinalSubmit}
            disabled={loading || submitting || Object.keys(files).length < 5}
            className={`w-full mt-12 py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl transition-all flex items-center justify-center gap-3 ${
              loading || submitting || Object.keys(files).length < 5 
              ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
              : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100"
            }`}
          >
            {submitting ? "VERİ TABANINA İŞLENİYOR..." : <><UploadCloud size={20} /> Gümüş Onayına Gönder</>}
          </button>
        </div>
      </div>
    </div>
  );
}