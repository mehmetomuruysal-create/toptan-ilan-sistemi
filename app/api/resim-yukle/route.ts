import { put } from "@vercel/blob"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const dosya = formData.get("dosya") as File

    if (!dosya) {
      return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 400 })
    }

    // Vercel Blob'a yükle
    const blob = await put(dosya.name, dosya, {
      access: "public",
      contentType: dosya.type,
    })

    return NextResponse.json({ url: blob.url })
  } catch (error) {
    console.error("Yükleme hatası:", error)
    return NextResponse.json({ error: "Yükleme başarısız" }, { status: 500 })
  }
}