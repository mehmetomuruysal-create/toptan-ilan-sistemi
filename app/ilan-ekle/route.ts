import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function POST(req: Request) {
  const session = await auth()

  // Sadece satıcıların ilan ekleyebilmesini sağlıyoruz
  if (!session || (session.user as any)?.rol !== "SATICI") {
    return NextResponse.json({ hata: "Yetkisiz erişim. Sadece satıcı yetkisine sahip kullanıcılar ilan ekleyebilir." }, { status: 401 })
  }

  const body = await req.json()
  const {
    baslik, aciklama, urunUrl, kategori, perakendeFiyat,
    hedefKitle, minMiktarBireysel, minMiktarKobi, minMiktarKurumsal,
    bitisTarihi, teslimatYontemi, indirimOrani, depozitoOrani,
    baremler // YENİ: Dinamik barem dizisi
  } = body

  // Barem ve zorunlu alan kontrolleri
  if (!baslik || !perakendeFiyat || !bitisTarihi) {
    return NextResponse.json({ hata: "Zorunlu alanlar eksik" }, { status: 400 })
  }

  if (!baremler || baremler.length === 0) {
    return NextResponse.json({ hata: "İlan oluşturmak için en az 1 adet barem girmelisiniz." }, { status: 400 })
  }

  // Akıllı Hesaplama: Toptan fiyat ve Hedef sayıyı son baremden otomatik çek
  // (Satıcının baremleri 1. Barem, 2. Barem şeklinde sırayla girdiğini varsayıyoruz)
  const enYuksekBarem = baremler[baremler.length - 1]
  const toptanFiyat = enYuksekBarem.fiyat
  const hedefSayi = enYuksekBarem.miktar

  if (toptanFiyat >= perakendeFiyat) {
    return NextResponse.json({ hata: "Toptan fiyat (Barem fiyatı), perakende fiyattan düşük olmalıdır." }, { status: 400 })
  }

  const kullanici = await prisma.user.findUnique({
    where: { email: session.user!.email! }
  })

  if (!kullanici) {
    return NextResponse.json({ hata: "Kullanıcı bulunamadı" }, { status: 404 })
  }

  try {
    // Prisma Nested Create (Tek sorguda İlan + Baremler)
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
        
        // Dinamik Baremleri İlişkisel Olarak Ekliyoruz:
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