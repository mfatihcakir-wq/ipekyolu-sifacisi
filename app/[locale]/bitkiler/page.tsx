'use client'
import { useEffect, useState } from 'react'
import { Cinzel, EB_Garamond } from 'next/font/google'
import { createClient } from '@/lib/supabase'

const cinzel = Cinzel({ subsets: ['latin'], weight: ['400','500','600'] })
const garamond = EB_Garamond({ subsets: ['latin'], weight: ['400','500'], style: ['normal','italic'] })

const C = {
  primary: '#1B4332', gold: '#C9A84C', cream: '#F5EFE6',
  dark: '#1C1C1C', secondary: '#5C4A2A', border: '#E0D5C5',
  white: '#FFFFFF', surface: '#FAF7F2',
}

interface Bitki {
  id: string
  ad_tr: string
  ad_ar: string
  ad_en: string
  ad_lat: string
  mizac_sicaklik: string
  mizac_nem: string
  mizac_derece: string
  faydalari: string
  organlar: string[]
  kaynaklar: string[]
  kaynak_metin: string
}

export default function BitkilerPage() {
  const [bitkiler, setBitkiler] = useState<Bitki[]>([])
  const [filtered, setFiltered] = useState<Bitki[]>([])
  const [loading, setLoading] = useState(true)
  const [arama, setArama] = useState('')
  const [mizacFiltre, setMizacFiltre] = useState('')
  const [secili, setSecili] = useState<Bitki | null>(null)
  const supabase = createClient()

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { yukle() }, [])

  useEffect(() => {
    let list = bitkiler
    if (arama) list = list.filter(b =>
      b.ad_tr?.toLowerCase().includes(arama.toLowerCase()) ||
      b.ad_ar?.includes(arama) ||
      b.ad_en?.toLowerCase().includes(arama.toLowerCase()) ||
      b.faydalari?.toLowerCase().includes(arama.toLowerCase())
    )
    if (mizacFiltre === 'sicak') list = list.filter(b => b.mizac_sicaklik === 'sıcak')
    if (mizacFiltre === 'soguk') list = list.filter(b => b.mizac_sicaklik === 'soğuk')
    if (mizacFiltre === 'kuru') list = list.filter(b => b.mizac_nem === 'kuru')
    if (mizacFiltre === 'nemli') list = list.filter(b => b.mizac_nem === 'nemli')
    setFiltered(list)
  }, [bitkiler, arama, mizacFiltre])

  async function yukle() {
    setLoading(true)
    const { data } = await supabase
      .from('bitkiler')
      .select('*')
      .order('ad_tr', { ascending: true })
      .limit(500)
    setBitkiler(data || [])
    setFiltered(data || [])
    setLoading(false)
  }

  const mizacRenk = (b: Bitki) => {
    if (b.mizac_sicaklik === 'sıcak' && b.mizac_nem === 'kuru') return '#FFF8E7'
    if (b.mizac_sicaklik === 'sıcak' && b.mizac_nem === 'nemli') return '#FFE8E8'
    if (b.mizac_sicaklik === 'soğuk' && b.mizac_nem === 'nemli') return '#E3F2FD'
    if (b.mizac_sicaklik === 'soğuk' && b.mizac_nem === 'kuru') return '#F3E5F5'
    return C.surface
  }

  return (
    <div style={{ background: C.cream, minHeight: '100vh', fontFamily: garamond.style.fontFamily }}>

      {/* HEADER */}
      <header style={{ background: C.primary, padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <a href="/" style={{ textDecoration: 'none' }}>
            <div style={{ fontFamily: cinzel.style.fontFamily, color: C.gold, fontSize: 15, fontWeight: 600, letterSpacing: 3 }}>IPEK YOLU SIFACISI</div>
          </a>
          <div style={{ color: 'rgba(255,255,255,0.3)' }}>›</div>
          <div style={{ fontFamily: cinzel.style.fontFamily, color: 'rgba(255,255,255,0.7)', fontSize: 13, letterSpacing: 2 }}>BITKI ANSIKLOPEDISI</div>
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>el-Cami li-Mufredat · Ibn Beytar</div>
      </header>

      {/* HERO */}
      <div style={{ background: C.primary, padding: '48px 24px 40px', textAlign: 'center' }}>
        <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 32, color: C.gold, marginBottom: 8, letterSpacing: 2 }}>Bitki Ansiklopedisi</div>
        <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', fontStyle: 'italic', marginBottom: 8 }}>
          Ibn Beytar&apos;in el-Cami li-Mufredati&apos;l-Edviye&apos;sinden
        </div>
        <div style={{ fontSize: 14, color: C.gold, fontFamily: 'serif' }}>الجامع لمفردات الأدوية والأغذية</div>
        <div style={{ marginTop: 16, fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>{bitkiler.length} bitki ve tibbi madde</div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px' }}>

        {/* ARAMA & FILTRE */}
        <div style={{ background: C.white, borderRadius: 12, padding: '16px 20px', marginBottom: 20, border: `1px solid ${C.border}`, display: 'flex', gap: 12, flexWrap: 'wrap' as const, alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Turkce, Arapca veya Ingilizce ara..."
            value={arama}
            onChange={e => setArama(e.target.value)}
            style={{ flex: 1, minWidth: 250, padding: '10px 14px', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 14, fontFamily: garamond.style.fontFamily, outline: 'none', background: C.surface }}
          />
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' as const }}>
            {[
              { label: 'Tumu', val: '' },
              { label: 'Sicak', val: 'sicak' },
              { label: 'Soguk', val: 'soguk' },
              { label: 'Kuru', val: 'kuru' },
              { label: 'Nemli', val: 'nemli' },
            ].map(f => (
              <button key={f.val} onClick={() => setMizacFiltre(f.val)}
                style={{ padding: '8px 14px', borderRadius: 20, fontSize: 12, cursor: 'pointer', fontWeight: 600, border: `1px solid ${mizacFiltre === f.val ? C.primary : C.border}`, background: mizacFiltre === f.val ? C.primary : 'transparent', color: mizacFiltre === f.val ? 'white' : C.secondary }}>
                {f.label}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 12, color: '#999' }}>{filtered.length} sonuc</div>
        </div>

        {/* BITKI KARTLARI */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: C.secondary }}>Yukleniyor...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
            {filtered.slice(0, 100).map(b => (
              <div key={b.id} onClick={() => setSecili(b)}
                style={{ background: mizacRenk(b), border: `1px solid ${C.border}`, borderRadius: 12, padding: '16px', cursor: 'pointer', transition: 'all .15s' }}>
                <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 15, color: C.primary, marginBottom: 4 }}>{b.ad_tr}</div>
                {b.ad_ar && <div style={{ fontSize: 14, color: C.gold, fontFamily: 'serif', marginBottom: 4, direction: 'rtl' }}>{b.ad_ar}</div>}
                {b.ad_lat && <div style={{ fontSize: 11, color: '#999', fontStyle: 'italic', marginBottom: 8 }}>{b.ad_lat}</div>}
                {b.mizac_sicaklik && b.mizac_sicaklik !== 'bilinmiyor' && (
                  <div style={{ fontSize: 11, color: C.secondary }}>
                    {b.mizac_sicaklik} · {b.mizac_nem} {b.mizac_derece && `· derece ${b.mizac_derece}`}
                  </div>
                )}
                {b.faydalari && <div style={{ fontSize: 12, color: C.dark, marginTop: 8, lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>{b.faydalari}</div>}
              </div>
            ))}
          </div>
        )}

        {filtered.length > 100 && (
          <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: C.secondary }}>
            {filtered.length - 100} kayit daha var — aramayi daraltin
          </div>
        )}
      </div>

      {/* DETAY MODAL */}
      {secili && (
        <div onClick={() => setSecili(null)} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: C.white, borderRadius: 20, maxWidth: 600, width: '100%', maxHeight: '85vh', overflowY: 'auto', padding: '36px 40px', position: 'relative' as const }}>
            <button onClick={() => setSecili(null)} style={{ position: 'absolute' as const, top: 16, right: 20, background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#999' }}>✕</button>

            <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 24, color: C.primary, marginBottom: 6 }}>{secili.ad_tr}</div>
            {secili.ad_ar && <div style={{ fontSize: 20, color: C.gold, fontFamily: 'serif', direction: 'rtl', marginBottom: 4 }}>{secili.ad_ar}</div>}
            <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' as const }}>
              {secili.ad_en && <span style={{ fontSize: 13, color: C.secondary, fontStyle: 'italic' }}>{secili.ad_en}</span>}
              {secili.ad_lat && <span style={{ fontSize: 13, color: '#999', fontStyle: 'italic' }}>({secili.ad_lat})</span>}
            </div>

            {(secili.mizac_sicaklik && secili.mizac_sicaklik !== 'bilinmiyor') && (
              <div style={{ background: mizacRenk(secili), borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>
                <div style={{ fontSize: 10, color: C.secondary, letterSpacing: 1, textTransform: 'uppercase' as const, marginBottom: 6 }}>MIZACI</div>
                <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 16, color: C.primary }}>
                  {secili.mizac_sicaklik} · {secili.mizac_nem} {secili.mizac_derece && `· ${secili.mizac_derece}. derece`}
                </div>
              </div>
            )}

            {secili.faydalari && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 10, color: C.secondary, letterSpacing: 1, textTransform: 'uppercase' as const, marginBottom: 8 }}>FAYDALARI</div>
                <div style={{ fontSize: 15, color: C.dark, lineHeight: 1.8 }}>{secili.faydalari}</div>
              </div>
            )}

            {secili.organlar?.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 10, color: C.secondary, letterSpacing: 1, textTransform: 'uppercase' as const, marginBottom: 8 }}>ETKILEDIGI ORGANLAR</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' as const }}>
                  {secili.organlar.map((o, i) => (
                    <span key={i} style={{ fontSize: 12, background: '#E8F5E9', color: C.primary, padding: '3px 10px', borderRadius: 20 }}>{o}</span>
                  ))}
                </div>
              </div>
            )}

            {secili.kaynak_metin && (
              <div style={{ background: C.surface, borderRadius: 8, padding: '12px 16px', marginBottom: 16 }}>
                <div style={{ fontSize: 10, color: C.secondary, letterSpacing: 1, textTransform: 'uppercase' as const, marginBottom: 6 }}>KLASIK KAYNAK</div>
                <div style={{ fontSize: 13, color: C.dark, lineHeight: 1.6, fontStyle: 'italic' }}>{secili.kaynak_metin}</div>
              </div>
            )}

            {secili.kaynaklar?.length > 0 && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' as const }}>
                {secili.kaynaklar.map((k, i) => (
                  <span key={i} style={{ fontSize: 11, background: '#E8F5E9', color: C.primary, padding: '3px 10px', borderRadius: 20, fontStyle: 'italic' }}>{k}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
