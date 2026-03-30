-- CreateEnum
CREATE TYPE "HesapTuru" AS ENUM ('ALICI', 'SATICI');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "adSoyad" TEXT NOT NULL,
    "telefon" TEXT NOT NULL,
    "hesapTuru" "HesapTuru" NOT NULL,
    "onayliTedarikci" BOOLEAN NOT NULL DEFAULT false,
    "firmaAdi" TEXT,
    "vergiNo" TEXT,
    "vergiDairesi" TEXT,
    "adres" TEXT,
    "teslimatAdresi" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "guvenPuani" INTEGER NOT NULL DEFAULT 100,
    "resetToken" TEXT,
    "resetTokenExpiry" TIMESTAMP(3),
    "epostaOnaylandi" BOOLEAN NOT NULL DEFAULT false,

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
    "durum" TEXT NOT NULL DEFAULT 'aktif',
    "saticiId" INTEGER NOT NULL,
    "olusturmaTarihi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
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
    "odemeDurumu" TEXT NOT NULL DEFAULT 'bekliyor',

    CONSTRAINT "Participant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_saticiId_fkey" FOREIGN KEY ("saticiId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pool" ADD CONSTRAINT "Pool_ilanId_fkey" FOREIGN KEY ("ilanId") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_kullaniciId_fkey" FOREIGN KEY ("kullaniciId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_havuzId_fkey" FOREIGN KEY ("havuzId") REFERENCES "Pool"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
