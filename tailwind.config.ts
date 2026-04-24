import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // MİNGAX KURUMSAL RENK PALETİ
      colors: {
        'mingax-orange': '#F27A1A',
        'mingax-light': '#FFF0E5',
        'mingax-gray': '#F5F5F5',
        'mingax-text': '#333333',
      },
    },
  },
  plugins: [],
};

export default config;