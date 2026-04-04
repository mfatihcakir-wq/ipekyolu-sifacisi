'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Cinzel, EB_Garamond } from 'next/font/google'
import { createClient } from '@/lib/supabase'

const cinzel = Cinzel({ subsets: ['latin'], weight: ['400', '500', '600'] })
const garamond = EB_Garamond({ subsets: ['latin'], weight: ['400', '500'], style: ['normal', 'italic'] })

const C = {
  primary: '#1B4332', gold: '#C9A84C', cream: '#F5EFE6',
  dark: '#1C1C1C', secondary: '#5C4A2A', border: '#E0D5C5',
  white: '#FFFFFF', surface: '#FAF7F2',
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FormData = Record<string, any>

const durumBanner = (d: string) => {
  if (d === 'email_gonderildi') return { bg: '#1B4332', color: '#F5EFE6', text: 'Rapor Gonderildi' }
  if (d === 'onaylandi') return { bg: '#E8F5E9', color: '#2E7D32', text: 'Onaylandi' }
  if (d === 'analiz_edildi') return { bg: '#E3F2FD', color: '#1565C0', text: 'Analiz Edildi' }
  if (d === 'reddedildi') return { bg: '#fef2f2', color: '#dc2626', text: 'Reddedildi' }
  return { bg: '#FFF8E7', color: '#E65100', text: 'Beklemede' }
}

export default function DashboardCiltDetailPage() {
  const router = useRouter()
  const { id } = useParams()
  const supabase = createClient()
  const [form, setForm] = useState<FormData | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [sonuc, setSonuc] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [analizYukleniyor, setAnalizYukleniyor] = useState(false)
  const [onayYukleniyor, setOnayYukleniyor] = useState(false)
  const [toast, setToast] = useState('')

  const yukle = useCallback(async () => {
    const { data } = await supabase
      .from('cilt_forms')
      .select('*')
      .eq('id', id)
      .single()
    if (!data) { router.push('/dashboard/cilt'); return }
    setForm(data)
    if (data.sonuc_verisi) setSonuc(data.sonuc_verisi)
    setLoading(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  useEffect(() => {
    yukle()
  }, [yukle])

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(''), 4000)
    return () => clearTimeout(t)
  }, [toast])

  async function analizYap() {
    if (!form) return
    setAnalizYukleniyor(true)
    try {
      const res = await fetch('/api/cilt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.error) { setToast('Hata: ' + data.error); setAnalizYukleniyor(false); return }
      setSonuc(data)
      await supabase.from('cilt_forms').update({ sonuc_verisi: data, durum: 'analiz_edildi' }).eq('id', id)
      setForm((prev: FormData | null) => prev ? { ...prev, durum: 'analiz_edildi', sonuc_verisi: data } : prev)
      setToast('Analiz basariyla tamamlandi')
    } catch {
      setToast('Hata: Analiz sirasinda bir sorun olustu')
    }
    setAnalizYukleniyor(false)
  }

  async function onaylaVeGonder() {
    setOnayYukleniyor(true)
    try {
      // Email gonder
      if (form?.hasta_email && form?.sonuc_verisi) {
        await fetch('/api/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: form.hasta_email,
            hasta_adi: form.hasta_adi || 'Hasta',
            type: 'cilt',
            sonuc_verisi: form.sonuc_verisi,
            kayit_no: form.kayit_no || '',
          }),
        })
      }
      // Status guncelle
      const now = new Date().toISOString()
      await supabase.from('cilt_forms').update({
        durum: 'email_gonderildi',
        email_gonderildi_at: now,
      }).eq('id', id)
      setForm((prev: FormData | null) => prev ? { ...prev, durum: 'email_gonderildi', email_gonderildi_at: now } : prev)
      setToast('Rapor basariyla gonderildi \u2713')
    } catch {
      setToast('Hata: Onay sirasinda bir sorun olustu')
    }
    setOnayYukleniyor(false)
  }

  if (loading) {
    return (
      <div style={{ background: C.cream, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 40, height: 40, border: `3px solid ${C.border}`, borderTop: `3px solid ${C.primary}`, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  if (!form) return null

  const banner = durumBanner(form.durum)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formFields: [string, any][] = [
    ['Hasta Adi', form.hasta_adi],
    ['E-posta', form.email],
    ['Telefon', form.telefon],
    ['Cilt Tipi', form.cilt_tipi],
    ['Ten Rengi', form.cilt_rengi],
    ['Yas Grubu', form.yas_grubu],
    ['Cinsiyet', form.cinsiyet],
    ['Hassasiyet', form.hassasiyet],
    ['Sorunlar', (form.sorunlar || []).join(', ')],
    ['Sorun Suresi', form.sorun_suresi],
    ['Sorun Bolgeleri', (form.sorun_bolge || []).join(', ')],
    ['Mevsim Etkisi', form.mevsim_etkisi],
    ['Tetikleyici', form.tetikleyici],
    ['Hamilelik', form.hamilelik],
    ['Gunes Maruziyeti', form.gunes_maruziyeti],
    ['Su Tuketimi', form.su_tuketimi],
    ['Stres Seviyesi', form.stres_seviyesi],
    ['Uyku Duzeni', form.uyku_duzeni],
    ['Mevcut Urunler', form.mevcut_urunler],
    ['Alerjiler', form.alerjiler],
    ['Kronik Hastalik', form.kronik_hastalik],
  ]

  // Lab values
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const labFields: [string, any][] = ([
    ['CRP', form.lab_crp],
    ['Bilirubin', form.lab_bilirubin],
    ['Vitamin D', form.lab_vitd],
    ['Hemoglobin', form.lab_hemoglobin],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ] as [string, any][]).filter(([, v]) => v)

  return (
    <div style={{ background: C.cream, minHeight: '100vh', fontFamily: garamond.style.fontFamily }}>
      {/* Header */}
      <header style={{
        background: C.primary, padding: '0 24px', height: 60, display: 'flex',
        alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky' as const, top: 0, zIndex: 100, boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => router.push('/dashboard/cilt')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: 18 }}>{'\u2190'}</button>
          <div>
            <div style={{ fontFamily: cinzel.style.fontFamily, color: C.gold, fontSize: 13, letterSpacing: 2 }}>
              {"CILT ANALIZI"}
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', letterSpacing: 1 }}>
              {form.hasta_adi || 'Detay'}
            </div>
          </div>
        </div>
        <span style={{
          fontSize: 10, padding: '4px 12px', borderRadius: 20,
          background: banner.bg, color: banner.color, fontWeight: 600,
        }}>
          {banner.text}
        </span>
      </header>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed' as const, top: 20, right: 20, zIndex: 9999,
          background: toast.includes('Hata') ? '#FCEBEB' : '#EAF3DE',
          border: '1px solid', borderColor: toast.includes('Hata') ? '#F7C1C1' : '#C0DD97',
          color: toast.includes('Hata') ? '#A32D2D' : '#3B6D11',
          padding: '12px 20px', borderRadius: 10, fontSize: 13,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}>
          {toast}
          <button onClick={() => setToast('')} style={{ marginLeft: 12, background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>{'\u2715'}</button>
        </div>
      )}

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 20px' }}>
        {/* Status Banner */}
        <div style={{
          background: banner.bg, border: `1px solid ${banner.color}33`,
          borderRadius: 10, padding: '12px 20px', marginBottom: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 13, color: banner.color, fontWeight: 600 }}>{banner.text}</span>
          {form.kayit_no && (
            <span style={{ fontSize: 11, color: banner.color, opacity: 0.7, fontFamily: 'monospace' }}>
              {"Kayit: #"}{form.kayit_no}
            </span>
          )}
        </div>

        {/* Two Column Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 3fr', gap: 24, alignItems: 'start' }}>

          {/* LEFT: Form Data */}
          <div>
            <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 11, color: C.primary, letterSpacing: 2, marginBottom: 10, textTransform: 'uppercase' as const }}>
              {"Form Verisi"}
            </div>
            <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: '18px 22px', marginBottom: 16 }}>
              {formFields.filter(([, v]) => v).map(([label, value]) => (
                <div key={label as string} style={{
                  display: 'flex', justifyContent: 'space-between', padding: '7px 0',
                  borderBottom: `1px solid ${C.surface}`, fontSize: 13, gap: 12,
                }}>
                  <span style={{ color: C.secondary, fontWeight: 500, flexShrink: 0 }}>{label as string}</span>
                  <span style={{ color: C.dark, textAlign: 'right', wordBreak: 'break-word' }}>{String(value)}</span>
                </div>
              ))}
            </div>

            {/* Lab Values */}
            {labFields.length > 0 && (
              <>
                <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 11, color: C.primary, letterSpacing: 2, marginBottom: 10, textTransform: 'uppercase' as const }}>
                  {"Lab Degerleri"}
                </div>
                <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: '18px 22px', marginBottom: 16 }}>
                  {labFields.map(([label, value]) => (
                    <div key={label as string} style={{
                      display: 'flex', justifyContent: 'space-between', padding: '7px 0',
                      borderBottom: `1px solid ${C.surface}`, fontSize: 13,
                    }}>
                      <span style={{ color: C.secondary, fontWeight: 500 }}>{label as string}</span>
                      <span style={{ color: C.dark, fontFamily: 'monospace' }}>{String(value)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Notes */}
            {form.ek_notlar && (
              <>
                <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 11, color: C.primary, letterSpacing: 2, marginBottom: 10, textTransform: 'uppercase' as const }}>
                  {"Notlar"}
                </div>
                <div style={{
                  background: C.white, borderRadius: 14, border: `1px solid ${C.border}`,
                  padding: '18px 22px', fontSize: 13, color: C.dark, lineHeight: 1.7, whiteSpace: 'pre-wrap',
                }}>
                  {form.ek_notlar}
                </div>
              </>
            )}
          </div>

          {/* RIGHT: Analysis Panel */}
          <div>
            <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 11, color: C.primary, letterSpacing: 2, marginBottom: 10, textTransform: 'uppercase' as const }}>
              {"Analiz Paneli"}
            </div>

            {!sonuc ? (
              /* No analysis yet */
              <div style={{
                background: C.white, borderRadius: 14, border: `1px solid ${C.border}`,
                padding: '48px 32px', textAlign: 'center',
              }}>
                {analizYukleniyor ? (
                  <>
                    <div style={{
                      width: 48, height: 48, border: `3px solid ${C.border}`, borderTop: `3px solid ${C.gold}`,
                      borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px',
                    }} />
                    <style>{`@keyframes spin { to { transform: rotate(360deg) } } @keyframes pulse { 0%,100% { opacity: 1 } 50% { opacity: 0.5 } }`}</style>
                    <p style={{ fontSize: 15, color: C.primary, fontWeight: 500, marginBottom: 6, animation: 'pulse 2s ease-in-out infinite' }}>
                      {"Klasik kaynaklar taraniyor..."}
                    </p>
                    <p style={{ fontSize: 12, color: C.secondary }}>
                      {"Ibn Sina, er-Razi ve diger otorite kaynaklari inceleniyor"}
                    </p>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: 40, marginBottom: 16 }}>{'\uD83C\uDF3F'}</div>
                    <p style={{ fontSize: 15, color: C.dark, fontWeight: 500, marginBottom: 6 }}>
                      {"Henuz analiz yapilmadi"}
                    </p>
                    <p style={{ fontSize: 13, color: C.secondary, marginBottom: 24, lineHeight: 1.6 }}>
                      {"Form verisi hazirlandi. Klasik kaynaklardan analiz baslatabilirsiniz."}
                    </p>
                    <button onClick={analizYap} style={{
                      padding: '14px 36px', background: C.primary, border: 'none', borderRadius: 10,
                      fontFamily: cinzel.style.fontFamily, fontSize: 14, fontWeight: 600,
                      color: C.gold, letterSpacing: 1, cursor: 'pointer',
                    }}>
                      {"Analiz Et"}
                    </button>
                  </>
                )}
              </div>
            ) : (
              /* Analysis Results */
              <div style={{ display: 'grid', gap: 16 }}>

                {/* Teshis */}
                {(sonuc.sorun_ozeti || sonuc.teshis?.sorun_ozeti) && (
                  <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: '20px 24px' }}>
                    <div style={{ fontSize: 10, color: C.gold, letterSpacing: 1.5, marginBottom: 8, fontWeight: 700, textTransform: 'uppercase' as const, fontFamily: cinzel.style.fontFamily }}>
                      {"Teshis"}
                    </div>
                    <p style={{ fontSize: 14, color: C.dark, lineHeight: 1.7, marginBottom: 10 }}>
                      {sonuc.teshis?.sorun_ozeti || sonuc.sorun_ozeti}
                    </p>
                    {(sonuc.hilt_baglantisi || sonuc.teshis?.hilt_baglantisi) && (
                      <div style={{
                        background: '#FFF8E7', borderLeft: `3px solid ${C.gold}`,
                        padding: '10px 14px', borderRadius: '0 6px 6px 0', fontSize: 13, color: C.dark,
                      }}>
                        <strong>{"Mizac Baglantisi: "}</strong>{sonuc.teshis?.hilt_baglantisi || sonuc.hilt_baglantisi}
                      </div>
                    )}
                    {sonuc.mizac_tipi && (
                      <span style={{
                        display: 'inline-block', marginTop: 10, background: C.primary, color: C.cream,
                        fontSize: 11, padding: '4px 14px', borderRadius: 14,
                      }}>
                        {sonuc.mizac_tipi}
                      </span>
                    )}
                  </div>
                )}

                {/* Hikmetli Soz */}
                {sonuc.hikmetli_soz && (
                  <div style={{
                    background: C.primary, borderRadius: 14, padding: '24px 28px', textAlign: 'center',
                  }}>
                    {sonuc.hikmetli_soz.metin_ar && (
                      <div style={{ fontSize: 20, color: C.gold, marginBottom: 10, direction: 'rtl', fontFamily: 'serif' }}>
                        {sonuc.hikmetli_soz.metin_ar}
                      </div>
                    )}
                    <div style={{ fontSize: 14, color: C.cream, fontStyle: 'italic', marginBottom: 8, lineHeight: 1.6 }}>
                      {sonuc.hikmetli_soz.metin}
                    </div>
                    {sonuc.hikmetli_soz.kaynak && (
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>
                        {"— "}{sonuc.hikmetli_soz.kaynak}
                      </div>
                    )}
                  </div>
                )}

                {/* Urunler */}
                {(sonuc.urunler || sonuc.topikal_recete) && (
                  <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: '20px 24px' }}>
                    <div style={{ fontSize: 10, color: C.gold, letterSpacing: 1.5, marginBottom: 12, fontWeight: 700, textTransform: 'uppercase' as const, fontFamily: cinzel.style.fontFamily }}>
                      {"Urunler"}
                    </div>
                    <div style={{ display: 'grid', gap: 12 }}>
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {(sonuc.urunler || sonuc.topikal_recete || []).map((u: any, i: number) => (
                        <div key={i} style={{
                          background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: 16,
                        }}>
                          <div style={{ fontSize: 15, fontWeight: 600, color: C.primary, marginBottom: 2 }}>
                            {u.isim || u.urun || u.ad}
                          </div>
                          {u.tur && (
                            <div style={{ fontSize: 11, color: C.gold, textTransform: 'uppercase' as const, letterSpacing: 1, marginBottom: 8 }}>
                              {u.tur}
                            </div>
                          )}
                          {u.bilesenler && u.bilesenler.length > 0 && (
                            <div style={{ fontSize: 13, color: C.dark, marginBottom: 6 }}>
                              <strong>{"Bilesenler: "}</strong>{(u.bilesenler || []).join(', ')}
                            </div>
                          )}
                          {u.hazirlanis && (
                            <div style={{ fontSize: 13, color: C.dark, marginBottom: 6 }}>
                              <strong>{"Hazirlenis: "}</strong>{u.hazirlanis}
                            </div>
                          )}
                          {(u.uygulama || u.doz) && (
                            <div style={{ fontSize: 13, color: C.dark, marginBottom: 6 }}>
                              <strong>{"Uygulama: "}</strong>{u.uygulama || u.doz}
                            </div>
                          )}
                          {u.kaynak && (
                            <div style={{ fontSize: 11, color: '#999', fontStyle: 'italic', marginTop: 4 }}>
                              {"Kaynak: "}{u.kaynak}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Gunluk Rutin */}
                {sonuc.gunluk_rutin && typeof sonuc.gunluk_rutin === 'object' && (
                  <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: '20px 24px' }}>
                    <div style={{ fontSize: 10, color: C.gold, letterSpacing: 1.5, marginBottom: 12, fontWeight: 700, textTransform: 'uppercase' as const, fontFamily: cinzel.style.fontFamily }}>
                      {"Gunluk Rutin"}
                    </div>
                    {sonuc.gunluk_rutin.sabah && (
                      <div style={{
                        background: C.surface, borderLeft: `3px solid ${C.gold}`,
                        padding: '12px 16px', borderRadius: '0 8px 8px 0', marginBottom: 10,
                      }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: C.primary, marginBottom: 6 }}>{"Sabah"}</div>
                        {(sonuc.gunluk_rutin.sabah || []).map((a: string, i: number) => (
                          <div key={i} style={{ fontSize: 13, color: C.dark, padding: '2px 0' }}>{"- "}{a}</div>
                        ))}
                      </div>
                    )}
                    {sonuc.gunluk_rutin.aksam && (
                      <div style={{
                        background: C.surface, borderLeft: `3px solid ${C.primary}`,
                        padding: '12px 16px', borderRadius: '0 8px 8px 0', marginBottom: 10,
                      }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: C.primary, marginBottom: 6 }}>{"Aksam"}</div>
                        {(sonuc.gunluk_rutin.aksam || []).map((a: string, i: number) => (
                          <div key={i} style={{ fontSize: 13, color: C.dark, padding: '2px 0' }}>{"- "}{a}</div>
                        ))}
                      </div>
                    )}
                    {sonuc.gunluk_rutin.haftalik && (
                      <div style={{
                        background: '#FFF8E7', borderLeft: `3px solid ${C.gold}`,
                        padding: '12px 16px', borderRadius: '0 8px 8px 0',
                      }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: C.primary, marginBottom: 6 }}>{"Haftalik Ozel Bakim"}</div>
                        {(sonuc.gunluk_rutin.haftalik || []).map((a: string, i: number) => (
                          <div key={i} style={{ fontSize: 13, color: C.dark, padding: '2px 0' }}>{"- "}{a}</div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Beslenme */}
                {sonuc.beslenme && (
                  <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: '20px 24px' }}>
                    <div style={{ fontSize: 10, color: C.gold, letterSpacing: 1.5, marginBottom: 12, fontWeight: 700, textTransform: 'uppercase' as const, fontFamily: cinzel.style.fontFamily }}>
                      {"Beslenme Onerileri"}
                    </div>
                    {sonuc.beslenme.ilke && (
                      <p style={{ fontSize: 13, color: C.dark, fontStyle: 'italic', marginBottom: 12, lineHeight: 1.6 }}>
                        {sonuc.beslenme.ilke}
                      </p>
                    )}
                    {(sonuc.beslenme.onerililer || []).length > 0 && (
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: C.primary, marginBottom: 6 }}>{"Onerilen Gidalar"}</div>
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {(sonuc.beslenme.onerililer || []).map((g: any, i: number) => (
                          <div key={i} style={{ fontSize: 13, color: C.dark, padding: '3px 0' }}>
                            {"\u2713 "}<strong>{g.gida}</strong>{" \u2014 "}{g.neden}
                          </div>
                        ))}
                      </div>
                    )}
                    {(sonuc.beslenme.kacinilacaklar || []).length > 0 && (
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#8B0000', marginBottom: 6 }}>{"Kacinilacaklar"}</div>
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {(sonuc.beslenme.kacinilacaklar || []).map((g: any, i: number) => (
                          <div key={i} style={{ fontSize: 13, color: C.dark, padding: '3px 0' }}>
                            {"\u2717 "}<strong>{g.gida}</strong>{" \u2014 "}{g.neden}
                          </div>
                        ))}
                      </div>
                    )}
                    {sonuc.beslenme.su_tavsiyesi && (
                      <div style={{ fontSize: 13, color: C.dark, marginTop: 10, padding: '8px 12px', background: C.surface, borderRadius: 6 }}>
                        {"Su: "}{sonuc.beslenme.su_tavsiyesi}
                      </div>
                    )}
                  </div>
                )}

                {/* Ozel Notlar */}
                {(sonuc.ozel_notlar || []).length > 0 && (
                  <div style={{
                    background: C.surface, borderRadius: 14, border: `1px solid ${C.border}`, padding: '20px 24px',
                  }}>
                    <div style={{ fontSize: 10, color: C.primary, letterSpacing: 1.5, marginBottom: 8, fontWeight: 700, textTransform: 'uppercase' as const, fontFamily: cinzel.style.fontFamily }}>
                      {"Ozel Notlar"}
                    </div>
                    {(sonuc.ozel_notlar || []).map((n: string, i: number) => (
                      <div key={i} style={{ fontSize: 13, color: C.dark, padding: '3px 0' }}>{"- "}{n}</div>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {form.durum !== 'email_gonderildi' && (
                    <button onClick={onaylaVeGonder} disabled={onayYukleniyor} style={{
                      flex: 1, minWidth: 200, padding: 16, border: 'none', borderRadius: 12,
                      fontFamily: cinzel.style.fontFamily, fontSize: 14, fontWeight: 600,
                      letterSpacing: 1, cursor: onayYukleniyor ? 'not-allowed' : 'pointer',
                      background: onayYukleniyor ? '#999' : C.gold, color: C.primary,
                    }}>
                      {onayYukleniyor ? 'Gonderiliyor...' : 'Onayla ve Gonder'}
                    </button>
                  )}
                  <a
                    href="https://wa.me/905331687226"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      flex: 1, minWidth: 200, padding: 16, border: `1.5px solid ${C.border}`, borderRadius: 12,
                      fontFamily: cinzel.style.fontFamily, fontSize: 14, fontWeight: 600,
                      letterSpacing: 1, cursor: 'pointer', textDecoration: 'none',
                      background: C.white, color: C.primary, textAlign: 'center', boxSizing: 'border-box',
                    }}
                  >
                    {"Kisisel Not Ekle"}
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Responsive: stack on mobile */}
      <style>{`
        @media (max-width: 768px) {
          div[style*="gridTemplateColumns: '2fr 3fr'"],
          div[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}
