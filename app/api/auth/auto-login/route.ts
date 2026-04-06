import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signIn } from "@/auth"; // Önemli: auth.ts'deki signIn metodunu kullanıyoruz

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token'); // URL'den token'ı alıyoruz

  if (!token) {
    return NextResponse.redirect(new URL('/giris?hata=gecersiz-token', req.url));
  }

  try {
    // 1. Kullanıcıyı token ile bulalım ve onaylanmış mı bakalım
    const user = await prisma.user.findFirst({
      where: { emailVerifyToken: token }
    });

    if (!user) {
      return NextResponse.redirect(new URL('/giris?hata=token-gecersiz', req.url));
    }

    if (!user.epostaOnaylandi) {
      return NextResponse.redirect(new URL('/giris?hata=onaylanmadi', req.url));
    }

    // 2. NextAuth üzerinden resmi giriş yapalım
    // auth.ts içindeki "verify-token" Credentials sağlayıcısını tetikler
    await signIn("verify-token", {
      token: token,
      redirect: false, // Manuel yönlendirme yapacağız
    });

    // 3. Başarılı girişten sonra ana sayfaya
    const response = NextResponse.redirect(new URL('/?onay=basarili', req.url));
    return response;

  } catch (error) {
    console.error("Otomatik giriş hatası:", error);
    return NextResponse.redirect(new URL('/giris?hata=otomatik-giris-basarisiz', req.url));
  }
}