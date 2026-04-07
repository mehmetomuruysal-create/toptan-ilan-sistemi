-- CreateEnum
CREATE TYPE "SupplierLevel" AS ENUM ('NONE', 'BRONZ', 'GUMUS', 'ALTIN');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "DocType" AS ENUM ('VERGI_LEVHASI', 'TICARI_SICIL', 'IMZA_SIRKULERI', 'FAALIYET_BELGESI', 'IBAN_BELGESI', 'SOZLESME', 'BAKANLIK_IZNI', 'DIGER');

-- CreateEnum
CREATE TYPE "DocStatus" AS ENUM ('WAITING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "onayDurumu" "UserStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "tcKimlikNo" TEXT,
ADD COLUMN     "tedarikciSeviye" "SupplierLevel" NOT NULL DEFAULT 'NONE';

-- CreateTable
CREATE TABLE "Document" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "tip" "DocType" NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "durum" "DocStatus" NOT NULL DEFAULT 'WAITING',
    "redNedeni" TEXT,
    "yuklemeTarihi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Document_userId_idx" ON "Document"("userId");

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
