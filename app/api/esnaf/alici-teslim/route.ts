import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "mingax_cok_gizli_anahtar_2026";

export async function POST(req: Request) {
  try {
    // 1. GÜVENLİK: Esnafı Doğrula
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return NextResponse.json({ error: "Yetkisiz işlem. Giriş yapın." }, { status: 401 });
    
    const esnafToken = authHeader.split(" ")[1];
    let esnafData: any;
    try {
      esnafData = jwt.verify(esnafToken, SECRET);
    } catch (err) {
      return NextResponse.json({ error: "Oturum süreniz dolmuş, tekrar giriş yapın." }, { status: 401 });
    }

    // 2. Alıcı QR Kodunu Çöz ve Süresini Kontrol Et (JWT otomatik süreyi denetler)
    const { qrData } = await req.json();
    let qrPayload: any;
    try {
      qrPayload = jwt.verify(qrData, SECRET);
    } catch (err: any) {
      if (err.name === "TokenExpiredError") {
        return NextResponse.json({ error: "Bu QR kodun 6 günlük süresi dolmuş!" }, { status: 400 });
      }
      return NextResponse.json({ error: "Geçersiz veya sahte QR kod!" }, { status: 400 });
    }

    // 3. MANTIK KONTROLLERİ
    if (qrPayload.tip !== "ALICI_QR") {
      return NextResponse.json({ error: "Yanlış QR türü! Bu bir kurye QR kodu." }, { status: 400 });
    }
    if (qrPayload.noktaId !== esnafData.noktaId) {
      return NextResponse.json({ error: "Bu paketi teslim etme yetkiniz yok!" }, { status: 403 });
    }

    const paket = await prisma.paket.findUnique({ where: { id: qrPayload.paketId } });
    if (!paket) return NextResponse.json({ error: "Paket bulunamadı." }, { status: 404 });
    if (paket.durum === "TESLIM_EDILDI") return NextResponse.json({ error: "Bu paket zaten teslim edilmiş! QR kod tek kullanımlıktır." }, { status: 400 });
    if (paket.durum !== "NOKTADA") return NextResponse.json({ error: "Paket henüz merkezinizden teslim alınmamış görünüyor." }, { status: 400 });

    // 4. Esnafın komisyon bilgilerini çek
    const nokta = await prisma.teslimatNoktasi.findUnique({ where: { id: esnafData.noktaId } });
    if (!nokta) return NextResponse.json({ error: "Nokta bilgisi bulunamadı." }, { status: 404 });

    // 5. PRISMA TRANSACTION: Final Vuruşu (Teslim et, Komisyonu yaz, Kapasiteyi boşalt)
    await prisma.$transaction([
      // Paketi teslim edildi yap
      prisma.paket.update({
        where: { id: paket.id },
        data: {
          durum: "TESLIM_EDILDI",
          teslimTarihi: new Date()
        }
      }),
      // Depo alanını 1 eksilt ve esnafın toplam kazandığı parayı güncelle
      prisma.teslimatNoktasi.update({
        where: { id: nokta.id },
        data: { 
          mevcutKapasite: { decrement: 1 },
          toplamKazanilan: { increment: nokta.komisyonMiktari }
        }
      }),
      // Muhasebe kaydını oluştur
      prisma.komisyonIslem.create({
        data: {
          noktaId: nokta.id,
          paketId: paket.id,
          miktar: nokta.komisyonMiktari,
          mingaxPayi: nokta.komisyonMiktari * nokta.komisyonMingaxPayi,
          tedarikciPayi: nokta.komisyonMiktari * nokta.komisyonTedarikciPayi
        }
      })
    ]);

    return NextResponse.json({ success: true, message: "Paket başarıyla teslim edildi. Komisyon hesabınıza yansıdı." });

  } catch (error) {
    console.error("Alıcı teslim hatası:", error);
    return NextResponse.json({ error: "Sistemsel bir hata oluştu." }, { status: 500 });
  }
}