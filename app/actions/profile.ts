"use server"

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function updateProfileAction(formData: any) {
  const session = await auth();
  if (!session?.user?.email) return { success: false, error: "Yetkisiz işlem" };

  try {
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        ad: formData.ad,
        soyad: formData.soyad,
        telefon: formData.telefon,
        
        // 🔹 ALICI ise teslimat adresini güncelle
        ...(formData.hesapTuru === "ALICI" && {
          teslimatAdresi: formData.teslimatAdresi,
        }),

        // 🔹 SATICI ise firma bilgilerini güncelle
        ...(formData.hesapTuru === "SATICI" && {
          firmaAdi: formData.firmaAdi,
          vergiNo: formData.vergiNo,
          vergiDairesi: formData.vergiDairesi,
        })
      }
    });

    revalidatePath("/profil");
    return { success: true };
  } catch (error) {
    console.error("Profil güncelleme hatası:", error);
    return { success: false, error: "Güncelleme sırasında bir hata oluştu." };
  }
}