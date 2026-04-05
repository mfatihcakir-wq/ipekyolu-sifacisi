'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Cinzel, EB_Garamond, Noto_Naskh_Arabic } from 'next/font/google'
import { createClient } from '@/lib/supabase'
import Header from './components/Header'
import Footer from './components/Footer'

const cinzel = Cinzel({ subsets: ['latin'], weight: ['400', '500', '600'] })
const garamond = EB_Garamond({ subsets: ['latin'], weight: ['400', '500'], style: ['normal', 'italic'] })
const naskh = Noto_Naskh_Arabic({ subsets: ['arabic'], weight: ['400', '500'] })

const C = {
  primary: '#1B4332',
  primaryDark: '#0F2D1C',
  gold: '#C9A84C',
  cream: '#F5EFE6',
  dark: '#1C1C1C',
  secondary: '#5C4A2A',
  border: '#E0D5C5',
  white: '#FFFFFF',
  surface: '#FAF7F2',
}

export default function LandingPage() {
  const router = useRouter()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [user, setUser] = useState<{ email?: string } | null>(null)
  const supabase = createClient()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { supabase.auth.getUser().then(({ data }) => setUser(data.user)) }, [])

  return (
    <div style={{ fontFamily: garamond.style.fontFamily, color: C.dark, margin: 0 }}>
      <Header />

      {/* ═══════ 1. HERO ═══════ */}
      <section style={{
        background: 'linear-gradient(135deg, #0F2D1C 0%, #1B4332 100%)',
        padding: 'clamp(48px, 8vw, 100px) clamp(16px, 5vw, 52px)',
        minHeight: '72vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ maxWidth: 1200, width: '100%', display: 'flex', gap: 'clamp(24px, 4vw, 60px)', alignItems: 'center', flexWrap: 'wrap' as const }}>
          {/* Sol — Metin */}
          <div style={{ flex: '1 1 480px', minWidth: 260 }}>
            <div style={{
              display: 'inline-block', background: 'rgba(201,168,76,0.12)',
              border: '1px solid rgba(201,168,76,0.25)', borderRadius: 24,
              padding: '8px 20px', marginBottom: 24, fontSize: 12,
              color: C.gold, letterSpacing: 1,
            }}>
              {"İbn Sînâ · el-Kânûn fi't-Tıb · Tahbîzü'l-Mathûn · İbn Beytâr"}
            </div>

            <h1 style={{
              fontFamily: cinzel.style.fontFamily,
              fontSize: 'clamp(30px, 5vw, 54px)', fontWeight: 600,
              color: C.gold, margin: '0 0 16px 0',
              lineHeight: 1.1, letterSpacing: 2,
            }}>
              {"Vücudunuzun Dilini Anlıyoruz."}
            </h1>

            <p style={{
              fontStyle: 'italic', fontSize: 'clamp(15px, 2vw, 19px)',
              color: 'rgba(245,239,230,0.7)', maxWidth: 540,
              margin: '0 0 12px 0', lineHeight: 1.7,
            }}>
              {"Bin yıllık İslam ve Osmanlı tıbbının birikimi ile hazırlanmış, sizin mizacınıza özel sağlık danışmanlığı."}
            </p>

            <p style={{
              fontFamily: naskh.style.fontFamily,
              fontSize: 'clamp(18px, 2.5vw, 24px)',
              color: C.gold, margin: '0 0 32px 0',
              direction: 'rtl' as const, opacity: 0.7,
            }}>
              طريق الحرير الشافي
            </p>

            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' as const }}>
              <button onClick={() => router.push('/analiz')}
                style={{ background: C.gold, color: C.primary, border: 'none', borderRadius: 28, padding: '16px 36px', fontFamily: cinzel.style.fontFamily, fontWeight: 600, fontSize: 15, cursor: 'pointer', letterSpacing: 1, boxShadow: '0 4px 16px rgba(201,168,76,0.35)' }}>
                {"Analizimi Başlat"}
              </button>
              <button onClick={() => router.push('/bitkiler')}
                style={{ background: 'transparent', color: 'rgba(255,255,255,0.8)', border: '1.5px solid rgba(255,255,255,0.3)', borderRadius: 28, padding: '14px 32px', fontFamily: cinzel.style.fontFamily, fontWeight: 500, fontSize: 15, cursor: 'pointer', letterSpacing: 1 }}>
                {"Bitki Ansiklopedisi"}
              </button>
            </div>
          </div>

          {/* Sağ — Danışman Kartı */}
          <div style={{
            flex: '0 1 340px', background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(201,168,76,0.15)', borderRadius: 20,
            padding: 'clamp(20px, 3vw, 28px)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: C.gold, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontFamily: cinzel.style.fontFamily, fontSize: 22, color: C.primary, fontWeight: 600 }}>M</span>
              </div>
              <div>
                <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 15, color: C.white, fontWeight: 600 }}>{"M. Fatih Çakır"}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', fontStyle: 'italic' }}>{"Klasik İslam Tıbbı Danışmanı"}</div>
              </div>
            </div>
            <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 9, color: 'rgba(201,168,76,0.5)', letterSpacing: 2, marginBottom: 14, textTransform: 'uppercase' as const }}>
              {"FSM Vakıf Üniversitesi · Doktora"}
            </div>
            <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', marginBottom: 14 }} />
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' as const, marginBottom: 16 }}>
              {['38 Klasik Eser', '1.180 Bitki', '5 Hekim'].map(c => (
                <span key={c} style={{ fontSize: 10, background: 'rgba(201,168,76,0.12)', color: C.gold, padding: '4px 10px', borderRadius: 12, fontWeight: 600 }}>{c}</span>
              ))}
            </div>
            <a href="https://wa.me/905331687226" target="_blank"
              style={{ display: 'block', textAlign: 'center' as const, background: '#25D366', color: 'white', borderRadius: 10, padding: '10px', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
              {"💬 Danışmana Sor"}
            </a>
          </div>
        </div>
      </section>

      {/* ═══════ 2. STATS BANDI ═══════ */}
      <section style={{ background: C.primaryDark, padding: 'clamp(20px, 4vw, 40px) clamp(16px, 5vw, 52px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 'clamp(12px, 2vw, 24px)', textAlign: 'center' as const }}>
          {[
            { num: '31.400+', label: 'Klasik Kayıt' },
            { num: '38', label: 'Klasik Eser' },
            { num: '1.180', label: 'Bitki' },
            { num: '5', label: 'Hekim Profili' },
          ].map(st => (
            <div key={st.label}>
              <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 'clamp(22px, 3.5vw, 36px)', color: C.gold, fontWeight: 600 }}>{st.num}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, marginTop: 4 }}>{st.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════ 3. NEDEN ═══════ */}
      <section style={{ background: C.cream, padding: 'clamp(48px, 8vw, 80px) clamp(16px, 5vw, 52px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h2 style={{ fontFamily: cinzel.style.fontFamily, fontSize: 'clamp(22px, 3.5vw, 34px)', fontWeight: 600, color: C.primary, textAlign: 'center' as const, marginBottom: 12 }}>
            {"Modern Tıbbın Göremediğini Görür"}
          </h2>
          <p style={{ textAlign: 'center' as const, color: C.secondary, fontSize: 15, marginBottom: 48, fontStyle: 'italic', maxWidth: 600, margin: '0 auto 48px auto' }}>
            {"Klasik İslam tıbbı, semptomun arkasındaki sebebe, sebebin arkasındaki mizaca bakar."}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(240px, 100%), 1fr))', gap: 20 }}>
            {[
              {
                icon: '🌡️', title: 'Derin Mizaç Analizi',
                desc: 'Nabız (9 sıfat), dil/yüz kamerası, idrar gözlemi ve 17 lab parametresiyle üç kanallı teşhis.',
                chips: ['el-Kânûn', 'el-Şâmil'],
              },
              {
                icon: '🌿', title: 'Klasik Kaynaklı Reçete',
                desc: 'Gıda protokolü, basit bitki, bileşik formül (macun/merhem/şerbet) ve günlük rutin programı.',
                chips: ['Tahbîzü\'l-Mathûn', 'el-Hâvî'],
              },
              {
                icon: '📚', title: '5 Klasik Hekim Perspektifi',
                desc: 'er-Râzî, İbn Nefîs, İbn Rüşd, ez-Zehravî ve İbn Beytâr — her biri farklı bakış açısı.',
                chips: ['el-Hâvî', 'el-Külliyyât'],
              },
            ].map(f => (
              <div key={f.title} style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: 'clamp(20px, 3vw, 28px)', transition: 'box-shadow 0.2s' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{f.icon}</div>
                <h3 style={{ fontFamily: cinzel.style.fontFamily, fontSize: 17, fontWeight: 600, color: C.primary, marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: C.secondary, lineHeight: 1.7, marginBottom: 14 }}>{f.desc}</p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' as const }}>
                  {f.chips.map(c => (
                    <span key={c} style={{ fontSize: 10, background: '#E8F5E9', color: C.primary, padding: '3px 10px', borderRadius: 12, fontWeight: 600 }}>{c}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ 4. NASIL ÇALIŞIR ═══════ */}
      <section style={{ background: C.white, padding: 'clamp(48px, 8vw, 80px) clamp(16px, 5vw, 52px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h2 style={{ fontFamily: cinzel.style.fontFamily, fontSize: 'clamp(22px, 3.5vw, 34px)', fontWeight: 600, color: C.primary, textAlign: 'center' as const, marginBottom: 48 }}>
            {"Nasıl Çalışır?"}
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(200px, 100%), 1fr))', gap: 32 }}>
            {[
              { num: '1', title: 'Formu Doldur', desc: '8 adımlı kapsamlı form: nabız, dil/yüz kamerası, idrar, lab değerleri, fıtrî mizaç ve şikayetler.' },
              { num: '2', title: 'Danışmana İletilir', desc: '38 klasik eserden FTS ile şikayete özel bölümler derlenir, 5 katmanlı analiz algoritması çalışır.' },
              { num: '3', title: 'Protokol Teslim', desc: 'Bitkisel reçete + günlük rutin + beslenme protokolü email ve WhatsApp ile iletilir.' },
            ].map(s => (
              <div key={s.num} style={{ textAlign: 'center' as const }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%', background: C.gold,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px auto',
                }}>
                  <span style={{ fontFamily: cinzel.style.fontFamily, fontSize: 22, color: C.primary, fontWeight: 600 }}>{s.num}</span>
                </div>
                <h3 style={{ fontFamily: cinzel.style.fontFamily, fontSize: 16, fontWeight: 600, color: C.primary, marginBottom: 8 }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: C.secondary, lineHeight: 1.7, maxWidth: 280, margin: '0 auto' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ 5. FİYATLANDIRMA ═══════ */}
      <section style={{ background: C.cream, padding: 'clamp(48px, 8vw, 80px) clamp(16px, 5vw, 52px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h2 style={{ fontFamily: cinzel.style.fontFamily, fontSize: 'clamp(22px, 3.5vw, 34px)', fontWeight: 600, color: C.primary, textAlign: 'center' as const, marginBottom: 12 }}>
            {"Size Uygun Planı Seçin"}
          </h2>
          <p style={{ textAlign: 'center' as const, color: C.secondary, fontSize: 15, marginBottom: 48, fontStyle: 'italic' }}>
            {"İlk analizden sonra fark yaşarsınız."}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(220px, 100%), 1fr))', gap: 20, alignItems: 'start' }}>
            {[
              { id: 'monthly', name: 'Aylık', price: '890₺', period: '/ay', features: ['Haftada 1 analiz', 'WhatsApp danışmanlık', 'PDF rapor'], badge: null },
              { id: 'yearly', name: 'Yıllık', price: '590₺', period: '/ay', features: ['Sınırsız analiz', 'WhatsApp danışmanlık', 'Öncelikli erişim', 'PDF rapor', '7.080₺/yıl'], badge: 'EN AVANTAJLI' },
              { id: 'one_time', name: 'Tek Seferlik', price: '1.290₺', period: '', features: ['1 tam analiz', 'WhatsApp protokol', 'PDF sonuç'], badge: null },
            ].map(plan => (
              <div key={plan.id} style={{
                background: plan.badge ? C.primary : C.white,
                borderRadius: 20, padding: 'clamp(24px, 3vw, 36px)',
                textAlign: 'center' as const, position: 'relative' as const,
                border: plan.badge ? 'none' : `1px solid ${C.border}`,
                transform: plan.badge ? 'scale(1.03)' : 'none',
              }}>
                {plan.badge && (
                  <div style={{
                    position: 'absolute' as const, top: -14, left: '50%', transform: 'translateX(-50%)',
                    background: C.gold, color: C.primary, fontFamily: cinzel.style.fontFamily,
                    fontSize: 10, fontWeight: 600, padding: '5px 16px', borderRadius: 20, letterSpacing: 1, whiteSpace: 'nowrap' as const,
                  }}>
                    {plan.badge}
                  </div>
                )}

                <h3 style={{ fontFamily: cinzel.style.fontFamily, fontSize: 18, fontWeight: 600, color: plan.badge ? C.gold : C.primary, marginBottom: 12 }}>
                  {plan.name}
                </h3>
                <div style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 700, color: plan.badge ? C.white : C.dark, marginBottom: 4 }}>
                  {plan.price}
                  {plan.period && <span style={{ fontSize: 14, fontWeight: 400, opacity: 0.6 }}>{plan.period}</span>}
                </div>
                {plan.badge && <div style={{ fontSize: 12, color: C.gold, marginBottom: 16, opacity: 0.7 }}>{'%34 indirim'}</div>}
                {!plan.badge && <div style={{ height: 16 }} />}

                <div style={{ textAlign: 'left' as const, marginBottom: 20 }}>
                  {plan.features.map(f => (
                    <div key={f} style={{ fontSize: 13, color: plan.badge ? 'rgba(255,255,255,0.7)' : C.secondary, padding: '4px 0', display: 'flex', gap: 8 }}>
                      <span style={{ color: plan.badge ? C.gold : '#059669' }}>{"✓"}</span> {f}
                    </div>
                  ))}
                </div>

                <button onClick={() => router.push('/kayit')}
                  style={{
                    width: '100%', padding: '14px', borderRadius: 12, border: 'none',
                    background: plan.badge ? C.gold : C.primary,
                    color: plan.badge ? C.primary : C.white,
                    fontFamily: cinzel.style.fontFamily, fontSize: 13, fontWeight: 600,
                    cursor: 'pointer', letterSpacing: 1,
                  }}>
                  {"Başla"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ 6. HİKMET BANDI ═══════ */}
      <section style={{ background: C.primary, padding: 'clamp(40px, 6vw, 80px) clamp(16px, 5vw, 52px)', textAlign: 'center' as const }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <p style={{ fontFamily: naskh.style.fontFamily, fontSize: 'clamp(20px, 3vw, 28px)', color: C.gold, direction: 'rtl' as const, marginBottom: 16 }}>
            الجسم لا يُعالَج إلا بمعرفة مزاجه
          </p>
          <p style={{ fontSize: 'clamp(14px, 2vw, 18px)', color: 'rgba(245,239,230,0.7)', fontStyle: 'italic', marginBottom: 8 }}>
            {"Beden, ancak mizacı bilindiğinde tedavi edilebilir."}
          </p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginBottom: 32 }}>
            {"el-Kânûn fi't-Tıb, Kitab 1 — İbn Sînâ"}
          </p>
          <button onClick={() => router.push('/analiz')}
            style={{ background: C.gold, color: C.primary, border: 'none', borderRadius: 28, padding: '14px 36px', fontFamily: cinzel.style.fontFamily, fontWeight: 600, fontSize: 14, cursor: 'pointer', letterSpacing: 1, boxShadow: '0 4px 16px rgba(201,168,76,0.3)' }}>
            {"Analizimi Başlat"}
          </button>
        </div>
      </section>

      <Footer />
    </div>
  )
}
