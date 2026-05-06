import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

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
        // Phase 2 landing redesign tokenlari (mevcut altin/krem'e dokunmadan, landing-* prefix ile)
        kdyesil: '#1C3A26',
        'landing-altin': '#B8860B',
        'landing-krem': '#FAF6EF',
        acikaltin: '#F5EFE0',
        anametin: '#1A1208',
        ikincil: '#5C4A2A',
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
        arapca: ['var(--font-arapca)', 'Noto Naskh Arabic', 'serif'],
      },
      maxWidth: {
        prose: '720px',
        wide: '1200px',
      },
      // Phase 2.0; globals.css'teki @keyframes bloklarinin Tailwind utility karsiliklari.
      // Asil bloklar Phase 2.6 ve 6.8'de file-by-file replace bittikten sonra silinecek.
      keyframes: {
        'rot-s': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        'gentle-pulse': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.04)' },
        },
        'orbit-dem': {
          from: { transform: 'rotate(0deg) translateX(12px) rotate(0deg)' },
          to: { transform: 'rotate(360deg) translateX(12px) rotate(-360deg)' },
        },
        'orbit-saf': {
          from: { transform: 'rotate(90deg) translateX(12px) rotate(-90deg)' },
          to: { transform: 'rotate(450deg) translateX(12px) rotate(-450deg)' },
        },
        'orbit-bal': {
          from: { transform: 'rotate(180deg) translateX(12px) rotate(-180deg)' },
          to: { transform: 'rotate(540deg) translateX(12px) rotate(-540deg)' },
        },
        'orbit-sev': {
          from: { transform: 'rotate(270deg) translateX(12px) rotate(-270deg)' },
          to: { transform: 'rotate(630deg) translateX(12px) rotate(-630deg)' },
        },
        'bg-logo-pulse': {
          '0%, 100%': { opacity: '0.04', transform: 'translate(-50%, -50%) scale(1)' },
          '50%': { opacity: '0.07', transform: 'translate(-50%, -50%) scale(1.015)' },
        },
      },
      animation: {
        'rot-s': 'rot-s 20s linear infinite',
        'gentle-pulse': 'gentle-pulse 3s ease-in-out infinite',
        'orbit-dem': 'orbit-dem 1.2s linear infinite',
        'orbit-saf': 'orbit-saf 1.2s linear infinite',
        'orbit-bal': 'orbit-bal 1.2s linear infinite',
        'orbit-sev': 'orbit-sev 1.2s linear infinite',
        'bg-logo-pulse': 'bg-logo-pulse 6s ease-in-out infinite',
      },
    },
  },
  plugins: [typography],
};
export default config;
