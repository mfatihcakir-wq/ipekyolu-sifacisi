'use client'

import { useState, useRef, useEffect } from 'react'
import { Cinzel } from 'next/font/google'

const cinzel = Cinzel({ subsets: ['latin'], weight: ['400', '600'] })
const C = { primary: '#1B4332', gold: '#C9A84C', cream: '#F5EFE6', border: '#E0D5C5', surface: '#FAF7F2', white: '#FFFFFF' }

// DY_MATRIX — Manuel mod hilt skoru
const DY_MATRIX: Record<string, Record<string, Record<string, number>>> = {
  dil_renk: {
    kirmizi: { dem: 30, balgam: 0, sari_safra: 15, kara_safra: 5 },
    pembe_normal: { dem: 15, balgam: 10, sari_safra: 10, kara_safra: 5 },
    soluk_beyaz: { dem: 5, balgam: 30, sari_safra: 5, kara_safra: 10 },
    sari: { dem: 5, balgam: 5, sari_safra: 30, kara_safra: 10 },
    mor_koyu: { dem: 5, balgam: 5, sari_safra: 10, kara_safra: 30 },
  },
  dil_kaplama: {
    ince_seffaf: { dem: 10, balgam: 5, sari_safra: 5, kara_safra: 5 },
    kalin_beyaz: { dem: 5, balgam: 30, sari_safra: 5, kara_safra: 5 },
    sari_yesil: { dem: 5, balgam: 5, sari_safra: 25, kara_safra: 10 },
    gri_koyu: { dem: 5, balgam: 5, sari_safra: 10, kara_safra: 25 },
    kaplama_yok: { dem: 15, balgam: 0, sari_safra: 10, kara_safra: 5 },
  },
  yuz_ten: {
    kirmizi_pembe: { dem: 30, balgam: 5, sari_safra: 10, kara_safra: 0 },
    normal_bugday: { dem: 15, balgam: 10, sari_safra: 10, kara_safra: 5 },
    soluk_beyaz: { dem: 5, balgam: 25, sari_safra: 5, kara_safra: 10 },
    sari_zeytin: { dem: 5, balgam: 5, sari_safra: 25, kara_safra: 10 },
    esmer_koyu: { dem: 10, balgam: 5, sari_safra: 10, kara_safra: 20 },
  },
  yuz_cilt: {
    yagly_parlak: { dem: 25, balgam: 15, sari_safra: 5, kara_safra: 0 },
    normal: { dem: 10, balgam: 10, sari_safra: 10, kara_safra: 10 },
    kuru_mat: { dem: 5, balgam: 5, sari_safra: 15, kara_safra: 20 },
    kuru_pul: { dem: 0, balgam: 5, sari_safra: 10, kara_safra: 30 },
  },
}

interface DYProps {
  onSonuc: (sonuc: {
    dil: Record<string, string>
    yuz: Record<string, string>
    hiltler: Record<string, number>
    baskin_hilt: string
  }) => void
}

export default function DilYuzKamera({ onSonuc }: DYProps) {
  const [dilFoto, setDilFoto] = useState<string | null>(null)
  const [yuzFoto, setYuzFoto] = useState<string | null>(null)
  const [kameraTip, setKameraTip] = useState<'dil' | 'yuz' | null>(null)
  const [analizing, setAnalizing] = useState(false)
  const [sonuc, setSonuc] = useState<{ dil: Record<string, string>, yuz: Record<string, string>, hiltler: Record<string, number>, baskin_hilt: string } | null>(null)
  const [hata, setHata] = useState('')

  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  async function kameraAc(tip: 'dil' | 'yuz') {
    setKameraTip(tip)
    setHata('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: tip === 'yuz' ? 'user' : 'environment', width: 640, height: 480 }
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
    } catch {
      setHata('Kamera erisimi reddedildi.')
      setKameraTip(null)
    }
  }

  function fotoCek() {
    if (!videoRef.current || !kameraTip) return

    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth || 640
    canvas.height = videoRef.current.videoHeight || 480
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)

    // Kilavuz ciz
    ctx.strokeStyle = C.gold
    ctx.lineWidth = 2
    ctx.setLineDash([8, 4])
    if (kameraTip === 'dil') {
      // Yatay oval
      ctx.beginPath()
      ctx.ellipse(canvas.width / 2, canvas.height / 2, canvas.width * 0.3, canvas.height * 0.2, 0, 0, Math.PI * 2)
      ctx.stroke()
    } else {
      // Dikey oval
      ctx.beginPath()
      ctx.ellipse(canvas.width / 2, canvas.height / 2, canvas.width * 0.25, canvas.height * 0.35, 0, 0, Math.PI * 2)
      ctx.stroke()
    }

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85)

    if (kameraTip === 'dil') setDilFoto(dataUrl)
    else setYuzFoto(dataUrl)

    // Kamerayi kapat
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    setKameraTip(null)
  }

  function temizle(tip: 'dil' | 'yuz') {
    if (tip === 'dil') setDilFoto(null)
    else setYuzFoto(null)
    setSonuc(null)
  }

  async function analizEt() {
    if (!dilFoto && !yuzFoto) return
    setAnalizing(true)
    setHata('')

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const content: any[] = []

      if (dilFoto) {
        content.push({
          type: 'image',
          source: { type: 'base64', media_type: 'image/jpeg', data: dilFoto.split(',')[1] }
        })
      }
      if (yuzFoto) {
        content.push({
          type: 'image',
          source: { type: 'base64', media_type: 'image/jpeg', data: yuzFoto.split(',')[1] }
        })
      }

      content.push({
        type: 'text',
        text: `el-Kanun fit-Tib nabiz ve gorsel muayene metoduyla bu ${dilFoto ? 'dil' : ''}${dilFoto && yuzFoto ? ' ve ' : ''}${yuzFoto ? 'yuz' : ''} fotograflarini analiz et. JSON formatinda dondur:
{"dil":{"renk":"kirmizi|pembe_normal|soluk_beyaz|sari|mor_koyu","kaplama":"ince_seffaf|kalin_beyaz|sari_yesil|gri_koyu|kaplama_yok","nem":"islak_nemli|normal|kuru|catlak_kuru","sekil":"siskin_kalin|normal|ince_kucuk|kenar_iz"},"yuz":{"ten":"kirmizi_pembe|normal_bugday|soluk_beyaz|sari_zeytin|esmer_koyu","sekil":"yuvarlak_dolgun|oval_orta|uzun_koseli|kucuk_sivri","cilt":"yagly_parlak|normal|kuru_mat|kuru_pul","gozalti":"normal|mor_halka|sislik_torba|kizarik"},"hiltler":{"dem":0-100,"balgam":0-100,"sari_safra":0-100,"kara_safra":0-100},"baskin_hilt":"dem|balgam|sari_safra|kara_safra","yorum":"1-2 cumle"}`
      })

      const res = await fetch('/api/dil-yuz-analiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })

      if (!res.ok) throw new Error('API hatasi')
      const data = await res.json()

      setSonuc(data)
      onSonuc(data)
    } catch {
      // Fallback: DY_MATRIX ile manuel hesapla
      setHata('Gorsel analiz silinemiyor. Manuel secim kullanin.')
    }
    setAnalizing(false)
  }

  // Manuel mod hilt hesaplama — export icin
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function manuelHiltHesapla(secimler: Record<string, string>): Record<string, number> {
    const toplam = { dem: 0, balgam: 0, sari_safra: 0, kara_safra: 0 }
    for (const [alan, deger] of Object.entries(secimler)) {
      const matris = DY_MATRIX[alan]
      if (matris && matris[deger]) {
        for (const [hilt, skor] of Object.entries(matris[deger])) {
          toplam[hilt as keyof typeof toplam] += skor
        }
      }
    }
    // Normalize
    const total = Object.values(toplam).reduce((a, b) => a + b, 0) || 1
    return {
      dem: Math.round((toplam.dem / total) * 100),
      balgam: Math.round((toplam.balgam / total) * 100),
      sari_safra: Math.round((toplam.sari_safra / total) * 100),
      kara_safra: Math.round((toplam.kara_safra / total) * 100),
    }
  }

  // Cleanup
  useEffect(() => {
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
    }
  }, [])

  return (
    <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: '20px 24px' }}>
      <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 12, color: C.gold, letterSpacing: 2, marginBottom: 12 }}>
        {"DIL / YUZ KAMERA ANALIZI"}
      </div>

      {/* Kamera aciksa */}
      {kameraTip && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: C.primary, fontWeight: 600, marginBottom: 8 }}>
            {kameraTip === 'dil' ? 'Dilinizi gosterin' : 'Yuzunuzu gosterin'}
          </div>
          <video ref={videoRef} playsInline muted
            style={{ width: '100%', maxHeight: 300, borderRadius: 10, background: '#111' }} />
          <button onClick={fotoCek}
            style={{ width: '100%', marginTop: 8, padding: '12px', background: C.gold, border: 'none', borderRadius: 8, color: C.primary, fontFamily: cinzel.style.fontFamily, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            {"Fotograf Cek"}
          </button>
        </div>
      )}

      {/* Kamera kapali — butonlar */}
      {!kameraTip && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div style={{ textAlign: 'center' }}>
            {dilFoto ? (
              <div>
                <img src={dilFoto} alt="Dil" style={{ width: '100%', borderRadius: 8, marginBottom: 6 }} />
                <button onClick={() => temizle('dil')}
                  style={{ fontSize: 11, color: '#C62828', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                  {"Yeniden Cek"}
                </button>
              </div>
            ) : (
              <button onClick={() => kameraAc('dil')}
                style={{ width: '100%', padding: '24px 12px', background: C.surface, border: `1.5px dashed ${C.border}`, borderRadius: 10, cursor: 'pointer', color: C.primary, fontSize: 12 }}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>{'\uD83D\uDC45'}</div>
                {"Dil Fotografı"}
              </button>
            )}
          </div>
          <div style={{ textAlign: 'center' }}>
            {yuzFoto ? (
              <div>
                <img src={yuzFoto} alt="Yuz" style={{ width: '100%', borderRadius: 8, marginBottom: 6 }} />
                <button onClick={() => temizle('yuz')}
                  style={{ fontSize: 11, color: '#C62828', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                  {"Yeniden Cek"}
                </button>
              </div>
            ) : (
              <button onClick={() => kameraAc('yuz')}
                style={{ width: '100%', padding: '24px 12px', background: C.surface, border: `1.5px dashed ${C.border}`, borderRadius: 10, cursor: 'pointer', color: C.primary, fontSize: 12 }}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>{'\uD83D\uDE10'}</div>
                {"Yuz Fotografı"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Analiz butonu */}
      {(dilFoto || yuzFoto) && !sonuc && !kameraTip && (
        <button onClick={analizEt} disabled={analizing}
          style={{ width: '100%', padding: '12px', background: analizing ? '#999' : C.primary, border: 'none', borderRadius: 10, color: C.gold, fontFamily: cinzel.style.fontFamily, fontSize: 13, fontWeight: 600, cursor: analizing ? 'not-allowed' : 'pointer' }}>
          {analizing ? 'Analiz ediliyor...' : 'Fotograflari Analiz Et'}
        </button>
      )}

      {hata && <p style={{ color: '#C62828', fontSize: 12, marginTop: 8 }}>{hata}</p>}

      {/* Sonuc — Hilt gostergesi */}
      {sonuc && (
        <div style={{ marginTop: 12, padding: '14px', background: C.surface, borderRadius: 10 }}>
          <div style={{ fontSize: 11, color: C.gold, letterSpacing: 2, marginBottom: 10 }}>{"HILT DAGILIMI"}</div>
          {[
            { key: 'dem', label: 'Dem', color: '#EF5350' },
            { key: 'balgam', label: 'Balgam', color: '#42A5F5' },
            { key: 'sari_safra', label: 'Safra', color: '#FFA726' },
            { key: 'kara_safra', label: 'K.Safra', color: '#AB47BC' },
          ].map(h => (
            <div key={h.key} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 10, color: '#666', width: 50 }}>{h.label}</span>
              <div style={{ flex: 1, height: 6, background: '#eee', borderRadius: 3 }}>
                <div style={{ height: 6, background: h.color, borderRadius: 3, width: `${sonuc.hiltler[h.key] || 0}%`, transition: 'width 0.5s' }} />
              </div>
              <span style={{ fontSize: 10, color: h.color, fontWeight: 600, width: 30, textAlign: 'right' }}>{sonuc.hiltler[h.key] || 0}%</span>
            </div>
          ))}
          <div style={{ fontSize: 11, color: C.primary, fontWeight: 600, marginTop: 8 }}>
            {"Baskin:"} {sonuc.baskin_hilt}
          </div>
          <div style={{ fontSize: 11, color: '#2E7D32', marginTop: 4 }}>
            {"\u2713 Form alanlari otomatik dolduruldu"}
          </div>
        </div>
      )}
    </div>
  )
}

export { DY_MATRIX }
export type { DYProps }
