'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Cinzel } from 'next/font/google'

const cinzel = Cinzel({ subsets: ['latin'], weight: ['400', '600'] })
const C = { primary: '#1B4332', gold: '#C9A84C', cream: '#F5EFE6', border: '#E0D5C5', surface: '#FAF7F2', white: '#FFFFFF' }

interface PPGProps {
  onSonuc: (sonuc: {
    bpm: number
    sifatlar: Record<string, string>
    kalite: number
  }) => void
}

// IIR filter helpers
function iirLowpass(prev: number, cur: number, alpha: number) { return alpha * cur + (1 - alpha) * prev }
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function iirHighpass(prev: number, cur: number, alpha: number) { return alpha * (prev + cur) }

function ppgSifatHesapla(bpm: number, amplitudes: number[], intervals: number[], snr: number): Record<string, string> {
  const meanAmp = amplitudes.length > 0 ? amplitudes.reduce((a, b) => a + b, 0) / amplitudes.length : 0
  const normAmp = Math.min(meanAmp / 255, 1)

  // 1. Buyukluk
  const buyukluk = normAmp > 0.15 ? 'buyuk' : normAmp < 0.05 ? 'kucuk' : 'orta'

  // 2. Kuvvet
  const kuvvet = snr > 4.5 ? 'kuvvetli' : snr < 3.0 ? 'zayif' : 'orta'

  // 3. Hiz
  let hiz = 'orta'
  if (bpm < 60) hiz = 'yavas'
  else if (bpm > 100) hiz = 'hizli'

  // 4. Dolgunluk — width ratio approx from intervals
  const meanInterval = intervals.length > 0 ? intervals.reduce((a, b) => a + b, 0) / intervals.length : 700
  const widthRatio = meanInterval > 0 ? Math.min(meanAmp / (meanInterval * 0.5), 1) : 0.3
  const dolgunluk = widthRatio > 0.45 ? 'dolu' : widthRatio < 0.28 ? 'bos' : 'orta'

  // 5. Sertlik — rise slope approximation
  const sertlik = normAmp > 0.12 && meanInterval < 650 ? 'sert' : normAmp < 0.06 ? 'yumusak' : 'orta'

  // 6. Ritim — RR variation
  let ritim = 'muntazam'
  if (intervals.length > 3) {
    const rrMean = intervals.reduce((a, b) => a + b, 0) / intervals.length
    const rrStd = Math.sqrt(intervals.reduce((s, v) => s + (v - rrMean) ** 2, 0) / intervals.length)
    const rrCv = (rrStd / rrMean) * 100
    if (rrCv > 15) ritim = 'duzensiz'
    else if (rrCv > 5) ritim = 'hafif_duzensiz'
  }

  // 7. Esitlik — amplitude variation
  let esitlik = 'esit'
  if (amplitudes.length > 3) {
    const ampMean = amplitudes.reduce((a, b) => a + b, 0) / amplitudes.length
    const ampStd = Math.sqrt(amplitudes.reduce((s, v) => s + (v - ampMean) ** 2, 0) / amplitudes.length)
    const ampCv = (ampStd / ampMean) * 100
    if (ampCv > 15) esitlik = 'esitsiz'
    else if (ampCv > 10) esitlik = 'hafif_esitsiz'
  }

  // 8. Sureklitik
  const sureklitik = intervals.length > 15 ? 'surekli' : intervals.length > 8 ? 'hafif_kesik' : 'kesik'

  return { buyukluk, kuvvet, hiz, dolgunluk, sertlik, ritim, esitlik, sureklitik }
}

export default function PPGNabiz({ onSonuc }: PPGProps) {
  const [durum, setDurum] = useState<'bekliyor' | 'calisiyor' | 'tamamlandi'>('bekliyor')
  const [bpm, setBpm] = useState(0)
  const [kalite, setKalite] = useState(0)
  const [kalanSaniye, setKalanSaniye] = useState(30)
  const [stableCount, setStableCount] = useState(0)
  const [hata, setHata] = useState('')

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animFrameRef = useRef<number>(0)
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // PPG signal buffers
  const signalRef = useRef<number[]>([])
  const peakTimesRef = useRef<number[]>([])
  const amplitudesRef = useRef<number[]>([])
  const intervalsRef = useRef<number[]>([])
  const prevLowRef = useRef(0)
  const prevHighRef = useRef(0)
  const prevRawRef = useRef(0)

  const durdur = useCallback(() => {
    if (countdownRef.current) clearInterval(countdownRef.current)
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }

    const ints = intervalsRef.current
    const amps = amplitudesRef.current
    if (ints.length < 3) {
      setHata('Yeterli veri toplanamadi. Tekrar deneyin.')
      setDurum('bekliyor')
      return
    }

    // IQR outlier rejection
    const sorted = [...ints].sort((a, b) => a - b)
    const q1 = sorted[Math.floor(sorted.length * 0.25)]
    const q3 = sorted[Math.floor(sorted.length * 0.75)]
    const iqr = q3 - q1
    const filtered = ints.filter(v => v >= q1 - 1.5 * iqr && v <= q3 + 1.5 * iqr)

    if (filtered.length < 2) {
      setHata('Sinyal kalitesi dusuk. Tekrar deneyin.')
      setDurum('bekliyor')
      return
    }

    const meanInterval = filtered.reduce((a, b) => a + b, 0) / filtered.length
    const finalBpm = Math.round(60000 / meanInterval)

    // Fizyolojik kontrol
    if (finalBpm < 30 || finalBpm > 220) {
      setHata(`Gecersiz BPM: ${finalBpm}. Tekrar deneyin.`)
      setDurum('bekliyor')
      return
    }

    const snr = kalite * 10
    const sifatlar = ppgSifatHesapla(finalBpm, amps, filtered, snr)

    setBpm(finalBpm)
    setDurum('tamamlandi')
    onSonuc({ bpm: finalBpm, sifatlar, kalite })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kalite, onSonuc])

  async function baslat() {
    setHata('')
    setDurum('calisiyor')
    setKalanSaniye(30)
    setStableCount(0)
    setBpm(0)
    setKalite(0)
    signalRef.current = []
    peakTimesRef.current = []
    amplitudesRef.current = []
    intervalsRef.current = []
    prevLowRef.current = 0
    prevHighRef.current = 0
    prevRawRef.current = 0

    try {
      // Kamera listele
      const devices = await navigator.mediaDevices.enumerateDevices()
      const cameras = devices.filter(d => d.kind === 'videoinput')

      // iPhone/Sureklilik kamerasini tercih et
      let selectedId = cameras[0]?.deviceId
      const iphoneCam = cameras.find(c => c.label.toLowerCase().includes('iphone') || c.label.toLowerCase().includes('continuity'))
      if (iphoneCam) selectedId = iphoneCam.deviceId

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: selectedId ? { exact: selectedId } : undefined, width: 320, height: 240, frameRate: 30 }
      })
      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }

      // Countdown
      let saniye = 30
      countdownRef.current = setInterval(() => {
        saniye--
        setKalanSaniye(saniye)
        if (saniye <= 0) {
          if (countdownRef.current) clearInterval(countdownRef.current)
          durdur()
        }
      }, 1000)

      // PPG processing loop
      const ctx = canvasRef.current?.getContext('2d', { willReadFrequently: true })
      if (!ctx || !canvasRef.current) return

      let localStable = 0

      const processFrame = () => {
        if (!videoRef.current || !ctx || !canvasRef.current) return

        ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height)
        const imageData = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height)
        const pixels = imageData.data

        // Channel selection: red for most cameras
        let sum = 0
        let count = 0
        for (let i = 0; i < pixels.length; i += 16) { // sample every 4th pixel
          sum += pixels[i] // red channel
          count++
        }
        const raw = sum / count

        // IIR Bandpass filter
        const lowpassed = iirLowpass(prevLowRef.current, raw, 0.45)
        prevLowRef.current = lowpassed
        const highpassed = 0.97 * (prevHighRef.current + lowpassed - prevRawRef.current)
        prevHighRef.current = highpassed
        prevRawRef.current = lowpassed

        signalRef.current.push(highpassed)
        if (signalRef.current.length > 300) signalRef.current.shift()

        // Peak detection with adaptive threshold
        const sig = signalRef.current
        if (sig.length > 30) {
          const recent = sig.slice(-30)
          const mean = recent.reduce((a, b) => a + b, 0) / recent.length
          const std = Math.sqrt(recent.reduce((s, v) => s + (v - mean) ** 2, 0) / recent.length)
          const threshold = mean + std * 0.4

          const now = performance.now()
          const lastPeak = peakTimesRef.current[peakTimesRef.current.length - 1] || 0
          const refractory = 250 // ms

          if (highpassed > threshold && (now - lastPeak) > refractory) {
            peakTimesRef.current.push(now)
            amplitudesRef.current.push(Math.abs(highpassed))

            if (peakTimesRef.current.length > 1) {
              const interval = now - peakTimesRef.current[peakTimesRef.current.length - 2]
              if (interval > 200 && interval < 2000) {
                intervalsRef.current.push(interval)

                const currentBpm = Math.round(60000 / interval)
                if (currentBpm >= 40 && currentBpm <= 200) {
                  setBpm(currentBpm)
                  const q = Math.min(std / (mean + 0.01), 1)
                  setKalite(q)

                  if (q >= 0.6 && currentBpm >= 40 && currentBpm <= 200) {
                    localStable++
                    setStableCount(localStable)
                    if (localStable >= 20) {
                      durdur()
                      return
                    }
                  }
                }
              }
            }
          }
        }

        // Draw waveform
        if (canvasRef.current) {
          const wCtx = canvasRef.current.getContext('2d')
          if (wCtx) {
            wCtx.fillStyle = '#111'
            wCtx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height)
            wCtx.strokeStyle = C.gold
            wCtx.lineWidth = 1.5
            wCtx.beginPath()
            const displaySig = sig.slice(-200)
            for (let i = 0; i < displaySig.length; i++) {
              const x = (i / displaySig.length) * canvasRef.current.width
              const y = canvasRef.current.height / 2 - displaySig[i] * 3
              if (i === 0) wCtx.moveTo(x, y)
              else wCtx.lineTo(x, y)
            }
            wCtx.stroke()
          }
        }

        animFrameRef.current = requestAnimationFrame(processFrame)
      }

      animFrameRef.current = requestAnimationFrame(processFrame)
    } catch (err) {
      setHata('Kamera erisimi reddedildi veya hata olustu.')
      setDurum('bekliyor')
      console.error('PPG hata:', err)
    }
  }

  // Cleanup
  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current)
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
    }
  }, [])

  const kaliteRenk = kalite < 0.35 ? '#C62828' : kalite < 0.6 ? '#F57C00' : '#2E7D32'
  const kaliteMetin = kalite < 0.35 ? 'Zayif sinyal' : kalite < 0.6 ? 'Orta sinyal' : 'Iyi sinyal'

  return (
    <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: '20px 24px' }}>
      <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 12, color: C.gold, letterSpacing: 2, marginBottom: 12 }}>
        {"NABIZ OLCUMU — PPG"}
      </div>

      {durum === 'bekliyor' && (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <p style={{ fontSize: 13, color: '#666', marginBottom: 16 }}>
            {"Parmagınızı arka kameraya hafifce bastırın. 30 saniye bekleyin."}
          </p>
          <button onClick={baslat}
            style={{ padding: '12px 28px', background: C.primary, border: 'none', borderRadius: 10, color: C.gold, fontFamily: cinzel.style.fontFamily, fontSize: 13, fontWeight: 600, cursor: 'pointer', letterSpacing: 1 }}>
            {"Olcumu Baslat"}
          </button>
          {hata && <p style={{ color: '#C62828', fontSize: 12, marginTop: 10 }}>{hata}</p>}
        </div>
      )}

      {durum === 'calisiyor' && (
        <div>
          {/* Countdown */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 11, color: '#666' }}>{"Parmagınızı tutun..."}</span>
            <span style={{ fontFamily: cinzel.style.fontFamily, fontSize: 20, color: C.primary, fontWeight: 600 }}>{kalanSaniye}s</span>
          </div>

          {/* Video (hidden) + Canvas (waveform) */}
          <video ref={videoRef} style={{ display: 'none' }} playsInline muted />
          <canvas ref={canvasRef} width={280} height={80}
            style={{ width: '100%', height: 80, borderRadius: 8, background: '#111', marginBottom: 10 }} />

          {/* BPM */}
          {bpm > 0 && (
            <div style={{ textAlign: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 36, fontWeight: 600, color: C.primary, fontFamily: cinzel.style.fontFamily }}>{bpm}</span>
              <span style={{ fontSize: 14, color: '#666', marginLeft: 4 }}>BPM</span>
            </div>
          )}

          {/* SNR kalite cubugu */}
          <div style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#999', marginBottom: 4 }}>
              <span>Sinyal Kalitesi</span>
              <span style={{ color: kaliteRenk }}>{kaliteMetin} ({Math.round(kalite * 100)}%)</span>
            </div>
            <div style={{ height: 4, background: '#eee', borderRadius: 2 }}>
              <div style={{ height: 4, background: kaliteRenk, borderRadius: 2, width: `${Math.min(kalite * 100, 100)}%`, transition: 'width 0.3s' }} />
            </div>
          </div>

          <div style={{ fontSize: 10, color: '#999', textAlign: 'center' }}>
            {"Stabil okuma:"} {stableCount}/20
          </div>
        </div>
      )}

      {durum === 'tamamlandi' && (
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <div style={{ fontSize: 48, fontWeight: 600, color: C.primary, fontFamily: cinzel.style.fontFamily }}>{bpm}</div>
          <div style={{ fontSize: 14, color: '#666', marginBottom: 12 }}>BPM</div>
          <div style={{ fontSize: 12, color: '#2E7D32', marginBottom: 16 }}>
            {"\u2713 8/8 sifat otomatik dolduruldu"}
          </div>
          <button onClick={() => { setDurum('bekliyor'); setHata('') }}
            style={{ padding: '8px 20px', background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 8, color: '#666', fontSize: 12, cursor: 'pointer' }}>
            {"Yeniden Olc"}
          </button>
        </div>
      )}
    </div>
  )
}
