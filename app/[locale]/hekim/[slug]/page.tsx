import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function HekimDetay({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params

  const { data: hekim } = await supabase
    .from('hekim_biyografileri')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!hekim) {
    notFound()
  }

  // Iliskili makaleleri getir
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let iliskiliMakaleler: any[] = []
  if (hekim.kaynak_kodu) {
    const { data } = await supabase
      .from('makaleler')
      .select('id, baslik, slug, kategori, ozet')
      .contains('kaynak_kodlar', [hekim.kaynak_kodu])
      .eq('yayinda', true)
      .limit(10)

    iliskiliMakaleler = data || []
  }

  const biyografiParagraflari = (hekim.biyografi || '')
    .split('\n')
    .filter((p: string) => p.trim().length > 0)

  return (
    <div style={{ minHeight: '100vh', background: '#1C3A26' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '80px 24px 120px' }}>
        {/* Arapca Isim */}
        {hekim.isim_ar && (
          <div style={{
            fontFamily: "'Amiri', serif",
            fontSize: 32,
            color: '#B8860B',
            textAlign: 'right' as const,
            direction: 'rtl' as const,
            marginBottom: 12,
            lineHeight: 1.6
          }}>
            {hekim.isim_ar}
          </div>
        )}

        {/* Turkce Isim */}
        <h1 style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: 36,
          fontWeight: 700,
          color: '#F5EAD4',
          lineHeight: 1.3,
          marginBottom: 12
        }}>
          {hekim.isim}
        </h1>

        {/* Tarihler */}
        {hekim.tarih && (
          <div style={{
            fontSize: 16,
            color: 'rgba(245,234,212,0.6)',
            marginBottom: 32,
            fontStyle: 'italic' as const
          }}>
            {hekim.tarih}
          </div>
        )}

        {/* Ayirici */}
        <div style={{
          height: 2,
          background: 'linear-gradient(90deg, #B8860B, transparent)',
          marginBottom: 40,
          borderRadius: 1
        }} />

        {/* Biyografi */}
        <div style={{ marginBottom: 56 }}>
          {biyografiParagraflari.map((paragraf: string, i: number) => (
            <p key={i} style={{
              fontSize: 17,
              color: 'rgba(245,234,212,0.9)',
              lineHeight: 1.9,
              marginBottom: 20,
              textAlign: 'justify' as const
            }}>
              {paragraf}
            </p>
          ))}
        </div>

        {/* Eserleri */}
        {hekim.eserler && hekim.eserler.length > 0 && (
          <div style={{
            background: 'rgba(184,134,11,0.08)',
            borderRadius: 12,
            padding: 32,
            marginBottom: 56
          }}>
            <h2 style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: 22,
              fontWeight: 700,
              color: '#B8860B',
              marginBottom: 20
            }}>
              {"Eserleri"}
            </h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {hekim.eserler.map((eser: string, i: number) => (
                <li key={i} style={{
                  fontSize: 16,
                  color: 'rgba(245,234,212,0.85)',
                  paddingLeft: 24,
                  position: 'relative' as const,
                  marginBottom: 12,
                  lineHeight: 1.6
                }}>
                  <span style={{
                    position: 'absolute' as const,
                    left: 0,
                    top: 0,
                    color: '#B8860B',
                    fontSize: 18
                  }}>
                    {"\u25C7"}
                  </span>
                  {eser}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Iliskili Makaleler */}
        {iliskiliMakaleler.length > 0 && (
          <div style={{
            borderTop: '1px solid rgba(184,134,11,0.3)',
            paddingTop: 32
          }}>
            <h2 style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: 22,
              fontWeight: 700,
              color: '#B8860B',
              marginBottom: 20
            }}>
              {"Iliskili Makaleler"}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 16 }}>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {iliskiliMakaleler.map((m: any) => (
                <Link
                  key={m.id}
                  href={`/${locale}/makale/${m.slug}`}
                  style={{
                    display: 'block',
                    background: 'rgba(245,234,212,0.05)',
                    borderRadius: 10,
                    padding: '20px 24px',
                    textDecoration: 'none',
                    border: '1px solid rgba(184,134,11,0.15)',
                    transition: 'border-color 0.2s'
                  }}
                >
                  <span style={{
                    display: 'inline-block',
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: 1.5,
                    color: '#B8860B',
                    marginBottom: 6,
                    textTransform: 'uppercase' as const
                  }}>
                    {m.kategori}
                  </span>
                  <div style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize: 16,
                    fontWeight: 600,
                    color: '#F5EAD4',
                    marginBottom: 6
                  }}>
                    {m.baslik}
                  </div>
                  <div style={{
                    fontSize: 14,
                    color: 'rgba(245,234,212,0.6)',
                    lineHeight: 1.5
                  }}>
                    {m.ozet}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
