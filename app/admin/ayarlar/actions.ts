"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function updateRatios(data: {
  targetId?: number; 
  type: "global" | "special";
  totalComm: number;
  initRatio: number;
  refRatio: number;
}) {
  try {
    // 1. ANAYASA KURALI: Sayısal Güvenlik
    // Gelen verilerin sayı olduğundan emin olalım (Bazen formdan string gelebilir)
    const comm = Number(data.totalComm);
    const init = Number(data.initRatio);
    const ref  = Number(data.refRatio);

    // 2. MİNGAX NET HESABI (Operasyonel Kâr)
    const mingaxNet = Number((comm - (init + ref)).toFixed(2));

    // 🚀 GÜVENLİK DUVARI: Mingax asla zarar etmemeli
    if (mingaxNet < 0) {
      return { 
        success: false, 
        message: "HATA: Dağıtılan puanlar toplam komisyondan fazla olamaz! Mingax zarar edemez." 
      };
    }

    if (data.type === "global") {
      // 🌍 GLOBAL SİSTEM AYARLARINI MÜHÜRLE
      await prisma.systemSettings.upsert({
        where: { id: 1 },
        update: {
          defaultTotalComm: comm,
          defaultInitRatio: init,
          defaultRefRatio: ref,
          defaultMingaxNet: mingaxNet
        },
        create: {
          id: 1,
          defaultTotalComm: comm,
          defaultInitRatio: init,
          defaultRefRatio: ref,
          defaultMingaxNet: mingaxNet
        }
      });
    } else if (data.type === "special" && data.targetId) {
      // 📂 KATEGORİ BAZLI ÖZEL AYARLARI GÜNCELLE
      await prisma.category.update({
        where: { id: data.targetId },
        data: {
          commRatio: comm,
          initRatio: init,
          refRatio: ref
        }
      });
    }

    // 🔄 ÖNBELLEK TEMİZLEME
    // Hem ayarlar sayfasını hem de tüm siteyi (ilan fiyatlarını etkileyeceği için) tazeliyoruz
    revalidatePath("/admin/ayarlar");
    revalidatePath("/"); 
    revalidatePath("/ilan/[id]", "page"); // İlan detaylarındaki hesaplamalar için
    
    return { 
      success: true, 
      message: `${data.type === "global" ? "Sistem" : "Kategori"} oranları başarıyla mühürlendi!` 
    };

  } catch (error) {
    console.error("MİNGEX_FINANCE_ERROR:", error);
    return { 
      success: false, 
      message: "Veritabanı mühürleme işlemi başarısız oldu." 
    };
  }
}