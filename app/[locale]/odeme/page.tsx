import { Cormorant_Garamond as Cinzel } from 'next/font/google'
import Header from '../components/Header'
import Footer from '../components/Footer'

const cinzel = Cinzel({ display: 'swap', preload: false, subsets: ['latin', 'latin-ext'], weight: ['400', '500', '600'] })

const C = { primary: '#1C3A26', gold: '#B8860B', cream: '#FAF6EF', secondary: '#6B5744', border: '#DEB887', white: '#FFFFFF' }

export const metadata = {
  title: 'Uyelik Planlarimiz Yakinda · Ipek Yolu Sifacisi',
  description: 'Odeme altyapimiz hazirlaniyor. Danismanlik icin WhatsApp\'tan iletisime gecebilirsiniz.',
  robots: { index: false, follow: false },
}

export default function OdemePage() {
  return (
    <div style={{ background: C.cream, minHeight: '100vh' }}>
      <Header />
      <main style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', padding: '96px 24px' }}>
        <div style={{ maxWidth: 560, width: '100%', textAlign: 'center' }}>

          <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 11, letterSpacing: '0.2em', color: C.secondary, marginBottom: 24 }}>
            {'قريباً · Yakında'}
          </div>

          <h1 style={{ fontFamily: cinzel.style.fontFamily, fontSize: 'clamp(24px, 4vw, 34px)', fontWeight: 600, color: '#1A1208', marginBottom: 16 }}>
            {'Uyelik Planlarimiz Yakinda'}
          </h1>

          <p style={{ fontSize: 16, color: C.secondary, lineHeight: 1.8, marginBottom: 32 }}>
            {'Odeme altyapimiz hazirlik asamasindadir. Bu surecte tek seferlik danismanlik ve analiz talepleriniz icin WhatsApp uzerinden dogrudan iletisime gecebilirsiniz.'}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
            <a href="https://wa.me/905331687226" target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '14px 28px', background: C.primary, color: C.white, textDecoration: 'none', borderRadius: 10, fontFamily: cinzel.style.fontFamily, fontSize: 12, fontWeight: 700, letterSpacing: 1.5, minWidth: 240 }}>
              {'WhatsApp ile Iletisim'}
            </a>
            <a href="/analiz"
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '14px 28px', background: 'transparent', border: `1.5px solid ${C.border}`, color: C.secondary, textDecoration: 'none', borderRadius: 10, fontFamily: cinzel.style.fontFamily, fontSize: 12, fontWeight: 600, letterSpacing: 1.5, minWidth: 240 }}>
              {'Ucretsiz Analize Basla'}
            </a>
          </div>

          <p style={{ fontSize: 12, color: '#9B8060', marginTop: 48, fontStyle: 'italic' }}>
            {'Abonelik sistemi aktiflestiginde kayitli e-posta adreslerine bilgi verilecektir.'}
          </p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
