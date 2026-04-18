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

    // Veri tipi güvenliği (Undefined kontrolü)
    if (!ilanId || !baremId || !adet) {
      return NextResponse.json({ error: "Eksik veri gönderildi." }, { status: 400 });
    }

    // 2. İLAN VE BAREM GEÇERLİLİK KONTROLÜ
    const ilan = await prisma.listing.findUnique({
      where: { id: Number(ilanId) },
      include: { baremler: true }
    });

    if (!ilan) {
      return NextResponse.json({ error: "İlan bulunamadı." }, { status: 404 });
    }

    if (ilan.durum !== "ACTIVE") {
      return NextResponse.json({ error: "Bu ilan şu an katılıma kapalı." }, { status: 400 });
    }

    // 3. ALGORİTMA KONTROLÜ: %20 Tek Alıcı Limiti (KURAL 3)
    const talepAdedi = Number(adet);
    const maksAlim = Math.floor(ilan.hedefSayi * 0.20);
    
    if (talepAdedi > maksAlim) {
      return NextResponse.json({ 
        error: `Tek seferde maksimum ${maksAlim} adet alabilirsiniz (Stok limitinin %20'si).` 
      }, { status: 400 });
    }

    // 4. VERİTABANI İŞLEMİ (TRANSACTION)
    const result = await prisma.$transaction(async (tx) => {
      
      const secilenBarem = ilan.baremler.find(b => b.id === Number(baremId));
      if (!secilenBarem) throw new Error("Geçersiz barem seçimi.");

      const birimFiyat = secilenBarem.fiyat;
      const kaporaOrani = ilan.depozitoOrani / 100;

      // A. Katılım kaydını oluştur
      const yeniKatilim = await tx.participant.create({
        data: {
          kullaniciId: userId,
          ilanId: Number(ilanId),
          baremId: Number(baremId),
          talepMiktari: talepAdedi,
          adresId: adresId ? String(adresId) : null,
          durum: "PENDING",
          secilenBaremFiyat: birimFiyat,
          kaporaMiktari: birimFiyat * talepAdedi * kaporaOrani
        }
      });

      // B. İlandaki mevcut talebi güncelle (INCREMENT)
      const guncelIlan = await tx.listing.update({
        where: { id: Number(ilanId) },
        data: {
          mevcutTalep: { increment: talepAdedi }
        }
      });

      return { yeniKatilim, guncelIlan };
    });

    // 5. 🚀 PUSHER: ANLIK DUYURU
    // Build sırasında patlamaması için pusherServer'ın varlığını kontrol ediyoruz
    if (pusherServer) {
      try {
        await pusherServer.trigger(`ilan-${ilanId}`, 'talep-guncellendi', {
          yeniTalep: result.guncelIlan.mevcutTalep
        });
      } catch (pError) {
        console.error("⚠️ Pusher tetikleme hatası (İşlem devam ediyor):", pError);
        // Pusher hatası olsa bile veritabanı kaydı başarılı olduğu için kullanıcıya hata dönmüyoruz
      }
    }

    return NextResponse.json({ 
      success: true, 
      katilimId: result.yeniKatilim.id,
      mevcutTalep: result.guncelIlan.mevcutTalep 
    });

  } catch (error: any) {
    console.error("❌ MINGAX Katılım Hatası:", error);
    return NextResponse.json({ 
      error: error.message || "Sistem hatası oluştu." 
    }, { status: 500 });
  }
}