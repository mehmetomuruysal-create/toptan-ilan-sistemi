import { prisma } from "./prisma";
import { calculateMingaxDist } from "./calculations";

/**
 * MİNGAX KAPANIŞ VE ÖDÜL DAĞITIM SERVİSİ
 */
export async function closeListingAndDistribute(listingId: number) {
  return await prisma.$transaction(async (tx) => {
    // 1. İlanı, baremleri ve katılımcıları (davetçileriyle birlikte) çek
    const listing = await tx.listing.findUnique({
      where: { id: listingId },
      include: {
        baremler: {
          include: {
            katilimcilar: true,
          },
          orderBy: { miktar: "desc" }, // En yüksek baremden başla (Barem 3 -> 2 -> 1)
        },
      },
    });

    if (!listing) throw new Error("İlan bulunamadı.");
    if (listing.durum !== "ACTIVE") throw new Error("İlan zaten kapalı veya aktif değil.");

    // 2. Hangi barem doldu? (En yüksekten aşağı kontrol et)
    let kazananBarem = null;
    for (const barem of listing.baremler) {
      const toplamKatilim = barem.katilimcilar.reduce((sum, p) => sum + p.talepMiktari, 0);
      if (toplamKatilim >= barem.miktar) {
        kazananBarem = barem;
        break; // Hedeflenen en yüksek barem bulundu!
      }
    }

    // --- SENARYO A: HİÇBİR BAREM DOLMADI ---
    if (!kazananBarem) {
      await tx.listing.update({
        where: { id: listingId },
        data: { durum: "CANCELLED" },
      });
      // Not: Burada iade (refund) tetiklenebilir.
      return { success: false, message: "Hiçbir barem dolmadı, ilan iptal edildi." };
    }

    // --- SENARYO B: BAREM DOLDU, HESAPLAMA BAŞLIYOR ---
    const dist = await calculateMingaxDist(listingId, kazananBarem.fiyat);
    if (!dist) throw new Error("Finansal dağıtım hesaplanamadı.");

    const { initiatorPoints, referrerPool } = dist.amounts;
    const initiatorId = dist.recipients.initiatorId;

    // 3. BAŞLATAN (INITIATOR) ÖDÜLÜNÜ YATIR (%0.75)
    if (initiatorId) {
      await tx.user.update({
        where: { id: initiatorId },
        data: { pointsBalance: { increment: initiatorPoints } },
      });

      await tx.pointTransaction.create({
        data: {
          userId: initiatorId,
          amount: initiatorPoints,
          type: "INITIATOR",
          status: "APPROVED",
        },
      });
    }

    // 4. DAVET EDENLER (REFERRERS) ÖDÜLÜNÜ DAĞIT (%2.25)
    // Davet yoluyla gelen toplam katılım adedini bul
    const referansliKatilimcilar = kazananBarem.katilimcilar.filter(p => p.referrerId !== null);
    const toplamReferansliAdet = referansliKatilimcilar.reduce((sum, p) => sum + p.talepMiktari, 0);

    if (toplamReferansliAdet > 0 && referrerPool > 0) {
      // Her davetçinin ne kadar pay alacağını "Proportionel" (Oranlı) hesapla
      for (const katilimci of referansliKatilimcilar) {
        if (!katilimci.referrerId) continue;

        // Kullanıcının payı = (Getirdiği Adet / Toplam Referans Adedi) * Toplam Havuz
        const kisiBasiPay = (katilimci.talepMiktari / toplamReferansliAdet) * referrerPool;

        await tx.user.update({
          where: { id: katilimci.referrerId },
          data: { pointsBalance: { increment: Number(kisiBasiPay.toFixed(4)) } },
        });

        await tx.pointTransaction.create({
          data: {
            userId: katilimci.referrerId,
            amount: Number(kisiBasiPay.toFixed(4)),
            type: "REFERRER",
            status: "APPROVED",
          },
        });
      }
    }

    // 5. İLANI VE KATILIMLARI GÜNCELLE
    await tx.listing.update({
      where: { id: listingId },
      data: { durum: "COMPLETED" },
    });

    await tx.participant.updateMany({
      where: { baremId: kazananBarem.id },
      data: { durum: "CONFIRMED" },
    });

    return { 
      success: true, 
      message: "İlan başarıyla kapandı, puanlar dağıtıldı.",
      kazananFiyat: kazananBarem.fiyat 
    };
  });
}