import PusherServer from 'pusher';
import PusherClient from 'pusher-js';

// 🛡️ Değişkenleri güvenli bir şekilde çekelim
const appId = process.env.PUSHER_APP_ID;
const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
const secret = process.env.PUSHER_SECRET;
const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'eu';

// 🔍 RADAR: Eğer anahtar eksikse terminalde/konsolda bağıracak
if (!key) {
  console.error("❌ PUSHER HATASI: NEXT_PUBLIC_PUSHER_KEY eksik! .env dosyasını kontrol et usta.");
}

// 🚀 Sunucu tarafı (Server Actions / API)
// Sunucu tarafında hata almamak için boş string fallback ekliyoruz
export const pusherServer = new PusherServer({
  appId: appId || '',
  key: key || '',
  secret: secret || '',
  cluster: cluster,
  useTLS: true,
});

// 🚀 İstemci tarafı (Tarayıcı)
// PusherClient key bekler, eğer key gelmezse "Runtime Error" verir. 
// Bu yüzden key yoksa bile patlamaması için bir placeholder geçiyoruz.
export const pusherClient = new PusherClient(key || 'pusher-key-eksik', {
  cluster: cluster,
  forceTLS: true,
});