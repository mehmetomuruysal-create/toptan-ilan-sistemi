"use server"

import { prisma } from "@/lib/prisma"
import { ListingStatus } from "@prisma/client"
import { revalidatePath } from "next/cache"

// Tekil durum güncelleme
export async function changeStatus(id: number, newStatus: ListingStatus) {
  await prisma.listing.update({
    where: { id },
    data: { durum: newStatus },
  })
  revalidatePath("/admin/ilanlar")
}

// TÜMÜNÜ SİLME (Vercel'in bulamadığı fonksiyon buydu)
export async function deleteAllListings() {
  await prisma.listing.deleteMany({})
  revalidatePath("/admin/ilanlar")
}

// TÜMÜNÜ ASKIYA ALMA (Vercel'in bulamadığı diğer fonksiyon)
export async function suspendAllListings() {
  await prisma.listing.updateMany({
    data: { durum: "SUSPENDED" }
  })
  revalidatePath("/admin/ilanlar")
}