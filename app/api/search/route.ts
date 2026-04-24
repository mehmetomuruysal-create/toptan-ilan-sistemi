import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");

  if (!query || query.length < 2) return NextResponse.json({ success: true, data: [] });

  try {
    // Önce bu isimde bir kategori var mı bakalım (Google Kategori Listesi için)
    const kategori = await prisma.category.findFirst({
      where: { name: { contains: query, mode: 'insensitive' } },
      select: { id: true }
    });

    const ilanlar = await prisma.listing.findMany({
      where: {
        durum: "ACTIVE",
        OR: [
          { baslik: { contains: query, mode: 'insensitive' } },
          { aciklama: { contains: query, mode: 'insensitive' } },
          // Eğer kelime bir kategoriyse o kategoriye ait ilanları da getir
          kategori ? { categoryId: kategori.id } : {},
        ]
      },
      include: {
        satici: true,
        images: true,
        baremler: {
          include: { katilimcilar: true },
          orderBy: { miktar: 'asc' }
        }
      },
      orderBy: { olusturmaTarihi: 'desc' },
      take: 20
    });

    return NextResponse.json({ success: true, data: ilanlar });
  } catch (error) {
    console.error("Arama hatası:", error);
    return NextResponse.json({ error: "Arama başarısız" }, { status: 500 });
  }
}