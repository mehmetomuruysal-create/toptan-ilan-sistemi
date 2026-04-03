import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 })
  }

  const { id } = await params
  // parseInt kullanma, direkt string olarak kullan
  await prisma.address.delete({
    where: { id }
  })

  return NextResponse.redirect(new URL("/admin/adresler", req.url))
}