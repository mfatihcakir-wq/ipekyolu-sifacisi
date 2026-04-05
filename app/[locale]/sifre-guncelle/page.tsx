'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Cinzel, EB_Garamond } from 'next/font/google'
import Header from '../components/Header'
import Footer from '../components/Footer'

const cinzel = Cinzel({ subsets: ['latin', 'latin-ext'], weight: ['400', '600'] })
const garamond = EB_Garamond({ subsets: ['latin', 'latin-ext'], weight: ['400'], style: ['normal'] })

const C = { primary: '#1C3A26', gold: '#8B6914', cream: '#FAF7F2', border: '#E8DFD4' }

export default function SifreGuncellePage() {
  const [sifre, setSifre] = useState('')
  const [tekrar, setTekrar] = useState('')
  const [msg, setMsg] = useState('')
  const [yukleniyor, setYukleniyor] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleGuncelle() {
    if (sifre.length < 6) { setMsg('Sifre en az 6 karakter olmalidir.'); return }
    if (sifre !== tekrar) { setMsg('Sifreler eslesmиyor.'); return }
    setYukleniyor(true)
    const { error } = await supabase.auth.updateUser({ password: sifre })
    if (error) { setMsg('Hata: ' + error.message) }
    else { setMsg('Sifreniz guncellendi. Yonlendiriliyorsunuz...'); setTimeout(() => router.push('/dashboard'), 2000) }
    setYukleniyor(false)
  }

  return (
    <div style={{ background: C.cream, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: garamond.style.fontFamily }}>
      <Header />
      <div style={{ background: 'white', borderRadius: 16, padding: '40px 36px', maxWidth: 380, width: '100%', border: `1px solid ${C.border}` }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 18, color: C.primary, marginBottom: 6 }}>{"Yeni Şifre"}</div>
          <div style={{ fontSize: 13, color: '#999' }}>{"Güçlü bir şifre seçin"}</div>
        </div>
        <label style={{ fontSize: 11, color: '#666', display: 'block', marginBottom: 6 }}>{"Yeni Şifre"}</label>
        <input type="password" value={sifre} onChange={e => setSifre(e.target.value)}
          style={{ width: '100%', padding: '10px 12px', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, marginBottom: 12, boxSizing: 'border-box' as const }} />
        <label style={{ fontSize: 11, color: '#666', display: 'block', marginBottom: 6 }}>{"Şifre Tekrar"}</label>
        <input type="password" value={tekrar} onChange={e => setTekrar(e.target.value)}
          style={{ width: '100%', padding: '10px 12px', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, marginBottom: 16, boxSizing: 'border-box' as const }} />
        {msg && <div style={{ fontSize: 12, color: msg.startsWith('Hata') ? '#C62828' : '#2E7D32', marginBottom: 12 }}>{msg}</div>}
        <button onClick={handleGuncelle} disabled={yukleniyor}
          style={{ width: '100%', padding: '12px', background: C.primary, border: 'none', borderRadius: 10, color: C.gold, fontFamily: cinzel.style.fontFamily, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          {yukleniyor ? 'Guncelleniyor...' : 'SIFREYI GUNCELLE'}
        </button>
      </div>
      <Footer />
    </div>
  )
}
