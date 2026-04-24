import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "mingax_cok_gizli_anahtar_2026";

export async function POST(req: Request) {
  try {
    // 1. GÜVENLİK: Esnafı Doğrula (Header'dan token alıyoruz)
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return NextResponse.json({ error: "Yetkisiz işlem. Giriş yapın." }, { status: 401 });
    
    const esnafToken = authHeader.split(" ")[1];
    let esnafData: any;
    try {
      esnafData = jwt.verify(esnafToken, SECRET);
    } catch (err) {
      return NextResponse.json({ error: "Oturum süreniz dolmuş, tekrar giriş yapın." }, { status: 401 });
    }

    // 2. Kurye QR Kodunu Çöz ve Doğrula
    const { qrData } = await req.json();
    let qrPayload: any;
    try {
      qrPayload = jwt.verify(qrData, SECRET);
    } catch (err) {
      return NextResponse.json({ error: "Geçersiz veya okunamayan QR kod!" }, { status: 400 });
    }

    // 3. MANTIK KONTROLLERİ
    if (qrPayload.tip !== "KURYE_QR") {
      return NextResponse.json({ error: "Yanlış QR türü! Bu bir alıcı QR kodu." }, { status: 400 });
    }
    if (qrPayload.noktaId !== esnafData.noktaId) {
      return NextResponse.json({ error: "Bu paket başka bir teslimat noktasına ait!" }, { status: 403 });
    }

    // 4. Paketi bul
    const paket = await prisma.paket.findUnique({ where: { id: qrPayload.paketId } });
    if (!paket) return NextResponse.json({ error: "Paket sistemde bulunamadı." }, { status: 404 });
    if (paket.durum === "NOKTADA") return NextResponse.json({ error: "Bu paket zaten teslim alınmış." }, { status: 400 });

    // 5. PRISMA TRANSACTION: İşlemleri tek seferde hatasız yap (Kapasiteyi artır, Paketi güncelle)
    await prisma.$transaction([
      prisma.paket.update({
        where: { id: paket.id },
        data: {
          durum: "NOKTADA",
          noktayaBirakimTarihi: new Date()
        }
      }),
      prisma.teslimatNoktasi.update({
        where: { id: esnafData.noktaId },
        data: { mevcutKapasite: { increment: 1 } } // Esnafın deposuna 1 paket girdi
      })
    ]);

    // Burada Alıcıya SMS/Push bildirimi atılabilir: "Paketiniz Ahmet Bakkal'a ulaştı!"

    return NextResponse.json({ success: true, message: "Paket başarıyla teslim alındı ve deponuza eklendi." });

  } catch (error) {
    console.error("Merkez teslim hatası:", error);
    return NextResponse.json({ error: "Sistemsel bir hata oluştu." }, { status: 500 });
  }
}