import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import type { Metadata } from 'next'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const { data: makale } = await supabase
    .from('makaleler')
    .select('baslik, baslik_ar, kategori, ozet, icerik')
    .eq('slug', slug)
    .eq('yayinda', true)
    .single()

  if (!makale) {
    return { title: 'Makale bulunamadı' }
  }

  const ozet = makale.ozet || (makale.icerik || '').slice(0, 160).replace(/\s+/g, ' ').trim()

  return {
    title: makale.baslik,
    description: ozet,
    openGraph: {
      title: makale.baslik,
      description: ozet,
      type: 'article',
    },
  }
}

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

  return (
    <div style={{ minHeight: '100vh', background: '#1A2E1E' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '80px 24px 120px' }}>
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

        <div style={{
          height: 2,
          background: 'linear-gradient(90deg, #D4A843, transparent)',
          marginBottom: 40,
          borderRadius: 1
        }} />

        {makale.ozet && (
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
        )}

        <div className="makale-icerik" style={{ marginBottom: 64 }}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h2: ({ children }) => (
                <h2 style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: 26,
                  fontWeight: 700,
                  color: '#D4A843',
                  marginTop: 48,
                  marginBottom: 20,
                  lineHeight: 1.3
                }}>{children}</h2>
              ),
              h3: ({ children }) => (
                <h3 style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: 21,
                  fontWeight: 600,
                  color: '#D4A843',
                  marginTop: 36,
                  marginBottom: 14,
                  lineHeight: 1.4
                }}>{children}</h3>
              ),
              p: ({ children }) => (
                <p style={{
                  fontSize: 17,
                  color: 'rgba(245,234,212,0.9)',
                  lineHeight: 1.9,
                  marginBottom: 18,
                  textAlign: 'justify' as const
                }}>{children}</p>
              ),
              strong: ({ children }) => (
                <strong style={{ color: '#F5EAD4', fontWeight: 700 }}>{children}</strong>
              ),
              em: ({ children }) => (
                <em style={{ color: '#E8D8B0' }}>{children}</em>
              ),
              ul: ({ children }) => (
                <ul style={{
                  marginBottom: 24,
                  paddingLeft: 24,
                  color: 'rgba(245,234,212,0.9)',
                  lineHeight: 1.9
                }}>{children}</ul>
              ),
              ol: ({ children }) => (
                <ol style={{
                  marginBottom: 24,
                  paddingLeft: 24,
                  color: 'rgba(245,234,212,0.9)',
                  lineHeight: 1.9
                }}>{children}</ol>
              ),
              li: ({ children }) => (
                <li style={{ fontSize: 17, marginBottom: 8 }}>{children}</li>
              ),
              blockquote: ({ children }) => (
                <blockquote style={{
                  borderLeft: '3px solid #D4A843',
                  paddingLeft: 20,
                  margin: '24px 0',
                  fontStyle: 'italic' as const,
                  color: 'rgba(245,234,212,0.8)',
                  fontSize: 17,
                  lineHeight: 1.8
                }}>{children}</blockquote>
              ),
              hr: () => (
                <hr style={{
                  border: 'none',
                  borderTop: '1px solid rgba(212,168,67,0.3)',
                  margin: '40px 0'
                }} />
              ),
              table: ({ children }) => (
                <div style={{ overflowX: 'auto', marginBottom: 24 }}>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse' as const,
                    fontSize: 15,
                    color: 'rgba(245,234,212,0.9)'
                  }}>{children}</table>
                </div>
              ),
              th: ({ children }) => (
                <th style={{
                  padding: '12px 16px',
                  textAlign: 'left' as const,
                  borderBottom: '2px solid rgba(212,168,67,0.5)',
                  color: '#D4A843',
                  fontWeight: 700
                }}>{children}</th>
              ),
              td: ({ children }) => (
                <td style={{
                  padding: '10px 16px',
                  borderBottom: '1px solid rgba(212,168,67,0.15)',
                  verticalAlign: 'top' as const
                }}>{children}</td>
              ),
              code: ({ children }) => (
                <code style={{
                  background: 'rgba(212,168,67,0.1)',
                  padding: '2px 6px',
                  borderRadius: 3,
                  fontSize: 15,
                  color: '#D4A843'
                }}>{children}</code>
              ),
              a: ({ href, children }) => (
                <a href={href} style={{
                  color: '#D4A843',
                  textDecoration: 'underline'
                }}>{children}</a>
              ),
            }}
          >
            {makale.icerik || ''}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  )
}
