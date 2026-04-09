"use client";
import { useState } from "react";
import { 
  Package, Tag, MapPin, Truck, Eye, Save, 
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
const BOLGELER = ["Marmara", "İç Anadolu", "Ege", "Akdeniz", "Karadeniz", "Doğu Anadolu", "Güneydoğu"];

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
    bolge: "",
    il: "",
    ilce: "",
    teslimatYontemleri: [] as string[],
    baremler: [{ miktar: "", fiyat: "" }]
  });

  const [resimDosyalari, setResimDosyalari] = useState<File[]>([]);
  const [resimOnizlemeler, setResimOnizlemeler] = useState<string[]>([]);
  const [dokumanDosyalari, setDokumanDosyalari] = useState<File[]>([]);

  // --- BAREM YÖNETİMİ VE DOĞRULAMA ---
  const handleBaremChange = (index: number, field: "miktar" | "fiyat", value: string) => {
    const yeniBaremler = [...formData.baremler];
    yeniBaremler[index][field] = value;
    setFormData({ ...formData, baremler: yeniBaremler });
    setHata(""); // Değişiklik yapıldığında hatayı temizle
  };

  const baremEkle = () => {
    const sonBarem = formData.baremler[formData.baremler.length - 1];
    if (!sonBarem.miktar || !sonBarem.fiyat) {
      setHata("Yeni barem eklemeden önce mevcut baremi doldurmalısınız.");
      return;
    }
    setFormData({ ...formData, baremler: [...formData.baremler, { miktar: "", fiyat: "" }] });
  };

  const validateBaremler = () => {
    const perakende = Number(formData.perakendeFiyat);
    
    for (let i = 0; i < formData.baremler.length; i++) {
      const current = formData.baremler[i];
      const currentFiyat = Number(current.fiyat);
      const currentMiktar = Number(current.miktar);

      // 1. Perakende Fiyat Kontrolü
      if (currentFiyat >= perakende) {
        setHata(`Barem fiyatı (${currentFiyat}₺), perakende fiyattan (${perakende}₺) düşük olmalıdır.`);
        return false;
      }

      // 2. Fiyat Düşüş Kontrolü (Miktar arttıkça fiyat düşmeli)
      if (i > 0) {
        const oncekiFiyat = Number(formData.baremler[i - 1].fiyat);
        const oncekiMiktar = Number(formData.baremler[i - 1].miktar);

        if (currentMiktar <= oncekiMiktar) {
          setHata("Barem miktarları artan sırada olmalıdır.");
          return false;
        }
        if (currentFiyat >= oncekiFiyat) {
          setHata(`Miktar arttıkça birim fiyat düşmelidir! ${currentMiktar} adet fiyatı, ${oncekiMiktar} adet fiyatından pahalı olamaz.`);
          return false;
        }
      }
    }
    return true;
  };

  // --- RESİM İŞLEMLERİ ---
  const handleResimSec = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (resimDosyalari.length + files.length > 5) {
      alert("En fazla 5 resim yükleyebilirsiniz.");
      return;
    }
    setResimDosyalari([...resimDosyalari, ...files]);
    const urls = files.map(file => URL.createObjectURL(file));
    setResimOnizlemeler([...resimOnizlemeler, ...urls]);
  };

  const resimSil = (index: number) => {
    setResimDosyalari(resimDosyalari.filter((_, i) => i !== index));
    setResimOnizlemeler(resimOnizlemeler.filter((_, i) => i !== index));
  };

  // --- ADIM KONTROLLERİ ---
  const sonrakiAdim = () => {
    if (step === 1) {
      if (!formData.baslik || !formData.perakendeFiyat) {
        setHata("Lütfen başlık ve perakende fiyatı doldurun.");
        return;
      }
    }
    if (step === 2) {
      if (formData.baremler.some(b => !b.miktar || !b.fiyat)) {
        setHata("Lütfen tüm barem alanlarını doldurun.");
        return;
      }
      if (!validateBaremler()) return;
      if (!formData.il || !formData.ilce) {
        setHata("Lütfen lokasyon bilgilerini (İl/İlçe) giriniz.");
        return;
      }
    }
    setHata("");
    setStep(step + 1);
  };

  // --- KAYDETME ---
  const ilanKaydet = async () => {
    setYukleniyor(true);
    try {
      const yuklenenResimler = await Promise.all(
        resimDosyalari.map(async (file) => {
          const blob = await upload(`ilan/${Date.now()}-${file.name}`, file, {
            access: 'public',
            handleUploadUrl: '/api/upload',
          });
          return blob.url;
        })
      );

      const yuklenenDokumanlar = await Promise.all(
        dokumanDosyalari.map(async (file) => {
          const blob = await upload(`docs/${Date.now()}-${file.name}`, file, {
            access: 'public',
            handleUploadUrl: '/api/upload',
          });
          return { url: blob.url, name: file.name };
        })
      );

      const res = await fetch("/api/ilan-ekle", {
        method: "POST",
        body: JSON.stringify({
          ...formData,
          saticiId,
          resimler: yuklenenResimler,
          dokumanlar: yuklenenDokumanlar
        }),
      });

      if (!res.ok) throw new Error("İlan kaydedilemedi.");
      alert("İlan başarıyla onaya gönderildi!");
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

          <textarea value={formData.aciklama} onChange={(e) => setFormData({...formData, aciklama: e.target.value})} placeholder="İlan Açıklaması..." rows={4} className="w-full p-4 bg-gray-50 border-2 rounded-2xl outline-none focus:border-blue-500 font-medium" />

          {/* EVRAK YÜKLEME */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400">Teknik Evrak (PDF/Word/Excel)</label>
            <div className="flex flex-wrap gap-3">
              {dokumanDosyalari.map((f, i) => (
                <div key={i} className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-lg border text-xs font-bold">
                  <FileText size={14} /> {f.name}
                  <X size={14} className="cursor-pointer" onClick={() => setDokumanDosyalari(dokumanDosyalari.filter((_, idx) => idx !== i))} />
                </div>
              ))}
              {dokumanDosyalari.length < 3 && (
                <label className="flex items-center gap-2 border-2 border-dashed p-2 rounded-xl cursor-pointer text-gray-400 hover:text-blue-600 hover:border-blue-600">
                  <Upload size={16} /> <span className="text-[11px] font-black uppercase">Evrak Ekle</span>
                  <input type="file" className="hidden" accept=".pdf,.doc,.docx,.xls,.xlsx" onChange={(e) => setDokumanDosyalari([...dokumanDosyalari, ...Array.from(e.target.files || [])].slice(0, 3))} />
                </label>
              )}
            </div>
          </div>

          {/* RESİM YÜKLEME */}
          <div className="grid grid-cols-5 gap-4">
            {resimOnizlemeler.map((url, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden border-2">
                <img src={url} className="w-full h-full object-cover" />
                <X size={16} className="absolute top-1 right-1 bg-red-500 text-white rounded cursor-pointer" onClick={() => resimSil(i)} />
              </div>
            ))}
            {resimDosyalari.length < 5 && (
              <label className="aspect-square border-2 border-dashed rounded-xl flex items-center justify-center cursor-pointer text-gray-300 hover:text-blue-500">
                <Plus size={30} />
                <input type="file" multiple className="hidden" accept="image/*" onChange={handleResimSec} />
              </label>
            )}
          </div>

          <div className="grid grid-cols-2 gap-6">
            <input type="number" value={formData.perakendeFiyat} onChange={(e) => setFormData({...formData, perakendeFiyat: e.target.value})} placeholder="Perakende Fiyat (₺) *" className="p-4 bg-gray-50 border-2 rounded-2xl font-bold" />
            <input value={formData.urunUrl} onChange={(e) => setFormData({...formData, urunUrl: e.target.value})} placeholder="Ürün URL (Opsiyonel)" className="p-4 bg-gray-50 border-2 rounded-2xl font-bold" />
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
                <div key={i} className="flex gap-4">
                  <input placeholder="Min. Miktar" type="number" value={b.miktar} onChange={(e) => handleBaremChange(i, "miktar", e.target.value)} className="flex-1 p-4 rounded-2xl border-2 font-bold focus:border-blue-500 outline-none" />
                  <input placeholder="Birim Fiyat" type="number" value={b.fiyat} onChange={(e) => handleBaremChange(i, "fiyat", e.target.value)} className="flex-1 p-4 rounded-2xl border-2 font-bold focus:border-blue-500 outline-none" />
                  <button onClick={() => setFormData({...formData, baremler: formData.baremler.filter((_, idx) => idx !== i)})} className="text-red-400"><Trash2 size={20}/></button>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <select className="p-4 bg-gray-50 rounded-2xl font-bold border-2" value={formData.bolge} onChange={(e) => setFormData({...formData, bolge: e.target.value})}>
              <option value="">Bölge Seçiniz</option>
              {BOLGELER.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
            <input placeholder="İl" className="p-4 bg-gray-50 rounded-2xl font-bold border-2" value={formData.il} onChange={(e) => setFormData({...formData, il: e.target.value})} />
            <input placeholder="İlçe" className="p-4 bg-gray-50 rounded-2xl font-bold border-2" value={formData.ilce} onChange={(e) => setFormData({...formData, ilce: e.target.value})} />
          </div>

          <div className="flex gap-4">
            {["KARGO", "MERKEZI_TESLIM", "NAKLIYE"].map(m => (
              <button key={m} onClick={() => setFormData({...formData, teslimatYontemleri: formData.teslimatYontemleri.includes(m) ? formData.teslimatYontemleri.filter(x => x !== m) : [...formData.teslimatYontemleri, m]})} className={`px-6 py-3 rounded-2xl text-[10px] font-black border-2 ${formData.teslimatYontemleri.includes(m) ? "bg-blue-600 border-blue-600 text-white" : "bg-white text-gray-400"}`}>
                {m}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ADIM 3: ÖNİZLEME */}
      {step === 3 && (
        <div className="space-y-6 animate-in zoom-in-95">
          <div className="bg-gray-50 p-8 rounded-[3rem] border-2 border-dashed">
             <h2 className="text-3xl font-black italic uppercase mb-2">{formData.baslik}</h2>
             <p className="text-gray-500 mb-6">{formData.aciklama}</p>
             <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm"><span className="text-[10px] font-black uppercase text-gray-400 block">Lokasyon</span><b>{formData.il} / {formData.ilce}</b></div>
                <div className="bg-white p-4 rounded-xl shadow-sm"><span className="text-[10px] font-black uppercase text-gray-400 block">Kategori</span><b>{formData.kategori}</b></div>
             </div>
             <div className="mt-6 space-y-2">
                {formData.baremler.map((b, i) => (
                  <div key={i} className="flex justify-between bg-blue-100/50 p-3 rounded-xl font-bold">
                    <span>{b.miktar}+ Adet</span>
                    <span className="text-blue-600">{b.fiyat} ₺</span>
                  </div>
                ))}
             </div>
          </div>
        </div>
      )}

      <div className="flex gap-4 pt-10">
        {step > 1 && <button onClick={() => setStep(step - 1)} className="flex-1 border-2 p-5 rounded-[2rem] font-black uppercase text-gray-400"><ChevronLeft className="inline mr-2" /> Geri</button>}
        {step < 3 ? (
          <button onClick={sonrakiAdim} className="flex-[2] bg-blue-600 text-white p-5 rounded-[2rem] font-black uppercase shadow-xl">Devam Et <ChevronRight className="inline ml-2" /></button>
        ) : (
          <button onClick={ilanKaydet} disabled={yukleniyor} className="flex-[2] bg-green-600 text-white p-5 rounded-[2rem] font-black uppercase shadow-xl">
            {yukleniyor ? <Loader2 className="animate-spin inline" /> : <><Save className="inline mr-2" /> İlanı Yayınla</>}
          </button>
        )}
      </div>
    </div>
  );
}