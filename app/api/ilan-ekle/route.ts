import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: Request) {
  const session = await auth();

  // 1. GÜVENLİK KONTROLÜ
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
      baslik, 
      aciklama, 
      urunUrl, 
      categoryId, // Formdan gelen kategori adı veya ID
      hedefSayi,  // 🚀 MÜHÜR: Formdaki dev inputtan gelen Stok Sayısı
      perakendeFiyat,
      bitisTarihi, // Formdaki date picker'dan gelen tarih
      lokasyonlar, // Formdaki [{il, ilce}] dizisi
      baremler,
      resimler, 
      dokumanlar 
    } = body;

    // 2. DOĞRULAMA
    if (!baslik || !perakendeFiyat || !hedefSayi || !baremler || baremler.length === 0) {
      return NextResponse.json({ hata: "Zorunlu alanlar (Başlık, Stok, Fiyat, Barem) eksik." }, { status: 400 });
    }

    // 3. VERİ HAZIRLIĞI
    // En düşük barem fiyatını "toptanFiyat" olarak hızlı listeleme için mühürleyelim
    const enUcuzBarem = baremler.reduce((prev: any, curr: any) => 
      Number(curr.fiyat) < Number(prev.fiyat) ? curr : prev
    );

    // 4. PRISMA KAYIT OPERASYONU
    const ilan = await prisma.listing.create({
      data: {
        saticiId: kullanici.id,
        baslik,
        aciklama,
        urunUrl,
        
        // 🚀 FORM VERİLERİYLE TAM UYUM
        // Kategori ID'sini Int olarak saklıyoruz (Şemadaki Category tablosuna göre)
        // Eğer kategori bir string ise (Tekstil vb.), onu ID'ye çevirmek gerekebilir. 
        // Şimdilik default 1 veriyorum veya gelen sayıyı alıyorum.
        categoryId: isNaN(Number(categoryId)) ? 1 : Number(categoryId), 
        
        hedefSayi: Number(hedefSayi),       // Toplam Stok
        perakendeFiyat: Number(perakendeFiyat),
        toptanFiyat: Number(enUcuzBarem.fiyat), // Listelemelerde görünecek "başlayan" fiyat
        
        // Lokasyonları JSON olarak saklayıp bolge kolonuna mühürlüyoruz
        bolge: JSON.stringify(lokasyonlar), 
        
        durum: "PENDING", // Admin onayına düşer
        bitisTarihi: new Date(bitisTarihi), // Kullanıcının seçtiği tarih

        // 🖼️ ÇOKLU GÖRSELLER (Relation)
        images: {
          create: resimler.map((url: string) => ({ url }))
        },

        // 📂 DÖKÜMANLAR (Relation)
        documents: {
          create: dokumanlar.map((doc: { url: string; name: string }) => ({
            url: doc.url,
            name: doc.name
          }))
        },

        // 📊 BAREMLER (Relation)
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
    return NextResponse.json({ 
      hata: "İlan kaydedilirken teknik bir sorun oluştu.", 
      detay: error.message 
    }, { status: 500 });
  }
}