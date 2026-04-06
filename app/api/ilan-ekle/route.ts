import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function POST(req: Request) {
  const session = await auth()

  if (!session || !session.user?.email) {
    return NextResponse.json({ hata: "Oturum bulunamadı, lütfen giriş yapın." }, { status: 401 })
  }

  // 1. ÖNCE KULLANICIYI VERİTABANINDAN ÇEKİYORUZ
  const kullanici = await prisma.user.findUnique({
    where: { email: session.user.email }
  })

  // 2. YETKİ KONTROLÜNÜ VERİTABANINDAKİ "hesapTuru" İLE YAPIYORUZ
  if (!kullanici || kullanici.hesapTuru !== "SATICI") {
    return NextResponse.json({ hata: "Yetkisiz erişim. Sadece satıcı yetkisine sahip kullanıcılar ilan ekleyebilir." }, { status: 401 })
  }

  const body = await req.json()
  const {
    baslik, aciklama, urunUrl, kategori, perakendeFiyat,
    hedefKitle, minMiktarBireysel, minMiktarKobi, minMiktarKurumsal,
    bitisTarihi, teslimatYontemi, indirimOrani, depozitoOrani,
    baremler
  } = body

  if (!baslik || !perakendeFiyat || !bitisTarihi) {
    return NextResponse.json({ hata: "Zorunlu alanlar eksik" }, { status: 400 })
  }

  if (!baremler || baremler.length === 0) {
    return NextResponse.json({ hata: "İlan oluşturmak için en az 1 adet barem girmelisiniz." }, { status: 400 })
  }

  const enYuksekBarem = baremler[baremler.length - 1]
  const toptanFiyat = enYuksekBarem.fiyat
  const hedefSayi = enYuksekBarem.miktar

  if (toptanFiyat >= perakendeFiyat) {
    return NextResponse.json({ hata: "Toptan fiyat (Barem fiyatı), perakende fiyattan düşük olmalıdır." }, { status: 400 })
  }

  try {
    const ilan = await prisma.listing.create({
      data: {
        saticiId: kullanici.id,
        baslik, aciklama, urunUrl, kategori,
        perakendeFiyat: Number(perakendeFiyat),
        toptanFiyat: Number(toptanFiyat),
        hedefSayi: Number(hedefSayi),
        hedefKitle: hedefKitle || "hepsi", 
        minMiktarBireysel: Number(minMiktarBireysel || 1), 
        minMiktarKobi: Number(minMiktarKobi || 5), 
        minMiktarKurumsal: Number(minMiktarKurumsal || 20),
        bitisTarihi: new Date(bitisTarihi), 
        teslimatYontemi: teslimatYontemi || "kargo", 
        indirimOrani: Number(indirimOrani || 10), 
        depozitoOrani: Number(depozitoOrani || 30),
        
        baremler: {
          create: baremler.map((b: any, index: number) => ({
            sira: index + 1,
            miktar: Number(b.miktar),
            fiyat: Number(b.fiyat)
          }))
        }
      }
    })

    return NextResponse.json(ilan, { status: 201 })
  } catch (error) {
    console.error("İlan ekleme hatası:", error)
    return NextResponse.json({ hata: "İlan eklenirken sistemsel bir hata oluştu" }, { status: 500 })
  }
}