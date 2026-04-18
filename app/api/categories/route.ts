import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("search");

  if (!query) return NextResponse.json([]);

  const categories = await prisma.category.findMany({
    where: {
      name: { contains: query, mode: "insensitive" }
    },
    include: { parent: true },
    take: 10 // Mehmet'i seçeneklerde boğmayalım
  });

  return NextResponse.json(categories);
}