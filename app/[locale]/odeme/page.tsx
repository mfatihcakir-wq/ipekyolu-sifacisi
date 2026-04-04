'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Cinzel, EB_Garamond } from 'next/font/google'

const cinzel = Cinzel({ subsets: ['latin'], weight: ['400', '500', '600'] })
const garamond = EB_Garamond({ subsets: ['latin'], weight: ['400', '500'], style: ['normal', 'italic'] })

const C = {
  primary: '#1B4332', gold: '#C9A84C', cream: '#F5EFE6',
  dark: '#1C1C1C', secondary: '#5C4A2A', border: '#E0D5C5',
  white: '#FFFFFF', surface: '#FAF7F2',
}

const PLANLAR = [
  { id: 'monthly', ad: 'Aylık Plan', fiyat: 690, gun: 'günde 23₺', aciklama: 'Sınırsız analiz · WhatsApp danışmanlık · Aylık protokol güncellemesi' },
  { id: 'yearly', ad: 'Yıllık Plan', fiyat: 390, gun: 'günde 13₺ · %43 indirim', aciklama: 'Sınırsız analiz · WhatsApp danışmanlık · Öncelikli hizmet', popular: true },
  { id: 'one_time', ad: 'Tek Seferlik', fiyat: 990, gun: '1 tam analiz', aciklama: '1 analiz · WhatsApp protokol · PDF sonuç' },
]

function OdemeIcerik() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [seciliPlan, setSeciliPlan] = useState('yearly')
  const [yukleniyor, setYukleniyor] = useState(false)
  const [ad, setAd] = useState('')
  const [soyad, setSoyad] = useState('')
  const [email, setEmail] = useState('')
  const [toast, setToast] = useState<{mesaj: string, tip: 'hata' | 'basari'} | null>(null)
  function gosterToast(mesaj: string, tip: 'hata' | 'basari' = 'hata') {
    setToast({ mesaj, tip })
    setTimeout(() => setToast(null), 4000)
  }

  useEffect(() => {
    const plan = searchParams.get('plan')
    if (plan) setSeciliPlan(plan)
  }, [searchParams])

  const plan = PLANLAR.find(p => p.id === seciliPlan) || PLANLAR[1]

  async function odemeBaslat() {
    if (!ad || !soyad || !email) {
      gosterToast('Lutfen tum alanlari doldurun.')
      return
    }
    setYukleniyor(true)
    try {
      const res = await fetch('/api/odeme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: seciliPlan, ad, soyad, email }),
      })
      const data = await res.json()
      if (data.checkoutFormContent) {
        const div = document.createElement('div')
        div.innerHTML = data.checkoutFormContent
        document.body.appendChild(div)
        const script = div.querySelector('script')
        if (script) {
          const s = document.createElement('script')
          s.src = script.src
          document.body.appendChild(s)
        }
      } else if (data.error) {
        gosterToast('Odeme baslatilamadi: ' + data.error)
      }
    } catch {
      gosterToast('Bir hata olustu. Lutfen tekrar deneyin.')
    }
    setYukleniyor(false)
  }

  return (
    <div style={{ background: C.cream, minHeight: '100vh', fontFamily: garamond.style.fontFamily }}>
      <header style={{ background: C.primary, padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: cinzel.style.fontFamily, color: C.gold, fontSize: 14, fontWeight: 600, letterSpacing: 3, cursor: 'pointer' }} onClick={() => router.push('/')}>
          {"İPEK YOLU ŞİFACISI"}
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)' }}>{"Güvenli Ödeme · SSL"}</div>
      </header>

      {/* TOAST */}
      {toast && (
        <div style={{
          position: 'fixed' as const, top: 20, right: 20, zIndex: 9999,
          background: toast.tip === 'hata' ? '#FCEBEB' : '#EAF3DE',
          border: `1px solid ${toast.tip === 'hata' ? '#F7C1C1' : '#C0DD97'}`,
          color: toast.tip === 'hata' ? '#A32D2D' : '#3B6D11',
          padding: '14px 20px', borderRadius: 10, fontSize: 13,
          maxWidth: 360, boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
          display: 'flex', alignItems: 'center', gap: 10
        }}>
          <span>{toast.tip === 'hata' ? '\u26A0' : '\u2713'}</span>
          <span>{toast.mesaj}</span>
          <button onClick={() => setToast(null)}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'inherit', padding: '0 4px' }}>
            {'\u2715'}
          </button>
        </div>
      )}

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 24, color: C.primary, marginBottom: 8 }}>{"Planınızı Seçin"}</div>
          <div style={{ fontSize: 14, color: C.secondary, fontStyle: 'italic' }}>{"İlk analizden sonra fark yaşarsınız"}</div>
        </div>

        {/* PLAN SEÇİCİ */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12, marginBottom: 32 }}>
          {PLANLAR.map(p => (
            <div key={p.id} onClick={() => setSeciliPlan(p.id)}
              style={{ background: C.white, borderRadius: 12, padding: '20px 16px', border: `2px solid ${seciliPlan === p.id ? C.primary : C.border}`, cursor: 'pointer', position: 'relative' as const, transition: 'all .15s' }}>
              {p.popular && (
                <div style={{ position: 'absolute' as const, top: -10, left: '50%', transform: 'translateX(-50%)', background: C.gold, color: C.primary, fontSize: 9, fontWeight: 600, padding: '2px 10px', borderRadius: 10, fontFamily: cinzel.style.fontFamily, letterSpacing: 1, whiteSpace: 'nowrap' as const }}>
                  EN AVANTAJLI
                </div>
              )}
              <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 13, color: C.primary, marginBottom: 6 }}>{p.ad}</div>
              <div style={{ fontSize: 28, fontWeight: 600, color: C.dark, marginBottom: 4 }}>{p.fiyat}₺<span style={{ fontSize: 12, fontWeight: 400, color: C.secondary }}>/ay</span></div>
              <div style={{ fontSize: 11, color: C.gold, marginBottom: 10 }}>{p.gun}</div>
              <div style={{ fontSize: 11, color: C.secondary, lineHeight: 1.6 }}>{p.aciklama}</div>
              {seciliPlan === p.id && (
                <div style={{ marginTop: 10, height: 3, background: C.primary, borderRadius: 2 }} />
              )}
            </div>
          ))}
        </div>

        {/* KİŞİSEL BİLGİLER */}
        <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: '24px 28px', marginBottom: 20 }}>
          <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 12, color: C.primary, letterSpacing: 2, marginBottom: 16, textTransform: 'uppercase' as const }}>{"Kişisel Bilgiler"}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 11, color: C.secondary, display: 'block', marginBottom: 6 }}>Ad *</label>
              <input value={ad} onChange={e => setAd(e.target.value)} placeholder="Adınız"
                style={{ width: '100%', padding: '10px 12px', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, fontFamily: garamond.style.fontFamily, outline: 'none', background: C.surface, boxSizing: 'border-box' as const }} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: C.secondary, display: 'block', marginBottom: 6 }}>Soyad *</label>
              <input value={soyad} onChange={e => setSoyad(e.target.value)} placeholder="Soyadınız"
                style={{ width: '100%', padding: '10px 12px', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, fontFamily: garamond.style.fontFamily, outline: 'none', background: C.surface, boxSizing: 'border-box' as const }} />
            </div>
          </div>
          <div>
            <label style={{ fontSize: 11, color: C.secondary, display: 'block', marginBottom: 6 }}>E-posta *</label>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="e-posta adresiniz"
              style={{ width: '100%', padding: '10px 12px', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, fontFamily: garamond.style.fontFamily, outline: 'none', background: C.surface, boxSizing: 'border-box' as const }} />
          </div>
        </div>

        {/* ÖZET */}
        <div style={{ background: C.primary, borderRadius: 12, padding: '16px 24px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.5)', letterSpacing: 2 }}>{"SEÇİLEN PLAN"}</div>
            <div style={{ fontFamily: cinzel.style.fontFamily, color: C.gold, fontSize: 15, marginTop: 4 }}>{plan.ad}</div>
          </div>
          <div style={{ textAlign: 'right' as const }}>
            <div style={{ fontSize: 24, fontWeight: 600, color: C.white }}>{plan.fiyat}₺</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.5)' }}>{"aylık"}</div>
          </div>
        </div>

        <button onClick={odemeBaslat} disabled={yukleniyor}
          style={{ width: '100%', padding: 16, background: yukleniyor ? '#999' : C.gold, border: 'none', borderRadius: 12, cursor: yukleniyor ? 'not-allowed' : 'pointer', fontFamily: cinzel.style.fontFamily, fontSize: 14, fontWeight: 600, color: C.primary, letterSpacing: 2 }}>
          {yukleniyor ? 'Ödeme Başlatılıyor...' : 'GÜVENLİ ÖDEME YAP →'}
        </button>

        <div style={{ textAlign: 'center' as const, marginTop: 12, fontSize: 11, color: C.secondary }}>
          {"256-bit SSL şifreleme · iyzico güvencesi · KVKK uyumlu"}
        </div>
      </div>
    </div>
  )
}

export default function OdemePage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#F5EFE6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'serif' }}>Yükleniyor...</div>}>
      <OdemeIcerik />
    </Suspense>
  )
}
