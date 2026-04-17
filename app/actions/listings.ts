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
        
        // 🚀 BUILD HATASI ÇÖZÜMÜ: 'kategori' -> 'categoryId'
        // Formdan gelen string ID'yi Int'e çeviriyoruz
        categoryId: parseInt(data.kategori), 
        
        perakendeFiyat: parseFloat(data.perakendeFiyat),
        bitisTarihi: new Date(data.bitisTarihi),
        saticiId: Number(session.user.id),
        durum: "PENDING",

        // 💰 BAREM SİSTEMİ: 
        // Toptan fiyat ve hedef adet 'baremler' tablosuna ilk barem olarak eklenir
        baremler: {
          create: [
            {
              sira: 1,
              miktar: parseInt(data.hedefSayi),
              fiyat: parseFloat(data.toptanFiyat),
            }
          ]
        },
        
        // 🖼️ ÇOKLU GÖRSEL: Hiçbir kod eksiltilmedi
        images: {
          create: data.images.map((url: string) => ({ url }))
        },
        
        // 📄 ÇOKLU BELGE: Hiçbir kod eksiltilmedi
        documents: {
          create: data.documents.map((doc: any) => ({
            url: doc.url,
            name: doc.name
          }))
        }
      }
    });

    revalidatePath("/admin/ilanlar");
    revalidatePath("/"); // Ana sayfa vitrini için
    return { success: true, id: newListing.id };

  } catch (error) {
    console.error("İlan oluşturma hatası:", error);
    return { success: false, error: "İlan kaydedilirken bir hata oluştu." };
  }
}