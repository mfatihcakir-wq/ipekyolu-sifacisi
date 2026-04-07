'use client'

const plans = [
  {
    id: 'aylik',
    name: 'AYLIK',
    price: '890₺',
    period: '/ay',
    note: 'günde 29₺',
    badge: '',
    features: [
      'Sınırsız analiz',
      'WhatsApp danışmanlık',
      'Bitki protokolü',
      'PDF reçete',
    ],
    link: 'https://shopier.com/ipekyolusifacisi/45901561',
    hot: false,
  },
  {
    id: 'yillik',
    name: 'YILLIK',
    price: '590₺',
    period: '/ay',
    note: '%34 indirim · günde 19₺',
    badge: 'EN AVANTAJLI',
    features: [
      'Sınırsız analiz',
      'WhatsApp danışmanlık',
      'Bitki protokolü',
      'Öncelikli destek',
    ],
    link: 'https://shopier.com/ipekyolusifacisi/45901595',
    hot: true,
  },
  {
    id: 'tek',
    name: 'TEK SEFERLİK',
    price: '1.290₺',
    period: 'tek ödeme',
    note: '1 analiz + sonuç',
    badge: '',
    features: [
      'Tek analiz hakkı',
      'WhatsApp protokol',
      'Bitki protokolü',
      'PDF rapor',
    ],
    link: 'https://shopier.com/ipekyolusifacisi/45901613',
    hot: false,
  },
]

export default function OdemePage() {
  return (
    <main style={{
      background: '#FAF6EF',
      minHeight: '100vh',
      padding: '80px clamp(20px,5vw,80px)',
    }}>
      <div style={{ textAlign: 'center' as const, marginBottom: 56 }}>
        <div style={{
          fontFamily: 'Cinzel,serif', fontSize: 10,
          color: '#B8860B', letterSpacing: 3, marginBottom: 14,
        }}>ÜYELİK</div>
        <h1 style={{
          fontFamily: 'Cinzel,serif',
          fontSize: 'clamp(28px,4vw,38px)',
          fontWeight: 600, color: '#1A1208', marginBottom: 12,
        }}>Size Uygun Planı Seçin</h1>
        <p style={{
          fontSize: 18, color: '#5C4A2A',
          fontStyle: 'italic',
          fontFamily: 'EB Garamond,serif',
        }}>
          İlk analizden sonra fark yaşarsınız.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))',
        gap: 20, maxWidth: 960, margin: '0 auto',
      }}>
        {plans.map(plan => (
          <div key={plan.id} style={{
            background: plan.hot ? '#1C3A26' : 'white',
            border: `1px solid ${plan.hot ? '#1C3A26' : '#DEB887'}`,
            borderRadius: 18, padding: '36px 28px',
            textAlign: 'center' as const,
          }}>
            {plan.badge && (
              <div style={{
                fontFamily: 'Cinzel,serif', fontSize: 8,
                background: '#B8860B', color: '#1C3A26',
                padding: '4px 14px', borderRadius: 20,
                letterSpacing: 1.5, display: 'inline-block',
                marginBottom: 16, fontWeight: 700,
              }}>{plan.badge}</div>
            )}
            <div style={{
              fontFamily: 'Cinzel,serif', fontSize: 10,
              color: plan.hot ? 'rgba(245,237,224,0.4)' : '#9B8060',
              letterSpacing: 2.5, marginBottom: 12,
            }}>{plan.name}</div>
            <div style={{
              fontFamily: 'Cinzel,serif', fontSize: 44,
              fontWeight: 700,
              color: plan.hot ? '#F5EDE0' : '#1C3A26',
              lineHeight: 1,
            }}>{plan.price}</div>
            <div style={{
              fontSize: 14,
              color: plan.hot ? 'rgba(245,237,224,0.4)' : '#9B8060',
              fontFamily: 'EB Garamond,serif',
            }}>{plan.period}</div>
            <div style={{
              fontFamily: 'Cinzel,serif', fontSize: 11,
              color: plan.hot ? '#B8860B' : '#9B8060',
              letterSpacing: 1, margin: '4px 0 22px',
            }}>{plan.note}</div>
            <div style={{
              height: 1,
              background: plan.hot
                ? 'rgba(245,237,224,0.1)' : '#DEB887',
              margin: '18px 0',
            }} />
            {plan.features.map(f => (
              <div key={f} style={{
                fontSize: 14,
                color: plan.hot
                  ? 'rgba(245,237,224,0.6)' : '#5C4A2A',
                padding: '5px 0',
                borderBottom: `1px solid ${plan.hot
                  ? 'rgba(245,237,224,0.07)' : '#F5EFE0'}`,
                fontFamily: 'EB Garamond,serif',
              }}>{f}</div>
            ))}
            <button
              onClick={() => window.open(plan.link, '_blank')}
              style={{
                width: '100%', marginTop: 22, padding: 14,
                fontFamily: 'Cinzel,serif', fontSize: 10,
                fontWeight: 700, letterSpacing: 2,
                borderRadius: 10, border: 'none',
                cursor: 'pointer',
                background: plan.hot ? '#B8860B' : '#1C3A26',
                color: plan.hot ? '#1C3A26' : '#F5EDE0',
              }}>
              BAŞLA
            </button>
          </div>
        ))}
      </div>

      <div style={{
        textAlign: 'center' as const, marginTop: 40,
        fontFamily: 'Cinzel,serif', fontSize: 9,
        color: '#9B8060', letterSpacing: 2,
      }}>
        Ödeme Shopier güvencesiyle gerçekleşir.
        Ödeme sonrası hesabınız otomatik aktif olur.
      </div>
    </main>
  )
}
