"use client";

import { useState } from "react";
import { upload } from "@vercel/blob/client";

export default function DogrulamaSayfasi() {
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<{ [key: string]: string }>({});

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldId: string) => {
    if (!e.target.files) return;
    
    const file = e.target.files[0];
    setLoading(true);

    try {
      // Dosyayı buluta yüklüyoruz
      const newBlob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/upload',
      });

      // Yüklenen dosyanın linkini hafızaya alıyoruz
      setFiles(prev => ({ ...prev, [fieldId]: newBlob.url }));
      alert(`${file.name} başarıyla yüklendi!`);
    } catch (error) {
      alert("Dosya yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">🥈 Gümüş Tedarikçi Doğrulaması</h1>
        
        <div className="space-y-6">
          {[
            { id: "vergi", label: "Vergi Levhası", tip: "VERGI_LEVHASI" },
            { id: "sicil", label: "Ticaret Sicil Gazetesi", tip: "TICARI_SICIL" },
            { id: "imza", label: "İmza Sirküleri", tip: "IMZA_SIRKULERI" },
            { id: "faaliyet", label: "Faaliyet Belgesi", tip: "FAALIYET_BELGESI" },
            { id: "iban", label: "IBAN Doğrulama", tip: "IBAN_BELGESI" },
          ].map((item) => (
            <div key={item.id} className="border-b pb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">{item.label}</label>
              <input 
                type="file" 
                onChange={(e) => handleFileUpload(e, item.id)}
                className="text-sm text-gray-500"
              />
              {files[item.id] && <span className="text-green-600 text-xs mt-1 block">✅ Yüklendi</span>}
            </div>
          ))}

          <button 
            disabled={loading || Object.keys(files).length < 5}
            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg ${
              loading || Object.keys(files).length < 5 ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Yükleniyor..." : "Gümüş Onayına Gönder"}
          </button>
        </div>
      </div>
    </div>
  );
}