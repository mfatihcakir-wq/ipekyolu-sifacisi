'use client'

import { useRouter } from 'next/navigation'
import { Cinzel, EB_Garamond, Noto_Naskh_Arabic } from 'next/font/google'
import Header from './components/Header'

const cinzel = Cinzel({ subsets: ['latin', 'latin-ext'], weight: ['400', '500', '600', '700'] })
const garamond = EB_Garamond({ subsets: ['latin', 'latin-ext'], weight: ['400', '500'], style: ['normal', 'italic'] })
const naskh = Noto_Naskh_Arabic({ subsets: ['arabic'], weight: ['400', '500'] })

const C = {
  primary: '#1B4332', primaryDark: '#0F2D1C', gold: '#C9A84C',
  cream: '#F5EFE6', dark: '#1C1C1C', secondary: '#5C4A2A',
  border: '#E0D5C5', white: '#FFFFFF', surface: '#FAF7F2', muted: '#9C8B72',
}

function AlembikSVG({ size = 160 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <ellipse cx="32" cy="37" rx="12" ry="10" stroke="#C9A84C" strokeWidth="1.5" opacity={0.8} />
      <path d="M22 37 Q22 25 32 23 Q42 25 42 37" stroke="#C9A84C" strokeWidth="1.5" opacity={0.8} />
      <rect x="29" y="21" width="6" height="3.5" rx="1" stroke="#C9A84C" strokeWidth="1.5" opacity={0.8} />
      <path d="M32 15 Q36 11 40 13 Q38 18 32 20 Q26 18 24 13 Q28 11 32 15Z" fill="#C9A84C" />
      <path d="M32 38 Q28.5 42 32 45.5 Q35.5 42 32 38Z" fill="#C9A84C" opacity={0.5} />
      <circle cx="32" cy="32" r="2.8" fill="#EF5350" />
      <circle cx="26.5" cy="34" r="2" fill="#FF7043" />
      <circle cx="37.5" cy="34" r="2" fill="#42A5F5" />
      <circle cx="32" cy="38.5" r="1.8" fill="#AB47BC" />
    </svg>
  )
}

export default function LandingClient() {
  const router = useRouter()

  return (
    <div style={{ fontFamily: garamond.style.fontFamily, color: C.dark, margin: 0 }}>
      <Header />

      {/* ═══════ 1. HERO ═══════ */}
      <section style={{
        background: C.primary, padding: '92px 56px 116px',
        display: 'grid', gridTemplateColumns: '1fr 400px', gap: 64, alignItems: 'center',
        maxWidth: 1440, margin: '0 auto',
      }} className="hero-grid">
        {/* Sol */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
            <div style={{ width: 32, height: 2, background: C.gold, opacity: 0.65 }} />
            <span style={{ fontFamily: cinzel.style.fontFamily, fontSize: 9, color: C.gold, opacity: 0.65, letterSpacing: 3.5, textTransform: 'uppercase' as const }}>
              {"KLASIK ISLAM VE OSMANLI TIBBI"}
            </span>
          </div>

          <h1 style={{ fontFamily: cinzel.style.fontFamily, fontSize: 54, fontWeight: 600, color: C.white, lineHeight: 1.08, margin: '0 0 20px 0' }}>
            {"Bedeninizi"}
            <span style={{ display: 'block', color: C.gold }}>{"Anliyoruz."}</span>
          </h1>

          <p style={{ fontFamily: garamond.style.fontFamily, fontStyle: 'italic', fontSize: 20, color: 'rgba(255,255,255,0.55)', lineHeight: 1.8, maxWidth: 480, margin: '0 0 36px 0' }}>
            {"Nabzinizdan mizaciniza, dilinizden hilt dengenize; bin yillik birikimle hazirlanmis, size ozel danismanlik."}
          </p>

          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' as const }}>
            <button onClick={() => router.push('/analiz')}
              style={{ fontFamily: cinzel.style.fontFamily, fontSize: 12, fontWeight: 700, color: C.primary, background: C.gold, border: 'none', borderRadius: 12, padding: '18px 36px', cursor: 'pointer', letterSpacing: 1.5, textTransform: 'uppercase' as const }}>
              {"ANALIZIMI BASLAT"}
            </button>
            <button onClick={() => router.push('/bitkiler')}
              style={{ fontFamily: cinzel.style.fontFamily, fontSize: 11, color: 'rgba(255,255,255,0.45)', background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '15px 22px', cursor: 'pointer', letterSpacing: 1, textTransform: 'uppercase' as const }}>
              {"BITKI ANSIKLOPEDISI"}
            </button>
          </div>
        </div>

        {/* Sag: Hero Panel */}
        <div style={{ position: 'relative' as const, width: 300, height: 300, margin: '0 auto' }} className="hero-panel">
          {/* Halkalar */}
          <div style={{ position: 'absolute' as const, inset: 0, borderRadius: '50%', border: '1px solid rgba(201,168,76,0.12)' }} />
          <div style={{ position: 'absolute' as const, top: 35, left: 35, right: 35, bottom: 35, borderRadius: '50%', border: '1px solid rgba(201,168,76,0.09)' }} />
          <div style={{ position: 'absolute' as const, top: 70, left: 70, right: 70, bottom: 70, borderRadius: '50%', border: '1px solid rgba(201,168,76,0.15)' }} />
          {/* Merkez */}
          <div style={{ position: 'absolute' as const, top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' as const }}>
            <AlembikSVG size={80} />
            <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 8, color: 'rgba(201,168,76,0.35)', letterSpacing: 3, marginTop: 8, whiteSpace: 'nowrap' as const }}>
              {"Dort Hilt . Dort Mevsim . Dort Mizac"}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ 2. WAVE ═══════ */}
      <svg viewBox="0 0 1440 60" style={{ display: 'block', width: '100%', background: C.primary }}>
        <path d="M0,0 C480,60 960,60 1440,0 L1440,60 L0,60 Z" fill={C.cream} />
      </svg>

      {/* ═══════ 3. STATS ═══════ */}
      <section style={{ background: C.cream, padding: '48px 56px' }} className="stats-section">
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18 }} className="stats-grid">
          {[
            { n: '38', l: 'KLASIK ESER', s: 'el-Havi, el-Kanun, el-Samil, 35 eser daha' },
            { n: '31.400+', l: 'METIN KAYDI', s: 'Indekslenmis klasik metin parcasi' },
            { n: '9', l: 'NABIZ SIFATI', s: 'Ibn Sina metodolojisi' },
            { n: '4', l: 'MIZAC TIPI', s: 'Demevi, Safravi, Balgami, Sevdavi' },
          ].map(st => (
            <div key={st.l} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 18, padding: '30px 22px', textAlign: 'center' as const, position: 'relative' as const, overflow: 'hidden' }}>
              <div style={{ position: 'absolute' as const, top: 0, left: '20%', right: '20%', height: 2, background: C.gold, opacity: 0.5 }} />
              <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 40, fontWeight: 700, color: C.primary }}>{st.n}</div>
              <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 9, color: C.muted, letterSpacing: 2.5, textTransform: 'uppercase' as const, marginTop: 6 }}>{st.l}</div>
              <div style={{ fontSize: 12, color: C.gold, fontStyle: 'italic', marginTop: 6 }}>{st.s}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════ TANITIM ═══════ */}
      <section style={{ background: C.primary, padding: '64px 56px', textAlign: 'center' as const }} className="tanitim-section">
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
            <div style={{ width: 32, height: 1, background: C.gold, opacity: 0.3 }} />
            <span style={{ fontFamily: cinzel.style.fontFamily, fontSize: 9, color: 'rgba(201,168,76,0.7)', letterSpacing: 3, textTransform: 'uppercase' as const }}>{"Klasik Islam Tibbi"}</span>
            <div style={{ width: 32, height: 1, background: C.gold, opacity: 0.3 }} />
          </div>
          <p style={{ fontStyle: 'italic', fontSize: 22, color: 'rgba(255,255,255,0.75)', lineHeight: 1.9, maxWidth: 680, margin: '20px auto 0 auto' }}>
            {"Ibn Sina, er-Razi ve Osmanli hekimlerinin bin yil boyunca gelistirdigi tip gelenegi; her insanin dogustan gelen mizacini esas alir. Hastaligi degil, hastayi tanir. Semptomu degil, sebebi arar."}
          </p>
          <div style={{ marginTop: 32, display: 'flex', justifyContent: 'center', gap: 40, flexWrap: 'wrap' as const }}>
            {["el-Kanun fi't-Tib, Ibn Sina", "el-Havi fi't-Tib, er-Razi", "Tahbizu'l-Mathun, Tokadi"].map(k => (
              <span key={k} style={{ fontFamily: cinzel.style.fontFamily, fontSize: 9, color: 'rgba(201,168,76,0.55)', letterSpacing: 2 }}>{k}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ 4. FEATURES ═══════ */}
      <section style={{ background: C.white, padding: '80px 56px' }} className="features-section">
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {/* Eyebrow */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginBottom: 16 }}>
            <div style={{ width: 32, height: 1, background: C.gold, opacity: 0.4 }} />
            <span style={{ fontFamily: cinzel.style.fontFamily, fontSize: 9, color: C.gold, letterSpacing: 3, textTransform: 'uppercase' as const }}>{"Neden Farkliyiz"}</span>
            <div style={{ width: 32, height: 1, background: C.gold, opacity: 0.4 }} />
          </div>
          <h2 style={{ fontFamily: cinzel.style.fontFamily, fontSize: 33, fontWeight: 600, color: C.primary, textAlign: 'center' as const, marginBottom: 12 }}>
            {"Beden Bir Butundur"}
          </h2>
          <p style={{ textAlign: 'center' as const, fontStyle: 'italic', fontSize: 18, color: C.secondary, lineHeight: 1.7, maxWidth: 520, margin: '0 auto 48px auto' }}>
            {"Modern tibbin semptomu gordugu yerde, klasik tip sebebi arar. Biz sizin mizacinizi okuyoruz."}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 22 }} className="features-grid">
            {[
              {
                icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.primary} strokeWidth="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
                title: 'Mizac Tespiti',
                desc: 'Demevi, Safravi, Balgami veya Sevdavi; nabiz, dil, yuz ve lab degerleri birlikte okunarak vucudunuzun derin tabiati belirlenir.',
                href: '/analiz',
              },
              {
                icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.primary} strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
                title: 'Kisisel Bitki Protokolu',
                desc: '1180 bitki ve tibbi madde iceren Ibn Beytar kaynakli veritabanindan, sizin mizaciniza ve sikayetinize ozel protokol hazirlanir.',
                href: '/bitkiler',
              },
              {
                icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.primary} strokeWidth="1.5"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>,
                title: 'Uzman Danismanlik',
                desc: 'Formunuzu bizzat inceleyen, 24 ile 48 saat icinde WhatsApp uzerinden ulasan uzman danisman. Protokolunuz takip edilir, sorulariniz yanitlanir.',
                href: '/hakkimizda',
              },
              {
                icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.primary} strokeWidth="1.5"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
                title: '38 Klasik Kaynak',
                desc: 'el-Havi, Tahbizul-Mathun, el-Samil ve 35 eser daha; her analizde sikayetinize en uygun metinler bulunup getirilir.',
                href: '/hakkimizda',
              },
              {
                icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.primary} strokeWidth="1.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>,
                title: 'Karakter Analizi',
                desc: 'Klasik Islam dusuncesi cercevesinde beden ve ruh butunlugu degerlendirmesi. 4 cephe, 40 soru, kisisel recete.',
                href: '/karakter',
              },
            ].map(f => (
              <div key={f.title} style={{ border: `1px solid ${C.border}`, borderRadius: 20, padding: '34px 30px' }}>
                <div style={{ width: 48, height: 48, background: C.cream, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  {f.icon}
                </div>
                <h3 style={{ fontFamily: cinzel.style.fontFamily, fontSize: 17, fontWeight: 500, color: C.primary, marginBottom: 10 }}>{f.title}</h3>
                <p style={{ fontSize: 16, color: C.secondary, lineHeight: 1.8, marginBottom: 14 }}>{f.desc}</p>
                <a href={f.href} style={{ fontFamily: cinzel.style.fontFamily, fontSize: 9, color: C.gold, letterSpacing: 2, cursor: 'pointer', textDecoration: 'none' }}>{"DETAYLI INCELE \u2192"}</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ 5. STEPS ═══════ */}
      <section style={{ background: C.cream, padding: '80px 56px' }} className="steps-section">
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginBottom: 16 }}>
            <div style={{ width: 32, height: 1, background: C.gold, opacity: 0.4 }} />
            <span style={{ fontFamily: cinzel.style.fontFamily, fontSize: 9, color: C.gold, letterSpacing: 3, textTransform: 'uppercase' as const }}>{"Surec"}</span>
            <div style={{ width: 32, height: 1, background: C.gold, opacity: 0.4 }} />
          </div>
          <h2 style={{ fontFamily: cinzel.style.fontFamily, fontSize: 33, fontWeight: 600, color: C.primary, textAlign: 'center' as const, marginBottom: 12 }}>
            {"Nasil Calisir?"}
          </h2>
          <p style={{ textAlign: 'center' as const, fontStyle: 'italic', fontSize: 16, color: C.secondary, marginBottom: 52 }}>
            {"Uc adimda kisisel saglik protokolunuze kavusun."}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 40 }} className="steps-grid">
            {[
              { num: '1', title: 'Formunuzu Doldurun', desc: 'Sikayetlerinizi, nabiz ve dil bulgularinizi, yasam aliskanliklarinizi paylasin.' },
              { num: '2', title: 'Klasik Analiz', desc: '38 klasik eserden ilgili bolumler derlenir, mizaciniza ozel protokol hazirlanir.' },
              { num: '3', title: 'Danismaniniz Ulasir', desc: '24 ile 48 saat icinde uzman danismaniniz WhatsApp ile protokolunuzu iletir.' },
            ].map(s => (
              <div key={s.num} style={{ textAlign: 'center' as const }}>
                <div style={{ position: 'relative' as const, width: 76, height: 76, margin: '0 auto 20px auto' }}>
                  <div style={{ position: 'absolute' as const, inset: 0, borderRadius: '50%', border: '1px solid rgba(27,67,50,0.16)' }} />
                  <div style={{ position: 'absolute' as const, top: 7, left: 7, right: 7, bottom: 7, borderRadius: '50%', background: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontFamily: cinzel.style.fontFamily, fontSize: 22, fontWeight: 700, color: C.gold }}>{s.num}</span>
                  </div>
                </div>
                <h3 style={{ fontFamily: cinzel.style.fontFamily, fontSize: 16, color: C.primary, marginBottom: 10 }}>{s.title}</h3>
                <p style={{ fontSize: 15, color: C.secondary, lineHeight: 1.8, fontStyle: 'italic' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ 6. DANIŞMAN ═══════ */}
      <section style={{ background: C.white, padding: '80px 56px' }} className="danisman-section">
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '320px 1fr', gap: 72, alignItems: 'center' }} className="danisman-grid">
          {/* Sol: Foto */}
          <div style={{ position: 'relative' as const, width: 320, height: 380, borderRadius: 24, overflow: 'hidden', border: '1.5px solid rgba(201,168,76,0.18)' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/danisan.jpg" alt="M. Fatih Cakir" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', filter: 'sepia(15%) contrast(1.05) brightness(0.96)' }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
            <div style={{ position: 'absolute' as const, inset: 0, background: 'linear-gradient(to bottom, transparent 50%, rgba(27,67,50,0.55) 100%)' }} />
            <div style={{ position: 'absolute' as const, bottom: 20, left: 20, background: 'rgba(201,168,76,0.92)', fontFamily: cinzel.style.fontFamily, fontSize: 10, fontWeight: 700, color: C.primary, padding: '6px 14px', borderRadius: 8 }}>
              {"M. FATIH CAKIR"}
            </div>
          </div>

          {/* Sag: Bilgi */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
              <div style={{ width: 32, height: 1, background: C.gold, opacity: 0.4 }} />
              <span style={{ fontFamily: cinzel.style.fontFamily, fontSize: 9, color: C.gold, letterSpacing: 3, textTransform: 'uppercase' as const }}>{"Danismaniniz"}</span>
            </div>
            <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 26, fontWeight: 600, color: C.primary, marginBottom: 8 }}>{"M. Fatih Cakir"}</div>
            <div style={{ fontSize: 16, color: C.gold, fontStyle: 'italic', marginBottom: 20 }}>{"Klasik Islam Tibbi Arastirmacisi, Tip Tarihi Yuksek Lisans"}</div>
            <p style={{ fontSize: 16, color: C.secondary, lineHeight: 1.88, marginBottom: 24 }}>
              {"FSM Vakif Universitesi Fuat Sezgin Islam Bilim Tarihi Enstitusu doktora adayi. Hekim Ahmet el-Hayati'nin Seceretut-Tib adli eserini ilk kez akademik duzeyde inceleyen arastirmaci. Ibn Sina el-Kanun ve Tahbizul-Mathun cevirileri uzerine calismalar yurutmektedir."}
            </p>

            {/* Akademik */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, background: C.cream, border: `1px solid ${C.border}`, borderRadius: 14, padding: '16px 20px', marginBottom: 20 }} className="akademik-grid">
              {[
                ['Doktora', 'FSM Fuat Sezgin Enstitusu'],
                ['Yuksek Lisans', 'Tip Tarihi, Kocaeli Universitesi'],
                ['Uzmanlik', 'Klasik Islam ve Osmanli Tibbi'],
                ['Yayinlar', '8 Kitap, 7 Ceviri'],
              ].map(([k, v]) => (
                <div key={k} style={{ padding: '6px 0' }}>
                  <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 9, color: C.muted, letterSpacing: 2, textTransform: 'uppercase' as const }}>{k}</div>
                  <div style={{ fontSize: 13, color: C.dark, marginTop: 2 }}>{v}</div>
                </div>
              ))}
            </div>

            {/* Tag chipler */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const, marginBottom: 24 }}>
              {['KLASIK ISLAM TIBBI', 'TIP TARIHI', 'ARAPCA, FARSCA, OSMANLICA'].map(t => (
                <span key={t} style={{ fontFamily: cinzel.style.fontFamily, fontSize: 9, color: C.gold, border: `1px solid rgba(201,168,76,0.25)`, padding: '5px 12px', borderRadius: 8, letterSpacing: 1.5 }}>{t}</span>
              ))}
            </div>

            {/* Butonlar */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' as const }}>
              <a href="https://wa.me/905331687226" target="_blank"
                style={{ background: '#25D366', color: 'white', padding: '12px 24px', borderRadius: 10, fontSize: 13, fontWeight: 600, textDecoration: 'none', fontFamily: cinzel.style.fontFamily, letterSpacing: 1 }}>
                {"WhatsApp"}
              </a>
              <a href="/hakkimizda"
                style={{ background: C.surface, color: C.secondary, padding: '12px 24px', borderRadius: 10, fontSize: 13, textDecoration: 'none', border: `1px solid ${C.border}`, fontFamily: cinzel.style.fontFamily, letterSpacing: 1 }}>
                {"Hakkimizda"}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ KULLANICI YORUMLARI ═══════ */}
      <section style={{ background: C.white, padding: '80px 56px' }} className="testimonials-section">
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginBottom: 16 }}>
            <div style={{ width: 32, height: 1, background: C.gold, opacity: 0.4 }} />
            <span style={{ fontFamily: cinzel.style.fontFamily, fontSize: 9, color: C.gold, letterSpacing: 3, textTransform: 'uppercase' as const }}>{"Deneyimler"}</span>
            <div style={{ width: 32, height: 1, background: C.gold, opacity: 0.4 }} />
          </div>
          <h2 style={{ fontFamily: cinzel.style.fontFamily, fontSize: 33, fontWeight: 600, color: C.primary, textAlign: 'center' as const, marginBottom: 48 }}>
            {"Ilk Analizden Sonra"}
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }} className="testimonials-grid">
            {[
              { yorum: 'Yillardir cozemedigim yorgunluk sikayetim icin ilk kez koklu bir yaklasim gordum. Nabiz ve dil analizi bolumleri gercekten farkli.', isim: 'E. Yilmaz', detay: 'Istanbul, Beta Kullanicisi' },
              { yorum: 'Klasik kaynaklara dayali bir sistem oldugunu bilmiyordum. Recete bolumundeki her bitkinin kaynagi ayrica belirtilmis, bu guven verdi.', isim: 'M. Arslan', detay: 'Ankara, Beta Kullanicisi' },
              { yorum: 'Analiz formunu doldurmak basli basina ogretici. Hangi sorulara odaklanmam gerektigini anladim.', isim: 'S. Demir', detay: 'Izmir, Beta Kullanicisi' },
            ].map(t => (
              <div key={t.isim} style={{ background: C.cream, border: `1px solid ${C.border}`, borderRadius: 20, padding: '28px 26px', position: 'relative' as const }}>
                <div style={{ fontSize: 14, color: C.gold, marginBottom: 14 }}>{"\u2605\u2605\u2605\u2605\u2605"}</div>
                <p style={{ fontStyle: 'italic', fontSize: 16, color: C.secondary, lineHeight: 1.8, margin: 0 }}>{t.yorum}</p>
                <div style={{ marginTop: 20, borderTop: `1px solid ${C.border}`, paddingTop: 16 }}>
                  <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 11, fontWeight: 600, color: C.primary, letterSpacing: 1 }}>{t.isim}</div>
                  <div style={{ fontSize: 13, color: C.muted, fontStyle: 'italic', marginTop: 2 }}>{t.detay}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ 7. PRICING ═══════ */}
      <section style={{ background: C.cream, padding: '80px 56px' }} className="pricing-section">
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginBottom: 16 }}>
            <div style={{ width: 32, height: 1, background: C.gold, opacity: 0.4 }} />
            <span style={{ fontFamily: cinzel.style.fontFamily, fontSize: 9, color: C.gold, letterSpacing: 3, textTransform: 'uppercase' as const }}>{"Uyelik"}</span>
            <div style={{ width: 32, height: 1, background: C.gold, opacity: 0.4 }} />
          </div>
          <h2 style={{ fontFamily: cinzel.style.fontFamily, fontSize: 33, fontWeight: 600, color: C.primary, textAlign: 'center' as const, marginBottom: 12 }}>
            {"Size Uygun Plani Secin"}
          </h2>
          <p style={{ textAlign: 'center' as const, fontStyle: 'italic', fontSize: 16, color: C.secondary, marginBottom: 52 }}>
            {"Ilk analizden sonra fark yasarsiniz. Yillik planda aylik 590\u20BA ile sinirsiz takip."}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginTop: 52 }} className="pricing-grid">
            {[
              { name: 'AYLIK', price: '890\u20BA', period: '/ay', sub: 'gunde 29\u20BA', features: ['Sinirsiz analiz', 'WhatsApp danismanlik', 'Bitki protokolu', 'PDF recete'], badge: null, highlight: false },
              { name: 'YILLIK', price: '590\u20BA', period: '/ay', sub: '%34 indirim, gunde 19\u20BA', features: ['Sinirsiz analiz', 'WhatsApp danismanlik', 'Bitki protokolu', 'PDF recete', 'Oncelikli destek'], badge: 'EN AVANTAJLI', highlight: true },
              { name: 'TEK SEFERLIK', price: '1.290\u20BA', period: '', sub: 'tek odeme, 1 analiz + sonuc', features: ['Tek analiz hakki', 'WhatsApp protokol', 'Bitki protokolu', 'PDF rapor'], badge: null, highlight: false },
            ].map(plan => (
              <div key={plan.name} style={{
                background: C.white, borderRadius: 22, padding: '36px 28px',
                textAlign: 'center' as const, position: 'relative' as const,
                border: plan.highlight ? `2px solid ${C.gold}` : `1.5px solid ${C.border}`,
              }}>
                {plan.badge && (
                  <div style={{ position: 'absolute' as const, top: -13, left: '50%', transform: 'translateX(-50%)', background: C.gold, fontFamily: cinzel.style.fontFamily, fontSize: 9, fontWeight: 700, color: C.primary, padding: '5px 16px', borderRadius: 20, letterSpacing: 1, whiteSpace: 'nowrap' as const }}>
                    {plan.badge}
                  </div>
                )}
                <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 9, color: C.muted, letterSpacing: 3, marginBottom: 16, textTransform: 'uppercase' as const }}>{plan.name}</div>
                <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 46, fontWeight: 700, color: C.primary }}>{plan.price}</div>
                {plan.period && <div style={{ fontSize: 14, color: C.muted }}>{plan.period}</div>}
                <div style={{ fontSize: 13, color: C.gold, fontStyle: 'italic', marginTop: 4, marginBottom: 24 }}>{plan.sub}</div>

                <div style={{ textAlign: 'left' as const, marginBottom: 24 }}>
                  {plan.features.map(f => (
                    <div key={f} style={{ fontSize: 14, color: C.secondary, padding: '8px 0', borderBottom: `1px solid ${C.cream}`, display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 5, height: 5, borderRadius: '50%', background: C.gold, flexShrink: 0 }} />
                      {f}
                    </div>
                  ))}
                </div>

                <button onClick={() => router.push('/kayit')}
                  style={{ width: '100%', padding: 15, borderRadius: 12, border: 'none', background: plan.highlight ? C.gold : C.primary, color: plan.highlight ? C.primary : C.white, fontFamily: cinzel.style.fontFamily, fontSize: 12, fontWeight: 600, cursor: 'pointer', letterSpacing: 1.5 }}>
                  {"BASLA"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ 8. FOOTER ═══════ */}
      <footer style={{ background: C.primaryDark, padding: '72px 56px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '2.2fr 1fr 1fr 1fr', gap: 56, paddingBottom: 56, borderBottom: '1px solid rgba(255,255,255,0.07)' }} className="footer-grid">
          {/* Kolon 1 */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <AlembikSVG size={34} />
              <div>
                <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 13, fontWeight: 600, color: C.gold, letterSpacing: 3 }}>{"IPEK YOLU SIFACISI"}</div>
                <div style={{ fontFamily: naskh.style.fontFamily, fontSize: 11, color: 'rgba(201,168,76,0.4)' }}>{"طريق الحرير الشافي"}</div>
              </div>
            </div>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)', fontStyle: 'italic', lineHeight: 1.7, marginBottom: 20 }}>
              {"Bin yillik sifa gelenegi, modern danismanlik."}
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              {[
                { label: 'Instagram', href: 'https://www.instagram.com/ipekyolusicfacisi' },
                { label: 'YouTube', href: 'https://www.youtube.com/@ipekyolusicfacisi' },
                { label: 'WhatsApp', href: 'https://wa.me/905331687226' },
              ].map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textDecoration: 'none', padding: '6px 12px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}>{s.label}</a>
              ))}
            </div>
          </div>

          {/* Kolon 2-4 */}
          {[
            { title: 'HIZMETLER', links: [['Analiz Baslat', '/analiz'], ['Bitki Ansiklopedisi', '/bitkiler'], ['Cilt Bakimi', '/hasta/cilt'], ['Mizac Testi', '/analiz']] },
            { title: 'KURUMSAL', links: [['Hakkimizda', '/hakkimizda'], ['SSS', '/sss'], ['Iletisim', 'https://wa.me/905331687226']] },
            { title: 'YASAL', links: [['KVKK', '/kvkk'], ['Gizlilik Politikasi', '/gizlilik-politikasi'], ['Kullanim Kosullari', '/kvkk']] },
          ].map(col => (
            <div key={col.title}>
              <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 9, color: C.gold, letterSpacing: 2.5, marginBottom: 20, opacity: 0.7 }}>{col.title}</div>
              {col.links.map(([label, href]) => (
                <a key={label} href={href} style={{ display: 'block', fontSize: 14, color: 'rgba(255,255,255,0.45)', textDecoration: 'none', padding: '6px 0', transition: 'color 0.2s' }}>{label}</a>
              ))}
            </div>
          ))}
        </div>

        {/* Alt cizgi */}
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 0', flexWrap: 'wrap' as const, gap: 12 }}>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>{"\u00A9 2026 Ipek Yolu Sifacisi. Tum haklari saklidir."}</span>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.14)', fontStyle: 'italic' }}>{"Bu site tibbi tavsiye vermez. Uzman hekime danisiniz."}</span>
        </div>
      </footer>

      {/* ═══════ RESPONSIVE ═══════ */}
      <style jsx global>{`
        @media (max-width: 960px) {
          .hero-grid { grid-template-columns: 1fr !important; padding: 56px 24px 72px !important; }
          .hero-panel { display: none !important; }
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .features-grid { grid-template-columns: 1fr !important; }
          .steps-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
          .danisman-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
          .danisman-grid > div:first-child { width: 100% !important; height: 280px !important; }
          .pricing-grid { grid-template-columns: 1fr !important; }
          .testimonials-grid { grid-template-columns: 1fr !important; }
          .tanitim-section { padding: 40px 24px !important; }
          .footer-grid { grid-template-columns: 1fr 1fr !important; gap: 32px !important; }
          .akademik-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 600px) {
          .hero-grid { padding: 40px 16px 56px !important; }
          .hero-grid h1 { font-size: 36px !important; }
          .stats-section, .features-section, .steps-section, .danisman-section, .pricing-section { padding: 48px 16px !important; }
          .stats-grid { grid-template-columns: 1fr 1fr !important; gap: 12px !important; }
          .footer-grid { grid-template-columns: 1fr !important; }
          footer { padding: 48px 16px 0 !important; }
        }
      `}</style>
    </div>
  )
}
