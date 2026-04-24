import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "mingax_cok_gizli_anahtar_2026";

export async function POST(req: Request) {
  try {
    // GÜVENLİK: Bu adresi dışarıdan hackerlar çağıramasın diye Vercel'in kendi güvenlik anahtarını kontrol ediyoruz
    const authHeader = req.headers.get('Authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
       return NextResponse.json({ error: 'Yetkisiz erişim! Bu bir robot hattıdır.' }, { status: 401 });
    }

    const suAn = new Date();

    // 1. Süresi dolmuş ama esnafın dükkanında bekleyen paketleri avla
    const suresiDolanPaketler = await prisma.paket.findMany({
      where: {
        durum: "NOKTADA",
        sonAlimTarihi: { lt: suAn } // sonAlimTarihi, şu andan daha geçmişte olanlar
      }
    });

    if (suresiDolanPaketler.length === 0) {
      return NextResponse.json({ success: true, message: "Süresi dolan paket bulunamadı, sistem temiz." });
    }

    // 2. Acımasızca iadeye çek
    let islemGoren = 0;
    for (const paket of suresiDolanPaketler) {
      // İade için kuryenin okutacağı yeni bir QR oluşturuyoruz
      const iade_qr = jwt.sign({ paketId: paket.id, tip: "IADE_QR" }, SECRET);

      await prisma.paket.update({
        where: { id: paket.id },
        data: {
          durum: "IADE_BEKLIYOR",
          iade_qr: iade_qr,
          iadeBaslangicTarihi: new Date()
        }
      });
      islemGoren++;

      // NOT: Burada ileride NetGSM veya Firebase API'leri ile SMS ve Push göndereceğiz.
      console.log(`[OTOMASYON] ${paket.id} nolu paketin süresi doldu. İadeye alındı.`);
    }

    return NextResponse.json({ 
      success: true, 
      message: `${islemGoren} adet paket otomatik olarak iade statüsüne çekildi.` 
    });

  } catch (error) {
    console.error("İade cron hatası:", error);
    return NextResponse.json({ error: "İade otomasyonu çöktü." }, { status: 500 });
  }
}