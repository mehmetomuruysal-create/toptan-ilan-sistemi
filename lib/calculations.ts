import { prisma } from "./prisma";

/**
 * Mingax Finansal Dağıtım Motoru
 * Kural: Tüm paylar Perakende Fiyat - Barem Fiyatı (Diff) üzerinden hesaplanır.
 * Hiyerarşi: İlan Özel Oranı > Kategori Oranı > Sistem Varsayılanı
 */
export async function calculateMingaxDist(listingId: number, baremPrice: number) {
  // 1. İlanı, Kategorisi ve Başlatan (Initiator) bilgisiyle çekiyoruz
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: { 
      category: true,
      initiator: true // Ödülün kime gideceğini bilmek için şart
    }
  });

  if (!listing) throw new Error("Hesaplama yapılacak ilan bulunamadı.");

  // 2. Sistem Varsayılanlarını Veritabanından Çek
  const systemSettings = await prisma.systemSettings.findFirst().catch(() => null);
  
  const defaults = {
    totalComm: systemSettings?.defaultTotalComm ?? 15.0, 
    initRatio: systemSettings?.defaultInitRatio ?? 0.75, 
    refRatio: systemSettings?.defaultRefRatio ?? 2.25    
  };

  // 3. Tasarruf Farkını Hesapla (Matematiksel motorun yakıtı bu farktır)
  const diff = listing.perakendeFiyat - baremPrice; 
  if (diff < 0) return null; // Fiyat perakendenin üstündeyse (hata durumu)

  // 4. Hiyerarşik Oran Belirleme
  // Komisyon Oranı (%): İlan > Kategori > Sistem
  const commRatio = listing.specialComm ?? listing.category?.commRatio ?? defaults.totalComm;
  
  // Başlatan Payı (%): İlan > Kategori > Sistem
  const initRatio = listing.specialInit ?? listing.category?.initRatio ?? defaults.initRatio;
  
  // Davet Payı (%): İlan > Kategori > Sistem
  const refRatio  = listing.specialRef  ?? listing.category?.refRatio  ?? defaults.refRatio;

  // 5. Matematiksel Dağıtım (TL Cinsinden)
  // Anayasa Maddesi: Diff üzerinden oranlama
  const totalComm = diff * (commRatio / 100);       
  const initiatorPoints = diff * (initRatio / 100); 
  const referrerPool = diff * (refRatio / 100);   // Bu bir "Havuz"dur, katılımcılara dağıtılacak
  
  // Mingax'a kalan net: Toplam komisyondan ödül puanları çıktıktan sonraki kar
  const mingaxNet = totalComm - (initiatorPoints + referrerPool);

  return {
    amounts: {
      totalCommission: Number(totalComm.toFixed(4)),        // Satıcıdan kesilen pay
      mingaxNet: Number(mingaxNet.toFixed(4)),              // Mingax'ın kasasına giren
      initiatorPoints: Number(initiatorPoints.toFixed(4)),   // Başlatanın (Initiator) kazancı
      referrerPool: Number(referrerPool.toFixed(4))          // Referansların (Referrer) toplam havuzu
    },
    recipients: {
      initiatorId: listing.initiatorId, // Ödülün mühürleneceği kullanıcı ID'si
    },
    ratios: {
      appliedComm: commRatio,
      appliedInit: initRatio,
      appliedRef: refRatio
    },
    meta: {
        retailPrice: listing.perakendeFiyat,
        baremPrice: baremPrice,
        savingMargin: diff // Tasarruf Farkı
    }
  };
}