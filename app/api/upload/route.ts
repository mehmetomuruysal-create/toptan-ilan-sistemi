import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export const runtime = 'nodejs';

// ÇÖZÜM BURASI: POST fonksiyonunu auth() ile sarıyoruz
export const POST = auth(async (request) => {
  // Oturumu artık request.auth üzerinden alıyoruz
  const session = request.auth;

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Yetkisiz erişim. Lütfen giriş yapın." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as HandleUploadBody;

    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'application/pdf', 'image/webp'],
          tokenPayload: JSON.stringify({ userId: session.user.id }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        try {
          const payload = JSON.parse(tokenPayload || "{}");
          const userId = payload.userId;

          if (!userId) throw new Error("Token payload içinde userId bulunamadı.");

          await prisma.document.create({
            data: {
              userId: Number(userId), 
              fileUrl: blob.url,
              tip: "DIGER", 
              durum: "WAITING",
            },
          });
          console.log("✅ DB Kaydı Başarılı:", blob.url);
        } catch (dbError) {
          console.error('❌ DB KAYIT HATASI:', dbError);
          throw new Error("Veritabanı kaydı başarısız.");
        }
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error: any) {
    console.error("🔥 YÜKLEME HATASI:", error);
    return NextResponse.json(
      { error: error.message || "Bilinmeyen bir hata oluştu." },
      { status: 400 }
    );
  }
});