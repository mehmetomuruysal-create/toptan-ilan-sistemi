"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"

// 🚀 1. YENİ NOKTA VE ESNAF HESABI EKLEME MOTORU
export async function noktaEkle(data: any) {
  try {
    // 1. Şifreyi güvenlik standartlarına göre hashliyoruz
    const hashedPassword = await bcrypt.hash(data.sifre, 10);

    // 2. Formdan gelen verileri sayılara (number) çeviriyoruz
    const maxKapasite = parseInt(data.maxKapasite) || 50;
    const komisyonMiktari = parseFloat(data.komisyonMiktari) || 0;
    const komisyonMingaxPayi = parseFloat(data.mingaxPayi) || 0;
    const komisyonTedarikciPayi = 100 - komisyonMingaxPayi;

    // 3. Prisma Nested Write (Tek hamlede hem Noktayı hem Esnaf Hesabını yaratıyoruz)
    await prisma.teslimatNoktasi.create({
      data: {
        ad: data.ad,
        esnafAdi: data.esnafAdi,
        telefon: data.telefon,
        email: data.email,
        il: data.il,
        ilce: data.ilce,
        mahalle: data.mahalle,
        adres: data.adres,
        lat: parseFloat(data.lat) || 0,
        lng: parseFloat(data.lng) || 0,
        maxKapasite: maxKapasite,
        mevcutKapasite: 0,
        aktif: true, 
        
        // Komisyon Anlaşması
        komisyonMiktari: komisyonMiktari,
        komisyonMingaxPayi: komisyonMingaxPayi,
        komisyonTedarikciPayi: komisyonTedarikciPayi,

        // 🚀 İŞTE BÜYÜ BURADA: Esnaf Hesabını (EsnafHesap Tablosu) aynı anda yaratıyoruz!
        esnafHesap: {
          create: {
            email: data.email,
            password: hashedPassword,
            aktif: true
          }
        }
      }
    });

    // Arayüzü anında güncelle
    revalidatePath("/admin/teslimat-noktalari");
    return { success: true };
    
  } catch (error: any) {
    console.error("Nokta ekleme hatası:", error);
    // Prisma benzersizlik (unique) hatası verirse (Örn: Email zaten kullanımdaysa)
    if (error.code === 'P2002') {
      return { success: false, error: "Bu E-posta veya Telefon numarası zaten kullanılıyor!" };
    }
    return { success: false, error: "Nokta kaydedilirken bir hata oluştu." };
  }
}

// 🚀 2. NOKTA SİLME / PASİFE ALMA MOTORU
export async function noktaSil(id: number) {
  try {
    // Aktif paket kontrolü (Enum'larına tam uyumlu)
    const aktifPaketler = await prisma.paket.count({
      where: { 
        noktaId: id, 
        durum: { notIn: ["TESLIM_EDILDI", "IADE_TAMAMLANDI"] } 
      }
    });

    if (aktifPaketler > 0) {
      return { success: false, error: "Bu noktada işlem bekleyen paketler var. Silinemez!" };
    }

    // Soft delete (aktif = false yapılarak veri kaybı önlenir)
    await prisma.teslimatNoktasi.update({
      where: { id },
      data: { aktif: false }
    });

    revalidatePath("/admin/teslimat-noktalari");
    return { success: true };
  } catch (error) {
    console.error("Nokta silme hatası:", error);
    return { success: false, error: "Silme işlemi başarısız oldu." };
  }
}

// 🚀 3. NOKTA DURUM (AKTİF/PASİF) GÜNCELLEME MOTORU
export async function noktaPasifYap(id: number, durum: boolean) {
  try {
    await prisma.teslimatNoktasi.update({
      where: { id },
      data: { aktif: durum }
    });
    
    revalidatePath("/admin/teslimat-noktalari");
    return { success: true };
  } catch (error) {
    console.error("Durum güncelleme hatası:", error);
    return { success: false, error: "Durum güncellenemedi." };
  }
}

// 🚀 4. GEÇİCİ KAPATMA MOTORU (Tatil, Hastalık vb.)
export async function noktaGeciciKapat(id: number, baslangic: Date, bitis: Date, neden: string, otomatikAta: boolean) {
  try {
    await prisma.teslimatNoktasi.update({
      where: { id },
      data: {
        geciciKapali: true,
        geciciKapaliBaslangic: baslangic,
        geciciKapaliBitis: bitis,
        geciciKapaliNeden: neden
      }
    });

    if (otomatikAta) {
      // TODO: İleride paketleri en yakın aktif noktaya kaydırma algoritması eklenecek
    }

    revalidatePath("/admin/teslimat-noktalari");
    revalidatePath(`/admin/teslimat-noktalari/${id}`);
    return { success: true };
  } catch (error) {
    console.error("Geçici kapatma hatası:", error);
    return { success: false, error: "Geçici kapatma işlemi başarısız." };
  }
}