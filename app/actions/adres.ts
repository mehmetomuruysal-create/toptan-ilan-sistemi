"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

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
    if (!session?.user?.id) {
      return { success: false, error: "Oturum açmanız gerekiyor." }
    }

    const userId = parseInt(session.user.id)

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

    return { success: true, adres: yeniAdres }
  } catch (error) {
    console.error("Adres ekleme hatası:", error)
    return { success: false, error: "Adres kaydedilirken bir hata oluştu." }
  }
}