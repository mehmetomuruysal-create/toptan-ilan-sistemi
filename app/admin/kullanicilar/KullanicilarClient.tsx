"use client";
import { useState, useMemo } from "react";

interface Adres {
  id: string;  // number -> string
  baslik: string;
  adresSatiri: string;
  ilce: string;
  il: string;
  telefon: string;
  isVarsayilanTeslimat: boolean;
  isVarsayilanFatura: boolean;
}

interface User {
  id: number;
  ad: string;
  soyad: string;
  email: string;
  hesapTuru: string;
  isAdmin: boolean;
  adresler: Adres[];
}

type ShowColumnsKey = "id" | "ad" | "soyad" | "email" | "hesapTuru" | "isAdmin" | "adresSayisi" | "adresler" | "islem";

export default function KullanicilarClient({ 
  initialUsers, 
  toggleAdminAction, 
  deleteUserAction 
}: { 
  initialUsers: User[];
  toggleAdminAction: (userId: number, currentStatus: boolean) => Promise<void>;
  deleteUserAction: (userId: number) => Promise<void>;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterField, setFilterField] = useState<keyof User>("ad");
  const [showColumns, setShowColumns] = useState<Record<ShowColumnsKey, boolean>>({
    id: true,
    ad: true,
    soyad: true,
    email: true,
    hesapTuru: true,
    isAdmin: true,
    adresSayisi: true,
    adresler: true,
    islem: true,
  });

  const toggleColumn = (key: ShowColumnsKey) => {
    setShowColumns(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return initialUsers;
    return initialUsers.filter(user => {
      const value = user[filterField];
      if (typeof value === 'string') {
        return value.toLowerCase().includes(searchTerm.toLowerCase());
      }
      if (typeof value === 'number') {
        return value.toString().includes(searchTerm);
      }
      if (typeof value === 'boolean') {
        return (value ? "evet" : "hayır").includes(searchTerm.toLowerCase());
      }
      return false;
    });
  }, [initialUsers, searchTerm, filterField]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Kullanıcı Yönetimi</h1>
      
      <div className="mb-4 p-2 bg-gray-100 rounded flex flex-wrap gap-3">
        <span className="font-semibold">Sütunlar:</span>
        {Object.entries(showColumns).map(([key, value]) => {
          const colKey = key as ShowColumnsKey;
          return (
            <label key={colKey} className="inline-flex items-center gap-1">
              <input type="checkbox" checked={value} onChange={() => toggleColumn(colKey)} />
              <span className="text-sm">
                {colKey === "ad" ? "Ad" : 
                 colKey === "soyad" ? "Soyad" : 
                 colKey === "hesapTuru" ? "Hesap Türü" : 
                 colKey === "isAdmin" ? "Admin" : 
                 colKey === "adresSayisi" ? "Adres Sayısı" : 
                 colKey === "adresler" ? "Adresler" : 
                 colKey === "islem" ? "İşlem" : colKey}
              </span>
            </label>
          );
        })}
      </div>

      <div className="mb-4 flex gap-2">
        <select value={filterField} onChange={e => setFilterField(e.target.value as keyof User)} className="border rounded px-2 py-1">
          <option value="ad">Ad</option>
          <option value="soyad">Soyad</option>
          <option value="email">E-posta</option>
          <option value="hesapTuru">Hesap Türü</option>
          <option value="isAdmin">Admin</option>
          <option value="id">ID</option>
        </select>
        <input type="text" placeholder="Filtrele..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="border rounded px-2 py-1 w-64" />
      </div>

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              {showColumns.id && <th className="px-4 py-2">ID</th>}
              {showColumns.ad && <th className="px-4 py-2">Ad</th>}
              {showColumns.soyad && <th className="px-4 py-2">Soyad</th>}
              {showColumns.email && <th className="px-4 py-2">E-posta</th>}
              {showColumns.hesapTuru && <th className="px-4 py-2">Hesap Türü</th>}
              {showColumns.isAdmin && <th className="px-4 py-2">Admin</th>}
              {showColumns.adresSayisi && <th className="px-4 py-2">Adres Sayısı</th>}
              {showColumns.adresler && <th className="px-4 py-2">Adresler</th>}
              {showColumns.islem && <th className="px-4 py-2">İşlem</th>}
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id} className="border-t">
                {showColumns.id && <td className="px-4 py-2">{user.id}</td>}
                {showColumns.ad && <td className="px-4 py-2">{user.ad}</td>}
                {showColumns.soyad && <td className="px-4 py-2">{user.soyad}</td>}
                {showColumns.email && <td className="px-4 py-2">{user.email}</td>}
                {showColumns.hesapTuru && <td className="px-4 py-2">{user.hesapTuru}</td>}
                {showColumns.isAdmin && <td className="px-4 py-2">{user.isAdmin ? "✅ Evet" : "❌ Hayır"}</td>}
                {showColumns.adresSayisi && <td className="px-4 py-2">{user.adresler.length}</td>}
                {showColumns.adresler && (
                  <td className="px-4 py-2">
                    {user.adresler.length > 0 ? (
                      <details>
                        <summary className="cursor-pointer text-blue-600">Adresleri göster</summary>
                        <ul className="mt-2 space-y-1">
                          {user.adresler.map(adres => (
                            <li key={adres.id} className="text-xs border-b pb-1">
                              <strong>{adres.baslik}</strong><br />
                              {adres.adresSatiri}, {adres.ilce}/{adres.il}<br />
                              {adres.telefon}<br />
                              {adres.isVarsayilanTeslimat && "🏠 Varsayılan Teslimat "}
                              {adres.isVarsayilanFatura && "📄 Varsayılan Fatura"}
                            </li>
                          ))}
                        </ul>
                      </details>
                    ) : "Adres yok"}
                  </td>
                )}
                {showColumns.islem && (
                  <td className="px-4 py-2 space-x-2">
                    <form action={toggleAdminAction.bind(null, user.id, user.isAdmin)} className="inline">
                      <button className="px-3 py-1 bg-yellow-500 text-white rounded text-sm">
                        {user.isAdmin ? "Admin Kaldır" : "Admin Yap"}
                      </button>
                    </form>
                    <form action={deleteUserAction.bind(null, user.id)} className="inline">
                      <button className="px-3 py-1 bg-red-500 text-white rounded text-sm">Sil</button>
                    </form>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}