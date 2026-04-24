"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Store, MapPin, Clock, Percent, Save, ArrowLeft, Loader2, User 
} from "lucide-react";
import Link from "next/link";
import { noktaEkle } from "@/app/actions/teslimat-noktalari";

export default function YeniNoktaEklePage() {
  const router = useRouter();
  const [kaydediliyor, setKaydediliyor] = useState(false);
  
  const [formData, setFormData] = useState({
    ad: "", esnafAdi: "", telefon: "", email: "", sifre: "",
    il: "", ilce: "", mahalle: "", adres: "", lat: "", lng: "",
    maxKapasite: "50", komisyonMiktari: "5.00", mingaxPayi: "60"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setKaydediliyor(true);

    try {
      const res = await noktaEkle(formData);
      if (res.success) {
        router.push("/admin/teslimat-noktalari");
      } else {
        alert(res.error || "Bir hata oluştu.");
      }
    } catch (err) {
      alert("Kayıt işlemi sırasında bir sorun yaşandı.");
    } finally {
      setKaydediliyor(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
      
      {/* 🚀 BAŞLIK BÖLÜMÜ */}
      <div className="flex items-center justify-between bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
        <div className="flex items-center gap-6">
          <Link href="/admin/teslimat-noktalari" className="p-3 bg-gray-50 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-3xl font-black uppercase italic text-gray-900 flex items-center gap-3">
              <Store className="text-blue-600" size={32} />
              Yeni Nokta Ekle
            </h1>
            <p className="text-gray-400 font-bold mt-1 uppercase text-sm tracking-widest">
              Sisteme yeni bir esnaf ve teslimat noktası dahil edin
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* 1. TEMEL BİLGİLER */}
        <div className="bg-white p-8 rounded-[2rem] border-2 border-gray-100 shadow-sm">
          <h2 className="text-lg font-black uppercase tracking-widest text-blue-600 flex items-center gap-2 border-b-2 border-gray-50 pb-4 mb-6">
            <User size={20} /> 1. Esnaf ve Hesap Bilgileri
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input required placeholder="Dükkan Adı (Örn: Ahmet Bakkal)" value={formData.ad} onChange={e => setFormData({...formData, ad: e.target.value})} className="p-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl font-bold outline-none transition-all" />
            <input required placeholder="Esnaf Adı Soyadı" value={formData.esnafAdi} onChange={e => setFormData({...formData, esnafAdi: e.target.value})} className="p-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl font-bold outline-none transition-all" />
            <input required placeholder="Telefon Numarası" value={formData.telefon} onChange={e => setFormData({...formData, telefon: e.target.value})} className="p-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl font-bold outline-none transition-all" />
            <input required type="email" placeholder="Sisteme Giriş E-postası" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="p-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl font-bold outline-none transition-all" />
            <input required type="text" placeholder="Geçici Şifre Belirleyin" value={formData.sifre} onChange={e => setFormData({...formData, sifre: e.target.value})} className="p-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl font-bold outline-none transition-all md:col-span-2" />
          </div>
        </div>

        {/* 2. ADRES VE KONUM */}
        <div className="bg-white p-8 rounded-[2rem] border-2 border-gray-100 shadow-sm">
          <h2 className="text-lg font-black uppercase tracking-widest text-orange-500 flex items-center gap-2 border-b-2 border-gray-50 pb-4 mb-6">
            <MapPin size={20} /> 2. Adres ve Harita Konumu
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <input required placeholder="İl" value={formData.il} onChange={e => setFormData({...formData, il: e.target.value})} className="p-4 bg-gray-50 border-2 border-transparent focus:border-orange-500 rounded-2xl font-bold outline-none transition-all" />
            <input required placeholder="İlçe" value={formData.ilce} onChange={e => setFormData({...formData, ilce: e.target.value})} className="p-4 bg-gray-50 border-2 border-transparent focus:border-orange-500 rounded-2xl font-bold outline-none transition-all" />
            <input required placeholder="Mahalle" value={formData.mahalle} onChange={e => setFormData({...formData, mahalle: e.target.value})} className="p-4 bg-gray-50 border-2 border-transparent focus:border-orange-500 rounded-2xl font-bold outline-none transition-all" />
            <input required placeholder="Açık Adres" value={formData.adres} onChange={e => setFormData({...formData, adres: e.target.value})} className="p-4 bg-gray-50 border-2 border-transparent focus:border-orange-500 rounded-2xl font-bold outline-none transition-all md:col-span-3" />
            <input required type="number" step="any" placeholder="Enlem (Lat)" value={formData.lat} onChange={e => setFormData({...formData, lat: e.target.value})} className="p-4 bg-gray-50 border-2 border-transparent focus:border-orange-500 rounded-2xl font-bold outline-none transition-all" />
            <input required type="number" step="any" placeholder="Boylam (Lng)" value={formData.lng} onChange={e => setFormData({...formData, lng: e.target.value})} className="p-4 bg-gray-50 border-2 border-transparent focus:border-orange-500 rounded-2xl font-bold outline-none transition-all" />
            <div className="p-4 bg-orange-50 text-orange-700 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center text-center">
               Şimdilik koordinatları manuel giriniz.
            </div>
          </div>
        </div>

        {/* 3. KAPASİTE VE KOMİSYON */}
        <div className="bg-white p-8 rounded-[2rem] border-2 border-gray-100 shadow-sm">
          <h2 className="text-lg font-black uppercase tracking-widest text-green-600 flex items-center gap-2 border-b-2 border-gray-50 pb-4 mb-6">
            <Percent size={20} /> 3. Kapasite ve Komisyon Anlaşması
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative">
              <span className="absolute top-3 left-4 text-[9px] font-black uppercase tracking-widest text-gray-400">Max Paket Kapasitesi</span>
              <input required type="number" value={formData.maxKapasite} onChange={e => setFormData({...formData, maxKapasite: e.target.value})} className="w-full pt-8 pb-3 px-4 bg-gray-50 border-2 border-transparent focus:border-green-500 rounded-2xl font-black text-xl outline-none transition-all" />
            </div>
            <div className="relative">
              <span className="absolute top-3 left-4 text-[9px] font-black uppercase tracking-widest text-gray-400">Paket Başı Komisyon (₺)</span>
              <input required type="number" step="0.01" value={formData.komisyonMiktari} onChange={e => setFormData({...formData, komisyonMiktari: e.target.value})} className="w-full pt-8 pb-3 px-4 bg-green-50 text-green-700 border-2 border-transparent focus:border-green-500 rounded-2xl font-black text-xl outline-none transition-all" />
            </div>
            <div className="relative">
              <span className="absolute top-3 left-4 text-[9px] font-black uppercase tracking-widest text-gray-400">Mingax Komisyon Payı (%)</span>
              <input required type="number" step="1" value={formData.mingaxPayi} onChange={e => setFormData({...formData, mingaxPayi: e.target.value})} className="w-full pt-8 pb-3 px-4 bg-gray-50 border-2 border-transparent focus:border-green-500 rounded-2xl font-black text-xl outline-none transition-all" />
            </div>
          </div>
        </div>

        {/* KAYDET BUTONU */}
        <div className="sticky bottom-8 z-50">
          <button disabled={kaydediliyor} type="submit" className="w-full bg-blue-600 text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-blue-700 hover:-translate-y-1 transition-all shadow-2xl shadow-blue-600/30 disabled:opacity-50 disabled:hover:translate-y-0">
            {kaydediliyor ? <Loader2 size={24} className="animate-spin" /> : <><Save size={24}/> Esnafı Sisteme Kaydet ve Onayla</>}
          </button>
        </div>
      </form>
    </div>
  );
}