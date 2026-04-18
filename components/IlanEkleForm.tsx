"use client";
import { useState, useEffect, useMemo } from "react";
import { 
  Package, Tag, Eye, Save, Trash2, MapPin,
  Upload, FileText, X, AlertCircle, Loader2, Plus, Info,
  CheckSquare, Square, Search, ChevronRight
} from "lucide-react";
import { upload } from "@vercel/blob/client";

const STEPS = [
  { id: 1, label: "Ürün Bilgisi", icon: <Package size={18} /> },
  { id: 2, label: "Fiyat & Teslimat", icon: <Tag size={18} /> },
  { id: 3, label: "Önizleme", icon: <Eye size={18} /> }
];

export default function IlanEkleForm({ saticiId }: { saticiId: number }) {
  const [step, setStep] = useState(1);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState("");

  const [catSearch, setCatSearch] = useState("");
  const [foundCategories, setFoundCategories] = useState<any[]>([]);
  const [selectedCategoryName, setSelectedCategoryName] = useState("");
  const [isCatLoading, setIsCatLoading] = useState(false);

  const [iller, setIller] = useState<{ id: string; name: string }[]>([]);
  const [tumIlceler, setTumIlceler] = useState<{ id: string; il_id: string; name: string }[]>([]);
  const [goruntulenenIlId, setGoruntulenenIlId] = useState("");

  const [formData, setFormData] = useState({
    baslik: "",
    aciklama: "",
    urunUrl: "",
    categoryId: "" as any, 
    hedefSayi: "", // 🚀 EKLENDİ: Toplam Stok Miktarı
    perakendeFiyat: "",
    bitisTarihi: "",
    lokasyonlar: [] as { il: string, ilce: string }[],
    baremler: [{ miktar: "", fiyat: "" }]
  });

  const [resimDosyalari, setResimDosyalari] = useState<File[]>([]);
  const [resimOnizlemeler, setResimOnizlemeler] = useState<string[]>([]);
  const [dokumanDosyalari, setDokumanDosyalari] = useState<File[]>([]);

  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (catSearch.length < 2) {
        setFoundCategories([]);
        return;
      }
      setIsCatLoading(true);
      try {
        const res = await fetch(`/api/categories?search=${encodeURIComponent(catSearch)}`);
        const data = await res.json();
        setFoundCategories(data);
      } catch (err) {
        console.error("Kategori arama hatası");
      } finally {
        setIsCatLoading(false);
      }
    }, 400);

    return () => clearTimeout(searchTimeout);
  }, [catSearch]);

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
      } catch (err) { setHata("Konum verileri yüklenemedi."); }
    };
    veriCek();
  }, []);

  const aktifIlceler = useMemo(() => {
    if (!goruntulenenIlId) return [];
    return tumIlceler.filter(i => i.il_id === goruntulenenIlId).sort((a, b) => a.name.localeCompare(b.name, 'tr'));
  }, [goruntulenenIlId, tumIlceler]);

  const handleToggleLokasyon = (il: string, ilce: string) => {
    let yeniListe = [...formData.lokasyonlar];
    const isZatenSecili = yeniListe.some(l => l.il === il && l.ilce === ilce);

    if (isZatenSecili) {
      yeniListe = yeniListe.filter(l => !(l.il === il && l.ilce === ilce));
    } else {
      if (il === "TÜM TÜRKİYE") {
        yeniListe = [{ il: "TÜM TÜRKİYE", ilce: "HEPSİ" }];
      } else {
        yeniListe = yeniListe.filter(l => l.il !== "TÜM TÜRKİYE");
        if (ilce === "HEPSİ") {
          yeniListe = yeniListe.filter(l => l.il !== il);
          yeniListe.push({ il, ilce: "HEPSİ" });
        } else {
          yeniListe = yeniListe.filter(l => !(l.il === il && l.ilce === "HEPSİ"));
          yeniListe.push({ il, ilce });
        }
      }
    }
    setFormData({ ...formData, lokasyonlar: yeniListe });
  };

  const isSecili = (il: string, ilce: string) => formData.lokasyonlar.some(l => l.il === il && l.ilce === ilce);

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
          setHata("Adetler artan sırada olmalıdır."); return false;
        }
        if (Number(cur.fiyat) >= Number(prev.fiyat)) {
          setHata("Adet arttıkça birim fiyat düşmelidir."); return false;
        }
      }
    }
    return true;
  };

  const sonrakiAdim = () => {
    setHata("");
    if (step === 1) {
      if (!formData.baslik) { setHata("Başlık alanı zorunludur."); return; }
      if (!formData.categoryId) { setHata("Lütfen bir kategori seçin."); return; } 
    }
    if (step === 2) {
      if (!formData.hedefSayi) { setHata("Toplam hedef stok girmelisiniz."); return; } // 🚀 EKLENDİ: Stok Validasyonu
      if (!formData.perakendeFiyat) { setHata("Perakende Fiyat zorunludur."); return; }
      if (formData.lokasyonlar.length === 0) { setHata("En az bir gönderim bölgesi seçin."); return; }
      if (!validateBaremler()) return;
      if (!formData.bitisTarihi) { setHata("Bitiş tarihini seçiniz."); return; }
    }
    setStep(step + 1);
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            ...formData, 
            categoryId: parseInt(formData.categoryId),
            hedefSayi: parseInt(formData.hedefSayi), // 🚀 EKLENDİ: Gerçek stok Prisma'ya gönderiliyor
            saticiId, 
            resimler: imgUrls, 
            dokumanlar: docUrls 
        }),
      });
      if (!res.ok) throw new Error("Kayıt başarısız.");
      window.location.assign("/");
    } catch (err: any) { setHata(err.message); } finally { setYukleniyor(false); }
  };

  return (
    <div className="space-y-10">
      {/* ADIM GÖSTERGESİ */}
      <div className="flex justify-between relative mb-12">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -z-10 -translate-y-1/2"></div>
        {STEPS.map((s) => (
          <div key={s.id} className="flex flex-col items-center bg-gray-50 px-2">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${step >= s.id ? "bg-blue-600 text-white shadow-xl shadow-blue-200" : "bg-white border-2 text-gray-300"}`}>
              {step > s.id ? "✓" : s.icon}
            </div>
            <span className={`text-[10px] font-black uppercase mt-3 tracking-widest ${step >= s.id ? "text-blue-600" : "text-gray-400"}`}>{s.label}</span>
          </div>
        ))}
      </div>

      {hata && <div className="p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 text-sm font-bold border border-red-100 animate-bounce"><AlertCircle size={20} /> {hata}</div>}

      {/* ADIM 1: ÜRÜN BİLGİSİ */}
      {step === 1 && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input value={formData.baslik} onChange={(e) => setFormData({...formData, baslik: e.target.value})} placeholder="İlan Başlığı *" className="p-4 bg-gray-50 border-2 rounded-2xl font-bold outline-none focus:border-blue-500 transition-all" />
            
            <div className="relative">
               <div className="relative group">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    value={selectedCategoryName || catSearch}
                    onChange={(e) => { setCatSearch(e.target.value); setSelectedCategoryName(""); }}
                    placeholder="Kategori Ara (Örn: Ayakkabı)" 
                    className="w-full p-4 pl-12 bg-gray-50 border-2 rounded-2xl font-bold outline-none focus:border-blue-500 transition-all"
                  />
                  {isCatLoading && <Loader2 size={18} className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-blue-600" />}
               </div>
               
               {foundCategories.length > 0 && !selectedCategoryName && (
                 <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 max-h-[300px] overflow-y-auto">
                    {foundCategories.map((cat) => (
                      <button 
                        key={cat.id} 
                        onClick={() => { 
                          setFormData({...formData, categoryId: cat.id}); 
                          setSelectedCategoryName(cat.fullName || cat.name); 
                          setFoundCategories([]); 
                        }} 
                        className="w-full p-4 text-left hover:bg-blue-50 border-b last:border-none flex justify-between items-center group"
                      >
                        <span className="text-xs font-bold text-gray-700 block">{cat.fullName || cat.name}</span>
                        <ChevronRight size={14} className="text-gray-300 group-hover:text-blue-600" />
                      </button>
                    ))}
                 </div>
               )}
            </div>
          </div>

          <div className="space-y-4">
            <textarea value={formData.aciklama} onChange={(e) => setFormData({...formData, aciklama: e.target.value})} placeholder="Ürününüzü detaylıca tanıtın..." rows={4} className="w-full p-4 bg-gray-50 border-2 rounded-2xl outline-none focus:border-blue-500 font-medium transition-all" />
            
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Teknik Şartname / Evrak (Maks. 3)</label>
              <div className="flex flex-wrap gap-2">
                {dokumanDosyalari.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-xl border border-blue-100 text-[11px] font-bold">
                    <FileText size={16} /> <span className="truncate max-w-[120px]">{f.name}</span>
                    <button onClick={() => setDokumanDosyalari(dokumanDosyalari.filter((_, idx) => idx !== i))}><X size={14}/></button>
                  </div>
                ))}
                {dokumanDosyalari.length < 3 && (
                  <label className="flex items-center gap-2 bg-white border-2 border-dashed border-gray-200 px-4 py-2 rounded-xl cursor-pointer hover:border-blue-400 text-gray-400 hover:text-blue-600 transition-all">
                    <Upload size={16} /> <span className="text-[11px] font-black uppercase">Evrak Ekle</span>
                    <input type="file" className="hidden" multiple accept=".pdf,.doc,.docx,.xls,.xlsx" onChange={(e) => setDokumanDosyalari([...dokumanDosyalari, ...Array.from(e.target.files || [])].slice(0, 3))} />
                  </label>
                )}
              </div>
            </div>
          </div>

          <div className="w-full">
            <input value={formData.urunUrl} onChange={(e) => setFormData({...formData, urunUrl: e.target.value})} placeholder="Ürün URL (Opsiyonel)" className="w-full p-4 bg-gray-50 border-2 rounded-2xl font-bold" />
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 ml-2">
              <label className="text-[10px] font-black uppercase text-gray-400">Ürün Görselleri (Maks. 5)</label>
              <div className="group relative">
                <Info size={14} className="text-gray-300 cursor-help hover:text-blue-500 transition-colors" />
                <div className="absolute bottom-full left-0 mb-2 w-56 p-3 bg-gray-900 text-white text-[10px] rounded-2xl opacity-0 group-hover:opacity-100 transition-all z-20 pointer-events-none leading-relaxed shadow-xl">
                   İpucu: Net ve farklı açılardan çekilmiş fotoğraflar alıcıların güvenini %60 oranında artırır.
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {resimOnizlemeler.map((url, i) => (
                <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border-2 group shadow-sm">
                  <img src={url} className="w-full h-full object-cover" />
                  <button onClick={() => {setResimDosyalari(resimDosyalari.filter((_, idx) => idx !== i)); setResimOnizlemeler(resimOnizlemeler.filter((_, idx) => idx !== i));}} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all"><X size={14}/></button>
                </div>
              ))}
              {resimDosyalari.length < 5 && (
                <label className="aspect-square border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer text-gray-300 hover:text-blue-600 hover:border-blue-600 transition-all group">
                  <Plus size={32} className="group-hover:scale-110 transition-transform" /> 
                  <span className="text-[10px] font-black uppercase mt-1">Görsel Ekle</span>
                  <input type="file" className="hidden" multiple accept="image/*" onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setResimDosyalari([...resimDosyalari, ...files].slice(0, 5));
                    setResimOnizlemeler([...resimOnizlemeler, ...files.map(f => URL.createObjectURL(f))].slice(0, 5));
                  }} />
                </label>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ADIM 2: FİYAT & TESLİMAT */}
      {step === 2 && (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* PERAKENDE FİYAT */}
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase text-gray-400 ml-4 italic">Piyasa Perakende Fiyatı (₺)</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={formData.perakendeFiyat} 
                  onChange={(e) => setFormData({...formData, perakendeFiyat: e.target.value})} 
                  placeholder="0.00" 
                  className="w-full p-5 pl-6 bg-blue-50 border-2 border-blue-200 rounded-[2rem] text-xl font-black text-blue-700 focus:border-blue-500 outline-none shadow-sm transition-all placeholder:text-blue-200" 
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-blue-300 font-black text-xl">₺</span>
              </div>
              <p className="text-[9px] text-blue-400 ml-4 font-bold uppercase tracking-widest">Toptan fiyatlar bu fiyattan düşük olmalıdır.</p>
            </div>

            {/* İLAN BİTİŞ TARİHİ */}
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase text-gray-400 ml-4 italic">İlan Bitiş Tarihi</label>
              <input 
                type="date" 
                value={formData.bitisTarihi} 
                onChange={(e) => setFormData({...formData, bitisTarihi: e.target.value})} 
                className="w-full p-5 bg-orange-50 border-2 border-orange-200 rounded-[2rem] text-xl font-black text-orange-700 focus:border-orange-500 outline-none shadow-sm transition-all" 
              />
              <p className="text-[9px] text-orange-400 ml-4 font-bold uppercase tracking-widest">İlanın tekliflere kapanacağı tarih.</p>
            </div>

          </div>

          {/* 🚀 EKLENDİ: TOPLAM HEDEF STOK KUTUSU (Senin tasarım diline uygun) */}
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase text-gray-400 ml-4 italic">Toplam Hedef Stok (Adet)</label>
            <div className="relative">
              <input 
                type="number" 
                value={formData.hedefSayi} 
                onChange={(e) => setFormData({...formData, hedefSayi: e.target.value})} 
                placeholder="Örn: 1000" 
                className="w-full p-5 pl-6 bg-green-50 border-2 border-green-200 rounded-[2rem] text-xl font-black text-green-700 focus:border-green-500 outline-none shadow-sm transition-all placeholder:text-green-200" 
              />
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-green-300 font-black text-sm uppercase">Adet</span>
            </div>
            <p className="text-[9px] text-green-400 ml-4 font-bold uppercase tracking-widest">Grubun tamamlanması için satılması gereken toplam adet.</p>
          </div>

          {/* BAREMLER */}
          <div className="p-6 bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200 mt-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-black uppercase italic text-gray-900">Toplu Satış Baremleri</h3>
              <button onClick={() => {
                const last = formData.baremler[formData.baremler.length - 1];
                if (!last.miktar || !last.fiyat) { setHata("Mevcut baremi doldurmadan yeni barem eklenemez."); return; }
                setFormData({...formData, baremler: [...formData.baremler, {miktar: "", fiyat: ""}]});
              }} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase shadow-lg shadow-blue-100 transition-transform active:scale-95">+ Barem Ekle</button>
            </div>
            {formData.baremler.map((b, i) => (
              <div key={i} className="flex gap-4 mb-4 animate-in slide-in-from-right-2">
                <input placeholder="Adet" type="number" value={b.miktar} onChange={(e) => {const n = [...formData.baremler]; n[i].miktar = e.target.value; setFormData({...formData, baremler: n})}} className="flex-1 p-4 rounded-2xl border-2 font-bold focus:border-blue-500 outline-none shadow-sm" />
                <input placeholder="Birim Fiyat" type="number" value={b.fiyat} onChange={(e) => {const n = [...formData.baremler]; n[i].fiyat = e.target.value; setFormData({...formData, baremler: n})}} className="flex-1 p-4 rounded-2xl border-2 font-bold focus:border-blue-500 outline-none shadow-sm" />
                {i > 0 && <Trash2 className="text-red-400 cursor-pointer self-center hover:text-red-600 transition-colors" onClick={() => setFormData({...formData, baremler: formData.baremler.filter((_, idx) => idx !== i)})} />}
              </div>
            ))}
          </div>

          {/* ÇOKLU LOKASYON YÖNETİMİ */}
          <div className="space-y-4">
            <h3 className="text-[11px] font-black uppercase text-gray-400 italic ml-4">Gönderim Bölgeleri</h3>
            
            <div 
              onClick={() => handleToggleLokasyon("TÜM TÜRKİYE", "HEPSİ")}
              className={`mx-4 p-5 rounded-[2rem] border-2 flex items-center gap-4 cursor-pointer transition-all ${isSecili("TÜM TÜRKİYE", "HEPSİ") ? "bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-200" : "bg-white border-gray-100 text-gray-500"}`}
            >
              {isSecili("TÜM TÜRKİYE", "HEPSİ") ? <CheckSquare size={24}/> : <Square size={24}/>}
              <span className="font-black uppercase text-sm tracking-tight italic">Tüm Türkiye'ye Gönderim Yapıyorum</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4">
               <div className="bg-gray-50 rounded-[2.5rem] p-6 border-2 border-gray-100 max-h-[300px] overflow-y-auto">
                  <span className="text-[10px] font-black text-gray-400 uppercase block mb-4 tracking-widest">Şehirler</span>
                  <div className="space-y-2">
                    {iller.map(il => (
                      <div key={il.id} onClick={() => setGoruntulenenIlId(il.id)} className={`p-4 rounded-2xl flex justify-between items-center cursor-pointer transition-all ${goruntulenenIlId === il.id ? "bg-white shadow-md border-blue-200 border" : "hover:bg-gray-100"}`}>
                        <span className="font-bold text-gray-700 text-sm">{il.name}</span>
                        {formData.lokasyonlar.some(l => l.il === il.name) && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                      </div>
                    ))}
                  </div>
               </div>

               <div className="bg-white rounded-[2.5rem] p-6 border-2 border-gray-100 max-h-[300px] overflow-y-auto shadow-inner">
                  {goruntulenenIlId ? (
                    <div className="space-y-2">
                       <span className="text-[10px] font-black text-gray-400 uppercase block mb-4 italic leading-none">{iller.find(i => i.id === goruntulenenIlId)?.name} Seçenekleri</span>
                       <div onClick={() => handleToggleLokasyon(iller.find(i => i.id === goruntulenenIlId)!.name, "HEPSİ")} className={`p-4 rounded-xl flex items-center gap-3 cursor-pointer border-2 transition-all ${isSecili(iller.find(i => i.id === goruntulenenIlId)!.name, "HEPSİ") ? "bg-blue-50 border-blue-200 text-blue-700 font-bold" : "border-transparent text-gray-400"}`}>
                          {isSecili(iller.find(i => i.id === goruntulenenIlId)!.name, "HEPSİ") ? <CheckSquare size={20}/> : <Square size={20}/>}
                          <span className="text-xs uppercase">TÜM İLÇELER (HEPSİ)</span>
                       </div>
                       {aktifIlceler.map(ilce => (
                         <div key={ilce.id} onClick={() => handleToggleLokasyon(iller.find(i => i.id === goruntulenenIlId)!.name, ilce.name)} className={`p-4 rounded-xl flex items-center gap-3 cursor-pointer border-2 transition-all ${isSecili(iller.find(i => i.id === goruntulenenIlId)!.name, ilce.name) || isSecili(iller.find(i => i.id === goruntulenenIlId)!.name, "HEPSİ") ? "bg-gray-50 border-gray-100 text-gray-900 font-bold" : "border-transparent text-gray-500"}`}>
                            {isSecili(iller.find(i => i.id === goruntulenenIlId)!.name, ilce.name) || isSecili(iller.find(i => i.id === goruntulenenIlId)!.name, "HEPSİ") ? <CheckSquare size={20} className="text-blue-500"/> : <Square size={20}/>}
                            <span className="text-sm">{ilce.name}</span>
                         </div>
                       ))}
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-300 gap-3 font-black uppercase text-[10px]"><MapPin size={40} /> Şehir Seçin</div>
                  )}
               </div>
            </div>

            <div className="mx-4 flex flex-wrap gap-2 p-5 bg-gray-900 rounded-[2.5rem] shadow-2xl">
               {formData.lokasyonlar.length === 0 ? <span className="text-[10px] text-gray-500 font-bold italic m-auto uppercase">Bölge seçilmedi</span> : (
                 formData.lokasyonlar.map((l, i) => (
                   <div key={i} className="bg-white/10 border border-white/10 px-4 py-2 rounded-xl flex items-center gap-3 shadow-sm animate-in zoom-in-95 group">
                      <span className="text-[10px] font-black uppercase text-white tracking-widest">{l.il} / {l.ilce}</span>
                      <X size={14} className="text-red-400 cursor-pointer hover:scale-125 transition-transform" onClick={() => handleToggleLokasyon(l.il, l.ilce)}/>
                   </div>
                 ))
               )}
            </div>
          </div>
        </div>
      )}

      {/* ADIM 3: ÖNİZLEME */}
      {step === 3 && (
        <div className="space-y-8 animate-in zoom-in-95">
          <div className="bg-gray-50 p-10 rounded-[3.5rem] border-2 border-dashed border-gray-200 shadow-inner">
            <h2 className="text-4xl font-black italic uppercase text-gray-900 mb-8 leading-none tracking-tighter">{formData.baslik}</h2>
            
            {selectedCategoryName && (
              <div className="p-3 bg-blue-100 rounded-xl mb-6 inline-block">
                <span className="text-xs font-black text-blue-800 uppercase">Kategori: {selectedCategoryName}</span>
              </div>
            )}

            {/* 🚀 EKLENDİ: md:grid-cols-3 yapıldı ve Stok önizlemeye kondu */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-sm">
              <div className="bg-white p-6 rounded-[2rem] shadow-sm"><span className="block text-[10px] font-black text-gray-400 uppercase mb-1">Toplam Hedef Stok</span><b className="text-green-600 text-lg">{formData.hedefSayi} Adet</b></div>
              <div className="bg-white p-6 rounded-[2rem] shadow-sm"><span className="block text-[10px] font-black text-gray-400 uppercase mb-1">İlan Bitiş Tarihi</span><b className="text-orange-600 text-lg">{formData.bitisTarihi}</b></div>
              <div className="bg-white p-6 rounded-[2rem] shadow-sm"><span className="block text-[10px] font-black text-gray-400 uppercase mb-1">Perakende Satış Fiyatı</span><b className="text-blue-600 text-lg">{formData.perakendeFiyat} ₺</b></div>
            </div>
            <div className="space-y-3">
              <span className="text-[10px] font-black text-gray-400 uppercase block ml-4">Grup Alım Fiyat Baremleri</span>
              {formData.baremler.map((b, i) => (
                <div key={i} className="flex justify-between items-center bg-white p-6 rounded-[1.8rem] shadow-sm font-bold border border-gray-50 hover:border-blue-100 transition-all">
                  <span className="text-gray-700 text-lg">{b.miktar}+ Adet</span>
                  <span className="text-blue-600 text-2xl tracking-tighter">{b.fiyat} ₺</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* FOOTER NAV */}
      <div className="flex gap-4 pt-10 px-4">
        {step > 1 && <button onClick={() => setStep(step - 1)} className="flex-1 bg-white border-2 p-6 rounded-[2.5rem] font-black uppercase text-gray-400 hover:bg-gray-50 transition-all shadow-sm">Geri</button>}
        {step < 3 ? (
          <button onClick={sonrakiAdim} className="flex-[2] bg-blue-600 text-white p-6 rounded-[2.5rem] font-black uppercase shadow-2xl hover:bg-blue-700 transition-all active:scale-[0.98]">Devam Et</button>
        ) : (
          <button onClick={ilanKaydet} disabled={yukleniyor} className="flex-[2] bg-green-600 text-white p-6 rounded-[2.5rem] font-black uppercase shadow-2xl hover:bg-green-700 transition-all flex items-center justify-center gap-2 active:scale-[0.98]">
            {yukleniyor ? <Loader2 className="animate-spin" /> : <><Save size={22} /> Yayınla</>}
          </button>
        )}
      </div>
    </div>
  );
}