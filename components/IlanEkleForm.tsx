"use client";
import { useState, useEffect } from "react";
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

  // --- FORM STATE ---
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

  // --- DOSYA STATE ---
  const [resimDosyalari, setResimDosyalari] = useState<File[]>([]);
  const [resimOnizlemeler, setResimOnizlemeler] = useState<string[]>([]);
  const [dokumanDosyalari, setDokumanDosyalari] = useState<File[]>([]);

  // Resim Seçme ve Önizleme
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
    if (step === 1 && (!formData.baslik || !formData.perakendeFiyat)) {
      setHata("Lütfen zorunlu alanları doldurun.");
      return;
    }
    if (step === 2 && (formData.baremler.some(b => !b.miktar || !b.fiyat))) {
      setHata("Lütfen barem bilgilerini eksiksiz girin.");
      return;
    }
    setHata("");
    setStep(step + 1);
  };

  // --- KAYDETME (FINAL SUBMIT) ---
  const ilanKaydet = async () => {
    setYukleniyor(true);
    try {
      // 1. Resimleri Vercel Blob'a yükle
      const yuklenenResimler = await Promise.all(
        resimDosyalari.map(async (file) => {
          const blob = await upload(`ilan/${Date.now()}-${file.name}`, file, {
            access: 'public',
            handleUploadUrl: '/api/upload',
          });
          return blob.url;
        })
      );

      // 2. Dökümanları Vercel Blob'a yükle
      const yuklenenDokumanlar = await Promise.all(
        dokumanDosyalari.map(async (file) => {
          const blob = await upload(`docs/${Date.now()}-${file.name}`, file, {
            access: 'public',
            handleUploadUrl: '/api/upload',
          });
          return { url: blob.url, name: file.name };
        })
      );

      // 3. API'ye Gönder
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
      
      alert("İlan başarıyla oluşturuldu ve onaya gönderildi!");
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
        <div className="p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 text-sm font-bold border border-red-100 animate-shake">
          <AlertCircle size={20} /> {hata}
        </div>
      )}

      {/* --- ADIM 1: ÜRÜN BİLGİSİ --- */}
{step === 1 && (
  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase text-gray-400 ml-2">İlan Başlığı *</label>
        <input 
          value={formData.baslik}
          onChange={(e) => setFormData({...formData, baslik: e.target.value})}
          placeholder="Örn: %100 Pamuklu Toptan Havlu"
          className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none font-bold transition-all"
        />
      </div>
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Kategori</label>
        <select 
          value={formData.kategori}
          onChange={(e) => setFormData({...formData, kategori: e.target.value})}
          className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl font-bold outline-none"
        >
          {KATEGORILER.map(k => <option key={k} value={k}>{k}</option>)}
        </select>
      </div>
    </div>

    {/* AÇIKLAMA VE EVRAK YÜKLEME BÖLÜMÜ */}
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase text-gray-400 ml-2">İlan Açıklaması</label>
        <textarea 
          value={formData.aciklama}
          onChange={(e) => setFormData({...formData, aciklama: e.target.value})}
          placeholder="Ürününüzü detaylıca tanıtın, alıcıların merak edebileceği noktaları belirtin..."
          rows={4}
          className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none font-medium transition-all resize-none"
        />
      </div>

      {/* ÜRÜN DÖKÜMANLARI (PDF, WORD, EXCEL) */}
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Ürün Özellikleri / Teknik Evrak (Max 3)</label>
        <div className="flex flex-wrap gap-3">
          {dokumanDosyalari.map((file, i) => (
            <div key={i} className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-xl border border-blue-100 animate-in zoom-in-95">
              <FileText size={16} />
              <span className="text-[11px] font-bold truncate max-w-[150px]">{file.name}</span>
              <button 
                onClick={() => setDokumanDosyalari(dokumanDosyalari.filter((_, idx) => idx !== i))}
                className="hover:text-red-500 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          
          {dokumanDosyalari.length < 3 && (
            <label className="flex items-center gap-2 bg-white border-2 border-dashed border-gray-200 px-4 py-2 rounded-xl cursor-pointer hover:bg-gray-50 hover:border-blue-400 transition-all text-gray-400 hover:text-blue-600">
              <Upload size={16} />
              <span className="text-[11px] font-black uppercase tracking-tighter">Evrak Yükle</span>
              <input 
                type="file" 
                className="hidden" 
                accept=".pdf,.doc,.docx,.xls,.xlsx" 
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  if (dokumanDosyalari.length + files.length > 3) {
                    alert("En fazla 3 döküman yükleyebilirsiniz.");
                    return;
                  }
                  setDokumanDosyalari([...dokumanDosyalari, ...files]);
                }}
              />
            </label>
          )}
        </div>
        <p className="text-[9px] text-gray-400 ml-2 font-medium italic">* PDF, Word veya Excel formatında teknik özellikler ekleyebilirsiniz.</p>
      </div>
    </div>

    {/* RESİM YÜKLEME BÖLÜMÜ (Mevcut yapı) */}
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Ürün Görselleri (Max 5)</label>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {resimOnizlemeler.map((url, i) => (
          <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-blue-100 group">
            <img src={url} alt="önizleme" className="w-full h-full object-cover" />
            <button 
              onClick={() => resimSil(i)} 
              className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all shadow-lg"
            >
              <X size={14} />
            </button>
          </div>
        ))}
        {resimDosyalari.length < 5 && (
          <label className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-blue-400 transition-all group">
            <Upload className="text-gray-300 group-hover:text-blue-500 transition-colors" />
            <span className="text-[10px] font-black text-gray-400 group-hover:text-blue-500 mt-2 uppercase tracking-tighter">Resim Ekle</span>
            <input type="file" multiple accept="image/*" className="hidden" onChange={handleResimSec} />
          </label>
        )}
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Perakende Fiyat (₺) *</label>
        <input 
          type="number"
          value={formData.perakendeFiyat}
          onChange={(e) => setFormData({...formData, perakendeFiyat: e.target.value})}
          placeholder="0.00"
          className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none font-bold"
        />
      </div>
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Ürün URL (Dış Bağlantı)</label>
        <input 
          value={formData.urunUrl}
          onChange={(e) => setFormData({...formData, urunUrl: e.target.value})}
          placeholder="https://..."
          className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none font-bold"
        />
      </div>
    </div>
  </div>
)}

      {/* --- ADIM 2: FİYAT & TESLİMAT --- */}
      {step === 2 && (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
          <div className="p-6 bg-blue-50/50 rounded-[2.5rem] border-2 border-dashed border-blue-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-black uppercase italic text-blue-900">Satış Baremleri</h3>
              <button onClick={() => setFormData({...formData, baremler: [...formData.baremler, {miktar: "", fiyat: ""}]})} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase">
                + Barem Ekle
              </button>
            </div>
            <div className="space-y-4">
              {formData.baremler.map((b, i) => (
                <div key={i} className="flex gap-4">
                  <input 
                    placeholder="Min. Miktar" type="number"
                    value={b.miktar}
                    onChange={(e) => {
                      const n = [...formData.baremler]; n[i].miktar = e.target.value; setFormData({...formData, baremler: n});
                    }}
                    className="flex-1 p-4 rounded-2xl border-2 font-bold focus:border-blue-500 outline-none" 
                  />
                  <input 
                    placeholder="Birim Fiyat" type="number"
                    value={b.fiyat}
                    onChange={(e) => {
                      const n = [...formData.baremler]; n[i].fiyat = e.target.value; setFormData({...formData, baremler: n});
                    }}
                    className="flex-1 p-4 rounded-2xl border-2 font-bold focus:border-blue-500 outline-none" 
                  />
                  <button onClick={() => setFormData({...formData, baremler: formData.baremler.filter((_, idx) => idx !== i)})} className="text-red-400 p-2"><Trash2 size={20}/></button>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Bölge</label>
              <select className="w-full p-4 bg-gray-50 rounded-2xl font-bold" value={formData.bolge} onChange={(e) => setFormData({...formData, bolge: e.target.value})}>
                <option value="">Seçiniz</option>
                {BOLGELER.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <input placeholder="İl" className="p-4 bg-gray-50 rounded-2xl font-bold border-2 border-transparent" value={formData.il} onChange={(e) => setFormData({...formData, il: e.target.value})} />
            <input placeholder="İlçe" className="p-4 bg-gray-50 rounded-2xl font-bold border-2 border-transparent" value={formData.ilce} onChange={(e) => setFormData({...formData, ilce: e.target.value})} />
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Teslimat Yöntemleri</label>
            <div className="flex flex-wrap gap-4">
              {["KARGO", "MERKEZI_TESLIM", "NAKLIYE"].map(m => (
                <button 
                  key={m}
                  onClick={() => {
                    const current = formData.teslimatYontemleri;
                    const next = current.includes(m) ? current.filter(x => x !== m) : [...current, m];
                    setFormData({...formData, teslimatYontemleri: next});
                  }}
                  className={`px-6 py-3 rounded-2xl text-[10px] font-black transition-all border-2 ${
                    formData.teslimatYontemleri.includes(m) ? "bg-blue-600 border-blue-600 text-white shadow-lg" : "bg-white border-gray-100 text-gray-400"
                  }`}
                >
                  {m === "KARGO" ? "🚚 KARGO" : m === "MERKEZI_TESLIM" ? "📍 MERKEZİ TESLİM" : "🚛 NAKLİYE"}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- ADIM 3: ÖNİZLEME --- */}
      {step === 3 && (
        <div className="space-y-8 animate-in zoom-in-95">
          <div className="bg-gray-50 p-8 rounded-[3rem] border-2 border-dashed border-gray-200">
            <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
              {resimOnizlemeler.map((url, i) => (
                <img key={i} src={url} className="w-32 h-32 object-cover rounded-2xl shadow-md" />
              ))}
            </div>
            <h2 className="text-3xl font-black italic uppercase text-gray-900 mb-2">{formData.baslik}</h2>
            <p className="text-gray-500 font-medium mb-6">{formData.aciklama || "Açıklama belirtilmedi."}</p>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-white p-4 rounded-2xl shadow-sm">
                <span className="text-[10px] font-black text-gray-400 uppercase block">Kategori</span>
                <span className="font-bold">{formData.kategori}</span>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm">
                <span className="text-[10px] font-black text-gray-400 uppercase block">Lokasyon</span>
                <span className="font-bold">{formData.il || "-"} / {formData.bolge || "-"}</span>
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <span className="text-[10px] font-black text-gray-400 uppercase">Fiyat Baremleri</span>
              {formData.baremler.map((b, i) => (
                <div key={i} className="flex justify-between bg-blue-100/50 p-3 rounded-xl">
                  <span className="font-bold text-blue-900">{b.miktar}+ Adet</span>
                  <span className="font-black text-blue-600">{b.fiyat} ₺ / Adet</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* BUTONLAR */}
      <div className="flex gap-4 pt-10">
        {step > 1 && (
          <button 
            onClick={() => setStep(step - 1)}
            className="flex-1 bg-white border-2 border-gray-100 py-5 rounded-[2rem] font-black uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
          >
            <ChevronLeft size={20} /> Geri
          </button>
        )}
        
        {step < 3 ? (
          <button 
            onClick={sonrakiAdim}
            className="flex-[2] bg-blue-600 text-white py-5 rounded-[2rem] font-black uppercase tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
          >
            Devam Et <ChevronRight size={20} />
          </button>
        ) : (
          <button 
            onClick={ilanKaydet}
            disabled={yukleniyor}
            className="flex-[2] bg-green-600 text-white py-5 rounded-[2rem] font-black uppercase tracking-widest shadow-xl shadow-green-200 hover:bg-green-700 transition-all flex items-center justify-center gap-2"
          >
            {yukleniyor ? <Loader2 className="animate-spin" /> : <><Save size={20} /> İlanı Yayınla</>}
          </button>
        )}
      </div>
    </div>
  );
}