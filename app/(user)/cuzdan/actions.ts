"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth" // NextAuth v5 kullandığını varsayıyorum

export async function getWalletData() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Oturum açılmamış.");

  const userId = parseInt(session.user.id);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { pointsBalance: true }
  });

  const transactions = await prisma.pointTransaction.findMany({
    where: { userId: userId },
    orderBy: { createdAt: 'desc' },
    take: 10
  });

  // Bekleyen (WAITING) puanları hesapla (İlanı henüz tamamlanmamışlar)
  const pendingPoints = await prisma.pointTransaction.aggregate({
    where: { userId: userId, status: 'WAITING' },
    _sum: { amount: true }
  });

  return {
    balance: user?.pointsBalance || 0,
    pending: pendingPoints._sum.amount || 0,
    transactions
  };
}