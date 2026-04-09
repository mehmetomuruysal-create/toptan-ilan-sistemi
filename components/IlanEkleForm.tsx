"use client";
import { useState, useEffect, useMemo } from "react";
import { 
  Package, Tag, Eye, Save, Trash2, 
  ChevronRight, ChevronLeft, Upload, FileText, X, 
  AlertCircle, Loader2, Calendar, Plus // 👈 PLUS BURAYA EKLENDİ
} from "lucide-react";
import { upload } from "@vercel/blob/client";

const STEPS = [
  { id: 1, label: "Ürün Bilgisi", icon: <Package size={18} /> },
  { id: 2, label: "Fiyat & Teslimat", icon: <Tag size={18} /> },
  { id: 3, label: "Önizleme", icon: <Eye size={18} /> }
];

const KATEGORILER = ["Tekstil", "Elektronik", "Gıda", "Kozmetik", "İnşaat", "Diğer"];

export default function IlanEkleForm({ saticiId }: { saticiId: number }) {
  const [step, setStep] = useState(1);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState("");

  // --- ŞEHİR VE İLÇE VERİLERİ ---
  const [iller, setIller] = useState<{ id: string; name: string }[]>([]);
  const [tumIlceler, setTumIlceler] = useState<{ id: string; il_id: string; name: string }[]>([]);

  const [formData, setFormData] = useState({
    baslik: "",
    aciklama: "",
    urunUrl: "",
    kategori: "Tekstil",
    perakendeFiyat: "",
    bitisTarihi: "",
    ilId: "", // İl ID'si üzerinden filtreleme yapacağız
    ilce: "",
    teslimatYontemleri: [] as string[],
    baremler: [{ miktar: "", fiyat: "" }]
  });

  const [resimDosyalari, setResimDosyalari] = useState<File[]>([]);
  const [resimOnizlemeler, setResimOnizlemeler] = useState<string[]>([]);
  const [dokumanDosyalari, setDokumanDosyalari] = useState<File[]>([]);

  // --- JSON VERİLERİNİ ÇEK VE AYIKLA ---
  useEffect(() => {
    Promise.all([
      fetch("/data/il.json").then(res => res.json()),
      fetch("/data/ilce.json").then(res => res.json())
    ]).then(([ilRes, ilceRes]) => {
      // PHPMyAdmin formatında asıl veriyi 'type: table' olan objenin 'data' kısmından buluyoruz
      const ilTablosu = ilRes.find((item: any) => item.type === "table" && item.name === "il");
      const ilceTablosu = ilceRes.find((item: any) => item.type === "table" && item.name === "ilce");
      
      if (ilTablosu) setIller(ilTablosu.data.sort((a: any, b: any) => a.name.localeCompare(b.name)));
      if (ilceTablosu) setTumIlceler(ilceTablosu.data);
    }).catch(err => console.error("Konum verileri yüklenemedi:", err));
  }, []);

  // Seçilen İl'e göre ilçeleri filtrele
  const filtrelenmisIlceler = useMemo(() => {
    if (!formData.ilId) return [];
    return tumIlceler
      .filter(i => i.il_id === formData.ilId)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [formData.ilId, tumIlceler]);

  // --- BAREM VE FİYAT DOĞRULAMALARI (KRİTİK) ---
  const validateBaremler = () => {
    const perakende = Number(formData.perakendeFiyat);
    
    for (let i = 0; i < formData.baremler.length; i++) {
      const cur = formData.baremler[i];
      const curFiyat = Number(cur.fiyat);
      const curMiktar = Number(cur.miktar);

      // Kural 1: Perakende fiyat sınırı
      if (curFiyat >= perakende) {
        setHata(`${i + 1}. Barem fiyatı (${curFiyat}₺), perakende fiyattan (${perakende}₺) düşük olmalıdır.`);
        return false;
      }

      // Kural 2: Adet arttıkça fiyat düşmeli
      if (i > 0) {
        const prevFiyat = Number(formData.baremler[i - 1].fiyat);
        const prevMiktar = Number(formData.baremler[i - 1].miktar);

        if (curMiktar <= prevMiktar) {
          setHata(`${i + 1}. Barem miktarı bir önceki baremden (${prevMiktar}) fazla olmalıdır.`);
          return false;
        }
        if (curFiyat >= prevFiyat) {
          setHata(`Fiyat Hatası: Adet arttıkça birim fiyat düşmelidir. ${curMiktar} adet fiyatı, ${prevMiktar} adet fiyatından (${prevFiyat}₺) ucuz olmalıdır.`);
          return false;
        }
      }
    }
    return true;
  };

  const sonrakiAdim = () => {
    setHata("");
    if (step === 1 && (!formData.baslik || !formData.perakendeFiyat)) {
      setHata("Başlık ve Perakende Fiyat alanları zorunludur.");
      return;
    }
    if (step === 2) {
      if (formData.baremler.some(b => !b.miktar || !b.fiyat)) {
        setHata("Lütfen barem bilgilerini tam giriniz.");
        return;
      }
      if (!validateBaremler()) return;
      if (!formData.bitisTarihi || !formData.ilId || !formData.ilce) {
        setHata("Tarih, İl ve İlçe seçimi zorunludur.");
        return;
      }
    }
    setStep(step + 1);
  };

  // --- KAYIT İŞLEMİ ---
  const ilanKaydet = async () => {
    setYukleniyor(true);
    try {
      const imgUrls = await Promise.all(resimDosyalari.map(async f => {
        const b = await upload(`ilan/${Date.now()}-${f.name}`, f, { access: 'public', handleUploadUrl: '/api/upload' });
        return b.url;
      }));
      const docUrls = await Promise.all(dokumanDosyalari.map(async f => {
        const b = await upload(`docs/${Date.now()}-${f.name}`, f, { access: 'public', handleUploadUrl: '/api/upload' });
        return { url: b.url, name: f.name };
      }));

      const secilenIlAdi = iller.find(i => i.id === formData.ilId)?.name;

      const res = await fetch("/api/ilan-ekle", {
        method: "POST",
        body: JSON.stringify({ 
          ...formData, 
          il: secilenIlAdi, 
          saticiId, 
          resimler: imgUrls, 
          dokumanlar: docUrls 
        }),
      });

      if (!res.ok) throw new Error("İlan kaydedilemedi.");
      alert("İlanınız başarıyla onaya gönderildi!");
      window.location.assign("/");
    } catch (err: any) {
      setHata(err.message);
    } finally {
      setYukleniyor(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* PROGRESS INDICATOR */}
      <div className="flex justify-between relative mb-12">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -z-10 -translate-y-1/2"></div>
        {STEPS.map((s) => (
          <div key={s.id} className="flex flex-col items-center bg-gray-50 px-2">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${
              step >= s.id ? "bg-blue-600 text-white shadow-xl shadow-blue-200" : "bg-white border-2 text-gray-300"
            }`}>
              {step > s.id ? "✓" : s.icon}
            </div>
            <span className={`text-[10px] font-black uppercase mt-3 tracking-widest ${step >= s.id ? "text-blue-600" : "text-gray-400"}`}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {hata && (
        <div className="p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 text-sm font-bold border border-red-100 animate-bounce">
          <AlertCircle size={20} /> {hata}
        </div>
      )}

      {/* ADIM 1: ÜRÜN BİLGİSİ */}
      {step === 1 && (
        <div className="space-y-8 animate-in fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input value={formData.baslik} onChange={(e) => setFormData({...formData, baslik: e.target.value})} placeholder="İlan Başlığı *" className="p-4 bg-gray-50 border-2 rounded-2xl font-bold outline-none focus:border-blue-500" />
            <select value={formData.kategori} onChange={(e) => setFormData({...formData, kategori: e.target.value})} className="p-4 bg-gray-50 border-2 rounded-2xl font-bold outline-none">
              {KATEGORILER.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>

          <textarea value={formData.aciklama} onChange={(e) => setFormData({...formData, aciklama: e.target.value})} placeholder="Ürün açıklaması ve teknik detaylar..." rows={4} className="w-full p-4 bg-gray-50 border-2 rounded-2xl outline-none focus:border-blue-500 font-medium" />

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Teknik Evraklar (PDF/Excel)</label>
            <div className="flex flex-wrap gap-2">
              {dokumanDosyalari.map((f, i) => (
                <div key={i} className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-lg text-xs font-bold border"><FileText size={14}/> {f.name}</div>
              ))}
              <label className="border-2 border-dashed p-2 rounded-xl cursor-pointer text-gray-400 hover:text-blue-600">
                <Upload size={16}/> <input type="file" className="hidden" multiple onChange={(e) => setDokumanDosyalari([...dokumanDosyalari, ...Array.from(e.target.files || [])].slice(0, 3))} />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <input type="number" value={formData.perakendeFiyat} onChange={(e) => setFormData({...formData, perakendeFiyat: e.target.value})} placeholder="Perakende Fiyat (₺) *" className="p-4 bg-gray-50 border-2 rounded-2xl font-bold" />
            <input value={formData.urunUrl} onChange={(e) => setFormData({...formData, urunUrl: e.target.value})} placeholder="Dış URL (Opsiyonel)" className="p-4 bg-gray-50 border-2 rounded-2xl font-bold" />
          </div>

          <div className="grid grid-cols-5 gap-4">
            {resimOnizlemeler.map((url, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden border-2"><img src={url} className="w-full h-full object-cover" /></div>
            ))}
            {resimDosyalari.length < 5 && (
              <label className="aspect-square border-2 border-dashed rounded-xl flex items-center justify-center cursor-pointer text-gray-300 hover:text-blue-500">
                <Plus size={30} /> <input type="file" className="hidden" multiple accept="image/*" onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  setResimDosyalari([...resimDosyalari, ...files].slice(0,5));
                  setResimOnizlemeler([...resimOnizlemeler, ...files.map(f => URL.createObjectURL(f))].slice(0,5));
                }} />
              </label>
            )}
          </div>
        </div>
      )}

      {/* ADIM 2: FİYAT & TESLİMAT */}
      {step === 2 && (
        <div className="space-y-8 animate-in fade-in">
          <div className="p-6 bg-blue-50/50 rounded-[2.5rem] border-2 border-dashed border-blue-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-black uppercase italic text-blue-900">Satış Baremleri</h3>
              <button onClick={() => setFormData({...formData, baremler: [...formData.baremler, {miktar: "", fiyat: ""}]})} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase">+ Barem Ekle</button>
            </div>
            {formData.baremler.map((b, i) => (
              <div key={i} className="flex gap-4 mb-4">
                <input placeholder="Min. Adet" type="number" value={b.miktar} onChange={(e) => {
                  const n = [...formData.baremler]; n[i].miktar = e.target.value; setFormData({...formData, baremler: n});
                }} className="flex-1 p-4 rounded-2xl border-2 font-bold" />
                <input placeholder="Birim Fiyat" type="number" value={b.fiyat} onChange={(e) => {
                  const n = [...formData.baremler]; n[i].fiyat = e.target.value; setFormData({...formData, baremler: n});
                }} className="flex-1 p-4 rounded-2xl border-2 font-bold" />
                {i > 0 && <Trash2 className="text-red-400 cursor-pointer self-center" onClick={() => setFormData({...formData, baremler: formData.baremler.filter((_, idx) => idx !== i)})} />}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <span className="text-[9px] font-black text-gray-400 ml-4 uppercase">İlan Bitiş Tarihi *</span>
              <input type="date" value={formData.bitisTarihi} onChange={(e) => setFormData({...formData, bitisTarihi: e.target.value})} className="w-full p-4 bg-gray-50 border-2 rounded-2xl font-bold" />
            </div>
            <div className="space-y-1">
              <span className="text-[9px] font-black text-gray-400 ml-4 uppercase">İl Seçin</span>
              <select value={formData.ilId} onChange={(e) => setFormData({...formData, ilId: e.target.value, ilce: ""})} className="w-full p-4 bg-gray-50 border-2 rounded-2xl font-bold outline-none">
                <option value="">İl Seçiniz</option>
                {iller.map(il => <option key={il.id} value={il.id}>{il.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <span className="text-[9px] font-black text-gray-400 ml-4 uppercase">İlçe Seçin</span>
              <select value={formData.ilce} onChange={(e) => setFormData({...formData, ilce: e.target.value})} disabled={!formData.ilId} className="w-full p-4 bg-gray-50 border-2 rounded-2xl font-bold outline-none disabled:opacity-40">
                <option value="">İlçe Seçiniz</option>
                {filtrelenmisIlceler.map(ilce => <option key={ilce.id} value={ilce.name}>{ilce.name}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* ADIM 3: ÖNİZLEME */}
      {step === 3 && (
        <div className="space-y-8 animate-in zoom-in-95">
          <div className="bg-gray-50 p-8 rounded-[3rem] border-2 border-dashed">
            <h2 className="text-3xl font-black italic uppercase text-gray-900 mb-4">{formData.baslik}</h2>
            <div className="grid grid-cols-2 gap-6 mb-8 text-sm">
              <div className="bg-white p-6 rounded-[2rem] shadow-sm"><span className="block text-[10px] font-black text-gray-400 uppercase">Lokasyon</span><b>{iller.find(i => i.id === formData.ilId)?.name} / {formData.ilce}</b></div>
              <div className="bg-white p-6 rounded-[2rem] shadow-sm"><span className="block text-[10px] font-black text-gray-400 uppercase">Bitiş Tarihi</span><b>{formData.bitisTarihi}</b></div>
            </div>
            <div className="space-y-2">
              <span className="text-[10px] font-black text-gray-400 uppercase ml-4">Barem Fiyatları</span>
              {formData.baremler.map((b, i) => (
                <div key={i} className="flex justify-between items-center bg-white p-5 rounded-[1.5rem] shadow-sm font-bold">
                  <span>{b.miktar}+ Adet</span>
                  <span className="text-blue-600 text-xl">{b.fiyat} ₺</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* FOOTER NAV */}
      <div className="flex gap-4 pt-10">
        {step > 1 && <button onClick={() => setStep(step - 1)} className="flex-1 bg-white border-2 p-6 rounded-[2.5rem] font-black uppercase text-gray-400"><ChevronLeft className="inline mr-2"/> Geri</button>}
        {step < 3 ? (
          <button onClick={sonrakiAdim} className="flex-[2] bg-blue-600 text-white p-6 rounded-[2.5rem] font-black uppercase shadow-2xl">Devam Et <ChevronRight className="inline ml-2"/></button>
        ) : (
          <button onClick={ilanKaydet} disabled={yukleniyor} className="flex-[2] bg-green-600 text-white p-6 rounded-[2.5rem] font-black uppercase shadow-2xl">
            {yukleniyor ? <Loader2 className="animate-spin inline"/> : <><Save size={20} className="inline mr-2"/> İlanı Yayınla</>}
          </button>
        )}
      </div>
    </div>
  );
}