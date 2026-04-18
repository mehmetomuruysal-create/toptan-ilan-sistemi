import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ onayDurumu: null });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { onayDurumu: true }
  });

  return NextResponse.json({ onayDurumu: user?.onayDurumu });
}