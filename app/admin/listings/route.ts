import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// TÜM İLANLARI SİL (Kalıcı Silme)
export async function DELETE() {
  try {
    // deleteMany parametresiz çağrıldığında tablodaki tüm kayıtları siler
    await prisma.listing.deleteMany({});
    
    return NextResponse.json({ message: "Tüm ilanlar kalıcı olarak silindi." }, { status: 200 });
  } catch (error) {
    console.error("Silme hatası:", error);
    return NextResponse.json({ error: "İlanlar silinirken bir hata oluştu." }, { status: 500 });
  }
}

// TÜM İLANLARI ASKIYA AL (Durum Güncelleme)
export async function PATCH() {
  try {
    await prisma.listing.updateMany({
      data: {
        durum: "SUSPENDED" // Enum'daki SUSPENDED değerini kullanıyoruz
      }
    });

    return NextResponse.json({ message: "Tüm ilanlar askıya alındı." }, { status: 200 });
  } catch (error) {
    console.error("Askıya alma hatası:", error);
    return NextResponse.json({ error: "İlanlar askıya alınırken bir hata oluştu." }, { status: 500 });
  }
}