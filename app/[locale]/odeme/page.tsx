'use client'

import Header from '../components/Header'
import Footer from '../components/Footer'

const plans = [
  { id: 'aylik', name: 'AYLIK PLAN', price: '890\u20ba', period: '/ay', note: 'g\u00fcnde 29\u20ba', features: ['S\u0131n\u0131rs\u0131z analiz', 'WhatsApp dan\u0131\u015fmanl\u0131k', 'Bitki protokol\u00fc', 'PDF re\u00e7ete'], link: 'https://shopier.com/ipekyolusifacisi/45901561', hot: false, badge: '' },
  { id: 'yillik', name: 'YILLIK PLAN', price: '590\u20ba', period: '/ay', note: '%34 indirim \u00b7 g\u00fcnde 19\u20ba', features: ['S\u0131n\u0131rs\u0131z analiz', 'WhatsApp dan\u0131\u015fmanl\u0131k', 'Bitki protokol\u00fc', '\u00d6ncelikli destek'], link: 'https://shopier.com/ipekyolusifacisi/45901595', hot: true, badge: 'EN AVANTAJLI' },
  { id: 'tek', name: 'TEK SEFER', price: '1.290\u20ba', period: 'tek \u00f6deme', note: '1 analiz + sonu\u00e7', features: ['Tek analiz hakk\u0131', 'WhatsApp protokol', 'Bitki protokol\u00fc', 'PDF rapor'], link: 'https://shopier.com/ipekyolusifacisi/45901613', hot: false, badge: '' },
]

export default function OdemePage() {
  return (
    <div style={{ background: '#FAF6EF', minHeight: '100vh' }}>
      <Header />
      <main style={{ padding: '64px clamp(24px,5vw,80px)' }}>
        <div style={{ textAlign: 'center' as const, marginBottom: 56 }}>
          <div style={{ fontFamily: 'Cinzel,serif', fontSize: 10, color: '#B8860B', letterSpacing: 3, marginBottom: 14 }}>{"\u00dcYEL\u0130K"}</div>
          <h1 style={{ fontFamily: 'Cinzel,serif', fontSize: 'clamp(28px,4vw,38px)', fontWeight: 600, color: '#1A1208', marginBottom: 12 }}>{"Size Uygun Plan\u0131 Se\u00e7in"}</h1>
          <p style={{ fontSize: 18, color: '#5C4A2A', fontStyle: 'italic' }}>{"\u0130lk analizden sonra fark ya\u015fars\u0131n\u0131z."}</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, maxWidth: 920, margin: '0 auto' }}>
          {plans.map(plan => (
            <div key={plan.id} style={{ background: plan.hot ? '#1C3A26' : 'white', border: `1px solid ${plan.hot ? '#1C3A26' : '#DEB887'}`, borderRadius: 18, padding: '36px 28px', textAlign: 'center' as const }}>
              {plan.badge && <div style={{ fontFamily: 'Cinzel,serif', fontSize: 8, background: '#B8860B', color: '#1C3A26', padding: '4px 14px', borderRadius: 20, letterSpacing: 1.5, display: 'inline-block', marginBottom: 16, fontWeight: 700 }}>{plan.badge}</div>}
              <div style={{ fontFamily: 'Cinzel,serif', fontSize: 10, color: plan.hot ? 'rgba(245,237,224,0.4)' : '#9B8060', letterSpacing: 2.5, marginBottom: 12 }}>{plan.name}</div>
              <div style={{ fontFamily: 'Cinzel,serif', fontSize: 44, fontWeight: 700, color: plan.hot ? '#F5EDE0' : '#1C3A26', lineHeight: 1 }}>{plan.price}</div>
              <div style={{ fontSize: 14, color: plan.hot ? 'rgba(245,237,224,0.4)' : '#9B8060' }}>{plan.period}</div>
              <div style={{ fontFamily: 'Cinzel,serif', fontSize: 11, color: plan.hot ? '#B8860B' : '#9B8060', letterSpacing: 1, margin: '4px 0 22px' }}>{plan.note}</div>
              <div style={{ height: 1, background: plan.hot ? 'rgba(245,237,224,0.1)' : '#DEB887', margin: '18px 0' }} />
              {plan.features.map(f => (
                <div key={f} style={{ fontSize: 14, color: plan.hot ? 'rgba(245,237,224,0.6)' : '#5C4A2A', padding: '5px 0', borderBottom: `1px solid ${plan.hot ? 'rgba(245,237,224,0.07)' : '#F5EFE0'}` }}>{f}</div>
              ))}
              <button onClick={() => window.open(plan.link, '_blank')} style={{ width: '100%', marginTop: 22, padding: 14, fontFamily: 'Cinzel,serif', fontSize: 10, fontWeight: 700, letterSpacing: 2, borderRadius: 10, border: 'none', cursor: 'pointer', background: plan.hot ? '#B8860B' : '#1C3A26', color: plan.hot ? '#1C3A26' : '#F5EDE0' }}>{"SHOP\u0130ER \u0130LE \u00d6DE"}</button>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center' as const, marginTop: 48, fontFamily: 'Cinzel,serif', fontSize: 9, color: '#9B8060', letterSpacing: 2 }}>
          {"\u00d6deme Shopier g\u00fcvencesiyle ger\u00e7ekle\u015fir. \u00d6deme sonras\u0131 hesab\u0131n\u0131z otomatik aktif olur."}
        </div>
      </main>
      <Footer />
    </div>
  )
}
