import { NextResponse } from "next/dist/server/web/spec-extension/response";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, ad, soyad, telefon, firmaAdi, vergiNo, vergiDairesi, tcKimlikNo, yeniBelgeler } = body;

    if (!userId) return NextResponse.json({ error: "Kullanıcı ID eksik." }, { status: 400 });

    // Kullanıcının hesap türünü öğreniyoruz (Şemadaki Enum)
    const currentUser = await prisma.user.findUnique({ where: { id: userId } });
    const isSatici = currentUser?.hesapTuru === "SATICI";

    // 🚀 Şemaya tam uyumlu güncelleme işlemi
    await prisma.user.update({
      where: { id: userId },
      data: {
        ad,
        soyad,
        telefon,
        firmaAdi,
        vergiNo,
        vergiDairesi,
        tcKimlikNo,
        // EĞER SATICIYSA: Profil güncellendiği an şemadaki UserStatus.PENDING durumuna düşer!
        ...(isSatici && { onayDurumu: "PENDING" }),
        
        // Yeni belgeler varsa şemadaki Document tablosuna yazılır (Durum: WAITING)
        ...(yeniBelgeler && yeniBelgeler.length > 0 && {
          belgeler: {
            create: yeniBelgeler.map((doc: any) => ({
              tip: doc.tip,        // DocType Enum
              fileUrl: doc.fileUrl, 
              durum: "WAITING"     // DocStatus Enum
            }))
          }
        })
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Profil güncelleme hatası:", error);
    return NextResponse.json({ error: error.message || "Güncelleme başarısız." }, { status: 500 });
  }
}