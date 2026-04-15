"use client"
import { useState } from "react";
import { updateProfileAction } from "@/app/actions/profile";
import { CheckCircle, Save, User, Phone, MapPin, Building2, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function ProfileForm({ user, defaultAddressText }: { user: any, defaultAddressText: string }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    const result = await updateProfileAction({ ...data, hesapTuru: user.hesapTuru });
    
    if (result.success) {
      setMessage("Profiliniz başarıyla güncellendi!");
      setTimeout(() => setMessage(""), 3000);
    } else {
      setMessage("Hata: " + result.error);
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 👤 KİŞİSEL BİLGİLER */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
        <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-6 flex items-center gap-2">
          <User size={16} /> Kişisel Bilgiler
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputGroup label="Ad" name="ad" defaultValue={user.ad} />
          <InputGroup label="Soyad" name="soyad" defaultValue={user.soyad} />
          <InputGroup label="E-Posta" name="email" defaultValue={user.email} disabled />
          <InputGroup label="Telefon" name="telefon" defaultValue={user.telefon} />
        </div>
      </div>

      {/* 🚚 ALICI İÇİN ADRES GÖSTERİMİ */}
      {user.hesapTuru === "ALICI" && (
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xs font-black text-green-600 uppercase tracking-widest flex items-center gap-2">
              <MapPin size={16} /> Varsayılan Teslimat Adresi
            </h3>
            <Link href="/adreslerim" className="text-[10px] font-black text-blue-600 uppercase flex items-center gap-1 hover:underline">
              ADRESLERİ YÖNET <ExternalLink size={12} />
            </Link>
          </div>
          
          <div className="flex flex-col">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-4">Aktif Adres Detayı</label>
            <textarea 
              name="teslimatAdresi"
              value={defaultAddressText || "Henüz bir varsayılan adres seçilmemiş."}
              readOnly
              rows={3}
              className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3 text-sm font-bold text-gray-500 cursor-not-allowed outline-none resize-none italic"
            />
          </div>
        </div>
      )}

      {/* 🏢 SATICI İÇİN FİRMA BİLGİLERİ */}
      {user.hesapTuru === "SATICI" && (
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
          <h3 className="text-xs font-black text-purple-600 uppercase tracking-widest mb-6 flex items-center gap-2">
            <Building2 size={16} /> Firma Kayıt Bilgileri
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputGroup label="Firma Adı" name="firmaAdi" defaultValue={user.firmaAdi} />
            <InputGroup label="Vergi Numarası" name="vergiNo" defaultValue={user.vergiNo} />
            <InputGroup label="Vergi Dairesi" name="vergiDairesi" defaultValue={user.vergiDairesi} />
            <div className="flex flex-col justify-end">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-4 text-center">Onay Durumu</label>
              <div className={`px-5 py-3 rounded-2xl font-bold text-sm text-center ${user.onayDurumu === 'APPROVED' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                {user.onayDurumu === 'APPROVED' ? '✓ ONAYLI TEDARİKÇİ' : '⌛ İNCELEME BEKLİYOR'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 💾 KAYDET BUTONU */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          {message && (
            <p className="text-green-600 font-bold text-sm flex items-center gap-2 px-4">
              <CheckCircle size={18} /> {message}
            </p>
          )}
        </div>
        <button 
          disabled={loading}
          className="bg-gray-900 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-600 transition-all flex items-center gap-3 disabled:bg-gray-400 shadow-xl"
        >
          {loading ? "İŞLENİYOR..." : <><Save size={18} /> BİLGİLERİ GÜNCELLE</>}
        </button>
      </div>
    </form>
  );
}

function InputGroup({ label, name, defaultValue, disabled = false }: any) {
  return (
    <div className="flex flex-col">
      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-4">{label}</label>
      <input 
        name={name}
        defaultValue={defaultValue}
        disabled={disabled}
        className={`w-full bg-gray-50 border-none rounded-2xl px-5 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
      />
    </div>
  );
}