-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "bolge" TEXT,
ADD COLUMN     "hedefKitle" TEXT NOT NULL DEFAULT 'hepsi',
ADD COLUMN     "il" TEXT,
ADD COLUMN     "ilce" TEXT,
ADD COLUMN     "indirimOrani" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "minMiktarBireysel" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "minMiktarKobi" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "minMiktarKurumsal" INTEGER NOT NULL DEFAULT 20,
ADD COLUMN     "teslimatYontemi" TEXT NOT NULL DEFAULT 'kargo',
ADD COLUMN     "teslimatYontemleri" "DeliveryMethod"[],
ADD COLUMN     "urunUrl" TEXT;
