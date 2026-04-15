"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache" // 👈 UI'ın anında güncellenmesi için gerekli

/**
 * Yeni adres ekleme fonksiyonu
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

    // Varsayılan adres mantığını yönetme (Eğer bu adres varsayılan seçildiyse eskileri sıfırla)
    if (data.isVarsayilanTeslimat) {
      await prisma.address.updateMany({
        where: { userId, isVarsayilanTeslimat: true },
        data: { isVarsayilanTeslimat: false }
      })
    }
    if (data.isVarsayilanFatura) {
      await prisma.address.updateMany({
        where: { userId, isVarsayilanFatura: true },
        data: { isVarsayilanFatura: false }
      })
    }

    // Adres Kaydı
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
        tcKimlik: data.faturaTuru === "BIREYSEL" ? data.tcKimlik : null,
        firmaAdi: data.faturaTuru === "KURUMSAL" ? data.firmaAdi : null,
        vergiDairesi: data.faturaTuru === "KURUMSAL" ? data.vergiDairesi : null,
        vergiNo: data.faturaTuru === "KURUMSAL" ? data.vergiNo : null,
      }
    })

    // Adreslerim sayfasını tazele
    revalidatePath("/adreslerim")
    return { success: true, adres: yeniAdres }

  } catch (error) {
    console.error("Adres ekleme hatası:", error)
    return { success: false, error: "Sistemsel bir hata oluştu." }
  }
}

/**
 * Adres silme fonksiyonu
 */
export async function adresSil(addressId: string) {
  try {
    const session = await auth()
    if (!session) return { success: false, error: "Yetkiniz yok." }

    await prisma.address.delete({
      where: { id: addressId }
    })

    revalidatePath("/adreslerim")
    return { success: true }
  } catch (error) {
    console.error("Adres silme hatası:", error)
    return { success: false, error: "Adres silinemedi." }
  }
}