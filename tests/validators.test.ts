import { describe, expect, it } from "vitest"
import { ilanEkleSchema, kayitSchema } from "../lib/validators"

describe("kayitSchema", () => {
  it("gecerli kayit verisini kabul eder", () => {
    const result = kayitSchema.safeParse({
      adSoyad: "Mehmet Yilmaz",
      email: "mehmet@example.com",
      telefon: "5551112233",
      password: "12345678",
      hesapTuru: "ALICI",
      kvkkOnay: true,
    })

    expect(result.success).toBe(true)
  })

  it("gecersiz e-posta verisini reddeder", () => {
    const result = kayitSchema.safeParse({
      adSoyad: "Mehmet Yilmaz",
      email: "gecersiz-email",
      telefon: "5551112233",
      password: "12345678",
      hesapTuru: "ALICI",
      kvkkOnay: true,
    })

    expect(result.success).toBe(false)
  })
})

describe("ilanEkleSchema", () => {
  it("toptan fiyat perakendeden dusukse gecerlidir", () => {
    const result = ilanEkleSchema.safeParse({
      baslik: "Ornek urun",
      aciklama: "Detay",
      urunUrl: "https://example.com/urun",
      kategori: "diger",
      perakendeFiyat: 1000,
      toptanFiyat: 800,
      hedefSayi: 50,
      hedefKitle: "hepsi",
      minMiktarBireysel: 1,
      minMiktarKobi: 5,
      minMiktarKurumsal: 20,
      bitisTarihi: "2026-12-31",
      teslimatYontemi: "kargo",
      indirimOrani: 20,
      depozitoOrani: 30,
    })

    expect(result.success).toBe(true)
  })

  it("toptan fiyat perakendeden yuksekse gecersizdir", () => {
    const result = ilanEkleSchema.safeParse({
      baslik: "Ornek urun",
      perakendeFiyat: 100,
      toptanFiyat: 120,
      hedefSayi: 10,
      bitisTarihi: "2026-12-31",
    })

    expect(result.success).toBe(false)
  })
})
