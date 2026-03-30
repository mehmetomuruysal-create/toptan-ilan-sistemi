import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className="bg-white text-black" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}