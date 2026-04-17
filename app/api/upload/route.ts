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
        let payload = null;
        
        // 🚀 ÇELİK YELEK: Gelen veri boş veya hatalıysa sistem çökmeyecek!
        if (clientPayload && clientPayload.trim() !== "") {
          try {
            payload = JSON.parse(clientPayload);
            console.log(`🟡 Token Üretiliyor... Tür: SATICI BELGESİ`);
          } catch (e) {
            console.log(`🟡 Geçersiz Payload, İlan Resmi Olarak İşleniyor.`);
          }
        } else {
          console.log(`🟡 Token Üretiliyor... Tür: İLAN RESMİ`);
        }
        
        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
          tokenPayload: payload ? JSON.stringify({ 
            userId: payload.userId,
            belgeTipi: payload.belgeTipi,
            isDocument: true 
          }) : JSON.stringify({ isDocument: false }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log(`🟢 Vercel'e Yüklendi! URL: ${blob.url}`);
        
        try {
          if (tokenPayload) {
            const parsedToken = JSON.parse(tokenPayload);
            if (parsedToken.isDocument && parsedToken.userId) {
              await prisma.document.create({
                data: {
                  userId: Number(parsedToken.userId),
                  fileUrl: blob.url,
                  tip: parsedToken.belgeTipi || "DIGER",
                  durum: "WAITING",
                },
              });
              console.log(`✅ DB'YE YAZILDI!`);
            }
          }
        } catch (dbError) {
          console.error("❌ DB Kayıt Hatası:", dbError);
        }
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error: any) {
    console.error("❌ Upload API Hatası:", error.message);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}