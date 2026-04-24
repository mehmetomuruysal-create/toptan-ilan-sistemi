"use server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export async function toggleFavorite(listingId: number) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Giriş yapmalısınız" };

  const userId = Number(session.user.id);

  try {
    const existing = await prisma.favorite.findUnique({
      where: { userId_listingId: { userId, listingId } }
    });

    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } });
      revalidatePath("/");
      return { success: true, action: "removed" };
    } else {
      await prisma.favorite.create({ data: { userId, listingId } });
      revalidatePath("/");
      return { success: true, action: "added" };
    }
  } catch (error) {
    return { error: "İşlem başarısız" };
  }
}