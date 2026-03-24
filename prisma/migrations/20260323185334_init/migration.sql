-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "adSoyad" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "rol" TEXT NOT NULL DEFAULT 'alici',
    "guvenPuani" INTEGER NOT NULL DEFAULT 100
);

-- CreateTable
CREATE TABLE "Listing" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "baslik" TEXT NOT NULL,
    "perakendeFiyat" REAL NOT NULL,
    "toptanFiyat" REAL NOT NULL,
    "hedefSayi" INTEGER NOT NULL,
    "saticiId" INTEGER NOT NULL,
    CONSTRAINT "Listing_saticiId_fkey" FOREIGN KEY ("saticiId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Pool" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ilanId" INTEGER NOT NULL,
    "mevcutKatilim" INTEGER NOT NULL DEFAULT 0,
    "bitisTarihi" DATETIME NOT NULL,
    "durum" TEXT NOT NULL DEFAULT 'bekliyor',
    CONSTRAINT "Pool_ilanId_fkey" FOREIGN KEY ("ilanId") REFERENCES "Listing" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Participant" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "kullaniciId" INTEGER NOT NULL,
    "havuzId" INTEGER NOT NULL,
    "talepMiktari" INTEGER NOT NULL,
    "odemeDurumu" TEXT NOT NULL DEFAULT 'bekliyor',
    CONSTRAINT "Participant_kullaniciId_fkey" FOREIGN KEY ("kullaniciId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Participant_havuzId_fkey" FOREIGN KEY ("havuzId") REFERENCES "Pool" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
