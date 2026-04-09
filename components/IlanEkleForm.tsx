"use client";
import { useState } from "react";
import { 
  Package, Tag, MapPin, Eye, Save, 
  Plus, Trash2, ChevronRight, ChevronLeft, 
  Upload, FileText, X, AlertCircle, Loader2 
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

  const [formData, setFormData] = useState({
    baslik: "",
    aciklama: "",
    urunUrl: "",
    kategori: "Tekstil",
    perakendeFiyat: "",
    il: "",
    ilce: "",
    teslimatYontemleri: [] as string[],
    baremler: [{ miktar: "", fiyat: "" }]
  });

  const [resimDosyalari, setResimDosyalari] = useState<File[]>([]);
  const [resimOnizlemeler, setResimOnizlemeler] = useState<string[]>([]);
  const [dokumanDosyalari, setDokumanDosyalari] = useState<File[]>([]);

  // --- BAREM DOĞRULAMA FONKSİYONU ---
  const validateBaremler = () => {
    const perakende = Number(formData.perakendeFiyat);
    
    for (let i = 0; i < formData.baremler.length; i++) {
      const current = formData.baremler[i];
      const curFiyat = Number(current.fiyat);
      const curMiktar = Number(current.miktar);

      // 1. Perakende Fiyat Kontrolü
      if (curFiyat >= perakende) {
        setHata(`${i + 1}. Barem fiyatı (${curFiyat}₺), perakende fiyattan (${perakende}₺) düşük olmalıdır.`);
        return false;
      }

      // 2. Önceki Baremle Kıyaslama
      if (i > 0) {
        const prevFiyat = Number(formData.baremler[i - 1].fiyat);
        const prevMiktar = Number(formData.baremler[i - 1].miktar);

        if (curMiktar <= prevMiktar) {
          setHata(`${i + 1}. Baremin miktarı bir önceki baremden (${prevMiktar}) fazla olmalıdır.`);
          return false;
        }
        if (curFiyat >= prevFiyat) {
          setHata(`Mantık Hatası: Adet arttıkça fiyat düşmelidir. ${curMiktar} adet fiyatı, ${prevMiktar} adet fiyatından (${prevFiyat}₺) ucuz olmalıdır.`);
          return false;
        }
      }
    }
    return true;
  };

  const handleBaremChange = (index: number, field: "miktar" | "fiyat", value: string) => {
    const yeniBaremler = [...formData.baremler];
    yeniBaremler[index][field] = value;
    setFormData({ ...formData, baremler: yeniBaremler });
    setHata(""); 
  };

  const baremEkle = () => {
    const last = formData.baremler[formData.baremler.length - 1];
    if (!last.miktar || !last.fiyat) {
      setHata("Yeni barem eklemeden önce mevcut baremi doldurmalısınız.");
      return;
    }
    setFormData({ ...formData, baremler: [...formData.baremler, { miktar: "", fiyat: "" }] });
  };

  const sonrakiAdim = () => {
    setHata("");
    if (step === 1) {
      if (!formData.baslik || !formData.perakendeFiyat) {
        setHata("Başlık ve Perakende Fiyat alanları zorunludur.");
        return;
      }
    }
    if (step === 2) {
      if (formData.baremler.some(b => !b.miktar || !b.fiyat)) {
        setHata("Lütfen tüm baremleri doldurun.");
        return;
      }
      if (!validateBaremler()) return;
      if (!formData.il || !formData.ilce) {
        setHata("Lütfen İl ve İlçe bilgilerini giriniz.");
        return;
      }
    }
    setStep(step + 1);
  };

  const resimSil = (index: number) => {
    setResimDosyalari(resimDosyalari.filter((_, i) => i !== index));
    setResimOnizlemeler(resimOnizlemeler.filter((_, i) => i !== index));
  };

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

      if (!res.ok) throw new Error("Kayıt sırasında hata oluştu.");
      alert("İlan başarıyla oluşturuldu!");
      window.location.assign("/");
    } catch (err: any) {
      setHata(err.message);
    } finally {
      setYukleniyor(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* STEP INDICATOR */}
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
        <div className="p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 text-sm font-bold border border-red-100 animate-pulse">
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
          <textarea value={formData.aciklama} onChange={(e) => setFormData({...formData, aciklama: e.target.value})} placeholder="Ürün özelliklerini buraya yazın..." rows={4} className="w-full p-4 bg-gray-50 border-2 rounded-2xl outline-none focus:border-blue-500 font-medium" />
          
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400">Ürün Evrakı (Teknik Şartname/Sertifika)</label>
            <div className="flex flex-wrap gap-2">
              {dokumanDosyalari.map((f, i) => (
                <div key={i} className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-xl text-xs font-bold border">
                  <FileText size={14} /> {f.name}
                  <X size={14} className="cursor-pointer" onClick={() => setDokumanDosyalari(dokumanDosyalari.filter((_, idx) => idx !== i))} />
                </div>
              ))}
              <label className="flex items-center gap-2 border-2 border-dashed p-2 rounded-xl cursor-pointer text-gray-400 hover:text-blue-600">
                <Upload size={16} /> <span className="text-[11px] font-black uppercase">Evrak Ekle</span>
                <input type="file" className="hidden" multiple onChange={(e) => setDokumanDosyalari([...dokumanDosyalari, ...Array.from(e.target.files || [])].slice(0, 3))} />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <input type="number" value={formData.perakendeFiyat} onChange={(e) => setFormData({...formData, perakendeFiyat: e.target.value})} placeholder="Perakende Fiyat (₺) *" className="p-4 bg-gray-50 border-2 rounded-2xl font-bold" />
            <input value={formData.urunUrl} onChange={(e) => setFormData({...formData, urunUrl: e.target.value})} placeholder="Ürün URL (Dış Link)" className="p-4 bg-gray-50 border-2 rounded-2xl font-bold" />
          </div>
        </div>
      )}

      {/* ADIM 2: FİYAT & TESLİMAT */}
      {step === 2 && (
        <div className="space-y-8 animate-in fade-in">
          <div className="p-6 bg-blue-50/50 rounded-[2rem] border-2 border-dashed border-blue-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-black uppercase italic text-blue-900">Satış Baremleri</h3>
              <button onClick={baremEkle} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase">+ Barem Ekle</button>
            </div>
            <div className="space-y-4">
              {formData.baremler.map((b, i) => (
                <div key={i} className="flex gap-4 items-center">
                  <div className="flex-1 space-y-1">
                    <span className="text-[9px] font-black uppercase text-gray-400 ml-2">Min. Adet</span>
                    <input type="number" value={b.miktar} onChange={(e) => handleBaremChange(i, "miktar", e.target.value)} className="w-full p-4 rounded-2xl border-2 font-bold focus:border-blue-500 outline-none" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <span className="text-[9px] font-black uppercase text-gray-400 ml-2">Birim Fiyat (₺)</span>
                    <input type="number" value={b.fiyat} onChange={(e) => handleBaremChange(i, "fiyat", e.target.value)} className="w-full p-4 rounded-2xl border-2 font-bold focus:border-blue-500 outline-none" />
                  </div>
                  <button onClick={() => setFormData({...formData, baremler: formData.baremler.filter((_, idx) => idx !== i)})} className="text-red-400 mt-6"><Trash2 size={20}/></button>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <span className="text-[9px] font-black uppercase text-gray-400 ml-2">İl</span>
              <input value={formData.il} onChange={(e) => setFormData({...formData, il: e.target.value})} placeholder="Örn: İstanbul" className="w-full p-4 bg-gray-50 border-2 rounded-2xl font-bold outline-none focus:border-blue-500" />
            </div>
            <div className="space-y-1">
              <span className="text-[9px] font-black uppercase text-gray-400 ml-2">İlçe</span>
              <input value={formData.ilce} onChange={(e) => setFormData({...formData, ilce: e.target.value})} placeholder="Örn: Kadıköy" className="w-full p-4 bg-gray-50 border-2 rounded-2xl font-bold outline-none focus:border-blue-500" />
            </div>
          </div>
        </div>
      )}

      {/* ADIM 3: ÖNİZLEME */}
      {step === 3 && (
        <div className="space-y-8 animate-in zoom-in-95">
          <div className="bg-gray-50 p-8 rounded-[3rem] border-2 border-dashed">
            <h2 className="text-3xl font-black italic uppercase text-gray-900 mb-2">{formData.baslik}</h2>
            <p className="text-gray-500 font-medium mb-6">{formData.aciklama}</p>
            <div className="grid grid-cols-2 gap-4 text-sm mb-6">
              <div className="bg-white p-4 rounded-2xl shadow-sm"><span className="text-[10px] font-black text-gray-400 uppercase block">Lokasyon</span><b>{formData.il} / {formData.ilce}</b></div>
              <div className="bg-white p-4 rounded-2xl shadow-sm"><span className="text-[10px] font-black text-gray-400 uppercase block">Perakende</span><b>{formData.perakendeFiyat} ₺</b></div>
            </div>
            <div className="space-y-2">
              <span className="text-[10px] font-black text-gray-400 uppercase">Onaylanacak Baremler</span>
              {formData.baremler.map((b, i) => (
                <div key={i} className="flex justify-between bg-blue-100/50 p-3 rounded-xl font-bold text-blue-900">
                  <span>{b.miktar}+ Adet</span>
                  <span>{b.fiyat} ₺</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* NAV BUTONLARI */}
      <div className="flex gap-4 pt-10">
        {step > 1 && (
          <button onClick={() => setStep(step - 1)} className="flex-1 bg-white border-2 p-5 rounded-[2rem] font-black uppercase text-gray-400 flex items-center justify-center gap-2">
            <ChevronLeft size={20} /> Geri
          </button>
        )}
        {step < 3 ? (
          <button onClick={sonrakiAdim} className="flex-[2] bg-blue-600 text-white p-5 rounded-[2rem] font-black uppercase shadow-xl flex items-center justify-center gap-2">
            Devam Et <ChevronRight size={20} />
          </button>
        ) : (
          <button onClick={ilanKaydet} disabled={yukleniyor} className="flex-[2] bg-green-600 text-white p-5 rounded-[2rem] font-black uppercase shadow-xl flex items-center justify-center gap-2">
            {yukleniyor ? <Loader2 className="animate-spin" /> : <><Save size={20} /> İlanı Yayınla</>}
          </button>
        )}
      </div>
    </div>
  );
}