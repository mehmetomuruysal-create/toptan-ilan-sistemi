import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { paketQROlustur } from "@/lib/qr";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
    }

    const kullaniciId = Number(session.user.id);
    
    // Formdan gelen tüm verileri çekiyoruz (adet eklendi!)
    const { ilanId, baremId, adet, teslimatTuru, noktaId, adresId } = await req.json();

    if (!ilanId || !baremId || !teslimatTuru) {
      return NextResponse.json({ error: "Eksik bilgi gönderildi." }, { status: 400 });
    }

    // 1. İlan ve Barem bilgilerini çek
    const ilan = await prisma.listing.findUnique({ where: { id: Number(ilanId) } });
    const barem = await prisma.barem.findUnique({ where: { id: Number(baremId) } });

    if (!ilan || !barem) {
      return NextResponse.json({ error: "İlan veya kademe bulunamadı." }, { status: 404 });
    }

    const talepMiktari = Number(adet) || 1;
    const toplamTutar = barem.fiyat * talepMiktari;
    const kaporaMiktari = (toplamTutar * ilan.depozitoOrani) / 100;

    // 2. PRISMA TRANSACTION: Ödemeyi Başarılı Say ve Siparişi Oluştur
    // Burada Iyzico başarılı dönmüş gibi davranıyoruz.
    const yeniKatilim = await prisma.participant.create({
      data: {
        kullaniciId: kullaniciId,
        ilanId: ilan.id,
        baremId: barem.id,
        talepMiktari: talepMiktari,
        secilenBaremFiyat: barem.fiyat,
        kaporaMiktari: kaporaMiktari,
        adresId: adresId || null,
        durum: "ONAYLANDI", // Ödeme başarılı!
      }
    });

    // İlanın mevcut talebini artır
    await prisma.listing.update({
      where: { id: ilan.id },
      data: { mevcutTalep: { increment: talepMiktari } }
    });

    // 3. EĞER MINGAX NOKTASI SEÇİLDİYSE -> Paket ve QR Kodları Oluştur
    if (teslimatTuru === "MINGAX_NOKTA" && noktaId) {
      const paketId = `PKG-${Date.now()}`; // Benzersiz paket ID'si
      const qrBilgileri = paketQROlustur(paketId, Number(noktaId), yeniKatilim.id);

      await prisma.paket.create({
        data: {
          id: paketId,
          katilimId: yeniKatilim.id,
          noktaId: Number(noktaId),
          kurye_qr: qrBilgileri.kurye_qr,
          alici_qr: qrBilgileri.alici_qr,
          sonAlimTarihi: qrBilgileri.sonTarih,
          durum: "SIPARIS_ALINDI" // Merkez depoya düştü
        }
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Sanal ödeme başarılı! Siparişiniz oluşturuldu." 
    });

  } catch (error) {
    console.error("Test ödeme hatası:", error);
    return NextResponse.json({ error: "Sipariş oluşturulamadı." }, { status: 500 });
  }
}