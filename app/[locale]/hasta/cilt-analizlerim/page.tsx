'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Cinzel, EB_Garamond } from 'next/font/google'
import { createClient } from '@/lib/supabase'

const cinzel = Cinzel({ subsets: ['latin'], weight: ['400', '500', '600'] })
const garamond = EB_Garamond({ subsets: ['latin'], weight: ['400', '500'], style: ['normal', 'italic'] })

const C = {
  primary: '#1B4332', gold: '#C9A84C', cream: '#F5EFE6',
  dark: '#1C1C1C', secondary: '#5C4A2A', border: '#E0D5C5',
  white: '#FFFFFF', surface: '#FAF7F2',
}

interface CiltForm {
  id: string
  created_at: string
  durum: string
  sorunlar: string[]
  sonuc_verisi: { sorun_ozeti?: string } | null
}

const durumBadge = (d: string) => {
  if (d === 'onaylandi') return { bg: '#E8F5E9', color: '#2E7D32', text: 'Onaylandi' }
  if (d === 'analiz_edildi') return { bg: '#E3F2FD', color: '#1565C0', text: 'Analiz Edildi' }
  if (d === 'reddedildi') return { bg: '#fef2f2', color: '#dc2626', text: 'Reddedildi' }
  return { bg: '#FFF8E7', color: '#E65100', text: 'Bekliyor' }
}

export default function CiltAnalizlerimPage() {
  const router = useRouter()
  const supabase = createClient()
  const [forms, setForms] = useState<CiltForm[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function yukle() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/giris'); return }
      const { data } = await supabase
        .from('cilt_forms')
        .select('id, created_at, durum, sorunlar, sonuc_verisi')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      setForms(data || [])
      setLoading(false)
    }
    yukle()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div style={{ background: C.cream, minHeight: '100vh', fontFamily: garamond.style.fontFamily }}>
      <header style={{ background: C.primary, padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', gap: 12, position: 'sticky' as const, top: 0, zIndex: 100 }}>
        <button onClick={() => router.push('/hasta')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: 18 }}>{'\u2190'}</button>
        <div style={{ fontFamily: cinzel.style.fontFamily, color: C.gold, fontSize: 13, letterSpacing: 2 }}>CILT ANALIZLERIM</div>
      </header>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '32px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h1 style={{ fontFamily: cinzel.style.fontFamily, fontSize: 22, color: C.primary, fontWeight: 500 }}>Cilt Analizlerim</h1>
          <button onClick={() => router.push('/hasta/cilt')} style={{ padding: '8px 18px', background: C.gold, border: 'none', borderRadius: 8, fontFamily: cinzel.style.fontFamily, fontSize: 11, color: C.primary, cursor: 'pointer', fontWeight: 600 }}>+ Yeni Analiz</button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ width: 36, height: 36, border: `3px solid ${C.border}`, borderTop: `3px solid ${C.primary}`, borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          </div>
        ) : forms.length === 0 ? (
          <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: '40px', textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: C.secondary, marginBottom: 12 }}>Henuz cilt analiziniz yok.</p>
            <button onClick={() => router.push('/hasta/cilt')} style={{ padding: '10px 24px', background: C.primary, color: C.gold, border: 'none', borderRadius: 8, fontFamily: cinzel.style.fontFamily, fontSize: 12, cursor: 'pointer' }}>Ilk Cilt Analizini Yap</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {forms.map(f => {
              const badge = durumBadge(f.durum)
              const tarih = new Date(f.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
              const aktif = f.durum === 'onaylandi' || f.durum === 'analiz_edildi'
              return (
                <div key={f.id} style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: '20px 24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div>
                      <div style={{ fontSize: 14, color: C.dark, fontWeight: 500 }}>{tarih}</div>
                      <div style={{ fontSize: 12, color: C.secondary, marginTop: 4 }}>{f.sorunlar?.join(', ') || '-'}</div>
                    </div>
                    <span style={{ fontSize: 10, background: badge.bg, color: badge.color, padding: '3px 10px', borderRadius: 20, fontWeight: 600 }}>{badge.text}</span>
                  </div>
                  {f.sonuc_verisi?.sorun_ozeti && (
                    <div style={{ fontSize: 12, color: C.secondary, fontStyle: 'italic', marginBottom: 8 }}>{f.sonuc_verisi.sorun_ozeti.slice(0, 120)}...</div>
                  )}
                  <button onClick={() => aktif ? router.push(`/hasta/cilt-analizlerim/${f.id}`) : null}
                    style={{ padding: '8px 16px', borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: aktif ? 'pointer' : 'not-allowed', border: `1px solid ${aktif ? C.primary : C.border}`, background: aktif ? C.primary : 'transparent', color: aktif ? C.gold : '#999', opacity: aktif ? 1 : 0.5 }}>
                    {aktif ? 'Raporu Goruntule' : 'Analiz Bekleniyor'}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
