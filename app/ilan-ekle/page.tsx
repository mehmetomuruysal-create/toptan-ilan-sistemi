import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import BelgeOnayModal from "@/components/BelgeOnayModal";
import { PlusCircle } from "lucide-react";

export default async function IlanEklePage() {
  // 1. OTURUM KONTROLÜ: Kullanıcı giriş yapmış mı?
  const session = await auth();

  if (!session || !session.user?.email) {
    redirect("/giris?callbackUrl=/ilan-ekle");
  }

  // 2. VERİTABANI KONTROLÜ: Tek merkezden (onayDurumu) sorgu yapıyoruz
  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      onayDurumu: true, // "PENDING", "APPROVED", "REJECTED"
      hesapTuru: true,
    },
  });

  // 3. ROL KONTROLÜ: Satıcı değilse direkt ana sayfaya gönder
  if (dbUser?.hesapTuru !== "SATICI") {
    redirect("/");
  }

  // 4. GÜVENLİK DUVARI: Sadece "APPROVED" olanlar geçebilir
  if (dbUser?.onayDurumu !== "APPROVED") {
    return <BelgeOnayModal />;
  }

  // 5. BAŞARILI: Kullanıcı artık onaylıdır, ilan formunu gösteriyoruz
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-12 text-center md:text-left">
          <div className="inline-block bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4">
            Yetkili Tedarikçi Erişimi Onaylandı
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-gray-900 uppercase italic tracking-tighter leading-none">
            Yeni İlan <span className="text-blue-600">Oluştur</span>
          </h1>
        </div>
        
        <div className="bg-white rounded-[3.5rem] p-8 md:p-16 shadow-2xl shadow-blue-100/50 border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-[5rem] -mr-16 -mt-16 opacity-50"></div>
          
          <div className="relative z-10 py-20 text-center border-4 border-dashed border-gray-100 rounded-[3rem]">
            <div className="bg-blue-600 text-white w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl rotate-3">
               <PlusCircle size={40} />
            </div>
            <h2 className="text-2xl font-black text-gray-900 uppercase italic tracking-tight">İlan Formu Hazırlanıyor</h2>
            <p className="text-sm text-gray-400 mt-4 max-w-sm mx-auto font-medium leading-relaxed">
              Tebrikler Mehmet! Onay sürecini başarıyla geçtin. Artık Mingax topluluğu için en iyi fiyatları sunan ilanını oluşturabilirsin.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}