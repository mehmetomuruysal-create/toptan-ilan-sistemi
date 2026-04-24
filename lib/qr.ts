import jwt from 'jsonwebtoken';
import QRCode from 'qrcode';

// .env dosyasındaki şifremizi alıyoruz
const SECRET = process.env.JWT_SECRET || "mingax_cok_gizli_anahtar_2026";

/**
 * 1. ŞİFRELİ METİNLERİ (JWT) ÜRETEN MOTOR
 * Sipariş onaylandığı an kurye ve alıcı için iki ayrı şifre üretir.
 */
export function paketQROlustur(paketId: string, noktaId: number, katilimId: number) {
  // Alıcının paketi teslim alması için 6 günlük süre sınırı (Expire Date)
  const sonTarih = new Date();
  sonTarih.setDate(sonTarih.getDate() + 6);
  const exp = Math.floor(sonTarih.getTime() / 1000);

  // ALICI QR PAYLOAD (Esnafın "Alıcıya Teslim Et" ekranında okutulacak)
  const aliciPayload = {
    paketId,
    noktaId,
    katilimId,
    tip: "ALICI_QR",
    exp // 6 gün sonra bu kod otomatik çöp olur (esnaf okutsa bile sistem reddeder)
  };

  // KURYE QR PAYLOAD (Esnafın "Merkezi Teslim Al" ekranında okutulacak)
  const kuryePayload = {
    paketId,
    noktaId,
    katilimId,
    tip: "KURYE_QR"
    // Kurye koduna exp koymuyoruz, Mingax ne zaman bırakırsa o zaman geçerlidir.
  };

  // Verileri HMAC-SHA256 ile kırılmaz şekilde imzalıyoruz
  const alici_qr = jwt.sign(aliciPayload, SECRET);
  const kurye_qr = jwt.sign(kuryePayload, SECRET);

  return { alici_qr, kurye_qr, sonTarih };
}

/**
 * 2. ŞİFRELİ METNİ GÖRSEL QR KODA (PNG) ÇEVİREN MOTOR
 * Alıcı ekranda "QR Kodumu Göster" dediğinde çalışır.
 */
export async function qrGorseleCevir(veri: string): Promise<string> {
  try {
    // Veriyi Base64 formatında bir PNG resmine dönüştürür
    const qrImage = await QRCode.toDataURL(veri, {
      width: 350,
      margin: 2,
      color: {
        dark: '#0F172A', // Mingax Lacivert/Siyah tonu
        light: '#FFFFFF' // Arka plan
      }
    });
    return qrImage;
  } catch (err) {
    console.error("QR Code görselleştirme hatası:", err);
    return "";
  }
}