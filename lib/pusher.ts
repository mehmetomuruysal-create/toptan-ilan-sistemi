import PusherServer from 'pusher';
import PusherClient from 'pusher-js';

// 🛡️ Çevresel Değişkenler
const appId = process.env.PUSHER_APP_ID!;
const key = process.env.NEXT_PUBLIC_PUSHER_KEY!;
const secret = process.env.PUSHER_SECRET!;
const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || process.env.PUSHER_CLUSTER || 'eu';

// 🔍 RADAR: Build sırasında anahtar eksikse Vercel loglarında bağırır
if (!key && typeof window === 'undefined') {
  console.warn("⚠️ PUSHER UYARISI: NEXT_PUBLIC_PUSHER_KEY bulunamadı. Build aşamasında bu normal olabilir, ancak çalışma anında hata verecektir.");
}

// 🚀 SUNUCU TARAFI (Server Actions / API Routes)
// Global tip tanımı yaparak Hot Reload (Hızlı Yenileme) sırasında 
// sürekli yeni Pusher instance'ı oluşmasını engelliyoruz.
const globalForPusher = global as unknown as { pusherServer: PusherServer };

export const pusherServer = 
  globalForPusher.pusherServer || 
  new PusherServer({
    appId: appId || '',
    key: key || '',
    secret: secret || '',
    cluster: cluster,
    useTLS: true,
  });

if (process.env.NODE_ENV !== 'production') globalForPusher.pusherServer = pusherServer;


// 🚀 İSTEMCİ TARAFI (Browser)
// Singleton Pattern: Tarayıcıda tek bir Pusher bağlantısı tutarız.
let clientInstance: PusherClient | null = null;

export const getPusherClient = () => {
  if (typeof window === 'undefined') return null; // Sunucuda çalışıyorsa dur
  
  if (!clientInstance) {
    clientInstance = new PusherClient(key || 'pusher-key-eksik', {
      cluster: cluster,
      forceTLS: true,
    });
  }
  return clientInstance;
};

// Geriye dönük uyumluluk için direkt export (Opsiyonel)
export const pusherClient = typeof window !== 'undefined' 
  ? new PusherClient(key || 'pusher-key-eksik', { cluster, forceTLS: true }) 
  : null as unknown as PusherClient;