import { prisma } from "@/lib/prisma"
import { Listing, User } from "@prisma/client"

// Sayfanın her zaman taze veri çekmesini sağlar
export const revalidate = 0;

type IlanIleSatici = Listing & {
  satici: User
}

export default async function Home() {
  // Veritabanından ilanları çekiyoruz
  const ilanlar = await prisma.listing.findMany({
    include: {
      satici: true,
    },
  })

  return (
    <main className="min-h-screen p-8 bg-white text-black">
      <div className="max-w-6xl mx-auto">
        
        {/* TEST YAZISI: Eğer sayfa çalışıyorsa bu sarı kutuyu göreceksin */}
        <div className="p-4 mb-8 bg-yellow-200 border-2 border-yellow-600 text-yellow-900 font-bold rounded-lg text-center">
          SİSTEM BAĞLANTISI BAŞARILI: TEST BURADAYIM!
        </div>

        <header className="mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">
            Güncel Fırsatlar
          </h1>
          <p className="text-gray-500">Birlikte alalım, toptan fiyatına alalım.</p>
        </header>

        {/* İlanlar Listesi */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ilanlar.length === 0 ? (
            <div className="col-span-full p-10 border-2 border-dashed border-gray-200 rounded-2xl text-center text-gray-400">
              Henüz bir ilan eklenmemiş. Prisma Studio'dan ilan eklemeyi dene!
            </div>
          ) : (
            ilanlar.map((ilan: IlanIleSatici) => (
              <div key={ilan.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold mb-2">{ilan.baslik}</h2>
                <p className="text-sm text-gray-500 mb-4">Satıcı: {ilan.satici.adSoyad}</p>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-400 line-through">{ilan.perakendeFiyat} ₺</span>
                  <span className="text-2xl font-black text-green-600">{ilan.toptanFiyat} ₺</span>
                </div>
                <button className="w-full bg-black text-white py-3 rounded-xl font-semibold">
  Havuza Katıl
</button>
              </div>
            ))
          )}
        </div>

      </div>
    </main>
  )
}