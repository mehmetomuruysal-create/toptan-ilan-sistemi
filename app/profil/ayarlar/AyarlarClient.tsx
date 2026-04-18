"use client";
import { useState } from "react";
import { 
  User as UserIcon, Building, FileCheck, ShieldAlert, 
  Upload, Save, AlertCircle, Loader2, FileText, CheckCircle, Clock, XCircle 
} from "lucide-react";
import { upload } from "@vercel/blob/client";

// Şemandaki DocType Enum'ları
const DOC_TYPES = [
  { id: "VERGI_LEVHASI", label: "Vergi Levhası" },
  { id: "TICARI_SICIL", label: "Ticaret Sicil Gazetesi" },
  { id: "IMZA_SIRKULERI", label: "İmza Sirküleri" },
  { id: "FAALIYET_BELGESI", label: "Faaliyet Belgesi" },
  { id: "IBAN_BELGESI", label: "Banka/IBAN Belgesi" },
  { id: "SOZLESME", label: "Sözleşme" },
];

export default function AyarlarClient({ user, documents }: { user: any, documents: any[] }) {
  const [yukleniyor, setYukleniyor] = useState(false);
  const [mesaj, setMesaj] = useState({ text: "", type: "" });
  
  // Şemadaki hesapTuru kontrolü
  const isSatici = user.hesapTuru === "SATICI";

  const [formData, setFormData] = useState({
    ad: user.ad || "",
    soyad: user.soyad || "",
    telefon: user.telefon || "",
    firmaAdi: user.firmaAdi || "",
    vergiNo: user.vergiNo || "",
    vergiDairesi: user.vergiDairesi || "",
    tcKimlikNo: user.tcKimlikNo || "",
  });

  const [yeniBelgeler, setYeniBelgeler] = useState<{ file: File, type: string }[]>([]);

  const handleGuncelle = async () => {
    setYukleniyor(true);
    setMesaj({ text: "", type: "" });

    try {
      // 1. Yeni belgeleri Vercel Blob'a fırlat
      const uploadPromises = yeniBelgeler.map(async (doc) => {
        const b = await upload(`belgeler/${Date.now()}-${doc.file.name.replace(/[^a-zA-Z0-9.]/g, '')}`, doc.file, { 
          access: 'public', 
          handleUploadUrl: '/api/upload' 
        });
        return { fileUrl: b.url, tip: doc.type };
      });

      const uploadedDocs = await Promise.all(uploadPromises);

      // 2. API'ye gönder (Güncelleme onaya düşecek)
      const res = await fetch("/api/profil-guncelle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          ...formData,
          yeniBelgeler: uploadedDocs
        }),
      });

      if (!res.ok) throw new Error("Güncelleme başarısız.");

      setMesaj({ 
        text: isSatici ? "Bilgileriniz güncellendi ve onay için yönetime iletildi." : "Kişisel bilgileriniz güncellendi.", 
        type: "success" 
      });
      setYeniBelgeler([]); 
      setTimeout(() => window.location.reload(), 2000);

    } catch (err: any) {
      setMesaj({ text: err.message, type: "error" });
    } finally {
      setYukleniyor(false);
    }
  };

  return (
    <div className="space-y-10">
      
      {mesaj.text && (
        <div className={`p-6 rounded-[2rem] flex items-center gap-4 text-sm font-bold border ${mesaj.type === "success" ? "bg-green-50 text-green-700 border-green-200 animate-in slide-in-from-top-4" : "bg-red-50 text-red-700 border-red-200 animate-bounce"}`}>
          {mesaj.type === "success" ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
          <p className="text-base">{mesaj.text}</p>
        </div>
      )}

      {/* 👤 KİŞİSEL BİLGİLER (Herkes Görür) */}
      <div className="bg-white p-8 md:p-10 rounded-[3rem] border-2 border-gray-100 shadow-sm space-y-6">
        <h2 className="text-xl font-black uppercase italic text-gray-900 flex items-center gap-2 border-b-2 border-gray-50 pb-4">
          <UserIcon className="text-blue-600" /> Kişisel Bilgiler
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase text-gray-400 ml-4">Adınız</label>
            <input value={formData.ad} onChange={(e) => setFormData({...formData, ad: e.target.value})} className="w-full p-5 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-[1.5rem] font-bold outline-none transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase text-gray-400 ml-4">Soyadınız</label>
            <input value={formData.soyad} onChange={(e) => setFormData({...formData, soyad: e.target.value})} className="w-full p-5 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-[1.5rem] font-bold outline-none transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase text-gray-400 ml-4">Telefon Numarası</label>
            <input value={formData.telefon} onChange={(e) => setFormData({...formData, telefon: e.target.value})} className="w-full p-5 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-[1.5rem] font-bold outline-none transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase text-gray-400 ml-4">E-Posta (Değiştirilemez)</label>
            <input value={user.email} disabled className="w-full p-5 bg-gray-200/50 border-2 border-transparent text-gray-500 rounded-[1.5rem] font-bold outline-none cursor-not-allowed" />
          </div>
        </div>
      </div>

      {/* 🏢 KURUMSAL BİLGİLER (Sadece Satıcılar Görür) */}
      {isSatici && (
        <div className="bg-white p-8 md:p-10 rounded-[3rem] border-2 border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b-2 border-gray-50 pb-4">
            <h2 className="text-xl font-black uppercase italic text-gray-900 flex items-center gap-2">
              <Building className="text-orange-500" /> Kurumsal Bilgiler
            </h2>
            <div className="bg-orange-50 text-orange-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
              <ShieldAlert size={14} /> Onaya Tabidir
            </div>
          </div>
          
          <div className="bg-orange-50/50 border border-orange-100 p-4 rounded-[1.5rem] text-xs font-bold text-orange-700/80">
            Firma bilgilerinizde yapacağınız herhangi bir değişiklik, mağazanızı güvenlik amacıyla kısa süreliğine "İncelemede" (PENDING) statüsüne alacaktır.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="text-[11px] font-black uppercase text-gray-400 ml-4">Firma / Şahıs Şirketi Adı</label>
              <input value={formData.firmaAdi} onChange={(e) => setFormData({...formData, firmaAdi: e.target.value})} className="w-full p-5 bg-gray-50 border-2 border-transparent focus:border-orange-500 rounded-[1.5rem] font-bold outline-none transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase text-gray-400 ml-4">Vergi Numarası / TCKN</label>
              <input value={formData.vergiNo} onChange={(e) => setFormData({...formData, vergiNo: e.target.value})} className="w-full p-5 bg-gray-50 border-2 border-transparent focus:border-orange-500 rounded-[1.5rem] font-bold outline-none transition-all" />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase text-gray-400 ml-4">Vergi Dairesi</label>
              <input value={formData.vergiDairesi} onChange={(e) => setFormData({...formData, vergiDairesi: e.target.value})} className="w-full p-5 bg-gray-50 border-2 border-transparent focus:border-orange-500 rounded-[1.5rem] font-bold outline-none transition-all" />
            </div>
          </div>
        </div>
      )}

      {/* 📄 RESMİ BELGELER (Sadece Satıcılar Görür) */}
      {isSatici && (
        <div className="bg-white p-8 md:p-10 rounded-[3rem] border-2 border-gray-100 shadow-sm space-y-8">
          <h2 className="text-xl font-black uppercase italic text-gray-900 flex items-center gap-2 border-b-2 border-gray-50 pb-4">
            <FileCheck className="text-green-600" /> Resmi Belgeler
          </h2>

          {documents.length > 0 && (
            <div className="space-y-3">
              <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-2">Yüklenen Evraklar</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {documents.map((doc: any) => (
                  <div key={doc.id} className="p-4 rounded-[1.5rem] border-2 flex items-center justify-between bg-gray-50 border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="bg-white p-2 rounded-xl shadow-sm"><FileText size={20} className="text-gray-500" /></div>
                      <div>
                        <p className="text-xs font-black uppercase text-gray-700">{doc.tip.replace('_', ' ')}</p>
                        <p className="text-[10px] font-bold text-gray-400">{new Date(doc.yuklemeTarihi).toLocaleDateString('tr-TR')}</p>
                      </div>
                    </div>
                    <div>
                      {/* Şemandaki DocStatus Enum Kontrolleri */}
                      {doc.durum === "WAITING" && <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase flex items-center gap-1"><Clock size={12}/> Bekliyor</span>}
                      {doc.durum === "APPROVED" && <span className="bg-green-100 text-green-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase flex items-center gap-1"><CheckCircle size={12}/> Onaylandı</span>}
                      {doc.durum === "REJECTED" && <span className="bg-red-100 text-red-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase flex items-center gap-1"><XCircle size={12}/> Reddedildi</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-blue-50/30 p-6 rounded-[2rem] border-2 border-dashed border-blue-200">
             <span className="text-[11px] font-black text-blue-800 uppercase tracking-widest block mb-4">Eksik / Yeni Belge Yükle</span>
             
             {yeniBelgeler.map((yb, i) => (
               <div key={i} className="flex flex-col md:flex-row items-center gap-4 mb-4 bg-white p-4 rounded-[1.5rem] shadow-sm border border-blue-100">
                 <select 
                   value={yb.type} 
                   onChange={(e) => { const n = [...yeniBelgeler]; n[i].type = e.target.value; setYeniBelgeler(n); }}
                   className="w-full md:w-1/2 p-3 bg-gray-50 rounded-xl font-bold text-xs uppercase outline-none text-gray-700"
                 >
                   <option value="">Belge Türü Seçin</option>
                   {DOC_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                 </select>
                 <span className="text-xs font-black text-blue-600 flex-1 truncate">{yb.file.name}</span>
                 <button onClick={() => setYeniBelgeler(yeniBelgeler.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600"><XCircle size={20}/></button>
               </div>
             ))}

             <label className="flex items-center justify-center gap-2 bg-white border-2 border-blue-100 px-6 py-4 rounded-[1.5rem] cursor-pointer hover:border-blue-500 hover:bg-blue-50 text-blue-600 transition-all font-black text-xs uppercase tracking-widest shadow-sm">
                <Upload size={18} /> Yeni PDF / Fotoğraf Seç
                <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setYeniBelgeler([...yeniBelgeler, { file: e.target.files[0], type: "" }]);
                  }
                }} />
             </label>
          </div>
        </div>
      )}

      {/* 🚀 KAYDET BUTONU */}
      <div className="pt-4 flex justify-end">
        <button 
          onClick={handleGuncelle} 
          disabled={yukleniyor || yeniBelgeler.some(b => !b.type)} 
          className="w-full md:w-auto bg-gray-900 text-white px-12 py-6 rounded-[2rem] font-black uppercase tracking-widest shadow-2xl hover:bg-black transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {yukleniyor ? <Loader2 size={24} className="animate-spin" /> : <><Save size={24} /> Güncelle {isSatici && "ve Onaya Gönder"}</>}
        </button>
      </div>

    </div>
  );
}