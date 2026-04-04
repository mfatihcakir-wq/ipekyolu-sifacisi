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
  white: '#FFFFFF', surface: '#FAF7F2', darkBg: '#0F2D1C',
}

interface Analiz {
  id: string
  created_at: string
  durum: string
  tum_form_verisi: Record<string, string>
}

const SIDEBAR_ITEMS = [
  { label: 'Ana Sayfa', href: '/', icon: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z' },
  { label: 'Analizlerim', href: '/hasta', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', active: true },
  { label: 'Bitkiler', href: '/bitkiler', icon: 'M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z' },
  { label: 'Profilim', href: '/hasta', icon: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2' },
  { label: 'Takip', href: '/hasta/takip', icon: 'M22 12h-4l-3 9L9 3l-3 9H2' },
]

export default function HastaPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [ad, setAd] = useState('')
  const [analizler, setAnalizler] = useState<Analiz[]>([])
  const [abonelik, setAbonelik] = useState<{ plan: string; bitis: string } | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    async function yukle() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/giris'); return }

      setAd(user.user_metadata?.full_name || user.email?.split('@')[0] || 'Kullanici')

      const { data: forms } = await supabase
        .from('detailed_forms')
        .select('id, created_at, durum, tum_form_verisi')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)
      setAnalizler(forms || [])

      const { data: abone } = await supabase
        .from('abonelikler')
        .select('plan, bitis')
        .eq('kullanici_id', user.id)
        .eq('durum', 'aktif')
        .single()
      setAbonelik(abone)

      setLoading(false)
    }
    yukle()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toplamAnaliz = analizler.length
  const buHafta = analizler.filter(a => {
    const d = new Date(a.created_at)
    const now = new Date()
    const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
    return diff <= 7
  }).length

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: C.cream, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, border: `3px solid ${C.border}`, borderTop: `3px solid ${C.primary}`, borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          <div style={{ fontFamily: cinzel.style.fontFamily, color: C.primary, fontSize: 14, letterSpacing: 2 }}>Yukleniyor...</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: garamond.style.fontFamily, background: C.cream }}>
      {/* SIDEBAR — masaustu */}
      <aside className="hasta-sidebar" style={{
        width: 240, background: C.primary, padding: '24px 0', flexShrink: 0,
        display: 'flex', flexDirection: 'column', position: 'sticky' as const, top: 0, height: '100vh',
      }}>
        <div style={{ padding: '0 20px', marginBottom: 32 }}>
          <div style={{ fontFamily: cinzel.style.fontFamily, color: C.gold, fontSize: 13, fontWeight: 600, letterSpacing: 2 }}>IPEK YOLU</div>
          <div style={{ fontFamily: cinzel.style.fontFamily, color: C.gold, fontSize: 10, letterSpacing: 3, opacity: 0.6 }}>SIFACISI</div>
        </div>
        <nav style={{ flex: 1 }}>
          {SIDEBAR_ITEMS.map(item => (
            <button key={item.label} onClick={() => router.push(item.href)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, width: '100%',
                padding: '12px 20px', background: item.active ? 'rgba(201,168,76,0.15)' : 'transparent',
                border: 'none', borderLeft: item.active ? `3px solid ${C.gold}` : '3px solid transparent',
                color: item.active ? C.gold : 'rgba(255,255,255,0.6)',
                fontSize: 13, cursor: 'pointer', textAlign: 'left',
              }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d={item.icon}/></svg>
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* MOBIL BOTTOM NAV */}
      <div className="hasta-bottom-nav" style={{
        position: 'fixed' as const, bottom: 0, left: 0, right: 0, height: 56,
        background: C.primary, display: 'none', justifyContent: 'space-around',
        alignItems: 'center', zIndex: 100, borderTop: '1px solid rgba(255,255,255,0.1)',
      }}>
        {SIDEBAR_ITEMS.slice(0, 4).map(item => (
          <button key={item.label} onClick={() => router.push(item.href)}
            style={{ background: 'none', border: 'none', color: item.active ? C.gold : 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: '4px 8px', textAlign: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d={item.icon}/></svg>
            <div style={{ fontSize: 9, marginTop: 2 }}>{item.label}</div>
          </button>
        ))}
      </div>

      {/* ANA ICERIK */}
      <main style={{ flex: 1, padding: '32px clamp(16px, 3vw, 40px)', paddingBottom: 80, maxWidth: 900 }}>
        {/* Karsilama */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: cinzel.style.fontFamily, fontSize: 'clamp(20px, 3vw, 26px)', color: C.primary, marginBottom: 4, fontWeight: 500 }}>
            Hosgeldiniz, {ad}
          </h1>
          <p style={{ fontSize: 14, color: C.secondary, fontStyle: 'italic' }}>
            &ldquo;Saglik, bedenin fitrî mizacina donmesidir.&rdquo; — Ibn Sina
          </p>
        </div>

        {/* 3 metrik kart */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
          <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: '20px' }}>
            <div style={{ fontSize: 10, color: C.secondary, letterSpacing: 1, marginBottom: 6 }}>TOPLAM ANALIZ</div>
            <div style={{ fontSize: 28, fontWeight: 600, color: C.primary }}>{toplamAnaliz}</div>
          </div>
          <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: '20px' }}>
            <div style={{ fontSize: 10, color: C.secondary, letterSpacing: 1, marginBottom: 6 }}>BU HAFTA</div>
            <div style={{ fontSize: 28, fontWeight: 600, color: C.gold }}>{buHafta}</div>
          </div>
          <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: '20px' }}>
            <div style={{ fontSize: 10, color: C.secondary, letterSpacing: 1, marginBottom: 6 }}>UYELIK</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: abonelik ? '#2E7D32' : '#C62828' }}>
              {abonelik ? `Aktif — ${abonelik.plan}` : 'Pasif'}
            </div>
            {abonelik && (
              <div style={{ fontSize: 11, color: C.secondary, marginTop: 4 }}>
                Bitis: {new Date(abonelik.bitis).toLocaleDateString('tr-TR')}
              </div>
            )}
          </div>
        </div>

        {/* Son analizler */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 12, color: C.primary, letterSpacing: 2, marginBottom: 12 }}>SON ANALIZLER</div>
          {analizler.length === 0 ? (
            <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: '32px', textAlign: 'center' }}>
              <p style={{ fontSize: 14, color: C.secondary }}>Henuz analiz yok.</p>
              <button onClick={() => router.push('/analiz')}
                style={{ marginTop: 12, padding: '10px 24px', background: C.primary, color: C.gold, border: 'none', borderRadius: 8, fontFamily: cinzel.style.fontFamily, fontSize: 12, cursor: 'pointer', letterSpacing: 1 }}>
                Ilk Analizini Yap
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              {analizler.map(a => {
                const form = a.tum_form_verisi || {}
                const tarih = new Date(a.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })
                return (
                  <div key={a.id} style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' as const, gap: 8 }}>
                    <div>
                      <div style={{ fontSize: 14, color: C.dark, fontWeight: 500 }}>{form.ad_soyad || 'Analiz'}</div>
                      <div style={{ fontSize: 12, color: C.secondary, marginTop: 2 }}>
                        {tarih} · {form.symptoms?.slice(0, 60) || 'Sikayet belirtilmemis'}{form.symptoms?.length > 60 ? '...' : ''}
                      </div>
                    </div>
                    <div style={{
                      padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                      background: a.durum === 'tamamlandi' ? '#E8F5E9' : a.durum === 'bekliyor' ? '#FFF8E7' : C.surface,
                      color: a.durum === 'tamamlandi' ? '#2E7D32' : a.durum === 'bekliyor' ? '#E65100' : C.secondary,
                    }}>
                      {a.durum === 'tamamlandi' ? 'Tamamlandi' : a.durum === 'bekliyor' ? 'Bekliyor' : a.durum}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Uyelik durumu */}
        {!abonelik && (
          <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: C.secondary, marginBottom: 12 }}>Uyeliginiz aktif degil. Analiz sonuclarinizi gormek icin uye olun.</div>
            <button onClick={() => router.push('/odeme')}
              style={{ padding: '12px 28px', background: C.gold, border: 'none', borderRadius: 8, fontFamily: cinzel.style.fontFamily, fontSize: 13, fontWeight: 600, color: C.primary, cursor: 'pointer', letterSpacing: 1 }}>
              Uye Ol
            </button>
          </div>
        )}
      </main>

      <style>{`
        @media (max-width: 768px) {
          .hasta-sidebar { display: none !important; }
          .hasta-bottom-nav { display: flex !important; }
        }
      `}</style>
    </div>
  )
}
