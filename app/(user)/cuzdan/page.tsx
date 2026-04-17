import { getWalletData } from "./actions";
import { Wallet, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle2, Coins } from "lucide-react";

export default async function CuzdanPage() {
  const data = await getWalletData();

  return (
    <div className="space-y-10">
      {/* ÜST BAŞLIK */}
      <header className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center text-white shadow-xl">
          <Wallet size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-gray-900">Puan Cüzdanım</h1>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">Mingax Finansal Varlıkların</p>
        </div>
      </header>

      {/* BAKİYE KARTLARI */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* ANA BAKİYE */}
        <div className="bg-gray-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl group">
          <div className="relative z-10 space-y-4">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-50">Kullanılabilir Bakiye</p>
            <div className="flex items-baseline gap-2">
              <span className="text-6xl font-black italic tracking-tighter">{data.balance.toFixed(2)}</span>
              <span className="text-xl font-bold opacity-50 italic">MP</span>
            </div>
            <p className="text-[9px] font-bold text-blue-400 uppercase tracking-widest italic pt-4">
              * 1 MP (Mingax Puan) = 1 TL değerindedir.
            </p>
          </div>
          <Coins className="absolute -right-8 -bottom-8 text-white/5 group-hover:scale-110 transition-transform duration-700" size={200} />
        </div>

        {/* BEKLEYEN BAKİYE */}
        <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-orange-500">
               <Clock size={16} />
               <p className="text-[10px] font-black uppercase tracking-[0.2em]">Bekleyen Puanlar</p>
            </div>
            <div className="flex items-baseline gap-2 text-gray-900">
              <span className="text-5xl font-black italic tracking-tighter">{data.pending.toFixed(2)}</span>
              <span className="text-lg font-bold text-gray-300 italic">MP</span>
            </div>
          </div>
          <p className="text-[10px] font-bold text-gray-400 italic leading-relaxed mt-6">
            İlanlar başarıyla kapandığında bu tutar ana bakiyene eklenecektir.
          </p>
        </div>
      </div>

      {/* SON İŞLEMLER LİSTESİ */}
      <section className="space-y-6">
        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 ml-4 italic">Son İşlemler</h2>
        <div className="bg-white rounded-[3.5rem] border border-gray-100 shadow-xl overflow-hidden">
          {data.transactions.length > 0 ? (
            <div className="divide-y divide-gray-50">
              {data.transactions.map((tx) => (
                <div key={tx.id} className="p-8 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                      tx.type === 'SPENDING' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'
                    }`}>
                      {tx.type === 'SPENDING' ? <ArrowUpRight size={24} /> : <ArrowDownLeft size={24} />}
                    </div>
                    <div>
                      <p className="text-sm font-black italic uppercase text-gray-900">
                        {tx.type === 'INITIATOR' ? 'Alım Başlatma Ödülü' : tx.type === 'REFERRER' ? 'Davet Ödülü' : 'Puan Harcaması'}
                      </p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        {new Date(tx.createdAt).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-black italic ${tx.type === 'SPENDING' ? 'text-red-500' : 'text-green-600'}`}>
                      {tx.type === 'SPENDING' ? '-' : '+'}{tx.amount.toFixed(2)} MP
                    </p>
                    <div className="flex items-center justify-end gap-1 mt-1">
                      {tx.status === 'APPROVED' ? (
                        <CheckCircle2 size={12} className="text-green-500" />
                      ) : (
                        <Clock size={12} className="text-orange-400" />
                      )}
                      <span className="text-[9px] font-black uppercase text-gray-400 italic">
                        {tx.status === 'APPROVED' ? 'Tamamlandı' : 'Beklemede'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-20 text-center text-gray-300 font-black italic uppercase tracking-tighter text-xl">
              Henüz bir işlem bulunmuyor
            </div>
          )}
        </div>
      </section>
    </div>
  );
}