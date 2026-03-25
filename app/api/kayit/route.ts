import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  const { adSoyad, email, sifre, rol } = await req.json()

  if (!adSoyad || !email || !sifre) {
    return NextResponse.json({ hata: "Tüm alanlar zorunlu" }, { status: 400 })
  }

  const mevcutKullanici = await prisma.user.findUnique({ where: { email } })
  if (mevcutKullanici) {
    return NextResponse.json({ hata: "Bu email zaten kayıtlı" }, { status: 400 })
  }

  const hashedSifre = await bcrypt.hash(sifre, 10)

  await prisma.user.create({
    data: { adSoyad, email, sifre: hashedSifre, rol }
  })

  return NextResponse.json({ mesaj: "Kayıt başarılı" }, { status: 201 })
}
