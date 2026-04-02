import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Toptan İlan Sistemi",
  description: "Toptan alım ve ihale platformu",
  manifest: "/manifest.json",
  themeColor: "#2563eb",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=yes",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Toptan İlan"
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="bg-white text-black">
        {children}
      </body>
    </html>
  );
}