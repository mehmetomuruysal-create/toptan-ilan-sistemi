import { NextResponse } from "next/server";
import { auth } from "@/auth";

/**
 * GÜVENLİK NOTU: 
 * Bu dosyadaki toplu silme ve askıya alma işlemleri, 
 * veri güvenliğini korumak amacıyla devre dışı bırakılmıştır.
 * Yanlışlıkla tüm veritabanının silinmesini önlemek için 
 * bu uç noktalar sadece "Yetkisiz İşlem" hatası döndürür.
 */

export async function DELETE() {
  const session = await auth();
  
  // Önce yetki kontrolü (olsa bile kapalı tutuyoruz)
  console.warn(`[GÜVENLİK] ${session?.user?.email} tarafından toplu silme isteği engellendi.`);

  return NextResponse.json(
    { error: "Bu işlem güvenlik nedeniyle devre dışı bırakılmıştır. Lütfen veritabanı yöneticisi ile iletişime geçin." }, 
    { status: 403 }
  );
}

export async function PATCH() {
  const session = await auth();

  console.warn(`[GÜVENLİK] ${session?.user?.email} tarafından toplu askıya alma isteği engellendi.`);

  return NextResponse.json(
    { error: "Toplu güncelleme işlemi güvenlik nedeniyle kapatılmıştır." }, 
    { status: 403 }
  );
}