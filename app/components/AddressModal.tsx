"use client";
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { adresEkle } from "@/app/actions/adres";

interface Address {
  id: number;
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
    }
  }, [isOpen, session]);

  const deleteAddress = async (id: number) => {
    if (!confirm("Bu adresi silmek istediğinize emin misiniz?")) return;
    const res = await fetch(`/api/adres/${id}`, { method: "DELETE" });
    if (res.ok) {
      fetchAddresses();
    } else {
      alert("Silme başarısız");
    }
  };

  const setDefault = async (id: number, tip: "teslimat" | "fatura") => {
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
      isVarsayilanTeslimat: formData.has("isVarsayilanTeslimat"),
      isVarsayilanFatura: formData.has("isVarsayilanFatura"),
      faturaTuru,
      tcKimlik: faturaTuru === "BIREYSEL" ? (formData.get("tcKimlik") as string) : undefined,
      firmaAdi: faturaTuru === "KURUMSAL" ? (formData.get("firmaAdi") as string) : undefined,
      vergiDairesi: faturaTuru === "KURUMSAL" ? (formData.get("vergiDairesi") as string) : undefined,
      vergiNo: faturaTuru === "KURUMSAL" ? (formData.get("vergiNo") as string) : undefined,
    };
    const result = await adresEkle(data);
    if (result.success) {
      setMessage("Adres başarıyla eklendi!");
      if (formRef.current) formRef.current.reset();
      setFormVisible(false);
      fetchAddresses();
    } else {
      setMessage(result.error || "Bir hata oluştu");
    }
    setFormLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Adreslerim</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>
        <div className="p-6">
          <button
            onClick={() => setFormVisible(!formVisible)}
            className="mb-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            + Yeni Adres Ekle
          </button>

          {formVisible && (
            <div className="mb-6 p-4 border rounded-lg bg-gray-50">
              <h3 className="font-semibold mb-3">Yeni Adres Ekle</h3>
              <form ref={formRef} onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input name="baslik" placeholder="Başlık (Ev, İş)" required className="border rounded px-3 py-2" />
                  <input name="teslimAlacakKisi" placeholder="Teslim Alacak Kişi" required className="border rounded px-3 py-2" />
                  <input name="telefon" placeholder="Telefon" required className="border rounded px-3 py-2" />
                  <input name="il" placeholder="İl" required className="border rounded px-3 py-2" />
                  <input name="ilce" placeholder="İlçe" required className="border rounded px-3 py-2" />
                  <input name="mahalle" placeholder="Mahalle (Opsiyonel)" className="border rounded px-3 py-2" />
                </div>
                <textarea name="adresSatiri" placeholder="Adres (Sokak, Bina, Daire)" required className="border rounded px-3 py-2 w-full" rows={2} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input name="postaKodu" placeholder="Posta Kodu (Opsiyonel)" className="border rounded px-3 py-2" />
                </div>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2"><input type="checkbox" name="isVarsayilanTeslimat" /> Varsayılan Teslimat</label>
                  <label className="flex items-center gap-2"><input type="checkbox" name="isVarsayilanFatura" /> Varsayılan Fatura</label>
                </div>
                <div>
                  <label className="block font-medium">Fatura Türü</label>
                  <div className="flex gap-4 mt-1">
                    <label className="flex items-center gap-2"><input type="radio" name="faturaTuruR" checked={faturaTuru === "BIREYSEL"} onChange={() => setFaturaTuru("BIREYSEL")} /> Bireysel</label>
                    <label className="flex items-center gap-2"><input type="radio" name="faturaTuruR" checked={faturaTuru === "KURUMSAL"} onChange={() => setFaturaTuru("KURUMSAL")} /> Kurumsal</label>
                  </div>
                </div>
                {faturaTuru === "BIREYSEL" && <input name="tcKimlik" placeholder="TC Kimlik No" className="border rounded px-3 py-2 w-full" />}
                {faturaTuru === "KURUMSAL" && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input name="firmaAdi" placeholder="Firma Adı" className="border rounded px-3 py-2" />
                    <input name="vergiDairesi" placeholder="Vergi Dairesi" className="border rounded px-3 py-2" />
                    <input name="vergiNo" placeholder="Vergi No" className="border rounded px-3 py-2" />
                  </div>
                )}
                <button type="submit" disabled={formLoading} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50">
                  {formLoading ? "Kaydediliyor..." : "Kaydet"}
                </button>
                {message && <p className="text-sm text-gray-600">{message}</p>}
              </form>
            </div>
          )}

          {loading ? (
            <p>Yükleniyor...</p>
          ) : addresses.length === 0 ? (
            <p className="text-gray-500">Henüz adres eklememişsiniz.</p>
          ) : (
            <div className="space-y-3">
              {addresses.map((adres) => (
                <div key={adres.id} className="border rounded-lg p-4 bg-white shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{adres.baslik}</h3>
                      {adres.isVarsayilanTeslimat && <span className="inline-block bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded mt-1">Varsayılan Teslimat</span>}
                      {adres.isVarsayilanFatura && <span className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded mt-1 ml-2">Varsayılan Fatura</span>}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => deleteAddress(adres.id)} className="text-red-500 hover:text-red-700 text-sm">Sil</button>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    <p>{adres.teslimAlacakKisi} - {adres.telefon}</p>
                    <p>{adres.adresSatiri}, {adres.mahalle ? adres.mahalle + ", " : ""}{adres.ilce}/{adres.il}</p>
                    {adres.postaKodu && <p>{adres.postaKodu}</p>}
                  </div>
                  <div className="mt-2 flex gap-2 text-xs">
                    {!adres.isVarsayilanTeslimat && <button onClick={() => setDefault(adres.id, "teslimat")} className="bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded">Varsayılan Teslimat Yap</button>}
                    {!adres.isVarsayilanFatura && <button onClick={() => setDefault(adres.id, "fatura")} className="bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded">Varsayılan Fatura Yap</button>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}