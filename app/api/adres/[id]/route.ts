import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true }
  })
  if (!user) {
    return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 })
  }

  const { id } = await params  // id string olarak gelir, parseInt yapma!
  const adresId = id  // direkt string

  const adres = await prisma.address.findFirst({
    where: { id: adresId, userId: user.id }
  })

  if (!adres) {
    return NextResponse.json({ error: "Adres bulunamadı" }, { status: 404 })
  }

  await prisma.address.delete({ where: { id: adresId } })

  return NextResponse.json({ success: true })
}