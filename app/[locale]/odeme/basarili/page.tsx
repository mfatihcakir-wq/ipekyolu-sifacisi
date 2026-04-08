'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Cormorant_Garamond as Cinzel, EB_Garamond } from 'next/font/google'
import { createClient } from '@/lib/supabase'
import Header from '../../components/Header'
import Footer from '../../components/Footer'

const cinzel = Cinzel({ display: 'swap', preload: false, subsets: ['latin', 'latin-ext'], weight: ['400', '500', '600'] })
const garamond = EB_Garamond({ display: 'swap', preload: false, subsets: ['latin', 'latin-ext'], weight: ['400', '500'], style: ['normal', 'italic'] })

const C = {
  primary: '#1C3A26', gold: '#B8860B', cream: '#FAF6EF',
  dark: '#1C1C1C', secondary: '#6B5744', border: '#DEB887',
  white: '#FFFFFF', surface: '#FAF6EF',
}

const PLAN_ADLARI: Record<string, string> = {
  monthly: 'Aylik Plan', yearly: 'Yillik Plan', one_time: 'Tek Seferlik',
}

function BasariliIcerik() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [plan, setPlan] = useState('')
  const [bitis, setBitis] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const p = searchParams.get('plan') || ''
    setPlan(p)

    async function yukle() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: ab } = await supabase
          .from('abonelikler')
          .select('plan, bitis')
          .eq('kullanici_id', user.id)
          .eq('durum', 'aktif')
          .order('created_at', { ascending: false })
          .limit(1)
          .single()
        if (ab) {
          setPlan(ab.plan)
          setBitis(new Date(ab.bitis).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }))
        }
      }
      setLoading(false)
    }
    yukle()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div style={{ background: C.cream, minHeight: '100vh', fontFamily: garamond.style.fontFamily }}>
      <Header />

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '60px 20px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ width: 40, height: 40, border: `3px solid ${C.border}`, borderTop: `3px solid ${C.primary}`, borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          </div>
        ) : (
          <>
            <div style={{ background: C.white, borderRadius: 20, border: `1px solid ${C.border}`, padding: '48px 40px', textAlign: 'center', marginBottom: 24 }}>
              {/* Basari badge */}
              <div style={{ width: 80, height: 80, background: '#EAF3DE', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={C.primary} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              </div>

              <h1 style={{ fontFamily: cinzel.style.fontFamily, fontSize: 26, fontWeight: 500, color: C.primary, marginBottom: 8, letterSpacing: 1 }}>
                Uyeliginiz Aktif
              </h1>
              <p style={{ fontSize: 16, color: C.secondary, fontStyle: 'italic', lineHeight: 1.7, marginBottom: 24 }}>
                Odemeniz basariyla tamamlandi. Danismaniniz sizinle ilgilenmeye basliyor.
              </p>

              {/* Plan bilgisi */}
              {plan && (
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: '16px 20px', marginBottom: 24, display: 'inline-block' }}>
                  <div style={{ fontSize: 10, color: '#999', letterSpacing: 1, marginBottom: 4 }}>AKTIF PLAN</div>
                  <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 18, color: C.primary, fontWeight: 600 }}>{PLAN_ADLARI[plan] || plan}</div>
                  {bitis && <div style={{ fontSize: 12, color: C.secondary, marginTop: 4 }}>Gecerlilik: {bitis}</div>}
                </div>
              )}

              {/* 4 Adim */}
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

              {/* Hikmet */}
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: '16px 20px', marginBottom: 28 }}>
                <p style={{ fontSize: 14, color: C.secondary, fontStyle: 'italic', lineHeight: 1.7, margin: 0 }}>
                  &ldquo;Beden, ancak mizaci bilindiginde tedavi edilebilir.&rdquo;
                </p>
                <p style={{ fontSize: 11, color: '#999', marginTop: 6, marginBottom: 0 }}>
                  el-Kânûn fi&apos;t-Tib, Kitab 1
                </p>
              </div>
            </div>

            {/* Butonlar */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
              <button onClick={() => router.push('/analiz')}
                style={{ padding: 14, background: C.gold, border: 'none', borderRadius: 10, fontFamily: cinzel.style.fontFamily, fontSize: 13, fontWeight: 600, color: C.primary, cursor: 'pointer', letterSpacing: 1 }}>
                Analiz Formunu Doldur
              </button>
              <button onClick={() => router.push('/hasta')}
                style={{ padding: 14, background: C.primary, border: 'none', borderRadius: 10, fontFamily: cinzel.style.fontFamily, fontSize: 13, fontWeight: 600, color: C.gold, cursor: 'pointer', letterSpacing: 1 }}>
                Hasta Paneline Git
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <a href="https://wa.me/905331687226?text=Merhaba%2C%20odeme%20yaptim%2C%20uyeligim%20aktif."
                target="_blank"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#25D366', color: 'white', borderRadius: 10, padding: 14, fontSize: 13, fontWeight: 600, textDecoration: 'none', fontFamily: cinzel.style.fontFamily, letterSpacing: 1 }}>
                WhatsApp
              </a>
              <button onClick={() => router.push('/')}
                style={{ background: 'transparent', border: `1.5px solid ${C.primary}`, borderRadius: 10, padding: 14, fontSize: 13, fontWeight: 600, color: C.primary, cursor: 'pointer', fontFamily: cinzel.style.fontFamily, letterSpacing: 1 }}>
                Ana Sayfa
              </button>
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  )
}

export default function OdemeBasariliPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#FAF6EF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Yukleniyor...</div>}>
      <BasariliIcerik />
    </Suspense>
  )
}
