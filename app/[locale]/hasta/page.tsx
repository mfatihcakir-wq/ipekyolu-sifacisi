'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Cormorant_Garamond as Cinzel, EB_Garamond } from 'next/font/google'
import { createClient } from '@/lib/supabase'

const cinzel = Cinzel({ display: 'swap', preload: false, subsets: ['latin', 'latin-ext'], weight: ['400', '500', '600'] })
const garamond = EB_Garamond({ display: 'swap', preload: false, subsets: ['latin', 'latin-ext'], weight: ['400', '500'], style: ['normal', 'italic'] })

const C = {
  primary: '#1C3A26', gold: '#B8922A', cream: '#FAF6EF',
  dark: '#1C1C1C', secondary: '#6B5744', border: '#DEB887',
  white: '#FFFFFF', surface: '#FAF6EF', darkBg: '#122B1C',
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
  { label: 'Karakter', href: '/karakter', icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5' },
]

export default function HastaPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [ad, setAd] = useState('')
  const [analizler, setAnalizler] = useState<Analiz[]>([])
  const [abonelik, setAbonelik] = useState<{ plan: string; bitis: string } | null>(null)

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
          <div style={{ fontFamily: cinzel.style.fontFamily, color: C.gold, fontSize: 13, fontWeight: 600, letterSpacing: 2 }}>İPEK YOLU</div>
          <div style={{ fontFamily: cinzel.style.fontFamily, color: C.gold, fontSize: 10, letterSpacing: 3, opacity: 0.6 }}>SIFACISI</div>
        </div>
        <nav style={{ flex: 1 }}>
          {SIDEBAR_ITEMS.map(item => (
            <button key={item.label} onClick={() => router.push(item.href)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, width: '100%',
                padding: '12px 20px', background: item.active ? 'rgba(184,146,42,0.15)' : 'transparent',
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
            &ldquo;Saglik, bedenin fıtrî mizaçina donmesidir.&rdquo; — İbn Sînâ
          </p>
        </div>

        {/* 3 metrik kart */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 20 }}>
          <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: '20px', borderTop: `3px solid ${C.primary}` }}>
            <div style={{ fontSize: 10, color: C.secondary, letterSpacing: 1, marginBottom: 6 }}>TOPLAM ANALIZ</div>
            <div style={{ fontSize: 28, fontWeight: 600, color: C.primary, fontFamily: cinzel.style.fontFamily }}>{toplamAnaliz}</div>
          </div>
          <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: '20px', borderTop: `3px solid ${C.gold}` }}>
            <div style={{ fontSize: 10, color: C.secondary, letterSpacing: 1, marginBottom: 6 }}>BU HAFTA</div>
            <div style={{ fontSize: 28, fontWeight: 600, color: '#B8860B', fontFamily: cinzel.style.fontFamily }}>{buHafta}</div>
            <div style={{ fontSize: 10, color: '#999', marginTop: 2 }}>/ 1 hak</div>
          </div>
          <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: '20px', borderTop: `3px solid ${abonelik ? '#2E7D32' : '#C62828'}` }}>
            <div style={{ fontSize: 10, color: C.secondary, letterSpacing: 1, marginBottom: 6 }}>UYELIK</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: abonelik ? '#2E7D32' : '#C62828' }}>
              {abonelik ? `Aktif` : 'Pasif'}
            </div>
            {abonelik && <div style={{ fontSize: 11, color: C.secondary, marginTop: 2 }}>{abonelik.plan} · {new Date(abonelik.bitis).toLocaleDateString('tr-TR')}</div>}
          </div>
        </div>

        {/* Haftalik limit cubugu */}
        {abonelik && (
          <div style={{ background: C.white, borderRadius: 10, border: `1px solid ${C.border}`, padding: '14px 18px', marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: C.secondary }}>Haftalik Analiz Hakki</span>
              <span style={{ fontSize: 11, color: C.dark, fontWeight: 600 }}>{buHafta} / 1</span>
            </div>
            <div style={{ height: 6, background: C.surface, borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min(buHafta * 100, 100)}%`, background: buHafta >= 1 ? '#C62828' : C.primary, borderRadius: 3, transition: 'width .3s' }} />
            </div>
            {buHafta >= 1 && <div style={{ fontSize: 10, color: '#C62828', marginTop: 4 }}>Bu haftalik hakkiniz kullanildi. Sonraki hafta yenilenir.</div>}
          </div>
        )}

        {/* Hizli erisim butonlari */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10, marginBottom: 24 }}>
          {[
            { label: 'Yeni Analiz', href: '/analiz', bg: C.primary, color: C.gold },
            { label: 'Cilt Analizi', href: '/hasta/cilt', bg: C.gold, color: C.primary },
            { label: 'Bitkiler', href: '/bitkiler', bg: C.white, color: C.primary },
            { label: 'Takip', href: '/hasta/takip', bg: C.white, color: C.primary },
          ].map(b => (
            <button key={b.label} onClick={() => router.push(b.href)}
              style={{ padding: '14px 12px', borderRadius: 10, border: b.bg === C.white ? `1px solid ${C.border}` : 'none', background: b.bg, color: b.color, fontFamily: cinzel.style.fontFamily, fontSize: 11, fontWeight: 600, cursor: 'pointer', letterSpacing: 1 }}>
              {b.label}
            </button>
          ))}
        </div>

        {/* Son analiz detay karti */}
        {analizler.length > 0 && analizler[0].durum === 'tamamlandi' && (
          <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: '20px 24px', marginBottom: 20 }}>
            <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 11, color: C.primary, letterSpacing: 2, marginBottom: 12 }}>SON ANALIZ SONUCU</div>
            <div style={{ fontSize: 14, color: C.dark, fontWeight: 500, marginBottom: 8 }}>
              {analizler[0].tum_form_verisi?.ad_soyad || 'Analiz'} — {new Date(analizler[0].created_at).toLocaleDateString('tr-TR')}
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const, marginBottom: 8 }}>
              {analizler[0].tum_form_verisi?.symptoms?.split(',').slice(0, 3).map((s: string, i: number) => (
                <span key={i} style={{ fontSize: 10, background: C.surface, padding: '3px 8px', borderRadius: 10, color: C.secondary }}>{s.trim()}</span>
              ))}
            </div>
            <div style={{ fontSize: 12, color: C.secondary, fontStyle: 'italic' }}>
              Detay icin takip panelini ziyaret edin.
            </div>
          </div>
        )}

        {/* Son analizler listesi */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 12, color: C.primary, letterSpacing: 2, marginBottom: 12 }}>ANALIZLERIM</div>
          {analizler.length === 0 ? (
            <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: '40px', textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.3 }}>{'\u2697'}</div>
              <p style={{ fontSize: 15, color: C.dark, marginBottom: 6 }}>Henuz analiz yok</p>
              <p style={{ fontSize: 13, color: C.secondary, marginBottom: 16 }}>Ilk mizaç analizinizi yaparak klasik Islam tibbi yolculugunuza baslayin.</p>
              <button onClick={() => router.push('/analiz')}
                style={{ padding: '12px 28px', background: C.primary, color: C.gold, border: 'none', borderRadius: 10, fontFamily: cinzel.style.fontFamily, fontSize: 12, cursor: 'pointer', letterSpacing: 1, fontWeight: 600 }}>
                Ilk Analizini Yap
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 8 }}>
              {analizler.map(a => {
                const form = a.tum_form_verisi || {}
                const tarih = new Date(a.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })
                return (
                  <div key={a.id} style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' as const, gap: 8 }}>
                    <div>
                      <div style={{ fontSize: 14, color: C.dark, fontWeight: 500 }}>{form.ad_soyad || 'Analiz'}</div>
                      <div style={{ fontSize: 12, color: C.secondary, marginTop: 2 }}>
                        {tarih} · {form.symptoms?.slice(0, 50) || 'Sikayet belirtilmemis'}{form.symptoms?.length > 50 ? '...' : ''}
                      </div>
                    </div>
                    <div style={{
                      padding: '4px 12px', borderRadius: 20, fontSize: 10, fontWeight: 600,
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

        {/* Üyelik durumu — pasif ise */}
        {!abonelik && (
          <div style={{ background: `linear-gradient(135deg, ${C.primary}, #122B1C)`, borderRadius: 16, padding: '28px', textAlign: 'center' }}>
            <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 16, color: C.gold, marginBottom: 8, letterSpacing: 1 }}>Uyeliginiz Aktif Degil</div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 20, lineHeight: 1.6 }}>
              Analiz sonuclarinizi gormek, bitki protokolu almak ve danismaninizla iletisim kurmak icin uye olun.
            </p>
            <button onClick={() => router.push('/odeme')}
              style={{ padding: '14px 32px', background: C.gold, border: 'none', borderRadius: 10, fontFamily: cinzel.style.fontFamily, fontSize: 14, fontWeight: 600, color: C.primary, cursor: 'pointer', letterSpacing: 1 }}>
              Uye Ol — 590{'\u20BA'}/ay
            </button>
          </div>
        )}

        {/* Hikmet */}
        <div style={{ marginTop: 24, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: '16px 20px', textAlign: 'center' }}>
          <p style={{ fontSize: 13, color: C.secondary, fontStyle: 'italic', lineHeight: 1.6, margin: 0 }}>
            &ldquo;Beden, ancak mizaci bilindiginde tedavi edilebilir.&rdquo;
          </p>
          <p style={{ fontSize: 10, color: '#999', marginTop: 4, marginBottom: 0 }}>el-Kânûn fi&apos;t-Tib, Kitab 1</p>
        </div>
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
