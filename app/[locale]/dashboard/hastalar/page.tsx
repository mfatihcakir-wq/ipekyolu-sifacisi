'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Cinzel, EB_Garamond } from 'next/font/google'
import { createClient } from '@/lib/supabase'

const cinzel = Cinzel({ subsets: ['latin', 'latin-ext'], weight: ['400', '500', '600'] })
const garamond = EB_Garamond({ subsets: ['latin', 'latin-ext'], weight: ['400', '500'], style: ['normal', 'italic'] })

const C = {
  primary: '#1B4332', gold: '#8B6914', cream: '#FAF7F2',
  dark: '#1C1C1C', secondary: '#6B5744', border: '#E8DFD4',
  white: '#FFFFFF', surface: '#FAF7F2',
}

interface DetailedForm {
  id: string
  tam_ad: string
  telefon: string
  durum: string
  created_at: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tum_form_verisi: any
  user_id: string
}

const MIZAC_FILTRELERI = [
  { label: 'Tumu', value: '' },
  { label: 'Bekliyor', value: 'bekliyor' },
  { label: 'Inceleniyor', value: 'inceleniyor' },
  { label: 'Tamamlandi', value: 'tamamlandi' },
]

export default function HastalarPage() {
  const [forms, setForms] = useState<DetailedForm[]>([])
  const [filtered, setFiltered] = useState<DetailedForm[]>([])
  const [loading, setLoading] = useState(true)
  const [filtre, setFiltre] = useState('')
  const [arama, setArama] = useState('')
  const router = useRouter()
  const supabase = createClient()

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { yukle() }, [])

  useEffect(() => {
    let list = forms
    if (filtre) list = list.filter(f => f.durum === filtre)
    if (arama) list = list.filter(f =>
      f.tam_ad?.toLowerCase().includes(arama.toLowerCase()) ||
      f.telefon?.includes(arama)
    )
    setFiltered(list)
  }, [forms, filtre, arama])

  async function yukle() {
    setLoading(true)
    const { data } = await supabase
      .from('detailed_forms')
      .select('*')
      .order('created_at', { ascending: false })
    setForms(data || [])
    setFiltered(data || [])
    setLoading(false)
  }

  async function sil(id: string) {
    if (!confirm('Bu formu silmek istediginizden emin misiniz?')) return
    await supabase.from('detailed_forms').delete().eq('id', id)
    yukle()
  }

  const durumRenk = (d: string) => {
    if (d === 'bekliyor') return { bg: '#FFF8E7', color: '#92400E', text: 'Bekliyor' }
    if (d === 'inceleniyor') return { bg: '#E3F2FD', color: '#1565C0', text: 'Inceleniyor' }
    return { bg: '#E8F5E9', color: '#1B5E20', text: 'Tamamlandi' }
  }

  return (
    <div style={{ background: C.cream, minHeight: '100vh', fontFamily: garamond.style.fontFamily }}>
      <header style={{ background: C.primary, padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => router.push('/dashboard')} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: 8, padding: '7px 14px', fontSize: 12, cursor: 'pointer' }}>
            {'\u2190'} Panel
          </button>
          <div style={{ fontFamily: cinzel.style.fontFamily, color: C.gold, fontSize: 15, fontWeight: 600, letterSpacing: 3 }}>HASTA YONETIMI</div>
        </div>
        <button onClick={yukle} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: 8, padding: '7px 14px', fontSize: 12, cursor: 'pointer' }}>
          Yenile
        </button>
      </header>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px' }}>

        {/* İSTATİSTİK */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Toplam', val: forms.length, accent: C.secondary },
            { label: 'Bekleyen', val: forms.filter(f => f.durum === 'bekliyor').length, accent: '#B8860B' },
            { label: 'Inceleniyor', val: forms.filter(f => f.durum === 'inceleniyor').length, accent: '#1565C0' },
            { label: 'Tamamlanan', val: forms.filter(f => f.durum === 'tamamlandi').length, accent: C.primary },
          ].map(s => (
            <div key={s.label} style={{ background: C.white, borderRadius: 12, padding: '14px 18px', border: `1px solid ${C.border}`, borderLeft: `4px solid ${s.accent}` }}>
              <div style={{ fontSize: 11, color: C.secondary, letterSpacing: 1, textTransform: 'uppercase' as const }}>{s.label}</div>
              <div style={{ fontSize: 26, fontWeight: 600, fontFamily: cinzel.style.fontFamily, color: s.accent, marginTop: 4 }}>{s.val}</div>
            </div>
          ))}
        </div>

        {/* FİLTRE & ARAMA */}
        <div style={{ background: C.white, borderRadius: 12, padding: '14px 18px', marginBottom: 16, border: `1px solid ${C.border}`, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' as const }}>
          <input
            type="text"
            placeholder="Ad veya telefon ara..."
            value={arama}
            onChange={e => setArama(e.target.value)}
            style={{ flex: 1, minWidth: 200, padding: '8px 12px', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, fontFamily: garamond.style.fontFamily, outline: 'none' }}
          />
          <div style={{ display: 'flex', gap: 6 }}>
            {MIZAC_FILTRELERI.map(f => (
              <button key={f.value} onClick={() => setFiltre(f.value)}
                style={{ padding: '6px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: 'pointer', border: `1px solid ${filtre === f.value ? C.primary : C.border}`, background: filtre === f.value ? C.primary : 'transparent', color: filtre === f.value ? 'white' : C.secondary }}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* LISTE */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: C.secondary }}>Yukleniyor...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: C.secondary, fontStyle: 'italic' }}>Form bulunamadi.</div>
        ) : (
          <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, overflow: 'hidden', overflowX: 'auto' as const }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
              <thead>
                <tr style={{ background: C.primary }}>
                  {['Ad Soyad', 'Telefon', 'Yas / Cinsiyet', 'Mevsim', 'Sikayet', 'Tarih', 'Durum', 'Islemler'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left' as const, fontSize: 10, fontWeight: 600, color: C.gold, letterSpacing: 1.5, textTransform: 'uppercase' as const, fontFamily: cinzel.style.fontFamily }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((f, idx) => {
                  const dr = durumRenk(f.durum)
                  const fv = f.tum_form_verisi || {}
                  return (
                    <tr key={f.id} style={{ borderBottom: `1px solid ${C.border}`, background: idx % 2 === 0 ? C.white : C.surface }}>
                      <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 600, color: C.primary }}>{f.tam_ad}</td>
                      <td style={{ padding: '12px 14px', fontSize: 12, color: C.secondary }}>{f.telefon}</td>
                      <td style={{ padding: '12px 14px', fontSize: 11, color: C.secondary }}>{fv.age_group || '-'} / {fv.gender || '-'}</td>
                      <td style={{ padding: '12px 14px', fontSize: 11, color: C.secondary }}>{fv.season || '-'}</td>
                      <td style={{ padding: '12px 14px', fontSize: 11, color: C.dark, maxWidth: 200 }}>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const, maxWidth: 180 }}>{fv.symptoms || '-'}</div>
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: 11, color: '#999' }}>
                        {new Date(f.created_at).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: '2-digit' })}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ fontSize: 10, background: dr.bg, color: dr.color, padding: '3px 8px', borderRadius: 20, fontWeight: 600 }}>{dr.text}</span>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => router.push('/dashboard')}
                            style={{ fontSize: 10, padding: '4px 10px', background: C.primary, color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>
                            Analiz
                          </button>
                          <a href="https://wa.me/905331687226" target="_blank"
                            style={{ fontSize: 10, padding: '4px 10px', background: 'transparent', color: '#25D366', border: '1px solid #25D366', borderRadius: 6, fontWeight: 600, textDecoration: 'none', display: 'inline-block' }}>
                            {"💬"}
                          </a>
                          <button onClick={() => sil(f.id)}
                            style={{ fontSize: 10, padding: '4px 10px', background: '#FFEBEE', color: '#C62828', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>
                            Sil
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  )
}
