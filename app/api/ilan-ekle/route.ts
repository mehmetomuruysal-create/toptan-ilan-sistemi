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

    // 🚀 DİKKAT: toptanFiyat ve hedefSayi hesaplaman baremlerde saklandığı için 
    // Listing create içine değil, baremler kısmına gidiyor.

    const ilan = await prisma.listing.create({
      data: {
        saticiId: kullanici.id,
        baslik,
        aciklama,
        urunUrl,
        
        // ✅ DÜZELTME 1: Şemadaki isim 'categoryId'
        categoryId: Number(kategori), 
        
        perakendeFiyat: Number(perakendeFiyat),
        
        // ✅ DÜZELTME 2: toptanFiyat ve hedefSayi şemanda Listing modelinde yoksa 
        // buraya yazarsan build patlar. Zaten baremler içinde kaydediyoruz.

        bolge,
        il,
        ilce,
        teslimatYontemleri, 
        durum: "PENDING",
        bitisTarihi: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),

        // 🖼️ GÖRSELLER (Aynen duruyor)
        images: {
          create: resimler.map((url: string) => ({ url }))
        },

        // 📂 DÖKÜMANLAR (Aynen duruyor)
        documents: {
          create: dokumanlar.map((doc: { url: string; name: string }) => ({
            url: doc.url,
            name: doc.name
          }))
        },

        // 📊 BAREMLER (Aynen duruyor)
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