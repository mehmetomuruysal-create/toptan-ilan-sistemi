"use client";
import { useEffect, useState } from "react";
import { pusherClient } from "@/lib/pusher";

export default function BaremBar({ ilanId, ilkTalep, hedef }: { ilanId: number, ilkTalep: number, hedef: number }) {
  const [mevcutTalep, setMevcutTalep] = useState(ilkTalep);

  useEffect(() => {
    // 🚀 Kanala abone ol (İlana özel kanal)
    const channel = pusherClient.subscribe(`ilan-${ilanId}`);

    // Olayı dinle
    channel.bind('talep-guncellendi', (data: { yeniTalep: number }) => {
      setMevcutTalep(data.yeniTalep); // Anında güncelle!
    });

    return () => {
      pusherClient.unsubscribe(`ilan-${ilanId}`);
    };
  }, [ilanId]);

  const yuzde = Math.min((mevcutTalep / hedef) * 100, 100);

  return (
    <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden shadow-inner">
      <div 
        className="bg-blue-600 h-full transition-all duration-700 ease-out" 
        style={{ width: `${yuzde}%` }}
      />
    </div>
  );
}