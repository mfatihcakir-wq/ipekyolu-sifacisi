'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import { useParams } from 'next/navigation'

const PLACEHOLDER_MAKALELER = [
  {
    id: 'p1',
    baslik: 'Mizac Teorisi ve Kisisel Saglik',
    baslik_ar: '\u0646\u0638\u0631\u064A\u0629 \u0627\u0644\u0645\u0632\u0627\u062C',
    slug: 'mizac-teorisi-ve-kisisel-saglik',
    kategori: 'TEMEL KAVRAMLAR',
    ozet: 'Islam tibbinin temel taslarinden olan mizac teorisi, her bireyin benzersiz yapisini anlamak icin bir cerceve sunar.',
    kaynaklar: ['El-Kanun fi\'t-Tib (Ibn Sina)'],
    featured: true,
  },
  {
    id: 'p2',
    baslik: 'Nabiz Ilmi: Eski Cagin Tanisi',
    baslik_ar: '\u0639\u0644\u0645 \u0627\u0644\u0646\u0628\u0636',
    slug: 'nabiz-ilmi',
    kategori: 'NABIZ ILMI',
    ozet: 'Nabiz muayenesi, Islam hekimlerinin en onemli teshis yontemlerinden biriydi.',
    kaynaklar: ['Kitab el-Havi (Razi)'],
  },
  {
    id: 'p3',
    baslik: 'Tibbi Bitkiler ve Mufredat',
    baslik_ar: '\u0627\u0644\u0645\u0641\u0631\u062F\u0627\u062A \u0627\u0644\u0637\u0628\u064A\u0629',
    slug: 'tibbi-bitkiler-mufredat',
    kategori: 'ECZACILIK',
    ozet: 'Klasik Islam eczaciliginda kullanilan bitkisel ilaclarin siniflandirilmasi ve etkileri.',
    kaynaklar: ['Kitab el-Mufredat (Ibn Baytar)'],
  },
  {
    id: 'p4',
    baslik: 'Hicamet ve Kan Alma Sanati',
    baslik_ar: '\u0627\u0644\u062D\u062C\u0627\u0645\u0629',
    slug: 'hicamet-kan-alma',
    kategori: 'TEDAVI YONTEMLERI',
    ozet: 'Hicamet, Islam tibbinda en cok basvurulan tedavi yontemlerinden biri olarak yuzyillar boyunca uygulanmistir.',
    kaynaklar: ['Tibb-i Nebevi (Ibn Kayyim)'],
  },
  {
    id: 'p5',
    baslik: 'Gida ve Saglik Iliskisi',
    baslik_ar: '\u0627\u0644\u063A\u0630\u0627\u0621 \u0648\u0627\u0644\u0635\u062D\u0629',
    slug: 'gida-saglik-iliskisi',
    kategori: 'BESLENME',
    ozet: 'Islam hekimleri beslenmeyi tedavinin temeli olarak gormus, gidayi ilactan once degerlendirmistir.',
    kaynaklar: ['El-Kanun fi\'t-Tib (Ibn Sina)'],
  },
]

const PLACEHOLDER_HEKIMLER = [
  { id: 'h1', isim: 'Ibn Sina', isim_ar: '\u0627\u0628\u0646 \u0633\u064A\u0646\u0627', slug: 'ibn-sina', tarih: '980-1037', ana_eser: 'El-Kanun fi\'t-Tib' },
  { id: 'h2', isim: 'Ebu Bekir er-Razi', isim_ar: '\u0627\u0644\u0631\u0627\u0632\u064A', slug: 'ebu-bekir-er-razi', tarih: '854-925', ana_eser: 'Kitab el-Havi' },
  { id: 'h3', isim: 'Ibn Baytar', isim_ar: '\u0627\u0628\u0646 \u0627\u0644\u0628\u064A\u0637\u0627\u0631', slug: 'ibn-baytar', tarih: '1197-1248', ana_eser: 'Kitab el-Cami' },
  { id: 'h4', isim: 'Ibn Kayyim el-Cevziyye', isim_ar: '\u0627\u0628\u0646 \u0642\u064A\u0645 \u0627\u0644\u062C\u0648\u0632\u064A\u0629', slug: 'ibn-kayyim', tarih: '1292-1350', ana_eser: 'Tibb-i Nebevi' },
  { id: 'h5', isim: 'Zehrebi', isim_ar: '\u0627\u0644\u0632\u0647\u0631\u0627\u0648\u064A', slug: 'zehravi', tarih: '936-1013', ana_eser: 'et-Tasrif' },
  { id: 'h6', isim: 'Ibn Nefis', isim_ar: '\u0627\u0628\u0646 \u0627\u0644\u0646\u0641\u064A\u0633', slug: 'ibn-nefis', tarih: '1213-1288', ana_eser: 'Serh el-Kanun' },
  { id: 'h7', isim: 'Huneyn bin Ishak', isim_ar: '\u062D\u0646\u064A\u0646 \u0628\u0646 \u0625\u0633\u062D\u0627\u0642', slug: 'huneyn-bin-ishak', tarih: '809-873', ana_eser: 'Kitab el-Asr' },
  { id: 'h8', isim: 'Ali bin Abbas el-Mecusi', isim_ar: '\u0627\u0644\u0645\u062C\u0648\u0633\u064A', slug: 'ali-bin-abbas', tarih: '930-994', ana_eser: 'Kamil es-Sinaa' },
  { id: 'h9', isim: 'Ibn Zuhr', isim_ar: '\u0627\u0628\u0646 \u0632\u0647\u0631', slug: 'ibn-zuhr', tarih: '1091-1161', ana_eser: 'et-Teysir' },
]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function MakaleKart({ makale, featured }: { makale: any; featured?: boolean }) {
  const params = useParams()
  const locale = params?.locale || 'tr'

  return (
    <Link
      href={`/${locale}/makale/${makale.slug}`}
      style={{
        display: 'block',
        background: featured ? 'rgba(212,168,67,0.06)' : 'rgba(245,234,212,0.03)',
        borderRadius: 16,
        padding: featured ? '36px 32px' : '28px 24px',
        textDecoration: 'none',
        border: `1px solid ${featured ? 'rgba(212,168,67,0.25)' : 'rgba(245,234,212,0.08)'}`,
        gridColumn: featured ? 'span 2' : 'span 1',
        position: 'relative' as const,
        overflow: 'hidden',
        transition: 'border-color 0.3s, transform 0.2s',
      }}
    >
      {featured && (
        <svg style={{ position: 'absolute', top: -20, right: -20, opacity: 0.06 }} width="160" height="160" viewBox="0 0 160 160" fill="none">
          <circle cx="80" cy="80" r="78" stroke="#D4A843" strokeWidth="2" />
          <circle cx="80" cy="80" r="55" stroke="#D4A843" strokeWidth="1.5" />
          <path d="M80 25 L85 75 L135 80 L85 85 L80 135 L75 85 L25 80 L75 75Z" stroke="#D4A843" strokeWidth="1" fill="none" />
        </svg>
      )}

      <div style={{ position: 'relative' as const }}>
        <span style={{
          display: 'inline-block',
          background: 'rgba(212,168,67,0.15)',
          color: '#D4A843',
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: 2,
          padding: '4px 12px',
          borderRadius: 3,
          marginBottom: 14,
          fontFamily: 'Cinzel, serif'
        }}>
          {makale.kategori}
        </span>

        {makale.baslik_ar && (
          <div style={{
            fontFamily: "'Amiri', serif",
            fontSize: featured ? 22 : 18,
            color: '#D4A843',
            textAlign: 'right' as const,
            direction: 'rtl' as const,
            marginBottom: 8,
            lineHeight: 1.5
          }}>
            {makale.baslik_ar}
          </div>
        )}

        <div style={{
          fontFamily: 'Cinzel, serif',
          fontSize: featured ? 22 : 17,
          fontWeight: 600,
          color: '#F5EAD4',
          lineHeight: 1.4,
          marginBottom: 12
        }}>
          {makale.baslik}
        </div>

        <p style={{
          fontSize: 15,
          color: 'rgba(245,234,212,0.65)',
          lineHeight: 1.7,
          marginBottom: 16,
          display: '-webkit-box',
          WebkitLineClamp: featured ? 4 : 3,
          WebkitBoxOrient: 'vertical' as const,
          overflow: 'hidden'
        }}>
          {makale.ozet}
        </p>

        {makale.kaynaklar && makale.kaynaklar.length > 0 && (
          <div style={{
            fontSize: 12,
            color: 'rgba(212,168,67,0.6)',
            marginBottom: 12,
            fontStyle: 'italic' as const
          }}>
            {makale.kaynaklar[0]}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#D4A843', fontSize: 13, fontWeight: 600 }}>
          <span>{"Devamini Oku"}</span>
          <span style={{ fontSize: 16 }}>{"\u2192"}</span>
        </div>
      </div>
    </Link>
  )
}

export default function MakalelerSection() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [makaleler, setMakaleler] = useState<any[]>([])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [hekimler, setHekimler] = useState<any[]>([])
  const [yukleniyor, setYukleniyor] = useState(true)
  const params = useParams()
  const locale = params?.locale || 'tr'

  useEffect(() => {
    const veriGetir = async () => {
      try {
        const supabase = createClient()

        const [makaleRes, hekimRes] = await Promise.all([
          supabase
            .from('makaleler')
            .select('id, baslik, baslik_ar, slug, kategori, ozet, kaynaklar')
            .eq('yayinda', true)
            .order('created_at', { ascending: false })
            .limit(5),
          supabase
            .from('hekim_biyografileri')
            .select('id, isim, isim_ar, slug, tarih, ana_eser')
            .limit(9)
        ])

        if (makaleRes.data && makaleRes.data.length > 0) {
          setMakaleler(makaleRes.data)
        } else {
          setMakaleler(PLACEHOLDER_MAKALELER)
        }

        if (hekimRes.data && hekimRes.data.length > 0) {
          setHekimler(hekimRes.data)
        } else {
          setHekimler(PLACEHOLDER_HEKIMLER)
        }
      } catch {
        setMakaleler(PLACEHOLDER_MAKALELER)
        setHekimler(PLACEHOLDER_HEKIMLER)
      } finally {
        setYukleniyor(false)
      }
    }

    veriGetir()
  }, [])

  const featuredMakale = makaleler[0]
  const digerMakaleler = makaleler.slice(1)

  return (
    <section style={{ background: '#1A2E1E', padding: '100px 0 120px', position: 'relative' as const, overflow: 'hidden' }}>
      {/* Dekoratif arka plan */}
      <div style={{
        position: 'absolute' as const,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(212,168,67,0.03) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(212,168,67,0.02) 0%, transparent 40%)',
        pointerEvents: 'none' as const
      }} />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', position: 'relative' as const }}>
        {/* Baslik */}
        <div style={{ textAlign: 'center' as const, marginBottom: 64 }}>
          <div style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 4,
            color: '#D4A843',
            marginBottom: 16,
            fontFamily: 'Cinzel, serif'
          }}>
            {"KLASIK TIP KUTUPHANESI"}
          </div>
          <h2 style={{
            fontFamily: 'Cinzel, serif',
            fontSize: 36,
            fontWeight: 700,
            color: '#F5EAD4',
            marginBottom: 16,
            lineHeight: 1.3
          }}>
            {"Makaleler & Arastirmalar"}
          </h2>
          <div style={{ width: 60, height: 2, background: '#D4A843', margin: '0 auto 16px', borderRadius: 1 }} />
          <p style={{ fontSize: 17, color: 'rgba(245,234,212,0.6)', maxWidth: 600, margin: '0 auto', lineHeight: 1.7 }}>
            {"Islam tibbi kaynaklarindan derlenmis, klasik metinlere dayanan makaleler ve arastirmalar."}
          </p>
        </div>

        {/* Makaleler Grid */}
        {yukleniyor ? (
          <div style={{ textAlign: 'center' as const, padding: '60px 0', color: 'rgba(245,234,212,0.5)' }}>
            {"Yukleniyor..."}
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 24,
            marginBottom: 80
          }}>
            {featuredMakale && <MakaleKart makale={featuredMakale} featured />}
            {digerMakaleler.map((m) => (
              <MakaleKart key={m.id} makale={m} />
            ))}
          </div>
        )}

        {/* Hekimler Bolumu */}
        <div style={{ marginBottom: 64 }}>
          <div style={{ textAlign: 'center' as const, marginBottom: 48 }}>
            <div style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 4,
              color: '#D4A843',
              marginBottom: 12,
              fontFamily: 'Cinzel, serif'
            }}>
              {"BUYUK HEKIMLER"}
            </div>
            <h3 style={{
              fontFamily: 'Cinzel, serif',
              fontSize: 28,
              fontWeight: 700,
              color: '#F5EAD4',
              marginBottom: 12
            }}>
              {"Islam Tibbinin Onculeri"}
            </h3>
            <div style={{ width: 40, height: 2, background: '#D4A843', margin: '0 auto', borderRadius: 1 }} />
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: 16,
          }}>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {hekimler.slice(0, 9).map((h: any) => (
              <Link
                key={h.id}
                href={`/${locale}/hekim/${h.slug}`}
                style={{
                  display: 'block',
                  background: 'rgba(245,234,212,0.03)',
                  borderRadius: 12,
                  padding: '24px 16px',
                  textDecoration: 'none',
                  border: '1px solid rgba(245,234,212,0.06)',
                  textAlign: 'center' as const,
                  transition: 'border-color 0.3s'
                }}
              >
                {h.isim_ar && (
                  <div style={{
                    fontFamily: "'Amiri', serif",
                    fontSize: 20,
                    color: '#D4A843',
                    marginBottom: 8,
                    lineHeight: 1.4
                  }}>
                    {h.isim_ar}
                  </div>
                )}
                <div style={{
                  fontFamily: 'Cinzel, serif',
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#F5EAD4',
                  marginBottom: 6
                }}>
                  {h.isim}
                </div>
                {h.tarih && (
                  <div style={{ fontSize: 11, color: 'rgba(245,234,212,0.4)', marginBottom: 8 }}>
                    {h.tarih}
                  </div>
                )}
                {h.ana_eser && (
                  <div style={{
                    fontSize: 11,
                    color: 'rgba(212,168,67,0.6)',
                    fontStyle: 'italic' as const,
                    lineHeight: 1.4
                  }}>
                    {h.ana_eser}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>

        {/* Tum Makaleler Butonu */}
        <div style={{ textAlign: 'center' as const }}>
          <Link
            href={`/${locale}/makale`}
            style={{
              display: 'inline-block',
              background: 'transparent',
              border: '2px solid #D4A843',
              color: '#D4A843',
              fontFamily: 'Cinzel, serif',
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: 3,
              padding: '16px 48px',
              borderRadius: 8,
              textDecoration: 'none',
              transition: 'background 0.3s, color 0.3s'
            }}
          >
            {"TUM MAKALELER"}
          </Link>
        </div>
      </div>
    </section>
  )
}
