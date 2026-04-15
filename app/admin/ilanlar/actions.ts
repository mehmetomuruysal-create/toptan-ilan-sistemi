"use server"

import { prisma } from "@/lib/prisma"
import { ListingStatus } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"

/**
 * GÜVENLİK KONTROLÜ: 
 * Bu fonksiyon her action başında çağrılarak sadece adminlerin işlem yapmasını sağlar.
 */
async function checkAdmin() {
  const session = await auth()
  if (!session?.user?.isAdmin) {
    throw new Error("Bu işlem için yetkiniz bulunmamıyor.")
  }
}

// 1. TEKİL DURUM GÜNCELLEME (Onaylama, Askıya Alma, Reddetme)
export async function changeStatus(id: number, newStatus: ListingStatus) {
  try {
    await checkAdmin()
    
    await prisma.listing.update({
      where: { id },
      data: { durum: newStatus },
    })
    
    revalidatePath("/admin/ilanlar")
    revalidatePath("/") // Ana sayfanın önbelleğini temizle ki ilan anında görünsün/gitsin
    return { success: true }
  } catch (error) {
    console.error("Durum güncelleme hatası:", error)
    return { success: false, error: "Durum güncellenemedi." }
  }
}

// 2. TÜMÜNÜ SİLME (Dikkatli Kullanılmalı!)
export async function deleteAllListings() {
  try {
    await checkAdmin()
    
    await prisma.listing.deleteMany({})
    
    revalidatePath("/admin/ilanlar")
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Tümünü silme hatası:", error)
    return { success: false, error: "İlanlar silinemedi." }
  }
}

// 3. TÜMÜNÜ ASKIYA ALMA
export async function suspendAllListings() {
  try {
    await checkAdmin()
    
    await prisma.listing.updateMany({
      data: { durum: "SUSPENDED" }
    })
    
    revalidatePath("/admin/ilanlar")
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Tümünü askıya alma hatası:", error)
    return { success: false, error: "İlanlar askıya alınamadı." }
  }
}

// 4. TEKİL İLAN SİLME (İhtiyaç olursa diye ekledim)
export async function deleteListing(id: number) {
  try {
    await checkAdmin()
    
    await prisma.listing.delete({
      where: { id }
    })
    
    revalidatePath("/admin/ilanlar")
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("İlan silme hatası:", error)
    return { success: false }
  }
}