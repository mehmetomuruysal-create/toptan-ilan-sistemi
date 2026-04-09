/*
  Warnings:

  - You are about to drop the column `onayliTedarikci` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[vergiNo]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "DeliveryMethod" AS ENUM ('KARGO', 'MERKEZI_TESLIM', 'NAKLIYE');

-- AlterEnum
ALTER TYPE "ListingStatus" ADD VALUE 'REJECTED';

-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "bolge" TEXT,
ADD COLUMN     "il" TEXT,
ADD COLUMN     "ilce" TEXT,
ADD COLUMN     "teslimatYontemleri" "DeliveryMethod"[],
ALTER COLUMN "durum" SET DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "onayliTedarikci",
ALTER COLUMN "epostaOnaylandi" SET DEFAULT true;

-- CreateTable
CREATE TABLE "ListingImage" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "listingId" INTEGER NOT NULL,

    CONSTRAINT "ListingImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListingDocument" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "listingId" INTEGER NOT NULL,

    CONSTRAINT "ListingDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_vergiNo_key" ON "User"("vergiNo");

-- AddForeignKey
ALTER TABLE "ListingImage" ADD CONSTRAINT "ListingImage_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingDocument" ADD CONSTRAINT "ListingDocument_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
