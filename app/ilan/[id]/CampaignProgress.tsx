"use client"
import { Users, Share2, MessageCircle, TrendingDown, CheckCircle2, Copy, Check, Zap, Trophy, Lock, Unlock } from "lucide-react"
import { useState, useEffect } from "react"

export default function CampaignProgress({ listing, toplamKatilim }: { listing: any, toplamKatilim: number }) {
  const [copied, setCopied] = useState(false)
  const [currentUrl, setCurrentUrl] = useState("")

  useEffect(() => {
    setCurrentUrl(window.location.href)
  }, [])

  const siradakiBarem = [...listing.baremler]
    .sort((a, b) => a.miktar - b.miktar)
    .find((b: any) => b.miktar > toplamKatilim) || null;

  const kalanAdet = siradakiBarem ? siradakiBarem.miktar - toplamKatilim : 0;
  
  const shareMessage = `🔥 ACİL: ${listing.baslik} için grup alımı patlamak üzere! 
  
Şu an ${toplamKatilim} kişiyiz. Sadece ${kalanAdet} kişi daha gelirse fiyat ₺${siradakiBarem?.fiyat.toLocaleString()}'ye çakılıyor! 📉

İndirimi birlikte tetikleyelim: 
👉 ${currentUrl}`;

  const shareOnWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareMessage)}`, '_blank');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* --- 🎰 CANLI KAZANÇ HAVUZU --- */}
      <div className="bg-[#0f172a] rounded-2xl p-6 border-2 border-yellow-500/30 shadow-[0_0_20px_rgba(234,179,8,0.1)] relative overflow-hidden">
        {/* Hareketli Arka Plan Işığı */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 blur-[50px] animate-pulse"></div>

        <div className="flex justify-between items-center mb-8 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
                <p className="text-[10px] font-black text-green-400 uppercase tracking-[0.2em] italic">Canlı İndirim Masası</p>
            </div>
            <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Grup Enerjisi</h3>
          </div>
          <div className="bg-yellow-500 text-black px-4 py-2 rounded-lg text-xs font-black italic flex items-center gap-2 shadow-[0_0_15px_rgba(234,179,8,0.4)]">
            <Users size={16} /> {toplamKatilim} KATILIMCI
          </div>
        </div>

        {/* 🏆 BAREM LADDER (KAZANÇ MERDİVENİ) */}
        <div className="space-y-3 relative z-10">
          {listing.baremler.map((barem: any, index: number) => {
            const isReached = toplamKatilim >= barem.miktar;
            const isNextGoal = siradakiBarem?.id === barem.id;
            const yuzde = Math.min((toplamKatilim / barem.miktar) * 100, 100);

            return (
              <div 
                key={barem.id} 
                className={`relative p-4 rounded-xl transition-all duration-500 border ${
                  isReached 
                  ? 'bg-green-500/10 border-green-500/50 shadow-[inset_0_0_15px_rgba(34,197,94,0.1)]' 
                  : isNextGoal 
                    ? 'bg-blue-500/5 border-blue-500/40 border-dashed animate-pulse' 
                    : 'bg-white/5 border-white/10 opacity-40'
                }`}
              >
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isReached ? 'bg-green-500 text-black scale-110' : 'bg-white/10 text-white/40'}`}>
                      {isReached ? <Trophy size={16} /> : index + 1}
                    </div>
                    <div>
                      <p className={`text-[10px] font-bold uppercase tracking-widest ${isReached ? 'text-green-400' : 'text-gray-500'}`}>
                        Hedef: {barem.miktar} Adet
                      </p>
                      <p className={`text-lg font-black italic leading-none ${isReached ? 'text-white' : 'text-gray-300'}`}>
                        ₺{barem.fiyat.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  {isReached ? (
                    <div className="flex items-center gap-1 text-green-500 font-black text-[9px] uppercase italic">
                      <Unlock size={12} /> İndirim Aktif
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-gray-500 font-black text-[9px] uppercase italic">
                      <Lock size={12} /> Kilitli
                    </div>
                  )}
                </div>

                {/* Progress Bar - Neon Line */}
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${
                      isReached ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]' : 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]'
                    }`}
                    style={{ width: `${yuzde}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 🚀 JACKPOT SPOTU (TEŞVİK MOTORU) */}
        {siradakiBarem && (
          <div className="mt-6 p-5 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl text-center shadow-xl relative group overflow-hidden">
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <p className="text-blue-100 text-[10px] font-black uppercase tracking-[0.3em] mb-2 italic">Sıradaki Kilidi Patlat!</p>
            <h4 className="text-white text-2xl font-black italic tracking-tighter uppercase leading-none">
              SON <span className="text-yellow-400 text-3xl animate-bounce inline-block mx-1">{kalanAdet}</span> KİŞİ!
            </h4>
            <p className="text-[10px] text-white/70 font-bold mt-2 uppercase">İndirim Oranı: ₺{siradakiBarem.fiyat.toLocaleString()}</p>
          </div>
        )}
      </div>

      {/* --- 📣 VİRAL PAYLAŞIM PANELİ (OPERASYON MERKEZİ) --- */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
        <div className="space-y-1">
            <h4 className="text-sm font-black text-gray-900 uppercase italic flex items-center gap-2">
                <Zap size={16} className="text-[#F27A1A]" /> İndirimi Sen Bitir!
            </h4>
            <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                Arkadaşlarını davet et, hedef sayıya anında ulaşalım. Her yeni üye seni bir alt bareme taşır.
            </p>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={shareOnWhatsApp}
            className="bg-[#25D366] text-white py-3.5 rounded-xl font-bold text-[11px] uppercase tracking-wider hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-100"
          >
            <MessageCircle size={18} /> WhatsApp
          </button>
          <button 
            onClick={copyToClipboard}
            className="bg-gray-900 text-white py-3.5 rounded-xl font-bold text-[11px] uppercase tracking-wider hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-gray-200"
          >
            {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
            {copied ? "Kopyalandı" : "Linki Al"}
          </button>
        </div>

        <div className="pt-2">
            <div className="flex items-center gap-2 text-[9px] font-black text-blue-600 bg-blue-50 p-2 rounded-lg uppercase italic border border-blue-100">
                <TrendingDown size={14} /> Bu ilanı 145 kişi WhatsApp üzerinden inceledi.
            </div>
        </div>
      </div>
    </div>
  )
}