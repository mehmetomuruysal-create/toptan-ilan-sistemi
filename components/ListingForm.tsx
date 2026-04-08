"use client";
import { useState } from "react";
import { Plus, Trash2, Save, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

export default function ListingForm({ saticiId }: { saticiId: number }) {
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState("");
  const [mesaj, setMesaj] = useState("");
  const [baremler, setBaremler] = useState([{ miktar: "", fiyat: "" }]);

  const baremEkle = () => setBaremler([...baremler, { miktar: "", fiyat: "" }]);
  const baremCikar = (index: number) => baremler.length > 1 && setBaremler(baremler.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setYukleniyor(true);
    setHata(""); setMesaj("");

    const formData = new FormData(e.currentTarget);
    const data = {
      baslik: formData.get("baslik"),
      aciklama: formData.get("aciklama"),
      urunUrl: formData.get("urunUrl"),
      kategori: formData.get("kategori"),
      perakendeFiyat: formData.get("perakendeFiyat"),
      bitisTarihi: formData.get("bitisTarihi"),
      teslimatYontemi: formData.get("teslimatYontemi"),
      hedefKitle: formData.get("hedefKitle"),
      indirimOrani: formData.get("indirimOrani"),
      depozitoOrani: formData.get("depozitoOrani"),
      minMiktarBireysel: formData.get("minMiktarBireysel"),
      minMiktarKobi: formData.get("minMiktarKobi"),
      minMiktarKurumsal: formData.get("minMiktarKurumsal"),
      baremler: baremler
    };

    try {
      const res = await fetch("/api/ilan-ekle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.hata);
      
      setMesaj(resData.mesaj);
      setTimeout(() => window.location.assign("/"), 2000);
    } catch (err: any) {
      setHata(err.message);
    } finally {
      setYukleniyor(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {hata && <div className="p-4 bg-red-50 text-red-600 rounded-2xl font-bold text-sm flex gap-2"><AlertCircle size={18}/> {hata}</div>}
      {mesaj && <div className="p-4 bg-green-50 text-green-600 rounded-2xl font-bold text-sm flex gap-2"><CheckCircle2 size={18}/> {mesaj}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <input name="baslik" required placeholder="İlan Başlığı *" className="p-4 bg-gray-50 border-2 rounded-2xl outline-none focus:border-blue-500 font-bold" />
        <select name="kategori" className="p-4 bg-gray-50 border-2 rounded-2xl font-bold">
          <option value="tekstil">Tekstil</option>
          <option value="elektronik">Elektronik</option>
          <option value="gida">Gıda</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <input name="perakendeFiyat" type="number" required placeholder="Perakende Fiyat (₺) *" className="p-4 bg-gray-50 border-2 rounded-2xl font-bold" />
        <input name="bitisTarihi" type="date" required className="p-4 bg-gray-50 border-2 rounded-2xl font-bold" />
        <input name="indirimOrani" type="number" defaultValue="10" placeholder="İndirim %" className="p-4 bg-gray-50 border-2 rounded-2xl font-bold" />
      </div>

      <div className="p-6 bg-blue-50 rounded-[2.5rem] space-y-4 border-2 border-dashed border-blue-200">
        <div className="flex justify-between items-center">
          <h3 className="font-black text-blue-900 uppercase italic">Fiyat Baremleri</h3>
          <button type="button" onClick={baremEkle} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase">+ Ekle</button>
        </div>
        {baremler.map((b, i) => (
          <div key={i} className="flex gap-3 animate-in fade-in slide-in-from-right-2">
            <input type="number" placeholder="Min. Adet" className="flex-1 p-3 rounded-xl border-2" onChange={(e) => {
              const n = [...baremler]; n[i].miktar = e.target.value; setBaremler(n);
            }} />
            <input type="number" placeholder="Birim Fiyat" className="flex-1 p-3 rounded-xl border-2" onChange={(e) => {
              const n = [...baremler]; n[i].fiyat = e.target.value; setBaremler(n);
            }} />
            <button type="button" onClick={() => baremCikar(i)} className="text-red-400"><Trash2 size={20}/></button>
          </div>
        ))}
      </div>

      <button disabled={yukleniyor} type="submit" className="w-full bg-blue-600 text-white py-5 rounded-3xl font-black uppercase tracking-widest shadow-xl hover:bg-blue-700 transition-all flex justify-center items-center gap-2">
        {yukleniyor ? <Loader2 className="animate-spin" /> : <><Save size={20}/> İlanı Yayınla</>}
      </button>
    </form>
  );
}