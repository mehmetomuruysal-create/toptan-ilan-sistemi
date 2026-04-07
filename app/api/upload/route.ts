import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;
  const session = await auth();

  // Güvenlik: Giriş yapmamış kullanıcı yükleme yapamaz
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'application/pdf'],
          tokenPayload: JSON.stringify({
            userId: session.user.id,
            // Pathname üzerinden belge tipini yakalıyoruz (örn: vergi_levhasi.pdf)
            fileName: pathname 
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        const { userId } = JSON.parse(tokenPayload as string);

        try {
          // --- VERİTABANI KAYDI ---
          // Dosya adından belge tipini tahmin etmeye çalışıyoruz veya 
          // Frontend'den gelen isimlendirmeye göre DocType belirliyoruz.
          await prisma.document.create({
            data: {
              userId: Number(userId),
              fileUrl: blob.url,
              tip: "DIGER", // Varsayılan olarak DIGER, frontend'den gelen isme göre admin panelinde düzenleyebilirsin
              durum: "WAITING",
            },
          });
          console.log('Belge veritabanına kaydedildi:', blob.url);
        } catch (dbError) {
          console.error('Veritabanı kayıt hatası:', dbError);
        }
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 },
    );
  }
}