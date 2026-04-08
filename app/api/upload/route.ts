import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const payload = JSON.parse(clientPayload || '{}');
        
        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'application/pdf'],
          tokenPayload: JSON.stringify({ 
            userId: payload.userId,
            belgeTipi: payload.belgeTipi 
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        try {
          const { userId, belgeTipi } = JSON.parse(tokenPayload || '{}');

          if (userId) {
            // ŞEMANA UYGUN ŞEKİLDE DÜZENLENDİ:
            await prisma.document.create({
              data: {
                fileUrl: blob.url,         // 'url' yerine 'fileUrl'
                userId: Number(userId),
                tip: belgeTipi || "DIGER", // 'type' yerine 'tip'
                durum: "WAITING",          // 'status' yerine 'durum'
              },
            });
            console.log(`✅ Veritabanına kaydedildi: User ${userId}`);
          }
        } catch (dbError) {
          console.error("❌ Veritabanı kayıt hatası:", dbError);
        }
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}