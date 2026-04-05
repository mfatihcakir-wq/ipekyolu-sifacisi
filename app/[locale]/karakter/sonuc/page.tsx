'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Cinzel, EB_Garamond } from 'next/font/google'
import Header from '../../components/Header'
import Footer from '../../components/Footer'

const cinzel = Cinzel({ subsets: ['latin', 'latin-ext'], weight: ['400', '500', '600'] })
const garamond = EB_Garamond({ subsets: ['latin', 'latin-ext'], weight: ['400', '500'], style: ['normal', 'italic'] })

const C = {
  primary: '#1B4332', gold: '#C9A84C', cream: '#F5EFE6',
  dark: '#1C1C1C', secondary: '#5C4A2A', border: '#E0D5C5',
  white: '#FFFFFF', surface: '#FAF7F2',
}

const CEPHE_RENK: Record<string, string> = {
  dunya: '#2563EB', heva: '#F59E0B', nefs: '#DC2626', seytan: '#7C3AED',
}
const CEPHE_AD: Record<string, string> = {
  dunya: 'Dunya Cephesi', heva: 'Heva Cephesi', nefs: 'Nefs Cephesi', seytan: 'Seytan Cephesi',
}

export default function KarakterSonucPage() {
  const router = useRouter()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [sonuc, setSonuc] = useState<any>(null)
  const [skorlar, setSkorlar] = useState<Record<string, number>>({})
  const [detayliGorunum, setDetayliGorunum] = useState(false)
  const [seciliAsker, setSeciliAsker] = useState<string | null>(null)

  useEffect(() => {
    const s = localStorage.getItem('ipekyolu_karakter_sonuc')
    const sk = localStorage.getItem('ipekyolu_karakter_skorlar')
    if (!s) { router.push('/karakter'); return }
    setSonuc(JSON.parse(s))
    if (sk) setSkorlar(JSON.parse(sk))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!sonuc) {
    return (
      <div style={{ background: C.cream, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: cinzel.style.fontFamily, color: C.primary, letterSpacing: 2 }}>{"Yukleniyor..."}</div>
      </div>
    )
  }

  // Kriz durumu
  if (sonuc.kriz_tespit) {
    return (
      <div style={{ background: C.cream, minHeight: '100vh', fontFamily: garamond.style.fontFamily }}>
        <Header />
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '60px 20px' }}>
          <div style={{ background: '#FFF8E7', border: `2px solid ${C.gold}`, borderRadius: 16, padding: '40px 32px', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>{"\u26A0\uFE0F"}</div>
            <h1 style={{ fontFamily: cinzel.style.fontFamily, fontSize: 22, color: C.primary, marginBottom: 12 }}>{"Lutfen Bir Uzmana Basvurun"}</h1>
            <p style={{ fontSize: 15, color: C.secondary, lineHeight: 1.8, marginBottom: 24 }}>{sonuc.kriz_mesaji || 'Paylastiginiz bilgiler profesyonel destek gerektiriyor.'}</p>
            <a href="https://wa.me/905331687226" target="_blank"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#25D366', color: 'white', borderRadius: 10, padding: '14px 28px', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
              {"WhatsApp ile Ulasin"}
            </a>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const baskinCephe = sonuc.baskin_cephe || 'heva'
  const ikincilCephe = sonuc.ikincil_cephe || ''
  const cepheYuzde = sonuc.cephe_yuzde || sonuc.cephe_skorlari || skorlar || {}
  const ozet = sonuc.ozet || {}
  const receteler = sonuc.receteler || {}

  return (
    <div style={{ background: C.cream, minHeight: '100vh', fontFamily: garamond.style.fontFamily }}>
      <Header />

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 20px 60px' }}>

        {/* 1. OZET KARTI */}
        <div style={{ background: C.primary, borderRadius: 16, padding: '24px 28px', marginBottom: 20 }}>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: 2, marginBottom: 8 }}>{"BASKIN CEPHE"}</div>
          <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 24, color: C.gold, marginBottom: 4 }}>
            {CEPHE_AD[baskinCephe] || baskinCephe}
          </div>
          {ikincilCephe && (
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>{"Ikincil:"} {CEPHE_AD[ikincilCephe] || ikincilCephe}</div>
          )}

          {/* 4 cephe bar */}
          <div style={{ marginTop: 20 }}>
            {['dunya', 'heva', 'nefs', 'seytan'].map(key => {
              const val = cepheYuzde[key] || 0
              return (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', width: 50, textAlign: 'right' }}>{key}</span>
                  <div style={{ flex: 1, height: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 4 }}>
                    <div style={{ height: 8, background: CEPHE_RENK[key], borderRadius: 4, width: `${val}%`, transition: 'width 0.5s' }} />
                  </div>
                  <span style={{ fontSize: 12, color: CEPHE_RENK[key], fontWeight: 600, width: 35 }}>{val}%</span>
                </div>
              )
            })}
          </div>

          {/* Mizac kesisim */}
          {sonuc.mizac_cephe_kesisim && (
            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 8, padding: '10px 14px', marginTop: 12, fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
              {sonuc.mizac_cephe_kesisim}
            </div>
          )}

          {/* Toggle */}
          <button onClick={() => setDetayliGorunum(!detayliGorunum)}
            style={{ marginTop: 12, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 6, padding: '6px 14px', color: C.gold, fontSize: 11, cursor: 'pointer' }}>
            {detayliGorunum ? 'Sade Gorunum' : 'Detayli Gorunum'}
          </button>
        </div>

        {/* 2. AKTIF ASKERLER */}
        {sonuc.aktif_askerler?.length > 0 && (
          <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: '20px 24px', marginBottom: 16 }}>
            <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 11, color: C.gold, letterSpacing: 2, marginBottom: 12 }}>{"AKTIF ASKERLER"}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {sonuc.aktif_askerler.map((a: string) => (
                <button key={a} onClick={() => setSeciliAsker(seciliAsker === a ? null : a)}
                  style={{ padding: '5px 12px', borderRadius: 20, fontSize: 12, cursor: 'pointer', border: `1px solid ${C.gold}`, background: seciliAsker === a ? C.gold : '#FFF8E7', color: seciliAsker === a ? C.primary : C.secondary, fontWeight: 500 }}>
                  {a}
                </button>
              ))}
            </div>
            {seciliAsker && sonuc.aktif_askerler?.includes(seciliAsker) && (
              <div style={{ background: C.surface, borderRadius: 8, padding: '10px 14px', marginTop: 10, fontSize: 13, color: C.dark }}>
                {seciliAsker} askeri aktif durumda.
              </div>
            )}
          </div>
        )}

        {/* 3. OZET */}
        {ozet.sade && (
          <div style={{ background: C.surface, borderRadius: 12, padding: '16px 20px', marginBottom: 16, fontSize: 14, color: C.dark, lineHeight: 1.8 }}>
            {detayliGorunum && ozet.akademik ? ozet.akademik : ozet.sade}
          </div>
        )}

        {/* 4. SEBEP ANALIZI */}
        {sonuc.sebep_analizi && (
          <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: '20px 24px', marginBottom: 16 }}>
            <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 11, color: C.gold, letterSpacing: 2, marginBottom: 12 }}>{"SEBEP ANALIZI"}</div>
            {sonuc.sebep_analizi.badi_sebep && (
              <div style={{ marginBottom: 10 }}>
                <span style={{ fontSize: 10, color: '#C62828', fontWeight: 600 }}>{"YAKIN SEBEP: "}</span>
                <span style={{ fontSize: 13, color: C.dark }}>{sonuc.sebep_analizi.badi_sebep}</span>
              </div>
            )}
            {sonuc.sebep_analizi.muid_sebepler?.length > 0 && (
              <div>
                <div style={{ fontSize: 10, color: '#1565C0', fontWeight: 600, marginBottom: 4 }}>{"UZAK SEBEPLER:"}</div>
                {sonuc.sebep_analizi.muid_sebepler.map((m: string, i: number) => (
                  <div key={i} style={{ fontSize: 12, color: C.dark, padding: '2px 0' }}>{"\u2192"} {m}</div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 5. RUHSAL RECETE */}
        {receteler.ruhsal && (
          <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: '20px 24px', marginBottom: 16 }}>
            <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 11, color: C.gold, letterSpacing: 2, marginBottom: 12 }}>{"RUHSAL RECETE"}</div>
            {receteler.ruhsal.erdem_ordusu && (
              <div style={{ background: C.primary, borderRadius: 8, padding: '10px 14px', marginBottom: 12, fontSize: 13, color: C.gold }}>
                {"Erdem Ordusu:"} {receteler.ruhsal.erdem_ordusu}
              </div>
            )}
            {receteler.ruhsal.pratik_program?.map((p: { zaman: string, eylem: string, kaynak?: string }, i: number) => (
              <div key={i} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: `1px solid ${C.border}` }}>
                <span style={{ fontSize: 11, color: C.gold, fontWeight: 600, minWidth: 50 }}>{p.zaman}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: C.dark }}>{p.eylem}</div>
                  {p.kaynak && <div style={{ fontSize: 10, color: '#999', fontStyle: 'italic', marginTop: 2 }}>{p.kaynak}</div>}
                </div>
              </div>
            ))}
            {receteler.ruhsal.vird_zikir?.map((v: { adet: string, zikir: string, amac?: string }, i: number) => (
              <div key={i} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: `1px solid ${C.border}` }}>
                <span style={{ fontSize: 14, color: C.primary, fontWeight: 600, minWidth: 30 }}>{v.adet}x</span>
                <div>
                  <div style={{ fontSize: 13, color: C.dark }}>{v.zikir}</div>
                  {v.amac && <div style={{ fontSize: 10, color: '#999' }}>{v.amac}</div>}
                </div>
              </div>
            ))}
            {detayliGorunum && receteler.ruhsal.akademik && (
              <div style={{ background: C.surface, borderRadius: 8, padding: '10px 14px', marginTop: 10, fontSize: 12, color: C.secondary, lineHeight: 1.7 }}>
                {receteler.ruhsal.akademik}
              </div>
            )}
          </div>
        )}

        {/* 6. BITKISEL DESTEK */}
        {receteler.bitkisel?.aktif && receteler.bitkisel.bitkiler?.length > 0 && (
          <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: '20px 24px', marginBottom: 16 }}>
            <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 11, color: C.gold, letterSpacing: 2, marginBottom: 12 }}>{"BITKISEL DESTEK"}</div>
            {receteler.bitkisel.bitkiler.map((b: { ad_tr: string, ad_ar?: string, etki: string, kullanim?: string, kaynak?: string }, i: number) => (
              <div key={i} style={{ background: C.surface, borderRadius: 8, padding: '12px 14px', marginBottom: 8 }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: C.primary }}>{"\uD83C\uDF3F"} {b.ad_tr}</div>
                {b.ad_ar && <div style={{ fontSize: 12, color: C.gold, fontFamily: 'serif' }}>{b.ad_ar}</div>}
                <div style={{ fontSize: 12, color: C.secondary, marginTop: 4 }}>{b.etki}</div>
                {b.kullanim && <div style={{ fontSize: 11, color: '#777', marginTop: 2 }}>{b.kullanim}</div>}
                {b.kaynak && <div style={{ fontSize: 10, color: '#999', fontStyle: 'italic', marginTop: 4, borderTop: `1px solid ${C.border}`, paddingTop: 4 }}>{b.kaynak}</div>}
              </div>
            ))}
            <div style={{ background: '#FFF8E7', border: `1px solid ${C.gold}`, borderRadius: 8, padding: '10px 14px', fontSize: 11, color: C.secondary, marginTop: 8 }}>
              {"Bu oneriler klasik tip kaynaklidir. Hekiminize danisin."}
            </div>
          </div>
        )}

        {/* 7. BESLENME */}
        {receteler.beslenme?.aktif && (
          <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: '20px 24px', marginBottom: 16 }}>
            <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 11, color: C.gold, letterSpacing: 2, marginBottom: 12 }}>{"BESLENME"}</div>
            {receteler.beslenme.ilke && <div style={{ fontSize: 13, color: C.primary, fontStyle: 'italic', marginBottom: 10 }}>{receteler.beslenme.ilke}</div>}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {receteler.beslenme.onerililer?.length > 0 && (
                <div style={{ background: '#F0FDF4', borderRadius: 8, padding: '10px' }}>
                  <div style={{ fontSize: 10, color: '#1B5E20', fontWeight: 600, marginBottom: 6 }}>{"ONERILEN"}</div>
                  {receteler.beslenme.onerililer.map((g: { gida: string, neden?: string }, i: number) => (
                    <div key={i} style={{ fontSize: 11, color: C.dark, padding: '2px 0' }}>{"\u2713"} {g.gida}{g.neden ? ` — ${g.neden}` : ''}</div>
                  ))}
                </div>
              )}
              {receteler.beslenme.kacinilacaklar?.length > 0 && (
                <div style={{ background: '#FFF3E0', borderRadius: 8, padding: '10px' }}>
                  <div style={{ fontSize: 10, color: '#E65100', fontWeight: 600, marginBottom: 6 }}>{"KACINILACAK"}</div>
                  {receteler.beslenme.kacinilacaklar.map((g: { gida: string, neden?: string }, i: number) => (
                    <div key={i} style={{ fontSize: 11, color: C.dark, padding: '2px 0' }}>{"\u2717"} {g.gida}{g.neden ? ` — ${g.neden}` : ''}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 8. HIKMETLI SOZ */}
        {sonuc.hikmetli_soz && (
          <div style={{ background: C.primary, borderRadius: 12, padding: '20px 24px', marginBottom: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', letterSpacing: 2, marginBottom: 10 }}>{"HIKMET"}</div>
            {sonuc.hikmetli_soz.metin_ar && <div style={{ fontSize: 20, color: C.gold, fontFamily: 'serif', marginBottom: 8, lineHeight: 1.8, direction: 'rtl' }}>{sonuc.hikmetli_soz.metin_ar}</div>}
            {sonuc.hikmetli_soz.metin && <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontStyle: 'italic', marginBottom: 6 }}>{sonuc.hikmetli_soz.metin}</div>}
            {sonuc.hikmetli_soz.kaynak && <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{"\u2014"} {sonuc.hikmetli_soz.kaynak}</div>}
          </div>
        )}

        {/* 9. SONRAKI ADIM */}
        {sonuc.sonraki_adim && (
          <div style={{ background: '#E3F2FD', borderRadius: 12, padding: '16px 20px', marginBottom: 16 }}>
            <div style={{ fontSize: 10, color: '#1565C0', fontWeight: 600, letterSpacing: 1, marginBottom: 6 }}>{"SONRAKI ADIM"} {sonuc.sonraki_adim.sure ? `\u2014 ${sonuc.sonraki_adim.sure}` : ''}</div>
            {sonuc.sonraki_adim.odak && <div style={{ fontSize: 13, color: C.dark }}>{sonuc.sonraki_adim.odak}</div>}
            {sonuc.sonraki_adim.profesyonel_yonlendirme && (
              <div style={{ background: '#FFF8E7', border: `1px solid ${C.gold}`, borderRadius: 8, padding: '10px 14px', marginTop: 10, fontSize: 12, color: C.secondary }}>
                {"\u26A0"} {sonuc.sonraki_adim.profesyonel_yonlendirme}
              </div>
            )}
          </div>
        )}

        {/* 10. BUTONLAR */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
          <a href="https://wa.me/905331687226?text=Karakter%20analizi%20sonucum%20hakkinda%20gorusmek%20istiyorum" target="_blank"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#25D366', color: 'white', borderRadius: 10, padding: 14, fontSize: 13, fontWeight: 600, textDecoration: 'none', fontFamily: cinzel.style.fontFamily }}>
            {"WhatsApp"}
          </a>
          <button onClick={() => router.push('/karakter')}
            style={{ background: 'transparent', border: `1.5px solid ${C.primary}`, borderRadius: 10, padding: 14, fontSize: 13, fontWeight: 600, color: C.primary, cursor: 'pointer', fontFamily: cinzel.style.fontFamily }}>
            {"Yeni Analiz"}
          </button>
        </div>

        {/* YASAL NOT */}
        <div style={{ background: '#FFF8E7', border: `1px solid ${C.gold}`, borderRadius: 10, padding: '12px 16px', fontSize: 11, color: C.secondary, lineHeight: 1.6, textAlign: 'center' }}>
          {sonuc.yasal_not || 'Bu rapor klasik Islam dusuncesi cercevesinde hazirlanmis bir oz-degerlendirme aracidir. Tibbi veya psikolojik tedavinin yerini tutmaz.'}
        </div>
      </div>

      <Footer />
    </div>
  )
}
