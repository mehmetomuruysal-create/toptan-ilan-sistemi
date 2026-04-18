import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { 
  ShieldAlert, 
  PlusCircle, 
  Package, 
  Wallet, 
  Settings,
  ArrowUpRight,
  TrendingUp,
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  Info,
  Hash,
  Tag,
  Zap,
  ChevronRight
} from "lucide-react"

export default async function PanelPage() {
  const session = await auth()
  
  // 🔐 Güvenlik: Giriş yapmamışsa yönlendir
  if (!session) redirect("/giris")

  const user = session.user as any
  const isSatici = user?.hesapTuru === "SATICI"
  const isApproved = user?.onayDurumu === "APPROVED"
  const saticiId = Number(user?.id)

  // 🚀 PRISMA MOTORU (Sadece Satıcı ise verileri çek)
  let aktifIlanlar: any[] = []
  let bekleyenIlanlar: any[] = []
  let toplamSiparis = 0

  if (isSatici) {
    const ilanlar = await prisma.listing.findMany({
      where: { saticiId: saticiId },
      include: {
        baremler: { orderBy: { miktar: 'asc' } }, 
        katilimlar: true 
      },
      orderBy: { olusturmaTarihi: 'desc' }
    })

    aktifIlanlar = ilanlar.filter((i: any) => i.durum === "ACTIVE")
    bekleyenIlanlar = ilanlar.filter((i: any) => i.durum === "PENDING")
    toplamSiparis = aktifIlanlar.reduce((toplam: number, ilan: any) => toplam + ilan.katilimlar.length, 0)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">
      
      {/* 🚀 KRİTİK ONAY BANNERI (Senin Efsane Kodun) */}
      {isSatici && !isApproved && (
        <div className="p-8 bg-orange-50 border-2 border-orange-100 rounded-[3rem] flex flex-col md:flex-row items-center gap-8 shadow-2xl shadow-orange-100/30 animate-in slide-in-from-top duration-500">
          <div className="bg-white p-6 rounded-[2.5rem] text-orange-500 shadow-sm border border-orange-50 shrink-0">
            <ShieldAlert size={48} />
          </div>
          <div className="text-center md:text-left space-y-2">
            <h4 className="font-black uppercase text-lg tracking-[0.2em] text-orange-800 italic">Hesap Onayı Bekleniyor</h4>
            <p className="text-sm font-bold text-orange-700/80 leading-relaxed max-w-2xl">
              Satıcı profiliniz şu an inceleme aşamasında. İlanlarınızın yayına girmesi ve satış yapabilmeniz için lütfen belgelerinizi profil ayarlarından tamamlayın.
            </p>
          </div>
          <div className="md:ml-auto">
            <Link 
              href="/profil/ayarlar" 
              className="bg-orange-600 text-white px-10 py-5 rounded-2xl font-black uppercase italic text-xs tracking-widest hover:bg-orange-700 transition-all flex items-center gap-2"
            >
              Belgeleri Yükle
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      )}

      {/* --- PANEL BAŞLIĞI --- */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6">
        <div>
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter uppercase italic leading-none mb-4">
            Hoş Geldin, {user?.name?.split(" ")[0]}
          </h1>
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest italic">
            {isSatici ? "SATICI PANELİ" : "ALICI PANELİ"} • {new Date().toLocaleDateString('tr-TR')}
          </p>
        </div>
      </div>

      {/* --- ÖZET KARTLARI (Tıklanabilir Yapıldı & Dinamik Veri Eklendi) --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {isSatici ? (
          <>
            <StatCard 
              href="#aktif-ilanlar" 
              icon={<TrendingUp className="text-blue-600" />} 
              label="YAYINDAKİ İLANLARIM" 
              value={aktifIlanlar.length.toString()} 
            />
            <StatCard 
              href="#onay-bekleyenler" 
              icon={<Clock className="text-orange-600" />} 
              label="ONAY BEKLEYENLER" 
              value={bekleyenIlanlar.length.toString()} 
            />
            <StatCard 
              href={null} 
              icon={<Users className="text-green-600" />} 
              label="TOPLAM SİPARİŞ ALINAN" 
              value={toplamSiparis.toString()} 
            />
          </>
        ) : (
          <>
            <StatCard href={null} icon={<Package className="text-blue-600" />} label="AKTİF TALEPLERİM" value="0" />
            <StatCard href={null} icon={<Wallet className="text-green-600" />} label="CÜZDAN BAKİYESİ" value="₺0,00" />
            <StatCard href={null} icon={<Settings className="text-purple-600" />} label="TAMAMLANAN TALEPLER" value="0" />
          </>
        )}
      </div>

      {/* --- DETAYLI LİSTELER (Sadece Satıcı Görebilir) --- */}
      {isSatici && (
        <div className="space-y-12">
          
          {/* 🟠 ONAY BEKLEYEN İLANLAR LİSTESİ */}
          {bekleyenIlanlar.length > 0 && (
            <div id="onay-bekleyenler" className="space-y-6 pt-6 scroll-mt-24 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center gap-3 border-b-2 border-gray-100 pb-4">
                <div className="bg-orange-100 p-2 rounded-xl text-orange-600"><AlertCircle size={24} /></div>
                <h2 className="text-2xl font-black uppercase italic text-gray-800">İncelemedeki İlanlar</h2>
              </div>
              
              <div className="bg-orange-50/50 border border-orange-100 p-5 rounded-[2rem] flex items-start gap-4">
                <Info size={24} className="text-orange-500 shrink-0 mt-1" />
                <div>
                  <h4 className="text-sm font-black text-orange-800 uppercase tracking-wide">Neden Bekliyorum?</h4>
                  <p className="text-xs font-bold text-orange-600/80 mt-1">İlanlarınız, güvenliği korumak adına uzman ekibimiz tarafından incelenmektedir. Onay süreci ortalama 1-3 saat sürer.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bekleyenIlanlar.map((ilan: any) => (
                  <div key={ilan.id} className="bg-white p-6 rounded-[2rem] border-2 border-orange-100 flex items-center justify-between shadow-sm">
                    <div>
                      <h3 className="font-black text-gray-900 uppercase text-sm">{ilan.baslik}</h3>
                      <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest flex items-center gap-1 mt-1"><Clock size={12}/> Admin Onayı Bekleniyor</span>
                    </div>
                    <div className="text-right bg-orange-50 px-4 py-2 rounded-xl">
                      <span className="block text-[10px] font-black text-gray-400 uppercase">Hedef</span>
                      <span className="block text-sm font-black text-orange-600">{ilan.hedefSayi} Adet</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 🔵 YAYINDAKİ İLANLAR VE BAREM BAZLI ANALİZ EKRANI */}
          <div id="aktif-ilanlar" className="space-y-8 pt-6 scroll-mt-24">
            <div className="flex items-center gap-3 border-b-2 border-gray-100 pb-4">
              <div className="bg-blue-100 p-2 rounded-xl text-blue-600"><CheckCircle size={24} /></div>
              <h2 className="text-2xl md:text-3xl font-black uppercase italic text-gray-800 tracking-tight">Canlı Satış Performansı</h2>
            </div>

            {aktifIlanlar.length === 0 ? (
              <div className="bg-gray-50 p-12 rounded-[3.5rem] text-center border-2 border-dashed border-gray-200">
                <Package size={64} className="mx-auto text-gray-300 mb-6" />
                <h3 className="text-xl font-black uppercase text-gray-400">Şu An Yayında İlanınız Yok</h3>
                <p className="text-sm font-bold text-gray-400 mt-2">Hemen yeni bir ilan oluşturun ve Mingax topluluğuyla buluşun.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-10">
                {aktifIlanlar.map((ilan: any) => {
                  const hedef = ilan.hedefSayi || 1; 
                  const talepYuzdesi = Math.min(100, Math.round((ilan.mevcutTalep / hedef) * 100));
                  const bitis = new Date(ilan.bitisTarihi);
                  const kalanGun = Math.ceil((bitis.getTime() - new Date().getTime()) / (1000 * 3600 * 24));
                  
                  return (
                    <div key={ilan.id} className="bg-white p-8 md:p-10 rounded-[3.5rem] border-2 border-gray-100 shadow-xl shadow-gray-100/50 relative overflow-hidden">
                      
                      <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 mb-10 relative z-10">
                        <div>
                          <h3 className="text-3xl font-black italic uppercase text-gray-900 tracking-tighter mb-2">{ilan.baslik}</h3>
                          <div className="flex flex-wrap items-center gap-3 text-[10px] font-black uppercase tracking-widest text-gray-400">
                            <span className="bg-gray-100 px-3 py-1.5 rounded-lg text-gray-600">Bitiş: {bitis.toLocaleDateString("tr-TR")}</span>
                            {kalanGun > 0 ? (
                              <span className="bg-orange-100 px-3 py-1.5 rounded-lg text-orange-600 flex items-center gap-1"><Clock size={12}/> Son {kalanGun} Gün</span>
                            ) : (
                              <span className="bg-red-100 px-3 py-1.5 rounded-lg text-red-600">Süre Doldu</span>
                            )}
                            <span className="bg-blue-50 px-3 py-1.5 rounded-lg text-blue-600">{ilan.katilimlar.length} Farklı Alıcı</span>
                          </div>
                        </div>
                        <div className="text-right bg-gray-50 p-4 rounded-[2rem] border border-gray-100 min-w-[150px]">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Hedef Kapasite</span>
                          <span className="text-4xl font-black italic text-gray-900 tracking-tighter">{ilan.hedefSayi} <span className="text-sm">Adet</span></span>
                        </div>
                      </div>

                      <div className="mb-10 p-8 bg-blue-50/50 rounded-[2.5rem] border border-blue-100 relative">
                        <div className="flex justify-between items-end mb-4">
                          <div>
                            <span className="text-[10px] font-black uppercase text-blue-400 tracking-widest block mb-1">Toplanan Talep</span>
                            <div className="flex items-baseline gap-2">
                               <b className="text-blue-700 text-3xl font-black italic tracking-tighter">{ilan.mevcutTalep}</b>
                               <span className="text-sm font-bold text-blue-500 uppercase">Adet</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-black text-blue-600 italic text-5xl tracking-tighter">%{talepYuzdesi}</span>
                          </div>
                        </div>
                        <div className="w-full bg-blue-100 rounded-full h-5 overflow-hidden shadow-inner">
                          <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-5 rounded-full transition-all duration-1000 ease-out relative" style={{ width: `${talepYuzdesi}%` }}>
                             <div className="absolute top-0 right-0 bottom-0 w-10 bg-white/20 blur-md"></div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-6">
                          <div className="bg-green-100 p-1.5 rounded-lg text-green-600"><Hash size={18} /></div>
                          <h4 className="text-xs font-black uppercase text-gray-900 tracking-widest">Hangi Kademe Ne Kadar Sattı?</h4>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                          {ilan.baremler.map((barem: any, index: number) => {
                            const buBaremdekiSiparisler = ilan.katilimlar.filter((p: any) => p.baremId === barem.id);
                            const buBareminToplami = buBaremdekiSiparisler.reduce((acc: number, curr: any) => acc + curr.talepMiktari, 0);
                            const isPopuler = buBareminToplami > (ilan.hedefSayi * 0.3);

                            return (
                              <div key={barem.id} className={`p-6 rounded-[2rem] border-2 flex flex-col justify-between transition-all relative overflow-hidden ${buBareminToplami > 0 ? 'bg-gradient-to-br from-green-50 to-white border-green-200 shadow-sm hover:-translate-y-1' : 'bg-gray-50 border-gray-100 opacity-80'}`}>
                                
                                {isPopuler && (
                                  <div className="absolute -right-8 top-4 bg-yellow-400 text-yellow-900 text-[9px] font-black uppercase tracking-widest py-1 px-8 rotate-45 shadow-sm">
                                    En Popüler
                                  </div>
                                )}

                                <div className="flex justify-between items-start mb-6 relative z-10">
                                  <div>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">{index + 1}. Kademe Fiyatı</span>
                                    <b className="text-gray-900 text-xl font-black italic">{barem.miktar}+ Adet</b>
                                  </div>
                                  <span className="bg-white px-4 py-2 rounded-xl text-sm font-black text-green-600 shadow-sm border border-green-100">
                                    {barem.fiyat} ₺
                                  </span>
                                </div>
                                
                                <div className="pt-5 border-t-2 border-dashed border-gray-200/60 mt-auto relative z-10">
                                  <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">Bu Kademedeki Sipariş</span>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <Tag size={20} className={buBareminToplami > 0 ? "text-green-500" : "text-gray-300"} />
                                      <span className={`text-3xl font-black italic tracking-tighter ${buBareminToplami > 0 ? "text-green-600" : "text-gray-400"}`}>
                                        {buBareminToplami}
                                      </span>
                                    </div>
                                    {buBareminToplami > 0 && <span className="text-[10px] font-bold text-green-500 uppercase bg-green-100 px-2 py-1 rounded-md">Adet Satıldı</span>}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  )
}

// 🎯 KART BİLEŞENİ (Tıklanabilir ve Kaydırılabilir hale getirdik)
function StatCard({ icon, label, value, href }: { icon: any, label: string, value: string, href: string | null }) {
  const CardContent = (
    <div className="bg-white p-8 rounded-[3rem] border border-gray-100 hover:shadow-2xl hover:shadow-gray-100 hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden h-full flex flex-col justify-between">
      <div className="bg-gray-50 w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 italic">{label}</p>
        <p className="text-4xl md:text-5xl font-black text-gray-900 italic tracking-tighter">{value}</p>
      </div>
      {href && (
        <ChevronRight size={24} className="absolute right-8 bottom-8 text-gray-200 group-hover:text-blue-500 group-hover:translate-x-2 transition-all" />
      )}
    </div>
  )

  return href ? (
    <a href={href} className="block h-full cursor-pointer">{CardContent}</a>
  ) : (
    <div className="h-full">{CardContent}</div>
  )
}