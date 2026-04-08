import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: Request) {
  const session = await auth();

  // 1. OTURUM KONTROLÜ
  if (!session || !session.user?.email) {
    return NextResponse.json({ hata: "Oturum bulunamadı, lütfen giriş yapın." }, { status: 401 });
  }

  // 2. KULLANICI VE ONAY DURUMU KONTROLÜ
  const kullanici = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!kullanici) {
    return NextResponse.json({ hata: "Kullanıcı bulunamadı." }, { status: 404 });
  }

  if (kullanici.hesapTuru !== "SATICI" || kullanici.onayDurumu !== "APPROVED") {
    return NextResponse.json({ 
      hata: "Yetkisiz erişim. İlan verebilmek için 'Satıcı' profilinizin onaylanmış olması gerekir." 
    }, { status: 403 });
  }

  try {
    const body = await req.json();
    const {
      baslik, aciklama, urunUrl, kategori, perakendeFiyat,
      hedefKitle, minMiktarBireysel, minMiktarKobi, minMiktarKurumsal,
      bitisTarihi, teslimatYontemi, indirimOrani, depozitoOrani,
      baremler
    } = body;

    // Alan Kontrolleri
    if (!baslik || !perakendeFiyat || !bitisTarihi || !baremler || baremler.length === 0) {
      return NextResponse.json({ hata: "Zorunlu alanlar ve en az 1 barem gereklidir." }, { status: 400 });
    }

    // En son baremi hedef olarak belirle
    const enYuksekBarem = baremler[baremler.length - 1];
    const toptanFiyat = Number(enYuksekBarem.fiyat);
    const hedefSayi = Number(enYuksekBarem.miktar);

    const ilan = await prisma.listing.create({
      data: {
        saticiId: kullanici.id,
        baslik, 
        aciklama, 
        urunUrl, 
        kategori,
        perakendeFiyat: Number(perakendeFiyat),
        toptanFiyat: toptanFiyat,
        hedefSayi: hedefSayi,
        durum: "PENDING", // İlan önce admin onayı bekler
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
    });

    return NextResponse.json({ 
      mesaj: "İlan başarıyla oluşturuldu ve incelemeye alındı.", 
      ilanId: ilan.id 
    }, { status: 201 });

  } catch (error: any) {
    console.error("İlan ekleme hatası:", error);
    return NextResponse.json({ hata: "Sistemsel hata: " + error.message }, { status: 500 });
  }
}