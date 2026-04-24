import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { HeartOff, Loader2 } from "lucide-react";

export default async function FavorilerPage() {
  const session = await auth();
  if (!session) return <div className="p-20 text-center">Lütfen giriş yapın.</div>;

  const favoriler = await prisma.favorite.findMany({
    where: { 
      userId: Number(session.user.id),
      // 🚀 OTOMATİK SİLME MANTIĞI: Sadece aktif ve süresi bitmemiş olanları getir
      listing: {
        durum: "ACTIVE",
        bitisTarihi: { gt: new Date() } // Bitiş tarihi şimdiden büyük olanlar
      }
    },
    include: {
      listing: {
        include: { satici: true, images: true, baremler: true }
      }
    }
  });

  return (
    <div className="bg-[#fafafa] min-h-screen py-10">
      <div className="max-w-[1200px] mx-auto px-4">
        <h1 className="text-2xl font-bold mb-8 flex items-center gap-2">
          Favorilerim <span className="text-sm font-normal text-gray-400">({favoriler.length} Ürün)</span>
        </h1>

        {favoriler.length === 0 ? (
          <div className="bg-white p-20 rounded-xl border text-center">
            <HeartOff size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-500 font-semibold">Henüz favori ürününüz yok veya favorilerinizdeki ilanların süresi doldu.</p>
            <Link href="/" className="mt-4 inline-block text-mingax-orange font-bold">Alışverişe Başla</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {favoriler.map((fav) => (
              <Link href={`/ilan/${fav.listing.id}`} key={fav.id} className="bg-white border rounded-lg p-3 group">
                <img src={fav.listing.images[0]?.url} className="aspect-square object-cover rounded-md mb-2" />
                <p className="text-xs font-bold line-clamp-2">{fav.listing.baslik}</p>
                <p className="text-mingax-orange font-bold mt-2">₺{fav.listing.baremler[0]?.fiyat.toLocaleString()}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}