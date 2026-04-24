"use client";
import { useState, useEffect, useCallback } from "react";
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from "@react-google-maps/api";
import { MapPin, Navigation, Clock, CheckCircle, Loader2 } from "lucide-react";

const containerStyle = { width: "100%", height: "400px", borderRadius: "1.5rem" };
// Varsayılan Merkez: Antalya (Eğer konum izni verilmezse)
const defaultCenter = { lat: 36.8848, lng: 30.7040 }; 

interface NoktaSecimProps {
  onNoktaSec: (noktaId: number) => void;
}

export default function NoktaSecimHaritasi({ onNoktaSec }: NoktaSecimProps) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "" // .env dosyana eklemelisin!
  });

  const [userLocation, setUserLocation] = useState(defaultCenter);
  const [noktalar, setNoktalar] = useState<any[]>([]);
  const [seciliNokta, setSeciliNokta] = useState<any | null>(null);
  const [konumAraniyor, setKonumAraniyor] = useState(true);

  // Kullanıcının Konumunu Al ve Yakın Noktaları Getir
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserLocation({ lat, lng });
          fetchNoktalar(lat, lng);
          setKonumAraniyor(false);
        },
        () => {
          // İzin verilmezse varsayılan merkezden ara
          fetchNoktalar(defaultCenter.lat, defaultCenter.lng);
          setKonumAraniyor(false);
        }
      );
    } else {
      fetchNoktalar(defaultCenter.lat, defaultCenter.lng);
      setKonumAraniyor(false);
    }
  }, []);

  const fetchNoktalar = async (lat: number, lng: number) => {
    try {
      const res = await fetch(`/api/noktalar/yakin?lat=${lat}&lng=${lng}&mesafe=5`);
      const result = await res.json();
      if (result.success) setNoktalar(result.data);
    } catch (err) {
      console.error("Noktalar yüklenemedi", err);
    }
  };

  if (!isLoaded || konumAraniyor) return <div className="flex justify-center p-12 bg-gray-50 rounded-[2rem]"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black uppercase text-gray-900 flex items-center gap-2"><MapPin className="text-orange-500"/> Size En Yakın Teslimat Noktaları</h3>
        <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase">{noktalar.length} Nokta Bulundu</span>
      </div>

      <div className="border-2 border-gray-100 rounded-[2rem] overflow-hidden shadow-sm relative">
        <GoogleMap mapContainerStyle={containerStyle} center={userLocation} zoom={13} options={{ disableDefaultUI: true, zoomControl: true }}>
          
          {/* Kullanıcının Kendi Konumu (Mavi Nokta) */}
          <Marker position={userLocation} icon={{ url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png" }} />

          {/* Mingax Teslimat Noktaları */}
          {noktalar.map((nokta) => (
            <Marker 
              key={nokta.id} 
              position={{ lat: nokta.lat, lng: nokta.lng }} 
              onClick={() => setSeciliNokta(nokta)}
              icon={{ url: "http://maps.google.com/mapfiles/ms/icons/orange-dot.png" }}
            />
          ))}

          {/* Tıklanan Noktanın Bilgi Balonu */}
          {seciliNokta && (
            <InfoWindow position={{ lat: seciliNokta.lat, lng: seciliNokta.lng }} onCloseClick={() => setSeciliNokta(null)}>
              <div className="p-2 max-w-[200px]">
                <h4 className="font-black text-gray-900 uppercase italic mb-1">{seciliNokta.ad}</h4>
                <p className="text-[10px] font-bold text-gray-500 mb-2 flex items-center gap-1"><Navigation size={12}/> {seciliNokta.uzaklik} km uzağınızda</p>
                <p className="text-xs text-gray-600 mb-3 line-clamp-2">{seciliNokta.adres}</p>
                <button 
                  onClick={() => { onNoktaSec(seciliNokta.id); setSeciliNokta(null); }}
                  className="w-full bg-orange-500 text-white py-2 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-1 hover:bg-orange-600"
                >
                  <CheckCircle size={14}/> Buraya Gelsin
                </button>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </div>
    </div>
  );
}