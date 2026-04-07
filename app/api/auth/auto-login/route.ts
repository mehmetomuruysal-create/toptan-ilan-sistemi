import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signIn } from "@/auth"; // NextAuth'u buraya çağırıyoruz

export async function POST(req: Request) {
  try {
    const { ad, soyad, email, password } = await req.json();

    // 1. Şifreyi şifrele
    const hashedPassword = await bcrypt.hash(password, 10);

    // 2. Kullanıcıyı ONAYLI olarak oluştur
    const user = await prisma.user.create({
      data: {
        ad,
        soyad,
        email,
        password: hashedPassword,
        epostaOnaylandi: true, // Otomatik onay
        onayDurumu: "PENDING"
      }
    });

    // --- BURASI KRİTİK: OTOMATİK GİRİŞ ---
    // Kayıt biter bitmez NextAuth'un giriş fonksiyonunu tetikliyoruz
    return NextResponse.json({ 
      success: true, 
      message: "Kayıt başarılı, giriş yapılıyor..." 
    });

  } catch (error) {
    return NextResponse.json({ hata: "Kayıt sırasında bir hata oluştu" }, { status: 400 });
  }
}