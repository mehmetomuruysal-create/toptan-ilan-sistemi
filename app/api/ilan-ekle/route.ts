import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: Request) {
  const session = await auth();

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
      resimler, dokumanlar 
    } = body;

    if (!baslik || !perakendeFiyat || !baremler || baremler.length === 0) {
      return NextResponse.json({ hata: "Zorunlu alanlar eksik." }, { status: 400 });
    }

    // Baremlerden toptan fiyat ve hedef sayıyı belirle (Hızlı listeleme alanları için)
    const enYuksekBarem = baremler[baremler.length - 1];
    const toptanFiyat = Number(enYuksekBarem.fiyat);
    const hedefSayi = Number(enYuksekBarem.miktar);

    const ilan = await prisma.listing.create({
      data: {
        saticiId: kullanici.id,
        baslik,
        aciklama,
        urunUrl,
        
        // ✅ Şemadaki yeni isimlendirme ve alanlar
        categoryId: Number(kategori), 
        perakendeFiyat: Number(perakendeFiyat),
        toptanFiyat: toptanFiyat, // Artık şemada var
        hedefSayi: hedefSayi,     // Artık şemada var

        bolge,
        il,
        ilce,
        teslimatYontemleri, 
        durum: "PENDING",
        bitisTarihi: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),

        // 🖼️ Çoklu Görseller
        images: {
          create: resimler.map((url: string) => ({ url }))
        },

        // 📂 Dökümanlar
        documents: {
          create: dokumanlar.map((doc: { url: string; name: string }) => ({
            url: doc.url,
            name: doc.name
          }))
        },

        // 📊 Baremler
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