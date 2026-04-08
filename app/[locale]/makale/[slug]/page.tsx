import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function MakaleDetay({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { slug } = await params

  const { data: makale } = await supabase
    .from('makaleler')
    .select('*')
    .eq('slug', slug)
    .eq('yayinda', true)
    .single()

  if (!makale) {
    notFound()
  }

  const icerikParagraflari = (makale.icerik || '')
    .split('\n')
    .filter((p: string) => p.trim().length > 0)

  return (
    <div style={{ minHeight: '100vh', background: '#1A2E1E' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '80px 24px 120px' }}>
        {/* Kategori */}
        <div style={{ marginBottom: 24 }}>
          <span style={{
            display: 'inline-block',
            background: 'rgba(212,168,67,0.15)',
            color: '#D4A843',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 2,
            padding: '6px 16px',
            borderRadius: 4,
            textTransform: 'uppercase' as const,
            fontFamily: 'Cormorant Garamond, serif'
          }}>
            {makale.kategori}
          </span>
        </div>

        {/* Arapca Baslik */}
        {makale.baslik_ar && (
          <div style={{
            fontFamily: "'Amiri', serif",
            fontSize: 28,
            color: '#D4A843',
            textAlign: 'right' as const,
            direction: 'rtl' as const,
            marginBottom: 12,
            lineHeight: 1.6
          }}>
            {makale.baslik_ar}
          </div>
        )}

        {/* Turkce Baslik */}
        <h1 style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: 36,
          fontWeight: 700,
          color: '#F5EAD4',
          lineHeight: 1.3,
          marginBottom: 32
        }}>
          {makale.baslik}
        </h1>

        {/* Ayirici */}
        <div style={{
          height: 2,
          background: 'linear-gradient(90deg, #D4A843, transparent)',
          marginBottom: 40,
          borderRadius: 1
        }} />

        {/* Ozet */}
        <blockquote style={{
          borderLeft: '3px solid #D4A843',
          paddingLeft: 24,
          marginBottom: 48,
          fontStyle: 'italic' as const,
          fontSize: 18,
          color: 'rgba(245,234,212,0.85)',
          lineHeight: 1.8
        }}>
          {makale.ozet}
        </blockquote>

        {/* Icerik */}
        <div style={{ marginBottom: 64 }}>
          {icerikParagraflari.map((paragraf: string, i: number) => {
            // Markdown baslik kontrolu
            if (paragraf.startsWith('### ')) {
              return (
                <h3 key={i} style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: 20,
                  fontWeight: 600,
                  color: '#D4A843',
                  marginTop: 40,
                  marginBottom: 16
                }}>
                  {paragraf.replace('### ', '')}
                </h3>
              )
            }
            if (paragraf.startsWith('## ')) {
              return (
                <h2 key={i} style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: 24,
                  fontWeight: 700,
                  color: '#D4A843',
                  marginTop: 48,
                  marginBottom: 20
                }}>
                  {paragraf.replace('## ', '')}
                </h2>
              )
            }
            return (
              <p key={i} style={{
                fontSize: 17,
                color: 'rgba(245,234,212,0.9)',
                lineHeight: 1.9,
                marginBottom: 20,
                textAlign: 'justify' as const
              }}>
                {paragraf}
              </p>
            )
          })}
        </div>

        {/* Kaynaklar */}
        {makale.kaynaklar && makale.kaynaklar.length > 0 && (
          <div style={{
            borderTop: '1px solid rgba(212,168,67,0.3)',
            paddingTop: 32
          }}>
            <h3 style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: 18,
              fontWeight: 600,
              color: '#D4A843',
              marginBottom: 16
            }}>
              {"Kaynaklar"}
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {makale.kaynaklar.map((kaynak: string, i: number) => (
                <li key={i} style={{
                  fontSize: 15,
                  color: 'rgba(245,234,212,0.7)',
                  paddingLeft: 20,
                  position: 'relative' as const,
                  marginBottom: 8,
                  lineHeight: 1.6
                }}>
                  <span style={{
                    position: 'absolute' as const,
                    left: 0,
                    top: 0,
                    color: '#D4A843'
                  }}>
                    {"\u2022"}
                  </span>
                  {kaynak}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
