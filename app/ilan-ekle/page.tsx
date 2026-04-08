import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
// DİKKAT: BelgeOnayModal yolunu kendi projene göre ayarla (örn: "@/app/components/BelgeOnayModal" veya "@/components/BelgeOnayModal")
import BelgeOnayModal from "@/components/BelgeOnayModal"; 
import { PlusCircle, Clock } from "lucide-react";

export default async function IlanEklePage() {
  // 1. OTURUM KONTROLÜ
  const session = await auth();

  // session.user.id kontrolünü de ekledik ki aşağıda hata almayalım
  if (!session || !session.user?.email || !session.user?.id) {
    redirect("/giris?callbackUrl=/ilan-ekle");
  }

  // 2. KULLANICI KONTROLÜ: Sadece onay durumunu ve rolünü çekiyoruz (documents sildik, kırmızı hata bitti!)
  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      onayDurumu: true, 
      hesapTuru: true,
    },
  });

  // 3. ROL KONTROLÜ
  if (dbUser?.hesapTuru !== "SATICI") {
    redirect("/");
  }

  // 4. YENİ ÇÖZÜM: Document tablosundan doğrudan bu kullanıcının belge sayısını sayıyoruz (count)
  const yuklenenBelgeSayisi = await prisma.document.count({
    where: {
      userId: Number(session.user.id) // Tıpkı upload API'sinde yaptığımız gibi Sayıya çevirdik
    }
  });

  // 5. GÜVENLİK DUVARI: Yönetici onayından geçmemişse...
  if (dbUser?.onayDurumu !== "APPROVED") {
    
    // Yüklenen belge sayısı 3 veya daha fazlaysa İncelemede ekranı ver
    if (yuklenenBelgeSayisi >= 3) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-[2rem] shadow-xl p-10 text-center border border-gray-100">
            <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <Clock size={48} />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">Belgeleriniz İncelemede</h2>
            <p className="text-gray-500 font-medium leading-relaxed text-sm mb-8">
              Tebrikler! Kurumsal belgelerinizi başarıyla sisteme yüklediniz. Yönetici onayının ardından bu sayfadan ilan vermeye başlayabilirsiniz.
            </p>
            <button onClick={() => window.location.assign("/")} className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-black transition-colors shadow-lg">
              Ana Sayfaya Dön
            </button>
          </div>
        </div>
      );
    }

    // Eğer 3 belgeyi henüz tamamlamadıysa modalı göster
    return <BelgeOnayModal />;
  }

  // 6. BAŞARILI: Yönetici onayladıysa İlan Formunu göster
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