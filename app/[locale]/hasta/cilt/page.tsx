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
  input: { width: '100%', padding: '9px 12px', background: C.surface, border: `1.5px solid ${C.border}`, borderRadius: 8, fontSize: 16, minHeight: 44, color: C.dark, fontFamily: 'inherit', boxSizing: 'border-box' as const } as React.CSSProperties,
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
    hasta_adi: '',
    email: '',
    crp: '',
    bilirubin: '',
    vit_d: '',
    hemoglobin: '',
  })

  const [yukleniyor, setYukleniyor] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [sonuc, setSonuc] = useState<any>(null)
  const [hata, setHata] = useState('')

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

  const handleSubmit = async () => {
    if (!form.cilt_tipi || !form.ana_sorun || !form.yas_grubu) {
      alert('Cilt tipi, ana sorun ve ya\u015f grubu zorunludur.')
      return
    }

    setYukleniyor(true)
    setHata('')
    setSonuc(null)

    const now = new Date()
    const yy = String(now.getFullYear()).slice(2)
    const mm = String(now.getMonth() + 1).padStart(2, '0')
    const dd = String(now.getDate()).padStart(2, '0')
    const hh = String(now.getHours()).padStart(2, '0')
    const min = String(now.getMinutes()).padStart(2, '0')
    const kayit_no = `CYS-${yy}${mm}${dd}-${hh}${min}`

    try {
      const res = await fetch('/api/cilt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, kayit_no }),
      })

      const data = await res.json()

      if (!res.ok && !data.sorun_ozeti) {
        setHata(data.error || 'Analiz sirasinda bir hata olustu.')
      } else {
        setSonuc({ ...data, kayit_no })
      }
    } catch {
      setHata('Sunucuya baglanilamadi. Lutfen tekrar deneyin.')
    } finally {
      setYukleniyor(false)
    }
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

        {/* SONUC GORUNTULEME */}
        {sonuc && !yukleniyor && (
          <div style={{ marginBottom: 32 }}>
            {/* Kayit No */}
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 10, color: C.secondary, letterSpacing: 2, textTransform: 'uppercase' }}>{"Kay\u0131t Numaras\u0131"}</div>
              <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 18, color: C.primary, fontWeight: 600, letterSpacing: 2, marginTop: 4 }}>{sonuc.kayit_no}</div>
            </div>

            {/* Teshis */}
            {sonuc.sorun_ozeti && (
              <div style={s.card}>
                <div style={s.sectionTitle}><span>{"TE\u015eH\u0130S"}</span></div>
                <p style={{ fontSize: 15, color: C.dark, lineHeight: 1.7, margin: 0 }}>{sonuc.sorun_ozeti}</p>
                {sonuc.hilt_baglantisi && (
                  <div style={{ ...s.tip, marginTop: 12, marginBottom: 0 }}>
                    <strong>{"Mizac Ba\u011flant\u0131s\u0131:"}</strong> {sonuc.hilt_baglantisi}
                  </div>
                )}
                {sonuc.mizac_tipi && (
                  <div style={{ display: 'inline-block', background: C.primary, color: C.cream, fontSize: 11, padding: '4px 14px', borderRadius: 12, marginTop: 10 }}>{sonuc.mizac_tipi}</div>
                )}
              </div>
            )}

            {/* Hikmetli Soz */}
            {sonuc.hikmetli_soz && (
              <div style={{ background: C.primary, borderRadius: 12, padding: 20, textAlign: 'center', marginBottom: 16 }}>
                {sonuc.hikmetli_soz.metin_ar && (
                  <div style={{ fontSize: 20, color: C.gold, marginBottom: 8, direction: 'rtl' as const, fontFamily: 'serif' }}>{sonuc.hikmetli_soz.metin_ar}</div>
                )}
                <div style={{ fontSize: 14, color: C.cream, fontStyle: 'italic', marginBottom: 6 }}>{sonuc.hikmetli_soz.metin}</div>
                {sonuc.hikmetli_soz.kaynak && (
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{"\u2014 "}{sonuc.hikmetli_soz.kaynak}</div>
                )}
              </div>
            )}

            {/* Urunler */}
            {sonuc.urunler && sonuc.urunler.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={s.sectionTitle}><span>{"\u00dcR\u00dcNLER"}</span></div>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {sonuc.urunler.map((u: any, i: number) => (
                  <div key={i} style={{ ...s.card, marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div style={{ fontSize: 16, fontWeight: 600, color: C.primary }}>{u.isim}</div>
                      <div style={{ fontSize: 10, color: C.gold, textTransform: 'uppercase', letterSpacing: 1, background: '#FFF8E7', padding: '3px 10px', borderRadius: 10, flexShrink: 0 }}>{u.tur}</div>
                    </div>
                    <div style={{ fontSize: 13, color: C.dark, marginBottom: 6 }}>
                      <strong>{"Bile\u015fenler: "}</strong>{(u.bilesenler || []).join(', ')}
                    </div>
                    <div style={{ fontSize: 13, color: C.dark, marginBottom: 6 }}>
                      <strong>{"Haz\u0131rlan\u0131\u015f: "}</strong>{u.hazirlanis}
                    </div>
                    <div style={{ fontSize: 13, color: C.dark, marginBottom: 4 }}>
                      <strong>{"Uygulama: "}</strong>{u.uygulama}
                    </div>
                    {u.sure && <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>{"S\u00fcre: "}{u.sure}</div>}
                    {u.kaynak && <div style={{ fontSize: 11, color: '#aaa', fontStyle: 'italic', marginTop: 4 }}>{"Kaynak: "}{u.kaynak}</div>}
                  </div>
                ))}
              </div>
            )}

            {/* Gunluk Rutin */}
            {sonuc.gunluk_rutin && (
              <div style={s.card}>
                <div style={s.sectionTitle}><span>{"G\u00dcNL\u00dcK RUT\u0130N"}</span></div>
                {sonuc.gunluk_rutin.sabah && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.primary, marginBottom: 6 }}>{"Sabah"}</div>
                    {sonuc.gunluk_rutin.sabah.map((a: string, i: number) => (
                      <div key={i} style={{ fontSize: 13, color: C.dark, padding: '3px 0', paddingLeft: 12, borderLeft: `2px solid ${C.gold}`, marginBottom: 4 }}>{a}</div>
                    ))}
                  </div>
                )}
                {sonuc.gunluk_rutin.aksam && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.primary, marginBottom: 6 }}>{"Ak\u015fam"}</div>
                    {sonuc.gunluk_rutin.aksam.map((a: string, i: number) => (
                      <div key={i} style={{ fontSize: 13, color: C.dark, padding: '3px 0', paddingLeft: 12, borderLeft: `2px solid ${C.primary}`, marginBottom: 4 }}>{a}</div>
                    ))}
                  </div>
                )}
                {sonuc.gunluk_rutin.haftalik && (
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.gold, marginBottom: 6 }}>{"Haftal\u0131k \u00d6zel Bak\u0131m"}</div>
                    {sonuc.gunluk_rutin.haftalik.map((a: string, i: number) => (
                      <div key={i} style={{ fontSize: 13, color: C.dark, padding: '3px 0', paddingLeft: 12, borderLeft: `2px solid ${C.border}`, marginBottom: 4 }}>{a}</div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Beslenme */}
            {sonuc.beslenme && (
              <div style={s.card}>
                <div style={s.sectionTitle}><span>{"BESLENME \u00d6NER\u0130LER\u0130"}</span></div>
                {sonuc.beslenme.ilke && (
                  <div style={{ ...s.tip, marginBottom: 12 }}>{sonuc.beslenme.ilke}</div>
                )}
                {sonuc.beslenme.onerililer && sonuc.beslenme.onerililer.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.primary, marginBottom: 6 }}>{"Onerilen G\u0131dalar"}</div>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {sonuc.beslenme.onerililer.map((g: any, i: number) => (
                      <div key={i} style={{ fontSize: 13, color: C.dark, padding: '3px 0' }}>
                        <span style={{ color: C.primary, fontWeight: 600 }}>{"\u2713 "}{g.gida}</span>{" \u2014 "}{g.neden}
                      </div>
                    ))}
                  </div>
                )}
                {sonuc.beslenme.kacinilacaklar && sonuc.beslenme.kacinilacaklar.length > 0 && (
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#8B0000', marginBottom: 6 }}>{"Ka\u00e7\u0131n\u0131lacaklar"}</div>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {sonuc.beslenme.kacinilacaklar.map((g: any, i: number) => (
                      <div key={i} style={{ fontSize: 13, color: C.dark, padding: '3px 0' }}>
                        <span style={{ color: '#8B0000', fontWeight: 600 }}>{"\u2717 "}{g.gida}</span>{" \u2014 "}{g.neden}
                      </div>
                    ))}
                  </div>
                )}
                {sonuc.beslenme.su_tavsiyesi && (
                  <div style={{ fontSize: 13, color: C.dark, marginTop: 8 }}>{"Su: "}{sonuc.beslenme.su_tavsiyesi}</div>
                )}
              </div>
            )}

            {/* Ozel Notlar */}
            {sonuc.ozel_notlar && sonuc.ozel_notlar.length > 0 && (
              <div style={{ ...s.card, background: C.surface }}>
                <div style={s.sectionTitle}><span>{"\u00d6ZEL NOTLAR"}</span></div>
                {sonuc.ozel_notlar.map((n: string, i: number) => (
                  <div key={i} style={{ fontSize: 13, color: C.dark, padding: '3px 0' }}>{"- "}{n}</div>
                ))}
              </div>
            )}

            {/* Tekrar Analiz */}
            <button
              onClick={() => { setSonuc(null); setHata(''); }}
              style={{
                width: '100%', padding: 14, background: 'transparent',
                border: `2px solid ${C.primary}`, borderRadius: 12, cursor: 'pointer',
                fontFamily: cinzel.style.fontFamily, fontSize: 13, fontWeight: 600,
                color: C.primary, letterSpacing: 2, marginBottom: 16,
              }}
            >
              {"Yeni Analiz Yap"}
            </button>
          </div>
        )}

        {/* FORM (sonuc yokken goster) */}
        {!sonuc && (
          <>
            {/* TIP */}
            <div style={s.tip}>
              {"\u0130bn S\u00een\u00e2 el-K\u00e2n\u00fbn: Cilt mizac\u0131n d\u0131\u015f aynas\u0131d\u0131r. Kuru cilt sevd\u00e2v\u00ee, ya\u011fl\u0131 cilt demev\u00ee i\u015faret eder."}
            </div>

            {/* HASTA BILGILERI */}
            <div style={s.card}>
              <div style={s.sectionTitle}>
                <span>{"HASTA B\u0130LG\u0130LER\u0130"}</span>
              </div>
              <div style={s.grid2}>
                <div>
                  <label style={s.label}>{"Ad Soyad"}</label>
                  <input
                    style={s.input}
                    type="text"
                    value={form.hasta_adi}
                    onChange={e => set('hasta_adi', e.target.value)}
                    placeholder={"Ad\u0131n\u0131z..."}
                  />
                </div>
                <div>
                  <label style={s.label}>{"E-posta (iste\u011fe ba\u011fl\u0131)"}</label>
                  <input
                    style={s.input}
                    type="email"
                    value={form.email}
                    onChange={e => set('email', e.target.value)}
                    placeholder={"ornek@mail.com"}
                  />
                </div>
              </div>
            </div>

            {/* CILT BILGILERI */}
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

                {/* Yas Grubu */}
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
                    <option value="K\u0131r\u0131\u015f\u0131kl\u0131k">{"K\u0131r\u0131\u015f\u0131kl\u0131k"}</option>
                    <option value="G\u00f6z Alt\u0131">{"G\u00f6z Alt\u0131"}</option>
                    <option value="Hassasiyet">{"Hassasiyet"}</option>
                    <option value="Solgunluk">{"Solgunluk"}</option>
                    <option value="G\u00f6zenek">{"Geni\u015f G\u00f6zenek"}</option>
                    <option value="Di\u011fer">{"Di\u011fer"}</option>
                  </select>
                </div>

                {/* Ne Kadar Suredir */}
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

              {/* Tetikleyici Faktorler */}
              <div style={s.sectionTitle}>
                <span>{"TET\u0130KLEY\u0130C\u0130 FAKT\u00d6RLER"}</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 8, marginBottom: 16 }}>
                {['Stres', 'Beslenme', 'G\u00fcne\u015f', 'Hormon', 'Uyku', 'Kimyasal', 'Allerji', 'Hava Kirlili\u011fi'].map(t => {
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

              {/* Ek Aciklama */}
              <div style={{ marginTop: 8 }}>
                <label style={s.label}>{"Ek A\u00e7\u0131klama"}</label>
                <textarea
                  style={s.textarea}
                  value={form.ek_aciklama}
                  onChange={e => set('ek_aciklama', e.target.value)}
                  placeholder={"Cilt sorununuz hakk\u0131nda ek bilgi, kulland\u0131\u011f\u0131n\u0131z ila\u00e7lar..."}
                />
              </div>
            </div>

            {/* LAB DEGERLERI */}
            <div style={s.card}>
              <div style={s.sectionTitle}>
                <span>{"LAB DE\u011eERLER\u0130 (\u0130ste\u011fe Ba\u011fl\u0131)"}</span>
              </div>
              <div style={{ ...s.tip, marginBottom: 14 }}>
                {"Lab de\u011ferleri girilirse, cilt sorunlar\u0131n\u0131n i\u00e7 kaynaklara ba\u011flant\u0131s\u0131 daha iyi analiz edilir."}
              </div>
              <div style={s.grid2}>
                <div>
                  <label style={s.label}>{"CRP (mg/L)"}</label>
                  <input
                    style={s.input}
                    type="number"
                    step="0.1"
                    value={form.crp}
                    onChange={e => set('crp', e.target.value)}
                    placeholder={"0.0"}
                  />
                </div>
                <div>
                  <label style={s.label}>{"Bilirubin (mg/dL)"}</label>
                  <input
                    style={s.input}
                    type="number"
                    step="0.1"
                    value={form.bilirubin}
                    onChange={e => set('bilirubin', e.target.value)}
                    placeholder={"0.0"}
                  />
                </div>
                <div>
                  <label style={s.label}>{"D Vitamini (ng/mL)"}</label>
                  <input
                    style={s.input}
                    type="number"
                    step="0.1"
                    value={form.vit_d}
                    onChange={e => set('vit_d', e.target.value)}
                    placeholder={"0.0"}
                  />
                </div>
                <div>
                  <label style={s.label}>{"Hemoglobin (g/dL)"}</label>
                  <input
                    style={s.input}
                    type="number"
                    step="0.1"
                    value={form.hemoglobin}
                    onChange={e => set('hemoglobin', e.target.value)}
                    placeholder={"0.0"}
                  />
                </div>
              </div>
            </div>

            {/* HATA */}
            {hata && (
              <div style={{ background: '#FFF0F0', border: '1px solid #FFD0D0', borderRadius: 10, padding: 14, marginBottom: 16, fontSize: 13, color: '#8B0000' }}>
                {hata}
              </div>
            )}

            {/* SUBMIT BUTTON */}
            <button
              onClick={handleSubmit}
              disabled={yukleniyor}
              style={{
                width: '100%',
                padding: 16,
                background: yukleniyor ? '#7A8F84' : C.primary,
                border: 'none',
                borderRadius: 12,
                cursor: yukleniyor ? 'not-allowed' : 'pointer',
                fontFamily: cinzel.style.fontFamily,
                fontSize: 14,
                fontWeight: 600,
                color: C.white,
                letterSpacing: 2,
                marginBottom: 32,
                opacity: yukleniyor ? 0.8 : 1,
              }}
            >
              {yukleniyor ? "Analiz Ediliyor..." : "Cilt Analizini Ba\u015flat"}
            </button>

            {/* Yukleniyor Durumu */}
            {yukleniyor && (
              <div style={{ textAlign: 'center', marginBottom: 32 }}>
                <div style={{ fontSize: 32, marginBottom: 12, animation: 'pulse 2s infinite' }}>{"🌿"}</div>
                <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 13, color: C.primary, letterSpacing: 2, marginBottom: 8 }}>
                  {"ANAL\u0130Z EDILIYOR"}
                </div>
                <div style={{ fontSize: 12, color: C.secondary, lineHeight: 1.6 }}>
                  {"Klasik kaynaklar taranarak ki\u015fiye \u00f6zel cilt bak\u0131m protokol\u00fc haz\u0131rlan\u0131yor..."}
                </div>
                <div style={{ fontSize: 11, color: '#999', marginTop: 8 }}>
                  {"Bu i\u015flem 15-30 saniye s\u00fcrebilir."}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
