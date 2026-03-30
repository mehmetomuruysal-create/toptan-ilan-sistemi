"use server"
import { prisma } from "@/lib/prisma"
import { sendPasswordResetEmail } from "@/lib/mail"
import crypto from "crypto"
import bcrypt from "bcryptjs"

// 1. Şifre sıfırlama talebi (Mail atma)
export async function requestPasswordReset(email: string) {
  try {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return { success: false, error: "Bu e-posta adresine ait hesap bulunamadı." }

    // Benzersiz ve güvenli bir şifre yenileme kodu (token) oluştur
    const token = crypto.randomBytes(32).toString("hex")
    const expiry = new Date(Date.now() + 3600000) // Token 1 saat geçerli olacak

    await prisma.user.update({
      where: { email },
      data: { resetToken: token, resetTokenExpiry: expiry }
    })

    await sendPasswordResetEmail(email, token)
    return { success: true }
  } catch (error) {
    return { success: false, error: "Sistemsel bir hata oluştu." }
  }
}

// 2. Yeni şifreyi kaydetme
export async function resetPassword(token: string, yeniSifre: string) {
  try {
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() } // Token süresi geçmemiş olmalı (Güvenlik)
      }
    })

    if (!user) return { success: false, error: "Geçersiz veya süresi dolmuş bağlantı." }

    const hashedPassword = await bcrypt.hash(yeniSifre, 10)

    // Şifreyi güncelle ve güvenlik tokenlarını temizle
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword, resetToken: null, resetTokenExpiry: null }
    })

    return { success: true }
  } catch (error) {
    return { success: false, error: "Şifre güncellenemedi." }
  }
}