import { handlers } from "@/auth" // Konfigürasyonun olduğu ana dosya

// NextAuth v5'te GET ve POST metotlarını bu şekilde dışa aktarıyoruz.
// Bu dosya Magic Link, Session ve Login isteklerini yönetir.
export const { GET, POST } = handlers

// Opsiyonel: Edge Runtime kullanıyorsan (Vercel'de daha hızlı çalışır)
// export const runtime = "edge"