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
    
    // 1. GÜVENLİK: Session kontrolü
    if (!session?.user?.email) {
      return { success: false, error: "Oturum açmanız gerekiyor." }
    }

    // 2. KESİN ÇÖZÜM: Kullanıcıyı e-posta ile DB'den bulup GERÇEK ID'sini alıyoruz
    const dbUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!dbUser) {
      return { success: false, error: "Kullanıcı kaydı bulunamadı." }
    }

    const userId = dbUser.id // Prisma'nın beklediği gerçek Int ID

    // Varsayılanları sıfırlama işlemleri
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

    // 3. ADRES KAYDI
    const yeniAdres = await prisma.address.create({
      data: {
        userId, // Artık hata vermesi imkansız çünkü DB'den aldık
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
    return { success: false, error: "Adres kaydedilirken veritabanı hatası oluştu." }
  }
}