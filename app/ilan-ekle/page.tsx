import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ListingForm from "@/components/ListingForm";
import BelgeOnayModal from "@/components/BelgeOnayModal";
import { Clock } from "lucide-react";
import Link from "next/link";

export default async function IlanEklePage() {
  const session = await auth();

  if (!session || !session.user?.id) {
    redirect("/giris?callbackUrl=/ilan-ekle");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: Number(session.user.id) },
    select: { onayDurumu: true, hesapTuru: true },
  });

  if (dbUser?.hesapTuru !== "SATICI") redirect("/");

  // 1. DURUM: ONAYLI KULLANICI -> FORMU GÖSTER
  if (dbUser?.onayDurumu === "APPROVED") {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-black uppercase italic mb-8">Yeni İlan <span className="text-blue-600">Oluştur</span></h1>
          <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl border border-gray-100">
            <IlanEkleForm saticiId={Number(session.user.id)} />
          </div>
        </div>
      </div>
    );
  }

  // 2. DURUM: ONAY BEKLEYEN KULLANICI
  const yuklenenBelgeSayisi = await prisma.document.count({
    where: { userId: Number(session.user.id) }
  });

  if (yuklenenBelgeSayisi >= 3) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-10 text-center border border-gray-100">
          <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6"><Clock size={40} /></div>
          <h2 className="text-2xl font-black text-gray-900 mb-3 uppercase italic">Belgeler İncelemede</h2>
          <p className="text-gray-500 font-medium text-sm mb-8">Yönetici onayından sonra ilan verebilirsiniz.</p>
          <Link href="/" className="block w-full bg-gray-900 text-white py-4 rounded-xl font-bold uppercase text-[10px]">Ana Sayfaya Dön</Link>
        </div>
      </div>
    );
  }

  // 3. DURUM: BELGE YÜKLEMEMİŞ KULLANICI
  return <BelgeOnayModal userId={Number(session.user.id)} />;
}