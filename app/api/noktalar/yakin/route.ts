import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Kuş uçuşu mesafe hesaplama (Haversine Formülü) - Sonuç Kilometre döner
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Dünyanın yarıçapı (km)
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  return R * c;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const latStr = searchParams.get("lat");
    const lngStr = searchParams.get("lng");
    const mesafeSiniri = parseFloat(searchParams.get("mesafe") || "3"); // Varsayılan 3 KM

    if (!latStr || !lngStr) {
      return NextResponse.json({ error: "Konum bilgisi eksik." }, { status: 400 });
    }

    const userLat = parseFloat(latStr);
    const userLng = parseFloat(lngStr);

    // Sadece aktif ve kapasitesi dolmamış noktaları çekiyoruz
    const aktifNoktalar = await prisma.teslimatNoktasi.findMany({
      where: { 
        aktif: true,
        geciciKapali: false,
        mevcutKapasite: { lt: prisma.teslimatNoktasi.fields.maxKapasite } // Kapasite dolmamış olmalı!
      }
    });

    // Mesafeyi hesapla, filtrele ve yakından uzağa sırala
    const yakinNoktalar = aktifNoktalar
      .map(nokta => {
        const uzaklik = getDistanceFromLatLonInKm(userLat, userLng, nokta.lat, nokta.lng);
        return { ...nokta, uzaklik: parseFloat(uzaklik.toFixed(2)) }; // 2 ondalık
      })
      .filter(nokta => nokta.uzaklik <= mesafeSiniri)
      .sort((a, b) => a.uzaklik - b.uzaklik);

    return NextResponse.json({ success: true, data: yakinNoktalar });

  } catch (error) {
    console.error("Yakın nokta bulma hatası:", error);
    return NextResponse.json({ error: "Noktalar getirilemedi." }, { status: 500 });
  }
}