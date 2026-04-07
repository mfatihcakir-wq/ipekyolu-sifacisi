'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase'
import MakalelerSection from '@/components/MakalelerSection'
import Header from './components/Header'

function useCountUp(target: number, duration: number = 1800, active: boolean = false) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!active) return
    let start = 0
    const increment = target / (duration / 16)
    const timer = setInterval(() => {
      start += increment
      if (start >= target) { setCount(target); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [active, target, duration])
  return count
}

function FeatCard({ icon, title, desc, link, hot }: { icon: React.ReactNode; title: string; desc: string; link: string; hot?: boolean }) {
  return (
    <div style={{ background: hot ? '#FFFDF7' : 'white', border: `${hot ? 1.5 : 1}px solid ${hot ? '#B8860B' : '#DEB887'}`, borderRadius: 16, padding: '32px 28px', position: 'relative' as const, overflow: 'hidden' }}>
      <div style={{ height: 3, background: hot ? '#B8860B' : '#1C3A26', borderRadius: '16px 16px 0 0', position: 'absolute' as const, top: 0, left: 0, right: 0 }} />
      <div style={{ width: 44, height: 44, background: hot ? 'rgba(184,134,11,0.1)' : '#F5EFE0', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>{icon}</div>
      <div style={{ fontFamily: 'Cinzel,serif', fontSize: 15, fontWeight: 600, color: '#1A1208', marginBottom: 10 }}>{title}</div>
      <p style={{ fontSize: 16, color: '#5C4A2A', lineHeight: 1.75 }}>{desc}</p>
      <a href={link} style={{ fontFamily: 'Cinzel,serif', fontSize: 9, color: '#B8860B', letterSpacing: 1.5, marginTop: 18, display: 'block', textDecoration: 'none' }}>{"DETAYLI İNCELE \u2192"}</a>
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function LandingClient() {
  const router = useRouter()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [yorumlar, setYorumlar] = useState<any[]>([])
  const kayitSayisi = '46.000+'

  // Stats count-up
  const [statsVisible, setStatsVisible] = useState(false)
  const statsRef = useRef<HTMLDivElement>(null)
  const count38 = useCountUp(38, 1200, statsVisible)
  const count46 = useCountUp(46000, 2000, statsVisible)
  const count1180 = useCountUp(1180, 1600, statsVisible)
  const count9 = useCountUp(9, 800, statsVisible)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStatsVisible(true); observer.disconnect() } },
      { threshold: 0.3 }
    )
    if (statsRef.current) observer.observe(statsRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const supabase = createClient()
    supabase.from('yorumlar').select('*').eq('onaylandi', true).order('onay_tarihi', { ascending: false }).limit(6).then(({ data }) => { if (data && data.length > 0) setYorumlar(data) })
  }, [])

  const iconStyle = { width: 22, height: 22, stroke: '#1C3A26', fill: 'none', strokeWidth: 1.5 } as const

  return (
    <main>
      <Header />

      {/* HERO */}
      <section style={{ background: '#1C3A26', padding: 'clamp(48px,7vw,88px) clamp(24px,5vw,64px) 0', display: 'grid', gridTemplateColumns: '1fr 220px 300px', gap: 40, alignItems: 'center', position: 'relative' as const, overflow: 'hidden' }} className="hero-grid">
        {/* Arka plan soluk logo */}
        <div style={{ position: 'absolute' as const, top: '50%', left: '50%', transform: 'translate(-50%,-50%)', opacity: 0.04, pointerEvents: 'none', animation: 'bgLogoPulse 6s ease-in-out infinite' }}>
          <svg width={500} height={500} viewBox="0 0 64 64" fill="none">
            <ellipse cx="32" cy="37" rx="12" ry="10" fill="none" stroke="#B8860B" strokeWidth="0.5" />
            <path d="M22 37 Q22 25 32 23 Q42 25 42 37" fill="none" stroke="#B8860B" strokeWidth="0.5" />
            <path d="M32 15 Q36 11 40 13 Q38 18 32 20 Q26 18 24 13 Q28 11 32 15Z" fill="#B8860B" />
          </svg>
        </div>

        {/* SOL: metin + butonlar */}
        <div style={{ position: 'relative' as const, zIndex: 1 }}>
          <div style={{ fontFamily: 'Cinzel,serif', fontSize: 10, color: 'rgba(184,134,11,0.5)', letterSpacing: 4, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ width: 24, height: 1, background: 'rgba(184,134,11,0.3)', display: 'block' }} />
            {"KLASİK İSLAM VE OSMANLI TIBBI"}
          </div>

          <h1 style={{ fontFamily: 'Cinzel,serif', fontSize: 'clamp(32px,4.5vw,50px)', fontWeight: 600, color: '#F5EDE0', lineHeight: 1.08, marginBottom: 14 }}>
            {"Bedeninizin "}
            <span style={{ color: '#B8860B', display: 'block' }}>{"Dilini Anlıyoruz."}</span>
          </h1>

          <p style={{ fontSize: 18, color: 'rgba(245,237,224,0.55)', fontStyle: 'italic', lineHeight: 1.85, marginBottom: 32, maxWidth: 440 }}>
            {"Nabızınızdan mizacınıza, dilinizden hılt dengenize; bin yıllık birikimle hazırlanmış, size özel danışmanlık."}
          </p>

          {/* Ana CTA */}
          <button onClick={() => router.push('/analiz')} style={{ fontFamily: 'Cinzel,serif', fontSize: 11, fontWeight: 700, color: '#1C3A26', background: '#B8860B', padding: '16px 36px', borderRadius: 11, letterSpacing: 2, border: 'none', cursor: 'pointer', marginBottom: 20, display: 'block' }}>{"ANALİZİMİ BAŞLAT"}</button>

          {/* Sekme butonları */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const, marginBottom: 32 }}>
            {[
              { label: 'Bitki Atlası', href: '/bitkiler' },
              { label: 'Kalp Şehri', href: '/karakter' },
              { label: 'Cilt Bakımı', href: '/hasta/cilt' },
              { label: 'Hakkımızda', href: '/hakkimizda' },
            ].map(t => (
              <button key={t.label} onClick={() => router.push(t.href)} style={{ background: 'transparent', border: '1.5px solid rgba(245,237,224,0.15)', borderRadius: 9, padding: '12px 20px', fontFamily: 'Cinzel,serif', fontSize: 10, color: 'rgba(245,237,224,0.55)', letterSpacing: 1.5, cursor: 'pointer' }}>
                {t.label}
              </button>
            ))}
          </div>

          <div style={{ fontFamily: 'Cinzel,serif', fontSize: 9, color: 'rgba(184,134,11,0.3)', letterSpacing: 2.5, paddingBottom: 48 }}>{"38 KLASİK ESER · "}{kayitSayisi}{" METİN KAYDI · 1.180 BİTKİ"}</div>
        </div>

        {/* ORTA: Büyük hareketli logo */}
        <div className="hero-logo-col" style={{ display: 'flex', justifyContent: 'center', position: 'relative' as const, zIndex: 1 }}>
          <div className="hero-logo-anim">
            <svg width={200} height={200} viewBox="0 0 64 64" fill="none">
              <ellipse cx="32" cy="37" rx="12" ry="10" fill="none" stroke="#B8860B" strokeWidth="1.5" className="logo-body" />
              <path d="M22 37 Q22 25 32 23 Q42 25 42 37" fill="none" stroke="#B8860B" strokeWidth="1.5" className="logo-body" />
              <rect x="29" y="21" width="6" height="3.5" rx="1" fill="none" stroke="#B8860B" strokeWidth="1.5" className="logo-body" />
              <path d="M32 15 Q36 11 40 13 Q38 18 32 20 Q26 18 24 13 Q28 11 32 15Z" fill="#B8860B" className="logo-horn" />
              <path d="M32 38 Q28.5 42 32 45.5 Q35.5 42 32 38Z" fill="#B8860B" opacity={0.55} className="logo-drop" />
              <circle cx="33" cy="31" r="2.5" fill="#EF5350" className="orbit-dem" />
              <circle cx="28" cy="33.5" r="1.8" fill="#FF7043" className="orbit-saf" />
              <circle cx="37" cy="33.5" r="1.8" fill="#42A5F5" className="orbit-bal" />
              <circle cx="33" cy="37" r="1.5" fill="#AB47BC" className="orbit-sev" />
            </svg>
          </div>
        </div>

        {/* SAĞ: Danışman kartı */}
        <div className="hero-dan-col" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(184,134,11,0.1)', borderRadius: 20, padding: 24, position: 'relative' as const, zIndex: 1 }}>
          <div style={{ fontFamily: 'Cinzel,serif', fontSize: 8, color: 'rgba(184,134,11,0.45)', letterSpacing: 2, marginBottom: 14 }}>{"DANIŞMAN"}</div>
          <div style={{ width: 56, height: 56, borderRadius: '50%', overflow: 'hidden', border: '1.5px solid rgba(184,134,11,0.18)', marginBottom: 12, background: 'rgba(184,134,11,0.1)' }}>
            <Image src="/danisan.jpg" alt="M. Fatih Çakır" width={56} height={56} style={{ objectFit: 'cover', width: 56, height: 56, borderRadius: '50%' }} />
          </div>
          <div style={{ fontFamily: 'Cinzel,serif', fontSize: 13, fontWeight: 600, color: '#F5EDE0', marginBottom: 3 }}>{"M. Fatih Çakır"}</div>
          <div style={{ fontSize: 12, color: 'rgba(245,237,224,0.38)', fontStyle: 'italic', marginBottom: 14, lineHeight: 1.4 }}>{"Klasik İslam Tıbbı Araştırmacısı"}</div>
          <div style={{ height: 1, background: 'rgba(184,134,11,0.08)', marginBottom: 12 }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {[{ n: '38', l: 'ESER' }, { n: '46K+', l: 'KAYIT' }, { n: '8', l: 'KİTAP' }, { n: '10+', l: 'YIL' }].map(({ n, l }) => (
              <div key={l} style={{ textAlign: 'center' as const, padding: 8, background: 'rgba(184,134,11,0.05)', borderRadius: 6, border: '1px solid rgba(184,134,11,0.07)' }}>
                <div style={{ fontFamily: 'Cinzel,serif', fontSize: 16, fontWeight: 600, color: '#B8860B', lineHeight: 1 }}>{n}</div>
                <div style={{ fontFamily: 'Cinzel,serif', fontSize: 6, color: 'rgba(245,237,224,0.25)', letterSpacing: 1.5, marginTop: 2 }}>{l}</div>
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
      <section ref={statsRef} style={{ background: '#F5EFE0', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', borderBottom: '1px solid #DEB887' }} className="stats-grid">
        {[
          { n: statsVisible ? count38 : 0, l: 'KLASİK ESER', s: 'el-Hâvî, el-Kânûn, el-Şâmil' },
          { n: statsVisible ? (count46 >= 46000 ? '46.000+' : count46.toLocaleString('tr-TR')) : '0', l: 'METİN KAYDI', s: 'İndekslenmiş parça' },
          { n: statsVisible ? (count1180 >= 1180 ? '1.180' : count1180.toLocaleString('tr-TR')) : '0', l: 'BİTKİ & MADDE', s: 'İbn Beytâr kaynağı' },
          { n: statsVisible ? count9 : 0, l: 'NABIZ SIFATI', s: 'İbn Sînâ metodolojisi' },
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
            <div style={{ fontFamily: 'Cinzel,serif', fontSize: 10, color: 'rgba(184,134,11,0.5)', letterSpacing: 3, marginBottom: 14 }}>{"SÜREÇ"}</div>
            <h2 style={{ fontFamily: 'Cinzel,serif', fontSize: 'clamp(28px,4vw,38px)', fontWeight: 600, color: '#F5EDE0', lineHeight: 1.15, marginBottom: 12 }}>{"Nasıl Çalışır?"}</h2>
            <p style={{ fontSize: 18, color: 'rgba(245,237,224,0.4)', fontStyle: 'italic', lineHeight: 1.75, maxWidth: 480, margin: '0 auto' }}>{"Üç adımda kişisel sağlık protokolünüze kavuşun."}</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 40, position: 'relative' as const }} className="steps-grid">
            <div style={{ position: 'absolute' as const, top: 28, left: '18%', right: '18%', height: 1, background: 'rgba(184,134,11,0.18)' }} />
            {[
              { n: '01', h: 'Formu Doldurun', p: 'Şikayetlerinizi, nabız ve dil bulgularınızı, yaşam alışkanlıklarınızı paylaşın.' },
              { n: '02', h: 'Klasik Analiz', p: '38 klasik eserden ilgili bölümler derlenir, mizacınıza özel protokol hazırlanır.' },
              { n: '03', h: 'Danışmanınız Ulaşır', p: '24-48 saat içinde uzman danışmanınız WhatsApp ile protokolünüzü iletir.' },
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
            {"NEDEN İPEK YOLU ŞİFACISI"}
            <span style={{ flex: 1, height: 1, background: 'rgba(184,134,11,0.1)', display: 'block' }} />
          </div>
          <h2 style={{ fontFamily: 'Cinzel,serif', fontSize: 'clamp(22px,3vw,32px)', fontWeight: 500, color: '#F5EDE0', lineHeight: 1.2, marginBottom: 40 }}>
            {"İbn Sînâ 1.037\u2019de öldü."}<br />
            <span style={{ color: '#B8860B' }}>{"Ama el-Kânûn hâlâ işliyor."}</span>
          </h2>
          <div style={{ width: 48, height: 2, background: '#B8860B', marginBottom: 40, opacity: 0.5 }} />
          <p style={{ fontSize: 18, color: 'rgba(245,237,224,0.68)', lineHeight: 1.95, marginBottom: 22, fontFamily: 'EB Garamond,serif' }}>
            {"Klasik İslam tıbbı semptomlarla değil, mizaçla başlar. Hastayı değil, insanı tanır. İbn Sînâ nabzı dokuz sıfatla ölçtüğünde modern kardiyolojinin henüz adı yoktu. Er-Râzî klinik gözlem kayıtları tuttuğunda tıp tarihi henüz yazılmamıştı. Ez-Zehravî\u2019nin cerrahi aletlerinin çizimleri, beş yüz yıl boyunca Avrupa tıp okullarında ders kitabı olarak okutuldu."}
          </p>
          <p style={{ fontSize: 18, color: '#F5EDE0', lineHeight: 1.95, marginBottom: 22, fontFamily: 'EB Garamond,serif', fontWeight: 500 }}>
            {"Bu birikim kaybolmadı. Sadece okunmaz oldu."}
          </p>
          <div style={{ borderLeft: '2px solid rgba(184,134,11,0.35)', padding: '18px 26px', margin: '32px 0', background: 'rgba(184,134,11,0.04)', borderRadius: '0 8px 8px 0' }}>
            <p style={{ fontSize: 17, color: 'rgba(245,237,224,0.82)', lineHeight: 1.9, fontStyle: 'italic', fontFamily: 'EB Garamond,serif' }}>
              {"On dördüncü yüzyılda İbn Nefîs küçük kan dolaşımını tanımladığında, William Harvey aynı keşfi üç yüz yıl sonra yapacaktı. Tahbîzü\u2019l-Mathûn\u2019da tarif edilen beyin yorgunluğu protokolü, modern tıbbın \u201Cbrain fog\u201D dediği tablonun neredeyse tam karşılığıdır. "}
              <strong style={{ color: '#F5EDE0', fontWeight: 500 }}>{"Bu tesadüf değil; gözlem birikiminin kaçınılmaz sonucudur."}</strong>
            </p>
          </div>

          {/* BİR KEŞİF DAHA */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '40px 0 32px' }}>
            <span style={{ flex: 1, height: 1, background: 'rgba(184,134,11,0.1)', display: 'block' }} />
            <span style={{ fontFamily: 'Cinzel,serif', fontSize: 9, color: 'rgba(184,134,11,0.35)', letterSpacing: 3, whiteSpace: 'nowrap' as const }}>{"BİR KEŞİF DAHA"}</span>
            <span style={{ flex: 1, height: 1, background: 'rgba(184,134,11,0.1)', display: 'block' }} />
          </div>
          <p style={{ fontSize: 18, color: 'rgba(245,237,224,0.68)', lineHeight: 1.95, marginBottom: 22, fontFamily: 'EB Garamond,serif' }}>
            {"Klasik metinlerde kanser için "}<span style={{ fontFamily: 'serif', fontSize: '1.1em', color: '#B8860B', direction: 'rtl' as const, display: 'inline' }}>{"\u0633\u0631\u0637\u0627\u0646"}</span>{" yani "}<strong style={{ color: '#F5EDE0', fontWeight: 500 }}>{"seretan"}</strong>{" kelimesi kullanılıyor. Bu kelimenin kökü yengeç demek. Rastlantı değil: klasik hekimler tedavide kullandıkları ana maddeyi de yengeçten elde ediyorlardı. İsim, tedavinin ta kendisinden geliyordu."}
          </p>
          <p style={{ fontSize: 18, color: 'rgba(245,237,224,0.68)', lineHeight: 1.95, marginBottom: 22, fontFamily: 'EB Garamond,serif' }}>
            {"İbn Sînâ\u2019nın cerrahi önerileri "}<strong style={{ color: '#F5EDE0', fontWeight: 500 }}>{"modern onkolojik cerrahinin temel ilkelerini sekiz yüz yıl önceden öngörüyor."}</strong>
          </p>

          {/* BURADAN ORAYA */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '40px 0 32px' }}>
            <span style={{ flex: 1, height: 1, background: 'rgba(184,134,11,0.1)', display: 'block' }} />
            <span style={{ fontFamily: 'Cinzel,serif', fontSize: 9, color: 'rgba(184,134,11,0.35)', letterSpacing: 3, whiteSpace: 'nowrap' as const }}>{"BURADAN ORAYA"}</span>
            <span style={{ flex: 1, height: 1, background: 'rgba(184,134,11,0.1)', display: 'block' }} />
          </div>
          <p style={{ fontSize: 18, color: 'rgba(245,237,224,0.68)', lineHeight: 1.95, marginBottom: 22, fontFamily: 'EB Garamond,serif' }}>
            {"İpek Yolu Şifacısı bu birikimi dijital ortama taşıdı. Otuz sekiz klasik eser. Kırk altı bin indekslenmiş metin kaydı. Bin yüz seksen bitki ve tıbbi madde. Her analiz, şikâyetinizle örtüşen klasik metinleri bulur, mizacınızı tespit eder, kaynağını göstererek protokol üretir."}
          </p>
          <div style={{ borderLeft: '2px solid rgba(184,134,11,0.35)', padding: '18px 26px', margin: '32px 0', background: 'rgba(184,134,11,0.04)', borderRadius: '0 8px 8px 0' }}>
            <p style={{ fontSize: 17, color: 'rgba(245,237,224,0.82)', lineHeight: 1.9, fontStyle: 'italic', fontFamily: 'EB Garamond,serif' }}>
              <strong style={{ color: '#F5EDE0', fontWeight: 500 }}>{"Burada sunulan her bilgi bir kaynaktan gelir. Her kaynak bir hekimden. Her hekim ölçülebilir klinik gözlemden."}</strong>
            </p>
          </div>
          <p style={{ fontSize: 15, color: 'rgba(245,237,224,0.35)', fontStyle: 'italic', marginTop: 28, lineHeight: 1.8, fontFamily: 'EB Garamond,serif' }}>
            {"İlim ikidir: biri beden ilmi, diğeri inanç ilmi. Her ikisi doğru birleştiğinde buna sağlıklı bir yaşam deriz."}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 48, paddingTop: 32, borderTop: '1px solid rgba(184,134,11,0.12)' }}>
            <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'rgba(184,134,11,0.1)', border: '1px solid rgba(184,134,11,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Cinzel,serif', fontSize: 15, fontWeight: 600, color: '#B8860B', flexShrink: 0 }}>{"MF"}</div>
            <div>
              <div style={{ fontFamily: 'Cinzel,serif', fontSize: 12, fontWeight: 600, color: '#F5EDE0', letterSpacing: 1, marginBottom: 3 }}>{"M. FATİH ÇAKIR"}</div>
              <div style={{ fontSize: 13, color: 'rgba(245,237,224,0.4)', fontStyle: 'italic' }}>{"Klasik İslam Tıbbı Araştırmacısı · FSM Fuat Sezgin Enstitüsü Doktora Adayı"}</div>
            </div>
          </div>
        </div>
      </section>

      {/* DANISMAN */}
      <section style={{ background: '#FAF6EF', padding: '88px clamp(24px,5vw,80px)' }}>
        <div style={{ textAlign: 'center' as const, marginBottom: 48 }}>
          <div style={{ fontFamily: 'Cinzel,serif', fontSize: 10, color: '#B8860B', letterSpacing: 3, marginBottom: 14 }}>{"DANIŞMANINIZ"}</div>
        </div>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div>
            <div style={{ fontFamily: 'Cinzel,serif', fontSize: 10, color: '#B8860B', letterSpacing: 3, marginBottom: 14 }}>{"KLASİK İSLAM TIBBI ARAŞTIRMACISI"}</div>
            <h3 style={{ fontFamily: 'Cinzel,serif', fontSize: 22, fontWeight: 600, color: '#1A1208', marginBottom: 6 }}>{"Tıp Tarihi Yüksek Lisans"}</h3>
            <div style={{ fontSize: 16, color: '#9B8060', fontStyle: 'italic', marginBottom: 24 }}>{"FSM Vakıf Üniversitesi Fuat Sezgin İslam Bilim Tarihi Enstitüsü Doktora Adayı"}</div>
            <p style={{ fontSize: 17, color: '#5C4A2A', lineHeight: 1.85, marginBottom: 24 }}>{"Hekim Ahmet el-Hayâtî'nin Şeceretü't-Tıb adlı eserini ilk kez akademik düzeyde inceleyen araştırmacı. İbn Sînâ el-Kânûn ve Tahbîzü'l-Mathûn çevirileri üzerine çalışmalar yürütmektedir."}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }} className="akademik-grid">
              {[{ l: 'DOKTORA', v: 'FSM Fuat Sezgin Enstitüsü' }, { l: 'YÜKSEK LİSANS', v: 'Tıp Tarihi, Kocaeli Üniversitesi' }, { l: 'YAYINLAR', v: '8 Kitap, 7 Çeviri' }, { l: 'UZMANLIK', v: 'Klasik İslam ve Osmanlı Tıbbı' }].map(({ l, v }) => (
                <div key={l} style={{ background: 'white', border: '1px solid #DEB887', borderRadius: 10, padding: '14px 16px' }}>
                  <div style={{ fontFamily: 'Cinzel,serif', fontSize: 8, color: '#9B8060', letterSpacing: 2, marginBottom: 5 }}>{l}</div>
                  <div style={{ fontSize: 15, color: '#1A1208' }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <a href="https://wa.me/905331687226" style={{ fontFamily: 'Cinzel,serif', fontSize: 10, fontWeight: 700, color: 'white', background: '#25D366', padding: '12px 24px', borderRadius: 9, letterSpacing: 1, textDecoration: 'none' }}>{"WhatsApp"}</a>
              <a href="/hakkimizda" style={{ fontFamily: 'Cinzel,serif', fontSize: 10, color: '#1C3A26', background: 'transparent', padding: '11px 20px', borderRadius: 9, border: '1.5px solid #1C3A26', letterSpacing: 1, textDecoration: 'none' }}>{"Hakkımızda"}</a>
            </div>
          </div>
        </div>
      </section>

      {/* YORUMLAR */}
      {yorumlar.length > 0 && (
        <section style={{ background: '#F5EFE0', padding: '88px clamp(24px,5vw,80px)', borderTop: '1px solid #DEB887' }}>
          <div style={{ textAlign: 'center' as const, marginBottom: 56 }}>
            <div style={{ fontFamily: 'Cinzel,serif', fontSize: 10, color: '#B8860B', letterSpacing: 3, marginBottom: 14 }}>{"DENEYİMLER"}</div>
            <h2 style={{ fontFamily: 'Cinzel,serif', fontSize: 'clamp(28px,4vw,38px)', fontWeight: 600, color: '#1A1208' }}>{"İlk Analizden Sonra"}</h2>
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

      <MakalelerSection />

      {/* RESPONSIVE */}
      <style jsx global>{`
        @media (max-width: 960px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .hero-logo-col { order: -1; display: flex !important; justify-content: center; }
          .hero-logo-col svg { width: 140px !important; height: 140px !important; }
          .hero-dan-col { order: 3; }
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
