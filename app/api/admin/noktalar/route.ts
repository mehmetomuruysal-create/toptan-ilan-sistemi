import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// GET: Tüm aktif/pasif noktaları ve esnaf hesaplarını getir
export async function GET() {
  try {
    const noktalar = await prisma.teslimatNoktasi.findMany({
      include: {
        esnafHesap: {
          select: { email: true, aktif: true, sonGirisTarihi: true } // Şifreyi asla dışarı sızdırmıyoruz!
        }
      },
      orderBy: { olusturmaTarihi: 'desc' }
    });
    return NextResponse.json(noktalar);
  } catch (error) {
    return NextResponse.json({ error: "Noktalar getirilemedi" }, { status: 500 });
  }
}

// POST: Yeni Nokta Ekle ve Esnaf Hesabı Oluştur
export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Esnafın şifresini bcrypt ile hashliyoruz (Kırılmaz şifreleme)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(body.password, salt);

    // Prisma Transaction: Hem noktayı hem hesabı tek seferde hatasız oluşturur
    const yeniNokta = await prisma.teslimatNoktasi.create({
      data: {
        ad: body.ad,
        esnafAdi: body.esnafAdi,
        telefon: body.telefon,
        email: body.email,
        adres: body.adres,
        il: body.il,
        ilce: body.ilce,
        mahalle: body.mahalle,
        lat: parseFloat(body.lat),
        lng: parseFloat(body.lng),
        maxKapasite: parseInt(body.maxKapasite),
        komisyonMiktari: parseFloat(body.komisyonMiktari),
        komisyonMingaxPayi: parseFloat(body.komisyonMingaxPayi),
        komisyonTedarikciPayi: parseFloat(body.komisyonTedarikciPayi),
        // Esnaf Hesabını Otomatik Bağla
        esnafHesap: {
          create: {
            email: body.email, // Uygulamaya bu mail ile girecek
            password: hashedPassword // Hashlenmiş şifre
          }
        }
      }
    });

    return NextResponse.json({ success: true, data: yeniNokta });
  } catch (error: any) {
    console.error("Nokta ekleme hatası:", error);
    // Unique kısıtlaması (aynı email varsa) hatasını yakala
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Bu e-posta adresi zaten kullanılıyor." }, { status: 400 });
    }
    return NextResponse.json({ error: "Kayıt sırasında hata oluştu" }, { status: 500 });
  }
}