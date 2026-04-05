'use client'

import { useEffect, useState, useCallback } from 'react'
import { Cinzel, EB_Garamond } from 'next/font/google'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

const cinzel = Cinzel({ display: 'swap', preload: false, subsets: ['latin', 'latin-ext'], weight: ['400', '500', '600'] })
const garamond = EB_Garamond({ display: 'swap', preload: false, subsets: ['latin', 'latin-ext'], weight: ['400', '500'], style: ['normal', 'italic'] })

const C = {
  primary: '#1C3A26', gold: '#B8860B', cream: '#FAF6EF',
  dark: '#1C1C1C', secondary: '#6B5744', border: '#DEB887',
  white: '#FFFFFF', surface: '#FAF6EF',
}

interface Yorum {
  id: string
  ad_soyad: string
  sehir: string | null
  yorum: string
  puan: number
  onaylandi: boolean
  olusturulma_tarihi: string
  onay_tarihi: string | null
}

export default function YorumlarPage() {
  const [yorumlar, setYorumlar] = useState<Yorum[]>([])
  const [loading, setLoading] = useState(true)
  const [filtre, setFiltre] = useState<'tumu' | 'bekleyen' | 'yayinda'>('tumu')
  const [islemYapilan, setIslemYapilan] = useState<string | null>(null)
  const supabase = createClient()

  const yukle = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('yorumlar')
      .select('*')
      .order('olusturulma_tarihi', { ascending: false })
    setYorumlar(data || [])
    setLoading(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => { yukle() }, [yukle])

  async function onayIslem(id: string, onay: boolean) {
    setIslemYapilan(id)
    await fetch('/api/yorum/onayla', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, onay }),
    })
    await yukle()
    setIslemYapilan(null)
  }

  const filtered = yorumlar.filter(y => {
    if (filtre === 'bekleyen') return !y.onaylandi
    if (filtre === 'yayinda') return y.onaylandi
    return true
  })

  const bekleyenSayisi = yorumlar.filter(y => !y.onaylandi).length

  return (
    <div style={{ background: C.cream, minHeight: '100vh', fontFamily: garamond.style.fontFamily }}>
      {/* Header */}
      <header style={{ background: C.primary, padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/dashboard" style={{ textDecoration: 'none' }}>
            <span style={{ fontFamily: cinzel.style.fontFamily, color: C.gold, fontSize: 14, fontWeight: 600, letterSpacing: 3 }}>{"IPEK YOLU SIFACISI"}</span>
          </Link>
          <span style={{ color: 'rgba(255,255,255,0.3)' }}>{"/"}</span>
          <span style={{ fontFamily: cinzel.style.fontFamily, color: 'rgba(255,255,255,0.6)', fontSize: 11, letterSpacing: 2 }}>{"YORUMLAR"}</span>
        </div>
        <Link href="/dashboard" style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>{"Panel'e Don"}</Link>
      </header>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px' }}>
        {/* Baslik + istatistik */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontFamily: cinzel.style.fontFamily, fontSize: 22, color: C.primary, fontWeight: 600, marginBottom: 4 }}>{"Kullanici Yorumlari"}</h1>
            <p style={{ fontSize: 13, color: C.secondary }}>{yorumlar.length}{" toplam, "}{bekleyenSayisi}{" bekliyor"}</p>
          </div>
          {bekleyenSayisi > 0 && (
            <div style={{ background: '#DC2626', color: 'white', fontFamily: cinzel.style.fontFamily, fontSize: 11, fontWeight: 600, padding: '6px 14px', borderRadius: 20, letterSpacing: 1 }}>
              {bekleyenSayisi}{" BEKLEYEN"}
            </div>
          )}
        </div>

        {/* Filtreler */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {[
            { label: 'Tumu', val: 'tumu' as const, count: yorumlar.length },
            { label: 'Bekleyenler', val: 'bekleyen' as const, count: bekleyenSayisi },
            { label: 'Yayinda', val: 'yayinda' as const, count: yorumlar.filter(y => y.onaylandi).length },
          ].map(f => (
            <button key={f.val} onClick={() => setFiltre(f.val)}
              style={{
                padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
                fontFamily: cinzel.style.fontFamily, fontSize: 11, fontWeight: 600, letterSpacing: 1,
                background: filtre === f.val ? C.primary : C.white,
                color: filtre === f.val ? C.gold : C.secondary,
              }}>
              {f.label}{" ("}{f.count}{")"}
            </button>
          ))}
        </div>

        {/* Liste */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: C.secondary }}>{"Yukleniyor..."}</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ fontSize: 36, opacity: 0.3, marginBottom: 12 }}>{"\uD83D\uDCAC"}</div>
            <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 16, color: C.primary, marginBottom: 8 }}>{"Henuz yorum yok"}</div>
            <div style={{ fontSize: 13, color: C.secondary }}>{"Kullanicilar yorum gonderdiginde burada gorunecek"}</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 12 }}>
            {filtered.map(y => (
              <div key={y.id} style={{
                background: C.white, border: `1px solid ${y.onaylandi ? C.border : '#FFF3CD'}`,
                borderRadius: 14, padding: '20px 24px',
                borderLeft: y.onaylandi ? `4px solid #059669` : `4px solid #D97706`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' as const }}>
                  {/* Sol: bilgi */}
                  <div style={{ flex: '1 1 300px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <span style={{ fontFamily: cinzel.style.fontFamily, fontSize: 13, fontWeight: 600, color: C.primary }}>{y.ad_soyad}</span>
                      {y.sehir && <span style={{ fontSize: 11, color: C.secondary }}>{y.sehir}</span>}
                      <span style={{ fontSize: 14, color: C.gold }}>
                        {Array.from({ length: 5 }, (_, i) => i < y.puan ? '\u2605' : '\u2606').join('')}
                      </span>
                    </div>
                    <p style={{ fontSize: 15, color: C.dark, fontStyle: 'italic', lineHeight: 1.7, margin: '0 0 8px 0' }}>
                      {'"'}{y.yorum}{'"'}
                    </p>
                    <div style={{ fontSize: 11, color: '#999' }}>
                      {new Date(y.olusturulma_tarihi).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      {y.onaylandi && y.onay_tarihi && (
                        <span style={{ marginLeft: 8, color: '#059669' }}>
                          {"\u2713 "}{new Date(y.onay_tarihi).toLocaleDateString('tr-TR')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Sag: aksiyonlar */}
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0, alignItems: 'center' }}>
                    {islemYapilan === y.id ? (
                      <span style={{ fontSize: 11, color: '#999' }}>{"..."}</span>
                    ) : y.onaylandi ? (
                      <>
                        <span style={{ fontSize: 10, background: '#ECFDF5', color: '#059669', padding: '4px 10px', borderRadius: 12, fontWeight: 600 }}>{"Yayinda"}</span>
                        <button onClick={() => onayIslem(y.id, false)}
                          style={{ fontSize: 10, padding: '4px 10px', background: '#FEF2F2', color: '#DC2626', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>
                          {"Kaldir"}
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => onayIslem(y.id, true)}
                          style={{ fontSize: 10, padding: '6px 14px', background: '#059669', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>
                          {"Onayla \u2713"}
                        </button>
                        <button onClick={() => onayIslem(y.id, false)}
                          style={{ fontSize: 10, padding: '6px 14px', background: '#FEF2F2', color: '#DC2626', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>
                          {"Reddet \u2717"}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
