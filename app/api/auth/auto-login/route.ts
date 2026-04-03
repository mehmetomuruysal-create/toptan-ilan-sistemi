import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { encode } from 'next-auth/jwt';

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  if (!userId) {
    return NextResponse.redirect(new URL('/giris?hata=gecersiz-kullanici', req.url));
  }

  const user = await prisma.user.findUnique({
    where: { id: parseInt(userId) }
  });

  if (!user) {
    return NextResponse.redirect(new URL('/giris?hata=kullanici-bulunamadi', req.url));
  }

  if (!user.epostaOnaylandi) {
    return NextResponse.redirect(new URL('/giris?hata=onaylanmadi', req.url));
  }

  const secret = process.env.NEXTAUTH_SECRET!;
  const tokenPayload = {
    email: user.email,
    name: `${user.ad} ${user.soyad}`,
    sub: String(user.id),
    rol: user.hesapTuru,
    isAdmin: user.isAdmin,
  };

  const encodedToken = await encode({
    token: tokenPayload,
    secret,
    maxAge: 30 * 24 * 60 * 60,
  });

  const cookieStore = await cookies();
  cookieStore.set('next-auth.session-token', encodedToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 30 * 24 * 60 * 60,
  });

  return NextResponse.redirect(new URL('/', req.url));
}