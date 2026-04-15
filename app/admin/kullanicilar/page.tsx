import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import KullanicilarClient from "./KullanicilarClient";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function KullanicilarPage() {
  // 1. GÜVENLİK: Sadece admin yetkisi olanlar bu sayfayı görebilir
  const session = await auth();
  if (!session?.user?.isAdmin) {
    redirect("/");
  }

  // 2. VERİ ÇEKME: Tüm kullanıcıları ve onlara bağlı belgeleri çekiyoruz
  const users = await prisma.user.findMany({
    include: {
      adresler: true,
      belgeler: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // 📊 3. İSTATİSTİKLER: Admin paneli üstündeki özet kartlar için hesaplama
  const stats = {
    toplam: users.length,
    alicilar: users.filter((u) => u.hesapTuru === "ALICI").length,
    saticilar: users.filter((u) => u.hesapTuru === "SATICI").length,
    onayBekleyenSaticilar: users.filter(
      (u) => u.hesapTuru === "SATICI" && u.onayDurumu === "PENDING"
    ).length,
  };

  // --- SERVER ACTIONS (Sunucu Tarafı İşlemleri) ---

  async function toggleAdminAction(userId: number, currentStatus: boolean) {
    "use server";
    await prisma.user.update({
      where: { id: userId },
      data: { isAdmin: !currentStatus },
    });
    revalidatePath("/admin/kullanicilar");
  }

  async function deleteUserAction(userId: number) {
    "use server";
    await prisma.user.delete({
      where: { id: userId },
    });
    revalidatePath("/admin/kullanicilar");
  }

  async function updateUserStatusAction(userId: number, status: any, level: any) {
    "use server";
    await prisma.user.update({
      where: { id: userId },
      data: { 
        onayDurumu: status, 
        tedarikciSeviye: level
        // Not: onayliTedarikci alanı şemadan kaldırıldığı için buraya eklemiyoruz.
      },
    });
    revalidatePath("/admin/kullanicilar");
  }

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <KullanicilarClient 
        // JSON serileştirme ile TypeScript'in karmaşık tip hatalarını (Date objeleri vb.) önlüyoruz
        initialUsers={JSON.parse(JSON.stringify(users))} 
        stats={stats} // 👈 Yeni hesapladığımız istatistikleri gönderdik
        toggleAdminAction={toggleAdminAction}
        deleteUserAction={deleteUserAction}
        updateUserStatusAction={updateUserStatusAction}
      />
    </div>
  );
}