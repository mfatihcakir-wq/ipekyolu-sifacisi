'use client'
import { useState, useEffect } from 'react'

interface Kaynak {
  kaynak_kodu: string
  eser_adi: string
  hekim_adi: string
  kayit_sayisi: number
}

interface KonuOneri {
  konu: string
  kategori: string
  kaynak_kodu: string
  aciklama: string
}

type Sekme = 'uret' | 'oneri'
type Durum = 'bos' | 'uretiliyor' | 'onizleme' | 'kaydedildi' | 'hata'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Onizleme = any

const KATEGORILER = [
  'TEMEL KAVRAMLAR', 'NABIZ İLMİ', 'BESİN İLMİ', 'CERRAHİ',
  'DEVÂ İLMİ', 'RUHSAL SAĞLIK', 'MEVSİM TEDAVİSİ',
  'BİTKİ REHBERİ', 'HEKİM BİYOGRAFİSİ', 'HASTALIK TEŞHİSİ'
]

export default function MakaleUret() {
  const [sekme, setSekme] = useState<Sekme>('uret')
  const [kaynaklar, setKaynaklar] = useState<Kaynak[]>([])
  const [konuOnerileri, setKonuOnerileri] = useState<KonuOneri[]>([])
  const [oneriYukleniyor, setOneriYukleniyor] = useState(false)
  const [konu, setKonu] = useState('')
  const [kategori, setKategori] = useState(KATEGORILER[0])
  const [seciliKaynaklar, setSeciliKaynaklar] = useState<string[]>([])
  const [durum, setDurum] = useState<Durum>('bos')
  const [onizleme, setOnizleme] = useState<Onizleme>(null)
  const [hata, setHata] = useState('')

  useEffect(() => {
    fetch('/api/kaynaklar')
      .then(r => r.json())
      .then(d => { if (d.kaynaklar) setKaynaklar(d.kaynaklar) })
      .catch(() => {})
  }, [])

  const toggleKaynak = (kod: string) => {
    setSeciliKaynaklar(prev =>
      prev.includes(kod) ? prev.filter(k => k !== kod) : [...prev, kod]
    )
  }

  const oneriUret = async () => {
    setOneriYukleniyor(true)
    setKonuOnerileri([])
    try {
      const res = await fetch('/api/makale/oneri', { method: 'POST' })
      const d = await res.json()
      if (d.oneriler) setKonuOnerileri(d.oneriler)
    } catch (e) {
      console.error(e)
    }
    setOneriYukleniyor(false)
  }

  const konuSec = (o: KonuOneri) => {
    setKonu(o.konu)
    setKategori(o.kategori)
    setSeciliKaynaklar([o.kaynak_kodu])
    setSekme('uret')
  }

  const uret = async () => {
    if (!konu.trim()) return
    setDurum('uretiliyor')
    setHata('')
    try {
      const res = await fetch('/api/makale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ konu: konu.trim(), kategori, kaynak_kodlar: seciliKaynaklar })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Bilinmeyen hata')
      setOnizleme(data)
      setDurum('onizleme')
    } catch (e) {
      setHata(e instanceof Error ? e.message : String(e))
      setDurum('hata')
    }
  }

  const yayinla = async () => {
    if (!onizleme?.makale?.id) return
    try {
      await fetch('/api/makale', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: onizleme.makale.id, yayinda: true })
      })
      setDurum('kaydedildi')
    } catch (e) { setHata(e instanceof Error ? e.message : String(e)) }
  }

  const sifirla = () => { setKonu(''); setOnizleme(null); setDurum('bos'); setHata('') }

  const s = {
    kart: { background: '#1A2E1E', borderRadius: 16, padding: 32, border: '1px solid rgba(212,168,67,0.12)' } as React.CSSProperties,
    label: { fontFamily: 'Cormorant Garamond,serif', fontSize: 9, letterSpacing: 2, color: 'rgba(212,168,67,0.5)', display: 'block' as const, marginBottom: 8 } as React.CSSProperties,
    input: { width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,168,67,0.2)', borderRadius: 10, color: '#F5EAD4', fontFamily: 'EB Garamond,serif', fontSize: 17, outline: 'none' } as React.CSSProperties,
  }

  return (
    <div style={s.kart}>
      <div style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 9, letterSpacing: 3, color: 'rgba(212,168,67,0.5)', marginBottom: 6 }}>YAPAY ZEKA İLE</div>
      <div style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 22, fontWeight: 600, color: '#F5EAD4', marginBottom: 24 }}>Makale Üret</div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
        {(['uret', 'oneri'] as Sekme[]).map(sk => (
          <button key={sk} onClick={() => { setSekme(sk); if (sk === 'oneri' && konuOnerileri.length === 0) oneriUret() }}
            style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 10, letterSpacing: 2, padding: '8px 20px', borderRadius: 8, cursor: 'pointer', border: '1px solid',
              borderColor: sekme === sk ? 'rgba(212,168,67,0.6)' : 'rgba(212,168,67,0.2)',
              background: sekme === sk ? 'rgba(212,168,67,0.12)' : 'transparent',
              color: sekme === sk ? '#D4A843' : 'rgba(245,234,212,0.4)' }}>
            {sk === 'uret' ? 'MAKALE ÜRET' : 'KONU ÖNERİLERİ'}
          </button>
        ))}
      </div>

      {sekme === 'oneri' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ fontFamily: 'EB Garamond,serif', fontSize: 15, color: 'rgba(245,234,212,0.5)', fontStyle: 'italic' }}>
              Veritabanındaki metinlerden otomatik üretilen konu önerileri
            </div>
            <button onClick={oneriUret} disabled={oneriYukleniyor}
              style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 9, letterSpacing: 2, color: '#D4A843', background: 'transparent', border: '1px solid rgba(212,168,67,0.3)', padding: '7px 16px', borderRadius: 8, cursor: 'pointer' }}>
              {oneriYukleniyor ? 'YENİLENİYOR...' : 'YENİLE'}
            </button>
          </div>
          {oneriYukleniyor && (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'rgba(212,168,67,0.4)', fontFamily: 'Cormorant Garamond,serif', fontSize: 12, letterSpacing: 2 }}>
              VERİTABANINDAN KONULAR ÜRETİLİYOR...
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {konuOnerileri.map((o, i) => (
              <div key={i} onClick={() => konuSec(o)}
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(212,168,67,0.1)', borderRadius: 10, padding: '16px 20px', cursor: 'pointer', transition: 'all 0.2s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <div style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 15, fontWeight: 600, color: '#F5EAD4', flex: 1 }}>{o.konu}</div>
                  <div style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 8, letterSpacing: 2, color: '#D4A843', padding: '3px 10px', border: '1px solid rgba(212,168,67,0.25)', borderRadius: 20, marginLeft: 12, whiteSpace: 'nowrap' as const }}>{o.kategori}</div>
                </div>
                <div style={{ fontFamily: 'EB Garamond,serif', fontSize: 13, color: 'rgba(245,234,212,0.4)', fontStyle: 'italic', marginBottom: 8 }}>{o.aciklama}</div>
                <div style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 8, color: 'rgba(212,168,67,0.35)', letterSpacing: 1 }}>
                  KAYNAK: {o.kaynak_kodu} · Seç →
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {sekme === 'uret' && durum === 'kaydedildi' && (
        <div style={{ textAlign: 'center' as const, padding: '32px 0' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>{"\u2705"}</div>
          <div style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 16, color: '#F5EAD4', marginBottom: 8 }}>Makale yayınlandı!</div>
          <button onClick={sifirla} style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 10, letterSpacing: 2, color: '#D4A843', background: 'transparent', border: '1px solid rgba(212,168,67,0.25)', padding: '10px 24px', borderRadius: 8, cursor: 'pointer', marginTop: 12 }}>
            YENİ MAKALE ÜRET
          </button>
        </div>
      )}

      {sekme === 'uret' && durum === 'onizleme' && onizleme && (
        <div>
          <div style={{ background: 'rgba(212,168,67,0.04)', border: '1px solid rgba(212,168,67,0.15)', borderRadius: 12, padding: 24, marginBottom: 20 }}>
            <div style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 9, letterSpacing: 2, color: 'rgba(212,168,67,0.4)', marginBottom: 8 }}>ÖNİZLEME</div>
            {onizleme.onizleme?.baslik_ar && (
              <div style={{ fontFamily: 'serif', fontSize: 16, color: 'rgba(212,168,67,0.4)', direction: 'rtl' as const, marginBottom: 6 }}>{onizleme.onizleme.baslik_ar}</div>
            )}
            <div style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 18, fontWeight: 600, color: '#F5EAD4', marginBottom: 12 }}>{onizleme.onizleme?.baslik}</div>
            <div style={{ fontFamily: 'EB Garamond,serif', fontSize: 15, fontStyle: 'italic', color: 'rgba(245,234,212,0.5)', lineHeight: 1.7, marginBottom: 16 }}>{onizleme.onizleme?.ozet}</div>
            <div style={{ fontFamily: 'EB Garamond,serif', fontSize: 14, color: 'rgba(245,234,212,0.4)', lineHeight: 1.7, maxHeight: 200, overflow: 'auto' }}>
              {onizleme.onizleme?.icerik?.substring(0, 600)}...
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={yayinla} style={{ flex: 1, fontFamily: 'Cormorant Garamond,serif', fontSize: 10, letterSpacing: 2, fontWeight: 700, color: '#1A2E1E', background: '#D4A843', border: 'none', padding: 14, borderRadius: 10, cursor: 'pointer' }}>YAYINLA</button>
            <button onClick={sifirla} style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 10, letterSpacing: 2, color: 'rgba(245,234,212,0.4)', background: 'transparent', border: '1px solid rgba(245,234,212,0.1)', padding: '14px 24px', borderRadius: 10, cursor: 'pointer' }}>İPTAL</button>
          </div>
        </div>
      )}

      {sekme === 'uret' && !['kaydedildi', 'onizleme'].includes(durum) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={s.label}>KONU</label>
            <input value={konu} onChange={e => setKonu(e.target.value)}
              placeholder="ör: Safravî mizaçta baş ağrısı tedavisi"
              style={s.input} />
          </div>
          <div>
            <label style={s.label}>KATEGORİ</label>
            <select value={kategori} onChange={e => setKategori(e.target.value)} style={s.input}>
              {KATEGORILER.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>
          <div>
            <label style={s.label}>KAYNAKLAR — VERİTABANINDAKİ ESERLER</label>
            <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 8 }}>
              {kaynaklar.length === 0 && (
                <div style={{ fontFamily: 'EB Garamond,serif', fontSize: 13, color: 'rgba(245,234,212,0.3)', fontStyle: 'italic' }}>Kaynaklar yükleniyor...</div>
              )}
              {kaynaklar.map(k => (
                <button key={k.kaynak_kodu} onClick={() => toggleKaynak(k.kaynak_kodu)}
                  style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 9, letterSpacing: 1, padding: '6px 14px', borderRadius: 20, cursor: 'pointer', border: '1px solid',
                    borderColor: seciliKaynaklar.includes(k.kaynak_kodu) ? 'rgba(212,168,67,0.6)' : 'rgba(212,168,67,0.15)',
                    background: seciliKaynaklar.includes(k.kaynak_kodu) ? 'rgba(212,168,67,0.15)' : 'transparent',
                    color: seciliKaynaklar.includes(k.kaynak_kodu) ? '#D4A843' : 'rgba(245,234,212,0.4)' }}>
                  {k.hekim_adi} — {k.eser_adi} ({k.kayit_sayisi.toLocaleString('tr-TR')})
                </button>
              ))}
            </div>
          </div>
          {hata && (
            <div style={{ color: '#EF5350', fontFamily: 'EB Garamond,serif', fontSize: 14, padding: '10px 16px', background: 'rgba(239,83,80,0.08)', borderRadius: 8 }}>{hata}</div>
          )}
          <button onClick={uret} disabled={!konu.trim() || durum === 'uretiliyor'}
            style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: 11, letterSpacing: 3, fontWeight: 700,
              color: !konu.trim() ? 'rgba(26,46,30,0.5)' : '#1A2E1E',
              background: !konu.trim() ? 'rgba(212,168,67,0.3)' : '#D4A843',
              border: 'none', padding: 16, borderRadius: 10, cursor: 'pointer', opacity: durum === 'uretiliyor' ? 0.7 : 1 }}>
            {durum === 'uretiliyor' ? '⟳ MAKALE ÜRETİLİYOR...' : '✦ MAKALE ÜRET'}
          </button>
        </div>
      )}
    </div>
  )
}
