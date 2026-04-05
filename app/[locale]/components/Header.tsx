'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Cinzel } from 'next/font/google'
import { createClient } from '@/lib/supabase'

const cinzel = Cinzel({ subsets: ['latin', 'latin-ext'], weight: ['400', '500', '600'] })

const C = {
  primary: '#1C3A26', gold: '#8B6914', cream: '#FAF7F2',
  secondary: '#6B5744', border: '#E8DFD4', white: '#FFFFFF',
}

const DANISМАН_EMAIL = 'm.fatih.cakir@gmail.com'

const NAV_LINKS = [
  { href: '/#nasil-calisir', label: 'Nasil Calisir' },
  { href: '/bitkiler', label: 'Bitkiler' },
  { href: '/#fiyatlandirma', label: 'Fiyatlar' },
  { href: '/hakkimizda', label: 'Hakkimizda' },
]

// Dil secici kaldirildi — sadece TR

interface HeaderUser {
  email?: string
}

export default function Header() {
  const [user, setUser] = useState<HeaderUser | null>(null)
  const [menuAcik, setMenuAcik] = useState(false)
  const [profilAcik, setProfilAcik] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user as HeaderUser | null))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const isDanisман = user?.email === DANISМАН_EMAIL
  const isActive = (href: string) => pathname === href || (href !== '/' && pathname.startsWith(href))

  async function cikisYap() {
    await supabase.auth.signOut()
    setUser(null)
    setProfilAcik(false)
    router.push('/')
  }

  return (
    <>
      <header style={{
        background: C.primary, position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          {/* SOL: Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', flexShrink: 0 }} onClick={() => router.push('/')}>
            <svg width="32" height="32" viewBox="0 0 64 64" fill="none">
              <ellipse cx="32" cy="37" rx="13" ry="11" fill="none" stroke="#8B6914" strokeWidth="1.5"/>
              <path d="M22 37 Q22 25 32 23 Q42 25 42 37" fill="none" stroke="#8B6914" strokeWidth="1.5"/>
              <rect x="28" y="21" width="8" height="4" rx="1.5" fill="none" stroke="#8B6914" strokeWidth="1.5"/>
              <path d="M32 14 Q36 10 40 12 Q38 18 32 20 Q26 18 24 12 Q28 10 32 14Z" fill="#8B6914"/>
              <circle cx="32" cy="32" r="2.8" fill="#EF5350"/>
              <circle cx="26.5" cy="34" r="2" fill="#FF7043"/>
              <circle cx="37.5" cy="34" r="2" fill="#42A5F5"/>
              <circle cx="32" cy="38.5" r="1.8" fill="#AB47BC"/>
            </svg>
            <span style={{ fontFamily: cinzel.style.fontFamily, color: C.gold, fontSize: 14, fontWeight: 600, letterSpacing: 3 }}>
              {"IPEK YOLU"}
            </span>
          </div>

          {/* ORTA: Desktop Nav */}
          <nav className="header-desktop-nav" style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            {NAV_LINKS.map(link => (
              <button
                key={link.href}
                onClick={() => router.push(link.href)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: isActive(link.href) ? C.gold : 'rgba(255,255,255,0.7)',
                  fontFamily: cinzel.style.fontFamily,
                  fontSize: 11,
                  fontWeight: isActive(link.href) ? 600 : 400,
                  letterSpacing: 1,
                  padding: '6px 12px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  borderBottom: isActive(link.href) ? `2px solid ${C.gold}` : '2px solid transparent',
                }}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* SAG: Dil + Auth */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>

            {/* Auth Butonlari */}
            {!user ? (
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => router.push('/login')}
                  style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: 6, padding: '6px 14px', fontSize: 11, cursor: 'pointer', fontFamily: cinzel.style.fontFamily, letterSpacing: 1 }}>
                  {"Giris"}
                </button>
                <button onClick={() => router.push('/analiz')}
                  style={{ background: '#059669', border: 'none', color: 'white', borderRadius: 6, padding: '7px 16px', fontSize: 11, cursor: 'pointer', fontFamily: cinzel.style.fontFamily, fontWeight: 600, letterSpacing: 1 }}>
                  {"Ucretsiz Basla \u2192"}
                </button>
              </div>
            ) : isDanisман ? (
              <button onClick={() => router.push('/dashboard')}
                style={{ background: C.gold, border: 'none', color: C.primary, borderRadius: 6, padding: '6px 14px', fontSize: 11, cursor: 'pointer', fontFamily: cinzel.style.fontFamily, fontWeight: 600, letterSpacing: 1 }}>
                {"Panel"}
              </button>
            ) : (
              <div style={{ position: 'relative' }}>
                <button onClick={() => setProfilAcik(!profilAcik)}
                  style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: 6, padding: '6px 12px', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                  {"Profilim"} <span style={{ fontSize: 8 }}>{'\u25BC'}</span>
                </button>
                {profilAcik && (
                  <div style={{ position: 'absolute', top: 36, right: 0, background: 'white', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.15)', overflow: 'hidden', minWidth: 160, zIndex: 200 }}>
                    <button onClick={() => { setProfilAcik(false); router.push('/analizlerim') }}
                      style={{ display: 'block', width: '100%', padding: '10px 16px', border: 'none', background: 'white', cursor: 'pointer', fontSize: 13, color: C.primary, textAlign: 'left' }}>
                      {"Analizlerim"}
                    </button>
                    <button onClick={cikisYap}
                      style={{ display: 'block', width: '100%', padding: '10px 16px', border: 'none', background: 'white', cursor: 'pointer', fontSize: 13, color: '#C62828', textAlign: 'left', borderTop: '1px solid #eee' }}>
                      {"Cikis Yap"}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Hamburger (mobil) */}
            <button onClick={() => setMenuAcik(!menuAcik)} className="header-hamburger"
              style={{ background: 'none', border: 'none', color: 'white', fontSize: 22, cursor: 'pointer', padding: '4px', display: 'none' }}>
              {menuAcik ? '\u2715' : '\u2630'}
            </button>
          </div>
        </div>

        {/* Mobil Menu */}
        {menuAcik && (
          <div style={{ background: C.primary, borderTop: '1px solid rgba(255,255,255,0.1)', padding: '12px 20px' }}>
            {NAV_LINKS.map(link => (
              <button key={link.href} onClick={() => { setMenuAcik(false); router.push(link.href) }}
                style={{ display: 'block', width: '100%', padding: '10px 0', border: 'none', background: 'none', color: isActive(link.href) ? C.gold : 'rgba(255,255,255,0.7)', fontSize: 13, cursor: 'pointer', textAlign: 'left', fontFamily: cinzel.style.fontFamily, letterSpacing: 1, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                {link.label}
              </button>
            ))}
            <button onClick={() => { setMenuAcik(false); router.push('/analiz') }}
              style={{ display: 'block', width: '100%', padding: '12px 0', marginTop: 8, border: 'none', background: '#059669', color: 'white', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontFamily: cinzel.style.fontFamily, fontWeight: 600, letterSpacing: 1 }}>
              {"Ucretsiz Basla \u2192"}
            </button>
          </div>
        )}
      </header>

      {/* Overlay kapama */}
      {profilAcik && (
        <div onClick={() => { setProfilAcik(false) }}
          style={{ position: 'fixed', inset: 0, zIndex: 99 }} />
      )}

      <style>{`
        @media (max-width: 768px) {
          .header-desktop-nav { display: none !important; }
          .header-hamburger { display: block !important; }
        }
      `}</style>
    </>
  )
}
