import "./globals.css";
import type { Metadata, Viewport } from "next"; // Viewport tipini ekledik
import { SessionProvider } from "next-auth/react";

// 1. Viewport Ayarları (Yeni Standart)
export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: true,
};

// 2. Metadata Ayarları (Temizlenmiş Hali)
export const metadata: Metadata = {
  title: "Toptan İlan Sistemi",
  description: "Toptan alım ve ihale platformu",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Toptan İlan",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        {/* PWA ve Mobil Uygulama İkonları */}
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="bg-white text-black" suppressHydrationWarning>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}