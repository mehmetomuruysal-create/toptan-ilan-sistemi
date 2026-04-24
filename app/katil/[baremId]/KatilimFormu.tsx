"use client";
import { useState, useEffect } from "react";
import { 
  CreditCard, MapPin, ShoppingBag, ArrowRight, 
  CheckCircle2, Plus, Loader2, Info, ShieldCheck,
  Truck, Map // 🚀 EKLENDİ: İkonlar
} from "lucide-react"; 
import AddressModal from "../../../components/AddressModal";
import NoktaSecimHaritasi from "@/components/NoktaSecimHaritasi"; // 🚀 EKLENDİ: Harita Bileşeni
import { pusherClient } from "@/lib/pusher";
import { useRouter } from "next/navigation";

export default function KatilimFormu({ barem, ilan, adresler: ilkAdresler, saticiId }: any) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  
  // 🚀 ÖZGÜRLÜK: Artık miktar 1'den başlıyor
  const [adet, setAdet] = useState(1);
  
  // 🚀 TESLİMAT AĞI STATE'LERİ EKLENDİ
  const [teslimatTuru, setTeslimatTuru] = useState<"KARGO" | "MINGAX_NOKTA">("MINGAX_NOKTA");
  const [secilenNoktaId, setSecilenNoktaId] = useState<number | null>(null);

  const [adresler, setAdresler] = useState(ilkAdresler || []);
  const [seciliAdres, setSeciliAdres] = useState("");
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(false);
  
  // 🚀 KURAL 3: %20 Tek Alıcı Limiti
  const tekAliciMaksLimit = Math.floor(ilan.hedefSayi * 0.20);
  
  const [canliTalep, setCanliTalep] = useState(ilan.mevcutTalep || 0);

  useEffect(() => {
    const channel = pusherClient.subscribe(`ilan-${ilan.id}`);
    channel.bind('talep-guncellendi', (data: { yeniTalep: number }) => {
      setCanliTalep(data.yeniTalep);
    });
    return () => {
      pusherClient.unsubscribe(`ilan-${ilan.id}`);
    };
  }, [ilan.id]);

  useEffect(() => {
    if (adresler.length > 0) {
      const varsayilan = adresler.find((a: any) => a.isVarsayilanTeslimat);
      setSeciliAdres(varsayilan ? varsayilan.id : adresler[0].id);
    }
  }, [adresler]);

  const yeniAdresleriGetir = async () => {
    try {
      const res = await fetch("/api/adres/liste");
      if (res.ok) {
        const data = await res.json();
        setAdresler(data);
        if (data.length > 0) setSeciliAdres(data[data.length - 1].id);
      }
    } catch (error) {
      console.error("Adres listesi güncellenemedi:", error);
    }
  };

  const toplamTutar = adet * barem.fiyat;
  const depozitoTutari = (toplamTutar * (ilan.depozitoOrani || 30)) / 100;

  // 🚀 TEST ÖDEMESİNE YÖNLENDİRİLDİ
  const handleFinalSubmit = async () => {
    setYukleniyor(true);
    try {
      const res = await fetch("/api/odeme/test", { // 🚀 BURASI DEĞİŞTİ
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ilanId: ilan.id,
          baremId: barem.id,
          adet: adet,
          teslimatTuru: teslimatTuru,
          noktaId: secilenNoktaId,
          adresId: seciliAdres,
          toplamTutar: toplamTutar,
          depozitoTutari: depozitoTutari
        })
      });

      if (res.ok) {
        router.push("/profil/paketlerim?success=true"); // 🚀 BURASI DEĞİŞTİ (Paketlerime atıyor)
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Ödeme işlemi sırasında bir hata oluştu.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setYukleniyor(false);
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-[0_32px_64px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden">
      <div className="flex h-2 bg-gray-50">
        <div className={`transition-all duration-700 bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.5)] ${step === 1 ? 'w-1/3' : step === 2 ? 'w-2/3' : 'w-full'}`} />
      </div>

      <div className="p-10">
        {step === 1 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg shadow-blue-100">
                  <ShoppingBag size={24} />
                </div>
                <div>
                  <h2 className="text-3xl font-black uppercase italic tracking-tighter text-gray-900">Miktar Seçimi</h2>
                  <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest italic">İstediğiniz adette talep girebilirsiniz</p>
                </div>
              </div>
              <div className="bg-green-50 px-4 py-2 rounded-xl border border-green-100 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
                <span className="text-[10px] font-black text-green-700 uppercase italic">Canlı Talep: {canliTalep}</span>
              </div>
            </div>
            
            <div className="relative group">
               <input 
                type="number" 
                min="1"
                max={tekAliciMaksLimit}
                value={adet}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 1;
                  setAdet(Math.min(tekAliciMaksLimit, Math.max(1, val)));
                }}
                className="w-full text-5xl font-black p-8 bg-gray-50 border-2 border-transparent rounded-[2rem] focus:bg-white focus:border-blue-600 focus:outline-none transition-all text-center md:text-left"
              />
              <span className="hidden md:block absolute right-8 top-1/2 -translate-y-1/2 text-gray-300 font-black text-2xl uppercase italic">ADET</span>
              <div className="absolute left-8 -bottom-4 bg-white px-3 py-1 border-2 border-gray-100 rounded-lg text-[9px] font-black text-gray-400 uppercase italic">
                Maksimum Alım: {tekAliciMaksLimit} ADET
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                  <span className="block text-[10px] font-black text-gray-400 uppercase mb-1 tracking-widest italic">Seçili Barem Fiyatı</span>
                  <span className="text-2xl font-black text-gray-900">₺{barem.fiyat.toLocaleString()}</span>
               </div>
               <div className="bg-blue-600 p-6 rounded-3xl shadow-xl shadow-blue-100">
                  <span className="block text-[10px] font-black text-blue-200 uppercase mb-1 tracking-widest italic">Tahmini Toplam</span>
                  <span className="text-2xl font-black text-white">₺{toplamTutar.toLocaleString()}</span>
               </div>
            </div>

            <button 
              onClick={() => setStep(2)}
              className="w-full bg-gray-900 text-white py-6 rounded-[1.5rem] font-black uppercase italic tracking-[0.2em] text-sm hover:bg-blue-600 shadow-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-3"
            >
              Teslimat Bilgilerine Geç <ArrowRight size={20} />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="flex items-center justify-between border-b border-gray-50 pb-6">
              <div className="flex items-center gap-4">
                <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg">
                  <MapPin size={24} />
                </div>
                <div>
                  <h2 className="text-3xl font-black uppercase italic tracking-tighter text-gray-900">Teslimat</h2>
                  <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Teslimat yönteminizi seçin</p>
                </div>
              </div>
            </div>

            {/* 🚀 TESLİMAT SEÇİM BUTONLARI EKLENDİ */}
            <div className="flex gap-4 mb-4">
              <button 
                onClick={() => setTeslimatTuru('MINGAX_NOKTA')} 
                className={`flex-1 p-5 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 font-black uppercase tracking-widest text-xs transition-all ${teslimatTuru === 'MINGAX_NOKTA' ? 'border-orange-500 bg-orange-50 text-orange-600 shadow-sm' : 'border-gray-100 text-gray-400 hover:border-gray-200 hover:bg-gray-50'}`}
              >
                <Map size={24}/> <span>Teslimat Noktası</span>
              </button>
              <button 
                onClick={() => setTeslimatTuru('KARGO')} 
                className={`flex-1 p-5 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 font-black uppercase tracking-widest text-xs transition-all ${teslimatTuru === 'KARGO' ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm' : 'border-gray-100 text-gray-400 hover:border-gray-200 hover:bg-gray-50'}`}
              >
                <Truck size={24}/> <span>Adrese Kargo</span>
              </button>
            </div>

            {/* 🚀 MINGAX NOKTASI SEÇİLİYSE HARİTA */}
            {teslimatTuru === "MINGAX_NOKTA" && (
              <div className="animate-in fade-in slide-in-from-bottom-4">
                <NoktaSecimHaritasi onNoktaSec={(id) => setSecilenNoktaId(id)} />
                {secilenNoktaId && (
                  <div className="mt-4 p-4 bg-green-50 text-green-700 rounded-2xl flex items-center justify-center gap-2 font-black uppercase text-[11px] border border-green-200 tracking-widest">
                    <CheckCircle2 size={18} /> Nokta Seçildi. Ödemeye Geçebilirsiniz.
                  </div>
                )}
              </div>
            )}

            {/* 🚀 KARGO SEÇİLİYSE ESKİ ADRES LİSTESİ */}
            {teslimatTuru === "KARGO" && (
              <div className="animate-in fade-in slide-in-from-bottom-4">
                <div className="flex justify-between items-center mb-4">
                   <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Kayıtlı Adresleriniz</h3>
                   <button onClick={() => setIsAddressModalOpen(true)} className="text-blue-600 font-bold text-xs uppercase flex items-center gap-1 hover:underline">
                     <Plus size={14}/> Yeni Adres
                   </button>
                </div>
                <div className="grid grid-cols-1 gap-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {adresler.map((adres: any) => (
                    <div 
                      key={adres.id}
                      onClick={() => setSeciliAdres(adres.id)}
                      className={`p-6 rounded-[2rem] border-2 transition-all cursor-pointer relative ${
                        seciliAdres === adres.id 
                        ? 'border-blue-600 bg-blue-50 shadow-lg' 
                        : 'border-gray-50 bg-gray-50/50 hover:bg-white hover:border-gray-200'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full ${
                          seciliAdres === adres.id ? 'bg-blue-600 text-white' : 'bg-white text-gray-400'
                        }`}>
                          {adres.baslik}
                        </span>
                        {seciliAdres === adres.id && <CheckCircle2 className="text-blue-600" size={20} />}
                      </div>
                      <p className="font-black text-gray-900 uppercase text-xs italic">{adres.teslimAlacakKisi}</p>
                      <p className="text-xs text-gray-500 mt-2 font-medium leading-relaxed">{adres.adresSatiri}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col md:flex-row gap-4 pt-4 border-t border-gray-50">
              <button 
                onClick={() => setStep(1)} 
                className="flex-1 py-5 font-black uppercase italic tracking-widest text-xs text-gray-400 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all"
              >
                Geri Dön
              </button>
              <button 
                onClick={() => setStep(3)}
                disabled={teslimatTuru === "KARGO" ? !seciliAdres : !secilenNoktaId}
                className="flex-[2] bg-gray-900 text-white py-5 rounded-2xl font-black uppercase italic tracking-widest text-xs hover:bg-blue-600 shadow-2xl transition-all disabled:opacity-20 disabled:cursor-not-allowed"
              >
                Ödeme Onayına Geç
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="flex items-center gap-4">
              <div className="bg-green-500 p-3 rounded-2xl text-white shadow-lg shadow-green-100">
                <CreditCard size={24} />
              </div>
              <div>
                <h2 className="text-3xl font-black uppercase italic tracking-tighter text-gray-900">Son Onay</h2>
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Sanal Test Ödemesi</p>
              </div>
            </div>

            <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
               <div className="absolute top-0 right-0 p-10 opacity-10">
                  <ShieldCheck size={120} />
               </div>

               <div className="relative z-10 space-y-6">
                  <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-gray-400 border-b border-white/10 pb-4">
                    <span>Sipariş Miktarı</span>
                    <span className="text-white">{adet} ADET</span>
                  </div>
                  
                  {/* 🚀 TESLİMAT BİLGİSİ ÖZETİ */}
                  <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-gray-400 border-b border-white/10 pb-4">
                    <span>Teslimat Türü</span>
                    <span className={teslimatTuru === 'MINGAX_NOKTA' ? "text-orange-400" : "text-blue-400"}>
                      {teslimatTuru === 'MINGAX_NOKTA' ? 'Mingax Noktası' : 'Adrese Kargo'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-4">
                    <div className="leading-tight">
                      <span className="block font-black text-white text-3xl italic uppercase tracking-tighter">Depozito</span>
                      <span className="text-[10px] text-green-400 font-black uppercase tracking-[0.2em]">Toplamın %{ilan.depozitoOrani || 30}'u</span>
                    </div>
                    <span className="text-4xl font-black text-green-400 tracking-tighter italic">₺{depozitoTutari.toLocaleString()}</span>
                  </div>

                  <div className="bg-white/5 p-4 rounded-2xl flex items-start gap-3 border border-white/5">
                    <Info size={16} className="text-green-400 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-gray-300 font-medium leading-relaxed italic">
                      Bu bir sanal test ödemesidir. Gerçek kredi kartı tahsilatı yapılmaz. İşlem onaylandığında siparişiniz oluşturulur ve QR kodunuz üretilir.
                    </p>
                  </div>
               </div>
            </div>

            <div className="space-y-4">
               <button 
                onClick={handleFinalSubmit}
                disabled={yukleniyor}
                className="w-full bg-green-500 text-white py-6 rounded-[2rem] font-black uppercase italic tracking-[0.3em] text-lg hover:bg-green-600 shadow-2xl shadow-green-100 transition-all flex items-center justify-center gap-4 active:scale-95 disabled:bg-gray-200"
              >
                {yukleniyor ? <Loader2 className="animate-spin" /> : "TEST ÖDEMESİNİ TAMAMLA"}
              </button>
              <button onClick={() => setStep(2)} className="w-full py-2 text-[10px] text-gray-400 font-black uppercase italic hover:text-blue-600 transition-colors">Teslimat Yöntemine Geri Dön</button>
            </div>
          </div>
        )}
      </div>

      <AddressModal 
        isOpen={isAddressModalOpen} 
        onClose={() => {
          setIsAddressModalOpen(false);
          yeniAdresleriGetir();
        }} 
      />
    </div>
  );
}