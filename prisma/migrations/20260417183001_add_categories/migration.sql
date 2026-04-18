/*
  Warnings:

  - The values [SUSPENDED] on the enum `ParticipationStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `hedefKitle` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the column `indirimOrani` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the column `minMiktarBireysel` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the column `minMiktarKobi` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the column `minMiktarKurumsal` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the column `teslimatYontemi` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the column `defaultPoolRatio` on the `SystemSettings` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Address` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DemandStatus" AS ENUM ('PENDING', 'OFFERED', 'APPROVED', 'REJECTED');

-- AlterEnum
BEGIN;
CREATE TYPE "ParticipationStatus_new" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED');
ALTER TABLE "Participant" ALTER COLUMN "durum" DROP DEFAULT;
ALTER TABLE "Participant" ALTER COLUMN "durum" TYPE "ParticipationStatus_new" USING ("durum"::text::"ParticipationStatus_new");
ALTER TYPE "ParticipationStatus" RENAME TO "ParticipationStatus_old";
ALTER TYPE "ParticipationStatus_new" RENAME TO "ParticipationStatus";
DROP TYPE "ParticipationStatus_old";
ALTER TABLE "Participant" ALTER COLUMN "durum" SET DEFAULT 'PENDING';
COMMIT;

-- AlterTable
ALTER TABLE "Address" ADD COLUMN     "firmaAdi" TEXT,
ADD COLUMN     "isVarsayilanFatura" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "postaKodu" TEXT,
ADD COLUMN     "tcKimlik" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "vergiDairesi" TEXT,
ADD COLUMN     "vergiNo" TEXT;

-- AlterTable
ALTER TABLE "Listing" DROP COLUMN "hedefKitle",
DROP COLUMN "indirimOrani",
DROP COLUMN "minMiktarBireysel",
DROP COLUMN "minMiktarKobi",
DROP COLUMN "minMiktarKurumsal",
DROP COLUMN "teslimatYontemi",
ADD COLUMN     "initiatorId" INTEGER,
ALTER COLUMN "toptanFiyat" DROP NOT NULL,
ALTER COLUMN "hedefSayi" DROP NOT NULL;

-- AlterTable
ALTER TABLE "SystemSettings" DROP COLUMN "defaultPoolRatio";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailVerifyToken" TEXT,
ADD COLUMN     "epostaOnaylandi" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "resetToken" TEXT,
ADD COLUMN     "resetTokenExpiry" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Demand" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "urunAdi" TEXT NOT NULL,
    "aciklama" TEXT,
    "markaTercihi" TEXT,
    "tahminiAdet" INTEGER,
    "durum" "DemandStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "convertedListingId" INTEGER,

    CONSTRAINT "Demand_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Demand_convertedListingId_key" ON "Demand"("convertedListingId");

-- AddForeignKey
ALTER TABLE "Demand" ADD CONSTRAINT "Demand_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_initiatorId_fkey" FOREIGN KEY ("initiatorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
