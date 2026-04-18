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
        
        // 🚀 BUILD HATASI KİLİDİ: 
        // Şemada zorunlu olan hedefSayi alanını buraya ekledik.
        hedefSayi: parseInt(data.hedefSayi), 
        
        // 📂 KATEGORİ: Google Taksonomi ID'si
        categoryId: parseInt(data.kategori), 
        
        perakendeFiyat: parseFloat(data.perakendeFiyat),
        // 💰 İlanın genel toptan fiyatı (opsiyonel ama tutarlılık için ilk barem fiyatı)
        toptanFiyat: parseFloat(data.toptanFiyat), 
        
        bitisTarihi: new Date(data.bitisTarihi),
        saticiId: Number(session.user.id),
        durum: "PENDING",

        // 📊 BAREM SİSTEMİ: 
        baremler: {
          create: [
            {
              sira: 1,
              miktar: parseInt(data.hedefSayi),
              fiyat: parseFloat(data.toptanFiyat),
            }
          ]
        },
        
        // 🖼️ ÇOKLU GÖRSEL
        images: {
          create: data.images?.map((url: string) => ({ url })) || []
        },
        
        // 📄 ÇOKLU BELGE
        documents: {
          create: data.documents?.map((doc: any) => ({
            url: doc.url,
            name: doc.name
          })) || []
        }
      }
    });

    // 🔄 Önbellekleri tazeliyoruz
    revalidatePath("/admin/ilanlar");
    revalidatePath("/"); 
    
    return { success: true, id: newListing.id };

  } catch (error) {
    console.error("İlan oluşturma hatası:", error);
    return { success: false, error: "İlan mühürlenirken bir hata oluştu." };
  }
}