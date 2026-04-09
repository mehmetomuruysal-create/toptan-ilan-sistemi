import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: Request) {
  const session = await auth();

  // 1. OTURUM VE YETKİ KONTROLÜ
  if (!session || !session.user?.email) {
    return NextResponse.json({ hata: "Oturum bulunamadı." }, { status: 401 });
  }

  const kullanici = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, onayDurumu: true, hesapTuru: true }
  });

  if (!kullanici || kullanici.onayDurumu !== "APPROVED" || kullanici.hesapTuru !== "SATICI") {
    return NextResponse.json({ hata: "İlan verme yetkiniz bulunmuyor." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const {
      baslik, aciklama, urunUrl, kategori, perakendeFiyat,
      bolge, il, ilce, teslimatYontemleri, baremler,
      resimler, dokumanlar // Frontend'den gelen URL dizileri
    } = body;

    // Temel Validasyon
    if (!baslik || !perakendeFiyat || !baremler || baremler.length === 0) {
      return NextResponse.json({ hata: "Zorunlu alanlar eksik." }, { status: 400 });
    }

    // Baremlerden toptan fiyat ve hedef sayıyı belirle (Son barem baz alınır)
    const enYuksekBarem = baremler[baremler.length - 1];
    const toptanFiyat = Number(enYuksekBarem.fiyat);
    const hedefSayi = Number(enYuksekBarem.miktar);

    // İLAN OLUŞTURMA (Nested Create yapısı ile)
    const ilan = await prisma.listing.create({
      data: {
        saticiId: kullanici.id,
        baslik,
        aciklama,
        urunUrl,
        kategori,
        perakendeFiyat: Number(perakendeFiyat),
        toptanFiyat,
        hedefSayi,
        bolge,
        il,
        ilce,
        teslimatYontemleri, // Enum array [KARGO, NAKLIYE] vb.
        durum: "PENDING",
        bitisTarihi: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Varsayılan 30 gün

        // 🖼️ Çoklu Görselleri Kaydet
        images: {
          create: resimler.map((url: string) => ({ url }))
        },

        // 📂 Dökümanları Kaydet
        documents: {
          create: dokumanlar.map((doc: { url: string; name: string }) => ({
            url: doc.url,
            name: doc.name
          }))
        },

        // 📊 Baremleri Kaydet
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
      mesaj: "İlan başarıyla oluşturuldu ve yönetici onayına gönderildi.", 
      ilanId: ilan.id 
    }, { status: 201 });

  } catch (error: any) {
    console.error("İlan Kayıt Hatası:", error);
    return NextResponse.json({ hata: "Sistemsel bir hata oluştu: " + error.message }, { status: 500 });
  }
}