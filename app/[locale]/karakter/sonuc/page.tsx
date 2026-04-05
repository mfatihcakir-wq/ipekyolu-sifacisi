'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Cinzel, EB_Garamond } from 'next/font/google'
import Header from '../../components/Header'
import Footer from '../../components/Footer'

const cinzel = Cinzel({ subsets: ['latin', 'latin-ext'], weight: ['400', '500', '600'] })
const garamond = EB_Garamond({ subsets: ['latin', 'latin-ext'], weight: ['400', '500'], style: ['normal', 'italic'] })

const C = { primary: '#1B4332', gold: '#8B6914', cream: '#FAF7F2', dark: '#1C1C1C', secondary: '#6B5744', border: '#E8DFD4', white: '#FFFFFF', surface: '#FAF7F2' }
const CR: Record<string, string> = { dunya: '#378ADD', heva: '#EF9F27', nefs: '#E24B4A', seytan: '#7F77DD' }
const CN: Record<string, string> = { dunya: 'Dunya', heva: 'Heva', nefs: 'Nefs', seytan: 'Seytan' }
const CY: Record<string, string> = { dunya: 'Onden', heva: 'Sagdan', nefs: 'Soldan', seytan: 'Enseden' }

export default function KarakterSonucPage() {
  const router = useRouter()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [s, setS] = useState<any>(null)
  const [akd, setAkd] = useState(false)

  useEffect(() => {
    const d = localStorage.getItem('ipekyolu_karakter_sonuc')
    if (!d) { router.push('/karakter'); return }
    try { setS(JSON.parse(d)) } catch { router.push('/karakter') }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!s) return <div style={{ background: C.cream, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: cinzel.style.fontFamily, color: C.primary }}>{"Yukleniyor..."}</div>

  // Kriz
  if (s.kriz_tespit) return (
    <div style={{ background: C.cream, minHeight: '100vh', fontFamily: garamond.style.fontFamily }}>
      <Header />
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '60px 20px' }}>
        <div style={{ background: '#FFF8E7', border: `2px solid ${C.gold}`, borderRadius: 16, padding: '40px 32px', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>{'\u26A0\uFE0F'}</div>
          <h1 style={{ fontFamily: cinzel.style.fontFamily, fontSize: 22, color: C.primary, marginBottom: 12 }}>{"Lutfen Bir Uzmana Basvurun"}</h1>
          <p style={{ fontSize: 15, color: C.secondary, lineHeight: 1.8, marginBottom: 24 }}>{s.kriz_mesaji || 'Paylastiginiz bilgiler profesyonel destek gerektiriyor.'}</p>
          <a href="https://wa.me/905331687226" target="_blank" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#25D366', color: 'white', borderRadius: 10, padding: '14px 28px', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>{"WhatsApp ile Ulasin"}</a>
        </div>
      </div>
      <Footer />
    </div>
  )

  const bc = s.baskin_cephe || 'heva'
  const sk = s.cephe_skorlari || s.cephe_yuzde || {}
  const oz = s.ozet || {}
  const sb = s.sebep_analizi || {}
  const rc = s.receteler || {}
  const hk = s.hikmetli_soz || {}
  const sa = s.sonraki_adim || {}

  return (
    <div style={{ background: C.cream, minHeight: '100vh', fontFamily: garamond.style.fontFamily }}>
      <Header />
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 20px 60px' }}>

        {/* 1. OZET KARTI */}
        <div style={{ background: C.primary, borderRadius: 16, padding: '28px 32px', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' as const, gap: 12 }}>
            <div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: 2 }}>{"BASKIN CEPHE"}</div>
              <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 32, color: C.gold, marginTop: 4 }}>{CN[bc] || bc}</div>
              {s.baskin_cephe_ar && <div style={{ fontSize: 18, color: C.gold, fontFamily: 'serif', direction: 'rtl' as const, opacity: 0.7 }}>{s.baskin_cephe_ar}</div>}
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 8 }}>
                {s.ikincil_cephe && `Ikincil: ${CN[s.ikincil_cephe] || s.ikincil_cephe}`}
                {s.aktif_askerler && ` \u00b7 ${Array.isArray(s.aktif_askerler) ? s.aktif_askerler.length : 0} aktif asker`}
              </div>
            </div>
            <button onClick={() => setAkd(!akd)} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 6, padding: '6px 14px', color: akd ? C.gold : 'rgba(255,255,255,0.6)', fontSize: 11, cursor: 'pointer' }}>
              {akd ? 'Sade gorunum' : 'Akademik gorunum'}
            </button>
          </div>
          <div style={{ marginTop: 20 }}>
            {['dunya', 'heva', 'nefs', 'seytan'].map(k => {
              const v = sk[k] || 0
              return (
                <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', width: 55, textAlign: 'right' as const }}>{CN[k]}</span>
                  <div style={{ flex: 1, height: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 4 }}>
                    <div style={{ height: 8, background: CR[k], borderRadius: 4, width: `${v}%`, transition: 'width 0.5s' }} />
                  </div>
                  <span style={{ fontSize: 12, color: CR[k], fontWeight: 600, width: 35 }}>{v}%</span>
                </div>
              )
            })}
          </div>
          {s.mizac_cephe_kesisim && <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 8, padding: '10px 14px', marginTop: 12, fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>{s.mizac_cephe_kesisim}</div>}
        </div>

        {/* 2. AKTIF ASKERLER */}
        {s.aktif_askerler?.length > 0 && (
          <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: '20px 24px', marginBottom: 16 }}>
            <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 11, color: C.gold, letterSpacing: 2, marginBottom: 12 }}>{"AKTIF ASKERLER"}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 8 }}>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {s.aktif_askerler.map((a: any, i: number) => {
                const ad = typeof a === 'string' ? a : a.ad || a
                const ar = typeof a === 'object' ? a.ad_ar : null
                const cid = typeof a === 'object' ? a.cephe_id : null
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 20, background: '#FFF8E7', border: `1px solid ${C.gold}` }}>
                    {cid && <span style={{ width: 6, height: 6, borderRadius: '50%', background: CR[cid] || C.gold }} />}
                    <span style={{ fontSize: 12, color: C.dark }}>{ad}</span>
                    {ar && <span style={{ fontSize: 11, color: C.gold }}>{ar}</span>}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* 3. DERINLEMESINE ANALIZ */}
        {(oz.sade || oz.akademik) && (
          <div style={{ background: C.surface, borderRadius: 14, border: `1px solid ${C.border}`, padding: '24px 28px', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <span style={{ fontSize: 18 }}>{'\u2694\uFE0F'}</span>
              <span style={{ fontFamily: cinzel.style.fontFamily, fontSize: 14, color: C.primary }}>{"Baskin Cephe \u2014 "}{CY[bc] || ''}{"den Gelen Kusatma"}</span>
            </div>
            <p style={{ fontSize: 15, color: C.dark, lineHeight: 1.85 }}>{akd && oz.akademik ? oz.akademik : oz.sade}</p>
            {oz.kaynak && <div style={{ fontSize: 11, color: C.gold, marginTop: 10 }}>{oz.kaynak}</div>}
          </div>
        )}

        {/* 4. SEBEP ANALIZI */}
        {(sb.badi || sb.badi_sebep || sb.muid || sb.muid_sebepler) && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: '18px 20px' }}>
              <div style={{ fontSize: 10, color: '#C62828', fontWeight: 600, letterSpacing: 1, marginBottom: 8 }}>{"BADI SEBEP \u2014 YAKIN"}</div>
              <p style={{ fontSize: 13, color: C.dark, lineHeight: 1.7 }}>
                {akd && (sb.badi?.akademik) ? sb.badi.akademik : (sb.badi?.sade || sb.badi?.baslik || sb.badi_sebep || '')}
              </p>
            </div>
            <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: '18px 20px' }}>
              <div style={{ fontSize: 10, color: '#1565C0', fontWeight: 600, letterSpacing: 1, marginBottom: 8 }}>{"MUID SEBEPLER \u2014 UZAK"}</div>
              {sb.muid?.sade ? (
                <p style={{ fontSize: 13, color: C.dark, lineHeight: 1.7 }}>{akd && sb.muid.akademik ? sb.muid.akademik : sb.muid.sade}</p>
              ) : (
                (sb.muid_sebepler || []).map((m: string, i: number) => (
                  <div key={i} style={{ fontSize: 12, color: C.dark, padding: '2px 0' }}>{'\u2192'} {m}</div>
                ))
              )}
            </div>
          </div>
        )}

        {/* 5. RUHSAL RECETE */}
        {rc.ruhsal && (
          <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: '24px 28px', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 12, color: C.gold, letterSpacing: 2 }}>{"RUHSAL RECETE"}</div>
              {rc.ruhsal.erdem_ordusu && <span style={{ background: C.primary, color: C.gold, padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{rc.ruhsal.erdem_ordusu}</span>}
            </div>

            {/* Pratik program */}
            {rc.ruhsal.pratik_program?.map((p: { zaman: string, eylem: string, kaynak?: string }, i: number) => (
              <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: `1px solid ${C.border}` }}>
                <span style={{ fontSize: 11, color: C.gold, fontWeight: 600, minWidth: 50 }}>{p.zaman}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: C.dark }}>{p.eylem}</div>
                  {p.kaynak && <div style={{ fontSize: 10, color: '#999', fontStyle: 'italic', marginTop: 2 }}>{p.kaynak}</div>}
                </div>
              </div>
            ))}

            {/* Vird */}
            {rc.ruhsal.vird_zikir?.map((v: { arapca?: string, okunus?: string, tercume?: string, zikir?: string, adet: string, amac?: string }, i: number) => (
              <div key={i} style={{ borderRadius: 12, overflow: 'hidden', marginTop: 12, border: `1px solid ${C.border}` }}>
                {(v.arapca || v.zikir) && (
                  <div style={{ background: C.primary, padding: '16px 20px' }}>
                    <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 22, color: C.gold, direction: 'rtl' as const, lineHeight: 1.9, textAlign: 'center' as const }}>{v.arapca || v.zikir}</div>
                    {v.okunus && <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', textAlign: 'right' as const, marginTop: 4 }}>{v.okunus}</div>}
                  </div>
                )}
                <div style={{ background: C.surface, padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 14, color: C.dark, lineHeight: 1.6, flex: 1 }}>{v.tercume || v.zikir || ''}</div>
                  <div style={{ textAlign: 'right' as const, flexShrink: 0, marginLeft: 12 }}>
                    <span style={{ background: C.primary, color: C.gold, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{v.adet}x</span>
                    {v.amac && <div style={{ fontSize: 11, color: C.gold, marginTop: 4 }}>{v.amac}</div>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 6. BITKISEL */}
        {rc.bitkisel?.aktif && rc.bitkisel.bitkiler?.length > 0 && (
          <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: '24px 28px', marginBottom: 16 }}>
            <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 11, color: C.gold, letterSpacing: 2, marginBottom: 14 }}>{"BITKISEL DESTEK"}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {rc.bitkisel.bitkiler.map((b: { ad_tr: string, ad_ar?: string, etki: string, kaynak?: string }, i: number) => (
                <div key={i} style={{ background: C.surface, borderRadius: 10, padding: '14px 16px' }}>
                  <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 14, color: C.primary }}>{'\uD83C\uDF3F'} {b.ad_tr}</div>
                  {b.ad_ar && <div style={{ fontSize: 13, color: C.gold, fontFamily: 'serif', direction: 'rtl' as const }}>{b.ad_ar}</div>}
                  <div style={{ fontSize: 12, color: C.secondary, marginTop: 6, lineHeight: 1.6 }}>{b.etki}</div>
                  {b.kaynak && <div style={{ fontSize: 10, color: '#999', fontStyle: 'italic', marginTop: 4 }}>{b.kaynak}</div>}
                </div>
              ))}
            </div>
            <div style={{ background: '#FFF8E7', border: `1px solid ${C.gold}`, borderRadius: 8, padding: '10px 14px', fontSize: 11, color: C.secondary, marginTop: 10 }}>
              {"Bu oneriler klasik tip kaynaklarina dayanmaktadir. Hekiminize danisin."}
            </div>
          </div>
        )}

        {/* 7. BESLENME */}
        {rc.beslenme?.aktif && (
          <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: '24px 28px', marginBottom: 16 }}>
            <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 11, color: C.gold, letterSpacing: 2, marginBottom: 14 }}>{"BESLENME"}</div>
            {rc.beslenme.ilke && (
              <div style={{ borderLeft: `3px solid ${C.gold}`, paddingLeft: 14, marginBottom: 14 }}>
                <p style={{ fontFamily: cinzel.style.fontFamily, fontSize: 14, color: C.primary, fontStyle: 'italic', lineHeight: 1.6 }}>{rc.beslenme.ilke}</p>
                {rc.beslenme.ilke_kaynak && <div style={{ fontSize: 10, color: C.gold, marginTop: 4 }}>{rc.beslenme.ilke_kaynak}</div>}
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {rc.beslenme.onerililer?.length > 0 && (
                <div style={{ background: '#F0FDF4', borderRadius: 8, padding: '12px' }}>
                  <div style={{ fontSize: 10, color: '#1B5E20', fontWeight: 600, marginBottom: 6 }}>{"ONERILEN"}</div>
                  {rc.beslenme.onerililer.map((g: { gida: string, neden?: string }, i: number) => (
                    <div key={i} style={{ fontSize: 12, color: C.dark, padding: '2px 0' }}>{'\u2713'} {g.gida}{g.neden ? ` \u2014 ${g.neden}` : ''}</div>
                  ))}
                </div>
              )}
              {rc.beslenme.kacinilacaklar?.length > 0 && (
                <div style={{ background: '#FFF3E0', borderRadius: 8, padding: '12px' }}>
                  <div style={{ fontSize: 10, color: '#E65100', fontWeight: 600, marginBottom: 6 }}>{"KACINILACAK"}</div>
                  {rc.beslenme.kacinilacaklar.map((g: { gida: string, neden?: string }, i: number) => (
                    <div key={i} style={{ fontSize: 12, color: C.dark, padding: '2px 0' }}>{'\u2717'} {g.gida}{g.neden ? ` \u2014 ${g.neden}` : ''}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 8. HIKMETLI SOZ */}
        {(hk.metin_ar || hk.metin_tr || hk.metin) && (
          <div style={{ background: C.primary, borderRadius: 14, padding: '24px 28px', marginBottom: 16, textAlign: 'center' as const }}>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', letterSpacing: 2, marginBottom: 12 }}>{"HIKMET"}</div>
            {hk.metin_ar && <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 22, color: C.gold, direction: 'rtl' as const, lineHeight: 1.9, marginBottom: 10 }}>{hk.metin_ar}</div>}
            {(hk.metin_tr || hk.metin) && <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 16, color: 'rgba(255,255,255,0.7)', fontStyle: 'italic', marginBottom: 8 }}>{hk.metin_tr || hk.metin}</div>}
            {hk.kaynak && <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>{'\u2014'} {hk.kaynak}</div>}
          </div>
        )}

        {/* 9. SONRAKI ADIM */}
        {(sa.sure || sa.odak) && (
          <div style={{ background: '#E3F2FD', borderRadius: 12, padding: '16px 20px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' as const }}>
            {sa.sure && <span style={{ background: '#1565C0', color: 'white', padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600, flexShrink: 0 }}>{sa.sure}</span>}
            <div style={{ flex: 1 }}>
              {sa.odak && <div style={{ fontSize: 13, color: C.dark }}>{sa.odak}</div>}
              {sa.not && <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>{sa.not}</div>}
            </div>
          </div>
        )}

        {/* 10. BUTONLAR */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
          <button onClick={() => window.print()} style={{ padding: '14px 10px', border: `1.5px solid ${C.border}`, borderRadius: 10, background: C.white, color: C.secondary, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: cinzel.style.fontFamily }}>
            {"PDF Indir"}
          </button>
          <a href="https://wa.me/905331687226?text=Karakter%20analizi%20sonucum%20hakkinda%20gorusmek%20istiyorum" target="_blank" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.primary, color: C.gold, borderRadius: 10, padding: '14px 10px', fontSize: 12, fontWeight: 600, textDecoration: 'none', fontFamily: cinzel.style.fontFamily }}>
            {"WhatsApp"}
          </a>
          <button onClick={() => router.push('/karakter')} style={{ padding: '14px 10px', border: `1.5px solid ${C.gold}`, borderRadius: 10, background: C.white, color: C.primary, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: cinzel.style.fontFamily }}>
            {"Yeni Analiz"}
          </button>
        </div>

        {/* 11. YASAL NOT */}
        <div style={{ background: '#FFF8E7', border: `1px solid ${C.gold}`, borderRadius: 10, padding: '12px 16px', fontSize: 11, color: C.secondary, lineHeight: 1.6, textAlign: 'center' as const }}>
          {s.yasal_not || 'Bu rapor klasik Islam dusuncesi cercevesinde hazirlanmis bir oz-degerlendirme aracidir. Tibbi veya psikolojik tedavinin yerini tutmaz.'}
        </div>

      </div>
      <Footer />
      <style>{`@media(max-width:768px){[style*="grid-template-columns: 1fr 1fr"],[style*="grid-template-columns: 1fr 1fr 1fr"]{grid-template-columns:1fr !important}}`}</style>
    </div>
  )
}
