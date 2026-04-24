"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react"; // 🚀 Suspense eklendi
import Link from "next/link";
import { Loader2, SearchX } from "lucide-react";

// 1. Arama mantığını içeren asıl bileşen
function AramaIcerik() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q");
  const [sonuclar, setSonuclar] = useState<any[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    if (query) {
      setYukleniyor(true);
      fetch(`/api/search?q=${encodeURIComponent(query)}`)
        .then(res => res.json())
        .then(res => {
          setSonuclar(res.data || []);
          setYukleniyor(false);
        });
    }
  }, [query]);

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-800">
          "{query}" için arama sonuçları
        </h1>
        <p className="text-sm text-gray-500 mt-1">{sonuclar.length} ilan bulundu.</p>
      </div>

      {yukleniyor ? (
        <div className="flex flex-col items-center py-20">
          <Loader2 className="animate-spin text-mingax-orange mb-4" size={40} />
          <p className="text-gray-400 font-medium">Sonuçlar getiriliyor...</p>
        </div>
      ) : sonuclar.length === 0 ? (
        <div className="bg-white rounded-xl p-20 text-center border border-gray-200 shadow-sm">
          <SearchX size={64} className="mx-auto text-gray-200 mb-4" />
          <h3 className="text-lg font-bold text-gray-700">Sonuç Bulunamadı</h3>
          <p className="text-sm text-gray-400 mt-2">Aramanıza uygun aktif bir grup alımı bulunamadı.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {sonuclar.map((listing) => {
             const enIyiFiyat = listing.baremler.length > 0 
              ? Math.min(...listing.baremler.map((b: any) => b.fiyat)) 
              : 0;

             return (
              <Link href={`/ilan/${listing.id}`} key={listing.id} className="group bg-white border border-gray-200 rounded-lg p-3 hover:shadow-lg transition-all">
                 <div className="aspect-square bg-gray-50 rounded-md overflow-hidden mb-3">
                    <img src={listing.images[0]?.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt={listing.baslik} />
                 </div>
                 <div className="flex flex-col">
                    <p className="text-xs font-bold text-gray-900 line-clamp-2">
                      <span className="text-mingax-orange mr-1">{listing.satici?.firmaAdi}</span>
                      {listing.baslik}
                    </p>
                    <div className="mt-2">
                      <p className="text-mingax-orange font-black text-base">₺{enIyiFiyat.toLocaleString('tr-TR')}</p>
                    </div>
                 </div>
              </Link>
             );
          })}
        </div>
      )}
    </div>
  );
}

// 2. Export edilen ana sayfa bileşeni (Vercel hatasını çözen kısım burası)
export default function AramaSonucPage() {
  return (
    <div className="bg-[#fafafa] min-h-screen">
      <Suspense fallback={
        <div className="flex justify-center py-40">
          <Loader2 className="animate-spin text-mingax-orange" size={40} />
        </div>
      }>
        <AramaIcerik />
      </Suspense>
    </div>
  );
}