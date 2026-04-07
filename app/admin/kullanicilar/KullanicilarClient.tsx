"use client";
import { useState, useMemo } from "react";
import { FileText, CheckCircle, XCircle, X, ShieldCheck, Award, Trash2, ShieldAlert } from "lucide-react";

interface Adres {
  id: string;
  baslik: string;
  adresSatiri: string;
  ilce: string;
  il: string;
  telefon: string;
  isVarsayilanTeslimat: boolean;
  isVarsayilanFatura: boolean;
}

interface Document {
  id: number;
  tip: string;
  fileUrl: string;
  durum: string;
  redNedeni?: string;
}

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
  adresler: Adres[];
  belgeler: Document[];
}

type ShowColumnsKey = "id" | "ad" | "soyad" | "email" | "hesapTuru" | "onayDurumu" | "seviye" | "isAdmin" | "islem";

export default function KullanicilarClient({ 
  initialUsers, 
  toggleAdminAction, 
  deleteUserAction,
  updateUserStatusAction // Bu yeni server action'ı eklemelisin
}: { 
  initialUsers: User[];
  toggleAdminAction: (userId: number, currentStatus: boolean) => Promise<void>;
  deleteUserAction: (userId: number) => Promise<void>;
  updateUserStatusAction: (userId: number, status: string, level: string) => Promise<void>;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterField, setFilterField] = useState<keyof User>("ad");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  const [showColumns, setShowColumns] = useState<Record<ShowColumnsKey, boolean>>({
    id: false,
    ad: true,
    soyad: true,
    email: true,
    hesapTuru: true,
    onayDurumu: true,
    seviye: true,
    isAdmin: true,
    islem: true,
  });

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return initialUsers;
    return initialUsers.filter(user => {
      const value = user[filterField];
      return String(value).toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [initialUsers, searchTerm, filterField]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <ShieldCheck className="text-blue-600" /> Kullanıcı ve Tedarikçi Yönetimi
      </h1>
      
      {/* Sütun Filtreleri */}
      <div className="mb-6 p-4 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center">
        <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Görünüm:</span>
        {Object.keys(showColumns).map((key) => (
          <label key={key} className="inline-flex items-center gap-2 cursor-pointer bg-gray-50 px-3 py-1 rounded-full border hover:border-blue-400 transition">
<input 
  type="checkbox" 
  checked={showColumns[key as ShowColumnsKey]} 
  onChange={() => setShowColumns(prev => ({ 
    ...prev, 
    [key as ShowColumnsKey]: !prev[key as ShowColumnsKey] // Kırmızılık burada gidiyor
  }))} 
  className="rounded text-blue-600" 
/>            <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
          </label>
        ))}
      </div>

      {/* Arama Barı */}
      <div className="mb-6 flex gap-3">
        <select value={filterField} onChange={e => setFilterField(e.target.value as keyof User)} className="border rounded-xl px-4 py-2 bg-white shadow-sm outline-none focus:ring-2 focus:ring-blue-500">
          <option value="ad">Ad</option>
          <option value="soyad">Soyad</option>
          <option value="email">E-posta</option>
          <option value="firmaAdi">Firma Adı</option>
        </select>
        <input type="text" placeholder="Hızlı ara..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="border rounded-xl px-4 py-2 w-full max-w-md shadow-sm outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      {/* Tablo */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {showColumns.id && <th className="px-6 py-4 text-sm font-bold text-gray-600">ID</th>}
              {showColumns.ad && <th className="px-6 py-4 text-sm font-bold text-gray-600">Kullanıcı</th>}
              {showColumns.email && <th className="px-6 py-4 text-sm font-bold text-gray-600">İletişim</th>}
              {showColumns.hesapTuru && <th className="px-6 py-4 text-sm font-bold text-gray-600">Tür</th>}
              {showColumns.onayDurumu && <th className="px-6 py-4 text-sm font-bold text-gray-600">Onay Durumu</th>}
              {showColumns.seviye && <th className="px-6 py-4 text-sm font-bold text-gray-600">Seviye</th>}
              {showColumns.islem && <th className="px-6 py-4 text-sm font-bold text-gray-600 text-right">İşlemler</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredUsers.map(user => (
              <tr key={user.id} className="hover:bg-blue-50/30 transition-colors">
                {showColumns.id && <td className="px-6 py-4 text-sm">{user.id}</td>}
                {showColumns.ad && (
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">{user.ad} {user.soyad}</div>
                    <div className="text-xs text-gray-500">{user.firmaAdi || "Bireysel"}</div>
                  </td>
                )}
                {showColumns.email && <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>}
                {showColumns.hesapTuru && (
                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold px-2 py-1 rounded-lg ${user.hesapTuru === "SATICI" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
                      {user.hesapTuru}
                    </span>
                  </td>
                )}
                {showColumns.onayDurumu && (
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${
                      user.onayDurumu === "APPROVED" ? "bg-green-100 text-green-700" : 
                      user.onayDurumu === "REJECTED" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {user.onayDurumu === "APPROVED" ? <CheckCircle size={12} /> : <ShieldAlert size={12} />}
                      {user.onayDurumu}
                    </span>
                  </td>
                )}
                {showColumns.seviye && (
                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold ${user.tedarikciSeviye === "ALTIN" ? "text-orange-500" : user.tedarikciSeviye === "GUMUS" ? "text-gray-400" : "text-gray-300"}`}>
                      {user.tedarikciSeviye}
                    </span>
                  </td>
                )}
                <td className="px-6 py-4 text-right space-x-2">
                  <button onClick={() => setSelectedUser(user)} className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition" title="Belgeleri Gör">
                    <FileText size={18} />
                  </button>
                  <button onClick={() => toggleAdminAction(user.id, user.isAdmin)} className={`p-2 rounded-lg transition ${user.isAdmin ? "text-orange-600 hover:bg-orange-100" : "text-gray-400 hover:bg-gray-100"}`} title="Admin Yetkisi">
                    <Award size={18} />
                  </button>
                  <button onClick={() => deleteUserAction(user.id)} className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* BELGE İNCELEME MODALI */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedUser.firmaAdi || "Firma Bilgisi Yok"}</h2>
                <p className="text-sm text-gray-500">{selectedUser.ad} {selectedUser.soyad} • {selectedUser.email}</p>
              </div>
              <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-gray-200 rounded-full transition"><X size={24} /></button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Sol: Firma Bilgileri */}
              <div className="space-y-6">
                <h3 className="font-bold text-blue-600 uppercase text-xs tracking-widest">Temel Bilgiler</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-gray-50 p-4 rounded-2xl">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Vergi Numarası / Dairesi</label>
                    <p className="font-medium">{selectedUser.vergiNo || "-"} / {selectedUser.vergiDairesi || "-"}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Yetkili TC Kimlik</label>
                    <p className="font-medium">{selectedUser.tcKimlikNo || "-"}</p>
                  </div>
                </div>
              </div>

              {/* Sağ: Belgeler */}
              <div className="space-y-6">
                <h3 className="font-bold text-blue-600 uppercase text-xs tracking-widest">Yüklenen Belgeler</h3>
                {selectedUser.belgeler && selectedUser.belgeler.length > 0 ? (
                  <div className="space-y-3">
                    {selectedUser.belgeler.map(doc => (
                      <div key={doc.id} className="flex items-center justify-between p-4 bg-white border rounded-2xl hover:border-blue-300 transition">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><FileText size={16} /></div>
                          <span className="text-sm font-medium">{doc.tip}</span>
                        </div>
                        <a href={doc.fileUrl} target="_blank" className="text-xs font-bold text-blue-600 hover:underline">AÇ</a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed">
                    <p className="text-gray-400 text-sm">Henüz belge yüklenmemiş.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Alt: İşlem Butonları */}
            <div className="p-6 border-t bg-gray-50 flex flex-wrap gap-3">
              <button 
                onClick={async () => {
                  await updateUserStatusAction(selectedUser.id, "APPROVED", "GUMUS");
                  setSelectedUser(null);
                }}
                className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition shadow-lg shadow-green-100 flex items-center justify-center gap-2"
              >
                <CheckCircle size={20} /> Gümüş Onayı Ver
              </button>
              <button 
                onClick={async () => {
                  await updateUserStatusAction(selectedUser.id, "APPROVED", "ALTIN");
                  setSelectedUser(null);
                }}
                className="flex-1 bg-orange-500 text-white py-3 rounded-xl font-bold hover:bg-orange-600 transition shadow-lg shadow-orange-100 flex items-center justify-center gap-2"
              >
                <Award size={20} /> Altın Onayı Ver
              </button>
              <button 
                onClick={async () => {
                  await updateUserStatusAction(selectedUser.id, "REJECTED", "NONE");
                  setSelectedUser(null);
                }}
                className="flex-1 bg-red-100 text-red-600 py-3 rounded-xl font-bold hover:bg-red-200 transition flex items-center justify-center gap-2"
              >
                <XCircle size={20} /> Reddet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}