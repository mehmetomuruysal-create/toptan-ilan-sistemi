import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email ve şifre zorunludur." }, { status: 400 });
    }

    // 1. Esnafı bul (Nokta bilgileriyle beraber)
    const esnaf = await prisma.esnafHesap.findUnique({
      where: { email },
      include: { nokta: true }
    });

    if (!esnaf) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı." }, { status: 404 });
    }

    // 2. Hesap aktif mi kontrol et
    if (!esnaf.aktif || !esnaf.nokta.aktif) {
      return NextResponse.json({ error: "Hesabınız veya teslimat noktanız askıya alınmış." }, { status: 403 });
    }

    // 3. Şifreyi Doğrula
    const isPasswordMatch = await bcrypt.compare(password, esnaf.password);
    if (!isPasswordMatch) {
      return NextResponse.json({ error: "Hatalı şifre girdiniz." }, { status: 401 });
    }

    // 4. JWT Token Oluştur (Mobil uygulamaya gönderilecek anahtar)
    const secretKey = process.env.JWT_SECRET || "mingax_super_secret_key_2026";
    const token = jwt.sign(
      { 
        esnafId: esnaf.id, 
        noktaId: esnaf.noktaId,
        rol: "ESNAF" 
      }, 
      secretKey, 
      { expiresIn: "30d" } // Token 30 gün geçerli
    );

    // 5. Son giriş tarihini güncelle
    await prisma.esnafHesap.update({
      where: { id: esnaf.id },
      data: { sonGirisTarihi: new Date() }
    });

    // 6. Başarılı yanıt (Şifreyi silerek yolla)
    return NextResponse.json({
      success: true,
      token,
      nokta: {
        id: esnaf.nokta.id,
        ad: esnaf.nokta.ad,
        esnafAdi: esnaf.nokta.esnafAdi,
        mevcutKapasite: esnaf.nokta.mevcutKapasite,
        maxKapasite: esnaf.nokta.maxKapasite
      }
    });

  } catch (error) {
    console.error("Esnaf giriş hatası:", error);
    return NextResponse.json({ error: "Sistemsel bir hata oluştu." }, { status: 500 });
  }
}