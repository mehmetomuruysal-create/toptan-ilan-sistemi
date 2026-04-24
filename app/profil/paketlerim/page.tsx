"use client";
import { useState, useEffect } from "react";
import { Package, QrCode, MapPin, Clock, CheckCircle2, AlertCircle, Loader2, X, ChevronRight } from "lucide-react";

export default function PaketlerimPage() {
  const [paketler, setPaketler] = useState<any[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [seciliQR, setSeciliQR] = useState<{ id: string, img: string } | null>(null);
  const [qrYukleniyor, setQrYukleniyor] = useState(false);

  useEffect(() => {
    fetch("/api/paketlerim")
      .then(res => res.json())
      .then(res => { setPaketler(res.data); setYukleniyor(false); });
  }, []);

  const qrGoster = async (paketId: string) => {
    setQrYukleniyor(true);
    try {
      const res = await fetch(`/api/paket/${paketId}/qr`);
      const data = await res.json();
      if (data.success) setSeciliQR({ id: paketId, img: data.qrImage });
    } catch (err) {
      alert("QR Kod şu an oluşturulamadı.");
    } finally {
      setQrYukleniyor(false);
    }
  };

  if (yukleniyor) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-blue-600" size={48} /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-10">
      
      {/* BAŞLIK */}
      <div>
        <h1 className="text-4xl md:text-5xl font-black italic uppercase text-gray-900 tracking-tighter">
          Paketlerim
        </h1>
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-2">
          Mingax teslimat ağındaki siparişlerinizin takibi
        </p>
      </div>

      <div className="space-y-6">
        {paketler.map((paket) => (
          <div key={paket.id} className="bg-white rounded-[2.5rem] border-2 border-gray-100 p-6 md:p-8 shadow-sm hover:shadow-xl transition-all group">
            <div className="flex flex-col md:flex-row justify-between gap-6">
              
              {/* SOL TARAF: İÇERİK */}
              <div className="space-y-4 flex-1">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-2xl ${paket.durum === 'NOKTADA' ? 'bg-orange-100 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
                    <Package size={24} />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Sipariş No: #{paket.katilimId}</span>
                    <h3 className="text-xl font-black text-gray-900 uppercase italic leading-tight">{paket.katilim.ilan.baslik}</h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-gray-500 font-bold text-sm">
                    <MapPin size={18} className="text-gray-300" />
                    <span>{paket.nokta?.ad || "Nokta Atanıyor..."}</span>
                  </div>
                  {paket.durum === 'NOKTADA' && (
                    <div className="flex items-center gap-2 text-orange-600 font-black text-sm uppercase italic">
                      <Clock size={18} />
                      <span>Son Alım: {new Date(paket.sonAlimTarihi).toLocaleDateString('tr-TR')}</span>
                    </div>
                  )}
                </div>

                {/* DURUM ÇUBUĞU */}
                <div className="flex items-center gap-2 pt-2">
                  <div className={`h-2 flex-1 rounded-full ${paket.durum === 'TESLIM_EDILDI' ? 'bg-green-500' : 'bg-gray-100'}`}>
                    <div className={`h-full rounded-full bg-blue-600 transition-all`} style={{ width: paket.durum === 'NOKTADA' ? '66%' : paket.durum === 'TESLIM_EDILDI' ? '100%' : '33%' }}></div>
                  </div>
                  <span className="text-[10px] font-black uppercase text-blue-600 whitespace-nowrap">{paket.durum.replace('_', ' ')}</span>
                </div>
              </div>

              {/* SAĞ TARAF: AKSİYON */}
              <div className="flex items-center">
                {paket.durum === 'NOKTADA' ? (
                  <button 
                    onClick={() => qrGoster(paket.id)}
                    className="w-full md:w-auto bg-gray-900 text-white px-8 py-5 rounded-[1.5rem] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-black transition-all shadow-lg active:scale-95"
                  >
                    <QrCode size={24} /> Teslimat Kodu
                  </button>
                ) : paket.durum === 'TESLIM_EDILDI' ? (
                  <div className="bg-green-50 text-green-600 px-6 py-4 rounded-[1.5rem] font-black uppercase text-xs flex items-center gap-2 border-2 border-green-100">
                    <CheckCircle2 size={20} /> Teslim Alındı
                  </div>
                ) : (
                  <div className="bg-gray-50 text-gray-400 px-6 py-4 rounded-[1.5rem] font-black uppercase text-xs flex items-center gap-2 italic">
                    <Loader2 size={18} className="animate-spin" /> Hazırlanıyor
                  </div>
                )}
              </div>

            </div>
          </div>
        ))}

        {paketler.length === 0 && (
          <div className="text-center py-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
            <Package size={64} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-400 font-black uppercase italic">Henüz bir paketiniz bulunmuyor.</p>
          </div>
        )}
      </div>

      {/* QR MODAL */}
      {seciliQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-white rounded-[3rem] w-full max-w-sm p-8 text-center relative overflow-hidden shadow-2xl">
            <button onClick={() => setSeciliQR(null)} className="absolute top-6 right-6 p-2 bg-gray-100 rounded-full hover:bg-red-50 hover:text-red-600 transition-colors">
              <X size={20} />
            </button>

            <div className="space-y-6 py-4">
              <div className="space-y-1">
                <h4 className="text-2xl font-black uppercase italic text-gray-900">Teslimat Kodu</h4>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Esnafa bu kodu okutun</p>
              </div>

              <div className="bg-gray-50 p-6 rounded-[2rem] border-2 border-gray-100 inline-block shadow-inner">
                <img src={seciliQR.img} alt="Mingax QR" className="w-64 h-64 mix-blend-multiply" />
              </div>

              <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100">
                 <p className="text-[11px] font-black text-orange-700 leading-tight uppercase italic">
                    <AlertCircle size={14} className="inline mr-1" /> Bu kod tek kullanımlıktır. Paylaşmayınız.
                 </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}