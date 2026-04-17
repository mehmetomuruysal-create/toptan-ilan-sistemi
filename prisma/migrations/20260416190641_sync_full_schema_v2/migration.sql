/*
  Warnings:

  - You are about to drop the column `firmaAdi` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `isVarsayilanFatura` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `postaKodu` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `tcKimlik` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `vergiDairesi` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `vergiNo` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Barem` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Barem` table. All the data in the column will be lost.
  - You are about to drop the column `redNedeni` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `bolge` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the column `hedefKitle` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the column `il` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the column `ilce` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the column `indirimOrani` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the column `kategori` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the column `minMiktarBireysel` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the column `minMiktarKobi` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the column `minMiktarKurumsal` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the column `teslimatYontemi` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the column `teslimatYontemleri` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the column `urunUrl` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the column `havuzId` on the `Participant` table. All the data in the column will be lost.
  - You are about to drop the column `adres` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerifyToken` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `epostaOnaylandi` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `resetToken` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `resetTokenExpiry` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `teslimatAdresi` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Pool` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "PointType" AS ENUM ('INITIATOR', 'REFERRER', 'SPENDING', 'REFUND');

-- DropForeignKey
ALTER TABLE "Listing" DROP CONSTRAINT "Listing_saticiId_fkey";

-- DropForeignKey
ALTER TABLE "Participant" DROP CONSTRAINT "Participant_baremId_fkey";

-- DropForeignKey
ALTER TABLE "Participant" DROP CONSTRAINT "Participant_havuzId_fkey";

-- DropForeignKey
ALTER TABLE "Participant" DROP CONSTRAINT "Participant_kullaniciId_fkey";

-- DropForeignKey
ALTER TABLE "Pool" DROP CONSTRAINT "Pool_ilanId_fkey";

-- DropIndex
DROP INDEX "Address_userId_idx";

-- DropIndex
DROP INDEX "Barem_listingId_idx";

-- DropIndex
DROP INDEX "Document_userId_idx";

-- AlterTable
ALTER TABLE "Address" DROP COLUMN "firmaAdi",
DROP COLUMN "isVarsayilanFatura",
DROP COLUMN "postaKodu",
DROP COLUMN "tcKimlik",
DROP COLUMN "updatedAt",
DROP COLUMN "vergiDairesi",
DROP COLUMN "vergiNo";

-- AlterTable
ALTER TABLE "Barem" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "Document" DROP COLUMN "redNedeni",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "Listing" DROP COLUMN "bolge",
DROP COLUMN "hedefKitle",
DROP COLUMN "il",
DROP COLUMN "ilce",
DROP COLUMN "indirimOrani",
DROP COLUMN "kategori",
DROP COLUMN "minMiktarBireysel",
DROP COLUMN "minMiktarKobi",
DROP COLUMN "minMiktarKurumsal",
DROP COLUMN "teslimatYontemi",
DROP COLUMN "teslimatYontemleri",
DROP COLUMN "urunUrl",
ADD COLUMN     "categoryId" INTEGER,
ADD COLUMN     "isCampaign" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "specialComm" DOUBLE PRECISION,
ADD COLUMN     "specialInit" DOUBLE PRECISION,
ADD COLUMN     "specialRef" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Participant" DROP COLUMN "havuzId",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "referrerId" INTEGER;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "adres",
DROP COLUMN "emailVerifyToken",
DROP COLUMN "epostaOnaylandi",
DROP COLUMN "resetToken",
DROP COLUMN "resetTokenExpiry",
DROP COLUMN "teslimatAdresi",
ADD COLUMN     "pointsBalance" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "Pool";

-- CreateTable
CREATE TABLE "SystemSettings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "defaultTotalComm" DOUBLE PRECISION NOT NULL DEFAULT 15.0,
    "defaultMingaxNet" DOUBLE PRECISION NOT NULL DEFAULT 12.0,
    "defaultPoolRatio" DOUBLE PRECISION NOT NULL DEFAULT 3.0,
    "defaultInitRatio" DOUBLE PRECISION NOT NULL DEFAULT 0.75,
    "defaultRefRatio" DOUBLE PRECISION NOT NULL DEFAULT 2.25,

    CONSTRAINT "SystemSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "commRatio" DOUBLE PRECISION,
    "initRatio" DOUBLE PRECISION,
    "refRatio" DOUBLE PRECISION,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PointTransaction" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "type" "PointType" NOT NULL,
    "status" "DocStatus" NOT NULL DEFAULT 'WAITING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PointTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_saticiId_fkey" FOREIGN KEY ("saticiId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_kullaniciId_fkey" FOREIGN KEY ("kullaniciId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_baremId_fkey" FOREIGN KEY ("baremId") REFERENCES "Barem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PointTransaction" ADD CONSTRAINT "PointTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
