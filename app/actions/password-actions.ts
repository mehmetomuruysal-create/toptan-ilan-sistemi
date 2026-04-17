"use server"

import { prisma } from "@/lib/prisma"
import crypto from "crypto"
import bcrypt from "bcryptjs"

/**
 * Şifre sıfırlama talebi oluşturma (Token üretme)
 */
export async function requestPasswordReset(email: string) {
  try {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return { success: false, error: "Bu e-posta adresiyle kayıtlı bir kullanıcı bulunamadı." }

    // 🔐 1 Saat geçerli token üretimi
    const token = crypto.randomBytes(32).toString("hex")
    const expiry = new Date(Date.now() + 3600000) // +1 Saat

    // ✅ Artık şemada oldukları için hata vermez
    await prisma.user.update({
      where: { email },
      data: {
        resetToken: token,
        resetTokenExpiry: expiry
      }
    })

    // Burada mail gönderme fonksiyonun devreye girecek
    // await sendPasswordResetEmail(email, token)

    return { success: true }
  } catch (error) {
    console.error("Sıfırlama talebi hatası:", error)
    return { success: false, error: "Sistemsel bir hata oluştu." }
  }
}

/**
 * Yeni şifreyi kaydetme
 */
export async function resetPassword(token: string, yeniSifre: string) {
  try {
    // Token geçerli mi ve süresi dolmamış mı kontrol et
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() } // Süresi geçmemiş olmalı
      }
    })

    if (!user) return { success: false, error: "Geçersiz veya süresi dolmuş işlem." }

    const hashedPassword = await bcrypt.hash(yeniSifre, 10)

    // ✅ Şifreyi güncelle ve tokenları temizle
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      }
    })

    return { success: true }
  } catch (error) {
    console.error("Şifre güncelleme hatası:", error)
    return { success: false, error: "Şifre güncellenemedi." }
  }
}