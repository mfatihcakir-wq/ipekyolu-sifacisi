'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Cinzel, EB_Garamond } from 'next/font/google'
import { createClient } from '@/lib/supabase'

const cinzel = Cinzel({ display: 'swap', preload: false, subsets: ['latin', 'latin-ext'], weight: ['400', '500', '600'] })
const garamond = EB_Garamond({ display: 'swap', preload: false, subsets: ['latin', 'latin-ext'], weight: ['400', '500'], style: ['normal', 'italic'] })

const C = {
  primary: '#1C3A26', gold: '#8B6914', cream: '#FAF7F2',
  dark: '#1C1C1C', secondary: '#6B5744', border: '#E8DFD4',
  white: '#FFFFFF', surface: '#FAF7F2',
}

const MIZAC_SECIMLERI = [
  { val: 'demevi', label: 'Demevi (Sicak-Nemli)', renk: '#EF5350' },
  { val: 'safravi', label: 'Safravi (Sicak-Kuru)', renk: '#FF9800' },
  { val: 'balgami', label: 'Balgami (Soguk-Nemli)', renk: '#42A5F5' },
  { val: 'sevdavi', label: 'Sevdavi (Soguk-Kuru)', renk: '#AB47BC' },
  { val: 'belirlenmedi', label: 'Henuz Belirlenmedi', renk: '#999' },
]

export default function AyarlarPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState('')
  const [fitriMizac, setFitriMizac] = useState('belirlenmedi')
  const [bildirimler, setBildirimler] = useState({
    email_analiz: true, email_kampanya: false, whatsapp_bildirim: true, push_bildirim: false,
  })
  const [yeniSifre, setYeniSifre] = useState('')
  const [sifreTekrar, setSifreTekrar] = useState('')
  const [sifreSaving, setSifreSaving] = useState(false)
  const [iptalOnay, setIptalOnay] = useState(false)
  const [iptalSaving, setIptalSaving] = useState(false)
  const [uyelik, setÜyelik] = useState<{ plan: string; bitis: string } | null>(null)

  useEffect(() => {
    async function yukle() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/giris'); return }

      const { data: profil } = await supabase.from('profiles').select('fitri_mizac, bildirim_tercihleri').eq('id', user.id).single()
      if (profil) {
        if (profil.fitri_mizac) setFitriMizac(profil.fitri_mizac)
        if (profil.bildirim_tercihleri) setBildirimler(prev => ({ ...prev, ...profil.bildirim_tercihleri }))
      }

      const { data: ab } = await supabase.from('abonelikler').select('plan, bitis').eq('kullanici_id', user.id).eq('durum', 'aktif').single()
      setÜyelik(ab)

      setLoading(false)
    }
    yukle()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  async function saveMizac(val: string) {
    setFitriMizac(val)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('profiles').upsert({ id: user.id, fitri_mizac: val })
    showToast('Fitri mizac kaydedildi')
  }

  async function saveBildirimler(key: string, val: boolean) {
    const updated = { ...bildirimler, [key]: val }
    setBildirimler(updated)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('profiles').upsert({ id: user.id, bildirim_tercihleri: updated })
    showToast('Bildirim tercihi guncellendi')
  }

  async function sifreDegistir() {
    if (yeniSifre.length < 6) { showToast('Hata: Sifre en az 6 karakter olmali'); return }
    if (yeniSifre !== sifreTekrar) { showToast('Hata: Sifreler eslesmiyor'); return }
    setSifreSaving(true)
    const { error } = await supabase.auth.updateUser({ password: yeniSifre })
    if (error) showToast('Hata: ' + error.message)
    else { showToast('Sifre basariyla degistirildi'); setYeniSifre(''); setSifreTekrar('') }
    setSifreSaving(false)
  }

  async function uyelikIptal() {
    setIptalSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('profiles').upsert({ id: user.id, iptal_talep_edildi: true, iptal_tarihi: new Date().toISOString() })
    // Abonelik durumunu guncelle
    await supabase.from('abonelikler').update({ durum: 'iptal_talep' }).eq('kullanici_id', user.id).eq('durum', 'aktif')
    setIptalOnay(false)
    showToast('Iptal talebi alindi. Ekibimiz sizinle iletisime gececektir.')
    setIptalSaving(false)
  }

  if (loading) {
    return (
      <div style={{ background: C.cream, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 40, height: 40, border: `3px solid ${C.border}`, borderTop: `3px solid ${C.primary}`, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  const inputSt: React.CSSProperties = {
    width: '100%', padding: '12px 14px', border: `1.5px solid ${C.border}`, borderRadius: 8,
    fontSize: 16, minHeight: 44, outline: 'none', boxSizing: 'border-box',
    fontFamily: 'inherit', background: C.surface, color: C.dark,
  }

  return (
    <div style={{ background: C.cream, minHeight: '100vh', fontFamily: garamond.style.fontFamily }}>
      <header style={{ background: C.primary, padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', gap: 12, position: 'sticky' as const, top: 0, zIndex: 100 }}>
        <button onClick={() => router.push('/hasta')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: 18 }}>{'\u2190'}</button>
        <div style={{ fontFamily: cinzel.style.fontFamily, color: C.gold, fontSize: 13, letterSpacing: 2 }}>AYARLAR</div>
      </header>

      {toast && (
        <div style={{ position: 'fixed' as const, top: 20, right: 20, zIndex: 9999, background: toast.includes('Hata') ? '#FCEBEB' : '#EAF3DE', border: `1px solid ${toast.includes('Hata') ? '#F7C1C1' : '#C0DD97'}`, color: toast.includes('Hata') ? '#A32D2D' : '#3B6D11', padding: '12px 20px', borderRadius: 10, fontSize: 13 }}>{toast}</div>
      )}

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '32px 20px' }}>
        <h1 style={{ fontFamily: cinzel.style.fontFamily, fontSize: 22, color: C.primary, marginBottom: 24, fontWeight: 500 }}>Ayarlar</h1>

        {/* FITRI MIZAC */}
        <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: '20px 24px', marginBottom: 16 }}>
          <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 10, color: C.primary, letterSpacing: 2, marginBottom: 6 }}>FITRI MIZAC</div>
          <div style={{ fontSize: 12, color: C.secondary, marginBottom: 14 }}>Dogumtan gelen sabit mizaciniz. Analizlerde fitri-hali karsilastirmasi icin kullanilir.</div>
          <div style={{ display: 'grid', gap: 6 }}>
            {MIZAC_SECIMLERI.map(m => (
              <button key={m.val} onClick={() => saveMizac(m.val)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 8,
                  border: `1.5px solid ${fitriMizac === m.val ? m.renk : C.border}`,
                  background: fitriMizac === m.val ? `${m.renk}10` : 'transparent',
                  cursor: 'pointer', textAlign: 'left',
                }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: m.renk, flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: fitriMizac === m.val ? C.dark : C.secondary, fontWeight: fitriMizac === m.val ? 600 : 400 }}>{m.label}</span>
                {fitriMizac === m.val && <span style={{ marginLeft: 'auto', fontSize: 12, color: m.renk }}>{'\u2713'}</span>}
              </button>
            ))}
          </div>
        </div>

        {/* BILDIRIM TERCIHLERI */}
        <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: '20px 24px', marginBottom: 16 }}>
          <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 10, color: C.primary, letterSpacing: 2, marginBottom: 14 }}>BILDIRIM TERCIHLERI</div>
          {[
            { key: 'email_analiz', label: 'E-posta: Analiz sonuclari' },
            { key: 'email_kampanya', label: 'E-posta: Kampanya ve duyurular' },
            { key: 'whatsapp_bildirim', label: 'WhatsApp: Sonuc bildirimleri' },
            { key: 'push_bildirim', label: 'Push: Tarayici bildirimleri' },
          ].map(b => (
            <div key={b.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${C.surface}` }}>
              <span style={{ fontSize: 13, color: C.dark }}>{b.label}</span>
              <button onClick={() => saveBildirimler(b.key, !(bildirimler as Record<string, boolean>)[b.key])}
                style={{
                  width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', position: 'relative' as const,
                  background: (bildirimler as Record<string, boolean>)[b.key] ? C.primary : C.border,
                  transition: 'background .2s',
                }}>
                <div style={{
                  width: 18, height: 18, borderRadius: '50%', background: C.white, position: 'absolute', top: 3,
                  left: (bildirimler as Record<string, boolean>)[b.key] ? 23 : 3, transition: 'left .2s',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                }} />
              </button>
            </div>
          ))}
        </div>

        {/* SIFRE DEGISTIR */}
        <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: '20px 24px', marginBottom: 16 }}>
          <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 10, color: C.primary, letterSpacing: 2, marginBottom: 14 }}>SIFRE DEGISTIR</div>
          <div style={{ display: 'grid', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 11, color: C.secondary, display: 'block', marginBottom: 4 }}>Yeni Sifre</label>
              <input type="password" value={yeniSifre} onChange={e => setYeniSifre(e.target.value)} placeholder="En az 6 karakter" style={inputSt} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: C.secondary, display: 'block', marginBottom: 4 }}>Sifre Tekrar</label>
              <input type="password" value={sifreTekrar} onChange={e => setSifreTekrar(e.target.value)} placeholder="Ayni sifreyi tekrar girin" style={inputSt} />
            </div>
          </div>
          <button onClick={sifreDegistir} disabled={sifreSaving || !yeniSifre}
            style={{ padding: '10px 20px', background: C.primary, border: 'none', borderRadius: 8, color: C.gold, fontFamily: cinzel.style.fontFamily, fontSize: 12, cursor: sifreSaving ? 'not-allowed' : 'pointer', opacity: !yeniSifre ? 0.5 : 1 }}>
            {sifreSaving ? 'Kaydediliyor...' : 'Sifreyi Degistir'}
          </button>
        </div>

        {/* UYELIK YONETIMI */}
        <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: '20px 24px', marginBottom: 16 }}>
          <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 10, color: C.primary, letterSpacing: 2, marginBottom: 14 }}>UYELIK YONETIMI</div>
          {uyelik ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: C.secondary }}>Plan</span>
                <span style={{ fontSize: 13, color: C.dark, fontWeight: 600 }}>{uyelik.plan}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <span style={{ fontSize: 13, color: C.secondary }}>Gecerlilik</span>
                <span style={{ fontSize: 13, color: C.dark }}>{new Date(uyelik.bitis).toLocaleDateString('tr-TR')}</span>
              </div>
              {!iptalOnay ? (
                <button onClick={() => setIptalOnay(true)}
                  style={{ padding: '10px 20px', background: 'transparent', border: '1px solid #C62828', borderRadius: 8, color: '#C62828', fontSize: 12, cursor: 'pointer' }}>
                  Uyeligi Iptal Et
                </button>
              ) : (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '14px 16px' }}>
                  <p style={{ fontSize: 13, color: '#C62828', marginBottom: 10 }}>Uyeliginizi iptal etmek istediginize emin misiniz? Donem sonuna kadar kullanimaya devam edebilirsiniz.</p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={uyelikIptal} disabled={iptalSaving}
                      style={{ padding: '8px 16px', background: '#C62828', border: 'none', borderRadius: 6, color: 'white', fontSize: 12, cursor: 'pointer' }}>
                      {iptalSaving ? 'Isleniyor...' : 'Evet, Iptal Et'}
                    </button>
                    <button onClick={() => setIptalOnay(false)}
                      style={{ padding: '8px 16px', background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 6, color: C.secondary, fontSize: 12, cursor: 'pointer' }}>
                      Vazgec
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div>
              <p style={{ fontSize: 13, color: C.secondary, marginBottom: 12 }}>Aktif uyeliginiz bulunmuyor.</p>
              <button onClick={() => router.push('/odeme')}
                style={{ padding: '10px 20px', background: C.gold, border: 'none', borderRadius: 8, color: C.primary, fontFamily: cinzel.style.fontFamily, fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
                Uye Ol
              </button>
            </div>
          )}
        </div>

        {/* CIKIS */}
        <button onClick={async () => { await supabase.auth.signOut(); router.push('/') }}
          style={{ width: '100%', padding: 14, background: 'transparent', border: `1.5px solid ${C.border}`, borderRadius: 12, color: '#999', fontSize: 13, cursor: 'pointer', fontFamily: cinzel.style.fontFamily, letterSpacing: 1 }}>
          Cikis Yap
        </button>
      </div>
    </div>
  )
}
