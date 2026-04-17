"use client";
import { useState, useMemo } from "react";
import { 
  FileText, CheckCircle, XCircle, X, ShieldCheck, 
  Award, Trash2, ShieldAlert, Users, Store, Clock 
} from "lucide-react";

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
  belgeler: any[]; // 🚀 Modalda kullanılacak kritik array
}

export default function KullanicilarClient({ 
  initialUsers, 
  stats,
  toggleAdminAction, 
  deleteUserAction,
  updateUserStatusAction 
}: { 
  initialUsers: User[];
  stats: { toplam: number, alicilar: number, saticilar: number, onayBekleyenSaticilar: number };
  toggleAdminAction: (userId: number, currentStatus: boolean) => Promise<void>;
  deleteUserAction: (userId: number) => Promise<void>;
  updateUserStatusAction: (userId: number, status: string, level: string) => Promise<void>;
}) {
  const [activeTab, setActiveTab] = useState<"ALICI" | "SATICI">("SATICI");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // 1. Filtreleme Mantığı (Senin yazdığın kod aynen korundu)
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

  return (
    <div className="space-y-8">
      {/* 🚀 ÜST BAŞLIK VE ÖZET KARTLARI */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic flex items-center gap-3">
            <ShieldCheck className="text-blue-600" size={32} /> Yönetim Paneli
          </h1>
          <p className="text-gray-500 font-medium">Kullanıcı yetkileri ve tedarikçi onaylarını buradan yönetin.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Toplam Alıcı" value={stats.alicilar} icon={<Users size={20} />} color="blue" />
        <StatCard title="Toplam Satıcı" value={stats.saticilar} icon={<Store size={20} />} color="purple" />
        <StatCard title="Onay Bekleyen" value={stats.onayBekleyenSaticilar} icon={<Clock size={20} />} color="orange" highlight={stats.onayBekleyenSaticilar > 0} />
        <StatCard title="Genel Toplam" value={stats.toplam} icon={<ShieldCheck size={20} />} color="gray" />
      </div>

      {/* 🚀 TAB VE ARAMA MENÜSÜ */}
      <div className="bg-white rounded-[2.5rem] p-2 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex p-1 bg-gray-50 rounded-2xl w-full md:w-auto">
          <button 
            onClick={() => setActiveTab("SATICI")}
            className={`flex-1 md:flex-none px-8 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === "SATICI" ? "bg-white text-blue-600 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
          >
            Satıcılar ({stats.saticilar})
          </button>
          <button 
            onClick={() => setActiveTab("ALICI")}
            className={`flex-1 md:flex-none px-8 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === "ALICI" ? "bg-white text-blue-600 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
          >
            Alıcılar ({stats.alicilar})
          </button>
        </div>

        <div className="relative w-full md:w-80 px-2">
          <input 
            type="text" 
            placeholder="İsim, e-posta veya firma ara..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 border-none rounded-2xl px-5 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>
      </div>

      {/* 🚀 KULLANICI TABLOSU */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Kullanıcı Bilgileri</th>
                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Durum</th>
                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Yetki/Seviye</th>
                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${user.hesapTuru === "SATICI" ? "bg-purple-50 text-purple-600" : "bg-blue-50 text-blue-600"}`}>
                        {user.ad.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 text-base">{user.ad} {user.soyad}</div>
                        <div className="text-sm text-gray-500 font-medium">{user.email}</div>
                        {user.firmaAdi && <div className="text-[10px] font-bold text-blue-600 uppercase tracking-tighter mt-1">{user.firmaAdi}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                      user.onayDurumu === "APPROVED" ? "bg-green-50 text-green-600" : 
                      user.onayDurumu === "REJECTED" ? "bg-red-50 text-red-600" : "bg-orange-50 text-orange-600"
                    }`}>
                      {user.onayDurumu === "APPROVED" ? <CheckCircle size={14} /> : <Clock size={14} />}
                      {user.onayDurumu === "APPROVED" ? "ONAYLANDI" : user.onayDurumu === "REJECTED" ? "REDDEDİLDİ" : "BEKLİYOR"}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1">
                      {user.isAdmin && <span className="text-[10px] font-black text-orange-500 bg-orange-50 px-2 py-0.5 rounded w-fit">ADMIN</span>}
                      <span className={`text-xs font-bold ${user.tedarikciSeviye === "ALTIN" ? "text-orange-500" : user.tedarikciSeviye === "GUMUS" ? "text-blue-500" : "text-gray-400"}`}>
                        {user.tedarikciSeviye} SEVİYE
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2">
                      
                      {/* 🟢 ALICI HIZLI ONAY BUTONU */}
                      {user.hesapTuru === "ALICI" && user.onayDurumu !== "APPROVED" && (
                        <button 
                          onClick={async () => {
                            if(confirm(`${user.ad} isimli alıcıyı onaylamak istiyor musunuz?`)) {
                              await updateUserStatusAction(user.id, "APPROVED", "NONE");
                            }
                          }}
                          className="p-2.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-xl transition-all flex items-center gap-2 pr-4"
                          title="Alıcıyı Onayla"
                        >
                          <CheckCircle size={20} />
                          <span className="text-xs font-bold uppercase tracking-widest">Hızlı Onay</span>
                        </button>
                      )}

                      {/* 📄 SATICI BELGE İNCELEME */}
                      {user.hesapTuru === "SATICI" && (
                        <button 
                          onClick={() => setSelectedUser(user)} 
                          className="p-2.5 bg-gray-50 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                          title="Belgeleri İncele"
                        >
                          <FileText size={20} />
                        </button>
                      )}

                      {/* 🔑 ADMIN YETKİSİ */}
                      <button 
                        onClick={() => toggleAdminAction(user.id, user.isAdmin)} 
                        className={`p-2.5 rounded-xl transition-all ${user.isAdmin ? "bg-orange-50 text-orange-500" : "bg-gray-50 text-gray-400 hover:text-orange-500 hover:bg-orange-50"}`}
                        title="Admin Yetkisi"
                      >
                        <Award size={20} />
                      </button>

                      {/* 🗑️ SİLME */}
                      <button 
                        onClick={() => { if(confirm("Bu kullanıcıyı silmek istediğinize emin misiniz?")) deleteUserAction(user.id) }} 
                        className="p-2.5 bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
             <div className="text-center py-12 text-gray-400 font-medium text-sm">Arama kriterlerine uygun kullanıcı bulunamadı.</div>
          )}
        </div>
      </div>

      {/* 🚀 BELGE İNCELEME MODALI (Senin yazdığın mükemmel UI korundu) */}
      {selectedUser && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[10000] p-4">
          <div className="bg-white rounded-[3rem] max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
              <div>
                <h2 className="text-2xl font-black text-gray-900 uppercase italic tracking-tight">{selectedUser.firmaAdi || "Firma Bilgisi Bekleniyor"}</h2>
                <p className="text-sm text-gray-500 font-medium">{selectedUser.ad} {selectedUser.soyad} • {selectedUser.email}</p>
              </div>
              <button onClick={() => setSelectedUser(null)} className="w-10 h-10 bg-white shadow-sm border border-gray-100 flex items-center justify-center rounded-full hover:bg-gray-50 transition-colors"><X size={20} /></button>
            </div>

            <div className="p-8 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-8">
                <h3 className="font-black text-blue-600 uppercase text-xs tracking-widest">Kurumsal Kimlik</h3>
                <div className="grid grid-cols-1 gap-4">
                  <DetailBox label="Vergi No / Dairesi" value={`${selectedUser.vergiNo || "-"} / ${selectedUser.vergiDairesi || "-"}`} />
                  <DetailBox label="Yetkili TC Kimlik" value={selectedUser.tcKimlikNo || "-"} />
                  <DetailBox label="Hesap Türü" value={selectedUser.hesapTuru} />
                </div>
              </div>

              <div className="space-y-8">
                <h3 className="font-black text-blue-600 uppercase text-xs tracking-widest">Yüklenen Belgeler</h3>
                {selectedUser.belgeler && selectedUser.belgeler.length > 0 ? (
                  <div className="space-y-3">
                    {selectedUser.belgeler.map((doc: any) => (
                      <div key={doc.id} className="flex items-center justify-between p-5 bg-white border border-gray-100 rounded-3xl hover:border-blue-200 transition-all shadow-sm">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><FileText size={20} /></div>
                          {/* Prisma'daki DOC Enum ismini düzgün formata çevirdik */}
                          <span className="text-sm font-bold text-gray-700">{doc.tip.replace(/_/g, ' ')}</span>
                        </div>
                        <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="bg-gray-900 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-600 transition-all">AÇ</a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-100">
                    <p className="text-gray-400 font-bold text-sm uppercase">Henüz belge yüklenmemiş</p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-8 border-t border-gray-50 bg-gray-50/30 flex flex-wrap gap-4">
              <button 
                onClick={async () => { await updateUserStatusAction(selectedUser.id, "APPROVED", "GUMUS"); setSelectedUser(null); }}
                className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
              >
                Gümüş Onayı Ver
              </button>
              <button 
                onClick={async () => { await updateUserStatusAction(selectedUser.id, "APPROVED", "ALTIN"); setSelectedUser(null); }}
                className="flex-1 bg-orange-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-orange-600 transition-all shadow-lg shadow-orange-100"
              >
                Altın Onayı Ver
              </button>
              <button 
                onClick={async () => { await updateUserStatusAction(selectedUser.id, "REJECTED", "NONE"); setSelectedUser(null); }}
                className="flex-1 bg-white border border-red-100 text-red-500 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-red-50 transition-all"
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

function StatCard({ title, value, icon, color, highlight = false }: any) {
  const colors: any = {
    blue: "text-blue-600 bg-blue-50",
    purple: "text-purple-600 bg-purple-50",
    orange: "text-orange-600 bg-orange-50",
    gray: "text-gray-600 bg-gray-50",
  };
  return (
    <div className={`bg-white p-6 rounded-[2rem] border ${highlight ? 'border-orange-200 ring-4 ring-orange-50' : 'border-gray-100'} shadow-sm transition-all hover:shadow-md`}>
      <div className="flex justify-between items-start">
        <div className={`p-3 rounded-2xl ${colors[color]}`}>{icon}</div>
        <span className={`text-2xl font-black ${highlight ? 'text-orange-600' : 'text-gray-900'}`}>{value}</span>
      </div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-4">{title}</p>
    </div>
  );
}

function DetailBox({ label, value }: { label: string, value: string }) {
  return (
    <div className="bg-gray-50/50 p-5 rounded-3xl border border-gray-100">
      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1 block">{label}</label>
      <p className="font-bold text-gray-900">{value}</p>
    </div>
  );
}