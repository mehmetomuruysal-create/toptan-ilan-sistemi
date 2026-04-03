import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get("token")

  if (!token) redirect("/giris?hata=gecersiz-token")

  const user = await prisma.user.findFirst({
    where: { emailVerifyToken: token }
  })

  if (!user) redirect("/giris?hata=token-bulunamadi")

  // E-postayı onayla ve token'ı temizle
  await prisma.user.update({
    where: { id: user.id },
    data: { epostaOnaylandi: true, emailVerifyToken: null }
  })

  // Otomatik giriş için giriş sayfasına token ile gönder
  redirect(`/giris?autoLoginToken=${token}`)
}