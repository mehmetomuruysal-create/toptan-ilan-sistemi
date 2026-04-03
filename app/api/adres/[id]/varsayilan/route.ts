import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
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

  const { id } = await params
  // parseInt(id) kaldırıldı, direkt string olarak kullan
  const adresId = id

  const { tip } = await req.json()

  if (!tip || (tip !== "teslimat" && tip !== "fatura")) {
    return NextResponse.json({ error: "Geçersiz tip" }, { status: 400 })
  }

  const adres = await prisma.address.findFirst({
    where: { id: adresId, userId: user.id }
  })

  if (!adres) {
    return NextResponse.json({ error: "Adres bulunamadı" }, { status: 404 })
  }

  if (tip === "teslimat") {
    await prisma.address.updateMany({
      where: { userId: user.id, isVarsayilanTeslimat: true },
      data: { isVarsayilanTeslimat: false }
    })
    await prisma.address.update({
      where: { id: adresId },
      data: { isVarsayilanTeslimat: true }
    })
  } else if (tip === "fatura") {
    await prisma.address.updateMany({
      where: { userId: user.id, isVarsayilanFatura: true },
      data: { isVarsayilanFatura: false }
    })
    await prisma.address.update({
      where: { id: adresId },
      data: { isVarsayilanFatura: true }
    })
  }

  return NextResponse.json({ success: true })
}