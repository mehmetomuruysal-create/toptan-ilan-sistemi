"use client";
import { Heart } from "lucide-react";
import { useState } from "react";
import { toggleFavorite } from "@/app/actions/favorite";
import { useRouter } from "next/navigation";

export default function FavoriteButton({ listingId, isFavoritedInitial }: { listingId: number, isFavoritedInitial: boolean }) {
  const [isFavorited, setIsFavorited] = useState(isFavoritedInitial);
  const [yukleniyor, setYukleniyor] = useState(false);
  const router = useRouter();

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault(); // Link'e gitmesini engelle
    setYukleniyor(true);
    
    const res = await toggleFavorite(listingId);
    if (res.error) {
      alert("Lütfen önce giriş yapın");
    } else {
      setIsFavorited(res.action === "added");
    }
    setYukleniyor(false);
  };

  return (
    <button 
      onClick={handleToggle}
      disabled={yukleniyor}
      className={`absolute top-4 right-4 z-20 w-9 h-9 rounded-full flex items-center justify-center transition-all border shadow-sm ${
        isFavorited 
        ? "bg-white border-mingax-orange text-mingax-orange" 
        : "bg-white/80 border-gray-200 text-gray-400 hover:text-mingax-orange"
      }`}
    >
      <Heart size={18} fill={isFavorited ? "currentColor" : "none"} strokeWidth={2.5} />
    </button>
  );
}