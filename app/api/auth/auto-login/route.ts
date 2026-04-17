import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { ad, soyad, email, password } = await req.json();

    // 1. Şifreyi güvenli hale getir
    const hashedPassword = await bcrypt.hash(password, 10);

    // 2. Kullanıcıyı oluştur (Güncel Şema ile Tam Uyumlu)
    const user = await prisma.user.create({
      data: {
        ad,
        soyad,
        email,
        password: hashedPassword,
        // 🚀 Artık şemada tanımlı olduğu için build hatası vermez
        epostaOnaylandi: true, 
        onayDurumu: "APPROVED", 
        hesapTuru: "ALICI"      
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