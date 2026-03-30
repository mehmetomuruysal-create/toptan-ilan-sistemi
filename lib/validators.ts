import { z } from "zod"

export const kayitSchema = z.object({
  adSoyad: z.string().trim().min(2, "Ad soyad zorunlu"),
  email: z.string().email("Geçerli bir e-posta girin"),
  telefon: z.string().trim().min(10, "Telefon zorunlu"),
  password: z.string().min(8, "Şifre en az 8 karakter olmalı"),
  hesapTuru: z.enum(["ALICI", "SATICI"]),
  firmaAdi: z.string().trim().optional(),
  vergiNo: z.string().trim().optional(),
  vergiDairesi: z.string().trim().optional(),
  adres: z.string().trim().optional(),
  teslimatAdresi: z.string().trim().optional(),
  kvkkOnay: z.literal(true, { error: "KVKK onayı zorunludur" }),
}).superRefine((data, ctx) => {
  if (data.hesapTuru === "SATICI") {
    if (!data.firmaAdi) {
      ctx.addIssue({ code: "custom", path: ["firmaAdi"], message: "Firma adı zorunludur" })
    }
    if (!data.vergiNo || !/^\d{10}$/.test(data.vergiNo)) {
      ctx.addIssue({ code: "custom", path: ["vergiNo"], message: "Vergi no 10 haneli olmalı" })
    }
    if (!data.vergiDairesi) {
      ctx.addIssue({ code: "custom", path: ["vergiDairesi"], message: "Vergi dairesi zorunludur" })
    }
    if (!data.adres) {
      ctx.addIssue({ code: "custom", path: ["adres"], message: "Firma adresi zorunludur" })
    }
  }
})

export const ilanEkleSchema = z.object({
  baslik: z.string().trim().min(2),
  aciklama: z.string().optional(),
  urunUrl: z.string().url().optional().or(z.literal("")),
  kategori: z.string().default("diger"),
  perakendeFiyat: z.number().positive(),
  toptanFiyat: z.number().positive(),
  hedefSayi: z.number().int().positive(),
  hedefKitle: z.enum(["hepsi", "bireysel", "kobi", "kurumsal"]).default("hepsi"),
  minMiktarBireysel: z.number().int().positive().default(1),
  minMiktarKobi: z.number().int().positive().default(5),
  minMiktarKurumsal: z.number().int().positive().default(20),
  bitisTarihi: z.string().min(1),
  teslimatYontemi: z.enum(["kargo", "merkezi", "depo"]).default("kargo"),
  indirimOrani: z.number().int().min(0).max(100).default(10),
  depozitoOrani: z.number().int().min(0).max(100).default(30),
}).refine((data) => data.toptanFiyat < data.perakendeFiyat, {
  message: "Toptan fiyat perakende fiyattan düşük olmalı",
  path: ["toptanFiyat"],
})
