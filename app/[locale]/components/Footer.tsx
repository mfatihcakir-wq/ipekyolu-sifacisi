'use client'

import { Cormorant_Garamond as Cinzel, EB_Garamond } from 'next/font/google'

const cinzel = Cinzel({ display: 'swap', preload: false, subsets: ['latin', 'latin-ext'], weight: ['400', '600'] })
const garamond = EB_Garamond({ display: 'swap', preload: false, subsets: ['latin', 'latin-ext'], weight: ['400'], style: ['normal'] })

const C = { primary: '#1C3A26', gold: '#B8860B' }

export default function Footer() {
  return (
    <>
    {/* Footer CTA */}
    <div style={{ background: '#122B1C', padding: '48px 24px', textAlign: 'center' as const }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 22, color: 'white', fontWeight: 600, marginBottom: 8 }}>{"Bedeninizi Tanımaya Hazır mısınız?"}</div>
        <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', fontStyle: 'italic', marginBottom: 24 }}>{"Ücretsiz analizinizi şimdi başlatın."}</div>
        <a href="/analiz" style={{ display: 'inline-block', background: '#059669', color: 'white', borderRadius: 10, padding: '14px 32px', fontFamily: cinzel.style.fontFamily, fontSize: 13, fontWeight: 600, textDecoration: 'none', letterSpacing: 1 }}>
          {"Ücretsiz Analizi Başlat \u2192"}
        </a>
      </div>
    </div>
    <footer style={{ background: C.primary, padding: '48px 24px 24px', color: 'rgba(255,255,255,0.6)', fontFamily: garamond.style.fontFamily }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32, marginBottom: 32 }}>

        {/* Kolon 1: Logo */}
        <div>
          <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <svg width="24" height="24" viewBox="0 0 64 64" fill="none">
              <ellipse cx="32" cy="37" rx="13" ry="11" fill="none" stroke="#B8860B" strokeWidth="1.5"/>
              <path d="M22 37 Q22 25 32 23 Q42 25 42 37" fill="none" stroke="#B8860B" strokeWidth="1.5"/>
              <path d="M32 14 Q36 10 40 12 Q38 18 32 20 Q26 18 24 12 Q28 10 32 14Z" fill="#B8860B"/>
              <circle cx="32" cy="32" r="2.8" fill="#EF5350"/>
            </svg>
            <span style={{ fontFamily: cinzel.style.fontFamily, color: C.gold, fontSize: 12, fontWeight: 600, letterSpacing: 2 }}>{"İPEK YOLU ŞİFACISI"}</span>
          </a>
          <p style={{ fontSize: 13, lineHeight: 1.7, maxWidth: 260 }}>
            {"Bin yıllık şifa geleneği, modern danışmanlık."}
          </p>
        </div>

        {/* Kolon 2: Hizmetler */}
        <div>
          <div style={{ fontFamily: cinzel.style.fontFamily, color: C.gold, fontSize: 11, fontWeight: 600, letterSpacing: 2, marginBottom: 12 }}>{"HİZMETLER"}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
            <a href="/analiz" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>{"Analiz Başlat"}</a>
            <a href="/bitkiler" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>{"Bitki Atlası"}</a>
          </div>
        </div>

        {/* Kolon 3: Kurumsal */}
        <div>
          <div style={{ fontFamily: cinzel.style.fontFamily, color: C.gold, fontSize: 11, fontWeight: 600, letterSpacing: 2, marginBottom: 12 }}>{"KURUMSAL"}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
            <a href="/hakkimizda" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>{"Hakkımızda"}</a>
            <a href="/sss" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>{"Sıkça Sorulan Sorular"}</a>
            <a href="https://wa.me/905331687226" target="_blank" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>{"WhatsApp İletişim"}</a>
          </div>
        </div>

        {/* Kolon 4: Yasal */}
        <div>
          <div style={{ fontFamily: cinzel.style.fontFamily, color: C.gold, fontSize: 11, fontWeight: 600, letterSpacing: 2, marginBottom: 12 }}>{"YASAL"}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
            <a href="/kvkk" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>{"KVKK Aydınlatma Metni"}</a>
            <a href="/gizlilik-politikasi" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>{"Gizlilik Politikası"}</a>
          </div>
        </div>
      </div>

      {/* Alt bar */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ fontSize: 12 }}>{"© 2026 İpek Yolu Şifacısı. Tüm hakları saklıdır."}</div>
        <a href="https://wa.me/905331687226" target="_blank" style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#25D366', textDecoration: 'none', fontSize: 12, fontWeight: 600 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.136.563 4.14 1.544 5.877L.057 23.943l6.25-1.508A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg>
          {"WhatsApp Destek"}
        </a>
      </div>
    </footer>
    </>
  )
}
