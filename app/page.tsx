import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { ShieldAlert, Heart, ChevronRight, PackageX } from "lucide-react"

export default async function Home() {
  const session = await auth()
  
  let dbUser = null
  if (session?.user?.email) {
    dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { hesapTuru: true, onayDurumu: true }
    })
  }

  // 🚀 BACKEND DOKUNULMADI: Şemana göre tüm ilişkileri çekiyoruz
  const ilanlar = await prisma.listing.findMany({
    where: { durum: "ACTIVE" },
    include: { 
      satici: true,    
      images: true,    
      baremler: {      
        include: {
          katilimcilar: true 
        },
        orderBy: { miktar: 'asc' }
      }
    },
    orderBy: { olusturmaTarihi: "desc" },
    take: 10
  })

  // Hikaye (Story) Yuvarlakları
  const storyLinks = [
    { title: "Barem Fırsatı", icon: "🔽", border: "border-purple-500", text: "text-purple-600" },
    { title: "Mingax Kargo", icon: "🚚", border: "border-mingax-orange", text: "text-mingax-orange" },
    { title: "Hacimli Alım", icon: "📦", border: "border-blue-400", text: "text-blue-600" },
    { title: "Grup İndirimi", icon: "🤝", border: "border-green-500", text: "text-green-600" },
    { title: "Fırsat Ürünleri", icon: "🏷️", border: "border-red-500", text: "text-red-500" },
    { title: "İyi Fiyatlılar", icon: "✨", border: "border-indigo-400", text: "text-indigo-600" },
    { title: "Sen De Katıl", icon: "🎯", border: "border-pink-500", text: "text-pink-600" },
    { title: "Kuponlar", icon: "🎟️", border: "border-yellow-400", text: "text-yellow-600" },
  ];

  return (
    <div className="bg-[#fafafa] min-h-screen pb-20 font-sans">
      
      <main className="max-w-[1200px] mx-auto px-4 pt-6">
        
        {/* 🚀 ONAY BEKLEYEN SATICI UYARISI (Sadeleştirildi) */}
        {dbUser?.hesapTuru === "SATICI" && dbUser?.onayDurumu !== "APPROVED" && (
          <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-3 text-orange-800">
            <ShieldAlert size={20} className="shrink-0 mt-0.5 text-mingax-orange" />
            <div>
              <p className="font-bold text-sm">Satıcı Hesabınız Onay Bekliyor</p>
              <p className="text-xs mt-1">Profiliniz inceleniyor. İlanlarınızın yayına girmesi için onay sürecinin tamamlanmasını bekleyiniz.</p>
            </div>
          </div>
        )}

        {/* 1. YUVARLAK "HİKAYE" LİNKLERİ DIZISI */}
        <div className="flex items-center justify-between overflow-x-auto custom-scrollbar pb-4 gap-4 mb-6">
          {storyLinks.map((story, i) => (
            <div key={i} className="flex flex-col items-center gap-2 cursor-pointer group min-w-[80px]">
              <div className={`w-[72px] h-[72px] rounded-full border-[3px] ${story.border} flex items-center justify-center bg-white shadow-sm group-hover:scale-105 transition-transform`}>
                <span className="text-3xl">{story.icon}</span>
              </div>
              <span className={`text-[11px] font-semibold text-center leading-tight ${story.text}`}>
                {story.title}
              </span>
            </div>
          ))}
        </div>

        {/* 2. ANA VİTRİN: CANLI GRUPLAR */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm mb-8">
          
          {/* Vitrin Başlık Çubuğu */}
          <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-800">Canlı Grup Alımları</h2>
            <Link href="/ilanlar" className="text-sm font-semibold text-gray-600 flex items-center hover:text-mingax-orange transition-colors">
              Tümünü Gör <ChevronRight size={16} />
            </Link>
          </div>

          {ilanlar.length === 0 ? (
            <div className="text-center py-20 flex flex-col items-center">
              <PackageX size={48} className="text-gray-300 mb-4" />
              <p className="text-sm font-semibold text-gray-500">Şu an aktif bir grup alımı bulunmuyor.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
              {ilanlar.map((listing: any) => {
                
                // 🚀 MATEMATİKSEL DÜZENLEMELER (Dokunulmadı)
                const katilimciSayisi = listing.baremler.reduce((acc: number, barem: any) => acc + (barem.katilimcilar?.length || 0), 0);
                const hedefSayi = listing.baremler.length > 0 ? Math.max(...listing.baremler.map((b: any) => b.miktar)) : 1;
                const enIyiFiyat = listing.baremler.length > 0 ? Math.min(...listing.baremler.map((b: any) => b.fiyat)) : (listing.toptanFiyat || 0);
                const yuzde = Math.min((katilimciSayisi / hedefSayi) * 100, 100);
                const indirimOrani = (enIyiFiyat > 0 && listing.perakendeFiyat > 0) ? Math.round((1 - enIyiFiyat / listing.perakendeFiyat) * 100) : 0;

                return (
                  <Link href={`/ilan/${listing.id}`} key={listing.id} className="group relative border-r border-b border-gray-100 p-4 hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-shadow bg-white flex flex-col cursor-pointer">
                    
                    {/* Favori Butonu */}
                    <button className="absolute top-4 right-4 z-10 w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-400 hover:text-mingax-orange transition-colors shadow-sm">
                      <Heart size={16} />
                    </button>

                    {/* İndirim Etiketi */}
                    {indirimOrani > 0 && (
                      <div className="absolute top-4 left-4 z-10">
                        <span className="bg-[#f00] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                          %{indirimOrani} İndirim
                        </span>
                      </div>
                    )}

                    {/* Ürün Görseli */}
                    <div className="aspect-square relative mb-3 bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center">
                      {listing.images?.[0] ? (
                        <img src={listing.images[0].url} className="object-cover w-full h-full mix-blend-multiply group-hover:scale-105 transition-transform duration-500" alt={listing.baslik} />
                      ) : (
                        <div className="text-gray-300 text-xs font-semibold">Görsel Yok</div>
                      )}
                    </div>

                    {/* Ürün Bilgileri */}
                    <div className="flex flex-col flex-1">
                      <div className="mb-2 text-sm text-gray-800 line-clamp-2 leading-snug">
                        <span className="font-bold text-gray-900 mr-1">
                          {listing.satici.firmaAdi || `${listing.satici.ad} ${listing.satici.soyad}`}
                        </span>
                        {listing.baslik}
                      </div>

                      {/* İlerleme Çubuğu */}
                      <div className="mt-auto mb-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] text-gray-500 font-semibold">Hedef: {hedefSayi}</span>
                          <span className="text-[10px] text-mingax-orange font-bold">%{Math.round(yuzde)}</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-mingax-orange rounded-full transition-all duration-700" style={{ width: `${yuzde}%` }}></div>
                        </div>
                      </div>

                      {/* Fiyat Alanı */}
                      <div className="mt-1">
                        {indirimOrani > 0 && (
                          <div className="text-[11px] text-gray-400 line-through">
                            ₺{listing.perakendeFiyat?.toLocaleString('tr-TR')}
                          </div>
                        )}
                        <div className="text-mingax-orange font-bold text-lg tracking-tight">
                          ₺{enIyiFiyat.toLocaleString('tr-TR')}
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

      </main>
    </div>
  )
}