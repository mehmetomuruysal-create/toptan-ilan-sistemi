import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import KatilimFormu from "./KatilimFormu";

export default async function KatilPage({ params }: { params: Promise<{ baremId: string }> }) {
  const session = await auth();
  if (!session) redirect("/giris");

  const { baremId } = await params;

  // 1. 🚀 VERİ ÇEKME VE İLİŞKİLER
  const barem = await prisma.barem.findUnique({
    where: { id: parseInt(baremId) },
    include: {
      listing: {
        include: { satici: true }
      }
    }
  });

  if (!barem) notFound();

  const ilan = barem.listing;

  // 2. 🛡️ GÜVENLİK MÜHRÜ: İlan aktif mi?
  // İlan kapandıysa veya stok dolduysa katılım sayfasına girişi engelle
  if (ilan.durum !== "ACTIVE") {
    redirect(`/ilan/${ilan.id}?error=closed`);
  }

  // 3. 🛡️ GÜVENLİK MÜHRÜ: Bitiş tarihi geçti mi?
  if (new Date(ilan.bitisTarihi) < new Date()) {
    redirect(`/ilan/${ilan.id}?error=expired`);
  }

  // 4. 📊 ALGORİTMA MÜHRÜ: %20 Tek Alıcı Limiti Hesabı (KURAL 3)
  // Alıcının alabileceği maksimum adet = Toplam Stokun %20'si
  const tekAliciMaksLimit = Math.floor(ilan.hedefSayi * 0.20);

  // 5. 🏠 ADRESLER
  const adresler = await prisma.address.findMany({
    where: { user: { email: session.user?.email! } }
  });

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Başlık Bölümü (Opsiyonel ama şık durur) */}
        <div className="mb-8 text-center">
            <h1 className="text-sm font-black uppercase italic tracking-[0.3em] text-blue-600 mb-2">Grup Alımına Katıl</h1>
            <p className="text-2xl font-black text-gray-900 uppercase tracking-tighter">{ilan.baslik}</p>
        </div>

        <KatilimFormu 
          barem={barem} 
          ilan={ilan} 
          adresler={adresler}
          saticiId={ilan.saticiId} // Formun beklediği saticiId
          tekAliciMaksLimit={tekAliciMaksLimit} // Algoritma kuralı
        />
      </div>
    </main>
  );
}