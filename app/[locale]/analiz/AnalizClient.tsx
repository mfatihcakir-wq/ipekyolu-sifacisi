'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Cormorant_Garamond as Cinzel, EB_Garamond } from 'next/font/google'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { createClient } from '@/lib/supabase'


const cinzel = Cinzel({ display: 'swap', preload: false, subsets: ['latin', 'latin-ext'], weight: ['400', '500', '600'] })
const garamond = EB_Garamond({ display: 'swap', preload: false, subsets: ['latin', 'latin-ext'], weight: ['400', '500'], style: ['normal', 'italic'] })

const C = {
  primary: '#1C3A26',
  gold: '#B8860B',
  cream: '#FAF6EF',
  dark: '#1C1C1C',
  secondary: '#6B5744',
  border: '#DEB887',
  white: '#FFFFFF',
  surface: '#FAF6EF',
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
  const [authState, setAuthState] = useState<'kontrol' | 'misafir' | 'uye'>('kontrol')
  const [adim, setAdim] = useState(1)
  const [toast, setToast] = useState<{mesaj: string, tip: 'hata' | 'basari'} | null>(null)
  function gosterToast(mesaj: string, tip: 'hata' | 'basari' = 'hata') {
    setToast({ mesaj, tip })
    setTimeout(() => setToast(null), 4000)
  }


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

  // Nabiz PPG state
  const [nabizMod, setNabizMod] = useState<'kamera' | 'manuel'>('kamera')
  const [ppgAktif, setPpgAktif] = useState(false)
  const [ppgBpm, setPpgBpm] = useState<number | null>(null)
  const [ppgKalite, setPpgKalite] = useState(0)
  const [ppgCountdown, setPpgCountdown] = useState(30)
  const [ppgTamamlandi, setPpgTamamlandi] = useState(false)
  const [ppgHiltler, setPpgHiltler] = useState({ dem: 0, balgam: 0, sari_safra: 0, kara_safra: 0 })
  const ppgVideoRef = useRef<HTMLVideoElement>(null)
  const ppgCanvasRef = useRef<HTMLCanvasElement>(null)
  const ppgStreamRef = useRef<MediaStream | null>(null)
  const ppgAnimRef = useRef<number | null>(null)
  const ppgCountdownRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const ppgDataRef = useRef<{ v: number; t: number }[]>([])
  const ppgLPRef = useRef({ y1: 0 })
  const ppgHPRef = useRef({ y1: 0, x1: 0 })

  // Dil/Yuz state
  const [dyMod, setDyMod] = useState<'kamera' | 'manuel'>('kamera')
  const [dyFotolar, setDyFotolar] = useState<{ dil: string | null; yuz: string | null }>({ dil: null, yuz: null })
  const [dyAnalizing, setDyAnalizing] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [dyAnalizSonucu, setDyAnalizSonucu] = useState<any>(null)
  const dilVideoRef = useRef<HTMLVideoElement>(null)
  const yuzVideoRef = useRef<HTMLVideoElement>(null)
  const dilCanvasRef = useRef<HTMLCanvasElement>(null)
  const yuzCanvasRef = useRef<HTMLCanvasElement>(null)
  const dyStreamsRef = useRef<{ dil: MediaStream | null; yuz: MediaStream | null }>({ dil: null, yuz: null })

  // --- PPG Functions ---
  const ppgBandpass = useCallback((x: number): number => {
    const alphaLP = 0.45
    const lpOut = alphaLP * x + (1 - alphaLP) * ppgLPRef.current.y1
    ppgLPRef.current.y1 = lpOut
    const alphaHP = 0.97
    const hpOut = alphaHP * ppgHPRef.current.y1 + alphaHP * (lpOut - ppgHPRef.current.x1)
    ppgHPRef.current.y1 = hpOut
    ppgHPRef.current.x1 = lpOut
    return hpOut
  }, [])

  const ppgBpmHesapla = useCallback((data: { v: number; t: number }[]): number => {
    if (data.length < 10) return 0
    const vals = data.map(d => d.v)
    const mean = vals.reduce((a, b) => a + b, 0) / vals.length
    const std = Math.sqrt(vals.reduce((a, b) => a + (b - mean) ** 2, 0) / vals.length)
    const threshold = mean + std * 0.4
    const peaks: number[] = []
    const refractoryMs = 250
    for (let i = 2; i < data.length - 2; i++) {
      if (data[i].v > threshold && data[i].v > data[i - 1].v && data[i].v > data[i + 1].v) {
        if (peaks.length === 0 || (data[i].t - data[peaks[peaks.length - 1]].t) > refractoryMs) {
          peaks.push(i)
        }
      }
    }
    if (peaks.length < 2) return 0
    const rrIntervals: number[] = []
    for (let i = 1; i < peaks.length; i++) {
      rrIntervals.push(data[peaks[i]].t - data[peaks[i - 1]].t)
    }
    const avgRR = rrIntervals.reduce((a, b) => a + b, 0) / rrIntervals.length
    return avgRR > 0 ? Math.round(60000 / avgRR) : 0
  }, [])

  const ppgSifatHesapla = useCallback((data: { v: number; t: number }[]): Record<string, string> => {
    const result: Record<string, string> = {}
    if (data.length < 20) return result
    const vals = data.map(d => d.v)
    const mean = vals.reduce((a, b) => a + b, 0) / vals.length
    const std = Math.sqrt(vals.reduce((a, b) => a + (b - mean) ** 2, 0) / vals.length)
    const maxV = Math.max(...vals.map(v => Math.abs(v)))
    const normAmp = maxV > 0 ? std / maxV : 0

    result.buyukluk = normAmp > 0.15 ? 'buyuk' : normAmp < 0.05 ? 'kucuk' : 'orta'

    const noise = vals.slice(-10).reduce((a, b) => a + Math.abs(b - mean), 0) / 10
    const snr = noise > 0 ? std / noise : 0
    result.kuvvet = snr > 4.5 ? 'kuvvetli' : snr < 3.0 ? 'zayif' : 'orta'

    const aboveMean = vals.filter(v => v > mean).length
    const widthRatio = aboveMean / vals.length
    result.dolgunluk = widthRatio > 0.45 ? 'dolu' : widthRatio < 0.28 ? 'bos' : 'orta'

    let maxSlope = 0
    for (let i = 1; i < vals.length; i++) {
      const dt = data[i].t - data[i - 1].t
      if (dt > 0) {
        const slope = (vals[i] - vals[i - 1]) / dt
        if (slope > maxSlope) maxSlope = slope
      }
    }
    result.sertlik = maxSlope > 0.8 ? 'sert' : maxSlope < 0.2 ? 'yumusak' : 'orta'

    const threshold2 = mean + std * 0.4
    const peaks: number[] = []
    for (let i = 2; i < data.length - 2; i++) {
      if (data[i].v > threshold2 && data[i].v > data[i - 1].v && data[i].v > data[i + 1].v) {
        if (peaks.length === 0 || (data[i].t - data[peaks[peaks.length - 1]].t) > 250) {
          peaks.push(i)
        }
      }
    }
    if (peaks.length > 2) {
      const rr: number[] = []
      for (let i = 1; i < peaks.length; i++) rr.push(data[peaks[i]].t - data[peaks[i - 1]].t)
      const rrMean = rr.reduce((a, b) => a + b, 0) / rr.length
      const sdnn = Math.sqrt(rr.reduce((a, b) => a + (b - rrMean) ** 2, 0) / rr.length)
      result.ritim = sdnn > 80 ? 'duzensiz' : sdnn > 40 ? 'hafif_duzensiz' : 'muntazam'

      const peakAmps = peaks.map(i => Math.abs(data[i].v))
      const ampMean = peakAmps.reduce((a, b) => a + b, 0) / peakAmps.length
      const ampStd = Math.sqrt(peakAmps.reduce((a, b) => a + (b - ampMean) ** 2, 0) / peakAmps.length)
      const cv = ampMean > 0 ? ampStd / ampMean : 0
      result.esitlik = cv > 0.25 ? 'esitsiz' : cv > 0.12 ? 'hafif_esitsiz' : 'esit'

      const avgGap = rr.reduce((a, b) => a + b, 0) / rr.length
      const maxGap = Math.max(...rr)
      const gapRatio = avgGap > 0 ? maxGap / avgGap : 1
      result.sureklitik = gapRatio > 2.5 ? 'kesik' : gapRatio > 1.7 ? 'hafif_kesik' : 'surekli'
    } else {
      result.ritim = 'muntazam'
      result.esitlik = 'esit'
      result.sureklitik = 'surekli'
    }
    return result
  }, [])

  const NABIZ_HILT_MATRIX: Record<string, Record<string, { dem: number; balgam: number; sari_safra: number; kara_safra: number }>> = {
    buyukluk: {
      buyuk: { dem: 3, balgam: 1, sari_safra: 2, kara_safra: 0 },
      orta: { dem: 1, balgam: 1, sari_safra: 1, kara_safra: 1 },
      kucuk: { dem: 0, balgam: 2, sari_safra: 0, kara_safra: 3 },
    },
    kuvvet: {
      kuvvetli: { dem: 3, balgam: 0, sari_safra: 2, kara_safra: 0 },
      orta: { dem: 1, balgam: 1, sari_safra: 1, kara_safra: 1 },
      zayif: { dem: 0, balgam: 2, sari_safra: 0, kara_safra: 3 },
    },
    hiz: {
      hizli: { dem: 2, balgam: 0, sari_safra: 3, kara_safra: 0 },
      orta: { dem: 1, balgam: 1, sari_safra: 1, kara_safra: 1 },
      yavas: { dem: 0, balgam: 3, sari_safra: 0, kara_safra: 2 },
    },
    dolgunluk: {
      dolu: { dem: 3, balgam: 1, sari_safra: 1, kara_safra: 0 },
      orta: { dem: 1, balgam: 1, sari_safra: 1, kara_safra: 1 },
      bos: { dem: 0, balgam: 1, sari_safra: 0, kara_safra: 3 },
    },
    sertlik: {
      sert: { dem: 1, balgam: 0, sari_safra: 3, kara_safra: 1 },
      orta: { dem: 1, balgam: 1, sari_safra: 1, kara_safra: 1 },
      yumusak: { dem: 2, balgam: 3, sari_safra: 0, kara_safra: 0 },
    },
    ritim: {
      muntazam: { dem: 2, balgam: 2, sari_safra: 1, kara_safra: 1 },
      hafif_duzensiz: { dem: 1, balgam: 1, sari_safra: 1, kara_safra: 2 },
      duzensiz: { dem: 0, balgam: 0, sari_safra: 2, kara_safra: 3 },
    },
    esitlik: {
      esit: { dem: 2, balgam: 2, sari_safra: 1, kara_safra: 1 },
      hafif_esitsiz: { dem: 1, balgam: 1, sari_safra: 1, kara_safra: 2 },
      esitsiz: { dem: 0, balgam: 0, sari_safra: 2, kara_safra: 3 },
    },
    sureklitik: {
      surekli: { dem: 2, balgam: 2, sari_safra: 1, kara_safra: 0 },
      hafif_kesik: { dem: 1, balgam: 1, sari_safra: 1, kara_safra: 2 },
      kesik: { dem: 0, balgam: 0, sari_safra: 1, kara_safra: 3 },
    },
  }

  const nabizHiltHesapla = useCallback(() => {
    const sifatlar: Record<string, string> = {
      buyukluk: form.nb_buyukluk || 'orta',
      kuvvet: form.nb_kuvvet || 'orta',
      hiz: form.nb_hiz_sinif || 'orta',
      dolgunluk: form.nb_dolgunluk || 'orta',
      sertlik: form.nb_sertlik || 'orta',
      ritim: form.nb_ritim || 'muntazam',
      esitlik: form.nb_esitlik || 'esit',
      sureklitik: form.nb_sureklitik || 'surekli',
    }
    const totals = { dem: 0, balgam: 0, sari_safra: 0, kara_safra: 0 }
    for (const [cat, val] of Object.entries(sifatlar)) {
      const entry = NABIZ_HILT_MATRIX[cat]?.[val]
      if (entry) {
        totals.dem += entry.dem
        totals.balgam += entry.balgam
        totals.sari_safra += entry.sari_safra
        totals.kara_safra += entry.kara_safra
      }
    }
    const sum = totals.dem + totals.balgam + totals.sari_safra + totals.kara_safra
    if (sum > 0) {
      totals.dem = Math.round((totals.dem / sum) * 100)
      totals.balgam = Math.round((totals.balgam / sum) * 100)
      totals.sari_safra = Math.round((totals.sari_safra / sum) * 100)
      totals.kara_safra = Math.round((totals.kara_safra / sum) * 100)
    }
    setPpgHiltler(totals)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.nb_buyukluk, form.nb_kuvvet, form.nb_hiz_sinif, form.nb_dolgunluk, form.nb_sertlik, form.nb_ritim, form.nb_esitlik, form.nb_sureklitik])

  const ppgDurdur = useCallback(async () => {
    if (ppgAnimRef.current) { cancelAnimationFrame(ppgAnimRef.current); ppgAnimRef.current = null }
    if (ppgCountdownRef.current) { clearInterval(ppgCountdownRef.current); ppgCountdownRef.current = null }
    if (ppgStreamRef.current) {
      // Torch kapat
      const tracks = ppgStreamRef.current.getVideoTracks()
      for (const track of tracks) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const cap = (track as any).getCapabilities?.()
          if (cap?.torch) {
            await track.applyConstraints({ advanced: [{ torch: false } as MediaTrackConstraintSet] })
          }
        } catch { /* torch kapatilamadi */ }
      }
      ppgStreamRef.current.getTracks().forEach(t => t.stop())
      ppgStreamRef.current = null
    }
    setPpgAktif(false)

    const data = ppgDataRef.current
    if (data.length > 90) {
      const bpm = ppgBpmHesapla(data)
      if (bpm > 40 && bpm < 200) {
        setPpgBpm(bpm)
        set('ppg_bpm', String(bpm))
        const hizSinif = bpm > 90 ? 'hizli' : bpm < 65 ? 'yavas' : 'orta'
        set('nb_hiz_sinif', hizSinif)
      }
      const sifatlar = ppgSifatHesapla(data)
      if (sifatlar.buyukluk) set('nb_buyukluk', sifatlar.buyukluk)
      if (sifatlar.kuvvet) set('nb_kuvvet', sifatlar.kuvvet)
      if (sifatlar.dolgunluk) set('nb_dolgunluk', sifatlar.dolgunluk)
      if (sifatlar.sertlik) set('nb_sertlik', sifatlar.sertlik)
      if (sifatlar.ritim) set('nb_ritim', sifatlar.ritim)
      if (sifatlar.esitlik) set('nb_esitlik', sifatlar.esitlik)
      if (sifatlar.sureklitik) set('nb_sureklitik', sifatlar.sureklitik)
      setPpgTamamlandi(true)
      setNabizMod('manuel')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ppgBpmHesapla, ppgSifatHesapla])

  const ppgBaslat = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 320 }, height: { ideal: 240 } }
      })
      ppgStreamRef.current = stream

      // Torch (flas) ac
      const videoTrack = stream.getVideoTracks()[0]
      if (videoTrack) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const capabilities = (videoTrack as any).getCapabilities?.()
          if (capabilities?.torch) {
            await videoTrack.applyConstraints({ advanced: [{ torch: true } as MediaTrackConstraintSet] })
          }
        } catch (e) { console.log('Torch desteklenmiyor:', e) }
      }
      if (ppgVideoRef.current) {
        ppgVideoRef.current.srcObject = stream
        ppgVideoRef.current.play()
      }
      ppgDataRef.current = []
      ppgLPRef.current = { y1: 0 }
      ppgHPRef.current = { y1: 0, x1: 0 }
      setPpgAktif(true)
      setPpgBpm(null)
      setPpgKalite(0)
      setPpgCountdown(30)
      setPpgTamamlandi(false)

      ppgCountdownRef.current = setInterval(() => {
        setPpgCountdown(prev => {
          if (prev <= 1) {
            void ppgDurdur()
            return 0
          }
          return prev - 1
        })
      }, 1000)

      const canvas = ppgCanvasRef.current
      const ctx = canvas?.getContext('2d', { willReadFrequently: true })
      const video = ppgVideoRef.current

      const loop = () => {
        if (!video || !ctx || !canvas) return
        if (video.readyState >= 2) {
          canvas.width = 64
          canvas.height = 48
          ctx.drawImage(video, 0, 0, 64, 48)
          const frame = ctx.getImageData(0, 0, 64, 48)
          let rSum = 0
          let count = 0
          // Kanal secimi: mobilde red, masaustunde green
          const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
          const channelIdx = isMobile ? 0 : 1
          for (let i = 0; i < frame.data.length; i += 4) {
            rSum += frame.data[i + channelIdx]
            count++
          }
          const avgR = rSum / count

          // Parmak tespiti — red channel ortalamasi
          let redSum = 0, redCount = 0
          for (let i = 0; i < frame.data.length; i += 16) {
            redSum += frame.data[i]; redCount++
          }
          const redMean = redSum / redCount
          const parmakVar = redMean > 100
          if (!parmakVar) {
            ppgDataRef.current = []
            setPpgBpm(null)
            ppgAnimRef.current = requestAnimationFrame(loop)
            return
          }

          const filtered = ppgBandpass(avgR)
          const now = performance.now()
          ppgDataRef.current.push({ v: filtered, t: now })
          const cutoff = now - 10000
          ppgDataRef.current = ppgDataRef.current.filter(d => d.t > cutoff)

          if (ppgDataRef.current.length > 30) {
            const bpm = ppgBpmHesapla(ppgDataRef.current)
            if (bpm > 40 && bpm < 200) {
              setPpgBpm(bpm)
            }
            // SNR kalite skoru
            const pencere = ppgDataRef.current.slice(-60)
            if (pencere.length >= 30) {
              const qVals = pencere.map(p => p.v)
              const qMean = qVals.reduce((a, b) => a + b, 0) / qVals.length
              const qStd = Math.sqrt(qVals.map(v => (v - qMean) ** 2).reduce((a, b) => a + b, 0) / qVals.length)
              const qRms = Math.sqrt(qVals.map(v => v * v).reduce((a, b) => a + b, 0) / qVals.length)
              const snr = qRms / (qStd + 0.001)
              const kalite = Math.min(100, Math.round(snr * 20))
              setPpgKalite(kalite)
            }
          }
        }
        ppgAnimRef.current = requestAnimationFrame(loop)
      }
      ppgAnimRef.current = requestAnimationFrame(loop)
    } catch {
      gosterToast('Kamera erisimi reddedildi veya desteklenmiyor.')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ppgBandpass, ppgBpmHesapla, ppgDurdur])

  // Dil/Yuz functions
  const dyKameraAc = useCallback(async (tip: 'dil' | 'yuz') => {
    try {
      const facingMode = tip === 'dil' ? 'environment' : 'user'
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 640 }, height: { ideal: 480 } }
      })
      dyStreamsRef.current[tip] = stream
      const videoEl = tip === 'dil' ? dilVideoRef.current : yuzVideoRef.current
      if (videoEl) {
        videoEl.srcObject = stream
        videoEl.play()
      }
    } catch {
      gosterToast('Kamera erisimi saglanamadi.')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const dyFotoCek = useCallback((tip: 'dil' | 'yuz') => {
    const videoEl = tip === 'dil' ? dilVideoRef.current : yuzVideoRef.current
    const canvasEl = tip === 'dil' ? dilCanvasRef.current : yuzCanvasRef.current
    if (!videoEl || !canvasEl) return
    canvasEl.width = videoEl.videoWidth || 640
    canvasEl.height = videoEl.videoHeight || 480
    const ctx = canvasEl.getContext('2d')
    if (!ctx) return
    ctx.drawImage(videoEl, 0, 0)
    const dataUrl = canvasEl.toDataURL('image/jpeg', 0.85)
    setDyFotolar(prev => ({ ...prev, [tip]: dataUrl }))
    set(tip === 'dil' ? 'dil_foto' : 'yuz_foto', dataUrl)
    if (dyStreamsRef.current[tip]) {
      dyStreamsRef.current[tip]!.getTracks().forEach(t => t.stop())
      dyStreamsRef.current[tip] = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const dyAnalizEt = useCallback(async () => {
    if (!dyFotolar.dil && !dyFotolar.yuz) { gosterToast('En az bir fotograf cekin.'); return }
    setDyAnalizing(true)
    setDyAnalizSonucu(null)
    try {
      const content: Array<{ type: string; source?: { type: string; media_type: string; data: string }; text?: string }> = []
      if (dyFotolar.dil) {
        content.push({
          type: 'image',
          source: { type: 'base64', media_type: 'image/jpeg', data: dyFotolar.dil.split(',')[1] }
        })
        content.push({ type: 'text', text: 'Bu dil fotografidir.' })
      }
      if (dyFotolar.yuz) {
        content.push({
          type: 'image',
          source: { type: 'base64', media_type: 'image/jpeg', data: dyFotolar.yuz.split(',')[1] }
        })
        content.push({ type: 'text', text: 'Bu yuz fotografidir.' })
      }
      content.push({
        type: 'text',
        text: 'el-Kânûn fi\'t-Tibb cercevesinde degerlendir. JSON dondur: {"dil_renk":"","dil_kaplama":"","dil_nem":"","dil_sekil":"","yuz_ten":"","yuz_sekil":"","yuz_cilt":"","yuz_gozalti":"","yorum":""}'
      })

      const res = await fetch('/api/vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content }] })
      })
      const data = await res.json()
      if (data.content?.[0]?.text) {
        const txt = data.content[0].text
        const jsonMatch = txt.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          setDyAnalizSonucu(parsed)
          if (parsed.dil_renk) set('dil_renk', parsed.dil_renk)
          if (parsed.dil_kaplama) set('dil_kaplama', parsed.dil_kaplama)
          if (parsed.dil_nem) set('dil_nem', parsed.dil_nem)
          if (parsed.dil_sekil) set('dil_sekil', parsed.dil_sekil)
          if (parsed.yuz_ten) set('yuz_ten', parsed.yuz_ten)
          if (parsed.yuz_sekil) set('yuz_sekil', parsed.yuz_sekil)
          if (parsed.yuz_cilt) set('yuz_cilt', parsed.yuz_cilt)
          if (parsed.yuz_gozalti) set('yuz_gozalti', parsed.yuz_gozalti)
        }
      }
    } catch {
      gosterToast('Analiz sirasinda hata olustu.')
    } finally {
      setDyAnalizing(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dyFotolar])

  // Session kontrolü
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setAuthState(data.user ? 'uye' : 'misafir')
    })
  }, [])

  // Hizli giris prefill
  useEffect(() => {
    try {
      const hizliGiris = localStorage.getItem('hizliGiris')
      if (hizliGiris) {
        const { sikayet } = JSON.parse(hizliGiris)
        if (sikayet) setForm(prev => ({ ...prev, symptoms: sikayet }))
        localStorage.removeItem('hizliGiris')
      }
    } catch { /* ignore */ }
  }, [])

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (ppgAnimRef.current) cancelAnimationFrame(ppgAnimRef.current)
      if (ppgCountdownRef.current) clearInterval(ppgCountdownRef.current)
      if (ppgStreamRef.current) ppgStreamRef.current.getTracks().forEach(t => t.stop())
      if (dyStreamsRef.current.dil) dyStreamsRef.current.dil.getTracks().forEach(t => t.stop())
      if (dyStreamsRef.current.yuz) dyStreamsRef.current.yuz.getTracks().forEach(t => t.stop())
    }
  }, [])

  const handleSubmit = () => {
    if (!form.ad_soyad?.trim()) { gosterToast('Ad Soyad alani zorunludur.'); setAdim(1); return }
    if (!form.telefon?.trim()) { gosterToast('Telefon numarasi zorunludur.'); setAdim(1); return }
    if (!form.symptoms?.trim()) { gosterToast('Şikayetler alanı zorunludur.'); setAdim(8); return }
    if (!form.kvkk) { gosterToast('KVKK onayi gereklidir.'); return }
    localStorage.setItem('ipekyolu_analiz_form', JSON.stringify(form))
    localStorage.setItem('ipekyolu_secili_plan', 'yearly')
    router.push('/sonuc')
  }

  if (authState === 'kontrol') {
    return (
      <div style={{ background: C.cream, minHeight: '100vh', fontFamily: garamond.style.fontFamily }}>
        <Header />
        <div style={{ padding: 80, textAlign: 'center', color: C.secondary }}>{"Yükleniyor..."}</div>
      </div>
    )
  }

  if (authState === 'misafir') {
    return (
      <div style={{ background: C.cream, minHeight: '100vh', fontFamily: garamond.style.fontFamily }}>
        <Header />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 64px)', padding: 24 }}>
          <div style={{ background: 'white', border: `1px solid ${C.border}`, borderRadius: 16, padding: '48px 40px', maxWidth: 480, width: '100%', textAlign: 'center' as const }}>
            <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 22, fontWeight: 600, color: C.primary, marginBottom: 14 }}>{"Üyelik Gerekli"}</div>
            <p style={{ fontSize: 16, color: C.secondary, lineHeight: 1.75, marginBottom: 32 }}>
              {"Analizinizi görmek için önce kayıt olun."}
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' as const, justifyContent: 'center' }}>
              <button onClick={() => router.push('/kayit')}
                style={{ flex: 1, minWidth: 140, padding: '14px 28px', background: '#B8860B', border: 'none', borderRadius: 11, fontFamily: cinzel.style.fontFamily, fontSize: 12, fontWeight: 700, color: C.primary, letterSpacing: 1.5, cursor: 'pointer' }}>
                {"KAYIT OL"}
              </button>
              <button onClick={() => router.push('/giris')}
                style={{ flex: 1, minWidth: 140, padding: '14px 28px', background: 'transparent', border: `1.5px solid ${C.primary}`, borderRadius: 11, fontFamily: cinzel.style.fontFamily, fontSize: 12, fontWeight: 600, color: C.primary, letterSpacing: 1.5, cursor: 'pointer' }}>
                {"GİRİŞ YAP"}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: C.cream, minHeight: '100vh', fontFamily: garamond.style.fontFamily }}>
      <Header />
      {false && <header style={{ background: C.primary, padding: '0 clamp(12px, 3vw, 24px)', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <svg width="36" height="36" viewBox="0 0 64 64" fill="none">
            <ellipse cx="32" cy="37" rx="13" ry="11" fill="none" stroke="#B8860B" strokeWidth="1.5"/>
            <path d="M22 37 Q22 25 32 23 Q42 25 42 37" fill="none" stroke="#B8860B" strokeWidth="1.5"/>
            <rect x="28" y="21" width="8" height="4" rx="1.5" fill="none" stroke="#B8860B" strokeWidth="1.5"/>
            <path d="M32 14 Q36 10 40 12 Q38 18 32 20 Q26 18 24 12 Q28 10 32 14Z" fill="#B8860B"/>
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
            {"Nabiz Gozlemi"}
          </div>
          <div style={s.tip}>{"el-Kânûn fi't-Tibb: Nabiz, kalbin ve damarlarin halini gosteren en onemli belirtidir. 8 sifati ile mizaç ve hılt dengesi hakkinda bilgi verir."}</div>

          {/* Toggle: Kamera / Manuel */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <button
              onClick={() => setNabizMod('kamera')}
              style={{
                flex: 1, padding: '10px 0', borderRadius: 8, border: `1.5px solid ${nabizMod === 'kamera' ? C.gold : C.border}`,
                background: nabizMod === 'kamera' ? C.gold : C.white, color: nabizMod === 'kamera' ? C.primary : C.secondary,
                fontWeight: nabizMod === 'kamera' ? 600 : 400, cursor: 'pointer', fontSize: 13, fontFamily: cinzel.style.fontFamily,
              }}
            >{"Kamera PPG"}</button>
            <button
              onClick={() => setNabizMod('manuel')}
              style={{
                flex: 1, padding: '10px 0', borderRadius: 8, border: `1.5px solid ${nabizMod === 'manuel' ? C.gold : C.border}`,
                background: nabizMod === 'manuel' ? C.gold : C.white, color: nabizMod === 'manuel' ? C.primary : C.secondary,
                fontWeight: nabizMod === 'manuel' ? 600 : 400, cursor: 'pointer', fontSize: 13, fontFamily: cinzel.style.fontFamily,
              }}
            >{"Manuel Gir"}</button>
          </div>

          {/* Kamera PPG Mode */}
          {nabizMod === 'kamera' && !ppgTamamlandi && (
            <div style={{ ...s.card, background: '#1a1a2e', borderRadius: 16, padding: 24, textAlign: 'center' as const }}>
              <div style={{ position: 'relative' as const, width: 180, height: 180, margin: '0 auto 16px', borderRadius: '50%', overflow: 'hidden', border: `3px solid ${ppgAktif ? '#EF5350' : C.gold}` }}>
                <video ref={ppgVideoRef} style={{ width: '100%', height: '100%', objectFit: 'cover' }} playsInline muted />
                <canvas ref={ppgCanvasRef} style={{ display: 'none' }} />
                {!ppgAktif && (
                  <div style={{ position: 'absolute' as const, inset: 0, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)' }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#B8860B" strokeWidth="1.5"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                    <div style={{ color: C.gold, fontSize: 11, marginTop: 8 }}>{"Parmagini lens uzerine koy"}</div>
                  </div>
                )}
              </div>

              {ppgAktif && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 48, fontWeight: 700, color: '#EF5350', fontFamily: cinzel.style.fontFamily }}>
                    {ppgBpm ? ppgBpm : '--'}
                    <span style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', marginLeft: 4 }}>{"BPM"}</span>
                  </div>
                  {/* Sinyal kalitesi */}
                  <div style={{ marginTop: 8, marginBottom: 4 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                      <span style={{ fontFamily: cinzel.style.fontFamily, fontSize: 8, color: 'rgba(184,146,42,0.5)', letterSpacing: 1.5 }}>
                        {"SINYAL KALITESI"}
                      </span>
                      <span style={{ fontFamily: cinzel.style.fontFamily, fontSize: 8, color: '#B8860B' }}>
                        {ppgKalite}{"%"}
                      </span>
                    </div>
                    <div style={{ height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 2 }}>
                      <div style={{ height: '100%', width: `${ppgKalite}%`, borderRadius: 2, background: ppgKalite > 60 ? '#52B788' : ppgKalite > 30 ? '#FF8F00' : '#EF5350', transition: 'width 0.3s' }} />
                    </div>
                  </div>
                  {/* Countdown */}
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 6, textAlign: 'center' as const }}>
                    {ppgCountdown}{"s kaldi"}
                  </div>
                  {/* Status mesaji */}
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontStyle: 'italic', marginTop: 6, textAlign: 'center' as const }}>
                    {ppgKalite > 60 ? `Mukemmel sinyal, ${ppgCountdown}s kaldi` : ppgKalite > 30 ? 'Iyi sinyal aliniyor, sabit tutun' : ppgBpm ? 'Parmagi daha siki bastirin' : 'Parmak ucunu TAMAMEN kameraya bastirin'}
                  </div>
                </div>
              )}

              <button
                onClick={ppgAktif ? ppgDurdur : ppgBaslat}
                style={{
                  padding: '12px 32px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600,
                  background: ppgAktif ? '#EF5350' : C.gold, color: ppgAktif ? C.white : C.primary, fontFamily: cinzel.style.fontFamily,
                }}
              >{ppgAktif ? "Durdur" : "Olcumu Baslat"}</button>
            </div>
          )}

          {/* PPG Completed Card */}
          {ppgTamamlandi && (
            <div style={{ ...s.card, border: `2px solid ${C.primary}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ background: '#EAF3DE', color: '#3B6D11', padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600 }}>{"Tamamlandi"}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#EF5350', fontFamily: cinzel.style.fontFamily }}>{ppgBpm} {"BPM"}</div>
                <div style={{ fontSize: 11, color: C.secondary, marginLeft: 'auto' }}>{"8/8 sifat dolduruldu"}</div>
              </div>
              {/* Hilt bar chart */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                {[
                  { key: 'dem', label: 'Dem (Kan)', color: '#EF5350' },
                  { key: 'balgam', label: 'Balgam', color: '#42A5F5' },
                  { key: 'sari_safra', label: 'Sari Safra', color: '#FFB74D' },
                  { key: 'kara_safra', label: 'Kara Safra', color: '#78909C' },
                ].map(h => (
                  <div key={h.key} style={{ background: C.surface, borderRadius: 8, padding: '6px 10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                      <span style={{ color: C.secondary }}>{h.label}</span>
                      <span style={{ fontWeight: 600, color: h.color }}>{ppgHiltler[h.key as keyof typeof ppgHiltler]}{"%"}</span>
                    </div>
                    <div style={{ height: 6, background: C.border, borderRadius: 3 }}>
                      <div style={{ height: 6, background: h.color, borderRadius: 3, width: `${ppgHiltler[h.key as keyof typeof ppgHiltler]}%`, transition: 'width 0.5s ease' }} />
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => { setPpgTamamlandi(false); setNabizMod('kamera'); setPpgBpm(null) }}
                style={{ fontSize: 12, color: C.secondary, background: 'none', border: `1px solid ${C.border}`, borderRadius: 6, padding: '5px 12px', cursor: 'pointer' }}
              >{"Yeniden Olc"}</button>
            </div>
          )}

          {/* Isi sifati - always visible after PPG or in manual */}
          {(ppgTamamlandi || nabizMod === 'manuel') && (
            <div style={{ ...s.card, marginTop: 12 }}>
              <label style={s.label}>{"ISI SIFATI"}</label>
              <span style={s.labelAr}>{"حرارة النبض"}</span>
              <div style={{ fontSize: 11, color: '#999', marginBottom: 8 }}>{"PPG ile ölçülemez, elle belirleyin."}</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' as const }}>
                {[
                  { v: 'sicak', l: 'Sıcak' }, { v: 'ilik', l: 'Ilık' }, { v: 'soguk', l: 'Soğuk' }
                ].map(opt => (
                  <button key={opt.v} onClick={() => set('nb_isi', opt.v)}
                    style={{
                      padding: '8px 18px', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontWeight: form.nb_isi === opt.v ? 600 : 400,
                      border: `1.5px solid ${form.nb_isi === opt.v ? C.gold : C.border}`,
                      background: form.nb_isi === opt.v ? C.gold : C.white,
                      color: form.nb_isi === opt.v ? C.primary : C.secondary,
                    }}
                  >{opt.l}</button>
                ))}
              </div>
            </div>
          )}

          {/* Manuel Mode: 8 sifat cards */}
          {nabizMod === 'manuel' && (
            <>
              <div style={{ ...s.tip, marginTop: 12 }}>{"Asagidaki 8 nabiz sifatini el ile secin. Her sifatin Arapca adi ve ipucu bilgisi verilmistir."}</div>
              <div style={s.grid2} className="analiz-grid2">
                {/* Buyukluk */}
                <div style={s.card}>
                  <label style={s.label}>{"BUYUKLUK"}</label>
                  <span style={s.labelAr}>{"عِظَم النبض"}</span>
                  <div style={{ fontSize: 11, color: '#999', marginBottom: 8 }}>{"Parmak altinda nabzin genisligi; damar ne kadar sisiyor?"}</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {[{ v: 'buyuk', l: 'Buyuk' }, { v: 'orta', l: 'Orta' }, { v: 'kucuk', l: 'Kucuk' }].map(opt => (
                      <button key={opt.v} onClick={() => { set('nb_buyukluk', opt.v); nabizHiltHesapla() }}
                        style={{
                          flex: 1, padding: '8px 4px', borderRadius: 8, fontSize: 12, cursor: 'pointer',
                          border: `1.5px solid ${form.nb_buyukluk === opt.v ? C.gold : C.border}`,
                          background: form.nb_buyukluk === opt.v ? C.gold : C.white,
                          color: form.nb_buyukluk === opt.v ? C.primary : C.secondary,
                          fontWeight: form.nb_buyukluk === opt.v ? 600 : 400,
                        }}
                      >{opt.l}</button>
                    ))}
                  </div>
                </div>

                {/* Kuvvet */}
                <div style={s.card}>
                  <label style={s.label}>{"KUVVET"}</label>
                  <span style={s.labelAr}>{"قوة النبض"}</span>
                  <div style={{ fontSize: 11, color: '#999', marginBottom: 8 }}>{"Nabzi bastirmak icin ne kadar guc gerekiyor?"}</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {[{ v: 'kuvvetli', l: 'Kuvvetli' }, { v: 'orta', l: 'Orta' }, { v: 'zayif', l: 'Zayif' }].map(opt => (
                      <button key={opt.v} onClick={() => { set('nb_kuvvet', opt.v); nabizHiltHesapla() }}
                        style={{
                          flex: 1, padding: '8px 4px', borderRadius: 8, fontSize: 12, cursor: 'pointer',
                          border: `1.5px solid ${form.nb_kuvvet === opt.v ? C.gold : C.border}`,
                          background: form.nb_kuvvet === opt.v ? C.gold : C.white,
                          color: form.nb_kuvvet === opt.v ? C.primary : C.secondary,
                          fontWeight: form.nb_kuvvet === opt.v ? 600 : 400,
                        }}
                      >{opt.l}</button>
                    ))}
                  </div>
                </div>

                {/* Hiz */}
                <div style={s.card}>
                  <label style={s.label}>{"HIZ"}</label>
                  <span style={s.labelAr}>{"سرعة النبض"}</span>
                  <div style={{ fontSize: 11, color: '#999', marginBottom: 8 }}>{"Iki vurus arasi sure; hizli mi yavas mi?"}</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {[{ v: 'hizli', l: 'Hizli' }, { v: 'orta', l: 'Orta' }, { v: 'yavas', l: 'Yavas' }].map(opt => (
                      <button key={opt.v} onClick={() => { set('nb_hiz_sinif', opt.v); nabizHiltHesapla() }}
                        style={{
                          flex: 1, padding: '8px 4px', borderRadius: 8, fontSize: 12, cursor: 'pointer',
                          border: `1.5px solid ${form.nb_hiz_sinif === opt.v ? C.gold : C.border}`,
                          background: form.nb_hiz_sinif === opt.v ? C.gold : C.white,
                          color: form.nb_hiz_sinif === opt.v ? C.primary : C.secondary,
                          fontWeight: form.nb_hiz_sinif === opt.v ? 600 : 400,
                        }}
                      >{opt.l}</button>
                    ))}
                  </div>
                </div>

                {/* Dolgunluk */}
                <div style={s.card}>
                  <label style={s.label}>{"DOLGUNLUK"}</label>
                  <span style={s.labelAr}>{"امتلاء النبض"}</span>
                  <div style={{ fontSize: 11, color: '#999', marginBottom: 8 }}>{"Damar ne kadar dolu hissediliyor?"}</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {[{ v: 'dolu', l: 'Dolu' }, { v: 'orta', l: 'Orta' }, { v: 'bos', l: 'Bos' }].map(opt => (
                      <button key={opt.v} onClick={() => { set('nb_dolgunluk', opt.v); nabizHiltHesapla() }}
                        style={{
                          flex: 1, padding: '8px 4px', borderRadius: 8, fontSize: 12, cursor: 'pointer',
                          border: `1.5px solid ${form.nb_dolgunluk === opt.v ? C.gold : C.border}`,
                          background: form.nb_dolgunluk === opt.v ? C.gold : C.white,
                          color: form.nb_dolgunluk === opt.v ? C.primary : C.secondary,
                          fontWeight: form.nb_dolgunluk === opt.v ? 600 : 400,
                        }}
                      >{opt.l}</button>
                    ))}
                  </div>
                </div>

                {/* Sertlik */}
                <div style={s.card}>
                  <label style={s.label}>{"SERTLIK"}</label>
                  <span style={s.labelAr}>{"صلابة النبض"}</span>
                  <div style={{ fontSize: 11, color: '#999', marginBottom: 8 }}>{"Damar duvari sert mi yumusak mi?"}</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {[{ v: 'sert', l: 'Sert' }, { v: 'orta', l: 'Orta' }, { v: 'yumusak', l: 'Yumusak' }].map(opt => (
                      <button key={opt.v} onClick={() => { set('nb_sertlik', opt.v); nabizHiltHesapla() }}
                        style={{
                          flex: 1, padding: '8px 4px', borderRadius: 8, fontSize: 12, cursor: 'pointer',
                          border: `1.5px solid ${form.nb_sertlik === opt.v ? C.gold : C.border}`,
                          background: form.nb_sertlik === opt.v ? C.gold : C.white,
                          color: form.nb_sertlik === opt.v ? C.primary : C.secondary,
                          fontWeight: form.nb_sertlik === opt.v ? 600 : 400,
                        }}
                      >{opt.l}</button>
                    ))}
                  </div>
                </div>

                {/* Ritim */}
                <div style={s.card}>
                  <label style={s.label}>{"RITIM"}</label>
                  <span style={s.labelAr}>{"إيقاع النبض"}</span>
                  <div style={{ fontSize: 11, color: '#999', marginBottom: 8 }}>{"Vuruslar arasi zaman esit mi?"}</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {[{ v: 'muntazam', l: 'Muntazam' }, { v: 'hafif_duzensiz', l: 'Hafif' }, { v: 'duzensiz', l: 'Duzensiz' }].map(opt => (
                      <button key={opt.v} onClick={() => { set('nb_ritim', opt.v); nabizHiltHesapla() }}
                        style={{
                          flex: 1, padding: '8px 4px', borderRadius: 8, fontSize: 12, cursor: 'pointer',
                          border: `1.5px solid ${form.nb_ritim === opt.v ? C.gold : C.border}`,
                          background: form.nb_ritim === opt.v ? C.gold : C.white,
                          color: form.nb_ritim === opt.v ? C.primary : C.secondary,
                          fontWeight: form.nb_ritim === opt.v ? 600 : 400,
                        }}
                      >{opt.l}</button>
                    ))}
                  </div>
                </div>

                {/* Esitlik */}
                <div style={s.card}>
                  <label style={s.label}>{"ESITLIK"}</label>
                  <span style={s.labelAr}>{"تساوي النبض"}</span>
                  <div style={{ fontSize: 11, color: '#999', marginBottom: 8 }}>{"Her vurusun gucu esit mi?"}</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {[{ v: 'esit', l: 'Esit' }, { v: 'hafif_esitsiz', l: 'Hafif' }, { v: 'esitsiz', l: 'Esitsiz' }].map(opt => (
                      <button key={opt.v} onClick={() => { set('nb_esitlik', opt.v); nabizHiltHesapla() }}
                        style={{
                          flex: 1, padding: '8px 4px', borderRadius: 8, fontSize: 12, cursor: 'pointer',
                          border: `1.5px solid ${form.nb_esitlik === opt.v ? C.gold : C.border}`,
                          background: form.nb_esitlik === opt.v ? C.gold : C.white,
                          color: form.nb_esitlik === opt.v ? C.primary : C.secondary,
                          fontWeight: form.nb_esitlik === opt.v ? 600 : 400,
                        }}
                      >{opt.l}</button>
                    ))}
                  </div>
                </div>

                {/* Sureklitik */}
                <div style={s.card}>
                  <label style={s.label}>{"SUREKLITIK"}</label>
                  <span style={s.labelAr}>{"دوام النبض"}</span>
                  <div style={{ fontSize: 11, color: '#999', marginBottom: 8 }}>{"Nabiz surekliligi; duraksamalar var mi?"}</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {[{ v: 'surekli', l: 'Surekli' }, { v: 'hafif_kesik', l: 'Hafif' }, { v: 'kesik', l: 'Kesik' }].map(opt => (
                      <button key={opt.v} onClick={() => { set('nb_sureklitik', opt.v); nabizHiltHesapla() }}
                        style={{
                          flex: 1, padding: '8px 4px', borderRadius: 8, fontSize: 12, cursor: 'pointer',
                          border: `1.5px solid ${form.nb_sureklitik === opt.v ? C.gold : C.border}`,
                          background: form.nb_sureklitik === opt.v ? C.gold : C.white,
                          color: form.nb_sureklitik === opt.v ? C.primary : C.secondary,
                          fontWeight: form.nb_sureklitik === opt.v ? 600 : 400,
                        }}
                      >{opt.l}</button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
            <button onClick={() => setAdim(2)} style={{ padding: '10px 24px', border: `1px solid ${C.border}`, borderRadius: 8, background: C.white, color: C.secondary, cursor: 'pointer', fontSize: 13 }}>{"\u2190 Geri"}</button>
            <button onClick={() => setAdim(4)} style={{ padding: '10px 28px', background: C.primary, border: 'none', borderRadius: 8, color: C.gold, cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: cinzel.style.fontFamily }}>{"Ileri \u2192"}</button>
          </div>
        </div>

        {/* === ADIM 4: DIL/YUZ === */}
        <div style={{ display: adim === 4 ? 'block' : 'none' }}>
          <div style={s.sectionTitle}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
            {"Dil ve Yuz Gozlemi"}
          </div>
          <div style={s.tip}>{"el-Kânûn fi't-Tibb: Dil rengi, kaplamasi ve yuz gorunumu mizaç ve hılt dengesinin onemli belirtileridir."}</div>

          {/* Toggle: Kamera / Manuel */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <button
              onClick={() => setDyMod('kamera')}
              style={{
                flex: 1, padding: '10px 0', borderRadius: 8, border: `1.5px solid ${dyMod === 'kamera' ? C.gold : C.border}`,
                background: dyMod === 'kamera' ? C.gold : C.white, color: dyMod === 'kamera' ? C.primary : C.secondary,
                fontWeight: dyMod === 'kamera' ? 600 : 400, cursor: 'pointer', fontSize: 13, fontFamily: cinzel.style.fontFamily,
              }}
            >{"Kamera ile Cek"}</button>
            <button
              onClick={() => setDyMod('manuel')}
              style={{
                flex: 1, padding: '10px 0', borderRadius: 8, border: `1.5px solid ${dyMod === 'manuel' ? C.gold : C.border}`,
                background: dyMod === 'manuel' ? C.gold : C.white, color: dyMod === 'manuel' ? C.primary : C.secondary,
                fontWeight: dyMod === 'manuel' ? 600 : 400, cursor: 'pointer', fontSize: 13, fontFamily: cinzel.style.fontFamily,
              }}
            >{"Manuel Gir"}</button>
          </div>

          {/* Kamera Mode */}
          {dyMod === 'kamera' && (
            <>
              <div style={s.grid2} className="analiz-grid2">
                {/* Dil Photo */}
                <div style={s.card}>
                  <label style={s.label}>{"DIL FOTOGRAFI"}</label>
                  <div style={{ position: 'relative' as const, width: '100%', aspectRatio: '4/3', background: '#1a1a2e', borderRadius: 10, overflow: 'hidden', marginBottom: 8 }}>
                    {dyFotolar.dil ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={dyFotolar.dil} alt="Dil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </>
                    ) : (
                      <video ref={dilVideoRef} style={{ width: '100%', height: '100%', objectFit: 'cover' }} playsInline muted />
                    )}
                    <canvas ref={dilCanvasRef} style={{ display: 'none' }} />
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {!dyFotolar.dil ? (
                      <>
                        <button onClick={() => dyKameraAc('dil')} style={{ flex: 1, padding: '8px 0', borderRadius: 8, border: `1px solid ${C.border}`, background: C.white, color: C.secondary, cursor: 'pointer', fontSize: 12 }}>{"Kamerayi Ac"}</button>
                        <button onClick={() => dyFotoCek('dil')} style={{ flex: 1, padding: '8px 0', borderRadius: 8, border: 'none', background: C.gold, color: C.primary, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>{"Cek"}</button>
                      </>
                    ) : (
                      <button onClick={() => setDyFotolar(p => ({ ...p, dil: null }))} style={{ flex: 1, padding: '8px 0', borderRadius: 8, border: `1px solid ${C.border}`, background: C.white, color: C.secondary, cursor: 'pointer', fontSize: 12 }}>{"Yeniden Cek"}</button>
                    )}
                  </div>
                </div>

                {/* Yuz Photo */}
                <div style={s.card}>
                  <label style={s.label}>{"YUZ FOTOGRAFI"}</label>
                  <div style={{ position: 'relative' as const, width: '100%', aspectRatio: '4/3', background: '#1a1a2e', borderRadius: 10, overflow: 'hidden', marginBottom: 8 }}>
                    {dyFotolar.yuz ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={dyFotolar.yuz} alt="Yuz" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </>
                    ) : (
                      <video ref={yuzVideoRef} style={{ width: '100%', height: '100%', objectFit: 'cover' }} playsInline muted />
                    )}
                    <canvas ref={yuzCanvasRef} style={{ display: 'none' }} />
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {!dyFotolar.yuz ? (
                      <>
                        <button onClick={() => dyKameraAc('yuz')} style={{ flex: 1, padding: '8px 0', borderRadius: 8, border: `1px solid ${C.border}`, background: C.white, color: C.secondary, cursor: 'pointer', fontSize: 12 }}>{"Kamerayi Ac"}</button>
                        <button onClick={() => dyFotoCek('yuz')} style={{ flex: 1, padding: '8px 0', borderRadius: 8, border: 'none', background: C.gold, color: C.primary, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>{"Cek"}</button>
                      </>
                    ) : (
                      <button onClick={() => setDyFotolar(p => ({ ...p, yuz: null }))} style={{ flex: 1, padding: '8px 0', borderRadius: 8, border: `1px solid ${C.border}`, background: C.white, color: C.secondary, cursor: 'pointer', fontSize: 12 }}>{"Yeniden Cek"}</button>
                    )}
                  </div>
                </div>
              </div>

              {/* Analyze button */}
              {(dyFotolar.dil || dyFotolar.yuz) && (
                <button
                  onClick={dyAnalizEt}
                  disabled={dyAnalizing}
                  style={{
                    width: '100%', padding: '14px 0', borderRadius: 10, border: 'none', cursor: dyAnalizing ? 'wait' : 'pointer',
                    background: C.primary, color: C.gold, fontSize: 14, fontWeight: 600, fontFamily: cinzel.style.fontFamily, marginTop: 12,
                    opacity: dyAnalizing ? 0.7 : 1,
                  }}
                >{dyAnalizing ? "Analiz ediliyor..." : "el-Kânûn ile Analiz Et"}</button>
              )}

              {/* Analysis result */}
              {dyAnalizSonucu && (
                <div style={{ ...s.card, marginTop: 12, border: `2px solid ${C.primary}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <div style={{ background: '#EAF3DE', color: '#3B6D11', padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600 }}>{"Analiz Tamamlandi"}</div>
                  </div>
                  {dyAnalizSonucu.yorum && (
                    <div style={{ fontSize: 13, color: C.secondary, lineHeight: 1.6, marginBottom: 12, fontStyle: 'italic' }}>{dyAnalizSonucu.yorum}</div>
                  )}
                  <div style={s.grid2} className="analiz-grid2">
                    {dyAnalizSonucu.dil_renk && <div style={{ fontSize: 12 }}><strong>{"Dil Renk: "}</strong>{dyAnalizSonucu.dil_renk}</div>}
                    {dyAnalizSonucu.dil_kaplama && <div style={{ fontSize: 12 }}><strong>{"Dil Kaplama: "}</strong>{dyAnalizSonucu.dil_kaplama}</div>}
                    {dyAnalizSonucu.dil_nem && <div style={{ fontSize: 12 }}><strong>{"Dil Nem: "}</strong>{dyAnalizSonucu.dil_nem}</div>}
                    {dyAnalizSonucu.dil_sekil && <div style={{ fontSize: 12 }}><strong>{"Dil Sekil: "}</strong>{dyAnalizSonucu.dil_sekil}</div>}
                    {dyAnalizSonucu.yuz_ten && <div style={{ fontSize: 12 }}><strong>{"Yuz Ten: "}</strong>{dyAnalizSonucu.yuz_ten}</div>}
                    {dyAnalizSonucu.yuz_sekil && <div style={{ fontSize: 12 }}><strong>{"Yuz Sekil: "}</strong>{dyAnalizSonucu.yuz_sekil}</div>}
                    {dyAnalizSonucu.yuz_cilt && <div style={{ fontSize: 12 }}><strong>{"Yuz Cilt: "}</strong>{dyAnalizSonucu.yuz_cilt}</div>}
                    {dyAnalizSonucu.yuz_gozalti && <div style={{ fontSize: 12 }}><strong>{"Goz Alti: "}</strong>{dyAnalizSonucu.yuz_gozalti}</div>}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Manuel Mode */}
          {dyMod === 'manuel' && (
            <>
              <div style={{ ...s.tip, marginTop: 4 }}>{"Dil ve yuz ozelliklerini asagidan secin."}</div>

              {/* Dil Fields */}
              <div style={s.sectionTitle}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10z"/></svg>
                {"Dil Gozlemi"}
              </div>
              <div style={s.grid2} className="analiz-grid2">
                <div style={s.card}>
                  <label style={s.label}>{"DIL RENGI"}</label>
                  <div style={{ fontSize: 11, color: '#999', marginBottom: 8 }}>{"Dilin genel renk tonu"}</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' as const }}>
                    {['acik_pembe', 'pembe', 'kirmizi', 'koyu_kirmizi', 'morumsu', 'soluk'].map(v => (
                      <button key={v} onClick={() => set('dil_renk', v)}
                        style={{
                          padding: '6px 12px', borderRadius: 6, fontSize: 11, cursor: 'pointer',
                          border: `1.5px solid ${form.dil_renk === v ? C.gold : C.border}`,
                          background: form.dil_renk === v ? C.gold : C.white,
                          color: form.dil_renk === v ? C.primary : C.secondary,
                          fontWeight: form.dil_renk === v ? 600 : 400,
                        }}
                      >{v.replace('_', ' ')}</button>
                    ))}
                  </div>
                </div>
                <div style={s.card}>
                  <label style={s.label}>{"DIL KAPLAMASI"}</label>
                  <div style={{ fontSize: 11, color: '#999', marginBottom: 8 }}>{"Dil uzerindeki tabaka"}</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' as const }}>
                    {['yok', 'ince_beyaz', 'kalin_beyaz', 'sari', 'gri', 'siyah'].map(v => (
                      <button key={v} onClick={() => set('dil_kaplama', v)}
                        style={{
                          padding: '6px 12px', borderRadius: 6, fontSize: 11, cursor: 'pointer',
                          border: `1.5px solid ${form.dil_kaplama === v ? C.gold : C.border}`,
                          background: form.dil_kaplama === v ? C.gold : C.white,
                          color: form.dil_kaplama === v ? C.primary : C.secondary,
                          fontWeight: form.dil_kaplama === v ? 600 : 400,
                        }}
                      >{v.replace('_', ' ')}</button>
                    ))}
                  </div>
                </div>
                <div style={s.card}>
                  <label style={s.label}>{"DIL NEMI"}</label>
                  <div style={{ fontSize: 11, color: '#999', marginBottom: 8 }}>{"Dilin nemlilik durumu"}</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {['kuru', 'normal', 'nemli', 'cok_nemli'].map(v => (
                      <button key={v} onClick={() => set('dil_nem', v)}
                        style={{
                          padding: '6px 12px', borderRadius: 6, fontSize: 11, cursor: 'pointer',
                          border: `1.5px solid ${form.dil_nem === v ? C.gold : C.border}`,
                          background: form.dil_nem === v ? C.gold : C.white,
                          color: form.dil_nem === v ? C.primary : C.secondary,
                          fontWeight: form.dil_nem === v ? 600 : 400,
                        }}
                      >{v.replace('_', ' ')}</button>
                    ))}
                  </div>
                </div>
                <div style={s.card}>
                  <label style={s.label}>{"DIL SEKLI"}</label>
                  <div style={{ fontSize: 11, color: '#999', marginBottom: 8 }}>{"Dilin genel formu"}</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' as const }}>
                    {['normal', 'siskin', 'ince', 'dis_izli', 'catlaklı'].map(v => (
                      <button key={v} onClick={() => set('dil_sekil', v)}
                        style={{
                          padding: '6px 12px', borderRadius: 6, fontSize: 11, cursor: 'pointer',
                          border: `1.5px solid ${form.dil_sekil === v ? C.gold : C.border}`,
                          background: form.dil_sekil === v ? C.gold : C.white,
                          color: form.dil_sekil === v ? C.primary : C.secondary,
                          fontWeight: form.dil_sekil === v ? 600 : 400,
                        }}
                      >{v.replace('_', ' ')}</button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Yuz Fields */}
              <div style={s.sectionTitle}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 10-16 0"/></svg>
                {"Yuz Gozlemi"}
              </div>
              <div style={s.grid2} className="analiz-grid2">
                <div style={s.card}>
                  <label style={s.label}>{"TEN RENGI"}</label>
                  <div style={{ fontSize: 11, color: '#999', marginBottom: 8 }}>{"Yuzun genel renk tonu"}</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' as const }}>
                    {['soluk', 'acik', 'normal', 'kizarik', 'sarimsi', 'esmer'].map(v => (
                      <button key={v} onClick={() => set('yuz_ten', v)}
                        style={{
                          padding: '6px 12px', borderRadius: 6, fontSize: 11, cursor: 'pointer',
                          border: `1.5px solid ${form.yuz_ten === v ? C.gold : C.border}`,
                          background: form.yuz_ten === v ? C.gold : C.white,
                          color: form.yuz_ten === v ? C.primary : C.secondary,
                          fontWeight: form.yuz_ten === v ? 600 : 400,
                        }}
                      >{v}</button>
                    ))}
                  </div>
                </div>
                <div style={s.card}>
                  <label style={s.label}>{"YUZ SEKLI"}</label>
                  <div style={{ fontSize: 11, color: '#999', marginBottom: 8 }}>{"Yuzun genel formu"}</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' as const }}>
                    {['yuvarlak', 'oval', 'uzun', 'kare', 'ucgen'].map(v => (
                      <button key={v} onClick={() => set('yuz_sekil', v)}
                        style={{
                          padding: '6px 12px', borderRadius: 6, fontSize: 11, cursor: 'pointer',
                          border: `1.5px solid ${form.yuz_sekil === v ? C.gold : C.border}`,
                          background: form.yuz_sekil === v ? C.gold : C.white,
                          color: form.yuz_sekil === v ? C.primary : C.secondary,
                          fontWeight: form.yuz_sekil === v ? 600 : 400,
                        }}
                      >{v}</button>
                    ))}
                  </div>
                </div>
                <div style={s.card}>
                  <label style={s.label}>{"CILT DURUMU"}</label>
                  <div style={{ fontSize: 11, color: '#999', marginBottom: 8 }}>{"Yuz cildinin durumu"}</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' as const }}>
                    {['kuru', 'normal', 'yagly', 'karisik', 'hassas'].map(v => (
                      <button key={v} onClick={() => set('yuz_cilt', v)}
                        style={{
                          padding: '6px 12px', borderRadius: 6, fontSize: 11, cursor: 'pointer',
                          border: `1.5px solid ${form.yuz_cilt === v ? C.gold : C.border}`,
                          background: form.yuz_cilt === v ? C.gold : C.white,
                          color: form.yuz_cilt === v ? C.primary : C.secondary,
                          fontWeight: form.yuz_cilt === v ? 600 : 400,
                        }}
                      >{v}</button>
                    ))}
                  </div>
                </div>
                <div style={s.card}>
                  <label style={s.label}>{"GOZ ALTI"}</label>
                  <div style={{ fontSize: 11, color: '#999', marginBottom: 8 }}>{"Goz alti gorunumu"}</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' as const }}>
                    {['normal', 'morumsu', 'siskin', 'cokuk', 'koyu_halka'].map(v => (
                      <button key={v} onClick={() => set('yuz_gozalti', v)}
                        style={{
                          padding: '6px 12px', borderRadius: 6, fontSize: 11, cursor: 'pointer',
                          border: `1.5px solid ${form.yuz_gozalti === v ? C.gold : C.border}`,
                          background: form.yuz_gozalti === v ? C.gold : C.white,
                          color: form.yuz_gozalti === v ? C.primary : C.secondary,
                          fontWeight: form.yuz_gozalti === v ? 600 : 400,
                        }}
                      >{v.replace('_', ' ')}</button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
            <button onClick={() => setAdim(3)} style={{ padding: '10px 24px', border: `1px solid ${C.border}`, borderRadius: 8, background: C.white, color: C.secondary, cursor: 'pointer', fontSize: 13 }}>{"\u2190 Geri"}</button>
            <button onClick={() => setAdim(5)} style={{ padding: '10px 28px', background: C.primary, border: 'none', borderRadius: 8, color: C.gold, cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: cinzel.style.fontFamily }}>{"Ileri \u2192"}</button>
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

      {/* WhatsApp yardim butonu — sabit */}
      <a
        href="https://wa.me/905331687226?text=Merhaba%2C%20analiz%20formunda%20yardim%20istiyorum."
        target="_blank"
        rel="noopener noreferrer"
        style={{ position: 'fixed' as const, bottom: 20, right: 20, zIndex: 9998, display: 'flex', alignItems: 'center', gap: 10, background: '#25D366', color: 'white', padding: '12px 18px', borderRadius: 30, textDecoration: 'none', fontFamily: 'Roboto, sans-serif', fontSize: 13, fontWeight: 500, boxShadow: '0 4px 16px rgba(37,211,102,0.35)' }}
        className="analiz-wa-fixed"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.136.563 4.14 1.544 5.877L.057 23.943l6.25-1.508A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg>
        <span className="analiz-wa-text">{"Takıldınız mı? WhatsApp'tan sorun"}</span>
      </a>

      {/* eslint-disable-next-line react/no-unknown-property */}
      <style jsx global>{`
        @media (max-width: 768px) {
          .analiz-grid2, .analiz-grid3 { grid-template-columns: 1fr !important; }
          .analiz-step-nav { display: none !important; }
          .analiz-wa-text { display: none !important; }
          .analiz-wa-fixed { padding: 14px !important; border-radius: 50% !important; }
        }
      `}</style>
      <Footer />
    </div>
  )
}
