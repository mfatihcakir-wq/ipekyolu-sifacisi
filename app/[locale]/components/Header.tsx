'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Cinzel } from 'next/font/google'
import { createClient } from '@/lib/supabase'

const cinzel = Cinzel({ display: 'swap', preload: false, subsets: ['latin', 'latin-ext'], weight: ['400', '500', '600'] })

const C = {
  primary: '#1C3A26', gold: '#B8860B', cream: '#FAF6EF',
  secondary: '#6B5744', border: '#DEB887', white: '#FFFFFF',
}

const DANISМАН_EMAIL = 'm.fatih.cakir@gmail.com'

const NAV_LINKS = [
  { href: '/#nasil-calisir', label: 'Nasıl Çalışır' },
  { href: '/bitkiler', label: 'Bitkiler' },
  { href: '/#fiyatlandirma', label: 'Fiyatlar' },
  { href: '/hakkimizda', label: 'Hakkımızda' },
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', flexShrink: 0 }} onClick={() => router.push('/')}>
            <svg width="36" height="36" viewBox="0 0 64 64" fill="none" style={{ overflow: 'visible' }}>
              <style>{`
                @keyframes drawLogo { from { stroke-dashoffset: 200 } to { stroke-dashoffset: 0 } }
                @keyframes popDot { from { opacity:0; transform:scale(0) } to { opacity:1; transform:scale(1) } }
                @keyframes fadeHorn { from { opacity:0 } to { opacity:1 } }
                .hdr-lb { stroke-dasharray:200; stroke-dashoffset:200; animation: drawLogo 1s ease 0.2s forwards }
                .hdr-ln { stroke-dasharray:50; stroke-dashoffset:50; animation: drawLogo 0.5s ease 0.8s forwards }
                .hdr-lh { opacity:0; animation: fadeHorn 0.4s ease 1.1s forwards }
                .hdr-ld { opacity:0; animation: fadeHorn 0.4s ease 1.3s forwards }
                .hdr-d1 { opacity:0; animation: popDot 0.3s cubic-bezier(0.34,1.56,0.64,1) 1.4s forwards }
                .hdr-d2 { opacity:0; animation: popDot 0.3s cubic-bezier(0.34,1.56,0.64,1) 1.55s forwards }
                .hdr-d3 { opacity:0; animation: popDot 0.3s cubic-bezier(0.34,1.56,0.64,1) 1.7s forwards }
                .hdr-d4 { opacity:0; animation: popDot 0.3s cubic-bezier(0.34,1.56,0.64,1) 1.85s forwards }
              `}</style>
              <ellipse cx="32" cy="37" rx="12" ry="10" fill="none" stroke="#B8860B" strokeWidth="1.5" className="hdr-lb" />
              <path d="M22 37 Q22 25 32 23 Q42 25 42 37" fill="none" stroke="#B8860B" strokeWidth="1.5" className="hdr-lb" />
              <rect x="29" y="21" width="6" height="3.5" rx="1" fill="none" stroke="#B8860B" strokeWidth="1.5" className="hdr-ln" />
              <path d="M32 15 Q36 11 40 13 Q38 18 32 20 Q26 18 24 13 Q28 11 32 15Z" fill="#B8860B" className="hdr-lh" />
              <path d="M32 38 Q28.5 42 32 45.5 Q35.5 42 32 38Z" fill="#B8860B" opacity={0.55} className="hdr-ld" />
              <circle cx="32" cy="32" r="2.5" fill="#EF5350" className="hdr-d1" />
              <circle cx="26.5" cy="34" r="1.8" fill="#FF7043" className="hdr-d2" />
              <circle cx="37.5" cy="34" r="1.8" fill="#42A5F5" className="hdr-d3" />
              <circle cx="32" cy="38" r="1.5" fill="#AB47BC" className="hdr-d4" />
            </svg>
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 1 }}>
              <span style={{ fontFamily: cinzel.style.fontFamily, fontSize: 12, fontWeight: 600, color: '#F5EDE0', letterSpacing: 3, lineHeight: 1.1 }}>
                {"\u0130PEK YOLU \u015e\u0130FACISI"}
              </span>
              <span style={{ fontFamily: 'serif', fontSize: 9, color: 'rgba(184,134,11,0.4)', direction: 'rtl' as const }}>
                {"\u0637\u0631\u064A\u0642 \u0627\u0644\u062D\u0631\u064A\u0631 \u0627\u0644\u0634\u0627\u0641\u064A"}
              </span>
            </div>
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
              <div className="header-auth-btns" style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => router.push('/giris')}
                  style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: 6, padding: '6px 14px', fontSize: 11, cursor: 'pointer', fontFamily: cinzel.style.fontFamily, letterSpacing: 1 }}>
                  {"Giriş"}
                </button>
                <button onClick={() => router.push('/analiz')}
                  style={{ background: '#059669', border: 'none', color: 'white', borderRadius: 6, padding: '7px 16px', fontSize: 11, cursor: 'pointer', fontFamily: cinzel.style.fontFamily, fontWeight: 600, letterSpacing: 1 }}>
                  {"Ücretsiz Başla \u2192"}
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
                      {"Çıkış Yap"}
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
          <div style={{ background: C.primary, borderTop: '1px solid rgba(255,255,255,0.1)', padding: '16px', left: 0, right: 0, width: '100%', overflowX: 'hidden' as const, boxSizing: 'border-box' as const }}>
            {NAV_LINKS.map(link => (
              <button key={link.href} onClick={() => { setMenuAcik(false); router.push(link.href) }}
                style={{ display: 'block', width: '100%', padding: '10px 0', border: 'none', background: 'none', color: isActive(link.href) ? C.gold : 'rgba(255,255,255,0.7)', fontSize: 13, cursor: 'pointer', textAlign: 'left', fontFamily: cinzel.style.fontFamily, letterSpacing: 1, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                {link.label}
              </button>
            ))}
            <button onClick={() => { setMenuAcik(false); router.push('/analiz') }}
              style={{ display: 'block', width: '100%', padding: '12px 0', marginTop: 8, border: 'none', background: '#059669', color: 'white', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontFamily: cinzel.style.fontFamily, fontWeight: 600, letterSpacing: 1 }}>
              {"Ücretsiz Başla \u2192"}
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
          .header-auth-btns { display: none !important; }
          .header-hamburger { display: block !important; }
        }
      `}</style>
    </>
  )
}
