-- CreateEnum
CREATE TYPE "HesapTuru" AS ENUM ('ALICI', 'SATICI');

-- CreateEnum
CREATE TYPE "FaturaTuru" AS ENUM ('BIREYSEL', 'KURUMSAL');

-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('ACTIVE', 'PENDING', 'COMPLETED', 'CANCELLED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "ParticipationStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'SUSPENDED');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "ad" TEXT NOT NULL,
    "soyad" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "ulkeKodu" TEXT NOT NULL DEFAULT '+90',
    "telefon" TEXT,
    "password" TEXT NOT NULL,
    "cinsiyet" TEXT,
    "kampanyaOnay" BOOLEAN NOT NULL DEFAULT false,
    "hesapTuru" "HesapTuru" NOT NULL DEFAULT 'ALICI',
    "onayliTedarikci" BOOLEAN NOT NULL DEFAULT false,
    "firmaAdi" TEXT,
    "vergiNo" TEXT,
    "vergiDairesi" TEXT,
    "adres" TEXT,
    "teslimatAdresi" TEXT,
    "guvenPuani" INTEGER NOT NULL DEFAULT 100,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "resetToken" TEXT,
    "resetTokenExpiry" TIMESTAMP(3),
    "epostaOnaylandi" BOOLEAN NOT NULL DEFAULT false,
    "emailVerifyToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Listing" (
    "id" SERIAL NOT NULL,
    "baslik" TEXT NOT NULL,
    "aciklama" TEXT,
    "urunUrl" TEXT,
    "kategori" TEXT NOT NULL DEFAULT 'diger',
    "perakendeFiyat" DOUBLE PRECISION NOT NULL,
    "toptanFiyat" DOUBLE PRECISION NOT NULL,
    "hedefSayi" INTEGER NOT NULL,
    "hedefKitle" TEXT NOT NULL DEFAULT 'hepsi',
    "minMiktarBireysel" INTEGER NOT NULL DEFAULT 1,
    "minMiktarKobi" INTEGER NOT NULL DEFAULT 5,
    "minMiktarKurumsal" INTEGER NOT NULL DEFAULT 20,
    "bitisTarihi" TIMESTAMP(3) NOT NULL,
    "teslimatYontemi" TEXT NOT NULL DEFAULT 'kargo',
    "indirimOrani" INTEGER NOT NULL DEFAULT 10,
    "depozitoOrani" INTEGER NOT NULL DEFAULT 30,
    "durum" "ListingStatus" NOT NULL DEFAULT 'ACTIVE',
    "saticiId" INTEGER NOT NULL,
    "olusturmaTarihi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Barem" (
    "id" SERIAL NOT NULL,
    "listingId" INTEGER NOT NULL,
    "sira" INTEGER NOT NULL,
    "miktar" INTEGER NOT NULL,
    "fiyat" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Barem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pool" (
    "id" SERIAL NOT NULL,
    "ilanId" INTEGER NOT NULL,
    "mevcutKatilim" INTEGER NOT NULL DEFAULT 0,
    "bitisTarihi" TIMESTAMP(3) NOT NULL,
    "durum" TEXT NOT NULL DEFAULT 'bekliyor',

    CONSTRAINT "Pool_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Participant" (
    "id" SERIAL NOT NULL,
    "kullaniciId" INTEGER NOT NULL,
    "havuzId" INTEGER NOT NULL,
    "talepMiktari" INTEGER NOT NULL,
    "durum" "ParticipationStatus" NOT NULL DEFAULT 'PENDING',
    "baremId" INTEGER NOT NULL,

    CONSTRAINT "Participant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Address" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "baslik" TEXT NOT NULL,
    "teslimAlacakKisi" TEXT NOT NULL,
    "telefon" TEXT NOT NULL,
    "il" TEXT NOT NULL,
    "ilce" TEXT NOT NULL,
    "mahalle" TEXT,
    "adresSatiri" TEXT NOT NULL,
    "postaKodu" TEXT,
    "isVarsayilanTeslimat" BOOLEAN NOT NULL DEFAULT false,
    "isVarsayilanFatura" BOOLEAN NOT NULL DEFAULT false,
    "faturaTuru" "FaturaTuru" NOT NULL DEFAULT 'BIREYSEL',
    "tcKimlik" TEXT,
    "firmaAdi" TEXT,
    "vergiDairesi" TEXT,
    "vergiNo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_telefon_key" ON "User"("telefon");

-- CreateIndex
CREATE INDEX "Barem_listingId_idx" ON "Barem"("listingId");

-- CreateIndex
CREATE UNIQUE INDEX "Barem_listingId_sira_key" ON "Barem"("listingId", "sira");

-- CreateIndex
CREATE INDEX "Address_userId_idx" ON "Address"("userId");

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_saticiId_fkey" FOREIGN KEY ("saticiId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Barem" ADD CONSTRAINT "Barem_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pool" ADD CONSTRAINT "Pool_ilanId_fkey" FOREIGN KEY ("ilanId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_kullaniciId_fkey" FOREIGN KEY ("kullaniciId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_havuzId_fkey" FOREIGN KEY ("havuzId") REFERENCES "Pool"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_baremId_fkey" FOREIGN KEY ("baremId") REFERENCES "Barem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
