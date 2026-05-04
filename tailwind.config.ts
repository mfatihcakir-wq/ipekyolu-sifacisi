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
        // Birincil palette (lib/constants.ts > RENK ile senkron)
        primary: '#1C3A26',
        'primary-dark': '#122B1C',
        gold: '#B8860B',
        'gold-light': '#D4A843',
        cream: '#FAF6EF',
        surface: '#FAF6EF',
        dark: '#1C1C1C',
        secondary: '#6B5744',
        border: '#DEB887',
        // Eski (geçişte korunuyor)
        koyu: '#1C3A26',
        orta: '#2D6A4F',
        altin: '#B8922A',
        'altin-acik': '#F0E6C8',
        krem: '#FAF7F2',
        sinir: '#E8DFD4',
        // Vurgu
        green: '#059669',
        whatsapp: '#25D366',
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
        cormorant: ['var(--font-cormorant)', 'Georgia', 'serif'],
        garamond: ['var(--font-eb-garamond)', 'Georgia', 'serif'],
        roboto: ['var(--font-roboto)', 'Arial', 'sans-serif'],
        arapca: ['Noto Naskh Arabic', 'serif'],
      },
      maxWidth: {
        prose: '720px',
        wide: '1200px',
      },
    },
  },
  plugins: [],
};
export default config;
