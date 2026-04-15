"use client";
import { useState } from "react";
import { Trash2, MapPin, Home, Building, Plus } from "lucide-react";
import { adresSil } from "@/app/actions/adres";
import AddressModal from "./AddressModal"; // 👈 Elindeki modalı çağırıyoruz

export default function AddressList({ initialAddresses }: { initialAddresses: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  async function handleDelete(id: string) {
    if(confirm("Bu adresi silmek istediğinize emin misiniz?")) {
      await adresSil(id);
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ➕ YENİ ADRES EKLE BUTONU */}
        <button 
          onClick={() => setIsModalOpen(true)}
          className="border-2 border-dashed border-gray-200 rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-600 transition-all group bg-white/50"
        >
          <div className="w-14 h-14 bg-gray-50 group-hover:bg-blue-50 rounded-2xl flex items-center justify-center mb-4 transition-colors">
            <Plus size={32} />
          </div>
          <span className="font-black uppercase tracking-widest text-xs italic">Yeni Adres Ekle</span>
        </button>

        {/* 📍 MEVCUT ADRESLER */}
        {initialAddresses.map((address) => (
          <div key={address.id} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 relative group hover:shadow-xl hover:shadow-blue-100/50 transition-all duration-500">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
                  {address.faturaTuru === "KURUMSAL" ? <Building size={24} /> : <Home size={24} />}
                </div>
                <div>
                  <h3 className="font-black text-gray-900 uppercase italic tracking-tighter text-lg leading-none">{address.baslik}</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                    {address.teslimAlacakKisi}
                  </p>
                </div>
              </div>
              
              <button 
                onClick={() => handleDelete(address.id)}
                className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
              >
                <Trash2 size={20} />
              </button>
            </div>

            <div className="space-y-2 mb-6">
              <p className="text-sm text-gray-600 font-medium leading-relaxed">
                {address.adresSatiri}
              </p>
              <p className="text-xs font-black text-gray-900 uppercase">
                {address.ilce} / {address.il}
              </p>
            </div>

            <div className="flex gap-2">
              {address.isVarsayilanTeslimat && (
                <span className="bg-green-50 text-green-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-100">
                  Varsayılan Teslimat
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 🚀 ELİNDEKİ MODAL'I BURADA TETİKLİYORUZ */}
      <AddressModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
}