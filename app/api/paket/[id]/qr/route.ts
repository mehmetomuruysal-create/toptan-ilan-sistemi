import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { qrGorseleCevir } from "@/lib/qr";
import { auth } from "@/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> } // 🚀 params artık bir Promise
) {
  try {
    // 1. Güvenlik: Kim giriş yapmış?
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Giriş yapmalısınız" }, { status: 401 });
    }

    // 🚀 Next.js 15+ standartlarına göre params'ı bekleyerek (await) çözüyoruz
    const resolvedParams = await params;
    const paketId = resolvedParams.id;

    // 2. Paketi ve sahibini veritabanından bul
    const paket = await prisma.paket.findUnique({
      where: { id: paketId },
      include: {
        katilim: true,
        nokta: true
      }
    });

    if (!paket) {
      return NextResponse.json({ error: "Paket bulunamadı" }, { status: 404 });
    }

    // 3. Güvenlik: Bu paket gerçekten bu kullanıcıya mı ait?
    if (paket.katilim.kullaniciId !== Number(session.user.id)) {
      return NextResponse.json({ error: "Bu paketi görme yetkiniz yok!" }, { status: 403 });
    }

    // 4. Şifreli alici_qr metnini veritabanından alıp resme çevir
    const qrBase64 = await qrGorseleCevir(paket.alici_qr);

    // 5. Alıcıya QR görselini ve paket durumunu gönder
    return NextResponse.json({
      success: true,
      qrImage: qrBase64,
      durum: paket.durum,
      noktaAdi: paket.nokta?.ad,
      sonAlimTarihi: paket.sonAlimTarihi
    });

  } catch (error) {
    console.error("QR getirme hatası:", error);
    return NextResponse.json({ error: "QR Kod oluşturulamadı" }, { status: 500 });
  }
}