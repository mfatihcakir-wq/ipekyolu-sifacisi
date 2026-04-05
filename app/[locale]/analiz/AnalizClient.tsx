'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Cinzel, EB_Garamond } from 'next/font/google'
import dynamic from 'next/dynamic'
import Header from '../components/Header'
import Footer from '../components/Footer'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const PPGNabiz = dynamic(() => import('@/components/analiz/PPGNabiz'), { ssr: false })
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const DilYuzKamera = dynamic(() => import('@/components/analiz/DilYuzKamera'), { ssr: false })

const cinzel = Cinzel({ subsets: ['latin', 'latin-ext'], weight: ['400', '500', '600'] })
const garamond = EB_Garamond({ subsets: ['latin', 'latin-ext'], weight: ['400', '500'], style: ['normal', 'italic'] })

const C = {
  primary: '#1B4332',
  gold: '#C9A84C',
  cream: '#F5EFE6',
  dark: '#1C1C1C',
  secondary: '#5C4A2A',
  border: '#E0D5C5',
  white: '#FFFFFF',
  surface: '#FAF7F2',
}

const s = {
  card: { background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: 'clamp(14px, 3vw, 24px)', marginBottom: 16 } as React.CSSProperties,
  label: { fontSize: 11, fontWeight: 600, color: C.secondary, letterSpacing: '0.5px', textTransform: 'uppercase' as const, marginBottom: 4, display: 'block' },
  labelAr: { fontSize: 12, color: '#999', fontFamily: 'serif', display: 'block', marginBottom: 6 },
  select: { width: '100%', padding: '9px 12px', background: C.surface, border: `1.5px solid ${C.border}`, borderRadius: 8, fontSize: 16, minHeight: 44, color: C.dark, fontFamily: 'inherit' } as React.CSSProperties,
  input: { width: '100%', padding: '9px 12px', background: C.surface, border: `1.5px solid ${C.border}`, borderRadius: 8, fontSize: 16, minHeight: 44, color: C.dark, fontFamily: 'inherit', boxSizing: 'border-box' as const } as React.CSSProperties,
  textarea: { width: '100%', padding: '9px 12px', background: C.surface, border: `1.5px solid ${C.border}`, borderRadius: 8, fontSize: 16, color: C.dark, fontFamily: 'inherit', resize: 'none' as const, height: 80, boxSizing: 'border-box' as const } as React.CSSProperties,
  sectionTitle: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 10, fontWeight: 700, color: C.primary, letterSpacing: '3px', textTransform: 'uppercase' as const, marginBottom: 14, marginTop: 28 },
  grid2: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(260px, 100%), 1fr))', gap: 10 } as React.CSSProperties,
  grid3: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(200px, 100%), 1fr))', gap: 10 } as React.CSSProperties,
  tip: { background: '#FFF8E7', borderLeft: `3px solid ${C.gold}`, borderRadius: '0 6px 6px 0', padding: '8px 12px', fontSize: 12, color: C.secondary, marginBottom: 12, lineHeight: 1.5 } as React.CSSProperties,
}

export default function AnalizClient() {
  const router = useRouter()
  const [adim, setAdim] = useState(1)
  const [toast, setToast] = useState<{mesaj: string, tip: 'hata' | 'basari'} | null>(null)
  function gosterToast(mesaj: string, tip: 'hata' | 'basari' = 'hata') {
    setToast({ mesaj, tip })
    setTimeout(() => setToast(null), 4000)
  }

  const [nabizModu, setNabizModu] = useState<'kamera' | 'manuel'>('kamera')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [dyModu, setDyModu] = useState<'kamera' | 'manuel'>('kamera')

  const [form, setForm] = useState({
    ad_soyad: '', telefon: '', age_group: '', gender: '', pregnancy: 'hayir',
    sikayet_suresi: '', chronic: 'yok', season: '', climate: '', temp_feel: '', location: '',
    nb_buyukluk: 'orta', nb_kuvvet: 'orta', nb_hiz_sinif: 'orta', nb_dolgunluk: 'orta',
    nb_sertlik: 'orta', nb_isi: 'ilik', nb_ritim: 'muntazam', nb_esitlik: 'esit', nb_sureklitik: 'surekli',
    ppg_bpm: '', dil_foto: '', yuz_foto: '', kamera_tipi: 'bilgisayar',
    dil_renk: '', dil_kaplama: '', dil_nem: '', dil_sekil: '',
    yuz_ten: '', yuz_sekil: '', yuz_cilt: '', yuz_gozalti: '',
    body_temp: 'normal', extremity_temp: 'normal',
    urine_color: '', urine_amount: '', urine_clarity: '', urine_foam: 'yok', urine_sediment: 'yok', urine_smell: '',
    stool_color: '', stool_consistency: '',
    skin_type: '', mood_detail: '', exercise_habit: '', diet_type: '',
    height: '', weight: '', sweating: '', chillhot: '',
    sleep: '', digestion: '', appetite: '',
    hgb: '', htc: '', hematokrit: '', ferritin: '', crp: '', sedim: '',
    alt: '', ast: '', ggt: '', bilirubin: '', uric_acid: '',
    tsh: '', t3: '', t4: '', ft3: '', ft4: '',
    glucose: '', hba1c: '',
    vit_d: '', b12: '',
    fitri_sac: '', fitri_cilt: '', fitri_beden: '', fitri_uyku: '',
    fitri_sindirim: '', fitri_mizac_ruh: '', fitri_terleme: '',
    fitri_isi_hassas: '', fitri_mevsim: '', fitri_isi: '',
    fitri_kilo: '', fitri_enerji: '',
    symptoms: '', notlar: '',
    kvkk: false,
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const set = (key: string, val: any) => setForm(f => ({ ...f, [key]: val }))

  // === PPG Camera State ===
  const [ppgAktif, setPpgAktif] = useState(false)
  const [ppgBpm, setPpgBpm] = useState<number | null>(null)
  const [ppgSinyal, setPpgSinyal] = useState<number[]>([])
  const [ppgKalite, setPpgKalite] = useState(0)
  const [kameralar, setKameralar] = useState<MediaDeviceInfo[]>([])
  const [seciliKamera, setSeciliKamera] = useState('')
  const [ppgStatus, setPpgStatus] = useState('Kamerayı başlatın, parmak ucunuzu kameraya tutun')

  const ppgVideoRef = useRef<HTMLVideoElement | null>(null)
  const ppgStreamRef = useRef<MediaStream | null>(null)
  const ppgCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const ppgRafRef = useRef<number | null>(null)
  const ppgDataRef = useRef<{ timestamps: number[], values: number[], filtered: number[] }>({ timestamps: [], values: [], filtered: [] })
  const ppgLowRef = useRef(0)
  const ppgHighRef = useRef(0)
  const ppgLastPeakRef = useRef(0)
  const ppgIntervalsRef = useRef<number[]>([])

  // === Dil/Yuz Photo State ===
  const [dilFoto, setDilFoto] = useState<string | null>(null)
  const [yuzFoto, setYuzFoto] = useState<string | null>(null)
  const [fotoTab, setFotoTab] = useState<'dil' | 'yuz'>('dil')
  const fotoStreamRef = useRef<MediaStream | null>(null)

  // Kamera listele
  const kameralariListele = useCallback(async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true })
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter(d => d.kind === 'videoinput')
      setKameralar(videoDevices)
      // Detect iPhone continuity camera
      const iphoneCam = videoDevices.find(d => d.label.toLowerCase().includes('iphone') || d.label.toLowerCase().includes('continuity'))
      if (iphoneCam) {
        setSeciliKamera(iphoneCam.deviceId)
      }
    } catch {
      setPpgStatus('Kamera erişimi reddedildi.')
    }
  }, [])

  // PPG Stop
  const ppgDurdur = useCallback(() => {
    if (ppgRafRef.current) { cancelAnimationFrame(ppgRafRef.current); ppgRafRef.current = null }
    if (ppgStreamRef.current) { ppgStreamRef.current.getTracks().forEach(t => t.stop()); ppgStreamRef.current = null }
    setPpgAktif(false)
  }, [])

  // PPG Start
  const ppgBaslat = useCallback(async () => {
    try {
      ppgDurdur()
      setPpgStatus('Kamera açılıyor...')
      setPpgBpm(null)
      setPpgSinyal([])
      setPpgKalite(0)
      ppgDataRef.current = { timestamps: [], values: [], filtered: [] }
      ppgLowRef.current = 0
      ppgHighRef.current = 0
      ppgLastPeakRef.current = 0
      ppgIntervalsRef.current = []

      const constraints: MediaStreamConstraints = {
        video: seciliKamera
          ? { deviceId: { exact: seciliKamera } }
          : { facingMode: 'environment' }
      }
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      ppgStreamRef.current = stream
      const video = ppgVideoRef.current
      if (!video) return
      video.srcObject = stream
      await video.play()
      setPpgAktif(true)
      setPpgStatus('Parmak ucunuzu kameraya tutun... Ölçüm başlıyor')

      const canvas = ppgCanvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      canvas.width = 64
      canvas.height = 64

      const isMac = typeof navigator !== 'undefined' && navigator.platform.toLowerCase().includes('mac')
      const alphaLow = 0.45
      const alphaHigh = 0.97

      const processFrame = () => {
        if (!ppgStreamRef.current) return
        ctx.drawImage(video, 0, 0, 64, 64)
        const frame = ctx.getImageData(0, 0, 64, 64)
        let sum = 0
        const channelIndex = isMac ? 1 : 0 // green on Mac, red on others
        for (let i = 0; i < frame.data.length; i += 4) sum += frame.data[i + channelIndex]
        const avg = sum / (frame.data.length / 4)
        const now = performance.now()

        const data = ppgDataRef.current
        data.timestamps.push(now)
        data.values.push(avg)

        // Bandpass filter
        const lowFiltered = alphaLow * ppgLowRef.current + (1 - alphaLow) * avg
        ppgLowRef.current = lowFiltered
        const highFiltered = alphaHigh * ppgHighRef.current + alphaHigh * (lowFiltered - (ppgHighRef.current > 0 ? ppgHighRef.current : lowFiltered))
        ppgHighRef.current = highFiltered > 0 ? highFiltered : lowFiltered
        const filtered = lowFiltered - ppgHighRef.current
        data.filtered.push(filtered)

        // Keep last 300 samples for display
        if (data.filtered.length > 300) {
          data.filtered.shift()
          data.timestamps.shift()
          data.values.shift()
        }

        // Update signal for waveform display
        setPpgSinyal([...data.filtered.slice(-100)])

        // Peak detection with adaptive threshold
        const recent = data.filtered.slice(-60)
        if (recent.length > 10) {
          const mean = recent.reduce((a, b) => a + b, 0) / recent.length
          const std = Math.sqrt(recent.reduce((a, b) => a + (b - mean) ** 2, 0) / recent.length)
          const threshold = mean + std * 0.4
          const currentVal = data.filtered[data.filtered.length - 1]
          const prevVal = data.filtered.length > 1 ? data.filtered[data.filtered.length - 2] : 0
          const prevPrevVal = data.filtered.length > 2 ? data.filtered[data.filtered.length - 3] : 0

          // Refractory period 250ms
          if (currentVal > threshold && currentVal > prevVal && prevVal > prevPrevVal && (now - ppgLastPeakRef.current) > 250) {
            const interval = now - ppgLastPeakRef.current
            ppgLastPeakRef.current = now

            // Physiological check 30-220 BPM
            if (interval > 272 && interval < 2000) {
              ppgIntervalsRef.current.push(interval)
              if (ppgIntervalsRef.current.length > 20) ppgIntervalsRef.current.shift()
            }
          }

          // Calculate BPM with IQR outlier rejection
          const intervals = ppgIntervalsRef.current
          if (intervals.length >= 5) {
            const sorted = [...intervals].sort((a, b) => a - b)
            const q1 = sorted[Math.floor(sorted.length * 0.25)]
            const q3 = sorted[Math.floor(sorted.length * 0.75)]
            const iqr = q3 - q1
            const validIntervals = sorted.filter(v => v >= q1 - 1.5 * iqr && v <= q3 + 1.5 * iqr)
            if (validIntervals.length >= 3) {
              const avgInterval = validIntervals.reduce((a, b) => a + b, 0) / validIntervals.length
              const bpm = Math.round(60000 / avgInterval)
              if (bpm >= 30 && bpm <= 220) {
                setPpgBpm(bpm)
                set('ppg_bpm', String(bpm))
                // SNR quality score
                const snr = std > 0 ? (Math.abs(mean) / std) : 0
                const quality = Math.min(100, Math.round(snr * 20))
                setPpgKalite(quality)
                // Auto-set speed
                if (bpm > 90) set('nb_hiz_sinif', 'hizli')
                else if (bpm < 60) set('nb_hiz_sinif', 'yavas')
                else set('nb_hiz_sinif', 'orta')
              }
            }
          }
        }

        const elapsed = (now - data.timestamps[0]) / 1000
        if (ppgBpm === null && elapsed < 30) {
          setPpgStatus(`Ölçülüyor... ${Math.round(elapsed)}s`)
        } else if (ppgBpm !== null) {
          setPpgStatus(`Canlı ölçüm: ~${ppgBpm} BPM`)
        }

        ppgRafRef.current = requestAnimationFrame(processFrame)
      }

      ppgRafRef.current = requestAnimationFrame(processFrame)
    } catch {
      setPpgStatus('Kamera erişimi reddedildi. Tarayıcı ayarlarını kontrol edin.')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ppgDurdur, seciliKamera])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (ppgRafRef.current) cancelAnimationFrame(ppgRafRef.current)
      if (ppgStreamRef.current) ppgStreamRef.current.getTracks().forEach(t => t.stop())
      if (fotoStreamRef.current) fotoStreamRef.current.getTracks().forEach(t => t.stop())
    }
  }, [])

  // Photo capture
  const fotoCek = useCallback(async (tip: 'dil' | 'yuz') => {
    try {
      if (fotoStreamRef.current) {
        fotoStreamRef.current.getTracks().forEach(t => t.stop())
        fotoStreamRef.current = null
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: tip === 'yuz' ? 'user' : 'environment' }
      })
      fotoStreamRef.current = stream
      const video = document.createElement('video')
      video.srcObject = stream
      video.setAttribute('playsinline', 'true')
      await video.play()
      await new Promise(r => setTimeout(r, 500))
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      if (ctx) ctx.drawImage(video, 0, 0)
      stream.getTracks().forEach(t => t.stop())
      fotoStreamRef.current = null
      const dataUrl = canvas.toDataURL('image/jpeg', 0.7)
      if (tip === 'dil') { setDilFoto(dataUrl); set('dil_foto', dataUrl) }
      else { setYuzFoto(dataUrl); set('yuz_foto', dataUrl) }
    } catch {
      gosterToast('Kamera erişimi sağlanamadı.')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSubmit = () => {
    if (!form.ad_soyad?.trim()) { gosterToast('Ad Soyad alani zorunludur.'); setAdim(1); return }
    if (!form.telefon?.trim()) { gosterToast('Telefon numarasi zorunludur.'); setAdim(1); return }
    if (!form.symptoms?.trim()) { gosterToast('Sikayetler alani zorunludur.'); setAdim(8); return }
    if (!form.kvkk) { gosterToast('KVKK onayi gereklidir.'); return }
    localStorage.setItem('ipekyolu_analiz_form', JSON.stringify(form))
    localStorage.setItem('ipekyolu_secili_plan', 'yearly')
    router.push('/sonuc')
  }

  // Nabiz sifat button renderer
  const renderNabizButon = (key: string, value: string, label: string) => {
    const active = (form as Record<string, string | boolean>)[key] === value
    return (
      <button
        key={value}
        type="button"
        onClick={() => set(key, value)}
        style={{
          padding: '6px 10px',
          borderRadius: 6,
          border: `1.5px solid ${active ? C.gold : C.border}`,
          background: active ? C.gold : C.white,
          color: active ? C.primary : C.secondary,
          fontSize: 12,
          fontWeight: active ? 600 : 400,
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
      >
        {label}
      </button>
    )
  }

  return (
    <div style={{ background: C.cream, minHeight: '100vh', fontFamily: garamond.style.fontFamily }}>
      <Header />
      {false && <header style={{ background: C.primary, padding: '0 clamp(12px, 3vw, 24px)', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <svg width="36" height="36" viewBox="0 0 64 64" fill="none">
            <ellipse cx="32" cy="37" rx="13" ry="11" fill="none" stroke="#C9A84C" strokeWidth="1.5"/>
            <path d="M22 37 Q22 25 32 23 Q42 25 42 37" fill="none" stroke="#C9A84C" strokeWidth="1.5"/>
            <rect x="28" y="21" width="8" height="4" rx="1.5" fill="none" stroke="#C9A84C" strokeWidth="1.5"/>
            <path d="M32 14 Q36 10 40 12 Q38 18 32 20 Q26 18 24 12 Q28 10 32 14Z" fill="#C9A84C"/>
            <circle cx="32" cy="32" r="2.8" fill="#EF5350"/>
            <circle cx="26.5" cy="34" r="2" fill="#FF7043"/>
            <circle cx="37.5" cy="34" r="2" fill="#42A5F5"/>
            <circle cx="32" cy="38.5" r="1.8" fill="#AB47BC"/>
          </svg>
          <div>
            <div style={{ fontFamily: cinzel.style.fontFamily, color: C.gold, fontSize: 'clamp(12px, 2.5vw, 15px)', fontWeight: 600, letterSpacing: 3 }}>{"İPEK YOLU ŞİFACISI"}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>{"Mizaç Analiz Formu"}</div>
          </div>
        </div>
        <button onClick={() => router.push('/')} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: 8, padding: '7px 16px', fontSize: 13, cursor: 'pointer' }}>
          {"Ana Sayfa"}
        </button>
      </header>}

      {/* TOAST */}
      {toast && (
        <div style={{
          position: 'fixed' as const, top: 20, right: 20, zIndex: 9999,
          background: toast.tip === 'hata' ? '#FCEBEB' : '#EAF3DE',
          border: `1px solid ${toast.tip === 'hata' ? '#F7C1C1' : '#C0DD97'}`,
          color: toast.tip === 'hata' ? '#A32D2D' : '#3B6D11',
          padding: '14px 20px', borderRadius: 10, fontSize: 13,
          maxWidth: 360, boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
          display: 'flex', alignItems: 'center', gap: 10
        }}>
          <span>{toast.tip === 'hata' ? '\u26A0' : '\u2713'}</span>
          <span>{toast.mesaj}</span>
          <button onClick={() => setToast(null)}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'inherit', padding: '0 4px' }}>
            {'\u2715'}
          </button>
        </div>
      )}

      {/* PROGRESS BAR */}
      <div style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: '12px clamp(12px, 3vw, 24px)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ fontSize: 13, color: C.secondary, fontFamily: cinzel.style.fontFamily, letterSpacing: 1 }}>
              {"Adım"} {adim} / 8
            </div>
            <div style={{ fontSize: 12, color: '#999' }}>{"Otomatik kaydedilir"}</div>
          </div>
          <div style={{ height: 4, background: C.border, borderRadius: 2, marginBottom: 12 }}>
            <div style={{ height: 4, background: C.gold, borderRadius: 2, width: `${(adim / 8) * 100}%`, transition: 'width 0.3s ease' }} />
          </div>
          <div className="analiz-step-nav" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' as const }}>
            {[
              '1 Kisisel', '2 Cevre', '3 Nabiz', '4 Dil/Yuz',
              '5 Vucut', '6 Lab', '7 Fitri', '8 Sikayet'
            ].map((label, i) => {
              const stepNum = i + 1
              const isDone = stepNum < adim
              const isActive = stepNum === adim
              return (
                <button
                  key={stepNum}
                  onClick={() => setAdim(stepNum)}
                  style={{
                    padding: '4px 12px',
                    borderRadius: 20,
                    border: `1px solid ${isActive ? C.gold : isDone ? C.primary : C.border}`,
                    background: isActive ? C.gold : isDone ? C.primary : C.white,
                    color: isActive ? C.primary : isDone ? C.gold : '#999',
                    fontSize: 11,
                    fontWeight: isActive ? 600 : 400,
                    cursor: 'pointer',
                    opacity: stepNum > adim + 1 ? 0.5 : 1,
                  }}
                >
                  {isDone ? '\u2713 ' : ''}{label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: 'clamp(16px, 4vw, 32px) clamp(12px, 3vw, 20px) 80px' }}>

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontFamily: cinzel.style.fontFamily, fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 500, color: C.primary, marginBottom: 8 }}>{"Mizaç Analiz Formu"}</h1>
          <p style={{ fontSize: 'clamp(14px, 2.5vw, 16px)', color: C.secondary, fontStyle: 'italic', maxWidth: 560, margin: '0 auto' }}>{"Bilgileriniz danışmanınıza iletilecektir. Formu eksiksiz doldurun."}</p>
        </div>

        <div style={{ background: '#FFF8E7', border: `1px solid ${C.gold}`, borderRadius: 12, padding: '12px 18px', marginBottom: 24, fontSize: 13, color: C.secondary }}>
          {"Tüm bilgiler KVKK kapsamında korunur. Üçüncü taraflarla paylaşılmaz."}
        </div>

        {/* === ADIM 1: KİŞİSEL === */}
        <div style={{ display: adim === 1 ? 'block' : 'none' }}>
        <div style={s.sectionTitle}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
          {"Kişisel Bilgiler"}
        </div>
        <div style={s.card}>
          <div className="analiz-grid2" style={s.grid2}>
            <div>
              <label style={s.label}>{"Ad Soyad *"}</label>
              <input style={s.input} value={form.ad_soyad} onChange={e => set('ad_soyad', e.target.value)} placeholder="Adınız Soyadınız" />
            </div>
            <div>
              <label style={s.label}>{"Telefon * (WhatsApp)"}</label>
              <input style={s.input} value={form.telefon} onChange={e => set('telefon', e.target.value)} placeholder="+90 555 000 0000" />
            </div>
          </div>
          <div className="analiz-grid3" style={{ ...s.grid3, marginTop: 10 }}>
            <div>
              <label style={s.label}>{"Yaş Grubu"}</label>
              <select style={s.select} value={form.age_group} onChange={e => set('age_group', e.target.value)}>
                <option value="">{"Seçin"}</option>
                <option value="cocuk_0_7">{"Çocuk (0-7 yaş)"}</option>
                <option value="cocuk_7_14">{"Çocuk (7-14 yaş)"}</option>
                <option value="genc_14_25">{"Genç (14-25 yaş)"}</option>
                <option value="yetiskin_25_50">{"Yetişkin (25-50 yaş)"}</option>
                <option value="orta_50_65">{"Orta yaş (50-65 yaş)"}</option>
                <option value="yasli_65+">{"Yaşlı (65+ yaş)"}</option>
              </select>
            </div>
            <div>
              <label style={s.label}>{"Cinsiyet"}</label>
              <select style={s.select} value={form.gender} onChange={e => set('gender', e.target.value)}>
                <option value="">{"Seçin"}</option>
                <option value="erkek">{"Erkek"}</option>
                <option value="kadin">{"Kadın"}</option>
              </select>
            </div>
            <div>
              <label style={s.label}>{"Hamilelik"}</label>
              <select style={s.select} value={form.pregnancy} onChange={e => set('pregnancy', e.target.value)}>
                <option value="hayir">{"Hayır / Geçerli Değil"}</option>
                <option value="hamile_1">{"Hamile — 1. trimester"}</option>
                <option value="hamile_2">{"Hamile — 2. trimester"}</option>
                <option value="hamile_3">{"Hamile — 3. trimester"}</option>
                <option value="emziren">{"Emziren"}</option>
              </select>
            </div>
          </div>
          <div className="analiz-grid2" style={{ ...s.grid2, marginTop: 10 }}>
            <div>
              <label style={s.label}>{"Şikayet Süresi"}</label>
              <select style={s.select} value={form.sikayet_suresi} onChange={e => set('sikayet_suresi', e.target.value)}>
                <option value="">{"Seçin"}</option>
                <option value="akut_3gun">{"Akut — 3 gün altı"}</option>
                <option value="akut_2hafta">{"Akut — 2 hafta altı"}</option>
                <option value="subakut_3ay">{"Subakut — 3 ay altı"}</option>
                <option value="kronik_6ay">{"Kronik — 6 ay altı"}</option>
                <option value="kronik_uzun">{"Kronik — 1 yıl üstü"}</option>
              </select>
            </div>
            <div>
              <label style={s.label}>{"Kronik Hastalık"}</label>
              <select style={s.select} value={form.chronic} onChange={e => set('chronic', e.target.value)}>
                <option value="yok">{"Yok"}</option>
                <option value="diyabet">{"Diyabet"}</option>
                <option value="hipertansiyon">{"Hipertansiyon"}</option>
                <option value="kalp">{"Kalp hastalığı"}</option>
                <option value="bobrek">{"Böbrek hastalığı"}</option>
                <option value="karaciger">{"Karaciğer hastalığı"}</option>
                <option value="diger">{"Diğer"}</option>
              </select>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
          <button onClick={() => {
            if (!form.ad_soyad?.trim() || !form.telefon?.trim()) { gosterToast('Ad Soyad ve Telefon alanlari zorunludur.'); return }
            setAdim(2)
          }} style={{ padding: '10px 28px', background: C.primary, border: 'none', borderRadius: 8, color: C.gold, cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: cinzel.style.fontFamily }}>{"İleri \u2192"}</button>
        </div>
        </div>

        {/* === ADIM 2: ÇEVRE === */}
        <div style={{ display: adim === 2 ? 'block' : 'none' }}>
        <div style={s.sectionTitle}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/></svg>
          {"Mevsim ve Çevre"}
        </div>
        <div style={s.card}>
          <div style={s.tip}>{"el-Kânûn: Her mevsimin kendine özgü hılt baskınlığı vardır. İlkbahar=dem, Yaz=safra, Sonbahar=kara safra, Kış=balgam."}</div>
          <div className="analiz-grid2" style={s.grid2}>
            <div>
              <label style={s.label}>{"Mevcut Mevsim"}</label>
              <select style={s.select} value={form.season} onChange={e => set('season', e.target.value)}>
                <option value="">{"Seçin"}</option>
                <option value="ilkbahar">{"İlkbahar"}</option>
                <option value="yaz">{"Yaz"}</option>
                <option value="sonbahar">{"Sonbahar"}</option>
                <option value="kis">{"Kış"}</option>
              </select>
            </div>
            <div>
              <label style={s.label}>{"Yaşadığı İklim"}</label>
              <select style={s.select} value={form.climate} onChange={e => set('climate', e.target.value)}>
                <option value="">{"Seçin"}</option>
                <option value="sicak_kuru">{"Sıcak-Kuru (çöl, karasal)"}</option>
                <option value="sicak_nemli">{"Sıcak-Nemli (tropikal, kıyı)"}</option>
                <option value="iliman">{"Ilıman (Akdeniz)"}</option>
                <option value="soguk_kuru">{"Soğuk-Kuru (karasal kış)"}</option>
                <option value="soguk_nemli">{"Soğuk-Nemli (kuzey, yağışlı)"}</option>
              </select>
            </div>
            <div>
              <label style={s.label}>{"Sıcaklık Algısı"}</label>
              <select style={s.select} value={form.temp_feel} onChange={e => set('temp_feel', e.target.value)}>
                <option value="">{"Seçin"}</option>
                <option value="cok_soguk">{"Çok soğuk hissediyorum"}</option>
                <option value="soguk">{"Soğuk hissediyorum"}</option>
                <option value="dengeli">{"Dengeli"}</option>
                <option value="sicak">{"Sıcak hissediyorum"}</option>
                <option value="cok_sicak">{"Çok sıcak hissediyorum"}</option>
              </select>
            </div>
            <div>
              <label style={s.label}>{"Şehir / Ülke"}</label>
              <input style={s.input} value={form.location} onChange={e => set('location', e.target.value)} placeholder="İstanbul, Türkiye" />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
          <button onClick={() => setAdim(1)} style={{ padding: '10px 24px', border: `1px solid ${C.border}`, borderRadius: 8, background: C.white, color: C.secondary, cursor: 'pointer', fontSize: 13 }}>{"\u2190 Geri"}</button>
          <button onClick={() => setAdim(3)} style={{ padding: '10px 28px', background: C.primary, border: 'none', borderRadius: 8, color: C.gold, cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: cinzel.style.fontFamily }}>{"İleri \u2192"}</button>
        </div>
        </div>

        {/* === ADIM 3: NABIZ === */}
        <div style={{ display: adim === 3 ? 'block' : 'none' }}>
        <div style={s.sectionTitle}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          {"Nabız Gözlemi — el-Kânûn (9 Sıfat)"}
        </div>

        {/* Nabiz Toggle */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 16, borderRadius: 10, overflow: 'hidden', border: `1px solid ${C.primary}` }}>
          <button onClick={() => setNabizModu('kamera')}
            style={{ flex: 1, padding: '10px 16px', border: 'none', fontFamily: cinzel.style.fontFamily, fontSize: 11, fontWeight: 600, letterSpacing: 1, cursor: 'pointer', background: nabizModu === 'kamera' ? C.primary : C.white, color: nabizModu === 'kamera' ? C.gold : C.primary }}>
            {"Kamera PPG"}
          </button>
          <button onClick={() => setNabizModu('manuel')}
            style={{ flex: 1, padding: '10px 16px', border: 'none', borderLeft: `1px solid ${C.primary}`, fontFamily: cinzel.style.fontFamily, fontSize: 11, fontWeight: 600, letterSpacing: 1, cursor: 'pointer', background: nabizModu === 'manuel' ? C.primary : C.white, color: nabizModu === 'manuel' ? C.gold : C.primary }}>
            {"Manuel Gir"}
          </button>
        </div>

        {/* PPG Nabiz Olcumu */}
        {nabizModu === 'kamera' && (
          <div style={{ marginBottom: 16 }}>
            <PPGNabiz onSonuc={(sonuc) => {
              set('nb_hiz_sinif', sonuc.sifatlar.hiz)
              set('nb_buyukluk', sonuc.sifatlar.buyukluk)
              set('nb_kuvvet', sonuc.sifatlar.kuvvet)
              set('nb_dolgunluk', sonuc.sifatlar.dolgunluk)
              set('nb_sertlik', sonuc.sifatlar.sertlik)
              set('nb_ritim', sonuc.sifatlar.ritim)
              set('nb_esitlik', sonuc.sifatlar.esitlik)
              set('nb_sureklitik', sonuc.sifatlar.sureklitik)
              set('ppg_bpm', String(sonuc.bpm))
              gosterToast(`${sonuc.bpm} BPM — 8/8 sifat otomatik dolduruldu. Isi sifatini manuel girin.`, 'basari')
              setNabizModu('manuel')
            }} />
          </div>
        )}

        {nabizModu === 'kamera' && <>
        {/* Kamera Tipi Secimi */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(160px, 100%), 1fr))', gap: 10, marginBottom: 16 }}>
          {[
            { value: 'bilgisayar', label: 'Bilgisayar Kamerası', icon: '\uD83D\uDCBB' },
            { value: 'telefon', label: 'Telefon Kamerası', icon: '\uD83D\uDCF1' },
            { value: 'iphone_sureklitik', label: 'iPhone Süreklilik', icon: '\uD83D\uDD17' },
          ].map(opt => {
            const active = form.kamera_tipi === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  set('kamera_tipi', opt.value)
                  if (opt.value === 'iphone_sureklitik') kameralariListele()
                }}
                style={{
                  padding: '14px 12px',
                  borderRadius: 10,
                  border: `2px solid ${active ? C.gold : C.border}`,
                  background: active ? '#FFF8E7' : C.white,
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ fontSize: 24, marginBottom: 4 }}>{opt.icon}</div>
                <div style={{ fontSize: 11, fontWeight: active ? 600 : 400, color: active ? C.primary : C.secondary }}>{opt.label}</div>
              </button>
            )
          })}
        </div>

        {/* Kamera secim listesi */}
        {kameralar.length > 0 && form.kamera_tipi === 'iphone_sureklitik' && (
          <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, padding: 10, marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: C.secondary, marginBottom: 6 }}>{"Kamera seçin:"}</div>
            {kameralar.map((d, i) => (
              <button key={d.deviceId} onClick={() => setSeciliKamera(d.deviceId)}
                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px', border: seciliKamera === d.deviceId ? `1px solid ${C.gold}` : 'none', background: seciliKamera === d.deviceId ? '#FFF8E7' : i % 2 === 0 ? C.surface : C.white, cursor: 'pointer', fontSize: 12, color: C.dark, borderRadius: 4, marginBottom: 2 }}>
                {d.label || `Kamera ${i + 1}`}
              </button>
            ))}
          </div>
        )}

        {/* PPG Video Alani */}
        <div style={{ background: '#111', borderRadius: 14, padding: 20, marginBottom: 20, textAlign: 'center', position: 'relative' }}>
          <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 10, color: C.gold, letterSpacing: 2, marginBottom: 12 }}>
            {"KAMERA İLE NABIZ ÖLÇÜMÜ (PPG)"}
          </div>

          {/* Video + parmak rehber */}
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: 12 }}>
            <video ref={ppgVideoRef} playsInline style={{ width: '100%', maxWidth: 280, borderRadius: 10, display: ppgAktif ? 'block' : 'none' }} />
            <canvas ref={ppgCanvasRef} style={{ display: 'none' }} />
            {!ppgAktif && (
              <div style={{ width: 120, height: 120, margin: '0 auto', position: 'relative' }}>
                {/* Double ring guide */}
                <div style={{ width: 120, height: 120, borderRadius: '50%', border: `3px solid ${C.gold}`, position: 'absolute', top: 0, left: 0 }} />
                <div style={{ width: 90, height: 90, borderRadius: '50%', border: `2px dashed rgba(201,168,76,0.5)`, position: 'absolute', top: 15, left: 15 }} />
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: 11, color: 'rgba(255,255,255,0.6)', textAlign: 'center', lineHeight: 1.3 }}>
                  {"Parmağınızı buraya tutun"}
                </div>
              </div>
            )}
          </div>

          {/* BPM display */}
          {ppgBpm !== null && (
            <div style={{ fontSize: 36, fontWeight: 700, color: '#EF5350', fontFamily: cinzel.style.fontFamily, marginBottom: 4 }}>
              {ppgBpm} <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>BPM</span>
            </div>
          )}

          {/* Waveform SVG */}
          {ppgSinyal.length > 5 && (
            <svg viewBox="0 0 200 60" style={{ width: '100%', maxWidth: 300, height: 50, margin: '8px auto', display: 'block' }}>
              <polyline
                fill="none"
                stroke={C.gold}
                strokeWidth="1.5"
                points={ppgSinyal.map((v, i) => {
                  const x = (i / ppgSinyal.length) * 200
                  const minV = Math.min(...ppgSinyal)
                  const maxV = Math.max(...ppgSinyal)
                  const range = maxV - minV || 1
                  const y = 55 - ((v - minV) / range) * 50
                  return `${x},${y}`
                }).join(' ')}
              />
            </svg>
          )}

          {/* Signal quality bar */}
          {ppgAktif && (
            <div style={{ margin: '8px auto', maxWidth: 200 }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginBottom: 3 }}>{"Sinyal Kalitesi"}</div>
              <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3 }}>
                <div style={{ height: 6, borderRadius: 3, width: `${ppgKalite}%`, background: ppgKalite > 60 ? '#4CAF50' : ppgKalite > 30 ? '#FFC107' : '#F44336', transition: 'width 0.3s' }} />
              </div>
            </div>
          )}

          {/* Status */}
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 8, marginBottom: 12 }}>{ppgStatus}</div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' as const }}>
            {!ppgAktif ? (
              <button onClick={ppgBaslat}
                style={{ background: C.gold, color: C.primary, border: 'none', borderRadius: 8, padding: '10px 20px', fontFamily: cinzel.style.fontFamily, fontSize: 11, letterSpacing: 1, cursor: 'pointer', fontWeight: 600 }}>
                {"Kamerayı Başlat"}
              </button>
            ) : (
              <button onClick={ppgDurdur}
                style={{ background: '#C62828', color: 'white', border: 'none', borderRadius: 8, padding: '10px 20px', fontFamily: cinzel.style.fontFamily, fontSize: 11, letterSpacing: 1, cursor: 'pointer' }}>
                {"Durdur"}
              </button>
            )}
            {!ppgAktif && (
              <button onClick={kameralariListele}
                style={{ background: 'transparent', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 8, padding: '10px 16px', fontFamily: cinzel.style.fontFamily, fontSize: 11, letterSpacing: 1, cursor: 'pointer' }}>
                {"Kamera Seç"}
              </button>
            )}
          </div>
        </div>

        </>}

        <div style={s.tip}>{"İbn Sînâ el-Kânûn: Nabız mizacın doğrudan aynasıdır. 9 sıfatın tümü değerlendirilmelidir."}</div>

        {/* 9 Sifat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(140px, 100%), 1fr))', gap: 10 }}>
          {[
            { key: 'nb_buyukluk', label: 'Büyüklük', ar: '\u0627\u0644\u0643\u0628\u0631 \u0648\u0627\u0644\u0635\u063A\u0631', note: 'Büyük\u2192kan fazlası; Küçük\u2192balgam', opts: [['orta','Orta'],['buyuk','Büyük'],['kucuk','Küçük']] },
            { key: 'nb_kuvvet', label: 'Kuvvet', ar: '\u0627\u0644\u0642\u0648\u0629 \u0648\u0627\u0644\u0636\u0639\u0641', note: 'Kuvvetli\u2192güçlü ruh; Zayıf\u2192yorgunluk', opts: [['orta','Orta'],['kuvvetli','Kuvvetli'],['zayif','Zayıf']] },
            { key: 'nb_hiz_sinif', label: 'Hız', ar: '\u0627\u0644\u0633\u0631\u0639\u0629 \u0648\u0627\u0644\u0628\u0637\u0621', note: 'Hızlı >90; Yavaş <60', opts: [['orta','Orta'],['hizli','Hızlı'],['yavas','Yavaş']] },
            { key: 'nb_dolgunluk', label: 'Dolgunluk', ar: '\u0627\u0644\u0627\u0645\u062A\u0644\u0627\u0621 \u0648\u0627\u0644\u062E\u0648\u0627\u0621', note: 'Dolu\u2192dem fazlası; Boş\u2192kansızlık', opts: [['orta','Orta'],['dolu','Dolu'],['bos','Boş']] },
            { key: 'nb_sertlik', label: 'Sertlik', ar: '\u0627\u0644\u0635\u0644\u0627\u0628\u0629 \u0648\u0627\u0644\u0644\u064A\u0646', note: 'Sert\u2192ateş; Yumuşak\u2192balgam', opts: [['orta','Orta'],['sert','Sert'],['yumusak','Yumuşak']] },
            { key: 'nb_isi', label: 'Isı', ar: '\u0627\u0644\u062D\u0631\u0627\u0631\u0629 \u0648\u0627\u0644\u0628\u0631\u0648\u062F\u0629', note: 'Sıcak\u2192safravî; Soğuk\u2192balgamî', opts: [['ilik','Ilık'],['sicak','Sıcak'],['soguk','Soğuk']] },
            { key: 'nb_ritim', label: 'Ritim', ar: '\u0627\u0644\u0627\u0646\u062A\u0638\u0627\u0645', note: 'Düzensiz\u2192kalp güçsüzlüğü', opts: [['muntazam','Muntazam'],['hafif_duzensiz','Hafif düzensiz'],['duzensiz','Düzensiz']] },
            { key: 'nb_esitlik', label: 'Eşitlik', ar: '\u0627\u0644\u062A\u0633\u0627\u0648\u064A', note: 'Eşitsiz\u2192mizaç bozukluğu', opts: [['esit','Eşit'],['hafif_esitsiz','Hafif eşitsiz'],['esitsiz','Eşitsiz']] },
            { key: 'nb_sureklitik', label: 'Süreklilik', ar: '\u0627\u0644\u0627\u062A\u0635\u0627\u0644 \u0648\u0627\u0644\u0627\u0646\u0642\u0637\u0627\u0639', note: 'Kesik\u2192kuvvet tükenmesi', opts: [['surekli','Sürekli'],['hafif_kesik','Hafif kesik'],['kesik','Kesik']] },
          ].map(f => (
            <div key={f.key} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 12px' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: C.primary, marginBottom: 2 }}>{f.label}</div>
              <div style={{ fontSize: 11, color: '#999', fontFamily: 'serif', marginBottom: 4 }}>{f.ar}</div>
              <div style={{ fontSize: 10, color: C.secondary, fontStyle: 'italic', marginBottom: 8, lineHeight: 1.3 }}>{"İbn Sînâ: "}{f.note}</div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' as const }}>
                {f.opts.map(([v, l]) => renderNabizButon(f.key, v, l))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
          <button onClick={() => setAdim(2)} style={{ padding: '10px 24px', border: `1px solid ${C.border}`, borderRadius: 8, background: C.white, color: C.secondary, cursor: 'pointer', fontSize: 13 }}>{"\u2190 Geri"}</button>
          <button onClick={() => setAdim(4)} style={{ padding: '10px 28px', background: C.primary, border: 'none', borderRadius: 8, color: C.gold, cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: cinzel.style.fontFamily }}>{"İleri \u2192"}</button>
        </div>
        </div>

        {/* === ADIM 4: DİL/YÜZ === */}
        <div style={{ display: adim === 4 ? 'block' : 'none' }}>
        <div style={s.sectionTitle}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
          {"Dil ve Yüz Gözlemi"}
        </div>

        {/* DY Toggle */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 16, borderRadius: 10, overflow: 'hidden', border: `1px solid ${C.primary}` }}>
          <button onClick={() => setDyModu('kamera')}
            style={{ flex: 1, padding: '10px 16px', border: 'none', fontFamily: cinzel.style.fontFamily, fontSize: 11, fontWeight: 600, letterSpacing: 1, cursor: 'pointer', background: dyModu === 'kamera' ? C.primary : C.white, color: dyModu === 'kamera' ? C.gold : C.primary }}>
            {"Kamera ile Cek"}
          </button>
          <button onClick={() => setDyModu('manuel')}
            style={{ flex: 1, padding: '10px 16px', border: 'none', borderLeft: `1px solid ${C.primary}`, fontFamily: cinzel.style.fontFamily, fontSize: 11, fontWeight: 600, letterSpacing: 1, cursor: 'pointer', background: dyModu === 'manuel' ? C.primary : C.white, color: dyModu === 'manuel' ? C.gold : C.primary }}>
            {"Manuel Gir"}
          </button>
        </div>

        {/* Dil/Yuz Kamera Analizi */}
        {dyModu === 'kamera' && (
          <div style={{ marginBottom: 16 }}>
            <DilYuzKamera onSonuc={(sonuc) => {
              if (sonuc.dil) {
                if (sonuc.dil.renk) set('dil_renk', sonuc.dil.renk)
                if (sonuc.dil.kaplama) set('dil_kaplama', sonuc.dil.kaplama)
                if (sonuc.dil.nem) set('dil_nem', sonuc.dil.nem)
                if (sonuc.dil.sekil) set('dil_sekil', sonuc.dil.sekil)
              }
              if (sonuc.yuz) {
                if (sonuc.yuz.ten) set('yuz_ten', sonuc.yuz.ten)
                if (sonuc.yuz.sekil) set('yuz_sekil', sonuc.yuz.sekil)
                if (sonuc.yuz.cilt) set('yuz_cilt', sonuc.yuz.cilt)
                if (sonuc.yuz.gozalti) set('yuz_gozalti', sonuc.yuz.gozalti)
              }
              gosterToast('Dil/Yuz analizi tamamlandi — form alanlari dolduruldu', 'basari')
              setDyModu('manuel')
            }} />
          </div>
        )}

        <div style={s.tip}>{"İbn Sînâ: Dil ve yüz rengi, mizacın görünür aynasıdır."}</div>

        {/* Tab system */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 0 }}>
          {(['dil', 'yuz'] as const).map(tab => {
            const active = fotoTab === tab
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setFotoTab(tab)}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  background: active ? '#111' : C.surface,
                  color: active ? C.gold : C.secondary,
                  border: `1px solid ${active ? '#111' : C.border}`,
                  borderBottom: active ? 'none' : `1px solid ${C.border}`,
                  borderRadius: active ? '10px 10px 0 0' : '10px 10px 0 0',
                  cursor: 'pointer',
                  fontFamily: cinzel.style.fontFamily,
                  fontSize: 11,
                  letterSpacing: 1,
                  fontWeight: active ? 600 : 400,
                }}
              >
                {tab === 'dil' ? 'Dil Fotoğrafı' : 'Yüz Fotoğrafı'}
              </button>
            )
          })}
        </div>

        {/* Camera preview area */}
        <div style={{ background: '#111', borderRadius: '0 0 14px 14px', padding: 20, marginBottom: 16, textAlign: 'center' }}>
          {/* Oval guide */}
          <div style={{ position: 'relative', width: fotoTab === 'dil' ? 200 : 140, height: fotoTab === 'dil' ? 120 : 180, margin: '0 auto 12px', border: `2px dashed ${C.gold}`, borderRadius: '50%' }}>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: 11, color: 'rgba(255,255,255,0.5)', textAlign: 'center' }}>
              {fotoTab === 'dil' ? 'Dilinizi gösterin' : 'Yüzünüzü çerçeveye alın'}
            </div>
          </div>

          {/* Foto preview */}
          {fotoTab === 'dil' && dilFoto && (
            <div style={{ marginBottom: 12 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={dilFoto} alt="Dil" style={{ width: 120, height: 90, objectFit: 'cover', borderRadius: 8, border: `2px solid ${C.gold}` }} />
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>{"Dil fotoğrafı alındı"}</div>
            </div>
          )}
          {fotoTab === 'yuz' && yuzFoto && (
            <div style={{ marginBottom: 12 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={yuzFoto} alt="Yüz" style={{ width: 100, height: 120, objectFit: 'cover', borderRadius: 8, border: `2px solid ${C.gold}` }} />
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>{"Yüz fotoğrafı alındı"}</div>
            </div>
          )}

          <button
            onClick={() => fotoCek(fotoTab)}
            style={{ background: C.gold, color: C.primary, border: 'none', borderRadius: 8, padding: '10px 24px', fontFamily: cinzel.style.fontFamily, fontSize: 11, letterSpacing: 1, cursor: 'pointer', fontWeight: 600 }}
          >
            {"Fotoğraf Çek"}
          </button>
        </div>

        <div style={s.tip}>{"İbn Sînâ: Dil ve yüz rengi mizacın görünür aynasıdır."}</div>

        {/* Ayırıcı */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1, height: 1, background: C.border }} />
          <span style={{ fontSize: 11, color: '#999', fontStyle: 'italic' }}>{"veya manuel olarak girin"}</span>
          <div style={{ flex: 1, height: 1, background: C.border }} />
        </div>

        <div style={s.card}>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.primary, marginBottom: 10, letterSpacing: 1 }}>{"DİL MUAYENESİ"}</div>
          <div className="analiz-grid2" style={s.grid2}>
            {[
              { key: 'dil_renk', label: 'Renk', note: 'Kırmızı\u2192safra; Soluk\u2192balgam', opts: [['','Seçin'],['kirmizi','Kırmızı/Koyu pembe'],['pembe_normal','Pembe (normal)'],['soluk_beyaz','Soluk/Beyaz'],['sari','Sarı/Sarımsı'],['mor_koyu','Mor/Koyu']] },
              { key: 'dil_kaplama', label: 'Kaplama', note: 'Kalın beyaz\u2192balgam; Sarı\u2192safra', opts: [['','Seçin'],['ince_seffaf','İnce/Şeffaf'],['kalin_beyaz','Kalın Beyaz'],['sari_yesil','Sarı-Yeşil'],['gri_koyu','Gri/Koyu'],['kaplama_yok','Kaplama yok']] },
              { key: 'dil_nem', label: 'Nem Durumu', note: 'Kuru\u2192sıcak mizaç; Islak\u2192soğuk', opts: [['','Seçin'],['islak_nemli','Islak/Nemli'],['normal','Normal'],['kuru','Kuru'],['catlak_kuru','Çatlak/Çok kuru']] },
              { key: 'dil_sekil', label: 'Büyüklük/Şekil', note: 'Şişkin\u2192nem fazlası; İnce\u2192kuruluk', opts: [['','Seçin'],['siskin_kalin','Şişkin/Kalın'],['normal','Normal'],['ince_kucuk','İnce/Küçük'],['kenar_iz','Kenar dişi izi']] },
            ].map(f => (
              <div key={f.key}>
                <label style={s.label}>{f.label}</label>
                <div style={{ fontSize: 10, color: '#999', fontStyle: 'italic', marginBottom: 4 }}>{f.note}</div>
                <select style={s.select} value={(form as Record<string, string | boolean>)[f.key] as string} onChange={e => set(f.key, e.target.value)}>
                  {f.opts.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            ))}
          </div>

          <div style={{ fontSize: 12, fontWeight: 600, color: C.primary, margin: '16px 0 10px', letterSpacing: 1 }}>{"YÜZ MUAYENESİ"}</div>
          <div className="analiz-grid2" style={s.grid2}>
            {[
              { key: 'yuz_ten', label: 'Ten Rengi', note: 'Kırmızı\u2192demevî; Soluk\u2192balgamî', opts: [['','Seçin'],['kirmizi_pembe','Kırmızı/Pembe'],['normal_bugday','Normal/Buğday'],['soluk_beyaz','Soluk/Beyaz'],['sari_zeytin','Sarı/Zeytin'],['esmer_koyu','Esmer/Koyu']] },
              { key: 'yuz_sekil', label: 'Yüz Şekli', note: 'Yuvarlak\u2192demevî/balgamî; Uzun\u2192sevdavî', opts: [['','Seçin'],['yuvarlak_dolgun','Yuvarlak/Dolgun'],['oval_orta','Oval/Orta'],['uzun_koseli','Uzun/Köşeli'],['kucuk_sivri','Küçük/Sivri']] },
              { key: 'yuz_cilt', label: 'Cilt Durumu', note: 'Yağlı\u2192sıcak; Kuru\u2192soğuk', opts: [['','Seçin'],['yagly_parlak','Yağlı/Parlak'],['normal','Normal'],['kuru_mat','Kuru/Mat'],['kuru_pul','Kuru/Pullu']] },
              { key: 'yuz_gozalti', label: 'Göz Altı', note: 'Mor\u2192kan eksikliği; Şiş\u2192nem', opts: [['','Seçin'],['normal','Normal'],['mor_halka','Mor/Koyu halka'],['sislik_torba','Şişlik/Torba'],['kizarik','Kızarık']] },
            ].map(f => (
              <div key={f.key}>
                <label style={s.label}>{f.label}</label>
                <div style={{ fontSize: 10, color: '#999', fontStyle: 'italic', marginBottom: 4 }}>{f.note}</div>
                <select style={s.select} value={(form as Record<string, string | boolean>)[f.key] as string} onChange={e => set(f.key, e.target.value)}>
                  {f.opts.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
          <button onClick={() => setAdim(3)} style={{ padding: '10px 24px', border: `1px solid ${C.border}`, borderRadius: 8, background: C.white, color: C.secondary, cursor: 'pointer', fontSize: 13 }}>{"\u2190 Geri"}</button>
          <button onClick={() => setAdim(5)} style={{ padding: '10px 28px', background: C.primary, border: 'none', borderRadius: 8, color: C.gold, cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: cinzel.style.fontFamily }}>{"İleri \u2192"}</button>
        </div>
        </div>

        {/* === ADIM 5: VÜCUT === */}
        <div style={{ display: adim === 5 ? 'block' : 'none' }}>
        <div style={s.sectionTitle}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a10 10 0 100 20A10 10 0 0012 2z"/><path d="M12 8v4l3 3"/></svg>
          {"Vücut Göstergeleri"}
        </div>
        <div style={s.card}>
          <div className="analiz-grid2" style={s.grid2}>
            <div>
              <label style={s.label}>{"Vücut Isısı"}</label>
              <select style={s.select} value={form.body_temp} onChange={e => set('body_temp', e.target.value)}>
                <option value="soguk">{"Soğuk / buz gibi"}</option>
                <option value="serin">{"Serin"}</option>
                <option value="normal">{"Normal"}</option>
                <option value="sicak">{"Sıcak"}</option>
                <option value="cok_sicak">{"Çok sıcak / yanıyor"}</option>
              </select>
            </div>
            <div>
              <label style={s.label}>{"El / Ayak Isısı"}</label>
              <select style={s.select} value={form.extremity_temp} onChange={e => set('extremity_temp', e.target.value)}>
                <option value="soguk">{"Soğuk / buz gibi"}</option>
                <option value="serin">{"Serin"}</option>
                <option value="normal">{"Normal"}</option>
                <option value="sicak">{"Sıcak"}</option>
                <option value="cok_sicak">{"Çok sıcak"}</option>
              </select>
            </div>
            <div>
              <label style={s.label}>{"Cilt Yapısı"}</label>
              <select style={s.select} value={form.skin_type} onChange={e => set('skin_type', e.target.value)}>
                <option value="">{"Seçin"}</option>
                <option value="cok_kuru">{"Çok kuru / çatlak"}</option>
                <option value="kuru">{"Kuru"}</option>
                <option value="normal">{"Normal"}</option>
                <option value="yagly">{"Yağlı"}</option>
                <option value="cok_yagly">{"Çok yağlı"}</option>
              </select>
            </div>
            <div>
              <label style={s.label}>{"Ruh Hali (Hılt)"}</label>
              <select style={s.select} value={form.mood_detail} onChange={e => set('mood_detail', e.target.value)}>
                <option value="">{"Seçin"}</option>
                <option value="ofke_hiddet">{"Öfke / hiddet — Safravî"}</option>
                <option value="korku_vesvese">{"Korku / vesvese — Sevdavî"}</option>
                <option value="huzun_aglama">{"Hüzün / içe kapanma — Sevdavî"}</option>
                <option value="nese_cosku">{"Neşe / coşku — Demevî"}</option>
                <option value="uyusukluk_tembellik">{"Uyuşukluk / tembellik — Balgamî"}</option>
                <option value="karisik">{"Karışık / değişken"}</option>
              </select>
            </div>
          </div>
          <div className="analiz-grid2" style={{ ...s.grid2, marginTop: 10 }}>
            <div>
              <label style={s.label}>{"Boy (cm)"}</label>
              <input style={s.input} type="number" value={form.height} onChange={e => set('height', e.target.value)} placeholder="170" />
            </div>
            <div>
              <label style={s.label}>{"Kilo (kg)"}</label>
              <input style={s.input} type="number" value={form.weight} onChange={e => set('weight', e.target.value)} placeholder="70" />
            </div>
            <div>
              <label style={s.label}>{"Terleme"}</label>
              <select style={s.select} value={form.sweating} onChange={e => set('sweating', e.target.value)}>
                <option value="">{"Seçin"}</option>
                <option value="yok">{"Hiç yok"}</option>
                <option value="az">{"Az"}</option>
                <option value="normal">{"Normal"}</option>
                <option value="fazla">{"Fazla"}</option>
                <option value="gece_fazla">{"Gece özellikle fazla"}</option>
              </select>
            </div>
            <div>
              <label style={s.label}>{"Üşüme / Ateş Hissi"}</label>
              <select style={s.select} value={form.chillhot} onChange={e => set('chillhot', e.target.value)}>
                <option value="">{"Seçin"}</option>
                <option value="cok_usur">{"Çok üşürüm"}</option>
                <option value="usur">{"Üşürüm"}</option>
                <option value="dengeli">{"Dengeli"}</option>
                <option value="sicak_hissederim">{"Sıcak hissederim"}</option>
                <option value="cok_sicak">{"Çok sıcak hissederim"}</option>
              </select>
            </div>
            <div>
              <label style={s.label}>{"Uyku Düzeni"}</label>
              <select style={s.select} value={form.sleep} onChange={e => set('sleep', e.target.value)}>
                <option value="">{"Seçin"}</option>
                <option value="cok_az">{"Çok az (4h altı)"}</option>
                <option value="az">{"Az (5-6h)"}</option>
                <option value="normal">{"Normal (7-8h)"}</option>
                <option value="fazla">{"Fazla (9h üstü)"}</option>
                <option value="duzensiz">{"Düzensiz"}</option>
              </select>
            </div>
            <div>
              <label style={s.label}>{"Sindirim"}</label>
              <select style={s.select} value={form.digestion} onChange={e => set('digestion', e.target.value)}>
                <option value="">{"Seçin"}</option>
                <option value="cok_hizli">{"Çok hızlı / ishal eğilimi"}</option>
                <option value="hizli">{"Hızlı"}</option>
                <option value="normal">{"Normal"}</option>
                <option value="yavas">{"Yavaş / şişkinlik"}</option>
                <option value="cok_yavas">{"Çok yavaş / kabız"}</option>
              </select>
            </div>
            <div>
              <label style={s.label}>{"İştah"}</label>
              <select style={s.select} value={form.appetite} onChange={e => set('appetite', e.target.value)}>
                <option value="">{"Seçin"}</option>
                <option value="istahsiz">{"İştahsız / hiç istemez"}</option>
                <option value="az">{"Az iştah"}</option>
                <option value="normal">{"Normal"}</option>
                <option value="fazla">{"Fazla iştah"}</option>
                <option value="cok_fazla">{"Çok fazla / kontrolsüz"}</option>
              </select>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
          <button onClick={() => setAdim(4)} style={{ padding: '10px 24px', border: `1px solid ${C.border}`, borderRadius: 8, background: C.white, color: C.secondary, cursor: 'pointer', fontSize: 13 }}>{"\u2190 Geri"}</button>
          <button onClick={() => setAdim(6)} style={{ padding: '10px 28px', background: C.primary, border: 'none', borderRadius: 8, color: C.gold, cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: cinzel.style.fontFamily }}>{"İleri \u2192"}</button>
        </div>
        </div>

        {/* === ADIM 6: İDRAR + LAB === */}
        <div style={{ display: adim === 6 ? 'block' : 'none' }}>
        <div style={s.sectionTitle}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z"/><path d="M12 8v8M8 12h8"/></svg>
          {"İdrar ve Dışkı Gözlemi"}
        </div>
        <div style={s.card}>
          <div style={s.tip}>{"el-Kânûn İdrar Fasılları: İdrar rengi ve kıvamı hılt baskınlığının önemli göstergesidir."}</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.primary, marginBottom: 10, letterSpacing: 1 }}>{"İDRAR"}</div>
          <div className="analiz-grid3" style={s.grid3}>
            {[
              { key: 'urine_color', label: 'Renk', opts: [['','Seçin'],['renksiz','Renksiz / çok açık'],['acik_sari','Açık sarı'],['koyu_sari','Koyu sarı'],['amber','Amber / turuncu'],['kirmizimsi','Kırmızımsı'],['kahverengi','Kahverengi']] },
              { key: 'urine_amount', label: 'Miktar', opts: [['','Seçin'],['cok_az','Çok az'],['az','Az'],['normal','Normal'],['fazla','Fazla'],['cok_fazla','Çok fazla']] },
              { key: 'urine_clarity', label: 'Kıvam / Berraklık', opts: [['','Seçin'],['berrak','Berrak / saydam'],['hafif_bulanik','Hafif bulanık'],['bulanik','Bulanık'],['tortu_var','Tortu var']] },
              { key: 'urine_foam', label: 'Köpük', opts: [['yok','Yok'],['az','Az köpük'],['fazla','Fazla / kalıcı köpük']] },
              { key: 'urine_sediment', label: 'Tortu', opts: [['yok','Yok'],['beyaz','Beyaz / krem'],['kirmizi','Kırmızı / turuncu'],['koyu','Koyu / siyah']] },
              { key: 'urine_smell', label: 'Koku', opts: [['','Seçin'],['normal','Normal'],['keskin_amonyak','Keskin/Amonyak'],['tatlimsi','Tatlımsı'],['curuk','Çürük'],['kokusuz','Kokusuz']] },
            ].map(f => (
              <div key={f.key}>
                <label style={s.label}>{f.label}</label>
                <select style={s.select} value={(form as Record<string, string | boolean>)[f.key] as string} onChange={e => set(f.key, e.target.value)}>
                  {f.opts.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            ))}
          </div>

          <div style={{ fontSize: 12, fontWeight: 600, color: C.primary, margin: '16px 0 10px', letterSpacing: 1 }}>{"DIŞKI"}</div>
          <div className="analiz-grid2" style={s.grid2}>
            {[
              { key: 'stool_color', label: 'Renk', opts: [['','Seçin'],['sari','Sarı / açık'],['kahve','Kahverengi (normal)'],['koyu','Koyu / siyah'],['yesil','Yeşilimsi'],['acik_kil','Açık / kil rengi']] },
              { key: 'stool_consistency', label: 'Kıvam', opts: [['','Seçin'],['sert_kabiz','Sert / kabız'],['normal','Normal / şekilli'],['yumusak','Yumuşak'],['sivı_ishal','Sıvı / ishal']] },
            ].map(f => (
              <div key={f.key}>
                <label style={s.label}>{f.label}</label>
                <select style={s.select} value={(form as Record<string, string | boolean>)[f.key] as string} onChange={e => set(f.key, e.target.value)}>
                  {f.opts.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            ))}
          </div>
        </div>

        {/* 6b. LAB PANELİ */}
        <div style={s.sectionTitle}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"/></svg>
          {"Kan Tahlili Değerleri (Opsiyonel)"}
        </div>
        <div style={s.card}>
          <div style={s.tip}>{"Tahlil değerleriniz varsa girin. Yoksa atlayabilirsiniz — analiz yine de yapılacaktır."}</div>

          <div style={{ fontSize: 12, fontWeight: 600, color: C.primary, marginBottom: 10, letterSpacing: 1 }}>{"KAN SAYIMI"}</div>
          <div style={s.tip}>{"el-Kânûn Kitab 1 — İbn Sînâ: Hemoglobin kan hıltının miktarını ve kalitesini gösterir; düşüklüğü soğuk-nemli mizaca işaret eder. CRP ve Sedimantasyon vücuttaki yangıyı sayısal olarak ölçer — safra baskısının nesnel kanıtıdır."}</div>
          <div className="analiz-grid3" style={{ ...s.grid3, marginBottom: 12 }}>
            <div>
              <label style={s.label}>{"HGB (g/dL)"}</label>
              <input style={s.input} type="number" step="0.1" value={form.hgb} onChange={e => set('hgb', e.target.value)} placeholder="12-18" />
            </div>
            <div>
              <label style={s.label}>{"Ferritin (\u00B5g/L)"}</label>
              <input style={s.input} type="number" value={form.ferritin} onChange={e => set('ferritin', e.target.value)} placeholder="15-150" />
            </div>
            <div>
              <label style={s.label}>{"CRP (mg/L)"}</label>
              <input style={s.input} type="number" step="0.1" value={form.crp} onChange={e => set('crp', e.target.value)} placeholder="0-5" />
            </div>
            <div>
              <label style={s.label}>{"Hematokrit (%)"}</label>
              <input style={s.input} type="number" step="0.1" value={form.hematokrit} onChange={e => set('hematokrit', e.target.value)} placeholder="36-50" />
            </div>
            <div>
              <label style={s.label}>{"Sedimantasyon (mm/h)"}</label>
              <input style={s.input} type="number" value={form.sedim} onChange={e => set('sedim', e.target.value)} placeholder="0-20" />
            </div>
          </div>

          <div style={{ fontSize: 12, fontWeight: 600, color: C.primary, marginBottom: 10, letterSpacing: 1 }}>{"KARACİĞER & SAFRA"}</div>
          <div style={s.tip}>{"el-Kânûn Kitab 3 — Karaciğer: Sarı safra karaciğerde üretilir, AST/ALT/GGT bu organın sağlığını gösterir. Ürik asit kara safra birikiminin somut ölçütüdür."}</div>
          <div className="analiz-grid3" style={{ ...s.grid3, marginBottom: 12 }}>
            <div>
              <label style={s.label}>{"ALT (U/L)"}</label>
              <input style={s.input} type="number" value={form.alt} onChange={e => set('alt', e.target.value)} placeholder="7-56" />
            </div>
            <div>
              <label style={s.label}>{"AST (U/L)"}</label>
              <input style={s.input} type="number" value={form.ast} onChange={e => set('ast', e.target.value)} placeholder="10-40" />
            </div>
            <div>
              <label style={s.label}>{"GGT (U/L)"}</label>
              <input style={s.input} type="number" value={form.ggt} onChange={e => set('ggt', e.target.value)} placeholder="8-61" />
            </div>
            <div>
              <label style={s.label}>{"Bilirubin Total (mg/dL)"}</label>
              <input style={s.input} type="number" step="0.1" value={form.bilirubin} onChange={e => set('bilirubin', e.target.value)} placeholder="0.2-1.2" />
            </div>
          </div>

          <div style={{ fontSize: 12, fontWeight: 600, color: C.primary, marginBottom: 10, letterSpacing: 1 }}>{"TİROİD — TABİÎ HARARET"}</div>
          <div style={s.tip}>{"el-Kânûn — Tabiî Hararet: TSH yüksekliği \u2192 yavaş metabolizma \u2192 balgam baskınlığı. TSH düşüklüğü \u2192 hızlı metabolizma \u2192 safra baskınlığı."}</div>
          <div className="analiz-grid2" style={{ ...s.grid2, marginBottom: 12 }}>
            <div>
              <label style={s.label}>{"TSH (mIU/L)"}</label>
              <input style={s.input} type="number" step="0.01" value={form.tsh} onChange={e => set('tsh', e.target.value)} placeholder="0.4-4.0" />
            </div>
            <div>
              <label style={s.label}>{"Ürik Asit (mg/dL)"}</label>
              <input style={s.input} type="number" step="0.1" value={form.uric_acid} onChange={e => set('uric_acid', e.target.value)} placeholder="2.4-7.0" />
            </div>
            <div>
              <label style={s.label}>{"Serbest T3 (pg/mL)"}</label>
              <input style={s.input} type="number" step="0.1" value={form.ft3} onChange={e => set('ft3', e.target.value)} placeholder="2.3-4.2" />
            </div>
            <div>
              <label style={s.label}>{"Serbest T4 (ng/dL)"}</label>
              <input style={s.input} type="number" step="0.1" value={form.ft4} onChange={e => set('ft4', e.target.value)} placeholder="0.8-1.8" />
            </div>
          </div>

          <div style={{ fontSize: 12, fontWeight: 600, color: C.primary, marginBottom: 10, letterSpacing: 1 }}>{"ŞEKER METABOLİZMASI"}</div>
          <div style={s.tip}>{"el-Kânûn Kitab 3 — Ziyabitus: İbn Sînâ diyabeti \"böbreklerin iç rutubeti tutamaması\" olarak tanımlar; balgam baskınlığının böbreğe yansımasıdır."}</div>
          <div className="analiz-grid2" style={{ ...s.grid2, marginBottom: 12 }}>
            <div>
              <label style={s.label}>{"Açlık Glukozu (mg/dL)"}</label>
              <input style={s.input} type="number" value={form.glucose} onChange={e => set('glucose', e.target.value)} placeholder="70-100" />
            </div>
            <div>
              <label style={s.label}>{"HbA1c (%)"}</label>
              <input style={s.input} type="number" step="0.1" value={form.hba1c} onChange={e => set('hba1c', e.target.value)} placeholder="4-5.6" />
            </div>
          </div>

          <div style={{ fontSize: 12, fontWeight: 600, color: C.primary, marginBottom: 10, letterSpacing: 1 }}>{"VİTAMİN & MİNERAL"}</div>
          <div style={s.tip}>{"Bahrü\u2019l-Cevâhir — el-Herevî: D vitamini eksikliği soğuk-kuru mizaca, B12 eksikliği kara safra baskısına zemin hazırlar."}</div>
          <div className="analiz-grid2" style={s.grid2}>
            <div>
              <label style={s.label}>{"D Vitamini (ng/mL)"}</label>
              <input style={s.input} type="number" value={form.vit_d} onChange={e => set('vit_d', e.target.value)} placeholder="30-100" />
            </div>
            <div>
              <label style={s.label}>{"B12 (pg/mL)"}</label>
              <input style={s.input} type="number" value={form.b12} onChange={e => set('b12', e.target.value)} placeholder="200-900" />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
          <button onClick={() => setAdim(5)} style={{ padding: '10px 24px', border: `1px solid ${C.border}`, borderRadius: 8, background: C.white, color: C.secondary, cursor: 'pointer', fontSize: 13 }}>{"\u2190 Geri"}</button>
          <button onClick={() => setAdim(7)} style={{ padding: '10px 28px', background: C.primary, border: 'none', borderRadius: 8, color: C.gold, cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: cinzel.style.fontFamily }}>{"İleri \u2192"}</button>
        </div>
        </div>

        {/* === ADIM 7: YAŞAM + FITRİ === */}
        <div style={{ display: adim === 7 ? 'block' : 'none' }}>
        <div style={s.sectionTitle}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          {"Yaşam Tarzı"}
        </div>
        <div style={s.card}>
          <div className="analiz-grid2" style={s.grid2}>
            <div>
              <label style={s.label}>{"Egzersiz Alışkanlığı"}</label>
              <select style={s.select} value={form.exercise_habit} onChange={e => set('exercise_habit', e.target.value)}>
                <option value="">{"Seçin"}</option>
                <option value="hic">{"Hareketsiz / hiç egzersiz yok"}</option>
                <option value="hafif">{"Hafif — yürüyüş, esneme"}</option>
                <option value="orta">{"Orta — düzenli hareket"}</option>
                <option value="yogun">{"Yoğun — spor, antrenman"}</option>
              </select>
            </div>
            <div>
              <label style={s.label}>{"Beslenme Tercihi"}</label>
              <select style={s.select} value={form.diet_type} onChange={e => set('diet_type', e.target.value)}>
                <option value="">{"Seçin"}</option>
                <option value="agirlikli_et">{"Ağırlıklı et / hayvansal"}</option>
                <option value="karma">{"Karma / dengeli"}</option>
                <option value="agirlikli_sebze">{"Ağırlıklı sebze / meyve"}</option>
                <option value="perhiz_kisitli">{"Perhizli / kısıtlı"}</option>
                <option value="duzensiz">{"Düzensiz / atlanan öğünler"}</option>
              </select>
            </div>
          </div>
        </div>

        {/* 7b. FITRİ MİZAÇ */}
        <div style={s.sectionTitle}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          {"Fıtrî Mizaç Tespiti (Doğuştan Yapı)"}
        </div>
        <div style={s.card}>
          <div style={s.tip}>{"Fıtrî mizaç doğuştan gelen sabit yapınızdır. Şu anki şikayetlerinizden bağımsız olarak, genel eğilimlerinizi yanıtlayın."}</div>
          <div className="analiz-grid2" style={s.grid2}>
            {[
              { key: 'fitri_sac', label: 'Saç Yapısı', opts: [['','Seçin'],['ince_duz','İnce/Düz — Balgamî'],['kalin_kivircik','Kalın/Kıvırcık — Safravî/Demevî'],['kuru_kirik','Kuru/Kırık — Sevdavî'],['normal','Normal/Orta']] },
              { key: 'fitri_cilt', label: 'Doğal Cilt Tipi', opts: [['','Seçin'],['cok_kuru','Çok kuru — Sevdavî'],['kuru','Kuru — Sevdavî/Balgamî'],['normal','Normal'],['yagly','Yağlı — Demevî/Safravî']] },
              { key: 'fitri_beden', label: 'Beden Yapısı', opts: [['','Seçin'],['ince_narin','İnce/Narin — Safravî/Sevdavî'],['orta','Orta yapılı'],['dolgun','Dolgun/Iri — Demevî/Balgamî']] },
              { key: 'fitri_uyku', label: 'Uyku Eğilimi', opts: [['','Seçin'],['az_uyku','Az uyku yeter — Safravî'],['normal_uyku','Normal 7-8h'],['cok_uyku','Çok uyurum — Balgamî'],['duzensiz_uyku','Düzensiz — Sevdavî']] },
              { key: 'fitri_sindirim', label: 'Sindirim Hızı', opts: [['','Seçin'],['cok_hizli','Çok hızlı — Safravî'],['hizli','Hızlı'],['normal_sind','Normal'],['yavas','Yavaş — Balgamî'],['cok_yavas','Çok yavaş — Sevdavî']] },
              { key: 'fitri_mizac_ruh', label: 'Ruh Hali Eğilimi', opts: [['','Seçin'],['neşeli_enerjik','Neşeli/Enerjik — Demevî'],['ofkeli_hizli','Öfkeli/Hızlı — Safravî'],['sakin_agir','Sakin/Ağır — Balgamî'],['dusunceli_melankolik','Düşünceli/Melankolik — Sevdavî']] },
              { key: 'fitri_terleme', label: 'Terleme Eğilimi', opts: [['','Seçin'],['cok_terler','Çok terler — Demevî/Safravî'],['normal_terler','Normal'],['az_terler','Az terler — Balgamî/Sevdavî']] },
              { key: 'fitri_isi_hassas', label: 'Isı Hassasiyeti', opts: [['','Seçin'],['soguga_hassas','Soğuğa hassas — Balgamî/Sevdavî'],['sicaga_hassas','Sıcağa hassas — Safravî/Demevî'],['dengeli_isi','Dengeli']] },
              { key: 'fitri_mevsim', label: 'Sevdiğiniz Mevsim', opts: [['','Seçin'],['ilkbahar','İlkbahar — Demevî'],['yaz','Yaz — Safravî'],['sonbahar','Sonbahar — Sevdavî'],['kis','Kış — Balgamî']] },
              { key: 'fitri_kilo', label: 'Kilo Eğilimi', opts: [['','Seçin'],['kilo_almaz','Zor kilo alır — Safravî/Sevdavî'],['normal_kilo','Normal'],['kilo_alir','Kolay kilo alır — Balgamî/Demevî']] },
              { key: 'fitri_enerji', label: 'Enerji Düzeyi', opts: [['','Seçin'],['yuksek_enerji','Yüksek enerjili — Demevî/Safravî'],['orta_enerji','Orta'],['dusuk_enerji','Düşük/Ağır — Balgamî'],['dalgali_enerji','Dalgalı — Sevdavî']] },
            ].map(f => (
              <div key={f.key}>
                <label style={s.label}>{f.label}</label>
                <select style={s.select} value={(form as Record<string, string | boolean>)[f.key] as string} onChange={e => set(f.key, e.target.value)}>
                  {f.opts.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
          <button onClick={() => setAdim(6)} style={{ padding: '10px 24px', border: `1px solid ${C.border}`, borderRadius: 8, background: C.white, color: C.secondary, cursor: 'pointer', fontSize: 13 }}>{"\u2190 Geri"}</button>
          <button onClick={() => setAdim(8)} style={{ padding: '10px 28px', background: C.primary, border: 'none', borderRadius: 8, color: C.gold, cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: cinzel.style.fontFamily }}>{"İleri \u2192"}</button>
        </div>
        </div>

        {/* === ADIM 8: ŞİKAYETLER + SUBMIT === */}
        <div style={{ display: adim === 8 ? 'block' : 'none' }}>
        <div style={s.sectionTitle}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          {"Şikayetler ve Notlar *"}
        </div>
        <div style={s.card}>
          <div style={{ marginBottom: 12 }}>
            <label style={s.label}>{"Mevcut Şikayetler *"}</label>
            <textarea style={s.textarea} value={form.symptoms} onChange={e => set('symptoms', e.target.value)} placeholder="Baş ağrısı, yorgunluk, sindirim bozukluğu... Tüm şikayetlerinizi yazın." />
          </div>
          <div>
            <label style={s.label}>{"Ek Notlar / İlaç Kullanımı"}</label>
            <textarea style={{ ...s.textarea, height: 60 }} value={form.notlar} onChange={e => set('notlar', e.target.value)} placeholder="Kullandığınız ilaçlar, takviyeler, ek bilgiler..." />
          </div>
        </div>

        {/* TAHLİL YÜKLEME */}
        <div style={s.card}>
          <label style={s.label}>{"Tahlil Dosyası (opsiyonel)"}</label>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            multiple
            style={{ display: 'block', marginTop: 8, fontSize: 13, color: C.dark }}
          />
          <div style={{ fontSize: 11, color: '#999', marginTop: 6 }}>{"PDF, JPG, PNG — Kan tahlili, EKG, ultrason"}</div>
        </div>

        {/* KVKK */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px 16px', marginBottom: 24, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <input type="checkbox" id="kvkk" checked={form.kvkk} onChange={e => set('kvkk', e.target.checked)} style={{ marginTop: 2, flexShrink: 0, width: 16, height: 16, cursor: 'pointer' }} />
          <label htmlFor="kvkk" style={{ fontSize: 13, color: C.secondary, lineHeight: 1.6, cursor: 'pointer' }}>
            {"Sağlık verilerimin klasik İslam tıbbı danışmanlığı amacıyla işlenmesine, danışmanıma iletilmesine KVKK kapsamında onay veriyorum. Verilerim üçüncü taraflarla paylaşılmayacaktır."}
          </label>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24 }}>
          <button onClick={() => setAdim(7)} style={{ padding: '10px 24px', border: `1px solid ${C.border}`, borderRadius: 8, background: C.white, color: C.secondary, cursor: 'pointer', fontSize: 13 }}>{"\u2190 Geri"}</button>
          <div style={{ fontSize: 11, color: '#999' }}>{"8 / 8 — Son adım"}</div>
        </div>

        <button
          onClick={handleSubmit}
          style={{ width: '100%', padding: '18px', background: C.primary, border: 'none', borderRadius: 14, cursor: 'pointer', fontFamily: cinzel.style.fontFamily, fontSize: 16, fontWeight: 600, color: C.white, letterSpacing: 2, textTransform: 'uppercase' as const, marginTop: 16 }}
        >
          {"Formu Danışmana Gönder"}
        </button>

        <p style={{ textAlign: 'center', fontSize: 13, color: '#999', marginTop: 16, fontStyle: 'italic' }}>
          {"Danışmanınız 24-48 saat içinde WhatsApp üzerinden size ulaşacaktır."}
        </p>
        </div>
        {/* === ADIM 8 SONU === */}

      </div>

      {/* eslint-disable-next-line react/no-unknown-property */}
      <style jsx global>{`
        @media (max-width: 768px) {
          .analiz-grid2, .analiz-grid3 { grid-template-columns: 1fr !important; }
          .analiz-step-nav { display: none !important; }
        }
      `}</style>
      <Footer />
    </div>
  )
}
