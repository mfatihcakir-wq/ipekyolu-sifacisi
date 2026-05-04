import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Kalp Şehri · Ahlâk-ı Hamîde',
  description: 'Gazzâlî\'nin İhyâ\'sından derlenen 4 cephe, 40 asker karakter analizi. Riyâ, hased, kibir, kasâvet ve diğer kalp hastalıklarının nefs muhasebesi.',
  openGraph: {
    title: 'Kalp Şehri, İpek Yolu Şifacısı',
    description: 'Klasik tasavvufî psikolojiye dayanan karakter analizi sistemi.',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
