import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { 
  PlusCircle, 
  ShieldAlert, 
  ChevronRight, 
  TrendingDown, 
  Zap, 
  ShieldCheck 
} from "lucide-react"

export default async function Home() {
  const session = await auth()
  
  let dbUser = null
  if (session?.user?.email) {
    dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { hesapTuru: true, onayDurumu: true }
    })
  }

  // 🚀 Şemana göre tüm ilişkileri çekiyoruz
  const ilanlar = await prisma.listing.findMany({
    where: { durum: "ACTIVE" },
    include: { 
      satici: true,    
      images: true,    
      baremler: {      
        include: {
          katilimcilar: true 
        },
        orderBy: { miktar: 'asc' } // En düşük baremden en yükseğe
      }
    },
    orderBy: { olusturmaTarihi: "desc" },
    take: 6
  })

  return (
    <div className="min-h-screen bg-white">
      
      {/* --- HERO SECTION --- */}
      <section className="relative pt-20 pb-32 overflow-hidden border-b border-gray-50">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full mb-8 animate-bounce">
                <Zap size={16} fill="currentColor" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Birlikte Daha Güçlüyüz</span>
              </div>
              <h1 className="text-6xl md:text-8xl font-black text-gray-900 tracking-tighter uppercase italic leading-[0.85] mb-8">
                Talebi Birleştir <br /> 
                <span className="text-blue-600 underline decoration-8 decoration-blue-100 underline-offset-8">Fiyatı Düşür.</span>
              </h1>
              <p className="text-xl text-gray-500 font-medium max-w-xl leading-relaxed mb-10">
                Mingax, bireysel alıcıları toptan fiyatlarla buluşturan bir "Güç Birliği" platformudur. Hedef sayıya ulaşın, indirim baremlerini tek tek aşın.
              </p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                <button className="bg-gray-900 text-white px-10 py-5 rounded-[2.5rem] font-black uppercase text-xs tracking-widest hover:bg-blue-600 transition-all shadow-2xl shadow-gray-200">
                  Fırsatları Keşfet
                </button>
              </div>
            </div>

            <div className="hidden lg:block flex-1 bg-gray-50 rounded-[4rem] p-12 border border-gray-100">
               <div className="space-y-6">
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter">Baremli Tasarruf Örneği</h3>
                  <div className="flex justify-between items-center bg-white p-5 rounded-3xl border border-gray-100 opacity-40">
                    <span className="font-bold text-xs uppercase">Barem 1</span>
                    <span className="font-black text-gray-400 italic">₺1.000</span>
                  </div>
                  <div className="flex justify-between items-center bg-white p-6 rounded-3xl border-2 border-blue-600 scale-105 shadow-2xl">
                    <span className="font-bold text-xs uppercase text-blue-600 italic">Barem 2 (Avantaj)</span>
                    <span className="font-black text-blue-600 text-xl italic">₺900</span>
                  </div>
                  <div className="flex justify-between items-center bg-white p-5 rounded-3xl border border-gray-100">
                    <span className="font-bold text-xs uppercase text-green-600">Barem 3 (En İyi)</span>
                    <span className="font-black text-green-600 text-xl italic">₺700 🔥</span>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 py-24">
        
        {/* Onay Bekleyen Satıcı Uyarısı */}
        {dbUser?.hesapTuru === "SATICI" && dbUser?.onayDurumu !== "APPROVED" && (
          <div className="mb-16 p-8 bg-orange-50 border border-orange-100 rounded-[3rem] flex items-center gap-6 text-orange-800">
            <div className="bg-white p-4 rounded-[2rem] text-orange-500 shadow-sm">
              <ShieldAlert size={32} />
            </div>
            <div>
              <p className="font-black uppercase text-xs tracking-widest leading-none mb-2 italic">Hesap Onayı Bekleniyor</p>
              <p className="text-sm font-medium opacity-80">Satıcı profiliniz inceleniyor. İlanlarınızın yayına girmesi için belgelerinizi tamamlayın.</p>
            </div>
          </div>
        )}

        <div className="flex justify-between items-end mb-16 px-2">
          <div>
            <h2 className="text-5xl font-black text-gray-900 tracking-tighter uppercase italic leading-none">Canlı Gruplar</h2>
            <div className="h-2 w-20 bg-blue-600 mt-4 rounded-full"></div>
          </div>
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest italic">
            {ilanlar.length} AKTİF FIRSAT BULUNDU
          </p>
        </div>

        {ilanlar.length === 0 ? (
          <div className="text-center py-32 bg-gray-50 rounded-[4rem] border-4 border-dashed border-gray-100">
            <TrendingDown size={64} className="mx-auto text-gray-200 mb-6" />
            <p className="text-xl font-black text-gray-400 uppercase tracking-widest italic">Şu an aktif grup alımı bulunmuyor.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {ilanlar.map(ilan => {
              // 🚀 MATEMATİKSEL DÜZENLEMELER (Barem Sistemine Göre)
              const katilimciSayisi = ilan.baremler.reduce((acc, barem) => acc + barem.katilimcilar.length, 0);
              
              // Hedef Sayı: En yüksek baremin miktarını hedef kabul ediyoruz
              const hedefSayi = ilan.baremler.length > 0 
                ? Math.max(...ilan.baremler.map(b => b.miktar)) 
                : 1;
              
              // Görüntülenecek Fiyat: En düşük fiyatlı baremi (En iyi fiyat) gösteriyoruz
              const enIyiFiyat = ilan.baremler.length > 0 
                ? Math.min(...ilan.baremler.map(b => b.fiyat)) 
                : 0;

              const yuzde = Math.min((katilimciSayisi / hedefSayi) * 100, 100);
              const indirimOrani = Math.round((1 - enIyiFiyat / ilan.perakendeFiyat) * 100);

              return (
                <Link href={`/ilan/${ilan.id}`} key={ilan.id} className="group">
                  <div className="bg-white rounded-[3.5rem] border border-gray-100 hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-100/30 transition-all duration-500 p-6 flex flex-col relative overflow-hidden h-full">
                    
                    {/* Ürün Görseli */}
                    <div className="aspect-square bg-gray-50 rounded-[2.5rem] mb-6 overflow-hidden relative border border-gray-50">
                      {ilan.images?.[0] ? (
                        <img src={ilan.images[0].url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={ilan.baslik} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-200 uppercase font-black tracking-widest text-[10px]">Görsel Yok</div>
                      )}
                      
                      <div className="absolute top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-2xl text-[10px] font-black italic shadow-xl">
                        %{indirimOrani}'ye Varan İndirim
                      </div>
                    </div>

                    <div className="px-2 flex flex-col flex-1">
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2 italic">
                        {ilan.satici.firmaAdi || `${ilan.satici.ad} ${ilan.satici.soyad}`}
                      </p>
                      <h3 className="font-black text-gray-900 text-2xl mb-6 leading-tight group-hover:text-blue-600 transition-colors uppercase italic tracking-tighter">
                        {ilan.baslik}
                      </h3>

                      {/* 📊 PROGRESS BAR */}
                      <div className="mb-8 mt-auto">
                        <div className="flex justify-between items-end mb-2">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Grup İlerlemesi</span>
                          <span className="text-xs font-black text-blue-600 italic">{katilimciSayisi} / {hedefSayi} Katılımcı</span>
                        </div>
                        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden p-0.5 border border-gray-50">
                          <div 
                            className="h-full bg-blue-600 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(37,99,235,0.4)]" 
                            style={{ width: `${yuzde}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 italic">En İyi Fiyat</p>
                          <p className="text-3xl font-black text-gray-900 italic tracking-tighter">
                            ₺{enIyiFiyat.toLocaleString('tr-TR')}
                          </p>
                        </div>
                        <div className="bg-gray-900 text-white p-4 rounded-[1.5rem] group-hover:bg-blue-600 group-hover:rotate-6 transition-all duration-300 shadow-xl">
                          <ChevronRight size={24} />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}