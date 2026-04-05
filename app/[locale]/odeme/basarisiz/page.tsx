'use client'

import { useRouter } from 'next/navigation'
import { Cinzel, EB_Garamond } from 'next/font/google'
import Header from '../../components/Header'
import Footer from '../../components/Footer'

const cinzel = Cinzel({ subsets: ['latin'], weight: ['400', '500', '600'] })
const garamond = EB_Garamond({ subsets: ['latin'], weight: ['400', '500'], style: ['normal', 'italic'] })

const C = {
  primary: '#1B4332', gold: '#C9A84C', cream: '#F5EFE6',
  dark: '#1C1C1C', secondary: '#5C4A2A', border: '#E0D5C5',
  white: '#FFFFFF', surface: '#FAF7F2',
}

export default function OdemeBasarisizPage() {
  const router = useRouter()

  return (
    <div style={{ background: C.cream, minHeight: '100vh', fontFamily: garamond.style.fontFamily }}>
      <Header />

      <div style={{ maxWidth: 500, margin: '0 auto', padding: '60px 20px' }}>
        <div style={{ background: C.white, borderRadius: 20, border: '1px solid #FFCDD2', padding: '48px 40px', textAlign: 'center', marginBottom: 24 }}>
          {/* Hata badge */}
          <div style={{ width: 80, height: 80, background: '#FFEAEA', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#C62828" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>

          <h1 style={{ fontFamily: cinzel.style.fontFamily, fontSize: 24, fontWeight: 500, color: '#C62828', marginBottom: 8, letterSpacing: 1 }}>
            Odeme Basarisiz
          </h1>
          <p style={{ fontSize: 15, color: C.secondary, lineHeight: 1.7, marginBottom: 16 }}>
            Odeme islemi tamamlanamadi. Kart bilgilerinizi kontrol edip tekrar deneyebilirsiniz.
          </p>

          {/* Olasi sebepler */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: '16px 20px', marginBottom: 24, textAlign: 'left' }}>
            <div style={{ fontSize: 11, color: C.secondary, letterSpacing: 1, marginBottom: 10, fontWeight: 600 }}>OLASI SEBEPLER</div>
            {[
              'Kart limiti yetersiz olabilir',
              '3D Secure dogrulamasi basarisiz olmus olabilir',
              'Kart bilgileri hatali girilmis olabilir',
              'Bankaniz islemi engellenmis olabilir',
            ].map((text, i) => (
              <div key={i} style={{ fontSize: 13, color: C.secondary, lineHeight: 1.6, padding: '3px 0', display: 'flex', gap: 8 }}>
                <span style={{ color: '#C62828', flexShrink: 0 }}>{'\u2022'}</span> {text}
              </div>
            ))}
          </div>

          <div style={{ fontSize: 13, color: '#999', fontStyle: 'italic', lineHeight: 1.6 }}>
            Sorun devam ederse WhatsApp uzerinden bize ulasin.
          </div>
        </div>

        {/* Butonlar */}
        <div style={{ display: 'grid', gap: 10 }}>
          <button onClick={() => router.push('/odeme')}
            style={{ width: '100%', padding: 16, background: C.gold, border: 'none', borderRadius: 12, fontFamily: cinzel.style.fontFamily, fontSize: 14, fontWeight: 600, color: C.primary, cursor: 'pointer', letterSpacing: 1 }}>
            Tekrar Dene
          </button>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <a href="https://wa.me/905331687226?text=Merhaba%2C%20odeme%20basarisiz%20oldu%2C%20yardim%20istiyorum."
              target="_blank"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#25D366', color: 'white', borderRadius: 10, padding: 14, fontSize: 13, fontWeight: 600, textDecoration: 'none', fontFamily: cinzel.style.fontFamily, letterSpacing: 1 }}>
              WhatsApp
            </a>
            <button onClick={() => router.push('/odeme')}
              style={{ background: 'transparent', border: `1.5px solid ${C.primary}`, borderRadius: 10, padding: 14, fontSize: 13, fontWeight: 600, color: C.primary, cursor: 'pointer', fontFamily: cinzel.style.fontFamily, letterSpacing: 1 }}>
              Odeme Sayfasi
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
