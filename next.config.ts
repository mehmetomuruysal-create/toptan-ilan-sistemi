import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            // connect-src: Hem yerel hem Vercel Blob bağlantılarına izin verir.
            // img-src: Vercel Blob'dan gelen resimlerin görünmesini sağlar.
            // style-src ve font-src: Giriş sayfasındaki CSS ve ikon bozulmalarını çözer.
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob: https: https://*.public.blob.vercel-storage.com; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://blob.vercel-storage.com https://*.public.blob.vercel-storage.com https://vercel.live wss://*.vercel.live; frame-src 'self' https://vercel.live; base-uri 'self'; form-action 'self';"
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff"
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN"
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block"
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin"
          }
        ]
      }
    ];
  }
};

export default nextConfig;