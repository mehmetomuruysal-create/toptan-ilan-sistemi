import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import BelgeOnayModal from "@/components/BelgeOnayModal";
import { PlusCircle, Clock } from "lucide-react";
import Link from "next/link"; // onClick yerine Link kullanıyoruz

export default async function IlanEklePage() {
  const session = await auth();

  if (!session || !session.user?.email || !session.user?.id) {
    redirect("/giris?callbackUrl=/ilan-ekle");
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { onayDurumu: true, hesapTuru: true },
  });

  if (dbUser?.hesapTuru !== "SATICI") {
    redirect("/");
  }

  const yuklenenBelgeSayisi = await prisma.document.count({
    where: { userId: Number(session.user.id) }
  });

  // 1. Durum: Kullanıcı belgeleri yüklemiş ama henüz onaylanmamış
  if (dbUser?.onayDurumu !== "APPROVED") {
    if (yuklenenBelgeSayisi >= 3) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-[2rem] shadow-xl p-10 text-center border border-gray-100">
            <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <Clock size={48} />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-3 tracking-tight uppercase">Belgeler İncelemede</h2>
            <p className="text-gray-500 font-medium leading-relaxed text-sm mb-8">
              Belgelerinizi başarıyla aldık. Yönetici onayının ardından ilan vermeye başlayabilirsiniz.
            </p>
            <Link 
              href="/" 
              className="block w-full bg-gray-900 text-white py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-black transition-colors"
            >
              Ana Sayfaya Dön
            </Link>
          </div>
        </div>
      );
    }

    // 2. Durum: Belge yüklemesi gereken kullanıcı (Modal'ı göster)
    return <BelgeOnayModal userId={Number(session.user.id)} />;
  }

  // 3. Durum: Tamamen onaylı kullanıcı (İlan formunu göster)
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-12 text-center md:text-left">
          <div className="inline-block bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4">
            Onaylı Tedarikçi Erişimi
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-gray-900 uppercase italic tracking-tighter leading-none">
            Yeni İlan <span className="text-blue-600">Oluştur</span>
          </h1>
        </div>
        
        <div className="bg-white rounded-[3.5rem] p-16 shadow-2xl shadow-blue-100/50 border border-gray-100">
           <div className="relative z-10 py-20 text-center border-4 border-dashed border-gray-100 rounded-[3rem]">
            <div className="bg-blue-600 text-white w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl rotate-3">
               <PlusCircle size={40} />
            </div>
            <h2 className="text-2xl font-black text-gray-900 uppercase italic tracking-tight">İlan Formu Hazırlanıyor</h2>
            <p className="text-sm text-gray-400 mt-4 max-w-sm mx-auto font-medium">
              Onay sürecini başarıyla geçtiniz. Artık Mingax topluluğu için ilanlarınızı oluşturabilirsiniz.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}