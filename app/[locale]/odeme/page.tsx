'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Cinzel, EB_Garamond } from 'next/font/google'
import { createClient } from '@/lib/supabase'
import Header from '../components/Header'
import Footer from '../components/Footer'

const cinzel = Cinzel({ subsets: ['latin', 'latin-ext'], weight: ['400', '500', '600'] })
const garamond = EB_Garamond({ subsets: ['latin', 'latin-ext'], weight: ['400', '500'], style: ['normal', 'italic'] })

const C = {
  primary: '#1B4332', gold: '#8B6914', cream: '#FAF7F2',
  dark: '#1C1C1C', secondary: '#6B5744', border: '#E8DFD4',
  white: '#FFFFFF', surface: '#FAF7F2',
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 14px', border: `1.5px solid ${C.border}`, borderRadius: 8,
  fontSize: 16, minHeight: 44, outline: 'none', boxSizing: 'border-box',
  fontFamily: 'inherit', background: C.surface, color: C.dark,
}

const PLANLAR = [
  { id: 'monthly', ad: 'Aylik Plan', fiyat: 890, birim: '/ay', gun: 'Haftada 1 analiz', aciklama: 'WhatsApp danismanlik · Aylik protokol guncellemesi', indirim: '' },
  { id: 'yearly', ad: 'Yillik Plan', fiyat: 590, birim: '/ay', gun: 'Haftada 1 analiz', aciklama: 'WhatsApp danismanlik · Oncelikli hizmet · PDF rapor', indirim: '%34 indirim', popular: true },
  { id: 'one_time', ad: 'Tek Seferlik', fiyat: 1290, birim: '', gun: '1 tam analiz', aciklama: 'WhatsApp protokol · PDF sonuc' },
]

const PROGRESS = [
  { label: 'Form', done: true },
  { label: 'Kayit', done: true },
  { label: 'Odeme', active: true },
  { label: 'Aktivasyon', done: false },
]

function OdemeIcerik() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClient()
  const [seciliPlan, setSeciliPlan] = useState('yearly')
  const [yukleniyor, setYukleniyor] = useState(false)
  const [ad, setAd] = useState('')
  const [telefon, setTelefon] = useState('')
  const [email, setEmail] = useState('')
  const [kartNo, setKartNo] = useState('')
  const [kartSkt, setKartSkt] = useState('')
  const [kartCvv, setKartCvv] = useState('')
  const [kartIsim, setKartIsim] = useState('')
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
    if (!ad || !email) { gosterToast('Ad ve e-posta zorunludur.'); return }
    if (!kartNo || !kartSkt || !kartCvv) { gosterToast('Kart bilgilerini doldurun.'); return }
    setYukleniyor(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/giris'); return }

      const now = new Date()
      const bitis = new Date(now)
      if (seciliPlan === 'monthly') bitis.setMonth(bitis.getMonth() + 1)
      else if (seciliPlan === 'yearly') bitis.setFullYear(bitis.getFullYear() + 1)
      else bitis.setMonth(bitis.getMonth() + 1)

      await supabase.from('abonelikler').insert({
        kullanici_id: user.id,
        plan: seciliPlan,
        durum: 'aktif',
        baslangic: now.toISOString(),
        bitis: bitis.toISOString(),
        fiyat: plan.fiyat,
      })

      router.push('/odeme/basarili')
    } catch {
      gosterToast('Bir hata olustu. Lutfen tekrar deneyin.')
    }
    setYukleniyor(false)
  }

  return (
    <div style={{ background: C.cream, minHeight: '100vh', fontFamily: garamond.style.fontFamily }}>
      <Header />

      {/* TOAST */}
      {toast && (
        <div style={{
          position: 'fixed' as const, top: 20, right: 20, zIndex: 9999,
          background: toast.tip === 'hata' ? '#FCEBEB' : '#EAF3DE',
          border: `1px solid ${toast.tip === 'hata' ? '#F7C1C1' : '#C0DD97'}`,
          color: toast.tip === 'hata' ? '#A32D2D' : '#3B6D11',
          padding: '14px 20px', borderRadius: 10, fontSize: 13, maxWidth: 360,
          boxShadow: '0 4px 20px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', gap: 10
        }}>
          <span>{toast.mesaj}</span>
          <button onClick={() => setToast(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'inherit' }}>{'\u2715'}</button>
        </div>
      )}

      <div style={{ maxWidth: 920, margin: '0 auto', padding: '32px 20px' }}>

        {/* PROGRESS BAR */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 36, flexWrap: 'wrap' as const }}>
          {PROGRESS.map((step, i) => (
            <div key={step.label} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: step.done ? C.primary : step.active ? C.gold : C.border,
                color: step.done ? C.gold : step.active ? C.primary : '#999',
                fontSize: 12, fontWeight: 600, fontFamily: cinzel.style.fontFamily,
              }}>
                {step.done ? '\u2713' : i + 1}
              </div>
              <span style={{ fontSize: 11, color: step.active ? C.primary : C.secondary, marginLeft: 6, fontWeight: step.active ? 600 : 400 }}>{step.label}</span>
              {i < PROGRESS.length - 1 && (
                <div style={{ width: 40, height: 2, background: step.done ? C.primary : C.border, margin: '0 8px' }} />
              )}
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 24, color: C.primary, marginBottom: 6 }}>Planinizi Secin</div>
          <div style={{ fontSize: 14, color: C.secondary, fontStyle: 'italic' }}>Ilk analizden sonra farki hissedeceksiniz</div>
        </div>

        {/* PLAN KARTLARI */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 12, marginBottom: 28 }}>
          {PLANLAR.map(p => (
            <div key={p.id} onClick={() => setSeciliPlan(p.id)}
              style={{
                background: C.white, borderRadius: 14, padding: '24px 20px',
                border: `2px solid ${seciliPlan === p.id ? C.primary : C.border}`,
                cursor: 'pointer', position: 'relative' as const, transition: 'all .15s',
                boxShadow: seciliPlan === p.id ? '0 4px 20px rgba(27,67,50,0.15)' : 'none',
              }}>
              {p.popular && (
                <div style={{ position: 'absolute' as const, top: -10, left: '50%', transform: 'translateX(-50%)', background: C.gold, color: C.primary, fontSize: 9, fontWeight: 600, padding: '3px 12px', borderRadius: 10, fontFamily: cinzel.style.fontFamily, letterSpacing: 1, whiteSpace: 'nowrap' as const }}>
                  EN AVANTAJLI
                </div>
              )}
              <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 14, color: C.primary, marginBottom: 8 }}>{p.ad}</div>
              <div style={{ fontSize: 32, fontWeight: 600, color: C.dark, marginBottom: 4 }}>
                {p.fiyat}<span style={{ fontSize: 14, fontWeight: 400, color: C.secondary }}>{'\u20BA'}{p.birim}</span>
              </div>
              {p.indirim && <div style={{ fontSize: 11, color: '#2E7D32', fontWeight: 600, marginBottom: 6 }}>{p.indirim}</div>}
              <div style={{ fontSize: 12, color: C.gold, marginBottom: 8 }}>{p.gun}</div>
              <div style={{ fontSize: 11, color: C.secondary, lineHeight: 1.6 }}>{p.aciklama}</div>
              {seciliPlan === p.id && <div style={{ marginTop: 12, height: 3, background: C.primary, borderRadius: 2 }} />}
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 16 }}>
          {/* FATURA BİLGİLERİ */}
          <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: '24px 24px' }}>
            <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 11, color: C.primary, letterSpacing: 2, marginBottom: 16 }}>FATURA BILGILERI</div>
            <div style={{ display: 'grid', gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, color: C.secondary, display: 'block', marginBottom: 4 }}>Ad Soyad *</label>
                <input value={ad} onChange={e => setAd(e.target.value)} placeholder="Adiniz Soyadiniz" style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: C.secondary, display: 'block', marginBottom: 4 }}>Telefon</label>
                <input value={telefon} onChange={e => setTelefon(e.target.value)} placeholder="+90 555 000 0000" style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: C.secondary, display: 'block', marginBottom: 4 }}>E-posta *</label>
                <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="ornek@email.com" style={inputStyle} />
              </div>
            </div>
          </div>

          {/* KART BİLGİLERİ */}
          <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: '24px 24px' }}>
            <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 11, color: C.primary, letterSpacing: 2, marginBottom: 16 }}>KART BILGILERI</div>
            <div style={{ display: 'grid', gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, color: C.secondary, display: 'block', marginBottom: 4 }}>Kart Numarasi *</label>
                <input value={kartNo} onChange={e => setKartNo(e.target.value)} placeholder="0000 0000 0000 0000" maxLength={19} style={inputStyle} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, color: C.secondary, display: 'block', marginBottom: 4 }}>Son Kullanma *</label>
                  <input value={kartSkt} onChange={e => setKartSkt(e.target.value)} placeholder="AA/YY" maxLength={5} style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: C.secondary, display: 'block', marginBottom: 4 }}>CVV *</label>
                  <input value={kartCvv} onChange={e => setKartCvv(e.target.value)} placeholder="000" maxLength={4} type="password" style={inputStyle} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 11, color: C.secondary, display: 'block', marginBottom: 4 }}>Kart Uzerindeki Isim</label>
                <input value={kartIsim} onChange={e => setKartIsim(e.target.value)} placeholder="AD SOYAD" style={inputStyle} />
              </div>
            </div>
            <div style={{ marginTop: 12, fontSize: 11, color: '#999', fontStyle: 'italic' }}>
              3D Secure ile guvenli odeme yapilacaktir. iyzico entegrasyonu aktif olunca devreye girecektir.
            </div>
          </div>
        </div>

        {/* ÖZET */}
        <div style={{ background: C.primary, borderRadius: 12, padding: '16px 24px', margin: '20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' as const, gap: 12 }}>
          <div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.5)', letterSpacing: 2 }}>SECILEN PLAN</div>
            <div style={{ fontFamily: cinzel.style.fontFamily, color: C.gold, fontSize: 15, marginTop: 4 }}>{plan.ad}</div>
          </div>
          <div style={{ textAlign: 'right' as const }}>
            <div style={{ fontSize: 28, fontWeight: 600, color: C.white }}>{plan.fiyat}{'\u20BA'}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.5)' }}>{plan.birim ? 'aylik' : 'tek seferlik'}</div>
          </div>
        </div>

        <button onClick={odemeBaslat} disabled={yukleniyor}
          style={{
            width: '100%', padding: 18, background: yukleniyor ? '#999' : C.gold, border: 'none',
            borderRadius: 12, cursor: yukleniyor ? 'not-allowed' : 'pointer',
            fontFamily: cinzel.style.fontFamily, fontSize: 15, fontWeight: 600,
            color: C.primary, letterSpacing: 2, minHeight: 44,
          }}>
          {yukleniyor ? 'Odeme Baslatiliyor...' : 'GUVENLI ODEME YAP'}
        </button>

        <div style={{ textAlign: 'center', marginTop: 12, fontSize: 11, color: C.secondary }}>
          256-bit SSL sifreleme · iyzico guvencesi · KVKK uyumlu
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default function OdemePage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#FAF7F2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'serif' }}>Yukleniyor...</div>}>
      <OdemeIcerik />
    </Suspense>
  )
}
