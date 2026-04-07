"use client";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useSession } from "next-auth/react";
import { adresEkle } from "@/app/actions/adres";
import { MapPin, Plus, Star, Trash2, X } from "lucide-react";

interface Address {
  id: string;
  baslik: string;
  teslimAlacakKisi: string;
  telefon: string;
  il: string;
  ilce: string;
  mahalle?: string;
  adresSatiri: string;
  postaKodu?: string;
  isVarsayilanTeslimat: boolean;
  isVarsayilanFatura: boolean;
  faturaTuru: "BIREYSEL" | "KURUMSAL";
  tcKimlik?: string;
  firmaAdi?: string;
  vergiDairesi?: string;
  vergiNo?: string;
}

export default function AddressModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  const { data: session } = useSession();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [formVisible, setFormVisible] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [faturaTuru, setFaturaTuru] = useState<"BIREYSEL" | "KURUMSAL">("BIREYSEL");
  const formRef = useRef<HTMLFormElement>(null);

  const fetchAddresses = async () => {
    setLoading(true);
    const res = await fetch("/api/adres/liste");
    const data = await res.json();
    setAddresses(data);
    setLoading(false);
  };

  // Portal için component'in client'da mount olmasını bekle
  useEffect(() => {
    setMounted(true);
  }, []);

  // Modal açıldığında arkadaki sayfanın kaymasını (scroll) engelle
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && session) {
      fetchAddresses();
      setFormVisible(false);
    }
  }, [isOpen, session]);

  const deleteAddress = async (id: string) => {
    if (!confirm("Bu adresi silmek istediğinize emin misiniz?")) return;
    const res = await fetch(`/api/adres/${id}`, { method: "DELETE" });
    if (res.ok) {
      fetchAddresses();
    } else {
      alert("Silme başarısız");
    }
  };

  const setDefault = async (id: string, tip: "teslimat" | "fatura") => {
    const res = await fetch(`/api/adres/${id}/varsayilan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tip }),
    });
    if (res.ok) {
      fetchAddresses();
    } else {
      alert("İşlem başarısız");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormLoading(true);
    setMessage("");
    const formData = new FormData(e.currentTarget);
    const data = {
      baslik: formData.get("baslik") as string,
      teslimAlacakKisi: formData.get("teslimAlacakKisi") as string,
      telefon: formData.get("telefon") as string,
      il: formData.get("il") as string,
      ilce: formData.get("ilce") as string,
      mahalle: formData.get("mahalle") as string || undefined,
      adresSatiri: formData.get("adresSatiri") as string,
      postaKodu: formData.get("postaKodu") as string || undefined,
      isVarsayilanTeslimat: formData.get("isVarsayilanTeslimat") === "on",
      isVarsayilanFatura: formData.get("isVarsayilanFatura") === "on",
      faturaTuru: faturaTuru,
      tcKimlik: faturaTuru === "BIREYSEL" ? formData.get("tcKimlik") as string : undefined,
      firmaAdi: faturaTuru === "KURUMSAL" ? formData.get("firmaAdi") as string : undefined,
      vergiDairesi: faturaTuru === "KURUMSAL" ? formData.get("vergiDairesi") as string : undefined,
      vergiNo: faturaTuru === "KURUMSAL" ? formData.get("vergiNo") as string : undefined,
    };

    const res = await adresEkle(data);
    if (res.success) {
      setFormVisible(false);
      fetchAddresses();
    } else {
      setMessage(res.error || "Bir hata oluştu");
    }
    setFormLoading(false);
  };

  if (!mounted || !isOpen) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-[2rem] shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto transform transition-all animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-gray-100 px-6 py-5 flex justify-between items-center rounded-t-[2rem]">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <MapPin className="text-blue-600" /> 
            {formVisible ? "Yeni Adres Ekle" : "Adreslerim"}
          </h2>
          <button onClick={onClose} className="p-2 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 md:p-8">
          {formVisible ? (
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-5 animate-in slide-in-from-right-4 duration-300">
              <button 
                type="button" 
                onClick={() => setFormVisible(false)} 
                className="text-sm font-bold text-blue-600 hover:text-blue-800 mb-2 inline-flex items-center gap-1 transition-colors"
              >
                &larr; Adres Listesine Dön
              </button>
              
              {message && <div className="p-4 bg-red-50 text-red-700 border border-red-100 rounded-xl text-sm font-medium">{message}</div>}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1 ml-1">Adres Başlığı (Örn: Ev, Ofis)</label>
                  <input type="text" name="baslik" required className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1 ml-1">Teslim Alacak Kişi</label>
                  <input type="text" name="teslimAlacakKisi" required className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1 ml-1">Telefon</label>
                <input type="tel" name="telefon" required className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1 ml-1">İl</label>
                  <input type="text" name="il" required className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1 ml-1">İlçe</label>
                  <input type="text" name="ilce" required className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1 ml-1">Açık Adres</label>
                <textarea name="adresSatiri" rows={3} required className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none transition-all text-sm"></textarea>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 p-5 bg-gray-50 rounded-xl border border-gray-100">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" name="isVarsayilanTeslimat" className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">Varsayılan Teslimat Adresi</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" name="isVarsayilanFatura" className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">Varsayılan Fatura Adresi</span>
                </label>
              </div>

              <div className="pt-6 mt-6 border-t border-gray-100">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span>📄</span> Fatura Bilgileri
                </h3>
                <div className="flex gap-6 mb-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={faturaTuru === "BIREYSEL"} onChange={() => setFaturaTuru("BIREYSEL")} className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium">Bireysel</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={faturaTuru === "KURUMSAL"} onChange={() => setFaturaTuru("KURUMSAL")} className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium">Kurumsal</span>
                  </label>
                </div>

                {faturaTuru === "BIREYSEL" ? (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1 ml-1">TC Kimlik No (İsteğe Bağlı)</label>
                    <input type="text" name="tcKimlik" maxLength={11} className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-blue-50/50 p-5 rounded-2xl border border-blue-100">
                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-1 ml-1">Firma Adı</label>
                      <input type="text" name="firmaAdi" required className="w-full p-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1 ml-1">Vergi Dairesi</label>
                      <input type="text" name="vergiDairesi" required className="w-full p-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1 ml-1">Vergi No</label>
                      <input type="text" name="vergiNo" required className="w-full p-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm" />
                    </div>
                  </div>
                )}
              </div>

              <button 
                type="submit" 
                disabled={formLoading}
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold uppercase tracking-wide text-sm hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 transition-all disabled:opacity-50 mt-4"
              >
                {formLoading ? "Kaydediliyor..." : "Adresi Kaydet"}
              </button>
            </form>
          ) : (
            <div className="animate-in slide-in-from-left-4 duration-300">
              <button 
                onClick={() => setFormVisible(true)} 
                className="w-full flex items-center justify-center gap-2 bg-blue-50 text-blue-700 border-2 border-blue-100 border-dashed px-4 py-4 rounded-2xl hover:bg-blue-100 hover:border-blue-300 transition-all font-bold mb-6 group"
              >
                <Plus size={20} className="group-hover:scale-125 transition-transform" /> Yeni Adres Ekle
              </button>

              {loading ? (
                <div className="text-center py-12 text-gray-500 flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
                  <span className="font-medium">Adresleriniz yükleniyor...</span>
                </div>
              ) : addresses.length === 0 ? (
                <div className="bg-gradient-to-b from-gray-50 to-white p-10 text-center rounded-[2rem] border-2 border-dashed border-gray-200">
                  <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star size={32} />
                  </div>
                  <h3 className="text-xl font-black text-gray-800 mb-2">Henüz Bir Adres Eklenmedi</h3>
                  <p className="text-gray-500 mb-6 text-sm font-medium">Siparişlerinizin size hızlıca ulaşması için hemen bir teslimat adresi oluşturun.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {addresses.map((adres) => (
                    <div key={adres.id} className="bg-white p-6 rounded-2xl border-2 border-gray-50 hover:border-blue-100 shadow-sm relative group transition-all duration-300">
                      <div className="absolute top-5 right-5 flex flex-col items-end gap-1.5">
                        {adres.isVarsayilanTeslimat && (
                          <span className="bg-green-100 text-green-700 text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-widest shadow-sm">Teslimat</span>
                        )}
                        {adres.isVarsayilanFatura && (
                          <span className="bg-indigo-100 text-indigo-700 text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-widest shadow-sm">Fatura</span>
                        )}
                      </div>
                      
                      <h3 className="font-black text-lg text-gray-900 mb-1.5 pr-20">{adres.baslik}</h3>
                      <p className="text-gray-600 text-sm font-semibold">{adres.teslimAlacakKisi} • {adres.telefon}</p>
                      <p className="text-gray-500 text-sm mt-2.5 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">
                        {adres.adresSatiri} <br />
                        <span className="font-semibold text-gray-700">{adres.ilce} / {adres.il}</span>
                      </p>

                      <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-gray-100">
                        {!adres.isVarsayilanTeslimat && (
                          <button onClick={() => setDefault(adres.id, "teslimat")} className="text-xs font-bold text-gray-400 hover:text-green-600 transition-colors flex items-center gap-1.5 bg-gray-50 hover:bg-green-50 px-3 py-1.5 rounded-lg">
                            <Star size={14} /> Varsayılan Teslimat Yap
                          </button>
                        )}
                        {!adres.isVarsayilanFatura && (
                          <button onClick={() => setDefault(adres.id, "fatura")} className="text-xs font-bold text-gray-400 hover:text-indigo-600 transition-colors flex items-center gap-1.5 bg-gray-50 hover:bg-indigo-50 px-3 py-1.5 rounded-lg">
                            <Star size={14} /> Varsayılan Fatura Yap
                          </button>
                        )}
                        <button onClick={() => deleteAddress(adres.id)} className="text-xs font-bold text-red-400 hover:text-red-600 transition-colors flex items-center gap-1.5 ml-auto hover:bg-red-50 px-3 py-1.5 rounded-lg">
                          <Trash2 size={14} /> Sil
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}