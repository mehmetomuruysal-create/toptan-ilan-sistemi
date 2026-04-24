import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

    const userId = Number(session.user.id);

    // Kullanıcının katıldığı ilanlar üzerinden paketleri çekiyoruz
    const paketler = await prisma.paket.findMany({
      where: {
        katilim: { kullaniciId: userId }
      },
      include: {
        nokta: true,
        katilim: {
          include: { ilan: true }
        }
      },
      orderBy: { olusturmaTarihi: 'desc' }
    });

    return NextResponse.json({ success: true, data: paketler });
  } catch (error) {
    return NextResponse.json({ error: "Paketler yüklenemedi" }, { status: 500 });
  }
}