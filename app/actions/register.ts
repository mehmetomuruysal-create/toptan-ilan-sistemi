"use server"

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { HesapTuru, UserStatus } from "@prisma/client"
import crypto from "crypto"

const ALLOWED_COUNTRY_CODES = ["+90", "+1", "+44", "+49"]

export async function registerUser(formData: any) {
  try {
    // 1. TÜM VERİLERİ DESTRUCTURING İLE ALIYORUZ
    const { 
      ad, soyad, email, ulkeKodu, telefon, password, hesapTuru, cinsiyet, kampanyaOnay,
      firmaAdi, vergiNo, vergiDairesi, tcKimlikNo 
    } = formData

    // 2. TEMEL VALİDASYONLAR
    if (!ad || !soyad) return { success: false, error: "Ad ve Soyad alanları zorunludur." }
    
    if (!ALLOWED_COUNTRY_CODES.includes(ulkeKodu)) {
      return { success: false, error: "Geçersiz ülke kodu seçtiniz." }
    }
    
    if (!/^\d{10}$/.test(telefon)) {
      return { success: false, error: "Telefon numarası başında sıfır olmadan tam 10 haneli olmalıdır." }
    }

    // 3. ÇİFT KAYIT KONTROLLERİ
    const existingEmail = await prisma.user.findUnique({ where: { email } })
    if (existingEmail) return { success: false, error: "Bu e-posta adresi zaten kayıtlı." }

    const existingPhone = await prisma.user.findUnique({ where: { telefon } })
    if (existingPhone) return { success: false, error: "Bu telefon numarası zaten sisteme kayıtlı." }

    // 4. GÜVENLİK VE TOKEN OLUŞTURMA
    const hashedPassword = await bcrypt.hash(password, 10)
    const verifyToken = crypto.randomBytes(32).toString("hex")

    // 5. VERİTABANINA KAYIT (Güncel Şema ile Tam Uyumlu)
    await prisma.user.create({
      data: {
        ad, 
        soyad, 
        email, 
        ulkeKodu, 
        telefon, 
        password: hashedPassword,
        cinsiyet: hesapTuru === "ALICI" ? cinsiyet : null,
        kampanyaOnay: Boolean(kampanyaOnay), 
        hesapTuru: hesapTuru as HesapTuru,
        
        // 🚀 MİNGAX ANAYASA MANTIĞI
        onayDurumu: (hesapTuru === "ALICI" ? "APPROVED" : "PENDING") as UserStatus,

        // 🔐 GÜVENLİK VE ONAY ALANLARI (Şemaya eklenen yeni alanlar)
        epostaOnaylandi: false,
        emailVerifyToken: verifyToken,

        // Satıcıya/Kurumsala Özel Alanlar
        ...(hesapTuru === "SATICI" && {
          firmaAdi,
          vergiNo,
          vergiDairesi,
          tcKimlikNo,
        }),
      }
    })

    // 6. E-POSTA SİSTEMİ (Hazır, istenildiğinde aktif edilebilir)
    /* try {
      await sendVerificationEmail(email, ad, verifyToken)
    } catch (mailError) {
      console.error("Mail gönderim hatası:", mailError)
    }
    */

    return { success: true }
  } catch (error) {
    console.error("Kayıt hatası:", error)
    return { success: false, error: "Kayıt olurken sistemsel bir hata oluştu." }
  }
}