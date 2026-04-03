import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.email) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 })
  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 })
  const data = await req.json()
  // Aynı adresEkle mantığı
  if (data.isVarsayilanTeslimat) {
    await prisma.address.updateMany({ where: { userId: user.id, isVarsayilanTeslimat: true }, data: { isVarsayilanTeslimat: false } })
  }
  if (data.isVarsayilanFatura) {
    await prisma.address.updateMany({ where: { userId: user.id, isVarsayilanFatura: true }, data: { isVarsayilanFatura: false } })
  }
  const newAddress = await prisma.address.create({
    data: {
      userId: user.id,
      baslik: data.baslik,
      teslimAlacakKisi: data.teslimAlacakKisi,
      telefon: data.telefon,
      il: data.il,
      ilce: data.ilce,
      mahalle: data.mahalle,
      adresSatiri: data.adresSatiri,
      postaKodu: data.postaKodu,
      isVarsayilanTeslimat: data.isVarsayilanTeslimat || false,
      isVarsayilanFatura: data.isVarsayilanFatura || false,
      faturaTuru: data.faturaTuru,
      tcKimlik: data.faturaTuru === "BIREYSEL" ? data.tcKimlik : null,
      firmaAdi: data.faturaTuru === "KURUMSAL" ? data.firmaAdi : null,
      vergiDairesi: data.faturaTuru === "KURUMSAL" ? data.vergiDairesi : null,
      vergiNo: data.faturaTuru === "KURUMSAL" ? data.vergiNo : null,
    }
  })
  return NextResponse.json({ success: true, address: newAddress })
}