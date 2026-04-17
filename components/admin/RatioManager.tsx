"use client"
import React, { useState, useTransition, useEffect } from 'react'
import { Percent, Zap, Users, ShieldCheck, Save, Loader2, AlertTriangle } from "lucide-react"
import { updateRatios } from "@/app/admin/ayarlar/actions"
import { toast } from "react-hot-toast"

interface RatioManagerProps {
  title: string;
  type: "global" | "special";
  id?: number; // Kategori ID'si (Global ise boş kalır)
  initialData: {
    totalComm: number;
    initRatio: number;
    refRatio: number;
  }
}

export default function RatioManager({ title, type, id, initialData }: RatioManagerProps) {
  const [isPending, startTransition] = useTransition();
  
  const [totalComm, setTotalComm] = useState(initialData.totalComm);
  const [initRatio, setInitRatio] = useState(initialData.initRatio);
  const [refRatio, setRefRatio] = useState(initialData.refRatio);

  // Mingax Net Kar Formülü:
  // $$ \text{MingaxNet} = \text{TotalComm} - (\text{InitRatio} + \text{RefRatio}) $$
  const mingaxNet = Number((totalComm - (initRatio + refRatio)).toFixed(2));
  const isNegative = mingaxNet < 0;

  const handleSave = () => {
    startTransition(async () => {
      const res = await updateRatios({ 
        type, 
        targetId: id, 
        totalComm, 
        initRatio, 
        refRatio 
      });

      if (res.success) {
        toast.success(res.message, {
          style: {
            borderRadius: '1.5rem',
            background: '#111827',
            color: '#fff',
            fontWeight: '900',
            textTransform: 'uppercase',
            fontSize: '11px',
            letterSpacing: '0.1em'
          }
        });
      } else {
        toast.error(res.message);
      }
    });
  };

  return (
    <div className={`bg-white rounded-[4rem] p-12 border-2 transition-all duration-500 ${isNegative ? 'border-red-500 shadow-red-100' : 'border-gray-50 shadow-gray-200/50 hover:shadow-2xl'}`}>
      
      {/* BAŞLIK */}
      <div className="flex justify-between items-center mb-12">
        <div className="space-y-1">
          <h3 className="text-3xl font-black italic uppercase tracking-tighter text-gray-900">{title}</h3>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">Dağıtım Parametreleri</p>
        </div>
        <span className={`px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest italic ${
          type === "global" ? "bg-blue-600 text-white shadow-lg shadow-blue-100" : "bg-purple-600 text-white shadow-lg shadow-purple-100"
        }`}>
          {type === "global" ? "SİSTEM GENELİ" : "KATEGORİ ÖZEL"}
        </span>
      </div>

      {/* INPUTLAR */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <RatioInput 
          label="Toplam Komisyon" 
          value={totalComm} 
          onChange={setTotalComm} 
          icon={<ShieldCheck size={16} />} 
          color="blue"
        />
        <RatioInput 
          label="Başlatan Ödülü" 
          value={initRatio} 
          onChange={setInitRatio} 
          icon={<Zap size={16} className="text-yellow-500" />} 
          color="yellow"
        />
        <RatioInput 
          label="Davet Havuzu" 
          value={refRatio} 
          onChange={setRefRatio} 
          icon={<Users size={16} className="text-blue-400" />} 
          color="purple"
        />
      </div>

      {/* SONUÇ VE MÜHÜRLEME */}
      <div className="mt-14 pt-10 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-10">
        <div className="flex items-center gap-8">
          <div className={`w-24 h-24 rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl transition-all duration-700 ${isNegative ? 'bg-red-600 animate-pulse' : 'bg-gray-900'}`}>
             {isNegative ? <AlertTriangle size={40} /> : <Percent size={40} />}
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase mb-2 italic tracking-widest">Mingax Net Operasyonel Kâr</p>
            <p className={`text-6xl font-black italic leading-none tracking-tighter ${isNegative ? 'text-red-600' : 'text-gray-900'}`}>
              %{mingaxNet}
            </p>
          </div>
        </div>
        
        <button 
          onClick={handleSave}
          disabled={isPending || isNegative}
          className={`w-full md:w-auto px-16 py-8 rounded-[2.5rem] font-black uppercase text-xs tracking-[0.3em] transition-all flex items-center justify-center gap-4 shadow-2xl ${
            isNegative 
            ? "bg-gray-200 text-gray-400 cursor-not-allowed" 
            : "bg-gray-900 text-white hover:bg-blue-600 hover:scale-[1.02]"
          }`}
        >
          {isPending ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          {isPending ? "MÜHÜRLENİYOR..." : "AYARLARI UYGULA"}
        </button>
      </div>
    </div>
  )
}

function RatioInput({ label, value, onChange, icon, color }: any) {
  return (
    <div className="space-y-4">
      <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 italic">
        {icon} {label}
      </label>
      <div className="relative">
        <input 
          type="number" 
          step="0.01"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full bg-gray-50 border-2 border-gray-100 rounded-[2.5rem] px-10 py-7 font-black italic text-3xl focus:border-gray-900 focus:bg-white outline-none transition-all" 
        />
        <Percent className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-300" size={24} />
      </div>
    </div>
  )
}