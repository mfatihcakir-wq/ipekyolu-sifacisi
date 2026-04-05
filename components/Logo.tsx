import React from 'react'

interface LogoProps {
  size?: number
  color?: 'light' | 'dark'
  animated?: boolean
  showText?: boolean
}

export default function Logo({
  size = 36,
  color = 'light',
  animated = true,
  showText = true,
}: LogoProps) {
  const goldColor = '#B8860B'
  const textColor = color === 'light' ? '#F5EDE0' : '#1C3A26'
  const arColor = color === 'light' ? 'rgba(184,134,11,0.4)' : 'rgba(184,134,11,0.6)'

  const animStyles = animated
    ? `
    @keyframes logoDraw { from { stroke-dashoffset: 200 } to { stroke-dashoffset: 0 } }
    @keyframes logoPop { from { opacity:0; transform:scale(0) } to { opacity:1; transform:scale(1) } }
    @keyframes logoFade { from { opacity:0 } to { opacity:1 } }
    .lb { stroke-dasharray:200; stroke-dashoffset:200; animation: logoDraw 1s ease 0.2s forwards }
    .ln { stroke-dasharray:50; stroke-dashoffset:50; animation: logoDraw 0.5s ease 0.8s forwards }
    .lh { opacity:0; animation: logoFade 0.4s ease 1.1s forwards }
    .ld { opacity:0; animation: logoFade 0.4s ease 1.3s forwards }
    .l1 { opacity:0; animation: logoPop 0.3s cubic-bezier(0.34,1.56,0.64,1) 1.4s forwards }
    .l2 { opacity:0; animation: logoPop 0.3s cubic-bezier(0.34,1.56,0.64,1) 1.55s forwards }
    .l3 { opacity:0; animation: logoPop 0.3s cubic-bezier(0.34,1.56,0.64,1) 1.7s forwards }
    .l4 { opacity:0; animation: logoPop 0.3s cubic-bezier(0.34,1.56,0.64,1) 1.85s forwards }
  `
    : '.lb,.ln,.lh,.ld,.l1,.l2,.l3,.l4{opacity:1}'

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" style={{ overflow: 'visible', flexShrink: 0 }}>
        <style>{animStyles}</style>
        <ellipse cx="32" cy="37" rx="12" ry="10" fill="none" stroke={goldColor} strokeWidth="1.5" className="lb" />
        <path d="M22 37 Q22 25 32 23 Q42 25 42 37" fill="none" stroke={goldColor} strokeWidth="1.5" className="lb" />
        <rect x="29" y="21" width="6" height="3.5" rx="1" fill="none" stroke={goldColor} strokeWidth="1.5" className="ln" />
        <path d="M32 15 Q36 11 40 13 Q38 18 32 20 Q26 18 24 13 Q28 11 32 15Z" fill={goldColor} className="lh" />
        <path d="M32 38 Q28.5 42 32 45.5 Q35.5 42 32 38Z" fill={goldColor} opacity={0.55} className="ld" />
        <circle cx="32" cy="32" r="2.5" fill="#EF5350" className="l1" />
        <circle cx="26.5" cy="34" r="1.8" fill="#FF7043" className="l2" />
        <circle cx="37.5" cy="34" r="1.8" fill="#42A5F5" className="l3" />
        <circle cx="32" cy="38" r="1.5" fill="#AB47BC" className="l4" />
      </svg>
      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 1 }}>
          <span style={{ fontFamily: 'Cinzel, serif', fontSize: 12, fontWeight: 600, color: textColor, letterSpacing: 3, lineHeight: 1.1 }}>
            {"\u0130PEK YOLU \u015e\u0130FACISI"}
          </span>
          <span style={{ fontFamily: 'serif', fontSize: 9, color: arColor, direction: 'rtl' as const }}>
            {"\u0637\u0631\u064A\u0642 \u0627\u0644\u062D\u0631\u064A\u0631 \u0627\u0644\u0634\u0627\u0641\u064A"}
          </span>
        </div>
      )}
    </div>
  )
}
