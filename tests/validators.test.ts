// @ts-nocheck
import { describe, expect, it } from "vitest"
import { ilanEkleSchema, kayitSchema } from "../lib/validators"

describe("kayitSchema", () => {
  it("gecerli kayit verisini kabul eder", () => {
    const result = kayitSchema.safeParse({
      adSoyad: "Mehmet Yılmaz", // ad ve soyad yerine adSoyad birleştirildi
      email: "mehmet@example.com",
      ulkeKodu: "+90",
      telefon: "5551112233",
      password: "password123",
      hesapTuru: "ALICI",
      kampanyaOnay: true,
      kvkkOnay: true, // Zod'un istediği zorunlu KVKK onayı eklendi
    })

    if (!result.success) {
      console.log("ZOD NEYİ BEĞENMEDİ:", JSON.stringify(result.error.format(), null, 2))
    }

    expect(result.success).toBe(true)
  })

  it("gecersiz telefon numarasini reddeder", () => {
    const result = kayitSchema.safeParse({
      adSoyad: "Mehmet Yılmaz", 
      email: "mehmet@example.com",
      ulkeKodu: "+90",
      telefon: "123", // Hatalı format (Testin asıl amacı bunu yakalamak)
      password: "password123",
      hesapTuru: "ALICI",
      kampanyaOnay: true,
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