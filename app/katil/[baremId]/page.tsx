import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import KatilimFormu from "./KatilimFormu";

export default async function KatilPage({ params }: { params: Promise<{ baremId: string }> }) {
  const session = await auth();
  if (!session) redirect("/giris");

  const { baremId } = await params;

  const barem = await prisma.barem.findUnique({
    where: { id: parseInt(baremId) },
    include: {
      listing: {
        include: { satici: true }
      }
    }
  });

  if (!barem) notFound();

  // Kullanıcının adreslerini çekiyoruz (AddressModal'da kullandığımız mantıkla)
  const adresler = await prisma.address.findMany({
    where: { user: { email: session.user?.email! } }
  });

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <KatilimFormu 
          barem={barem} 
          ilan={barem.listing} 
          adresler={adresler} 
        />
      </div>
    </main>
  );
}