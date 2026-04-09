"use client";
import { useState, useEffect, useMemo } from "react";
import { 
  Package, Tag, Eye, Save, Trash2, MapPin,
  ChevronRight, ChevronLeft, Upload, FileText, X, 
  AlertCircle, Loader2, Calendar, Plus 
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

  // Geçici konum seçimi için
  const [seciliIlId, setSeciliIlId] = useState("");
  const [seciliIlce, setSeciliIlce] = useState("");

  const [formData, setFormData] = useState({
    baslik: "",
    aciklama: "",
    urunUrl: "",
    kategori: "Tekstil",
    perakendeFiyat: "",
    bitisTarihi: "",
    lokasyonlar: [] as { il: string, ilce: string }[], // Çoklu lokasyon
    teslimatYontemleri: [] as string[],
    baremler: [{ miktar: "", fiyat: "" }]
  });

  const [resimDosyalari, setResimDosyalari] = useState<File[]>([]);
  const [resimOnizlemeler, setResimOnizlemeler] = useState<string[]>([]);
  const [dokumanDosyalari, setDokumanDosyalari] = useState<File[]>([]);

  // --- VERİ ÇEKME (JSON) ---
  useEffect(() => {
    const veriCek = async () => {
      try {
        const [ilRes, ilceRes] = await Promise.all([
          fetch("/data/il.json").then(res => res.json()),
          fetch("/data/ilce.json").then(res => res.json())
        ]);

        const ilData = (Array.isArray(ilRes[0]) ? ilRes[0] : ilRes).find((item: any) => item.type === "table")?.data;
        const ilceData = (Array.isArray(ilceRes[0]) ? ilceRes[0] : ilceRes).find((item: any) => item.type === "table")?.data;

        if (ilData) setIller(ilData.sort((a: any, b: any) => a.name.localeCompare(b.name, 'tr')));
        if (ilceData) setTumIlceler(ilceData);
      } catch (err) {
        setHata("Şehir verileri yüklenemedi. Dosyaları kontrol edin.");
      }
    };
    veriCek();
  }, []);

  const filtrelenmisIlceler = useMemo(() => {
    if (!seciliIlId) return [];
    return tumIlceler.filter(i => i.il_id === seciliIlId).sort((a, b) => a.name.localeCompare(b.name, 'tr'));
  }, [seciliIlId, tumIlceler]);

  // --- KONUM EKLE/SİL ---
  const konumEkle = () => {
    if (!seciliIlId || !seciliIlce) {
      setHata("Lütfen önce il ve ilçe seçin.");
      return;
    }
    const ilAdi = iller.find(i => i.id === seciliIlId)?.name || "";
    const varMi = formData.lokasyonlar.some(l => l.il === ilAdi && l.ilce === seciliIlce);
    
    if (varMi) {
      setHata("Bu konum zaten eklenmiş.");
      return;
    }

    setFormData({
      ...formData,
      lokasyonlar: [...formData.lokasyonlar, { il: ilAdi, ilce: seciliIlce }]
    });
    setSeciliIlce("");
    setHata("");
  };

  const konumSil = (index: number) => {
    setFormData({ ...formData, lokasyonlar: formData.lokasyonlar.filter((_, i) => i !== index) });
  };

  // --- BAREM DOĞRULAMA ---
  const validateBaremler = () => {
    const perakende = Number(formData.perakendeFiyat);
    for (let i = 0; i < formData.baremler.length; i++) {
      const cur = formData.baremler[i];
      if (Number(cur.fiyat) >= perakende) {
        setHata(`${i + 1}. Barem fiyatı perakende fiyattan (${perakende}₺) düşük olmalıdır.`);
        return false;
      }
      if (i > 0) {
        const prev = formData.baremler[i-1];
        if (Number(cur.miktar) <= Number(prev.miktar)) {
          setHata("Miktarlar artan sırada olmalıdır.");
          return false;
        }
        if (Number(cur.fiyat) >= Number(prev.fiyat)) {
          setHata(`${cur.miktar} adet fiyatı, ${prev.miktar} adet fiyatından ucuz olmalıdır.`);
          return false;
        }
      }
    }
    return true;
  };

  const sonrakiAdim = () => {
    setHata("");
    if (step === 1 && (!formData.baslik || !formData.perakendeFiyat)) {
      setHata("Başlık ve Perakende Fiyat zorunludur.");
      return;
    }
    if (step === 2) {
      if (formData.lokasyonlar.length === 0) {
        setHata("En az bir gönderim konumu eklemelisiniz.");
        return;
      }
      if (!validateBaremler()) return;
      if (!formData.bitisTarihi) {
        setHata("Lütfen bir bitiş tarihi seçin.");
        return;
      }
    }
    setStep(step + 1);
  };

  // --- KAYIT ---
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

      const res = await fetch("/api/ilan-ekle", {
        method: "POST",
        body: JSON.stringify({ ...formData, saticiId, resimler: imgUrls, dokumanlar: docUrls }),
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
      {/* PROGRESS BAR */}
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

      {hata && <div className="p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 text-sm font-bold border border-red-100 animate-bounce"><AlertCircle size={20} /> {hata}</div>}

      {/* ADIM 1: ÜRÜN BİLGİSİ */}
      {step === 1 && (
        <div className="space-y-8 animate-in fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input value={formData.baslik} onChange={(e) => setFormData({...formData, baslik: e.target.value})} placeholder="İlan Başlığı *" className="p-4 bg-gray-50 border-2 rounded-2xl font-bold outline-none focus:border-blue-500" />
            <select value={formData.kategori} onChange={(e) => setFormData({...formData, kategori: e.target.value})} className="p-4 bg-gray-50 border-2 rounded-2xl font-bold outline-none">
              {KATEGORILER.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>
          <textarea value={formData.aciklama} onChange={(e) => setFormData({...formData, aciklama: e.target.value})} placeholder="Ürün açıklaması..." rows={4} className="w-full p-4 bg-gray-50 border-2 rounded-2xl outline-none focus:border-blue-500 font-medium" />
          
          <div className="grid grid-cols-2 gap-6">
            <input type="number" value={formData.perakendeFiyat} onChange={(e) => setFormData({...formData, perakendeFiyat: e.target.value})} placeholder="Perakende Fiyat (₺) *" className="p-4 bg-gray-50 border-2 rounded-2xl font-bold" />
            <input value={formData.urunUrl} onChange={(e) => setFormData({...formData, urunUrl: e.target.value})} placeholder="Dış URL (Opsiyonel)" className="p-4 bg-gray-50 border-2 rounded-2xl font-bold" />
          </div>

          <div className="grid grid-cols-5 gap-4">
            {resimOnizlemeler.map((url, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden border-2"><img src={url} className="w-full h-full object-cover" /></div>
            ))}
            {resimDosyalari.length < 5 && (
              <label className="aspect-square border-2 border-dashed rounded-xl flex items-center justify-center cursor-pointer text-gray-300 hover:text-blue-500 transition-colors">
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
          {/* BAREMLER */}
          <div className="p-6 bg-blue-50/50 rounded-[2.5rem] border-2 border-dashed border-blue-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-black uppercase italic text-blue-900">Satış Baremleri</h3>
              <button onClick={() => setFormData({...formData, baremler: [...formData.baremler, {miktar: "", fiyat: ""}]})} className="bg-blue-600 text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase shadow-lg shadow-blue-100">+ Barem Ekle</button>
            </div>
            {formData.baremler.map((b, i) => (
              <div key={i} className="flex gap-4 mb-4 animate-in slide-in-from-right-2">
                <input placeholder="Adet" type="number" value={b.miktar} onChange={(e) => {const n = [...formData.baremler]; n[i].miktar = e.target.value; setFormData({...formData, baremler: n})}} className="flex-1 p-4 rounded-2xl border-2 font-bold focus:border-blue-500 outline-none" />
                <input placeholder="Fiyat (₺)" type="number" value={b.fiyat} onChange={(e) => {const n = [...formData.baremler]; n[i].fiyat = e.target.value; setFormData({...formData, baremler: n})}} className="flex-1 p-4 rounded-2xl border-2 font-bold focus:border-blue-500 outline-none" />
                {i > 0 && <Trash2 className="text-red-400 cursor-pointer self-center hover:text-red-600" onClick={() => setFormData({...formData, baremler: formData.baremler.filter((_, idx) => idx !== i)})} />}
              </div>
            ))}
          </div>

          {/* ÇOKLU KONUM SEÇİMİ */}
          <div className="space-y-4">
            <div className="flex justify-between items-center px-2">
              <h3 className="text-[10px] font-black uppercase text-gray-400 italic">Gönderim Bölgeleri</h3>
              <input type="date" value={formData.bitisTarihi} onChange={(e) => setFormData({...formData, bitisTarihi: e.target.value})} className="p-2 bg-white border-2 rounded-xl text-xs font-bold outline-none" title="Bitiş Tarihi" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <select value={seciliIlId} onChange={(e) => setSeciliIlId(e.target.value)} className="md:col-span-2 p-4 bg-gray-50 border-2 rounded-2xl font-bold outline-none focus:border-blue-500">
                <option value="">İl Seçiniz</option>
                {iller.map(il => <option key={il.id} value={il.id}>{il.name}</option>)}
              </select>
              <select value={seciliIlce} onChange={(e) => setSeciliIlce(e.target.value)} disabled={!seciliIlId} className="md:col-span-2 p-4 bg-gray-50 border-2 rounded-2xl font-bold outline-none disabled:opacity-40">
                <option value="">İlçe Seçiniz</option>
                {filtrelenmisIlceler.map(ilce => <option key={ilce.id} value={ilce.name}>{ilce.name}</option>)}
              </select>
              <button onClick={konumEkle} className="bg-blue-600 text-white p-4 rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-2 hover:bg-blue-700 transition-all">
                <Plus size={20} /> Ekle
              </button>
            </div>

            {/* EKLENEN KONUMLARIN LİSTESİ */}
            <div className="flex flex-wrap gap-2 p-4 bg-gray-50/50 rounded-3xl border-2 border-dotted border-gray-200 min-h-[60px]">
              {formData.lokasyonlar.length === 0 && <span className="text-[10px] text-gray-400 font-bold italic m-auto">Lütfen gönderim yapılacak bölgeleri ekleyin...</span>}
              {formData.lokasyonlar.map((l, i) => (
                <div key={i} className="flex items-center gap-2 bg-white border border-blue-200 px-4 py-2 rounded-xl shadow-sm animate-in zoom-in-95">
                  <MapPin size={14} className="text-blue-600" />
                  <span className="text-[11px] font-black text-gray-700 uppercase">{l.il} / {l.ilce}</span>
                  <button onClick={() => konumSil(i)} className="text-red-400 hover:text-red-600 ml-1 transition-colors"><X size={14} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ADIM 3: ÖNİZLEME */}
      {step === 3 && (
        <div className="space-y-8 animate-in zoom-in-95">
          <div className="bg-gray-50 p-8 rounded-[3.5rem] border-2 border-dashed border-gray-200">
            <h2 className="text-4xl font-black italic uppercase text-gray-900 mb-6 tracking-tight">{formData.baslik}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 text-sm">
              <div className="bg-white p-6 rounded-[2rem] shadow-sm"><span className="block text-[10px] font-black text-gray-400 uppercase mb-1">Bitiş Tarihi</span><b>{formData.bitisTarihi}</b></div>
              <div className="bg-white p-6 rounded-[2rem] shadow-sm"><span className="block text-[10px] font-black text-gray-400 uppercase mb-1">Perakende Fiyat</span><b className="text-blue-600">{formData.perakendeFiyat} ₺</b></div>
            </div>

            <div className="mb-8">
              <span className="text-[10px] font-black text-gray-400 uppercase ml-4 block mb-2">Hizmet Bölgeleri ({formData.lokasyonlar.length})</span>
              <div className="flex flex-wrap gap-2">
                {formData.lokasyonlar.map((l, i) => (
                  <span key={i} className="bg-gray-900 text-white text-[9px] font-black px-3 py-1.5 rounded-lg uppercase tracking-wider">{l.il} / {l.ilce}</span>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-black text-gray-400 uppercase ml-4 block">Fiyat Baremleri</span>
              {formData.baremler.map((b, i) => (
                <div key={i} className="flex justify-between items-center bg-white p-5 rounded-[1.5rem] shadow-sm font-bold border border-gray-50">
                  <span className="text-gray-700 text-lg">{b.miktar}+ Adet</span>
                  <span className="text-blue-600 text-2xl">{b.fiyat} ₺ <small className="text-[10px] text-gray-400">/ adet</small></span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* NAV BUTONLARI */}
      <div className="flex gap-4 pt-10">
        {step > 1 && <button onClick={() => setStep(step - 1)} className="flex-1 bg-white border-2 p-6 rounded-[2.5rem] font-black uppercase text-gray-400 hover:bg-gray-50 transition-all"><ChevronLeft className="inline mr-2" /> Geri</button>}
        {step < 3 ? (
          <button onClick={sonrakiAdim} className="flex-[2] bg-blue-600 text-white p-6 rounded-[2.5rem] font-black uppercase shadow-2xl hover:bg-blue-700 transition-all">Devam Et <ChevronRight className="inline ml-2" /></button>
        ) : (
          <button onClick={ilanKaydet} disabled={yukleniyor} className="flex-[2] bg-green-600 text-white p-6 rounded-[2.5rem] font-black uppercase shadow-2xl hover:bg-green-700 transition-all flex items-center justify-center gap-2">
            {yukleniyor ? <Loader2 className="animate-spin" /> : <><Save size={20} /> Yayınla</>}
          </button>
        )}
      </div>
    </div>
  );
}