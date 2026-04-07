import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import KullanicilarClient from "./KullanicilarClient";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function KullanicilarPage() {
  // 1. GÜVENLİK: Sadece adminler girebilsin
  const session = await auth();
  if (!session?.user?.isAdmin) {
    redirect("/");
  }

  // 2. VERİ ÇEKME
  const users = await prisma.user.findMany({
    include: {
      adresler: true,
      belgeler: true,
    },
    orderBy: { createdAt: "desc" },
  });

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

  // KRİTİK DÜZELTME: onayliTedarikci alanını sildik, o yüzden data kısmından çıkardım
  async function updateUserStatusAction(userId: number, status: any, level: any) {
    "use server";
    await prisma.user.update({
      where: { id: userId },
      data: { 
        onayDurumu: status, 
        tedarikciSeviye: level
        // onayliTedarikci SİLİNDİ, buraya yazarsan hata verir
      },
    });
    revalidatePath("/admin/kullanicilar");
  }

  return (
    <div className="p-8">
      <KullanicilarClient 
        // 'as any' ile zorlayarak TypeScript'in tip uyuşmazlığı hatasını susturuyoruz
        initialUsers={JSON.parse(JSON.stringify(users)) as any} 
        toggleAdminAction={toggleAdminAction}
        deleteUserAction={deleteUserAction}
        updateUserStatusAction={updateUserStatusAction}
      />
    </div>
  );
}