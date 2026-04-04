'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Cinzel, EB_Garamond } from 'next/font/google'

const cinzel = Cinzel({ subsets: ['latin'], weight: ['400', '500', '600'] })
const garamond = EB_Garamond({ subsets: ['latin'], weight: ['400', '500'], style: ['normal', 'italic'] })

const C = {
  primary: '#1B4332', gold: '#C9A84C', cream: '#F5EFE6',
  dark: '#1C1C1C', secondary: '#5C4A2A', border: '#E0D5C5',
  white: '#FFFFFF', surface: '#FAF7F2',
}

const s = {
  card: { background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: 'clamp(14px, 3vw, 24px)', marginBottom: 16 } as React.CSSProperties,
  label: { fontSize: 11, fontWeight: 600, color: C.secondary, letterSpacing: '0.5px', textTransform: 'uppercase' as const, marginBottom: 4, display: 'block' },
  select: { width: '100%', padding: '9px 12px', background: C.surface, border: `1.5px solid ${C.border}`, borderRadius: 8, fontSize: 16, minHeight: 44, color: C.dark, fontFamily: 'inherit' } as React.CSSProperties,
  textarea: { width: '100%', padding: '9px 12px', background: C.surface, border: `1.5px solid ${C.border}`, borderRadius: 8, fontSize: 16, color: C.dark, fontFamily: 'inherit', resize: 'none' as const, height: 80, boxSizing: 'border-box' as const } as React.CSSProperties,
  sectionTitle: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 10, fontWeight: 700, color: C.primary, letterSpacing: '3px', textTransform: 'uppercase' as const, marginBottom: 14, marginTop: 28 },
  grid2: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(260px, 100%), 1fr))', gap: 10 } as React.CSSProperties,
  tip: { background: '#FFF8E7', borderLeft: `3px solid ${C.gold}`, borderRadius: '0 6px 6px 0', padding: '8px 12px', fontSize: 12, color: C.secondary, marginBottom: 12, lineHeight: 1.5 } as React.CSSProperties,
}

export default function CiltAnaliziPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    cilt_tipi: '',
    cilt_tonu: '',
    yas_grubu: '',
    cinsiyet: '',
    ana_sorun: '',
    sure: '',
    mevsim: '',
    tetikleyiciler: [] as string[],
    hamilelik: 'Yok',
    ek_aciklama: '',
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const set = (key: string, val: any) => setForm(f => ({ ...f, [key]: val }))

  const toggleTetikleyici = (t: string) => {
    setForm(f => ({
      ...f,
      tetikleyiciler: f.tetikleyiciler.includes(t)
        ? f.tetikleyiciler.filter(x => x !== t)
        : [...f.tetikleyiciler, t],
    }))
  }

  const handleSubmit = () => {
    if (!form.cilt_tipi || !form.ana_sorun || !form.yas_grubu) {
      alert('Cilt tipi, ana sorun ve ya\u015f grubu zorunludur.')
      return
    }
    const payload = { ...form, type: 'cilt', timestamp: new Date().toISOString() }
    localStorage.setItem('ipekyolu_cilt_form', JSON.stringify(payload))
    router.push('/sonuc')
  }

  return (
    <div style={{ background: C.cream, minHeight: '100vh', fontFamily: garamond.style.fontFamily }}>
      {/* HEADER */}
      <header style={{ background: C.primary, padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => router.back()} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: 8, padding: '7px 14px', fontSize: 12, cursor: 'pointer' }}>
            {'\u2190'} Geri
          </button>
          <div>
            <div style={{ fontFamily: cinzel.style.fontFamily, color: C.gold, fontSize: 15, fontWeight: 600, letterSpacing: 3 }}>
              {"\u0130PEK YOLU \u015e\u0130FACISI"}
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>{"Cilt Bak\u0131m\u0131"}</div>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '24px 16px' }}>

        {/* TIP */}
        <div style={s.tip}>
          {"\u0130bn S\u00een\u00e2 el-K\u00e2n\u00fbn: Cilt mizac\u0131n d\u0131\u015f aynas\u0131d\u0131r. Kuru cilt sevd\u00e2v\u00ee, ya\u011fl\u0131 cilt demev\u00ee i\u015faret eder."}
        </div>

        {/* FORM CARD */}
        <div style={s.card}>
          <div style={s.sectionTitle}>
            <span>{"C\u0130LT B\u0130LG\u0130LER\u0130"}</span>
          </div>

          <div style={s.grid2}>
            {/* Cilt Tipi */}
            <div>
              <label style={s.label}>{"Cilt Tipi"}</label>
              <select style={s.select} value={form.cilt_tipi} onChange={e => set('cilt_tipi', e.target.value)}>
                <option value="">{"Se\u00e7iniz..."}</option>
                <option value="Kuru">{"Kuru"}</option>
                <option value="Ya\u011fl\u0131">{"Ya\u011fl\u0131"}</option>
                <option value="Normal">{"Normal"}</option>
                <option value="Karma">{"Karma"}</option>
                <option value="Hassas">{"Hassas"}</option>
              </select>
            </div>

            {/* Cilt Tonu */}
            <div>
              <label style={s.label}>{"Cilt Tonu"}</label>
              <select style={s.select} value={form.cilt_tonu} onChange={e => set('cilt_tonu', e.target.value)}>
                <option value="">{"Se\u00e7iniz..."}</option>
                <option value="A\u00e7\u0131k">{"A\u00e7\u0131k"}</option>
                <option value="Orta">{"Orta"}</option>
                <option value="Bu\u011fday">{"Bu\u011fday"}</option>
                <option value="Esmer">{"Esmer"}</option>
                <option value="Koyu">{"Koyu"}</option>
              </select>
            </div>

            {/* Yaş Grubu */}
            <div>
              <label style={s.label}>{"Ya\u015f Grubu"}</label>
              <select style={s.select} value={form.yas_grubu} onChange={e => set('yas_grubu', e.target.value)}>
                <option value="">{"Se\u00e7iniz..."}</option>
                <option value="18-25">{"18-25"}</option>
                <option value="26-35">{"26-35"}</option>
                <option value="36-45">{"36-45"}</option>
                <option value="46-55">{"46-55"}</option>
                <option value="56-65">{"56-65"}</option>
                <option value="65+">{"65+"}</option>
              </select>
            </div>

            {/* Cinsiyet */}
            <div>
              <label style={s.label}>{"Cinsiyet"}</label>
              <select style={s.select} value={form.cinsiyet} onChange={e => set('cinsiyet', e.target.value)}>
                <option value="">{"Se\u00e7iniz..."}</option>
                <option value="Erkek">{"Erkek"}</option>
                <option value="Kad\u0131n">{"Kad\u0131n"}</option>
              </select>
            </div>
          </div>

          <div style={s.sectionTitle}>
            <span>{"SORUN DETAYLARI"}</span>
          </div>

          <div style={s.grid2}>
            {/* Ana Cilt Sorunu */}
            <div>
              <label style={s.label}>{"Ana Cilt Sorunu"}</label>
              <select style={s.select} value={form.ana_sorun} onChange={e => set('ana_sorun', e.target.value)}>
                <option value="">{"Se\u00e7iniz..."}</option>
                <option value="Akne">{"Akne"}</option>
                <option value="Egzama">{"Egzama"}</option>
                <option value="Sedef">{"Sedef"}</option>
                <option value="Rozase">{"Rozase"}</option>
                <option value="Leke">{"Leke"}</option>
                <option value="Kuruluk">{"Kuruluk"}</option>
                <option value="Ya\u011flanma">{"Ya\u011flanma"}</option>
                <option value="Di\u011fer">{"Di\u011fer"}</option>
              </select>
            </div>

            {/* Ne Kadar Süredir */}
            <div>
              <label style={s.label}>{"Ne Kadar S\u00fcredir"}</label>
              <select style={s.select} value={form.sure} onChange={e => set('sure', e.target.value)}>
                <option value="">{"Se\u00e7iniz..."}</option>
                <option value="1 hafta">{"1 hafta"}</option>
                <option value="1 ay">{"1 ay"}</option>
                <option value="3 ay">{"3 ay"}</option>
                <option value="6 ay">{"6 ay"}</option>
                <option value="1 y\u0131l+">{"1 y\u0131l+"}</option>
              </select>
            </div>

            {/* Mevcut Mevsim */}
            <div>
              <label style={s.label}>{"Mevcut Mevsim"}</label>
              <select style={s.select} value={form.mevsim} onChange={e => set('mevsim', e.target.value)}>
                <option value="">{"Se\u00e7iniz..."}</option>
                <option value="\u0130lkbahar">{"\u0130lkbahar"}</option>
                <option value="Yaz">{"Yaz"}</option>
                <option value="Sonbahar">{"Sonbahar"}</option>
                <option value="K\u0131\u015f">{"K\u0131\u015f"}</option>
              </select>
            </div>

            {/* Hamilelik/Emzirme */}
            <div>
              <label style={s.label}>{"Hamilelik / Emzirme"}</label>
              <select style={s.select} value={form.hamilelik} onChange={e => set('hamilelik', e.target.value)}>
                <option value="Yok">{"Yok"}</option>
                <option value="Hamile">{"Hamile"}</option>
                <option value="Emziren">{"Emziren"}</option>
              </select>
            </div>
          </div>

          {/* Tetikleyici Faktörler */}
          <div style={s.sectionTitle}>
            <span>{"TET\u0130KLEY\u0130C\u0130 FAKT\u00d6RLER"}</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 8, marginBottom: 16 }}>
            {['Stres', 'Beslenme', 'G\u00fcne\u015f', 'Hormon', 'Uyku'].map(t => {
              const aktif = form.tetikleyiciler.includes(t)
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleTetikleyici(t)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 20,
                    border: `1.5px solid ${aktif ? C.primary : C.border}`,
                    background: aktif ? C.primary : C.white,
                    color: aktif ? C.white : C.secondary,
                    fontSize: 13,
                    cursor: 'pointer',
                    fontFamily: garamond.style.fontFamily,
                  }}
                >
                  {t}
                </button>
              )
            })}
          </div>

          {/* TIP 2 */}
          <div style={s.tip}>
            {"er-R\u00e2z\u00ee el-H\u00e2v\u00ee: Cilt hastal\u0131klar\u0131nda tetikleyici fakt\u00f6rlerin tespiti, do\u011fru tedavinin yar\u0131s\u0131d\u0131r."}
          </div>

          {/* Ek Açıklama */}
          <div style={{ marginTop: 8 }}>
            <label style={s.label}>{"Ek A\u00e7\u0131klama"}</label>
            <textarea
              style={s.textarea}
              value={form.ek_aciklama}
              onChange={e => set('ek_aciklama', e.target.value)}
              placeholder={"Cilt sorununuz hakk\u0131nda ek bilgi..."}
            />
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <button
          onClick={handleSubmit}
          style={{
            width: '100%',
            padding: 16,
            background: C.primary,
            border: 'none',
            borderRadius: 12,
            cursor: 'pointer',
            fontFamily: cinzel.style.fontFamily,
            fontSize: 14,
            fontWeight: 600,
            color: C.white,
            letterSpacing: 2,
            marginBottom: 32,
          }}
        >
          {"Cilt Analizini Ba\u015flat"}
        </button>
      </div>
    </div>
  )
}
