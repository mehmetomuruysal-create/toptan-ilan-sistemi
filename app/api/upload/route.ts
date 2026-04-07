import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;
  const session = await auth();

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'application/pdf', 'image/webp'],
          tokenPayload: JSON.stringify({
            userId: session.user.id,
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        const { userId } = JSON.parse(tokenPayload as string);

        try {
          // --- BELGE TİPİNİ BELİRLEME ---
          // Frontend'den dosya ismini "VERGI_LEVHASI_dosyaadi.pdf" gibi gönderdiğimizi varsayıyoruz
          // Veya basitçe tüm zorunlu belgeleri DIGER olarak değil, enum'da ne varsa ona göre kaydediyoruz.
          
          await prisma.document.create({
            data: {
              userId: Number(userId),
              fileUrl: blob.url,
              // Kritik: Prisma'daki DocType enum değerlerinden biri olmalı. 
              // Eğer enum'da "DIGER" varsa çalışır, yoksa hata verir.
              tip: "DIGER", 
              durum: "WAITING",
            },
          });
        } catch (dbError) {
          console.error('VERİTABANI KAYIT HATASI:', dbError);
          throw new Error("Veritabanı kaydı başarısız.");
        }
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error("BLOB UPLOAD ERROR:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 },
    );
  }
}