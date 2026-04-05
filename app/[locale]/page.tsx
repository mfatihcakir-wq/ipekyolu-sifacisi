import type { Metadata } from 'next'
import LandingClient from './LandingClient'

export const metadata: Metadata = {
  title: 'İpek Yolu Şifacısı — Klasik İslam Tıbbı Danışmanlığı',
  description: 'İbn Sînâ, er-Râzî ve Osmanlı hekimlerinin klasik tıp geleneğine dayalı kişisel sağlık danışmanlığı. Mizaç analizi, bitki protokolü, WhatsApp takibi.',
  keywords: 'klasik islam tıbbı, mizaç analizi, ibn sina, geleneksel tıp, bitki protokolü, online sağlık danışmanlığı',
  openGraph: {
    title: 'İpek Yolu Şifacısı',
    description: 'Klasik İslam Tıbbı ile kişisel sağlık danışmanlığı',
    url: 'https://www.ipekyolusifacisi.com',
    siteName: 'İpek Yolu Şifacısı',
    locale: 'tr_TR',
    type: 'website',
  },
}

export default function Page() {
  return <LandingClient />
}
