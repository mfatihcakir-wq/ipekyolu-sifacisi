'use client'

import { useState } from 'react'

const KATEGORILER = [
  'TEMEL KAVRAMLAR',
  'NABIZ ILMI',
  'ECZACILIK',
  'TEDAVI YONTEMLERI',
  'BESLENME',
  'RUHANI TIP',
  'CERRAHI',
  'KADIN SAGLIGI',
  'COCUK SAGLIGI',
]

const KAYNAKLAR = [
  { kod: 'SRC-001', etiket: 'El-Kanun' },
  { kod: 'SRC-002', etiket: 'Kitab el-Havi' },
  { kod: 'SRC-003', etiket: 'Tibb-i Nebevi' },
  { kod: 'SRC-006', etiket: 'el-Mufredat' },
  { kod: 'SRC-007', etiket: 'et-Tasrif' },
  { kod: 'SRC-010', etiket: 'Kamil es-Sinaa' },
]

interface MakaleOnizleme {
  baslik: string
  baslik_ar: string
  ozet: string
  icerik: string
}

interface MakaleKayit {
  id: string
  baslik: string
  slug: string
  yayinda: boolean
}

export default function MakaleUret() {
  const [konu, setKonu] = useState('')
  const [kategori, setKategori] = useState(KATEGORILER[0])
  const [seciliKaynaklar, setSeciliKaynaklar] = useState<string[]>([])
  const [yukleniyor, setYukleniyor] = useState(false)
  const [onizleme, setOnizleme] = useState<MakaleOnizleme | null>(null)
  const [makale, setMakale] = useState<MakaleKayit | null>(null)
  const [yayinlandi, setYayinlandi] = useState(false)
  const [hata, setHata] = useState('')

  const kaynakToggle = (kod: string) => {
    setSeciliKaynaklar(prev =>
      prev.includes(kod)
        ? prev.filter(k => k !== kod)
        : [...prev, kod]
    )
  }

  const makaleUret = async () => {
    if (!konu.trim()) {
      setHata('Lutfen bir konu giriniz')
      return
    }

    setYukleniyor(true)
    setHata('')
    setOnizleme(null)
    setMakale(null)
    setYayinlandi(false)

    try {
      const res = await fetch('/api/makale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          konu: konu.trim(),
          kategori,
          kaynak_kodlar: seciliKaynaklar.length > 0 ? seciliKaynaklar : undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setHata(data.error || 'Makale uretilemedi')
        return
      }

      setOnizleme(data.preview)
      setMakale(data.makale)
    } catch {
      setHata('Baglanti hatasi olustu')
    } finally {
      setYukleniyor(false)
    }
  }

  const yayinla = async () => {
    if (!makale) return

    setYukleniyor(true)
    setHata('')

    try {
      const res = await fetch('/api/makale', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: makale.id, yayinda: true }),
      })

      const data = await res.json()

      if (!res.ok) {
        setHata(data.error || 'Yayinlama basarisiz')
        return
      }

      setYayinlandi(true)
    } catch {
      setHata('Baglanti hatasi olustu')
    } finally {
      setYukleniyor(false)
    }
  }

  const sifirla = () => {
    setKonu('')
    setKategori(KATEGORILER[0])
    setSeciliKaynaklar([])
    setOnizleme(null)
    setMakale(null)
    setYayinlandi(false)
    setHata('')
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '60px 24px' }}>
      <div style={{
        background: '#1A2E1E',
        borderRadius: 20,
        padding: '48px 40px',
        border: '1px solid rgba(212,168,67,0.15)',
      }}>
        <h2 style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: 28,
          fontWeight: 700,
          color: '#F5EAD4',
          marginBottom: 8,
          textAlign: 'center' as const,
        }}>
          {"Makale Uretici"}
        </h2>
        <p style={{
          fontSize: 15,
          color: 'rgba(245,234,212,0.5)',
          textAlign: 'center' as const,
          marginBottom: 40,
        }}>
          {"Klasik kaynaklardan derlenmiş makale üretimi"}
        </p>

        {/* Basari Durumu */}
        {yayinlandi && (
          <div style={{
            background: 'rgba(76,175,80,0.12)',
            border: '1px solid rgba(76,175,80,0.3)',
            borderRadius: 12,
            padding: '32px 24px',
            textAlign: 'center' as const,
            marginBottom: 32,
          }}>
            <div style={{ fontSize: 24, marginBottom: 12 }}>{"\u2713"}</div>
            <div style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: 20,
              fontWeight: 700,
              color: '#4CAF50',
              marginBottom: 8,
            }}>
              {"Makale Yayinlandi"}
            </div>
            <p style={{ fontSize: 14, color: 'rgba(245,234,212,0.6)', marginBottom: 20 }}>
              {makale ? `"${makale.baslik}" basariyla yayinlandi.` : 'Makale basariyla yayinlandi.'}
            </p>
            <button
              onClick={sifirla}
              style={{
                background: '#D4A843',
                color: '#1A2E1E',
                border: 'none',
                borderRadius: 8,
                padding: '12px 32px',
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: 2,
                cursor: 'pointer',
              }}
            >
              {"YENI MAKALE URET"}
            </button>
          </div>
        )}

        {/* Form */}
        {!yayinlandi && !onizleme && (
          <div>
            {/* Konu */}
            <div style={{ marginBottom: 28 }}>
              <label style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 2,
                color: '#D4A843',
                marginBottom: 10,
                fontFamily: 'Cormorant Garamond, serif',
              }}>
                {"KONU"}
              </label>
              <input
                type="text"
                value={konu}
                onChange={(e) => setKonu(e.target.value)}
                placeholder="Ornegin: Mizac teorisi ve beslenme iliskisi"
                style={{
                  width: '100%',
                  background: 'rgba(245,234,212,0.05)',
                  border: '1px solid rgba(245,234,212,0.15)',
                  borderRadius: 10,
                  padding: '14px 18px',
                  fontSize: 16,
                  color: '#F5EAD4',
                  outline: 'none',
                  boxSizing: 'border-box' as const,
                }}
              />
            </div>

            {/* Kategori */}
            <div style={{ marginBottom: 28 }}>
              <label style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 2,
                color: '#D4A843',
                marginBottom: 10,
                fontFamily: 'Cormorant Garamond, serif',
              }}>
                {"KATEGORI"}
              </label>
              <select
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(245,234,212,0.05)',
                  border: '1px solid rgba(245,234,212,0.15)',
                  borderRadius: 10,
                  padding: '14px 18px',
                  fontSize: 15,
                  color: '#F5EAD4',
                  outline: 'none',
                  boxSizing: 'border-box' as const,
                }}
              >
                {KATEGORILER.map(k => (
                  <option key={k} value={k} style={{ background: '#1A2E1E' }}>{k}</option>
                ))}
              </select>
            </div>

            {/* Kaynaklar */}
            <div style={{ marginBottom: 36 }}>
              <label style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 2,
                color: '#D4A843',
                marginBottom: 10,
                fontFamily: 'Cormorant Garamond, serif',
              }}>
                {"KAYNAKLAR (OPSIYONEL)"}
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 10 }}>
                {KAYNAKLAR.map(k => {
                  const secili = seciliKaynaklar.includes(k.kod)
                  return (
                    <button
                      key={k.kod}
                      onClick={() => kaynakToggle(k.kod)}
                      style={{
                        background: secili ? 'rgba(212,168,67,0.2)' : 'rgba(245,234,212,0.05)',
                        border: `1px solid ${secili ? '#D4A843' : 'rgba(245,234,212,0.12)'}`,
                        borderRadius: 8,
                        padding: '10px 18px',
                        fontSize: 13,
                        color: secili ? '#D4A843' : 'rgba(245,234,212,0.6)',
                        cursor: 'pointer',
                        fontWeight: secili ? 700 : 400,
                        transition: 'all 0.2s',
                      }}
                    >
                      {k.etiket}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Hata */}
            {hata && (
              <div style={{
                background: 'rgba(244,67,54,0.1)',
                border: '1px solid rgba(244,67,54,0.3)',
                borderRadius: 8,
                padding: '12px 16px',
                marginBottom: 20,
                fontSize: 14,
                color: '#F44336',
              }}>
                {hata}
              </div>
            )}

            {/* Uret Butonu */}
            <button
              onClick={makaleUret}
              disabled={yukleniyor}
              style={{
                width: '100%',
                background: yukleniyor ? 'rgba(212,168,67,0.3)' : '#D4A843',
                color: yukleniyor ? 'rgba(26,46,30,0.5)' : '#1A2E1E',
                border: 'none',
                borderRadius: 10,
                padding: '16px 24px',
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: 15,
                fontWeight: 700,
                letterSpacing: 3,
                cursor: yukleniyor ? 'not-allowed' : 'pointer',
                transition: 'background 0.3s',
              }}
            >
              {yukleniyor ? 'MAKALE URETILIYOR...' : 'MAKALE URET'}
            </button>
          </div>
        )}

        {/* Onizleme */}
        {onizleme && !yayinlandi && (
          <div>
            <div style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 2,
              color: '#D4A843',
              marginBottom: 20,
              fontFamily: 'Cormorant Garamond, serif',
              textAlign: 'center' as const,
            }}>
              {"ONIZLEME"}
            </div>

            <div style={{
              background: 'rgba(245,234,212,0.03)',
              borderRadius: 14,
              padding: '32px 28px',
              border: '1px solid rgba(245,234,212,0.08)',
              marginBottom: 28,
            }}>
              {onizleme.baslik_ar && (
                <div style={{
                  fontFamily: "'Amiri', serif",
                  fontSize: 24,
                  color: '#D4A843',
                  textAlign: 'right' as const,
                  direction: 'rtl' as const,
                  marginBottom: 10,
                  lineHeight: 1.5,
                }}>
                  {onizleme.baslik_ar}
                </div>
              )}

              <h3 style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: 24,
                fontWeight: 700,
                color: '#F5EAD4',
                marginBottom: 16,
                lineHeight: 1.3,
              }}>
                {onizleme.baslik}
              </h3>

              <div style={{
                height: 1,
                background: 'rgba(212,168,67,0.2)',
                marginBottom: 20,
              }} />

              <blockquote style={{
                borderLeft: '3px solid #D4A843',
                paddingLeft: 20,
                marginBottom: 24,
                fontStyle: 'italic' as const,
                fontSize: 16,
                color: 'rgba(245,234,212,0.75)',
                lineHeight: 1.7,
              }}>
                {onizleme.ozet}
              </blockquote>

              <div style={{
                fontSize: 15,
                color: 'rgba(245,234,212,0.8)',
                lineHeight: 1.8,
                maxHeight: 400,
                overflow: 'auto',
                whiteSpace: 'pre-wrap' as const,
              }}>
                {onizleme.icerik}
              </div>
            </div>

            {/* Hata */}
            {hata && (
              <div style={{
                background: 'rgba(244,67,54,0.1)',
                border: '1px solid rgba(244,67,54,0.3)',
                borderRadius: 8,
                padding: '12px 16px',
                marginBottom: 20,
                fontSize: 14,
                color: '#F44336',
              }}>
                {hata}
              </div>
            )}

            <div style={{ display: 'flex', gap: 16 }}>
              <button
                onClick={sifirla}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: '1px solid rgba(245,234,212,0.2)',
                  borderRadius: 10,
                  padding: '14px 24px',
                  color: 'rgba(245,234,212,0.6)',
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: 2,
                  cursor: 'pointer',
                  fontFamily: 'Cormorant Garamond, serif',
                }}
              >
                {"IPTAL"}
              </button>
              <button
                onClick={yayinla}
                disabled={yukleniyor}
                style={{
                  flex: 2,
                  background: yukleniyor ? 'rgba(212,168,67,0.3)' : '#D4A843',
                  color: '#1A2E1E',
                  border: 'none',
                  borderRadius: 10,
                  padding: '14px 24px',
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: 2,
                  cursor: yukleniyor ? 'not-allowed' : 'pointer',
                }}
              >
                {"YAYINLA"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
