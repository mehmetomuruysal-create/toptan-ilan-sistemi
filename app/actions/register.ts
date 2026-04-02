"use server"

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { sendVerificationEmail } from "@/lib/mail"
import { HesapTuru } from "@prisma/client"
import crypto from "crypto" // Onay kodu üretmek için

const ALLOWED_COUNTRY_CODES =["+90", "+1", "+44", "+49"]

export async function registerUser(formData: any) {
  try {
    const { 
      ad, soyad, email, ulkeKodu, telefon, password, hesapTuru, cinsiyet, kampanyaOnay,
      firmaAdi, vergiNo, vergiDairesi, adres, teslimatAdresi 
    } = formData

    if (!soyad) return { success: false, error: "Soyad alanı zorunludur." }
    
    if (!ALLOWED_COUNTRY_CODES.includes(ulkeKodu)) {
      return { success: false, error: "Geçersiz ülke kodu seçtiniz." }
    }
    
    if (!/^\d{10}$/.test(telefon)) {
      return { success: false, error: "Telefon numarası başında sıfır olmadan tam 10 haneli olmalıdır." }
    }

    const existingEmail = await prisma.user.findUnique({ where: { email } })
    if (existingEmail) return { success: false, error: "Bu e-posta adresi zaten kayıtlı." }

    const existingPhone = await prisma.user.findUnique({ where: { telefon } })
    if (existingPhone) return { success: false, error: "Bu telefon numarası zaten sisteme kayıtlı." }

    const hashedPassword = await bcrypt.hash(password, 10)
    
    // Rastgele ve çok güvenli bir onay kodu (token) üret
    const verifyToken = crypto.randomBytes(32).toString("hex")

    const newUser = await prisma.user.create({
      data: {
        ad, soyad, email, ulkeKodu, telefon, password: hashedPassword,
        cinsiyet: hesapTuru === "ALICI" ? cinsiyet : null, // Sadece Alıcıysa cinsiyet kaydet
        kampanyaOnay, hesapTuru: hesapTuru as HesapTuru,
        epostaOnaylandi: false, // İlk girişte onaysız!
        emailVerifyToken: verifyToken, // Kodu veritabanına yaz
        firmaAdi: hesapTuru === "SATICI" ? firmaAdi : null,
        vergiNo: hesapTuru === "SATICI" ? vergiNo : null,
        vergiDairesi: hesapTuru === "SATICI" ? vergiDairesi : null,
        adres: hesapTuru === "SATICI" ? adres : null,
        teslimatAdresi: hesapTuru === "ALICI" ? teslimatAdresi : null,
      }
    })

 // Hoş geldin maili yerine ONAY maili atıyoruz
try {
  await sendVerificationEmail(newUser.email, newUser.ad, verifyToken);
  console.log("✅ Onay maili gönderildi:", newUser.email);
} catch (mailError) {
  console.error("❌ Onay maili gönderilemedi:", mailError);
}
}