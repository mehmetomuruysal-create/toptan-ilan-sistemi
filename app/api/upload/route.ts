import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth'; // Auth.ts yolunun projenle uyuştuğundan emin ol

// EKLENEN SİHİRLİ SATIR: Vercel'e bu dosyayı Prisma ile uyumlu standart sunucuda çalıştırmasını söyler
export const runtime = 'nodejs';

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;
  const session = await auth();

  // 1. GÜVENLİK: Kullanıcı giriş yapmamışsa engelle
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Yetkisiz erişim. Lütfen giriş yapın." }, { status: 401 });
  }

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        // İsteğe bağlı: Frontend'den dosya tipi (VERGI_LEVHASI vb.) gönderildiyse clientPayload içinden alabiliriz.
        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'application/pdf', 'image/webp'],
          tokenPayload: JSON.stringify({
            userId: session.user.id,
            // Dosyanın asıl adını da payload'a ekleyebiliriz ki aşağıda yakalayalım
            originalFilename: pathname, 
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        try {
          // TokenPayload string olarak gelir, parse ediyoruz.
          const payloadString = tokenPayload || "{}";
          const payload = JSON.parse(payloadString);
          const userId = payload.userId;

          if (!userId) {
              throw new Error("Token payload içinde userId bulunamadı.");
          }

          console.log(`✅ Vercel Blob'a Yüklendi. URL: ${blob.url}, UserID: ${userId}`);

          // --- PRISMA VERİTABANI KAYDI ---
          await prisma.document.create({
            data: {
              // String yerine Number() kullanıyoruz ki Prisma'nın beklediği Int tipiyle eşleşsin
              userId: Number(userId), 
              fileUrl: blob.url,
              tip: "DIGER", 
              durum: "WAITING",
            },
          });
          
          console.log("💾 Veritabanına belge kaydı başarılı.");

        } catch (dbError) {
          console.error('❌ VERİTABANI KAYIT HATASI:', dbError);
          // Vercel Blob'a dosya yüklenmiş olsa bile DB hatası fırlatıyoruz
          throw new Error("Dosya yüklendi fakat veritabanına kaydedilemedi.");
        }
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error("🔥 BLOB UPLOAD CATCH ERROR:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 },
    );
  }
}