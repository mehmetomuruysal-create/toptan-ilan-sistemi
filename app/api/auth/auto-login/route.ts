import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { ad, soyad, email, password } = await req.json();

    // 1. Şifreyi güvenli hale getir
    const hashedPassword = await bcrypt.hash(password, 10);

    // 2. Kullanıcıyı oluştur (Şema ile %100 uyumlu)
    const user = await prisma.user.create({
      data: {
        ad,
        soyad,
        email,
        password: hashedPassword,
        // 🚀 epostaOnaylandi SİLİNDİ (Build hatası burada bitiyor)
        onayDurumu: "APPROVED", // Otomatik giriş için doğrudan onaylıyoruz
        hesapTuru: "ALICI"      // Hızlı kayıt genelde alıcılar içindir
      }
    });

    // --- OTOMATİK GİRİŞ YANITI ---
    // UI tarafında bu yanıt gelince signIn("credentials", ...) tetiklenecek
    return NextResponse.json({ 
      success: true, 
      message: "Kayıt başarılı, giriş yapılıyor...",
      user: { email: user.email }
    });

  } catch (error) {
    console.error("Auto-login hatası:", error);
    return NextResponse.json({ hata: "Kayıt sırasında bir hata oluştu" }, { status: 400 });
  }
}