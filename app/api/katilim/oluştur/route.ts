import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { pusherServer } from "@/lib/pusher";

export async function POST(request: Request) {
  try {
    // 1. OTURUM KONTROLÜ
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Oturum açmanız gerekiyor." }, { status: 401 });
    }

    const body = await request.json();
    const { ilanId, baremId, adet, adresId } = body;
    const userId = Number(session.user.id);

    // 2. İLAN VE BAREM GEÇERLİLİK KONTROLÜ
    const ilan = await prisma.listing.findUnique({
      where: { id: Number(ilanId) },
      include: { baremler: true }
    });

    if (!ilan || ilan.durum !== "ACTIVE") {
      return NextResponse.json({ error: "Bu ilan şu an katılıma kapalı." }, { status: 400 });
    }

    // 3. ALGORİTMA KONTROLÜ: %20 Tek Alıcı Limiti (KURAL 3)
    const maksAlim = Math.floor(ilan.hedefSayi * 0.20);
    
    if (Number(adet) > maksAlim) {
      return NextResponse.json({ 
        error: `Tek seferde maksimum ${maksAlim} adet alabilirsiniz (Stok limitinin %20'si).` 
      }, { status: 400 });
    }

    // 4. VERİTABANI İŞLEMİ (TRANSACTION)
    // Ya hepsi kaydedilir ya hiçbiri!
    const result = await prisma.$transaction(async (tx) => {
      
      // A. Katılım kaydını oluştur (Şemadaki yeni alanlarla birlikte)
      const yeniKatilim = await tx.participant.create({
        data: {
          kullaniciId: userId,
          ilanId: Number(ilanId),
          baremId: Number(baremId),
          talepMiktari: Number(adet),
          adresId: adresId, // Seçilen teslimat adresi mühürlendi
          durum: "PENDING", // Ödeme onayı gelene kadar beklemede
          // Barem fiyatını ve kapora miktarını şemaya göre hesaplayıp ekle
          secilenBaremFiyat: ilan.baremler.find(b => b.id === Number(baremId))?.fiyat || 0,
          kaporaMiktari: (ilan.baremler.find(b => b.id === Number(baremId))?.fiyat || 0) * Number(adet) * (ilan.depozitoOrani / 100)
        }
      });

      // B. İlandaki mevcut talebi güncelle (INCREMENT)
      const guncelIlan = await tx.listing.update({
        where: { id: Number(ilanId) },
        data: {
          mevcutTalep: { increment: Number(adet) }
        }
      });

      return { yeniKatilim, guncelIlan };
    });

    // 5. 🚀 PUSHER: ANLIK DUYURU
    // Tüm tarayıcılardaki BaremBar'lar aynı anda güncellensin
    await pusherServer.trigger(`ilan-${ilanId}`, 'talep-guncellendi', {
      yeniTalep: result.guncelIlan.mevcutTalep
    });

    return NextResponse.json({ 
      success: true, 
      katilimId: result.yeniKatilim.id,
      mevcutTalep: result.guncelIlan.mevcutTalep 
    });

  } catch (error: any) {
    console.error("❌ MINGAX Katılım Hatası:", error);
    return NextResponse.json({ error: "Sistem hatası oluştu." }, { status: 500 });
  }
}