import { auth, signOut } from "@/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { PlusCircle, ShieldAlert, ChevronRight } from "lucide-react"
import AuthButtons from "./components/AuthButtons"
import MobileMenu from "./components/MobileMenu"
import AddressButton from "./components/AddressButton"

export default async function Home() {
  const session = await auth()
  
  // Kullanıcı verisini her sayfa yenilendiğinde veritabanından çekiyoruz (En güvenli yol)
  let dbUser = null
  if (session?.user?.email) {
    dbUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        hesapTuru: true,
        onayDurumu: true,
        ad: true,
        soyad: true
      }
    })
  }

  const ilanlar = await prisma.listing.findMany({
    include: { satici: true },
    where: { durum: "ACTIVE" } // Sadece onaylanmış ilanları gösterir
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-black text-blue-600 tracking-tighter uppercase italic">
            Mingax
          </Link>
          
          <div className="flex items-center gap-3">
            {/* 1. KONTROL: Giriş yapılmış mı? */}
            {session ? (
              <>
                <div className="hidden md:flex flex-col items-end mr-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Hoş geldin</span>
                  <span className="text-sm font-bold text-gray-900">{dbUser?.ad} {dbUser?.soyad}</span>
                </div>
                
                <AddressButton />
                
                {/* 2. KONTROL: Sadece SATICI olanlar "İlan Ver" butonunu görür */}
                {dbUser?.hesapTuru === "SATICI" && (
                  <Link 
                    href="/ilan-ekle" 
                    className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-2xl hover:bg-blue-600 transition-all font-bold text-xs uppercase tracking-widest shadow-lg shadow-blue-100"
                  >
                    <PlusCircle size={18} />
                    İlan Ver
                  </Link>
                )}

                <form action={async () => { "use server"; await signOut({ redirectTo: "/" }) }} className="hidden sm:block">
                  <button className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition">
                    <ChevronRight size={20} />
                  </button>
                </form>
                <MobileMenu />
              </>
            ) : (
              /* GİRİŞ YAPMAYANLAR SADECE BURAYI GÖRÜR */
              <>
                <div className="hidden sm:block"><AuthButtons /></div>
                <MobileMenu />
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* 3. KONTROL: SATICI olup da APPROVED (Onaylı) olmayanlara uyarı bannerı */}
        {dbUser?.hesapTuru === "SATICI" && dbUser?.onayDurumu !== "APPROVED" && (
          <div className="mb-8 p-6 bg-orange-50 border border-orange-200 rounded-[2rem] flex items-center gap-4 text-orange-800 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="bg-orange-100 p-3 rounded-2xl text-orange-600">
              <ShieldAlert size={28} />
            </div>
            <div>
              <p className="font-black uppercase text-xs tracking-widest leading-none mb-1">Onay Gerekli</p>
              <p className="text-sm font-medium opacity-80">İlan verebilmek için belgelerinizi yükleyip onay almalısınız. <Link href="/ilan-ekle" className="underline font-bold hover:text-orange-600 transition-colors">Belge yüklemek için tıklayın.</Link></p>
            </div>
          </div>
        )}

        <div className="mb-10">
          <h2 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic">Güncel Fırsatlar</h2>
          <p className="text-gray-500 font-medium mt-1">Birlikte alalım, toptan fiyatına ulaşalım.</p>
        </div>

        {ilanlar.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
            <p className="text-xl font-bold text-gray-300 uppercase tracking-widest">Henüz ilan bulunmuyor</p>
            {dbUser?.hesapTuru === "SATICI" && (
              <Link href="/ilan-ekle" className="mt-4 inline-block text-blue-600 font-bold hover:underline">
                İLK İLANI SEN OLUŞTUR →
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {ilanlar.map(ilan => (
              <div key={ilan.id} className="group bg-white rounded-[2.5rem] border border-gray-100 hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-100 transition-all duration-500 p-6 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-gray-50 text-[10px] font-black uppercase px-3 py-1 rounded-full text-gray-400 tracking-widest">
                    {ilan.kategori}
                  </span>
                  <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-black italic">
                    %{Math.round((1 - ilan.toptanFiyat / ilan.perakendeFiyat) * 100)} İndirim
                  </div>
                </div>
                
                <h3 className="font-black text-gray-900 text-xl mb-4 leading-tight group-hover:text-blue-600 transition-colors">
                  {ilan.baslik}
                </h3>

                <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Toptan Fiyat</p>
                    <p className="text-2xl font-black text-gray-900">₺{ilan.toptanFiyat.toLocaleString()}</p>
                  </div>
                  <Link 
                    href={`/ilan/${ilan.id}`} 
                    className="bg-gray-900 text-white p-3 rounded-2xl hover:bg-blue-600 transition-all"
                  >
                    <ChevronRight size={20} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}