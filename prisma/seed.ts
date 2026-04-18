// prisma/seed.ts
import { PrismaClient, Category } from '@prisma/client'; // 🚀 Category tipini import ettik
import https from 'https';

const prisma = new PrismaClient();

function slugify(text: string) {
  const trMap: any = { 'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u' };
  return text.toLowerCase()
    .replace(/[çğıöşü]/g, (m) => trMap[m])
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

async function fetchTaxonomy(): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = 'https://www.google.com/basepages/producttype/taxonomy-with-ids.tr-TR.txt';
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function main() {
  console.log("📥 Google Taksonomi dosyası indiriliyor...");
  const rawData = await fetchTaxonomy();
  const lines = rawData.split('\n').filter(line => line && !line.startsWith('#'));

  console.log(`✅ ${lines.length} kategori bulundu.`);

  const categoryMap = new Map<string, number>();

  for (const line of lines) {
    const dashIndex = line.indexOf(' - ');
    if (dashIndex === -1) continue;

    const googleIdStr = line.substring(0, dashIndex).trim();
    const fullPath = line.substring(dashIndex + 3).trim();
    
    const googleId = parseInt(googleIdStr);
    const parts = fullPath.split(' > ').map(p => p.trim());

    let lastParentId: number | null = null;
    let currentPath = "";

    for (let i = 0; i < parts.length; i++) {
      const name = parts[i];
      currentPath += (currentPath ? " > " : "") + name;
      const isLastPart = i === parts.length - 1;
      
      // Slug çakışmasını önlemek için parentId ile mühürledik
      const baseSlug = slugify(name);
      const uniqueSlug = lastParentId ? `${baseSlug}-${lastParentId}` : baseSlug;

      if (!categoryMap.has(currentPath)) {
        // 🚀 HATA ÇÖZÜMÜ: category yerine 'created' kullanarak circular reference hatasını (TS7022) bitirdik
        const created: Category = await prisma.category.upsert({
          where: { slug: uniqueSlug },
          update: {},
          create: {
            googleId: isLastPart ? googleId : null,
            name: name,
            slug: uniqueSlug,
            parentId: lastParentId
          }
        });
        categoryMap.set(currentPath, created.id);
        lastParentId = created.id;
      } else {
        lastParentId = categoryMap.get(currentPath)!;
      }
    }
  }
}

main()
  .catch((e) => {
    console.error("❌ Hata:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });