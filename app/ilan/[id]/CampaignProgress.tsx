"use client"
import { Users, Share2, MessageCircle, TrendingDown, CheckCircle2, Copy, Check } from "lucide-react"
import { useState, useEffect } from "react"

export default function CampaignProgress({ listing, toplamKatilim }: { listing: any, toplamKatilim: number }) {
  const [copied, setCopied] = useState(false)
  const [currentUrl, setCurrentUrl] = useState("")

  // SSR hatasını önlemek için URL'i useEffect ile alıyoruz
  useEffect(() => {
    setCurrentUrl(window.location.href)
  }, [])

  // Sıradaki baremi bulma (Miktara göre sıralı olduğundan emin oluyoruz)
  const siradakiBarem = [...listing.baremler]
    .sort((a, b) => a.miktar - b.miktar)
    .find((b: any) => b.miktar > toplamKatilim) || null;

  const kalanAdet = siradakiBarem ? siradakiBarem.miktar - toplamKatilim : 0;
  
  // PR Uzmanı Dokunuşu: Mesajı daha kışkırtıcı hale getirdik
  const shareMessage = `🔥 ACİL DURUM: ${listing.baslik} için dev grup alımı başladı! 
  
Şu an ${toplamKatilim} kişiyiz. Sadece ${kalanAdet} kişi daha katılırsa fiyat ₺${siradakiBarem?.fiyat.toLocaleString()}'ye düşüyor! 

Paranı sokakta bulmadıysan gel, birlikte alıp tasarruf edelim: 
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
    <div className="space-y-8">
      {/* --- 📊 GRUP GÜCÜ VE İLERLEME --- */}
      <div className="bg-white rounded-[3.5rem] p-8 md:p-10 border border-gray-100 shadow-2xl shadow-gray-200/50 relative overflow-hidden">
        {/* Arka plan süslemesi */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-blue-50 rounded-full blur-3xl opacity-50"></div>

        <div className="flex justify-between items-start mb-10 relative z-10">
          <div>
            <h3 className="text-3xl font-black uppercase italic tracking-tighter leading-none mb-2 text-gray-900">Grup Enerjisi</h3>
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] italic">Anlık Katılım Takibi</p>
          </div>
          <div className="bg-gray-900 text-white px-6 py-3 rounded-2xl text-xs font-black italic flex items-center gap-2 shadow-xl shadow-gray-300">
            <Users size={18} className="text-blue-400" /> {toplamKatilim} KATILIMCI
          </div>
        </div>

        {/* Barem Merdiveni */}
        <div className="space-y-5 relative z-10">
          {listing.baremler.map((barem: any, index: number) => {
            const isReached = toplamKatilim >= barem.miktar;
            const isNextGoal = siradakiBarem?.id === barem.id;
            const yuzde = Math.min((toplamKatilim / barem.miktar) * 100, 100);

            return (
              <div 
                key={barem.id} 
                className={`relative p-6 rounded-[2.5rem] transition-all duration-500 border-2 ${
                  isReached 
                  ? 'bg-green-50 border-green-100' 
                  : isNextGoal 
                    ? 'bg-blue-50/50 border-blue-200 shadow-lg shadow-blue-50 scale-[1.02]' 
                    : 'bg-gray-50 border-transparent opacity-40'
                }`}
              >
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black italic shadow-sm transition-colors ${isReached ? 'bg-green-600 text-white' : 'bg-white text-gray-400'}`}>
                      {isReached ? <CheckCircle2 size={20} /> : index + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Hedef: {barem.miktar} Adet</p>
                         {isReached && <span className="text-[8px] font-black text-green-600 uppercase italic">AŞILDI!</span>}
                      </div>
                      <p className={`text-xl font-black italic leading-none mt-1 ${isReached ? 'text-green-700' : 'text-gray-900'}`}>₺{barem.fiyat.toLocaleString()}</p>
                    </div>
                  </div>
                  {isNextGoal && (
                    <div className="flex flex-col items-end">
                      <span className="text-[9px] font-black text-blue-600 animate-pulse italic uppercase tracking-tighter">Sıradaki Hedef 🔥</span>
                    </div>
                  )}
                </div>

                {/* Premium Progress Bar */}
                <div className="w-full h-4 bg-white/80 rounded-full overflow-hidden p-1 border border-gray-100">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${
                      isReached ? 'bg-green-500' : 'bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.3)]'
                    }`}
                    style={{ width: `${yuzde}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 🚀 MOTİVASYON SPOTU (Behavioral Trigger) */}
        {siradakiBarem && (
          <div className="mt-10 p-8 bg-gray-900 rounded-[3rem] text-center shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] mb-3 italic relative z-10">Birlikte Kazanmaya Çok Yakınız!</p>
            <h4 className="text-white text-3xl font-black italic tracking-tighter uppercase leading-[0.9] relative z-10">
              Sadece <span className="text-blue-500 text-4xl underline decoration-4 underline-offset-8 decoration-blue-500/30">{kalanAdet}</span> Kişi Kaldı! <br />
              <span className="text-2xl text-green-400 mt-2 inline-block">Fiyat ₺{siradakiBarem.fiyat.toLocaleString()} Olacak</span>
            </h4>
          </div>
        )}
      </div>

      {/* --- 📣 PAYLAŞIM MERKEZİ (Viral Loop) --- */}
      <div className="bg-blue-600 rounded-[3.5rem] p-12 text-white relative overflow-hidden group shadow-2xl shadow-blue-200">
        <div className="relative z-10 text-center">
          <div className="w-20 h-20 bg-white/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8 backdrop-blur-md border border-white/20 group-hover:rotate-12 transition-transform duration-500">
            <Share2 size={32} />
          </div>
          <h3 className="text-4xl font-black uppercase italic tracking-tighter mb-4">Paylaş, İndirimi Bitir!</h3>
          <p className="text-blue-100 text-sm font-medium mb-10 max-w-sm mx-auto leading-relaxed">
            Gruba ne kadar çok kişi davet edersen, dev indirime o kadar hızlı ulaşırız. WhatsApp gruplarına at, herkes kazansın!
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
              onClick={shareOnWhatsApp}
              className="bg-white text-blue-600 px-8 py-6 rounded-3xl font-black uppercase text-xs tracking-widest hover:bg-green-500 hover:text-white transition-all flex items-center justify-center gap-3 shadow-xl hover:-translate-y-1 active:scale-95"
            >
              <MessageCircle size={22} /> WhatsApp'ta Duyur
            </button>
            <button 
              onClick={copyToClipboard}
              className="bg-blue-700/50 text-white border-2 border-white/10 px-8 py-6 rounded-3xl font-black uppercase text-xs tracking-widest hover:bg-blue-500 transition-all flex items-center justify-center gap-3 hover:-translate-y-1 active:scale-95"
            >
              {copied ? <Check size={22} className="text-green-400" /> : <Copy size={22} />}
              {copied ? "KOPYALANDI!" : "LİNKİ KOPYALA"}
            </button>
          </div>
        </div>
        
        {/* Dekoratif Işıklar */}
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white/20 blur-[100px] rounded-full"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/20 blur-3xl rounded-full"></div>
      </div>
    </div>
  )
}