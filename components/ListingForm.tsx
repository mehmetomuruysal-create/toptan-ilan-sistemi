"use client";
import { useState } from "react";
import { Plus, Trash2, Save, AlertCircle, CheckCircle2 } from "lucide-react";

export default function ListingForm({ saticiId }: { saticiId: number }) {
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState("");
  const [mesaj, setMesaj] = useState("");
  
  // Başlangıçta 1 adet boş barem
  const [baremler, setBaremler] = useState([{ miktar: "", fiyat: "" }]);

  const baremEkle = () => setBaremler([...baremler, { miktar: "", fiyat: "" }]);
  const baremCikar = (index: number) => {
    if (baremler.length > 1) {
      setBaremler(baremler.filter((_, i) => i !== index));
    }
  };

  const baremGuncelle = (index: number, field: "miktar" | "fiyat", value: string) => {
    const yeniBaremler = [...baremler];
    yeniBaremler[index][field] = value;
    setBaremler(yeniBaremler);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setYukleniyor(true);
    setHata("");
    setMesaj("");

    const formData = new FormData(e.currentTarget);
    
    // API'nin beklediği JSON yapısı
    const ilanVerisi = {
      baslik: formData.get("baslik"),
      aciklama: formData.get("aciklama"),
      urunUrl: formData.get("urunUrl"),
      kategori: formData.get("kategori"),
      perakendeFiyat: Number(formData.get("perakendeFiyat")),
      bitisTarihi: formData.get("bitisTarihi"),
      teslimatYontemi: formData.get("teslimatYontemi"),
      hedefKitle: formData.get("hedefKitle"),
      indirimOrani: Number(formData.get("indirimOrani")),
      depozitoOrani: Number(formData.get("depozitoOrani")),
      minMiktarBireysel: Number(formData.get("minMiktarBireysel")),
      minMiktarKobi: Number(formData.get("minMiktarKobi")),
      minMiktarKurumsal: Number(formData.get("minMiktarKurumsal")),
      baremler: baremler.map(b => ({
        miktar: Number(b.miktar),
        fiyat: Number(b.fiyat)
      }))
    };

    try {
      const res = await fetch("/api/ilan-ekle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ilanVerisi),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.hata || "İlan eklenirken bir hata oluştu.");
      }

      setMesaj(result.mesaj);
      setTimeout(() => window.location.assign("/"), 2000);
    } catch (err: any) {
      setHata(err.message);
    } finally {
      setYukleniyor(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      {hata && (
        <div className="p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex items-center gap-3 font-bold text-sm">
          <AlertCircle size={20} /> {hata}
        </div>
      )}
      {mesaj && (
        <div className="p-4 bg-green-50 text-green-600 rounded-2xl border border-green-100 flex items-center gap-3 font-bold text-sm">
          <CheckCircle2 size={20} /> {mesaj}
        </div>
      )}

      {/* Bölüm 1: Ürün Bilgileri */}
      <div className="space-y-6">
        <h3 className="text-xl font-black uppercase italic tracking-tighter text-gray-800 border-l-4 border-blue-600 pl-4">Ürün Bilgileri</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-2">İlan Başlığı *</label>
            <input name="baslik" required className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-600 outline-none transition-all font-bold" placeholder="Ürün adını girin..." />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Kategori</label>
            <select name="kategori" className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-600 outline-none transition-all font-bold">
              <option value="elektronik">Elektronik</option>
              <option value="tekstil">Tekstil</option>
              <option value="gida">Gıda</option>
              <option value="kozmetik">Kozmetik</option>
              <option value="diger">Diğer</option>
            </select>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Açıklama</label>
          <textarea name="aciklama" rows={3} className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-600 outline-none transition-all font-medium" placeholder="Ürün detaylarını anlatın..." />
        </div>
      </div>

      {/* Bölüm 2: Fiyatlandırma ve Tarih */}
      <div className="space-y-6">
        <h3 className="text-xl font-black uppercase italic tracking-tighter text-gray-800 border-l-4 border-blue-600 pl-4">Fiyat ve Süre</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Perakende Fiyat (₺) *</label>
            <input name="perakendeFiyat" type="number" required className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-600 outline-none transition-all font-bold" placeholder="0.00" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Bitiş Tarihi *</label>
            <input name="bitisTarihi" type="date" required className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-600 outline-none transition-all font-bold" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-2">İndirim Oranı (%)</label>
            <input name="indirimOrani" type="number" defaultValue="10" className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-600 outline-none transition-all font-bold" />
          </div>
        </div>
      </div>

      {/* Bölüm 3: Dinamik Baremler (EN ÖNEMLİ KISIM) */}
      <div className="space-y-6 p-8 bg-blue-50/50 rounded-[2.5rem] border-2 border-dashed border-blue-100">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black uppercase italic tracking-tighter text-blue-900">Fiyat Baremleri</h3>
          <button type="button" onClick={baremEkle} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
            <Plus size={16} /> Barem Ekle
          </button>
        </div>
        
        <div className="space-y-4">
          {baremler.map((barem, index) => (
            <div key={index} className="flex flex-col md:flex-row items-end gap-4 bg-white p-6 rounded-3xl shadow-sm border border-blue-50 animate-in slide-in-from-right-4 duration-300">
              <div className="flex-1 space-y-2 w-full">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-2">{index + 1}. Kademe Min. Miktar</label>
                <input 
                  type="number" 
                  value={barem.miktar}
                  onChange={(e) => baremGuncelle(index, "miktar", e.target.value)}
                  placeholder="Örn: 50"
                  className="w-full p-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-blue-500 outline-none font-bold"
                />
              </div>
              <div className="flex-1 space-y-2 w-full">
                <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Birim Fiyat (₺)</label>
                <input 
                  type="number" 
                  value={barem.fiyat}
                  onChange={(e) => baremGuncelle(index, "fiyat", e.target.value)}
                  placeholder="Örn: 85"
                  className="w-full p-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-blue-500 outline-none font-bold"
                />
              </div>
              <button 
                type="button" 
                onClick={() => baremCikar(index)}
                className="p-3 text-red-400 hover:bg-red-50 rounded-xl transition-all"
              >
                <Trash2 size={24} />
              </button>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-blue-400 font-bold uppercase tracking-tight text-center">NOT: Son eklediğiniz barem, ilanın ana hedefi (Hedef Sayı ve Toptan Fiyat) olarak kabul edilir.</p>
      </div>

      {/* Bölüm 4: Ek Ayarlar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="text-sm font-black uppercase text-gray-800">Minimum Alım Limitleri</h3>
          <div className="grid grid-cols-3 gap-2">
            <input name="minMiktarBireysel" type="number" defaultValue="1" placeholder="Bireysel" className="p-3 bg-gray-50 border-2 border-gray-100 rounded-xl text-xs font-bold" title="Bireysel Min" />
            <input name="minMiktarKobi" type="number" defaultValue="5" placeholder="KOBİ" className="p-3 bg-gray-50 border-2 border-gray-100 rounded-xl text-xs font-bold" title="KOBİ Min" />
            <input name="minMiktarKurumsal" type="number" defaultValue="20" placeholder="Kurumsal" className="p-3 bg-gray-50 border-2 border-gray-100 rounded-xl text-xs font-bold" title="Kurumsal Min" />
          </div>
        </div>
        <div className="space-y-4">
          <h3 className="text-sm font-black uppercase text-gray-800">Sistem Ayarları</h3>
          <div className="grid grid-cols-2 gap-4">
            <select name="teslimatYontemi" className="p-3 bg-gray-50 border-2 border-gray-100 rounded-xl text-xs font-bold">
              <option value="kargo">Kargo</option>
              <option value="ambar">Ambar</option>
              <option value="elden">Elden Teslim</option>
            </select>
            <input name="depozitoOrani" type="number" defaultValue="30" placeholder="Depozito %" className="p-3 bg-gray-50 border-2 border-gray-100 rounded-xl text-xs font-bold" />
          </div>
        </div>
      </div>

      <button 
        type="submit" 
        disabled={yukleniyor}
        className="w-full bg-blue-600 text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-2xl shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-4 disabled:bg-gray-200 disabled:shadow-none"
      >
        {yukleniyor ? "İşleniyor..." : <><Save size={24} /> İlanı Yayınla & Onaya Gönder</>}
      </button>
    </form>
  );
}