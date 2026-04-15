"use server"
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function createListingAction(data: any) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Yetkisiz işlem." };

  try {
    const newListing = await prisma.listing.create({
      data: {
        baslik: data.baslik,
        aciklama: data.aciklama,
        kategori: data.kategori,
        perakendeFiyat: parseFloat(data.perakendeFiyat),
        toptanFiyat: parseFloat(data.toptanFiyat),
        hedefSayi: parseInt(data.hedefSayi),
        bitisTarihi: new Date(data.bitisTarihi),
        saticiId: Number(session.user.id),
        durum: "PENDING", // Otomatik beklemede başlar
        
        // Çoklu Görsel Ekleme
        images: {
          create: data.images.map((url: string) => ({ url }))
        },
        
        // Çoklu Belge Ekleme
        documents: {
          create: data.documents.map((doc: any) => ({
            url: doc.url,
            name: doc.name
          }))
        }
      }
    });

    revalidatePath("/admin/ilanlar");
    return { success: true, id: newListing.id };
  } catch (error) {
    console.error("İlan oluşturma hatası:", error);
    return { success: false, error: "İlan kaydedilirken bir hata oluştu." };
  }
}