'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Cinzel, EB_Garamond } from 'next/font/google'
import { createClient } from '@/lib/supabase'

const cinzel = Cinzel({ display: 'swap', preload: false, subsets: ['latin', 'latin-ext'], weight: ['400', '500', '600'] })
const garamond = EB_Garamond({ display: 'swap', preload: false, subsets: ['latin', 'latin-ext'], weight: ['400', '500'], style: ['normal', 'italic'] })

const C = {
  primary: '#1C3A26', gold: '#B8860B', cream: '#FAF6EF',
  dark: '#1C1C1C', secondary: '#6B5744', border: '#DEB887',
  white: '#FFFFFF', surface: '#FAF6EF',
}

const HILT_COLORS: Record<string, string> = {
  dem: '#EF5350', safra: '#FF9800', balgam: '#42A5F5', sevda: '#AB47BC',
}

interface FormVeri {
  mizac_sicaklik?: string
  mizac_nem?: string
  nb_hiz_sinif?: string
  fitri_mizac_ruh?: string
  fitri_isi_hassas?: string
  fitri_sindirim?: string
  [key: string]: string | undefined
}

interface Analiz {
  id: string
  created_at: string
  tum_form_verisi: FormVeri
  durum: string
}

function hiltHesapla(form: FormVeri) {
  const s = { dem: 0, safra: 0, balgam: 0, sevda: 0 }
  if (form.mizac_sicaklik === 'sıcak') { s.dem += 2; s.safra += 2 }
  if (form.mizac_sicaklik === 'soğuk') { s.balgam += 2; s.sevda += 2 }
  if (form.mizac_nem === 'nemli') { s.dem += 1; s.balgam += 1 }
  if (form.mizac_nem === 'kuru') { s.safra += 1; s.sevda += 1 }
  if (form.nb_hiz_sinif === 'hizli') { s.safra += 1; s.dem += 1 }
  if (form.nb_hiz_sinif === 'yavas') { s.balgam += 1; s.sevda += 1 }
  const total = Object.values(s).reduce((a, b) => a + b, 1)
  return { dem: s.dem / total, safra: s.safra / total, balgam: s.balgam / total, sevda: s.sevda / total }
}

function fitriHiltHesapla(form: FormVeri) {
  const s = { dem: 0, safra: 0, balgam: 0, sevda: 0 }
  if (form.fitri_mizac_ruh === 'neşeli_enerjik') s.dem += 2
  if (form.fitri_mizac_ruh === 'ofkeli_hizli') s.safra += 2
  if (form.fitri_mizac_ruh === 'sakin_agir') s.balgam += 2
  if (form.fitri_mizac_ruh === 'dusunceli_melankolik') s.sevda += 2
  if (form.fitri_isi_hassas === 'sicaga_hassas') { s.safra += 1; s.dem += 1 }
  if (form.fitri_isi_hassas === 'soguga_hassas') { s.balgam += 1; s.sevda += 1 }
  if (form.fitri_sindirim === 'cok_hizli') s.safra += 1
  if (form.fitri_sindirim === 'cok_yavas') s.sevda += 1
  if (form.fitri_sindirim === 'yavas') s.balgam += 1
  const total = Object.values(s).reduce((a, b) => a + b, 1)
  return { dem: s.dem / total, safra: s.safra / total, balgam: s.balgam / total, sevda: s.sevda / total }
}

function yakinlasmaSkor(fitri: Record<string, number>, hali: Record<string, number>) {
  let diff = 0
  for (const k of ['dem', 'safra', 'balgam', 'sevda']) {
    diff += Math.abs((fitri[k] || 0) - (hali[k] || 0))
  }
  return Math.max(0, Math.round((1 - diff / 2) * 100))
}

export default function TakipPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [analizler, setAnalizler] = useState<Analiz[]>([])
  const [donem, setDonem] = useState<'3ay' | '6ay' | '1yil'>('3ay')

  useEffect(() => {
    async function yukle() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/giris'); return }

      const { data } = await supabase
        .from('detailed_forms')
        .select('id, created_at, tum_form_verisi, durum')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(100)
      setAnalizler(data || [])
      setLoading(false)
    }
    yukle()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const donemGun = donem === '3ay' ? 90 : donem === '6ay' ? 180 : 365
  const now = Date.now()
  const filtrelenmis = analizler.filter(a => (now - new Date(a.created_at).getTime()) / 86400000 <= donemGun)

  const sonForm = filtrelenmis.length > 0 ? filtrelenmis[filtrelenmis.length - 1].tum_form_verisi : null
  const sonHilt = sonForm ? hiltHesapla(sonForm) : null
  const sonFitri = sonForm ? fitriHiltHesapla(sonForm) : null
  const skor = sonFitri && sonHilt ? yakinlasmaSkor(sonFitri, sonHilt) : null

  const baskinHilt = sonHilt
    ? Object.entries(sonHilt).sort((a, b) => b[1] - a[1])[0][0]
    : '-'

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: C.cream, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 40, height: 40, border: `3px solid ${C.border}`, borderTop: `3px solid ${C.primary}`, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  return (
    <div style={{ background: C.cream, minHeight: '100vh', fontFamily: garamond.style.fontFamily }}>
      <header style={{ background: C.primary, padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky' as const, top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => router.push('/hasta')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: 18, padding: 4 }}>{'\u2190'}</button>
          <div style={{ fontFamily: cinzel.style.fontFamily, color: C.gold, fontSize: 13, letterSpacing: 2 }}>TAKIP PANELI</div>
        </div>
      </header>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '28px 20px' }}>
        {/* Donem secici */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {([['3ay', '3 Ay'], ['6ay', '6 Ay'], ['1yil', '1 Yil']] as const).map(([val, label]) => (
            <button key={val} onClick={() => setDonem(val)}
              style={{
                padding: '8px 16px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                border: `1px solid ${donem === val ? C.primary : C.border}`,
                background: donem === val ? C.primary : 'transparent',
                color: donem === val ? C.gold : C.secondary,
              }}>
              {label}
            </button>
          ))}
        </div>

        {/* 4 ozet kart */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
          <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: '18px' }}>
            <div style={{ fontSize: 10, color: C.secondary, letterSpacing: 1, marginBottom: 6 }}>TOPLAM ANALIZ</div>
            <div style={{ fontSize: 28, fontWeight: 600, color: C.primary }}>{filtrelenmis.length}</div>
          </div>
          <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: '18px' }}>
            <div style={{ fontSize: 10, color: C.secondary, letterSpacing: 1, marginBottom: 6 }}>BASKIN HILT</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: HILT_COLORS[baskinHilt] || C.dark, textTransform: 'capitalize' as const }}>{baskinHilt}</div>
          </div>
          <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: '18px' }}>
            <div style={{ fontSize: 10, color: C.secondary, letterSpacing: 1, marginBottom: 6 }}>YAKINLASMA SKORU</div>
            <div style={{ fontSize: 28, fontWeight: 600, color: skor !== null && skor >= 70 ? '#2E7D32' : C.gold }}>{skor !== null ? skor : '-'}</div>
          </div>
          <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: '18px' }}>
            <div style={{ fontSize: 10, color: C.secondary, letterSpacing: 1, marginBottom: 6 }}>SON DEGISIM</div>
            <div style={{ fontSize: 14, color: C.secondary }}>
              {filtrelenmis.length > 0 ? new Date(filtrelenmis[filtrelenmis.length - 1].created_at).toLocaleDateString('tr-TR') : '-'}
            </div>
          </div>
        </div>

        {/* Fitri-Hali Yakinlasma Skoru */}
        {skor !== null && sonFitri && sonHilt && (
          <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: '28px', marginBottom: 24 }}>
            <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 12, color: C.primary, letterSpacing: 2, marginBottom: 20 }}>FITRI-HALI YAKINLASMA</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap' as const }}>
              {/* Gauge */}
              <div style={{ position: 'relative' as const, width: 120, height: 120 }}>
                <svg width="120" height="120" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="52" fill="none" stroke={C.border} strokeWidth="8"/>
                  <circle cx="60" cy="60" r="52" fill="none" stroke={skor >= 70 ? '#2E7D32' : C.gold} strokeWidth="8"
                    strokeDasharray={`${skor * 3.27} 327`} strokeLinecap="round" transform="rotate(-90 60 60)"/>
                </svg>
                <div style={{ position: 'absolute' as const, inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                  <div style={{ fontSize: 28, fontWeight: 600, color: C.primary }}>{skor}</div>
                  <div style={{ fontSize: 9, color: C.secondary }}>/ 100</div>
                </div>
              </div>

              {/* Hilt karsilastirma barlari */}
              <div style={{ flex: 1, minWidth: 200 }}>
                {(['dem', 'safra', 'balgam', 'sevda'] as const).map(h => (
                  <div key={h} style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: C.secondary, marginBottom: 3 }}>
                      <span style={{ textTransform: 'capitalize' }}>{h}</span>
                      <span>F: {Math.round(sonFitri[h] * 100)}% / H: {Math.round(sonHilt[h] * 100)}%</span>
                    </div>
                    <div style={{ display: 'flex', gap: 3, height: 8 }}>
                      <div style={{ flex: 1, background: C.surface, borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ width: `${sonFitri[h] * 100}%`, height: '100%', background: HILT_COLORS[h], opacity: 0.5, borderRadius: 4 }} />
                      </div>
                      <div style={{ flex: 1, background: C.surface, borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ width: `${sonHilt[h] * 100}%`, height: '100%', background: HILT_COLORS[h], borderRadius: 4 }} />
                      </div>
                    </div>
                  </div>
                ))}
                <div style={{ display: 'flex', gap: 12, fontSize: 10, color: '#999', marginTop: 4 }}>
                  <span>Acik = Fitri</span><span>Koyu = Hali</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mizac bant grafigi */}
        {filtrelenmis.length > 0 && (
          <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: '28px', marginBottom: 24 }}>
            <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 12, color: C.primary, letterSpacing: 2, marginBottom: 16 }}>HILT DENGESI TARIHCESI</div>
            {filtrelenmis.map((a, i) => {
              const h = hiltHesapla(a.tum_form_verisi)
              const tarih = new Date(a.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
              return (
                <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 60, fontSize: 10, color: C.secondary, flexShrink: 0 }}>{tarih}</div>
                  <div style={{ flex: 1, display: 'flex', height: 16, borderRadius: 4, overflow: 'hidden' }}>
                    {(['dem', 'safra', 'balgam', 'sevda'] as const).map(k => (
                      <div key={k} style={{ width: `${h[k] * 100}%`, background: HILT_COLORS[k], minWidth: h[k] > 0.05 ? 4 : 0 }} />
                    ))}
                  </div>
                  <div style={{ width: 20, fontSize: 10, color: '#999' }}>{i + 1}</div>
                </div>
              )
            })}
            <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
              {Object.entries(HILT_COLORS).map(([k, v]) => (
                <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: v }} />
                  <span style={{ fontSize: 10, color: C.secondary, textTransform: 'capitalize' }}>{k}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analiz yoksa */}
        {filtrelenmis.length === 0 && (
          <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: '40px', textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: C.secondary, marginBottom: 12 }}>Bu donemde analiz bulunamadi.</p>
            <button onClick={() => router.push('/analiz')}
              style={{ padding: '10px 24px', background: C.primary, color: C.gold, border: 'none', borderRadius: 8, fontFamily: cinzel.style.fontFamily, fontSize: 12, cursor: 'pointer' }}>
              Analiz Yap
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
