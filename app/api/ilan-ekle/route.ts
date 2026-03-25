import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function POST(req: Request) {
  const session = await auth()

  if (!session || (session.user as any)?.rol !== "satici") {
    return NextResponse.json({ hata: "Yetkisiz erişim" }, { status: 401 })
  }

  const body = await req.json()
  const {
    baslik, aciklama, urunUrl, kategori,
    perakendeFiyat, toptanFiyat, hedefSayi,
    hedefKitle, minMiktarBireysel, minMiktarKobi, minMiktarKurumsal,
    bitisTarihi, teslimatYontemi, indirimOrani, depozitoOrani
  } = body

  if (!baslik || !perakendeFiyat || !toptanFiyat || !hedefSayi || !bitisTarihi) {
    return NextResponse.json({ hata: "Zorunlu alanlar eksik" }, { status: 400 })
  }

  if (toptanFiyat >= perakendeFiyat) {
    return NextResponse.json({ hata: "Toptan fiyat perakende fiyattan düşük olmalı" }, { status: 400 })
  }

  const kullanici = await prisma.user.findUnique({
    where: { email: session.user!.email! }
  })

  if (!kullanici) {
    return NextResponse.json({ hata: "Kullanıcı bulunamadı" }, { status: 404 })
  }

  const ilan = await prisma.listing.create({
    data: {
      baslik, aciklama, urunUrl, kategori,
      perakendeFiyat, toptanFiyat, hedefSayi,
      hedefKitle, minMiktarBireysel, minMiktarKobi, minMiktarKurumsal,
      bitisTarihi: new Date(bitisTarihi),
      teslimatYontemi, indirimOrani, depozitoOrani,
      saticiId: kullanici.id,
    }
  })

  return NextResponse.json({ mesaj: "İlan eklendi", ilan }, { status: 201 })
}