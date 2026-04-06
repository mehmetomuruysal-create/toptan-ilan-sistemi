"use client";
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { adresEkle } from "@/app/actions/adres";
import { MapPin, Plus, Star, Trash2, X } from "lucide-react"; // İkonlar eklendi

interface Address {
  id: string; // API'de string yapmıştık
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

  useEffect(() => {
    if (isOpen && session) {
      fetchAddresses();
      setFormVisible(false); // Modal açıldığında hep listeyi göster
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
      setFormVisible(false); // Başarılıysa formu kapat
      fetchAddresses();      // Listeyi yenile
    } else {
      setMessage(res.error || "Bir hata oluştu");
    }
    setFormLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto transform transition-all">
        {/* Modal Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center rounded-t-2xl">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <MapPin className="text-blue-600" /> 
            {formVisible ? "Yeni Adres Ekle" : "Adreslerim"}
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {formVisible ? (
            /* --- YENİ ADRES FORMU --- */
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
              <button 
                type="button" 
                onClick={() => setFormVisible(false)} 
                className="text-sm font-medium text-blue-600 hover:text-blue-800 mb-4 inline-block"
              >
                &larr; Adres Listesine Dön
              </button>
              
              {message && <div className="p-3 bg-red-50 text-red-600 rounded-lg">{message}</div>}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Adres Başlığı (Örn: Ev, Ofis)</label>
                  <input type="text" name="baslik" required className="mt-1 w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Teslim Alacak Kişi</label>
                  <input type="text" name="teslimAlacakKisi" required className="mt-1 w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Telefon</label>
                <input type="tel" name="telefon" required className="mt-1 w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">İl</label>
                  <input type="text" name="il" required className="mt-1 w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">İlçe</label>
                  <input type="text" name="ilce" required className="mt-1 w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Açık Adres</label>
                <textarea name="adresSatiri" rows={3} required className="mt-1 w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"></textarea>
              </div>

              <div className="flex gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
                  <input type="checkbox" name="isVarsayilanTeslimat" className="w-4 h-4 text-blue-600 rounded" />
                  Varsayılan Teslimat Adresi Yap
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
                  <input type="checkbox" name="isVarsayilanFatura" className="w-4 h-4 text-blue-600 rounded" />
                  Varsayılan Fatura Adresi Yap
                </label>
              </div>

              {/* Fatura Bilgileri */}
              <div className="border-t pt-4 mt-6">
                <h3 className="font-semibold text-gray-800 mb-3">Fatura Bilgileri</h3>
                <div className="flex gap-4 mb-4">
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input type="radio" checked={faturaTuru === "BIREYSEL"} onChange={() => setFaturaTuru("BIREYSEL")} className="w-4 h-4 text-blue-600" />
                    Bireysel
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input type="radio" checked={faturaTuru === "KURUMSAL"} onChange={() => setFaturaTuru("KURUMSAL")} className="w-4 h-4 text-blue-600" />
                    Kurumsal
                  </label>
                </div>

                {faturaTuru === "BIREYSEL" ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">TC Kimlik No (İsteğe Bağlı)</label>
                    <input type="text" name="tcKimlik" maxLength={11} className="mt-1 w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Firma Adı</label>
                      <input type="text" name="firmaAdi" required className="mt-1 w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Vergi Dairesi</label>
                      <input type="text" name="vergiDairesi" required className="mt-1 w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Vergi No</label>
                      <input type="text" name="vergiNo" required className="mt-1 w-full p-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                  </div>
                )}
              </div>

              <button 
                type="submit" 
                disabled={formLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 rounded-xl font-bold text-lg hover:shadow-lg hover:opacity-90 transition disabled:opacity-50 mt-6"
              >
                {formLoading ? "Kaydediliyor..." : "Adresi Kaydet"}
              </button>
            </form>
          ) : (
            /* --- ADRESLER LİSTESİ --- */
            <div className="animate-in fade-in">
              <button 
                onClick={() => setFormVisible(true)} 
                className="w-full flex items-center justify-center gap-2 bg-blue-50 text-blue-700 border border-blue-200 px-4 py-3 rounded-xl hover:bg-blue-100 transition-colors font-medium mb-6"
              >
                <Plus size={18} /> Yeni Adres Ekle
              </button>

              {loading ? (
                <div className="text-center py-8 text-gray-500">Yükleniyor...</div>
              ) : addresses.length === 0 ? (
                /* BOŞ DURUM (Empty State) Tasarımı */
                <div className="bg-gradient-to-b from-gray-50 to-white p-10 text-center rounded-2xl border-2 border-dashed border-gray-200">
                  <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Henüz Bir Adres Eklenmedi</h3>
                  <p className="text-gray-500 mb-6 text-sm">Siparişlerinizin size hızlıca ulaşması için hemen bir teslimat adresi oluşturun.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {addresses.map((adres) => (
                    /* KART Tasarımı */
                    <div key={adres.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative group hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                      
                      {/* Varsayılan Etiketleri */}
                      <div className="absolute top-4 right-4 flex gap-2">
                        {adres.isVarsayilanTeslimat && (
                          <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide">Teslimat</span>
                        )}
                        {adres.isVarsayilanFatura && (
                          <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide">Fatura</span>
                        )}
                      </div>
                      
                      <h3 className="font-bold text-lg text-gray-800 mb-1">{adres.baslik}</h3>
                      <p className="text-gray-600 text-sm font-medium">{adres.teslimAlacakKisi} • {adres.telefon}</p>
                      <p className="text-gray-500 text-sm mt-2 leading-relaxed">
                        {adres.adresSatiri} <br />
                        {adres.ilce} / {adres.il}
                      </p>

                      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-50">
                        {!adres.isVarsayilanTeslimat && (
                          <button onClick={() => setDefault(adres.id, "teslimat")} className="text-xs font-medium text-gray-500 hover:text-green-600 transition flex items-center gap-1">
                            <Star size={14} /> Varsayılan Teslimat
                          </button>
                        )}
                        {!adres.isVarsayilanFatura && (
                          <button onClick={() => setDefault(adres.id, "fatura")} className="text-xs font-medium text-gray-500 hover:text-indigo-600 transition flex items-center gap-1">
                            <Star size={14} /> Varsayılan Fatura
                          </button>
                        )}
                        <button onClick={() => deleteAddress(adres.id)} className="text-xs font-medium text-red-400 hover:text-red-600 transition flex items-center gap-1 ml-auto">
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
}