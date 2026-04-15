import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ProfileForm from "@/components/ProfileForm";

export default async function ProfilPage() {
  const session = await auth();

  // 1. GÜVENLİK: Oturum yoksa ana sayfaya at
  if (!session?.user?.email) {
    redirect("/");
  }

  // 2. VERİ ÇEKME: Kullanıcıyı ve varsayılan adresini çekiyoruz
  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      adresler: {
        where: { isVarsayilanTeslimat: true },
        take: 1
      }
    }
  });

  if (!dbUser) return <div>Kullanıcı bulunamadı.</div>;

  // 3. ADRES FORMATLAMA: Adres tablosundan varsayılanı metne çevir
  const defaultAddress = dbUser.adresler[0];
  const addressString = defaultAddress 
    ? `${defaultAddress.baslik}: ${defaultAddress.adresSatiri} ${defaultAddress.ilce} / ${defaultAddress.il.toUpperCase()}`
    : "";

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic">Profil Bilgilerim</h1>
          <p className="text-gray-500 font-medium italic">Hesap ve iletişim tercihlerinizi buradan güncel tutabilirsiniz.</p>
        </div>

        {/* Bileşeni Çağırıyoruz */}
        <ProfileForm 
          user={JSON.parse(JSON.stringify(dbUser))} 
          defaultAddressText={addressString} 
        />
      </div>
    </div>
  );
}