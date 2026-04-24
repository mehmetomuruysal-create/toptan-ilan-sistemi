"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { createPortal } from "react-dom"
import Image from "next/image"
import { 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  X, 
  Download, 
  Loader2 
} from "lucide-react"

interface UrunGalerisiProps {
  resimler: {
    id: number
    url: string
    altText: string
    siraNo: number
  }[]
  urunAdi: string
}

export default function UrunGalerisi({ resimler, urunAdi }: UrunGalerisiProps) {
  const [aktifIndex, setAktifIndex] = useState(0)
  const [lightboxAcik, setLightboxAcik] = useState(false)
  const [yuklendi, setYuklendi] = useState<Record<number, boolean>>({})
  const [mounted, setMounted] = useState(false)
  
  const thumbnailRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef(0)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (lightboxAcik) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [lightboxAcik]);

  const handleNext = useCallback(() => {
    setAktifIndex((prev) => (prev + 1) % resimler.length)
  }, [resimler.length])

  const handlePrev = useCallback(() => {
    setAktifIndex((prev) => (prev - 1 + resimler.length) % resimler.length)
  }, [resimler.length])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxAcik) {
        if (e.key === "ArrowRight") handleNext()
        if (e.key === "ArrowLeft") handlePrev()
        if (e.key === "Escape") setLightboxAcik(false)
      }
    };
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [lightboxAcik, handleNext, handlePrev])

  if (resimler.length === 0) return null;

  const aktifResim = resimler[aktifIndex];

  // --- LIGHTBOX PORTAL ---
  const LightboxPortal = () => {
    if (!mounted || !lightboxAcik) return null;

    return createPortal(
      <div className="fixed inset-0 z-[100000] bg-black/95 backdrop-blur-xl flex flex-col animate-in fade-in duration-300">
        
        {/* Üst Bar: Kesin Yerleşim */}
        <div className="relative z-[100001] h-20 flex items-center justify-between px-6 border-b border-white/10 bg-black/20">
          
          {/* SOL: KAPAT BUTONU (Öncelikli) */}
          <button 
            onClick={() => setLightboxAcik(false)}
            className="flex items-center gap-3 px-5 py-2.5 bg-white/10 hover:bg-red-600 text-white rounded-full transition-all border border-white/20 group"
          >
            <X size={28} className="group-hover:rotate-90 transition-transform" />
            <span className="font-bold text-base">Kapat</span>
          </button>

          {/* ORTA: ÜRÜN ADI */}
          <div className="hidden lg:block text-white/60 text-sm font-medium truncate max-w-md italic">
            {urunAdi}
          </div>

          {/* SAĞ: SAYAÇ VE İNDİRME */}
          <div className="flex items-center gap-6">
            <span className="text-white font-mono text-xl font-black tracking-widest">
              {aktifIndex + 1} <span className="text-[#F27A1A]">/</span> {resimler.length}
            </span>
            <a 
              href={aktifResim.url} 
              target="_blank" 
              download 
              className="w-12 h-12 flex items-center justify-center bg-white/5 rounded-full text-white hover:bg-[#F27A1A] transition-all border border-white/10"
              title="Resmi İndir"
            >
              <Download size={22} />
            </a>
          </div>
        </div>

        {/* Ana İçerik Alanı */}
        <div className="flex-1 relative flex items-center justify-center p-4">
          <div className="absolute inset-0 z-0" onClick={() => setLightboxAcik(false)} />
          
          <button 
            onClick={(e) => { e.stopPropagation(); handlePrev(); }}
            className="absolute left-6 z-20 w-16 h-16 flex items-center justify-center text-white/30 hover:text-[#F27A1A] hover:bg-white/5 rounded-full transition-all disabled:opacity-0"
            disabled={aktifIndex === 0}
          >
            <ChevronLeft size={56} />
          </button>

          <div className="relative z-10 w-full h-full max-h-[80vh] flex items-center justify-center pointer-events-none">
            <Image
              src={aktifResim.url}
              alt={urunAdi}
              width={1200}
              height={1600}
              className="object-contain max-w-full max-h-full drop-shadow-2xl"
              quality={100}
              priority
            />
          </div>

          <button 
            onClick={(e) => { e.stopPropagation(); handleNext(); }}
            className="absolute right-6 z-20 w-16 h-16 flex items-center justify-center text-white/30 hover:text-[#F27A1A] hover:bg-white/5 rounded-full transition-all disabled:opacity-0"
            disabled={aktifIndex === resimler.length - 1}
          >
            <ChevronRight size={56} />
          </button>
        </div>

        {/* Alt Thumbnail Şeridi */}
        <div className="relative z-10 h-32 bg-black/60 border-t border-white/5 flex items-center justify-center p-6 gap-4 overflow-x-auto no-scrollbar">
          {resimler.map((img, i) => (
            <button
              key={`lb-nav-${img.id}`}
              onClick={() => setAktifIndex(i)}
              className={`relative shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                aktifIndex === i 
                ? "border-[#F27A1A] scale-125 shadow-[0_0_25px_rgba(242,122,26,0.5)] z-20" 
                : "border-transparent opacity-30 hover:opacity-100 scale-100"
              }`}
            >
              <Image src={img.url} alt="nav" fill className="object-cover" />
            </button>
          ))}
        </div>
      </div>,
      document.body
    );
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* --- ANA VİTRİN --- */}
      <div 
        className="relative w-full aspect-[4/3] bg-white rounded-2xl overflow-hidden border border-gray-200 group shadow-md"
        onTouchStart={(e) => (touchStartX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          const diff = touchStartX.current - e.changedTouches[0].clientX;
          if (Math.abs(diff) > 50) diff > 0 ? handleNext() : handlePrev();
        }}
      >
        <div className="absolute top-4 left-4 z-10 text-[11px] text-gray-400 font-bold tracking-widest uppercase bg-white/80 px-2 py-1 rounded">
          {urunAdi}
        </div>

        <div className="absolute top-4 right-4 z-10 bg-black/70 text-white text-[10px] font-black px-3 py-1.5 rounded-full backdrop-blur-md">
          {aktifIndex + 1} / {resimler.length}
        </div>

        <div className="relative w-full h-full cursor-zoom-in" onClick={() => setLightboxAcik(true)}>
          {!yuklendi[aktifResim.id] && (
            <div className="absolute inset-0 bg-gray-50 flex items-center justify-center">
              <Loader2 className="animate-spin text-gray-200" size={32} />
            </div>
          )}
          <Image
            src={aktifResim.url}
            alt={aktifResim.altText || urunAdi}
            fill
            className={`object-cover transition-all duration-700 group-hover:scale-105 ${yuklendi[aktifResim.id] ? "opacity-100" : "opacity-0"}`}
            onLoad={() => setYuklendi(prev => ({ ...prev, [aktifResim.id]: true }))}
            priority
          />
        </div>

        <button 
          onClick={() => setLightboxAcik(true)}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 hover:bg-[#F27A1A] text-white px-6 py-2.5 rounded-full text-[11px] font-black flex items-center gap-2 transition-all backdrop-blur-xl border border-white/10 shadow-2xl"
        >
          <Maximize2 size={16} /> BÜYÜK FOTOĞRAF GÖR
        </button>
      </div>

      {/* --- KÜÇÜK RESİMLER --- */}
      <div ref={thumbnailRef} className="flex gap-3 overflow-x-auto no-scrollbar scroll-smooth py-1">
        {resimler.slice(0, 5).map((img, i) => {
          const isLast = i === 4 && resimler.length > 5
          return (
            <button
              key={img.id}
              onClick={() => isLast ? setLightboxAcik(true) : setAktifIndex(i)}
              className={`relative shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                aktifIndex === i ? "border-[#F27A1A] shadow-lg" : "border-transparent opacity-50 hover:opacity-100"
              }`}
            >
              <Image src={img.url} alt="thumb" fill className="object-cover" />
              {isLast && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-white text-xs font-black">
                  +{resimler.length - 4}
                </div>
              )}
            </button>
          )
        })}
      </div>

      <LightboxPortal />
    </div>
  )
}