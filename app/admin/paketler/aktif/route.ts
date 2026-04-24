import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    // 🔐 Sadece adminler görebilir
    if (!session || !(session.user as any).isAdmin) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const aktifPaketler = await prisma.paket.findMany({
      where: {
        // Teslim edilenler veya iadesi bitenler HARİÇ her şey aktiftir
        durum: { 
          notIn: ["TESLIM_EDILDI", "IADE_TAMAMLANDI"] 
        }
      },
      include: {
        nokta: true,
        katilim: {
          include: {
            ilan: true,
            // Güvenlik: Alıcının sadece ID'sini çekiyoruz
            kullanici: { select: { id: true } } 
          }
        }
      },
      // En acil (son tarihi yaklaşan) en üstte çıksın
      orderBy: { sonAlimTarihi: 'asc' }
    });

    return NextResponse.json({ success: true, data: aktifPaketler });
  } catch (error) {
    console.error("Aktif paketler çekilemedi:", error);
    return NextResponse.json({ error: "Paketler yüklenemedi" }, { status: 500 });
  }
}