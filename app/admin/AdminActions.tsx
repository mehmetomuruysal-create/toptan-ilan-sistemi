"use client"; // Bu satır butonların çalışması için şart

import { useRouter } from "next/navigation";

export default function AdminActions() {
  const router = useRouter();

  const handleAction = async (method: string, label: string) => {
    const confirmMsg = method === "DELETE" 
      ? "DİKKAT: Sistemdeki TÜM ilanlar kalıcı olarak silinecek! Bu işlem geri alınamaz. Onaylıyor musunuz?" 
      : "Sistemdeki tüm ilanlar askıya alınacak. Onaylıyor musunuz?";

    if (!confirm(confirmMsg)) return;

    try {
      // API rotasına istek atıyoruz
      const res = await fetch("/api/admin/listings", { method });
      
      if (res.ok) {
        alert(`${label} işlemi başarıyla tamamlandı.`);
        router.refresh(); // Sayfadaki sayıları ve tabloyu güncellemek için
      } else {
        alert("Bir hata oluştu.");
      }
    } catch (err) {
      alert("Bağlantı hatası yaşandı.");
    }
  };

  return (
    <div className="flex gap-4 mb-8 p-4 bg-gray-50 border rounded-lg">
      <button 
        onClick={() => handleAction("PATCH", "Askıya alma")}
        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded shadow transition"
      >
        Tümünü ASKIYA AL (SUSPENDED)
      </button>
      
      <button 
        onClick={() => handleAction("DELETE", "Silme")}
        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded shadow transition"
      >
        Tümünü SİL (Kalıcı)
      </button>
    </div>
  );
}