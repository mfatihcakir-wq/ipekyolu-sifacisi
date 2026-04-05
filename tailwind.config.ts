import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        koyu: '#1C3A26',
        orta: '#2D6A4F',
        altin: '#B8922A',
        'altin-acik': '#F0E6C8',
        krem: '#FAF7F2',
        sinir: '#E8DFD4',
      },
      fontSize: {
        'xs': '11px',
        'sm': '13px',
        'base': '18px',
        'lg': '20px',
        'xl': '24px',
        '2xl': '32px',
        '3xl': '42px',
      },
      fontFamily: {
        baslik: ['Cinzel', 'Georgia', 'serif'],
        govde: ['EB Garamond', 'Georgia', 'serif'],
        arapca: ['Noto Naskh Arabic', 'serif'],
      },
    },
  },
  plugins: [],
};
export default config;
