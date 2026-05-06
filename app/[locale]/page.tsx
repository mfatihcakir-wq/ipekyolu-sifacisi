import type { Metadata } from 'next'
import LandingHeader from '@/components/landing/LandingHeader'
import Hero from '@/components/landing/Hero'
import IddiaIspat from '@/components/landing/IddiaIspat'
import OrnekAnaliz from '@/components/landing/OrnekAnaliz'
import NasilCalisir from '@/components/landing/NasilCalisir'
import HazineSection from '@/components/landing/HazineSection'
import Danismaniniz from '@/components/landing/Danismaniniz'
import UcKapiCta from '@/components/landing/UcKapiCta'
import LandingFooter from '@/components/landing/LandingFooter'
import MobilStickyCta from '@/components/landing/MobilStickyCta'
import { fetchLandingData } from '@/lib/landing/data'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'İpek Yolu Şifacısı, Klasik İslam Tıbbı Danışmanlığı',
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

export default async function Page() {
  const { stats, hekimler, eserler, makaleler } = await fetchLandingData()

  return (
    <>
      <LandingHeader />
      <main>
        <Hero stats={stats} />
        <IddiaIspat />
        <OrnekAnaliz />
        <NasilCalisir />
        <HazineSection
          hekimler={hekimler}
          eserler={eserler}
          makaleler={makaleler}
          counts={{
            hekim: hekimler.length || 5,
            eser: stats.kaynak,
            makale: stats.makale,
          }}
        />
        <Danismaniniz />
        <UcKapiCta />
      </main>
      <LandingFooter />
      <MobilStickyCta />
    </>
  )
}
