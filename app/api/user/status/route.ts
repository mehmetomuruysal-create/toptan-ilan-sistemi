import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    
    // 1. GÜVENLİK KONTROLÜ
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yetkisiz işlem! Lütfen giriş yapın." }, { status: 401 });
    }

    const userId = Number(session.user.id);

    // 🚀 2. OPTİMİZASYON: İki veritabanı sorgusunu aynı anda (paralel) çalıştırıyoruz
    const [user, belgeSayisi] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { onayDurumu: true }, // Sadece ihtiyacımız olan sütunu çekiyoruz
      }),
      prisma.document.count({
        where: { userId: userId },
      })
    ]);

    // 3. SONUÇ DÖNDÜRME
    return NextResponse.json({
      onayDurumu: user?.onayDurumu || "PENDING",
      belgeSayisi: belgeSayisi || 0
    });

  } catch (error: any) {
    console.error("❌ Status API Hatası:", error.message);
    return NextResponse.json({ error: "Sunucu hatası oluştu." }, { status: 500 });
  }
}