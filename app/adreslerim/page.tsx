import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AddressList from "@/components/AddressList";
import { MapPin, Plus } from "lucide-react";

export default async function AdreslerimPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      adresler: true, // Kullanıcının tüm adreslerini çekiyoruz
    },
  });

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic">Adres Bilgilerim</h1>
            <p className="text-gray-500 font-medium">Teslimat ve fatura adreslerinizi buradan yönetin.</p>
          </div>
        </div>

        {/* Adres Listesi ve Ekleme Bileşeni */}
        <AddressList initialAddresses={JSON.parse(JSON.stringify(user.adresler))} />
      </div>
    </div>
  );
}