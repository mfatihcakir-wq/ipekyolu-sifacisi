'use client'

import { useRouter } from 'next/navigation'
import { Cinzel, EB_Garamond } from 'next/font/google'

const cinzel = Cinzel({ subsets: ['latin'], weight: ['400', '500', '600'] })
const garamond = EB_Garamond({ subsets: ['latin'], weight: ['400', '500'], style: ['normal', 'italic'] })

const C = {
  primary: '#1B4332', gold: '#C9A84C', cream: '#F5EFE6',
  dark: '#1C1C1C', secondary: '#5C4A2A', border: '#E0D5C5',
  white: '#FFFFFF', surface: '#FAF7F2',
}

export default function OdemeBasarili() {
  const router = useRouter()

  return (
    <div style={{ background: C.cream, minHeight: '100vh', fontFamily: garamond.style.fontFamily }}>
      <header style={{ background: C.primary, padding: '0 24px', height: 60, display: 'flex', alignItems: 'center' }}>
        <div style={{ fontFamily: cinzel.style.fontFamily, color: C.gold, fontSize: 14, fontWeight: 600, letterSpacing: 3, cursor: 'pointer' }} onClick={() => router.push('/')}>
          IPEK YOLU SIFACISI
        </div>
      </header>

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '60px 20px' }}>
        <div style={{ background: C.white, borderRadius: 20, border: `1px solid ${C.border}`, padding: '48px 40px', textAlign: 'center', marginBottom: 24 }}>
          <div style={{ width: 80, height: 80, background: '#EAF3DE', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={C.primary} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          </div>

          <h1 style={{ fontFamily: cinzel.style.fontFamily, fontSize: 26, fontWeight: 500, color: C.primary, marginBottom: 8, letterSpacing: 1 }}>
            Uyeliginiz Aktif
          </h1>
          <p style={{ fontSize: 16, color: C.secondary, fontStyle: 'italic', lineHeight: 1.7, marginBottom: 32 }}>
            Odemeniz basariyla tamamlandi. Danismaniniz sizinle ilgilenmeye basliyor.
          </p>

          <div style={{ textAlign: 'left', marginBottom: 32 }}>
            <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 12, color: C.gold, letterSpacing: 2, marginBottom: 16 }}>SONRAKI ADIMLAR</div>
            {[
              'Danismaniniz formunuzu klasik Islam tibbi kaynaklari ile analiz eder.',
              'Mizac tipiniz, hilt dengeniz ve etkilenen organlar belirlenir.',
              'Size ozel bitkisel protokol hazirlanir.',
              'WhatsApp uzerinden sonuclariniz ve onerileriniz iletilir.',
            ].map((text, i) => (
              <div key={i} style={{ display: 'flex', gap: 14, marginBottom: 14, alignItems: 'flex-start' }}>
                <div style={{ width: 28, height: 28, background: C.primary, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: cinzel.style.fontFamily, fontSize: 13, color: C.gold, fontWeight: 600 }}>{i + 1}</div>
                <p style={{ fontSize: 14, color: C.secondary, lineHeight: 1.6, margin: 0, paddingTop: 3 }}>{text}</p>
              </div>
            ))}
          </div>

          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: '16px 20px', marginBottom: 28 }}>
            <p style={{ fontSize: 14, color: C.secondary, fontStyle: 'italic', lineHeight: 1.7, margin: 0 }}>
              &ldquo;Beden, ancak mizaci bilindiginde tedavi edilebilir.&rdquo;
            </p>
            <p style={{ fontSize: 11, color: '#999', marginTop: 6, marginBottom: 0 }}>
              el-Kanun fi&apos;t-Tib, Kitab 1
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <a href="https://wa.me/905331687226?text=Merhaba%2C%20%C3%B6deme%20yapt%C4%B1m%2C%20%C3%BCyeli%C4%9Fim%20aktif."
            target="_blank"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#25D366', color: 'white', borderRadius: 10, padding: 14, fontSize: 13, fontWeight: 600, textDecoration: 'none', fontFamily: cinzel.style.fontFamily, letterSpacing: 1 }}>
            WhatsApp
          </a>
          <button onClick={() => router.push('/')}
            style={{ background: 'transparent', border: `1.5px solid ${C.primary}`, borderRadius: 10, padding: 14, fontSize: 13, fontWeight: 600, color: C.primary, cursor: 'pointer', fontFamily: cinzel.style.fontFamily, letterSpacing: 1 }}>
            Ana Sayfa
          </button>
        </div>
      </div>
    </div>
  )
}
