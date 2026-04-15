import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Providers } from "@/components/Providers"; 
import Navbar from "@/components/Navbar";

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Mingax | Toptan İlan Sistemi",
  description: "Toptan alım ve ihale platformu",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className="bg-white text-black" suppressHydrationWarning>
        {/* Tüm uygulamayı SessionProvider ile sarmalayan Providers bileşeni */}
        <Providers> 
          {/* Giriş ve Kayıt butonlarını içeren ortak menü */}
          <Navbar /> 
          
          <main className="min-h-screen">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}