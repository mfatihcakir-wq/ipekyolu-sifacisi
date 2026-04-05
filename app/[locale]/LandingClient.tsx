'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase'

function FeatCard({ icon, title, desc, link, hot }: { icon: React.ReactNode; title: string; desc: string; link: string; hot?: boolean }) {
  return (
    <div style={{ background: hot ? '#FFFDF7' : 'white', border: `${hot ? 1.5 : 1}px solid ${hot ? '#B8860B' : '#DEB887'}`, borderRadius: 16, padding: '32px 28px', position: 'relative' as const, overflow: 'hidden' }}>
      <div style={{ height: 3, background: hot ? '#B8860B' : '#1C3A26', borderRadius: '16px 16px 0 0', position: 'absolute' as const, top: 0, left: 0, right: 0 }} />
      <div style={{ width: 44, height: 44, background: hot ? 'rgba(184,134,11,0.1)' : '#F5EFE0', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>{icon}</div>
      <div style={{ fontFamily: 'Cinzel,serif', fontSize: 15, fontWeight: 600, color: '#1A1208', marginBottom: 10 }}>{title}</div>
      <p style={{ fontSize: 16, color: '#5C4A2A', lineHeight: 1.75 }}>{desc}</p>
      <a href={link} style={{ fontFamily: 'Cinzel,serif', fontSize: 9, color: '#B8860B', letterSpacing: 1.5, marginTop: 18, display: 'block', textDecoration: 'none' }}>{"DETAYLI \u0130NCELE \u2192"}</a>
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function LandingClient() {
  const router = useRouter()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [yorumlar, setYorumlar] = useState<any[]>([])
  const kayitSayisi = '46.000+'

  useEffect(() => {
    const supabase = createClient()
    supabase.from('yorumlar').select('*').eq('onaylandi', true).order('onay_tarihi', { ascending: false }).limit(6).then(({ data }) => { if (data && data.length > 0) setYorumlar(data) })
  }, [])

  const iconStyle = { width: 22, height: 22, stroke: '#1C3A26', fill: 'none', strokeWidth: 1.5 } as const

  return (
    <main>

      {/* HERO */}
      <section style={{ background: '#1C3A26', padding: 'clamp(64px,8vw,96px) clamp(24px,5vw,80px) 0', display: 'grid', gridTemplateColumns: '1fr clamp(300px,30vw,400px)', gap: 'clamp(32px,5vw,64px)', alignItems: 'center', position: 'relative' as const, overflow: 'hidden' }} className="hero-grid">
        <div style={{ position: 'absolute' as const, right: -40, top: '50%', transform: 'translateY(-50%)', fontFamily: 'Cinzel,serif', fontSize: 160, fontWeight: 700, color: 'rgba(255,255,255,0.025)', pointerEvents: 'none', userSelect: 'none', letterSpacing: -4, whiteSpace: 'nowrap' as const }}>{"MIZAC"}</div>

        <div style={{ position: 'relative' as const, zIndex: 1 }}>
          <div style={{ fontFamily: 'Cinzel,serif', fontSize: 10, color: 'rgba(184,134,11,0.5)', letterSpacing: 4, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ width: 24, height: 1, background: 'rgba(184,134,11,0.3)', display: 'block' }} />
            {"KLAS\u0130K \u0130SLAM VE OSMANLI TIBBI"}
          </div>

          <h1 style={{ fontFamily: 'Cinzel,serif', fontSize: 'clamp(36px,5vw,54px)', fontWeight: 600, color: '#F5EDE0', lineHeight: 1.08, marginBottom: 14 }}>
            {"Bedeninizin "}
            <span style={{ color: '#B8860B', display: 'block' }}>{"Dilini Anl\u0131yoruz."}</span>
          </h1>

          <p style={{ fontSize: 19, color: 'rgba(245,237,224,0.55)', fontStyle: 'italic', lineHeight: 1.85, marginBottom: 40, maxWidth: 480 }}>
            {"Nab\u0131z\u0131n\u0131zdan mizac\u0131n\u0131za, dilinizden h\u0131lt dengenize; bin y\u0131ll\u0131k birikimle haz\u0131rlanm\u0131\u015f, size \u00f6zel dan\u0131\u015fmanl\u0131k."}
          </p>

          <div style={{ display: 'flex', gap: 14, marginBottom: 40, flexWrap: 'wrap' as const }}>
            <button onClick={() => router.push('/analiz')} style={{ fontFamily: 'Cinzel,serif', fontSize: 11, fontWeight: 700, color: '#1C3A26', background: '#B8860B', padding: '16px 36px', borderRadius: 11, letterSpacing: 2, border: 'none', cursor: 'pointer' }}>{"ANAL\u0130Z\u0130M\u0130 BA\u015eLAT"}</button>
            <button onClick={() => router.push('/bitkiler')} style={{ fontFamily: 'Cinzel,serif', fontSize: 11, color: 'rgba(245,237,224,0.55)', background: 'transparent', padding: '15px 26px', borderRadius: 11, border: '1.5px solid rgba(245,237,224,0.15)', letterSpacing: 1.5, cursor: 'pointer' }}>{"B\u0130TK\u0130 ANS\u0130KLOPED\u0130S\u0130"}</button>
          </div>

          <div style={{ fontFamily: 'Cinzel,serif', fontSize: 9, color: 'rgba(184,134,11,0.35)', letterSpacing: 2.5, paddingBottom: 80 }}>{"38 KLAS\u0130K ESER \u00b7 "}{kayitSayisi}{" MET\u0130N KAYDI \u00b7 1.180 B\u0130TK\u0130"}</div>
        </div>

        {/* Danisman karti */}
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(184,134,11,0.1)', borderRadius: 20, padding: 28, marginBottom: 24, position: 'relative' as const, zIndex: 1 }} className="hero-panel">
          <div style={{ fontFamily: 'Cinzel,serif', fontSize: 8, color: 'rgba(184,134,11,0.45)', letterSpacing: 2, marginBottom: 18 }}>{"DANI\u015eMAN"}</div>
          <div style={{ width: 64, height: 64, borderRadius: '50%', overflow: 'hidden', border: '1.5px solid rgba(184,134,11,0.18)', marginBottom: 14, background: 'rgba(184,134,11,0.1)' }}>
            <Image src="/danisan.jpg" alt="M. Fatih Cakir" width={64} height={64} style={{ objectFit: 'cover', width: 64, height: 64, borderRadius: '50%' }} />
          </div>
          <div style={{ fontFamily: 'Cinzel,serif', fontSize: 13, fontWeight: 600, color: '#F5EDE0', marginBottom: 3 }}>{"M. Fatih \u00c7ak\u0131r"}</div>
          <div style={{ fontSize: 12, color: 'rgba(245,237,224,0.38)', fontStyle: 'italic', marginBottom: 18, lineHeight: 1.5 }}>{"Klasik \u0130slam T\u0131bb\u0131 Ara\u015ft\u0131rmac\u0131s\u0131"}<br />{"T\u0131p Tarihi Y\u00fcksek Lisans"}</div>
          <div style={{ height: 1, background: 'rgba(184,134,11,0.08)', marginBottom: 14 }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[{ n: '38', l: 'ESER' }, { n: '46K+', l: 'KAYIT' }, { n: '8', l: 'K\u0130TAP' }, { n: '10+', l: 'YIL' }].map(({ n, l }) => (
              <div key={l} style={{ textAlign: 'center' as const, padding: 9, background: 'rgba(184,134,11,0.05)', borderRadius: 7, border: '1px solid rgba(184,134,11,0.07)' }}>
                <div style={{ fontFamily: 'Cinzel,serif', fontSize: 17, fontWeight: 600, color: '#B8860B', lineHeight: 1 }}>{n}</div>
                <div style={{ fontFamily: 'Cinzel,serif', fontSize: 6, color: 'rgba(245,237,224,0.25)', letterSpacing: 1.5, marginTop: 3 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Wave */}
      <div style={{ position: 'relative' as const, height: 52, background: '#1C3A26' }}>
        <div style={{ position: 'absolute' as const, bottom: 0, left: 0, right: 0, height: 52, background: '#FAF6EF', clipPath: 'ellipse(55% 100% at 50% 100%)' }} />
      </div>

      {/* STATS */}
      <section style={{ background: '#F5EFE0', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', borderBottom: '1px solid #DEB887' }} className="stats-grid">
        {[
          { n: '38', l: 'KLAS\u0130K ESER', s: 'el-H\u00e2v\u00ee, el-K\u00e2n\u00fbn, el-\u015e\u00e2mil' },
          { n: kayitSayisi, l: 'MET\u0130N KAYDI', s: '\u0130ndekslenmi\u015f par\u00e7a' },
          { n: '1.180', l: 'B\u0130TK\u0130 & MADDE', s: '\u0130bn Beyt\u00e2r kayna\u011f\u0131' },
          { n: '9', l: 'NABIZ SIFATI', s: '\u0130bn S\u00een\u00e2 metodolojisi' },
        ].map(({ n, l, s }, i, arr) => (
          <div key={l} style={{ textAlign: 'center' as const, padding: '40px 20px', borderRight: i < arr.length - 1 ? '1px solid #DEB887' : 'none' }}>
            <div style={{ fontFamily: 'Cinzel,serif', fontSize: 42, fontWeight: 700, color: '#1C3A26', lineHeight: 1, marginBottom: 8 }}>{n}</div>
            <div style={{ fontFamily: 'Cinzel,serif', fontSize: 8, color: '#9B8060', letterSpacing: 2.5, marginBottom: 4 }}>{l}</div>
            <div style={{ fontSize: 13, color: '#9B8060', fontStyle: 'italic' }}>{s}</div>
          </div>
        ))}
      </section>

      {/* FEATURES */}
      <section style={{ padding: '88px clamp(24px,5vw,80px)', background: '#FAF6EF' }}>
        <div style={{ textAlign: 'center' as const, marginBottom: 60 }}>
          <div style={{ fontFamily: 'Cinzel,serif', fontSize: 10, color: '#B8860B', letterSpacing: 3, marginBottom: 14 }}>{"NEDEN FARKLI"}</div>
          <h2 style={{ fontFamily: 'Cinzel,serif', fontSize: 'clamp(28px,4vw,38px)', fontWeight: 600, color: '#1A1208', lineHeight: 1.15, marginBottom: 12 }}>{"Beden Bir Bütündür"}</h2>
          <p style={{ fontSize: 18, color: '#5C4A2A', fontStyle: 'italic', lineHeight: 1.75, maxWidth: 540, margin: '0 auto' }}>{"Modern tıbbın semptomu gördüğü yerde, klasik tıp sebebi arar."}</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, maxWidth: 1100, margin: '0 auto' }} className="features-grid">
          <FeatCard icon={<svg style={iconStyle} viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>} title="Mizaç Tespiti" desc="Nabız, dil, yüz ve lab değerleri birlikte okunarak vücudunuzun derin tabiatı belirlenir." link="/analiz" />
          <FeatCard icon={<svg style={{ ...iconStyle, stroke: '#B8860B' }} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M8 12h8M12 8v8" /></svg>} title="Kişisel Bitki Protokolü" desc="1.180 bitki ve tıbbi maddeden sizin mizacınıza özel protokol hazırlanır." link="/bitkiler" hot />
          <FeatCard icon={<svg style={iconStyle} viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.58-7 8-7s8 3 8 7" /></svg>} title="Uzman Danışmanlık" desc="24-48 saat içinde danışmanınız WhatsApp üzerinden protokolünüzü iletir." link="/hakkimizda" />
          <FeatCard icon={<svg style={iconStyle} viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>} title="38 Klasik Kaynak" desc="el-Hâvî, Tahbîzü'l-Mathûn, el-Şâmil ve 35 eser daha analizinize destek verir." link="/hakkimizda" />
          <FeatCard icon={<svg style={iconStyle} viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>} title="Kalp Şehri Analizi" desc="Klasik İslam ahlak geleneğine dayalı öz-değerlendirme. 4 cephe, 40 soru." link="/karakter" />
          <FeatCard icon={<svg style={iconStyle} viewBox="0 0 24 24"><rect x="5" y="2" width="14" height="20" rx="2" /><path d="M9 7h6M9 11h6M9 15h4" /></svg>} title="PDF Protokol Raporu" desc="Her analizin sonunda kaynaklı, detaylı PDF rapor ve WhatsApp iletimi." link="/analiz" />
          <FeatCard icon={<svg style={iconStyle} viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>} title="Cilt Bakımı Protokolü" desc="Mizacınıza özel klasik İslam tıbbı kaynaklı cilt bakım protokolü. Bitki bazlı, kişiye özel." link="/hasta/cilt" />
        </div>
      </section>

      {/* STEPS */}
      <section id="nasil-calisir" style={{ background: '#1C3A26', padding: '88px clamp(24px,5vw,80px)' }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <div style={{ textAlign: 'center' as const, marginBottom: 56 }}>
            <div style={{ fontFamily: 'Cinzel,serif', fontSize: 10, color: 'rgba(184,134,11,0.5)', letterSpacing: 3, marginBottom: 14 }}>{"S\u00dcRE\u00c7"}</div>
            <h2 style={{ fontFamily: 'Cinzel,serif', fontSize: 'clamp(28px,4vw,38px)', fontWeight: 600, color: '#F5EDE0', lineHeight: 1.15, marginBottom: 12 }}>{"Nas\u0131l \u00c7al\u0131\u015f\u0131r?"}</h2>
            <p style={{ fontSize: 18, color: 'rgba(245,237,224,0.4)', fontStyle: 'italic', lineHeight: 1.75, maxWidth: 480, margin: '0 auto' }}>{"\u00dc\u00e7 ad\u0131mda ki\u015fisel sa\u011fl\u0131k protokol\u00fcn\u00fcze kavu\u015fun."}</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 40, position: 'relative' as const }} className="steps-grid">
            <div style={{ position: 'absolute' as const, top: 28, left: '18%', right: '18%', height: 1, background: 'rgba(184,134,11,0.18)' }} />
            {[
              { n: '01', h: 'Formu Doldurun', p: '\u015eikayetlerinizi, nab\u0131z ve dil bulgular\u0131n\u0131z\u0131, ya\u015fam al\u0131\u015fkanl\u0131klar\u0131n\u0131z\u0131 payla\u015f\u0131n.' },
              { n: '02', h: 'Klasik Analiz', p: '38 klasik eserden ilgili b\u00f6l\u00fcmler derlenir, mizac\u0131n\u0131za \u00f6zel protokol haz\u0131rlan\u0131r.' },
              { n: '03', h: 'Dan\u0131\u015fman\u0131n\u0131z Ula\u015f\u0131r', p: '24-48 saat i\u00e7inde uzman dan\u0131\u015fman\u0131n\u0131z WhatsApp ile protokol\u00fcn\u00fczü iletir.' },
            ].map(({ n, h, p }) => (
              <div key={n} style={{ textAlign: 'center' as const }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(184,134,11,0.08)', border: '1.5px solid rgba(184,134,11,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontFamily: 'Cinzel,serif', fontSize: 18, fontWeight: 600, color: '#B8860B', position: 'relative' as const, zIndex: 1 }}>{n}</div>
                <div style={{ fontFamily: 'Cinzel,serif', fontSize: 13, fontWeight: 600, color: '#F5EDE0', marginBottom: 10 }}>{h}</div>
                <p style={{ fontSize: 15, color: 'rgba(245,237,224,0.45)', lineHeight: 1.75 }}>{p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HIKAYE */}
      <section style={{ background: '#1C3A26' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '80px clamp(24px,5vw,48px)' }}>
          <div style={{ fontFamily: 'Cinzel,serif', fontSize: 10, color: 'rgba(184,134,11,0.55)', letterSpacing: 4, marginBottom: 28, display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ width: 32, height: 1, background: 'rgba(184,134,11,0.25)', display: 'block' }} />
            {"NEDEN \u0130PEK YOLU \u015e\u0130FACISI"}
            <span style={{ flex: 1, height: 1, background: 'rgba(184,134,11,0.1)', display: 'block' }} />
          </div>
          <h2 style={{ fontFamily: 'Cinzel,serif', fontSize: 'clamp(22px,3vw,32px)', fontWeight: 500, color: '#F5EDE0', lineHeight: 1.2, marginBottom: 40 }}>
            {"On y\u0131l boyunca "}<span style={{ color: '#B8860B' }}>{"unutulan bir hazineyi"}</span>{" arayan\u0131n hik\u00e2yesi."}<br />{"Ve o hazinenin size sunulmas\u0131."}
          </h2>
          <div style={{ width: 48, height: 2, background: '#B8860B', marginBottom: 40, opacity: 0.5 }} />
          <p style={{ fontSize: 18, color: 'rgba(245,237,224,0.68)', lineHeight: 1.95, marginBottom: 22 }}>{"2017 y\u0131l\u0131nda influenza ge\u00e7irdim. Haftalarca ila\u00e7 kulland\u0131m, iyile\u015femedim. Klasik \u0130slam metinlerinde semptomlar\u0131m\u0131 arad\u0131m. Influenza'n\u0131n \"balgam\u00ee h\u0131lt\u0131n galebe \u00e7almas\u0131\" olarak tan\u0131mland\u0131\u011f\u0131n\u0131 g\u00f6rd\u00fcm. Klasik form\u00fclasyonu haz\u0131rlad\u0131m. On g\u00fcnde tamamen iyile\u015ftim."}</p>
          <div style={{ borderLeft: '2px solid rgba(184,134,11,0.35)', padding: '18px 26px', margin: '32px 0', background: 'rgba(184,134,11,0.04)', borderRadius: '0 8px 8px 0' }}>
            <p style={{ fontSize: 17, color: 'rgba(245,237,224,0.82)', lineHeight: 1.9, fontStyle: 'italic' }}>{"Modern t\u0131bb\u0131n ke\u015ffetti\u011fi pek \u00e7ok \u015fey, "}<strong style={{ color: '#F5EDE0', fontWeight: 500 }}>{"bin y\u0131l \u00f6nce zaten biliniyordu."}</strong></p>
          </div>
          {/* BİR KEŞİF DAHA */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '40px 0 32px' }}>
            <span style={{ flex: 1, height: 1, background: 'rgba(184,134,11,0.1)', display: 'block' }} />
            <span style={{ fontFamily: 'Cinzel,serif', fontSize: 9, color: 'rgba(184,134,11,0.35)', letterSpacing: 3, whiteSpace: 'nowrap' as const }}>{"B\u0130R KE\u015eF\u0130T DAHA"}</span>
            <span style={{ flex: 1, height: 1, background: 'rgba(184,134,11,0.1)', display: 'block' }} />
          </div>
          <p style={{ fontSize: 18, color: 'rgba(245,237,224,0.68)', lineHeight: 1.95, marginBottom: 22, fontFamily: 'EB Garamond,serif' }}>
            {"Sonra kanseri ara\u015ft\u0131rd\u0131m. Klasik metinlerde kanser i\u00e7in "}<span style={{ fontFamily: 'serif', fontSize: '1.1em', color: '#B8860B', direction: 'rtl' as const, display: 'inline' }}>{"\u0633\u0631\u0637\u0627\u0646"}</span>{" yani "}<strong style={{ color: '#F5EDE0', fontWeight: 500 }}>{"seretan"}</strong>{" kelimesi kullan\u0131l\u0131yor. Bu kelimenin k\u00f6k\u00fc yenge\u00e7 demek. Rastlant\u0131 de\u011fil: klasik hekimler tedavide kulland\u0131klar\u0131 ana maddeyi de yenge\u00e7ten elde ediyorlard\u0131. \u0130sim, tedavinin ta kendisinden geliyordu."}
          </p>
          <p style={{ fontSize: 18, color: 'rgba(245,237,224,0.68)', lineHeight: 1.95, marginBottom: 22, fontFamily: 'EB Garamond,serif' }}>
            {"\u0130bn S\u00een\u00e2'n\u0131n cerrahi \u00f6nerileri "}<strong style={{ color: '#F5EDE0', fontWeight: 500 }}>{"modern onkolojik cerrahinin temel ilkelerini sekiz y\u00fcz y\u0131l \u00f6nceden \u00f6ng\u00f6r\u00fcyor."}</strong>
          </p>
          <div style={{ borderLeft: '2px solid rgba(184,134,11,0.35)', padding: '18px 26px', margin: '32px 0', background: 'rgba(184,134,11,0.04)', borderRadius: '0 8px 8px 0' }}>
            <p style={{ fontSize: 17, color: 'rgba(245,237,224,0.82)', lineHeight: 1.9, fontStyle: 'italic', fontFamily: 'EB Garamond,serif' }}>
              {"Klasik \u0130slam hekimleri bu ismi yaln\u0131zca metafor olarak kullanmam\u0131\u015f, "}<strong style={{ color: '#F5EDE0', fontWeight: 500 }}>{"tedavinin \u00f6z\u00fcn\u00fc o ismin i\u00e7ine i\u015flemi\u015fler."}</strong>
            </p>
          </div>

          {/* BURADAN ORAYA */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '40px 0 32px' }}>
            <span style={{ flex: 1, height: 1, background: 'rgba(184,134,11,0.1)', display: 'block' }} />
            <span style={{ fontFamily: 'Cinzel,serif', fontSize: 9, color: 'rgba(184,134,11,0.35)', letterSpacing: 3, whiteSpace: 'nowrap' as const }}>{"BURADAN ORAYA"}</span>
            <span style={{ flex: 1, height: 1, background: 'rgba(184,134,11,0.1)', display: 'block' }} />
          </div>
          <p style={{ fontSize: 18, color: 'rgba(245,237,224,0.68)', lineHeight: 1.95, marginBottom: 22, fontFamily: 'EB Garamond,serif' }}>
            {"Bu hakikati insanlara ula\u015ft\u0131rmak istedim. "}<strong style={{ color: '#F5EDE0', fontWeight: 500 }}>{"Bu yol on y\u0131l boyunca b\u00fcy\u00fck \u00f6l\u00e7\u00fcde yaln\u0131z y\u00fcr\u00fcnen, zaman zaman motor \u00fczerinde, zaman zaman in\u015faatta, zaman zaman garsonluk yaparken d\u00fc\u015f\u00fcn\u00fclen bir yoldu. Kolay olmad\u0131. Ama hi\u00e7bir \u015fey durduramad\u0131."}</strong>
          </p>
          <p style={{ fontSize: 18, color: 'rgba(245,237,224,0.68)', lineHeight: 1.95, marginBottom: 22, fontFamily: 'EB Garamond,serif' }}>
            {"Yaz\u0131l\u0131m bilmiyordum. Para yoktu. Ama elimdeki kaynaklar, on y\u0131ll\u0131k birikim ve yapay zeka ile d\u00fcnyada bir ilk oldu\u011funa inand\u0131\u011f\u0131m bu sistemi in\u015fa ettim."}
          </p>
          <div style={{ borderLeft: '2px solid rgba(184,134,11,0.35)', padding: '18px 26px', margin: '32px 0', background: 'rgba(184,134,11,0.04)', borderRadius: '0 8px 8px 0' }}>
            <p style={{ fontSize: 17, color: 'rgba(245,237,224,0.82)', lineHeight: 1.9, fontStyle: 'italic', fontFamily: 'EB Garamond,serif' }}>
              {"Bu sistemi kulland\u0131\u011f\u0131n\u0131zda yaln\u0131zca kendi sa\u011fl\u0131\u011f\u0131n\u0131za yat\u0131r\u0131m yapm\u0131yorsunuz. "}<strong style={{ color: '#F5EDE0', fontWeight: 500 }}>{"Ben sadece unutulan\u0131 hat\u0131rlat\u0131yorum."}</strong>
            </p>
          </div>
          <p style={{ fontSize: 15, color: 'rgba(245,237,224,0.35)', fontStyle: 'italic', marginTop: 28, lineHeight: 1.8, fontFamily: 'EB Garamond,serif' }}>
            {"\u0130lim ikidir: biri beden ilmi, di\u011feri inan\u00e7 ilmi. Her ikisi do\u011fru birle\u015fti\u011finde buna sa\u011fl\u0131kl\u0131 bir ya\u015fam deriz."}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 48, paddingTop: 32, borderTop: '1px solid rgba(184,134,11,0.12)' }}>
            <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'rgba(184,134,11,0.1)', border: '1px solid rgba(184,134,11,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Cinzel,serif', fontSize: 15, fontWeight: 600, color: '#B8860B', flexShrink: 0 }}>{"MF"}</div>
            <div>
              <div style={{ fontFamily: 'Cinzel,serif', fontSize: 12, fontWeight: 600, color: '#F5EDE0', letterSpacing: 1, marginBottom: 3 }}>{"M. FAT\u0130H \u00c7AKIR"}</div>
              <div style={{ fontSize: 13, color: 'rgba(245,237,224,0.4)', fontStyle: 'italic' }}>{"Klasik \u0130slam T\u0131bb\u0131 Ara\u015ft\u0131rmac\u0131s\u0131 \u00b7 FSM Fuat Sezgin Enstit\u00fcs\u00fc Doktora Aday\u0131"}</div>
            </div>
          </div>
        </div>
      </section>

      {/* DANISMAN */}
      <section style={{ background: '#FAF6EF', padding: '88px clamp(24px,5vw,80px)' }}>
        <div style={{ textAlign: 'center' as const, marginBottom: 48 }}>
          <div style={{ fontFamily: 'Cinzel,serif', fontSize: 10, color: '#B8860B', letterSpacing: 3, marginBottom: 14 }}>{"DANI\u015eMAN"}</div>
          <h2 style={{ fontFamily: 'Cinzel,serif', fontSize: 'clamp(28px,4vw,38px)', fontWeight: 600, color: '#1A1208' }}>{"M. Fatih \u00c7ak\u0131r"}</h2>
        </div>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div>
            <div style={{ fontFamily: 'Cinzel,serif', fontSize: 10, color: '#B8860B', letterSpacing: 3, marginBottom: 14 }}>{"KLAS\u0130K \u0130SLAM TIBBI ARA\u015eTIRMACISI"}</div>
            <h3 style={{ fontFamily: 'Cinzel,serif', fontSize: 22, fontWeight: 600, color: '#1A1208', marginBottom: 6 }}>{"T\u0131p Tarihi Y\u00fcksek Lisans"}</h3>
            <div style={{ fontSize: 16, color: '#9B8060', fontStyle: 'italic', marginBottom: 24 }}>{"FSM Vak\u0131f \u00dcniversitesi Fuat Sezgin \u0130slam Bilim Tarihi Enstit\u00fcs\u00fc Doktora Aday\u0131"}</div>
            <p style={{ fontSize: 17, color: '#5C4A2A', lineHeight: 1.85, marginBottom: 24 }}>{"Hekim Ahmet el-Hay\u00e2t\u00ee'nin \u015eeceret\u00fc't-T\u0131b adl\u0131 eserini ilk kez akademik d\u00fczeyde inceleyen ara\u015ft\u0131rmac\u0131. \u0130bn S\u00een\u00e2 el-K\u00e2n\u00fbn ve Tahb\u00eez\u00fc'l-Math\u00fbn \u00e7evirileri \u00fczerine \u00e7al\u0131\u015fmalar y\u00fcr\u00fctmektedir."}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }} className="akademik-grid">
              {[{ l: 'DOKTORA', v: 'FSM Fuat Sezgin Enstit\u00fcs\u00fc' }, { l: 'Y\u00dcKSEK L\u0130SANS', v: 'T\u0131p Tarihi, Kocaeli \u00dcniversitesi' }, { l: 'YAYINLAR', v: '8 Kitap, 7 \u00c7eviri' }, { l: 'UZMANLIK', v: 'Klasik \u0130slam ve Osmanl\u0131 T\u0131bb\u0131' }].map(({ l, v }) => (
                <div key={l} style={{ background: 'white', border: '1px solid #DEB887', borderRadius: 10, padding: '14px 16px' }}>
                  <div style={{ fontFamily: 'Cinzel,serif', fontSize: 8, color: '#9B8060', letterSpacing: 2, marginBottom: 5 }}>{l}</div>
                  <div style={{ fontSize: 15, color: '#1A1208' }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <a href="https://wa.me/905331687226" style={{ fontFamily: 'Cinzel,serif', fontSize: 10, fontWeight: 700, color: 'white', background: '#25D366', padding: '12px 24px', borderRadius: 9, letterSpacing: 1, textDecoration: 'none' }}>{"WhatsApp"}</a>
              <a href="/hakkimizda" style={{ fontFamily: 'Cinzel,serif', fontSize: 10, color: '#1C3A26', background: 'transparent', padding: '11px 20px', borderRadius: 9, border: '1.5px solid #1C3A26', letterSpacing: 1, textDecoration: 'none' }}>{"Hakk\u0131m\u0131zda"}</a>
            </div>
          </div>
        </div>
      </section>

      {/* YORUMLAR */}
      {yorumlar.length > 0 && (
        <section style={{ background: '#F5EFE0', padding: '88px clamp(24px,5vw,80px)', borderTop: '1px solid #DEB887' }}>
          <div style={{ textAlign: 'center' as const, marginBottom: 56 }}>
            <div style={{ fontFamily: 'Cinzel,serif', fontSize: 10, color: '#B8860B', letterSpacing: 3, marginBottom: 14 }}>{"DENEY\u0130MLER"}</div>
            <h2 style={{ fontFamily: 'Cinzel,serif', fontSize: 'clamp(28px,4vw,38px)', fontWeight: 600, color: '#1A1208' }}>{"\u0130lk Analizden Sonra"}</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, maxWidth: 1100, margin: '0 auto' }} className="yorumlar-grid">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {yorumlar.slice(0, 3).map((y: any) => (
              <div key={y.id} style={{ background: 'white', border: '1px solid #DEB887', borderRadius: 16, padding: '28px 24px' }}>
                <div style={{ color: '#B8860B', fontSize: 16, marginBottom: 14, letterSpacing: 2 }}>{"\u2605\u2605\u2605\u2605\u2605"}</div>
                <p style={{ fontSize: 17, color: '#5C4A2A', fontStyle: 'italic', lineHeight: 1.8, marginBottom: 18 }}>&quot;{y.yorum}&quot;</p>
                <div style={{ fontFamily: 'Cinzel,serif', fontSize: 12, fontWeight: 600, color: '#1A1208' }}>{y.ad_soyad}</div>
                {y.sehir && <div style={{ fontSize: 13, color: '#9B8060', fontStyle: 'italic' }}>{y.sehir}</div>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* PRICING */}
      <section id="fiyatlandirma" style={{ background: '#FAF6EF', padding: '88px clamp(24px,5vw,80px)', borderTop: '1px solid #DEB887' }}>
        <div style={{ textAlign: 'center' as const, marginBottom: 56 }}>
          <div style={{ fontFamily: 'Cinzel,serif', fontSize: 10, color: '#B8860B', letterSpacing: 3, marginBottom: 14 }}>{"\u00dcYEL\u0130K"}</div>
          <h2 style={{ fontFamily: 'Cinzel,serif', fontSize: 'clamp(28px,4vw,38px)', fontWeight: 600, color: '#1A1208', marginBottom: 12 }}>{"Size Uygun Plan\u0131 Se\u00e7in"}</h2>
          <p style={{ fontSize: 18, color: '#5C4A2A', fontStyle: 'italic' }}>{"\u0130lk analizden sonra fark ya\u015fars\u0131n\u0131z. Y\u0131ll\u0131k planda ayl\u0131k 590\u20ba ile s\u0131n\u0131rs\u0131z takip."}</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, maxWidth: 920, margin: '0 auto' }} className="pricing-grid">
          {[
            { plan: 'AYLIK', n: '890\u20ba', per: '/ay', day: 'g\u00fcnde 29\u20ba', features: ['S\u0131n\u0131rs\u0131z analiz', 'WhatsApp dan\u0131\u015fmanl\u0131k', 'Bitki protokol\u00fc', 'PDF re\u00e7ete'], hot: false, badge: '' },
            { plan: 'YILLIK', n: '590\u20ba', per: '/ay', day: '%34 indirim \u00b7 g\u00fcnde 19\u20ba', features: ['S\u0131n\u0131rs\u0131z analiz', 'WhatsApp dan\u0131\u015fmanl\u0131k', 'Bitki protokol\u00fc', '\u00d6ncelikli destek'], hot: true, badge: 'EN AVANTAJLI' },
            { plan: 'TEK SEFER', n: '1.290\u20ba', per: 'tek \u00f6deme', day: '1 analiz + sonu\u00e7', features: ['Tek analiz hakk\u0131', 'WhatsApp protokol', 'Bitki protokol\u00fc', 'PDF rapor'], hot: false, badge: '' },
          ].map(({ plan, n, per, day, features, hot, badge }) => (
            <div key={plan} style={{ background: hot ? '#1C3A26' : 'white', border: `1px solid ${hot ? '#1C3A26' : '#DEB887'}`, borderRadius: 18, padding: '36px 28px', textAlign: 'center' as const }}>
              {badge && <div style={{ fontFamily: 'Cinzel,serif', fontSize: 8, background: '#B8860B', color: '#1C3A26', padding: '4px 14px', borderRadius: 20, letterSpacing: 1.5, display: 'inline-block', marginBottom: 16, fontWeight: 700 }}>{badge}</div>}
              <div style={{ fontFamily: 'Cinzel,serif', fontSize: 10, color: hot ? 'rgba(245,237,224,0.4)' : '#9B8060', letterSpacing: 2.5, marginBottom: 12 }}>{plan}</div>
              <div style={{ fontFamily: 'Cinzel,serif', fontSize: 44, fontWeight: 700, color: hot ? '#F5EDE0' : '#1C3A26', lineHeight: 1 }}>{n}</div>
              <div style={{ fontSize: 14, color: hot ? 'rgba(245,237,224,0.4)' : '#9B8060' }}>{per}</div>
              <div style={{ fontFamily: 'Cinzel,serif', fontSize: 11, color: hot ? '#B8860B' : '#9B8060', letterSpacing: 1, margin: '4px 0 22px' }}>{day}</div>
              <div style={{ height: 1, background: hot ? 'rgba(245,237,224,0.1)' : '#DEB887', margin: '18px 0' }} />
              {features.map((f: string) => (
                <div key={f} style={{ fontSize: 14, color: hot ? 'rgba(245,237,224,0.6)' : '#5C4A2A', padding: '5px 0', borderBottom: `1px solid ${hot ? 'rgba(245,237,224,0.07)' : '#F5EFE0'}` }}>{f}</div>
              ))}
              <button onClick={() => router.push('/kayit')} style={{ width: '100%', marginTop: 22, padding: 14, fontFamily: 'Cinzel,serif', fontSize: 10, fontWeight: 700, letterSpacing: 2, borderRadius: 10, border: 'none', cursor: 'pointer', background: hot ? '#B8860B' : '#1C3A26', color: hot ? '#1C3A26' : '#F5EDE0' }}>{"BA\u015eLA"}</button>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center' as const, marginTop: 32, paddingTop: 24, borderTop: '1px solid #DEB887' }}>
          <a href="/yorum-yaz" style={{ fontFamily: 'Cinzel,serif', fontSize: 10, color: '#9B8060', letterSpacing: 2, textDecoration: 'none' }}>{"Deneyiminizi payla\u015fmak ister misiniz? \u2192"}</a>
        </div>
      </section>

      {/* RESPONSIVE */}
      <style jsx global>{`
        @media (max-width: 960px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .hero-panel { display: none !important; }
          .features-grid { grid-template-columns: 1fr 1fr !important; }
          .stats-grid { grid-template-columns: 1fr 1fr !important; }
          .steps-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
          .danisman-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
          .pricing-grid { grid-template-columns: 1fr !important; }
          .yorumlar-grid { grid-template-columns: 1fr !important; }
          .akademik-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 600px) {
          .features-grid { grid-template-columns: 1fr !important; }
          .stats-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </main>
  )
}
