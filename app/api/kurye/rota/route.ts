import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Sadece paket bekleyen noktaları ve o noktalara gidecek paketleri çekiyoruz
    const rotaListesi = await prisma.teslimatNoktasi.findMany({
      where: {
        paketler: {
          some: { durum: { in: ["DEPODA_HAZIRLANIYOR", "KURYE_YOLDA"] } }
        }
      },
      include: {
        paketler: {
          where: { durum: { in: ["DEPODA_HAZIRLANIYOR", "KURYE_YOLDA"] } },
          select: { id: true, boyut: true, agirlik: true, kurye_qr: true }
        }
      }
    });

    return NextResponse.json({ 
      success: true, 
      toplamDurak: rotaListesi.length,
      rota: rotaListesi 
    });

  } catch (error) {
    console.error("Rota oluşturma hatası:", error);
    return NextResponse.json({ error: "Rota hesaplanamadı." }, { status: 500 });
  }
}