"use client";
import { useState, useMemo } from "react";
import { 
  FileText, CheckCircle, XCircle, X, ShieldCheck, 
  Award, Trash2, ShieldAlert, Users, Store, Clock, Search 
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

interface User {
  id: number;
  ad: string;
  soyad: string;
  email: string;
  hesapTuru: string;
  isAdmin: boolean;
  onayDurumu: string;
  tedarikciSeviye: string;
  firmaAdi?: string;
  vergiNo?: string;
  vergiDairesi?: string;
  tcKimlikNo?: string;
  adresler: any[];
  belgeler: any[];
}

export default function KullanicilarClient({ 
  initialUsers, 
  stats,
  activeFilter,
  toggleAdminAction, 
  deleteUserAction,
  updateUserStatusAction 
}: { 
  initialUsers: User[];
  stats: { toplam: number, alicilar: number, saticilar: number, onayBekleyenSaticilar: number };
  activeFilter?: string;
  toggleAdminAction: (userId: number, currentStatus: boolean) => Promise<void>;
  deleteUserAction: (userId: number) => Promise<void>;
  updateUserStatusAction: (userId: number, status: string, level: string) => Promise<void>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"ALICI" | "SATICI">("SATICI");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // 🚀 Filtreleme Mantığı
  const filteredUsers = useMemo(() => {
    return initialUsers
      .filter(user => user.hesapTuru === activeTab)
      .filter(user => 
        user.ad.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.soyad.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.firmaAdi?.toLowerCase() || "").includes(searchTerm.toLowerCase())
      );
  }, [initialUsers, activeTab, searchTerm]);

  // 🚀 Filtreleme Tetikleyici
  const handleFilterClick = (filter: string | null) => {
    if (filter) {
      router.push(`/admin/kullanicilar?filter=${filter}`);
    } else {
      router.push(`/admin/kullanicilar`);
    }
  };

  return (
    <div className="space-y-10">
      
      {/* 📊 İSTATİSTİK KARTLARI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Genel Toplam" 
          value={stats.toplam} 
          icon={<Users size={20} />} 
          color="gray" 
          onClick={() => handleFilterClick(null)}
          active={!activeFilter}
        />
        <StatCard 
          title="Toplam Alıcı" 
          value={stats.alicilar} 
          icon={<ShieldCheck size={20} />} 
          color="blue" 
        />
        <StatCard 
          title="Toplam Satıcı" 
          value={stats.saticilar} 
          icon={<Store size={20} />} 
          color="purple" 
        />
        <StatCard 
          title="Onay Bekleyen" 
          value={stats.onayBekleyenSaticilar} 
          icon={<ShieldAlert size={20} />} 
          color="orange" 
          onClick={() => handleFilterClick("pending")}
          active={activeFilter === "pending"}
          highlight={stats.onayBekleyenSaticilar > 0} 
        />
      </div>

      {/* 🔍 KONTROL PANELİ (Tablar ve Arama) */}
      <div className="bg-white rounded-[2.5rem] p-4 shadow-2xl shadow-gray-200/50 border border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex p-1.5 bg-gray-50 rounded-[1.5rem] w-full md:w-auto">
          <button 
            onClick={() => setActiveTab("SATICI")}
            className={`flex-1 md:flex-none px-10 py-3.5 rounded-xl font-black text-[10px] uppercase italic tracking-widest transition-all ${activeTab === "SATICI" ? "bg-white text-blue-600 shadow-xl" : "text-gray-400 hover:text-gray-600"}`}
          >
            Satıcılar ({stats.saticilar})
          </button>
          <button 
            onClick={() => setActiveTab("ALICI")}
            className={`flex-1 md:flex-none px-10 py-3.5 rounded-xl font-black text-[10px] uppercase italic tracking-widest transition-all ${activeTab === "ALICI" ? "bg-white text-blue-600 shadow-xl" : "text-gray-400 hover:text-gray-600"}`}
          >
            Alıcılar ({stats.alicilar})
          </button>
        </div>

        <div className="relative w-full md:w-96">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="İSİM, E-POSTA VEYA FİRMA ARA..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 border-2 border-transparent rounded-[1.5rem] pl-14 pr-6 py-4 text-[10px] font-black uppercase tracking-widest focus:bg-white focus:border-blue-600 outline-none transition-all"
          />
        </div>
      </div>

      {/* 📋 KULLANICI LİSTESİ */}
      <div className="bg-white rounded-[3rem] shadow-2xl shadow-gray-200/50 border border-gray-50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-10 py-7 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] italic">Kullanıcı / Firma</th>
                <th className="px-10 py-7 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] italic">Durum</th>
                <th className="px-10 py-7 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] italic">Yetki/Seviye</th>
                <th className="px-10 py-7 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] italic text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-gray-50/30 transition-colors group">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-5">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner ${user.hesapTuru === "SATICI" ? "bg-purple-50 text-purple-600" : "bg-blue-50 text-blue-600"}`}>
                        {user.ad.charAt(0)}
                      </div>
                      <div>
                        <div className="font-black italic uppercase text-sm text-gray-900 leading-tight">{user.ad} {user.soyad}</div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{user.email}</div>
                        {user.firmaAdi && <div className="text-[9px] font-black text-blue-600 uppercase italic mt-1.5 bg-blue-50 px-2 py-0.5 rounded inline-block">{user.firmaAdi}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <span className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest italic border ${
                      user.onayDurumu === "APPROVED" ? "bg-green-50 text-green-600 border-green-100" : 
                      user.onayDurumu === "REJECTED" ? "bg-red-50 text-red-600 border-red-100" : "bg-orange-50 text-orange-600 border-orange-100"
                    }`}>
                      {user.onayDurumu === "APPROVED" ? "ONAYLANDI" : user.onayDurumu === "REJECTED" ? "REDDEDİLDİ" : "BEKLİYOR"}
                    </span>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex flex-col gap-1.5">
                      {user.isAdmin && <span className="text-[9px] font-black text-orange-600 bg-orange-50 px-3 py-1 rounded-lg border border-orange-100 w-fit">ADMIN</span>}
                      <span className={`text-[10px] font-black italic uppercase ${user.tedarikciSeviye === "ALTIN" ? "text-orange-500" : user.tedarikciSeviye === "GUMUS" ? "text-blue-500" : "text-gray-400"}`}>
                        {user.tedarikciSeviye} SEVİYE
                      </span>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <div className="flex justify-end gap-3">
                      {user.hesapTuru === "SATICI" ? (
                        <button 
                          onClick={() => setSelectedUser(user)} 
                          className="p-3 bg-gray-50 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all shadow-sm"
                          title="Belgeleri İncele"
                        >
                          <FileText size={20} />
                        </button>
                      ) : (
                        user.onayDurumu !== "APPROVED" && (
                          <button 
                            onClick={async () => {
                              if(confirm(`${user.ad} onaylansın mı?`)) await updateUserStatusAction(user.id, "APPROVED", "NONE");
                            }}
                            className="p-3 bg-green-50 text-green-600 hover:bg-green-600 hover:text-white rounded-2xl transition-all flex items-center gap-2"
                          >
                            <CheckCircle size={20} />
                          </button>
                        )
                      )}
                      <button 
                        onClick={() => toggleAdminAction(user.id, user.isAdmin)} 
                        className={`p-3 rounded-2xl transition-all ${user.isAdmin ? "bg-orange-600 text-white shadow-lg shadow-orange-100" : "bg-gray-50 text-gray-400 hover:bg-orange-600 hover:text-white"}`}
                      >
                        <Award size={20} />
                      </button>
                      <button 
                        onClick={() => { if(confirm("Kullanıcı silinsin mi?")) deleteUserAction(user.id) }} 
                        className="p-3 bg-gray-50 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🚀 MODAL: BELGE DENETİM MERKEZİ */}
      {selectedUser && (
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-md flex items-center justify-center z-[999] p-4">
          <div className="bg-white rounded-[4rem] max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-[0_32px_128px_rgba(0,0,0,0.3)] flex flex-col animate-in zoom-in-95 duration-300">
            <div className="p-12 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h2 className="text-4xl font-black text-gray-900 uppercase italic tracking-tighter leading-none">{selectedUser.firmaAdi || "KURUMSAL KİMLİK"}</h2>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.4em] mt-4 ml-1">{selectedUser.ad} {selectedUser.soyad} • {selectedUser.email}</p>
              </div>
              <button onClick={() => setSelectedUser(null)} className="w-16 h-16 bg-white shadow-2xl border border-gray-100 flex items-center justify-center rounded-[1.5rem] hover:bg-red-50 hover:text-red-500 transition-all active:scale-95"><X size={28} /></button>
            </div>

            <div className="p-12 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-16">
              <div className="space-y-10">
                <h3 className="font-black text-blue-600 uppercase text-xs tracking-[0.3em] italic">Kayıtlı Veriler</h3>
                <div className="space-y-4">
                  <DetailBox label="Vergi No / Dairesi" value={`${selectedUser.vergiNo || "-"} / ${selectedUser.vergiDairesi || "-"}`} />
                  <DetailBox label="Yetkili TC Kimlik" value={selectedUser.tcKimlikNo || "-"} />
                  <DetailBox label="Hesap Türü" value={selectedUser.hesapTuru} />
                </div>
              </div>

              <div className="space-y-10">
                <h3 className="font-black text-blue-600 uppercase text-xs tracking-[0.3em] italic">Yüklenen Belgeler</h3>
                {selectedUser.belgeler && selectedUser.belgeler.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3">
                    {selectedUser.belgeler.map((doc: any) => (
                      <div key={doc.id} className="flex items-center justify-between p-6 bg-gray-50 rounded-[1.5rem] border border-transparent hover:border-blue-600 transition-all group shadow-inner">
                        <div className="flex items-center gap-4">
                          <div className="p-4 bg-white text-blue-600 rounded-2xl shadow-sm"><FileText size={20} /></div>
                          <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{doc.tip.replace(/_/g, ' ')}</span>
                        </div>
                        <a href={doc.fileUrl} target="_blank" className="bg-gray-900 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all">GÖRÜNTÜLE</a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-gray-50 rounded-[2.5rem] border-4 border-dashed border-gray-100">
                    <ShieldAlert size={48} className="mx-auto text-gray-200 mb-4" />
                    <p className="text-gray-400 font-black text-[10px] uppercase tracking-widest">Belge Yüklenmemiş</p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-12 border-t border-gray-100 bg-gray-50/50 flex flex-wrap gap-5">
              <button 
                onClick={async () => { await updateUserStatusAction(selectedUser.id, "APPROVED", "BRONZ"); setSelectedUser(null); }}
                className="flex-1 bg-white border-2 border-gray-200 text-gray-900 py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] hover:border-blue-600 transition-all"
              >
                Bronz Onay
              </button>
              <button 
                onClick={async () => { await updateUserStatusAction(selectedUser.id, "APPROVED", "GUMUS"); setSelectedUser(null); }}
                className="flex-1 bg-blue-600 text-white py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] hover:bg-gray-900 transition-all shadow-xl shadow-blue-100"
              >
                Gümüş Onay
              </button>
              <button 
                onClick={async () => { await updateUserStatusAction(selectedUser.id, "APPROVED", "ALTIN"); setSelectedUser(null); }}
                className="flex-1 bg-orange-600 text-white py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] hover:bg-gray-900 transition-all shadow-xl shadow-orange-100"
              >
                Altın Onay
              </button>
              <button 
                onClick={async () => { await updateUserStatusAction(selectedUser.id, "REJECTED", "NONE"); setSelectedUser(null); }}
                className="flex-1 bg-white border-2 border-red-100 text-red-500 py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] hover:bg-red-500 hover:text-white transition-all"
              >
                Reddet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon, color, highlight, active, onClick }: any) {
  const colors: any = {
    blue: "text-blue-600 bg-blue-50 border-blue-100",
    purple: "text-purple-600 bg-purple-50 border-purple-100",
    orange: "text-orange-600 bg-orange-50 border-orange-100",
    gray: "text-gray-600 bg-gray-50 border-gray-200",
  };
  return (
    <div 
      onClick={onClick}
      className={`bg-white p-8 rounded-[2.5rem] border-2 transition-all cursor-pointer shadow-xl ${active ? 'border-blue-600 ring-8 ring-blue-50 scale-[1.05]' : highlight ? 'border-orange-200 animate-pulse' : 'border-gray-50 hover:border-blue-300 shadow-gray-200/30'}`}
    >
      <div className="flex justify-between items-start">
        <div className={`p-4 rounded-2xl border ${colors[color]}`}>{icon}</div>
        <span className="text-4xl font-black italic tracking-tighter text-gray-900">{value}</span>
      </div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] italic mt-6">{title}</p>
    </div>
  );
}

function DetailBox({ label, value }: { label: string, value: string }) {
  return (
    <div className="bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-inner">
      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">{label}</label>
      <p className="font-black text-gray-900 text-xs uppercase">{value}</p>
    </div>
  );
}