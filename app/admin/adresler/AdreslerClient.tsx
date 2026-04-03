"use client";
import { useState, useMemo } from "react";

interface Adres {
  id: string;
  baslik: string;
  teslimAlacakKisi: string;
  telefon: string;
  adresSatiri: string;
  ilce: string;
  il: string;
  isVarsayilanTeslimat: boolean;
  isVarsayilanFatura: boolean;
  faturaTuru: string;
  user: {
    ad: string;
    soyad: string;
  };
}

type ShowColumnsKey = 
  | "id" 
  | "kullanici" 
  | "baslik" 
  | "teslimAlan" 
  | "telefon" 
  | "adres" 
  | "varsayilanTeslimat" 
  | "varsayilanFatura" 
  | "faturaTuru" 
  | "islem";

export default function AdreslerClient({ initialAdresler }: { initialAdresler: Adres[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterField, setFilterField] = useState("baslik");
  const [showColumns, setShowColumns] = useState<Record<ShowColumnsKey, boolean>>({
    id: true,
    kullanici: true,
    baslik: true,
    teslimAlan: true,
    telefon: true,
    adres: true,
    varsayilanTeslimat: true,
    varsayilanFatura: true,
    faturaTuru: true,
    islem: true,
  });

  const toggleColumn = (key: ShowColumnsKey) => {
    setShowColumns(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const filtered = useMemo(() => {
    if (!searchTerm) return initialAdresler;
    return initialAdresler.filter(adres => {
      let value = "";
      if (filterField === "kullanici") value = `${adres.user.ad} ${adres.user.soyad}`;
      else if (filterField === "adres") value = `${adres.adresSatiri} ${adres.ilce} ${adres.il}`;
      else value = adres[filterField as keyof Adres]?.toString() || "";
      return value.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [initialAdresler, searchTerm, filterField]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Adres Yönetimi</h1>
      
      <div className="mb-4 p-2 bg-gray-100 rounded flex flex-wrap gap-3">
        <span className="font-semibold">Sütunlar:</span>
        {Object.entries(showColumns).map(([key, val]) => {
          const colKey = key as ShowColumnsKey;
          return (
            <label key={colKey} className="inline-flex items-center gap-1">
              <input type="checkbox" checked={val} onChange={() => toggleColumn(colKey)} />
              <span className="text-sm">
                {colKey === "kullanici" ? "Kullanıcı" : 
                 colKey === "teslimAlan" ? "Teslim Alan" : 
                 colKey === "varsayilanTeslimat" ? "Vars. Teslimat" : 
                 colKey === "varsayilanFatura" ? "Vars. Fatura" : 
                 colKey}
              </span>
            </label>
          );
        })}
      </div>

      <div className="mb-4 flex gap-2">
        <select value={filterField} onChange={e => setFilterField(e.target.value)} className="border rounded px-2 py-1">
          <option value="baslik">Başlık</option>
          <option value="kullanici">Kullanıcı</option>
          <option value="teslimAlacakKisi">Teslim Alan</option>
          <option value="telefon">Telefon</option>
          <option value="il">İl</option>
          <option value="adres">Adres</option>
        </select>
        <input type="text" placeholder="Filtrele..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="border rounded px-2 py-1 w-64" />
      </div>

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              {showColumns.id && <th className="px-4 py-2">ID</th>}
              {showColumns.kullanici && <th className="px-4 py-2">Kullanıcı</th>}
              {showColumns.baslik && <th className="px-4 py-2">Başlık</th>}
              {showColumns.teslimAlan && <th className="px-4 py-2">Teslim Alan</th>}
              {showColumns.telefon && <th className="px-4 py-2">Telefon</th>}
              {showColumns.adres && <th className="px-4 py-2">Adres</th>}
              {showColumns.varsayilanTeslimat && <th className="px-4 py-2">Vars. Teslimat</th>}
              {showColumns.varsayilanFatura && <th className="px-4 py-2">Vars. Fatura</th>}
              {showColumns.faturaTuru && <th className="px-4 py-2">Fatura Türü</th>}
              {showColumns.islem && <th className="px-4 py-2">İşlem</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.map(adres => (
              <tr key={adres.id} className="border-t">
                {showColumns.id && <td className="px-4 py-2">{adres.id}</td>}
                {showColumns.kullanici && <td className="px-4 py-2">{adres.user.ad} {adres.user.soyad}</td>}
                {showColumns.baslik && <td className="px-4 py-2">{adres.baslik}</td>}
                {showColumns.teslimAlan && <td className="px-4 py-2">{adres.teslimAlacakKisi}</td>}
                {showColumns.telefon && <td className="px-4 py-2">{adres.telefon}</td>}
                {showColumns.adres && <td className="px-4 py-2">{adres.adresSatiri}, {adres.ilce}/{adres.il}</td>}
                {showColumns.varsayilanTeslimat && <td className="px-4 py-2">{adres.isVarsayilanTeslimat ? "✅" : "❌"}</td>}
                {showColumns.varsayilanFatura && <td className="px-4 py-2">{adres.isVarsayilanFatura ? "✅" : "❌"}</td>}
                {showColumns.faturaTuru && <td className="px-4 py-2">{adres.faturaTuru === "BIREYSEL" ? "Bireysel" : "Kurumsal"}</td>}
                {showColumns.islem && (
                  <td className="px-4 py-2">
                    <form action={`/api/admin/adres/sil/${adres.id}`} method="POST">
                      <button className="bg-red-500 text-white px-2 py-1 rounded text-sm">Sil</button>
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