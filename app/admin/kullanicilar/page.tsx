import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import KullanicilarClient from "./KullanicilarClient";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function KullanicilarPage({ 
  searchParams 
}: { 
  searchParams: { filter?: string } 
}) {
  
  // 1. GÜVENLİK
  const session = await auth();
  if (!session?.user?.isAdmin) {
    redirect("/");
  }

  // 2. VERİ ÇEKME (Prisma Şemasına Tam Sadık)
  const allUsers = await prisma.user.findMany({
    include: {
      adresler: true,
      belgeler: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // 📊 3. İSTATİSTİKLER (Client Component'in beklediği isimlerle mühürlendi)
  const stats = {
    toplam: allUsers.length,
    alicilar: allUsers.filter((u) => u.hesapTuru === "ALICI").length,
    saticilar: allUsers.filter((u) => u.hesapTuru === "SATICI").length,
    onayBekleyenSaticilar: allUsers.filter(
      (u) => u.hesapTuru === "SATICI" && u.onayDurumu === "PENDING"
    ).length,
  };

  // 🔍 4. FİLTRELEME MANTIĞI
  // URL'de ?filter=pending varsa sadece onay bekleyenleri listele
  const filteredUsers = searchParams.filter === "pending" 
    ? allUsers.filter(u => u.onayDurumu === "PENDING")
    : allUsers;

  // --- SERVER ACTIONS ---

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
      },
    });
    revalidatePath("/admin/kullanicilar");
  }

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      {/* 🚀 BAŞLIK: Operasyon Merkezi Stili */}
      <div className="mb-10">
        <h1 className="text-5xl font-black italic uppercase tracking-tighter text-gray-900 leading-none">
          Yönetim <span className="text-blue-600">Paneli</span>
        </h1>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] mt-3 ml-1 italic">
          Kullanıcı yetkileri ve tedarikçi onaylarını buradan yönetin
        </p>
      </div>

      <KullanicilarClient 
        // 🧱 Verileri Client'a mühürlüyoruz
        initialUsers={JSON.parse(JSON.stringify(filteredUsers))} 
        stats={stats} 
        activeFilter={searchParams.filter}
        toggleAdminAction={toggleAdminAction}
        deleteUserAction={deleteUserAction}
        updateUserStatusAction={updateUserStatusAction}
      />
    </div>
  );
}