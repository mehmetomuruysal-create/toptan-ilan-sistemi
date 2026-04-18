import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AyarlarClient from "./AyarlarClient";

export default async function ProfilAyarlarPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/giris");

  const userId = Number(session.user.id);

  // 🚀 Şemana %100 uygun Prisma sorgusu
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      belgeler: {
        orderBy: { yuklemeTarihi: 'desc' }
      }
    }
  });

  if (!user) redirect("/giris");

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-4xl md:text-5xl font-black italic uppercase text-gray-900 tracking-tighter mb-2">
          Profil Ayarları
        </h1>
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
          {user.hesapTuru === "SATICI" 
            ? "Firma bilgilerinizi ve resmi evraklarınızı buradan yönetin." 
            : "Kişisel bilgilerinizi buradan yönetin."}
        </p>
      </div>

      <AyarlarClient user={user} documents={user.belgeler} />
    </div>
  );
}