import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("search");

  if (!query || query.length < 2) return NextResponse.json([]);

  // 🚀 USTA İŞİ ARAMA: Önce 'Ayakkabı' ile başlayanları, sonra içinde geçenleri getir.
  const categories = await prisma.category.findMany({
    where: {
      name: {
        contains: query,
        mode: "insensitive", // Büyük/küçük harf duyarsız (ı-i ayrımı için kritik)
      },
    },
    include: {
      parent: {
        include: {
          parent: true // İki üst seviyeye kadar yolu çekiyoruz
        }
      }
    },
    orderBy: [
      {
        // Kısa isimli olanlar (genelde ana kategorilerdir) üste çıksın
        name: 'asc', 
      }
    ],
    take: 25 // Limiti biraz artıralım ki asıl sonuçlar kaybolmasın
  });

  // Sonuçları kullanıcıya "Ebeveyn > Çocuk" formatında hazırlayalım
  const formatted = categories.map(cat => {
    let fullName = cat.name;
    if (cat.parent) {
      fullName = `${cat.parent.name} > ${cat.name}`;
      if (cat.parent.parent) {
        fullName = `${cat.parent.parent.name} > ${fullName}`;
      }
    }
    return {
      id: cat.id,
      name: fullName,
      pureName: cat.name
    };
  });

  return NextResponse.json(formatted);
}