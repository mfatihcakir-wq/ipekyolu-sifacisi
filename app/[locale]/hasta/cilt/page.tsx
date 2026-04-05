'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Cinzel, EB_Garamond } from 'next/font/google'
import { createClient } from '@/lib/supabase'

const cinzel = Cinzel({ subsets: ['latin', 'latin-ext'], weight: ['400', '500', '600'] })
const garamond = EB_Garamond({ subsets: ['latin', 'latin-ext'], weight: ['400', '500'], style: ['normal', 'italic'] })

const C = {
  primary: '#1B4332', gold: '#8B6914', cream: '#F5EFE6',
  dark: '#1C1C1C', secondary: '#5C4A2A', border: '#E0D5C5',
  white: '#FFFFFF', surface: '#FAF7F2',
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 14px', border: `1.5px solid ${C.border}`, borderRadius: 8,
  fontSize: 16, minHeight: 44, outline: 'none', boxSizing: 'border-box',
  fontFamily: 'inherit', background: C.surface, color: C.dark,
}
const selectStyle: React.CSSProperties = { ...inputStyle }

const SORUNLAR = [
  'Akne / Sivilce', 'Leke / Hiperpigmentasyon', 'Egzama / Dermatit',
  'Sedef (Psoriasis)', 'Kuruluk / Catlak', 'Yagli cilt', 'Kirisiklik / Yaslanma',
  'Rozasea / Kizariklik', 'Urtiker / Kurtdejen', 'Mantar', 'Sac dokulmesi',
  'Tirnak sorunlari', 'Yara izi', 'Diger',
]
const BOLGELER = [
  'Yuz', 'Alin', 'Burun', 'Yanaklar', 'Cene', 'Boyun',
  'Gogus', 'Sirt', 'Kollar', 'Bacaklar', 'Eller', 'Ayaklar', 'Sac derisi',
]

export default function CiltFormPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [durum, setDurum] = useState<'form' | 'gonderildi' | 'hata'>('form')
  const [form, setForm] = useState({
    yas_grubu: '', cinsiyet: '', cilt_tipi: '', cilt_rengi: '', hassasiyet: '',
    sorunlar: [] as string[], sorun_suresi: '', sorun_bolge: [] as string[],
    mevcut_urunler: '', alerjiler: '', kronik_hastalik: '', ilaclar: '',
    gunes_maruziyeti: '', su_tuketimi: '', uyku_duzeni: '', stres_seviyesi: '',
    beslenme: '', hamilelik: 'hayir', ek_notlar: '',
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const set = (key: string, val: any) => setForm(f => ({ ...f, [key]: val }))
  const toggleArr = (key: 'sorunlar' | 'sorun_bolge', val: string) => {
    setForm(f => ({ ...f, [key]: f[key].includes(val) ? f[key].filter(v => v !== val) : [...f[key], val] }))
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => { if (!user) router.push('/giris') })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSubmit() {
    if (form.sorunlar.length === 0) return
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/giris'); return }
      const { sorunlar, sorun_bolge, ...rest } = form
      await supabase.from('cilt_forms').insert({ user_id: user.id, sorunlar, sorun_bolge, ...rest, durum: 'bekliyor' })
      setDurum('gonderildi')
    } catch { setDurum('hata') }
    setLoading(false)
  }

  if (durum === 'gonderildi') {
    return (
      <div style={{ background: C.cream, minHeight: '100vh', fontFamily: garamond.style.fontFamily, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ background: C.white, borderRadius: 20, border: `1px solid ${C.border}`, padding: '48px 40px', textAlign: 'center', maxWidth: 500 }}>
          <div style={{ width: 72, height: 72, background: '#EAF3DE', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={C.primary} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h1 style={{ fontFamily: cinzel.style.fontFamily, fontSize: 22, color: C.primary, marginBottom: 8 }}>Formunuz Alindi</h1>
          <p style={{ fontSize: 14, color: C.secondary, lineHeight: 1.7, marginBottom: 24 }}>24-48 saat icinde cilt receteniz email ile iletilecektir.</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button onClick={() => router.push('/hasta')} style={{ padding: '12px 24px', background: C.primary, color: C.gold, border: 'none', borderRadius: 8, fontFamily: cinzel.style.fontFamily, fontSize: 12, cursor: 'pointer' }}>Panelim</button>
            <button onClick={() => router.push('/hasta/cilt-analizlerim')} style={{ padding: '12px 24px', background: 'transparent', color: C.primary, border: `1px solid ${C.primary}`, borderRadius: 8, fontFamily: cinzel.style.fontFamily, fontSize: 12, cursor: 'pointer' }}>Analizlerim</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: C.cream, minHeight: '100vh', fontFamily: garamond.style.fontFamily }}>
      <header style={{ background: C.primary, padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', gap: 12, position: 'sticky' as const, top: 0, zIndex: 100 }}>
        <button onClick={() => router.push('/hasta')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: 18 }}>{'\u2190'}</button>
        <div style={{ fontFamily: cinzel.style.fontFamily, color: C.gold, fontSize: 13, letterSpacing: 2 }}>CILT ANALIZ FORMU</div>
      </header>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '32px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <h1 style={{ fontFamily: cinzel.style.fontFamily, fontSize: 24, color: C.primary, marginBottom: 6 }}>Cilt Analiz Formu</h1>
          <p style={{ fontSize: 14, color: C.secondary, fontStyle: 'italic' }}>Klasik Islam tibbi ile cilt degerlendirmesi</p>
        </div>

        {/* KISISEL */}
        <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: '20px 24px', marginBottom: 16 }}>
          <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 10, color: C.primary, letterSpacing: 2, marginBottom: 12 }}>KISISEL BILGILER</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, color: C.secondary, display: 'block', marginBottom: 4 }}>Yas Grubu</label>
              <select value={form.yas_grubu} onChange={e => set('yas_grubu', e.target.value)} style={selectStyle}>
                <option value="">Secin</option>
                <option value="18-25">18-25</option><option value="25-35">25-35</option>
                <option value="35-50">35-50</option><option value="50-65">50-65</option><option value="65+">65+</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, color: C.secondary, display: 'block', marginBottom: 4 }}>Cinsiyet</label>
              <select value={form.cinsiyet} onChange={e => set('cinsiyet', e.target.value)} style={selectStyle}>
                <option value="">Secin</option><option value="erkek">Erkek</option><option value="kadin">Kadin</option>
              </select>
            </div>
          </div>
        </div>

        {/* CILT PROFILI */}
        <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: '20px 24px', marginBottom: 16 }}>
          <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 10, color: C.primary, letterSpacing: 2, marginBottom: 12 }}>CILT PROFILI</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, color: C.secondary, display: 'block', marginBottom: 4 }}>Cilt Tipi</label>
              <select value={form.cilt_tipi} onChange={e => set('cilt_tipi', e.target.value)} style={selectStyle}>
                <option value="">Secin</option><option value="kuru">Kuru</option><option value="yagli">Yagli</option>
                <option value="karma">Karma</option><option value="normal">Normal</option><option value="hassas">Hassas</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, color: C.secondary, display: 'block', marginBottom: 4 }}>Ten Rengi</label>
              <select value={form.cilt_rengi} onChange={e => set('cilt_rengi', e.target.value)} style={selectStyle}>
                <option value="">Secin</option><option value="acik">Acik</option><option value="bugday">Bugday</option>
                <option value="orta">Orta</option><option value="esmer">Esmer</option><option value="koyu">Koyu</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, color: C.secondary, display: 'block', marginBottom: 4 }}>Hassasiyet</label>
              <select value={form.hassasiyet} onChange={e => set('hassasiyet', e.target.value)} style={selectStyle}>
                <option value="">Secin</option><option value="dusuk">Dusuk</option><option value="orta">Orta</option><option value="yuksek">Yuksek</option>
              </select>
            </div>
          </div>
        </div>

        {/* SORUNLAR */}
        <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: '20px 24px', marginBottom: 16 }}>
          <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 10, color: C.primary, letterSpacing: 2, marginBottom: 12 }}>CILT SORUNLARI *</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' as const, marginBottom: 12 }}>
            {SORUNLAR.map(s => (
              <button key={s} onClick={() => toggleArr('sorunlar', s)} style={{ padding: '6px 12px', borderRadius: 20, fontSize: 11, cursor: 'pointer', border: `1px solid ${form.sorunlar.includes(s) ? C.primary : C.border}`, background: form.sorunlar.includes(s) ? C.primary : 'transparent', color: form.sorunlar.includes(s) ? C.gold : C.secondary }}>{s}</button>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, color: C.secondary, display: 'block', marginBottom: 4 }}>Sorun Suresi</label>
              <select value={form.sorun_suresi} onChange={e => set('sorun_suresi', e.target.value)} style={selectStyle}>
                <option value="">Secin</option><option value="1_hafta">1 haftadan az</option><option value="1_ay">1 aydan az</option>
                <option value="3_ay">1-3 ay</option><option value="6_ay">3-6 ay</option><option value="1_yil">6 ay - 1 yil</option><option value="uzun">1 yildan fazla</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, color: C.secondary, display: 'block', marginBottom: 4 }}>Hamilelik</label>
              <select value={form.hamilelik} onChange={e => set('hamilelik', e.target.value)} style={selectStyle}>
                <option value="hayir">Hayir</option><option value="hamile">Hamile</option><option value="emziren">Emziren</option>
              </select>
            </div>
          </div>
        </div>

        {/* BOLGELER */}
        <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: '20px 24px', marginBottom: 16 }}>
          <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 10, color: C.primary, letterSpacing: 2, marginBottom: 12 }}>ETKILENEN BOLGELER</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' as const }}>
            {BOLGELER.map(b => (
              <button key={b} onClick={() => toggleArr('sorun_bolge', b)} style={{ padding: '6px 12px', borderRadius: 20, fontSize: 11, cursor: 'pointer', border: `1px solid ${form.sorun_bolge.includes(b) ? C.gold : C.border}`, background: form.sorun_bolge.includes(b) ? C.gold : 'transparent', color: form.sorun_bolge.includes(b) ? C.primary : C.secondary }}>{b}</button>
            ))}
          </div>
        </div>

        {/* YASAM TARZI */}
        <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: '20px 24px', marginBottom: 16 }}>
          <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 10, color: C.primary, letterSpacing: 2, marginBottom: 12 }}>YASAM TARZI</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { key: 'gunes_maruziyeti', label: 'Gunes Maruziyeti', opts: [['','Secin'],['az','Az'],['orta','Orta'],['fazla','Fazla']] },
              { key: 'su_tuketimi', label: 'Su Tuketimi', opts: [['','Secin'],['az','1L altinda'],['orta','1-2L'],['iyi','2L+']] },
              { key: 'stres_seviyesi', label: 'Stres', opts: [['','Secin'],['dusuk','Dusuk'],['orta','Orta'],['yuksek','Yuksek']] },
              { key: 'uyku_duzeni', label: 'Uyku', opts: [['','Secin'],['iyi','Iyi (7-8h)'],['orta','Orta (5-6h)'],['kotu','Kotu']] },
            ].map(f => (
              <div key={f.key}>
                <label style={{ fontSize: 11, color: C.secondary, display: 'block', marginBottom: 4 }}>{f.label}</label>
                <select value={(form as Record<string, string | string[]>)[f.key] as string} onChange={e => set(f.key, e.target.value)} style={selectStyle}>
                  {f.opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12 }}>
            <label style={{ fontSize: 11, color: C.secondary, display: 'block', marginBottom: 4 }}>Mevcut Urunler</label>
            <input value={form.mevcut_urunler} onChange={e => set('mevcut_urunler', e.target.value)} placeholder="Kullandiginiz cilt bakim urunleri" style={inputStyle} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
            <div>
              <label style={{ fontSize: 11, color: C.secondary, display: 'block', marginBottom: 4 }}>Alerjiler</label>
              <input value={form.alerjiler} onChange={e => set('alerjiler', e.target.value)} placeholder="Bilinen alerjiler" style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: C.secondary, display: 'block', marginBottom: 4 }}>Kronik Hastalik</label>
              <input value={form.kronik_hastalik} onChange={e => set('kronik_hastalik', e.target.value)} placeholder="Diyabet, tiroid vb." style={inputStyle} />
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <label style={{ fontSize: 11, color: C.secondary, display: 'block', marginBottom: 4 }}>Ek Notlar</label>
            <textarea value={form.ek_notlar} onChange={e => set('ek_notlar', e.target.value)} placeholder="Eklemek istediginiz bilgiler..." style={{ ...inputStyle, height: 70, resize: 'none' as const }} />
          </div>
        </div>

        {durum === 'hata' && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '10px 14px', borderRadius: 10, fontSize: 13, marginBottom: 16 }}>Bir hata olustu. Tekrar deneyin.</div>}

        <button onClick={handleSubmit} disabled={loading || form.sorunlar.length === 0}
          style={{ width: '100%', padding: 16, background: loading ? '#999' : C.gold, border: 'none', borderRadius: 12, fontFamily: cinzel.style.fontFamily, fontSize: 14, fontWeight: 600, color: C.primary, letterSpacing: 1, cursor: loading ? 'not-allowed' : 'pointer', minHeight: 44, opacity: form.sorunlar.length === 0 ? 0.5 : 1 }}>
          {loading ? 'Gonderiliyor...' : 'Formu Gonder'}
        </button>
      </div>
    </div>
  )
}
