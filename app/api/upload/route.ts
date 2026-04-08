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
            await prisma.document.create({
              data: {
                fileUrl: blob.url,
                userId: Number(userId),
                tip: belgeTipi || "DIGER",
                durum: "WAITING",
              },
            });
          }
        } catch (dbError) {
          console.error("❌ DB Kayıt Hatası:", dbError);
        }
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}