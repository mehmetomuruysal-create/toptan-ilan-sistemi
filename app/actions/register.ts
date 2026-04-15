"use server"

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { sendVerificationEmail } from "@/lib/mail"
import { HesapTuru, UserStatus } from "@prisma/client" // 👈 UserStatus eklendi
import crypto from "crypto"

const ALLOWED_COUNTRY_CODES = ["+90", "+1", "+44", "+49"]

export async function registerUser(formData: any) {
  try {
    const { 
      ad, soyad, email, ulkeKodu, telefon, password, hesapTuru, cinsiyet, kampanyaOnay,
      firmaAdi, vergiNo, vergiDairesi, adres, teslimatAdresi 
    } = formData

    // 1. Temel Validasyonlar
    if (!ad || !soyad) return { success: false, error: "Ad ve Soyad alanları zorunludur." }
    
    if (!ALLOWED_COUNTRY_CODES.includes(ulkeKodu)) {
      return { success: false, error: "Geçersiz ülke kodu seçtiniz." }
    }
    
    if (!/^\d{10}$/.test(telefon)) {
      return { success: false, error: "Telefon numarası başında sıfır olmadan tam 10 haneli olmalıdır." }
    }

    // 2. Çift Kayıt Kontrolleri
    const existingEmail = await prisma.user.findUnique({ where: { email } })
    if (existingEmail) return { success: false, error: "Bu e-posta adresi zaten kayıtlı." }

    const existingPhone = await prisma.user.findUnique({ where: { telefon } })
    if (existingPhone) return { success: false, error: "Bu telefon numarası zaten sisteme kayıtlı." }

    // 3. Şifreleme ve Token Oluşturma
    const hashedPassword = await bcrypt.hash(password, 10)
    const verifyToken = crypto.randomBytes(32).toString("hex")

    // 4. Veritabanına Kayıt (Kritik Mantık Burası)
    const newUser = await prisma.user.create({
      data: {
        ad, 
        soyad, 
        email, 
        ulkeKodu, 
        telefon, 
        password: hashedPassword,
        cinsiyet: hesapTuru === "ALICI" ? cinsiyet : null,
        kampanyaOnay, 
        hesapTuru: hesapTuru as HesapTuru,
        
        // 🚀 YENİ MANTIK: Alıcı ise doğrudan APPROVED, Satıcı ise PENDING
        onayDurumu: (hesapTuru === "ALICI" ? "APPROVED" : "PENDING") as UserStatus,
        
        epostaOnaylandi: false, // E-posta onayı her iki tür için de zorunlu kalabilir
        emailVerifyToken: verifyToken,

        // Satıcıya Özel Alanlar
        ...(hesapTuru === "SATICI" && {
          firmaAdi,
          vergiNo,
          vergiDairesi,
          adres,
        }),

        // Alıcıya Özel Alanlar
        ...(hesapTuru === "ALICI" && {
          teslimatAdresi,
        }),
      }
    })

    // 5. Onay Maili Gönderimi
    try {
      await sendVerificationEmail(newUser.email, newUser.ad, verifyToken)
      console.log("✅ Onay maili gönderildi:", newUser.email)
    } catch (mailError) {
      console.error("❌ Onay maili gönderilemedi:", mailError)
      // Kullanıcı oluşturuldu ama mail gitmediyse yine de başarılı sayabiliriz 
      // veya kullanıcıya mail gitmedi uyarısı verebiliriz.
    }

    return { success: true }
  } catch (error) {
    console.error("Kayıt hatası:", error)
    return { success: false, error: "Kayıt olurken sistemsel bir hata oluştu." }
  }
}