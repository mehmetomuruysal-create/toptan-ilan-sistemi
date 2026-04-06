"use server" // Dosyanın en başında olmalı

import { prisma } from "@/lib/prisma"
import { ListingStatus } from "@prisma/client"
import { revalidatePath } from "next/cache"

export async function changeStatus(id: number, newStatus: ListingStatus) {
  await prisma.listing.update({
    where: { id },
    data: { durum: newStatus },
  })
  
  // redirect yerine revalidatePath kullanmak sayfayı yeniler ve daha hızlıdır
  revalidatePath("/admin/ilanlar")
}