"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

/**
 * Yeni adres ekleme fonksiyonu - Tüm ticari ve bireysel alanlar dahil
 */
export async function adresEkle(data: {
  baslik: string
  teslimAlacakKisi: string
  telefon: string
  il: string
  ilce: string
  mahalle?: string
  adresSatiri: string
  postaKodu?: string
  isVarsayilanTeslimat?: boolean
  isVarsayilanFatura?: boolean
  faturaTuru: "BIREYSEL" | "KURUMSAL"
  tcKimlik?: string
  firmaAdi?: string
  vergiDairesi?: string
  vergiNo?: string
}) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return { success: false, error: "Oturum açmanız gerekiyor." }
    }

    // Kullanıcıyı bulup gerçek ID'sini alıyoruz
    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!dbUser) {
      return { success: false, error: "Kullanıcı kaydı bulunamadı." }
    }

    const userId = dbUser.id

    // 🔄 Varsayılan Teslimat Adresi Mantığı
    if (data.isVarsayilanTeslimat) {
      await prisma.address.updateMany({
        where: { userId, isVarsayilanTeslimat: true },
        data: { isVarsayilanTeslimat: false }
      })
    }

    // 🔄 Varsayılan Fatura Adresi Mantığı (Build hatasına neden olan kısım - Şemada olmalı!)
    if (data.isVarsayilanFatura) {
      await prisma.address.updateMany({
        where: { userId, isVarsayilanFatura: true },
        data: { isVarsayilanFatura: false }
      })
    }

    // 📝 Adres Kaydı - Hiçbir alan eksiltilmedi
    const yeniAdres = await prisma.address.create({
      data: {
        userId,
        baslik: data.baslik,
        teslimAlacakKisi: data.teslimAlacakKisi,
        telefon: data.telefon,
        il: data.il,
        ilce: data.ilce,
        mahalle: data.mahalle,
        adresSatiri: data.adresSatiri,
        postaKodu: data.postaKodu,
        isVarsayilanTeslimat: data.isVarsayilanTeslimat ?? false,
        isVarsayilanFatura: data.isVarsayilanFatura ?? false,
        faturaTuru: data.faturaTuru,
        // Bireysel/Kurumsal ayrımına göre verileri mühürle
        tcKimlik: data.faturaTuru === "BIREYSEL" ? data.tcKimlik : null,
        firmaAdi: data.faturaTuru === "KURUMSAL" ? data.firmaAdi : null,
        vergiDairesi: data.faturaTuru === "KURUMSAL" ? data.vergiDairesi : null,
        vergiNo: data.faturaTuru === "KURUMSAL" ? data.vergiNo : null,
      }
    })

    // UI'ı anında güncelle
    revalidatePath("/adreslerim")
    return { success: true, adres: yeniAdres }

  } catch (error) {
    console.error("Adres ekleme hatası:", error)
    return { success: false, error: "Sistemsel bir hata oluştu." }
  }
}

/**
 * Adres silme fonksiyonu - Güvenlik mühürlü
 */
export async function adresSil(addressId: string) {
  try {
    const session = await auth()
    if (!session?.user?.email) return { success: false, error: "Yetkiniz yok." }

    // Silme işleminde kullanıcı doğrulaması yaparak güvenliği mühürle
    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!dbUser) return { success: false, error: "Kullanıcı bulunamadı." }

    await prisma.address.delete({
      where: { 
        id: addressId,
        userId: dbUser.id 
      }
    })

    revalidatePath("/adreslerim")
    return { success: true }
  } catch (error) {
    console.error("Adres silme hatası:", error)
    return { success: false, error: "Adres silinemedi." }
  }
}