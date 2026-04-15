"use server"
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function saveDocumentsAction(documents: { tip: any, url: string }[]) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Oturum açmanız gerekiyor." };

  try {
    // 1. Belgeleri toplu halde Document tablosuna ekle
    await prisma.document.createMany({
      data: documents.map(doc => ({
        userId: Number(session.user.id),
        tip: doc.tip,
        fileUrl: doc.url,
        durum: "WAITING"
      }))
    });

    // 2. Kullanıcının durumunu PENDING (Onay Bekliyor) yap
    await prisma.user.update({
      where: { id: Number(session.user.id) },
      data: { onayDurumu: "PENDING" }
    });

    revalidatePath("/profil/dogrulama");
    return { success: true };
  } catch (error) {
    console.error("Belge kayıt hatası:", error);
    return { success: false, error: "Belgeler kaydedilirken bir hata oluştu." };
  }
}