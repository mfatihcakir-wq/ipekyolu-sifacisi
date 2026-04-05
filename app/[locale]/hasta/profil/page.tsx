'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Cinzel, EB_Garamond } from 'next/font/google'
import { createClient } from '@/lib/supabase'

const cinzel = Cinzel({ subsets: ['latin', 'latin-ext'], weight: ['400', '500', '600'] })
const garamond = EB_Garamond({ subsets: ['latin', 'latin-ext'], weight: ['400', '500'], style: ['normal', 'italic'] })

const C = {
  primary: '#1B4332', gold: '#8B6914', cream: '#F5EFE6',
  dark: '#1C1C1C', secondary: '#5C4A2A', border: '#E0D5C5',
  white: '#FFFFFF', surface: '#FAF7F2',
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 14px', border: `1.5px solid ${C.border}`, borderRadius: 8,
  fontSize: 16, minHeight: 44, outline: 'none', boxSizing: 'border-box',
  fontFamily: 'inherit', background: C.surface, color: C.dark,
}

export default function ProfilPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')
  const [email, setEmail] = useState('')
  const [form, setForm] = useState({
    ad: '', soyad: '', telefon: '', dogum_yili: '', cinsiyet: '', sehir: '',
  })
  const [tibbi, setTibbi] = useState({
    kronik_hastaliklar: '', alerjiler: '', ilaclar: '', gecmis_ameliyatlar: '', aile_gecmisi: '',
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const set = (key: string, val: any) => setForm(f => ({ ...f, [key]: val }))
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const setT = (key: string, val: any) => setTibbi(f => ({ ...f, [key]: val }))

  useEffect(() => {
    async function yukle() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/giris'); return }
      setEmail(user.email || '')

      const { data: profil } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profil) {
        setForm({
          ad: profil.ad || user.user_metadata?.full_name?.split(' ')[0] || '',
          soyad: profil.soyad || user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
          telefon: profil.telefon || user.user_metadata?.phone || '',
          dogum_yili: profil.dogum_yili?.toString() || '',
          cinsiyet: profil.cinsiyet || '',
          sehir: profil.sehir || '',
        })
        if (profil.tibbi_gecmis) {
          setTibbi({
            kronik_hastaliklar: profil.tibbi_gecmis.kronik_hastaliklar || '',
            alerjiler: profil.tibbi_gecmis.alerjiler || '',
            ilaclar: profil.tibbi_gecmis.ilaclar || '',
            gecmis_ameliyatlar: profil.tibbi_gecmis.gecmis_ameliyatlar || '',
            aile_gecmisi: profil.tibbi_gecmis.aile_gecmisi || '',
          })
        }
      } else {
        // Profil yoksa auth metadata'dan doldur
        setForm(f => ({
          ...f,
          ad: user.user_metadata?.full_name?.split(' ')[0] || '',
          soyad: user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
          telefon: user.user_metadata?.phone || '',
        }))
      }
      setLoading(false)
    }
    yukle()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSave() {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      await supabase.from('profiles').upsert({
        id: user.id,
        ad: form.ad,
        soyad: form.soyad,
        telefon: form.telefon,
        dogum_yili: form.dogum_yili ? parseInt(form.dogum_yili) : null,
        cinsiyet: form.cinsiyet,
        sehir: form.sehir,
        tibbi_gecmis: tibbi,
      })

      setToast('Profil kaydedildi')
      setTimeout(() => setToast(''), 3000)
    } catch {
      setToast('Hata: Kaydetme basarisiz')
      setTimeout(() => setToast(''), 3000)
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div style={{ background: C.cream, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 40, height: 40, border: `3px solid ${C.border}`, borderTop: `3px solid ${C.primary}`, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  return (
    <div style={{ background: C.cream, minHeight: '100vh', fontFamily: garamond.style.fontFamily }}>
      <header style={{ background: C.primary, padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', gap: 12, position: 'sticky' as const, top: 0, zIndex: 100 }}>
        <button onClick={() => router.push('/hasta')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: 18 }}>{'\u2190'}</button>
        <div style={{ fontFamily: cinzel.style.fontFamily, color: C.gold, fontSize: 13, letterSpacing: 2 }}>PROFILIM</div>
      </header>

      {toast && (
        <div style={{ position: 'fixed' as const, top: 20, right: 20, zIndex: 9999, background: toast.includes('Hata') ? '#FCEBEB' : '#EAF3DE', border: `1px solid ${toast.includes('Hata') ? '#F7C1C1' : '#C0DD97'}`, color: toast.includes('Hata') ? '#A32D2D' : '#3B6D11', padding: '12px 20px', borderRadius: 10, fontSize: 13 }}>{toast}</div>
      )}

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '32px 20px' }}>
        <h1 style={{ fontFamily: cinzel.style.fontFamily, fontSize: 22, color: C.primary, marginBottom: 4, fontWeight: 500 }}>Profilim</h1>
        <p style={{ fontSize: 13, color: C.secondary, marginBottom: 24 }}>{email}</p>

        {/* KISISEL BILGILER */}
        <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: '20px 24px', marginBottom: 16 }}>
          <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 10, color: C.primary, letterSpacing: 2, marginBottom: 14 }}>KISISEL BILGILER</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, color: C.secondary, display: 'block', marginBottom: 4 }}>Ad</label>
              <input value={form.ad} onChange={e => set('ad', e.target.value)} placeholder="Adiniz" style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: C.secondary, display: 'block', marginBottom: 4 }}>Soyad</label>
              <input value={form.soyad} onChange={e => set('soyad', e.target.value)} placeholder="Soyadiniz" style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: C.secondary, display: 'block', marginBottom: 4 }}>Telefon</label>
              <input value={form.telefon} onChange={e => set('telefon', e.target.value)} placeholder="+90 555 000 0000" style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: C.secondary, display: 'block', marginBottom: 4 }}>Dogum Yili</label>
              <input value={form.dogum_yili} onChange={e => set('dogum_yili', e.target.value)} placeholder="1990" type="number" style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: C.secondary, display: 'block', marginBottom: 4 }}>Cinsiyet</label>
              <select value={form.cinsiyet} onChange={e => set('cinsiyet', e.target.value)} style={inputStyle}>
                <option value="">Secin</option><option value="erkek">Erkek</option><option value="kadin">Kadin</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, color: C.secondary, display: 'block', marginBottom: 4 }}>Sehir</label>
              <input value={form.sehir} onChange={e => set('sehir', e.target.value)} placeholder="Istanbul" style={inputStyle} />
            </div>
          </div>
        </div>

        {/* TIBBI GECMIS */}
        <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: '20px 24px', marginBottom: 16 }}>
          <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 10, color: C.primary, letterSpacing: 2, marginBottom: 14 }}>TIBBI GECMIS</div>
          <div style={{ display: 'grid', gap: 12 }}>
            {[
              { key: 'kronik_hastaliklar', label: 'Kronik Hastaliklar', placeholder: 'Diyabet, hipertansiyon, tiroid...' },
              { key: 'alerjiler', label: 'Alerjiler', placeholder: 'Bilinen ilac/gida alerjileri' },
              { key: 'ilaclar', label: 'Kullanilan Ilaclar', placeholder: 'Duzenli kullandiginiz ilaclar' },
              { key: 'gecmis_ameliyatlar', label: 'Gecmis Ameliyatlar', placeholder: 'Gecirdiginiz ameliyatlar' },
              { key: 'aile_gecmisi', label: 'Aile Saglik Gecmisi', placeholder: 'Ailede gorulmus hastaliklar' },
            ].map(f => (
              <div key={f.key}>
                <label style={{ fontSize: 11, color: C.secondary, display: 'block', marginBottom: 4 }}>{f.label}</label>
                <input value={(tibbi as Record<string, string>)[f.key]} onChange={e => setT(f.key, e.target.value)} placeholder={f.placeholder} style={inputStyle} />
              </div>
            ))}
          </div>
          <div style={{ fontSize: 11, color: '#999', fontStyle: 'italic', marginTop: 10 }}>Bu bilgiler analizlerinizde daha isabetli sonuc icin kullanilir.</div>
        </div>

        <button onClick={handleSave} disabled={saving}
          style={{ width: '100%', padding: 16, background: saving ? '#999' : C.primary, border: 'none', borderRadius: 12, fontFamily: cinzel.style.fontFamily, fontSize: 14, fontWeight: 600, color: C.gold, letterSpacing: 1, cursor: saving ? 'not-allowed' : 'pointer', minHeight: 44 }}>
          {saving ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </div>
    </div>
  )
}
