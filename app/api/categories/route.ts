import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("search");

  if (!query || query.length < 2) return NextResponse.json([]);

  // 🚀 USTA İŞİ ARAMA VE SIRALAMA
  const categories = await prisma.category.findMany({
    where: {
      name: {
        contains: query,
        mode: "insensitive", // Büyük/küçük harf duyarsız
      },
    },
    include: {
      parent: {
        include: {
          parent: true // İki üst seviyeye kadar yolu çekiyoruz
        }
      }
    },
    // 🛡️ MÜHÜR: Ana kategorileri (parentId'si olmayan veya küçük olanları) öne çıkar
    orderBy: [
      { parentId: { sort: 'asc', nulls: 'first' } }, // Önce en üst seviyeler gelsin
      { name: 'asc' } // Sonra alfabetik diz
    ],
    take: 30 // Daha fazla sonuç getir ki ana kategori kalabalıkta kaybolmasın
  });

  // 🌳 Hiyerarşiyi "Kıyafet > Ayakkabı" formatına getirme
  const formatted = categories.map(cat => {
    let hierarchy = [];
    if (cat.parent?.parent) hierarchy.push(cat.parent.parent.name);
    if (cat.parent) hierarchy.push(cat.parent.name);
    hierarchy.push(cat.name);

    return {
      id: cat.id,
      // Ekranda görünen isim: "Kıyafet > Ayakkabılar"
      fullName: hierarchy.join(" > "), 
      name: cat.name,
      // Önemli: Aramada tam eşleşenleri öne çıkarmak için skorlama yapabiliriz
      priority: cat.name.toLowerCase() === query.toLowerCase() ? 1 : 2
    };
  });

  // 🎯 SON DOKUNUŞ: Tam eşleşen "Ayakkabılar" kelimesini en tepeye mühürle
  const sorted = formatted.sort((a, b) => {
    // Tam kelime eşleşmesi varsa (Örn: "Ayakkabılar") onu en üste al
    if (a.name.toLowerCase().includes(query.toLowerCase()) && !b.name.toLowerCase().includes(query.toLowerCase())) return -1;
    return a.priority - b.priority;
  });

  return NextResponse.json(sorted);
}