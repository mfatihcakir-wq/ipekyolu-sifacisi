'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Cinzel, EB_Garamond, Noto_Naskh_Arabic } from 'next/font/google'
import { createClient } from '@/lib/supabase'

const cinzel = Cinzel({ subsets: ['latin'], weight: ['400', '500', '600'] })
const garamond = EB_Garamond({ subsets: ['latin'], weight: ['400', '500'], style: ['normal', 'italic'] })
const naskh = Noto_Naskh_Arabic({ subsets: ['arabic'], weight: ['400', '500'] })

const COLORS = {
  primary: '#1B4332',
  gold: '#C9A84C',
  cream: '#F5EFE6',
  dark: '#1C1C1C',
  secondary: '#5C4A2A',
  white: '#FFFFFF',
}

const LANGS = [
  { code: 'TR', flag: '🇹🇷', path: '/' },
  { code: 'EN', flag: '🇬🇧', path: '/en' },
  { code: 'AR', flag: '🇸🇦', path: '/ar' },
  { code: 'ES', flag: '🇪🇸', path: '/es' },
  { code: 'RU', flag: '🇷🇺', path: '/ru' },
]

const FEATURES = [
  {
    icon: '🌡️',
    title: 'Mizaç Tespiti',
    desc: 'Demevî, Safravî, Balgamî veya Sevdavî — vücudunuzun dili hiç bu kadar net konuşmamıştı.',
    detay: `## Vücudunuz Size Ne Söylüyor?

Sabah kalktığınızda yorgun mu hissediyorsunuz? Bazı mevsimler daha mı zor geçiyor? Sindiriminiz düzensiz mi, ruh haliniz dalgalı mı? Bunların hepsi rastlantı değil — mizacınızın sizi uyarma biçimleri.

Klasik İslam tıbbı, insanı dört temel mizaç üzerinden tanımlar: **Demevî** (sıcak-nemli), **Safravî** (sıcak-kuru), **Balgamî** (soğuk-nemli) ve **Sevdavî** (soğuk-kuru). Her insan bu dört mizacın bileşiminden oluşur — ancak birisi baskın gelir ve o kişinin hem gücünü hem de kırılganlığını belirler.

### Neden Önemli?

İbn Sînâ el-Kânûn'da şöyle yazar: *"Hastalık, mizacın dengesini yitirdiği haldir."* Yani hastalık ansızın gelmez. Önce mizaç sinyaller verir — uyku bozukluğu, iştah değişimi, cilt tonu, sindirim hızı, ruh hali... Bunları okuyabilen, hastalık kapıyı çalmadan önce müdahale edebilir.

Biz tam da bunu yapıyoruz.

### Nasıl Tespit Edilir?

Mizaç tespiti yüzeysel bir anket değildir. Formumuzda şunlara bakıyoruz:

- Vücut yapısı ve cilt karakteri
- Uyku düzeni ve rüya örüntüleri
- Sindirim hızı ve iştah biçimi
- Sıcak-soğuk hassasiyeti
- Duygusal tepki kalıpları
- Nabız özellikleri (opsiyonel)
- Mevsimsel değişimler

Tüm bu veriler bir araya geldiğinde, yalnızca "ne şikayetiniz var" değil, "neden bu şikayetiniz var" sorusuna ulaşıyoruz.

### Bin Yıllık Bir Gözlem Geleneği

Tahbîzü'l-Mathûn — İbn Sînâ'nın el-Kânûn'unun Osmanlı Türkçesi tercümesi — mizaç bilimini on sekizinci yüzyıla taşıdı. Biz bu mirası dijitalize ederek, yapay zeka destekli analizle bugüne getirdik. Sonuç: akademik bir mirası, günlük hayatınıza uygulayabileceğiniz somut bir rehbere dönüştürmek.

Mizacınızı bilmek, kendinizi bilmektir.`,
  },
  {
    icon: '🌿',
    title: 'Bitki Protokolü',
    desc: 'Sizin mizacınıza ve şikayetinize özel hazırlanmış bitkisel protokol.',
    detay: `## Takviye Değil, Protokol

Eczane raflarındaki onlarca takviye kutusuna bakıp "hangisini alayım?" diye düşündüğünüz oldu mu? Ya da internetten araştırıp birbirini çelen tavsiyeler arasında sıkışıp kaldınız mı?

Biz farklı çalışıyoruz.

### Herkese Değil, Size Özel

Klasik İslam tıbbında bitkiler sadece "iyi gelir" ya da "gelmez" diye sınıflandırılmaz. Her bitkinin bir mizacı vardır. Soğuk-kuru mizaçlı bir bitkiyi, soğuk-kuru mizaçlı bir hastaya vermek durumu kötüleştirebilir. Sıcak-nemli bir hastaya soğutucu bitkiler gerekirken ısıtıcı bitkiler vermek yanlıştır.

Bu yüzden önce mizacınızı belirliyoruz — sonra o mizaca uygun bitkileri seçiyoruz.

### El-Kânûn'dan Gelen Bilgelik

İbn Sînâ'nın el-Kânûn fi't-Tıbb'ı, 800 yılı aşkın süre Avrupa ve Doğu tıp fakültelerinde ders kitabı olarak okutuldu. İçerdiği müfredat bölümü — bitkiler, mineraller ve hayvansal ürünlerin tıbbi özellikleri — günümüzde hâlâ referans alınan bilgi hazinesidir.

İbn Beytâr'ın el-Câmi li-Müfredâti'l-Edviye ve'l-Agziye adlı eseri ise 300'den fazla önceki kaynağı derlemiş, 1.400'ü aşkın maddeyi tanımlamıştır. Bugün bilim insanlarının "yeni keşfettiği" pek çok bitkisel etki, bu sayfalarda yüzyıllarca önce kayıt altına alınmıştır.

### Protokolünüz Neyi İçerir?

Danışmanınız size özel protokol hazırlarken şunlara dikkat eder:

- Hangi bitkiler, hangi dozda
- Nasıl hazırlanacak: çay, tinktur, toz, kapsül
- Günün hangi saatinde alınacak
- Kaç haftalık süre için
- Hangi bitkilerden kaçınılacak (ilaç etkileşimleri dahil)
- Beslenme ile nasıl destekleneceği

Bu bir alışveriş listesi değil — kişiye özel hazırlanmış bir şifa haritasıdır.`,
  },
  {
    icon: '👨‍⚕️',
    title: 'Uzman Danışmanlık',
    desc: "Formunuzu bizzat inceleyen, sizinle WhatsApp'tan iletişime geçen bir uzman.",
    detay: `## Kalabalık Koridorlar Değil, Gerçek İlgi

Bir poliklinike gittiğinizde kaç dakika doktorla konuşabiliyorsunuz? Genellikle sekiz ila on iki dakika. Şikayetlerinizi anlatmaya başladığınızda zaman dolmuş oluyor.

İpek Yolu Şifacısı başka türlü çalışır.

### Danışmanınız Sizi Tanır

Formunuzu doldurmak için ayırdığınız her dakika, danışmanınızın sizi daha iyi anlamasını sağlar. Yıllardır süren şikayetleri, daha önce denediklerinizi, hayatınızın ritmi — bunların hepsi değerlendirmeye girer.

Danışmanınız Dr. M. Fatih Çakır; Kocaeli Üniversitesi Tıp Tarihi yüksek lisansı ve FSM Vakıf Üniversitesi'nde İslam Bilim Tarihi doktora programı öğrencisidir. Aynı zamanda Osmanlı Türkçesi ve Arapça bilgisiyle birincil kaynaklara doğrudan erişen, bu alanda Türkiye'de özgün akademik çalışmalar yapan isimdir.

### WhatsApp ile Doğrudan İletişim

Sonuçlarınız hazır olduğunda danışmanınız size doğrudan WhatsApp'tan ulaşır. Yazılı mesaj, sesli not veya kısa görüntülü görüşme — hangisi size uygunsa.

Takip seansları için tekrar form doldurmak zorunda değilsiniz. Danışmanınız sizi hatırlar.

### Gizlilik ve Güven

Paylaştığınız tüm sağlık verileri KVKK kapsamında korunur. Bilgileriniz üçüncü taraflarla paylaşılmaz, reklam amacıyla kullanılmaz. Sistemimiz yalnızca danışmanlık hizmetine özel, kapalı bir platformdur.

Doğru soruyu soran, gerçekten dinleyen bir danışmana ihtiyacınız vardı. Buradayız.`,
  },
  {
    icon: '📜',
    title: 'Klasik Kaynaklar',
    desc: "el-Kânûn, Tahbîzü'l-Mathûn ve 7 büyük İslam tıbbı kaynağından beslenen bilgi tabanı — yapay zeka ile analiz edilerek size sunulur.",
    detay: `Bin yılı aşkın bir süre önce yazılan metinler, bugün bir algoritmaya dönüştü. Ama özü aynı kaldı: insanı anlamak.

Sistemimizin bilgi tabanında sekiz büyük İslam tıbbı otoritesinin eserleri yer alıyor. Bunlar rafta duran kitaplar değil, her analiz yapıldığında içlerinden geçilen, şikayetinizle eşleştirilen, size özel yanıt aranan metinler.

En büyük kaynağımız er-Râzî'nin el-Hâvî'si. Otuz ciltten fazla, sekiz binden fazla kayıt. Râzî teorik bilgiye inanmazdı. Her şeyi bizzat gördüğü vakalardan yazdı. Hangi semptom hangi hıltın işareti, hangi gıda hangi mizacı ağırlaştırır, hangi bitki hangi organa etki eder... Bu soruların cevapları el-Hâvî'de, on ikinci yüzyıldan bu yana bozulmadan duruyor.

İkinci büyük kaynağımız Tahbîzü'l-Mathûn. İbn Sînâ'nın el-Kânûn'unu on sekizinci yüzyılda Osmanlı Türkçesine aktaran ve genişleten bu eser, teorik bilgiyi Anadolu iklimine, Anadolu bitkilerine, Anadolu insanına uyarladı. Altı bin kayıtla sistemimizin Osmanlı hafızasıdır.

İbn Nefîs'in el-Şâmil'i, küçük kan dolaşımını keşfeden bir hekimin klinik gözlemleriyle dolu. İbn Rüşd'ün el-Külliyyât'ı her hastalığı mantık süzgecinden geçirir. İbn Beytâr'ın el-Câmi'i bitkiyi laboratuvarda değil, Endülüs'ten Semerkand'a uzanan seyahatlerde tanır. Zehravî'nin et-Tasrîf'i dozajı ve uygulamayı pratik bir kesinlikle belirler. Galenos külliyatı İslam tıbbının dayandığı Antik Yunan temelini taşır. el-Mecûsî'nin Kâmilü's-Sınâa'sı ise İbn Sînâ'dan önce tıbbı bir bütün olarak kavramaya çalışan bir zihnin ürünü.

Siz formu doldururken bu metinler sessizce devreye girer. Şikayetinizin izini sürer, mizacınızla örtüşen bölümleri bulur, size has bir tablo çizer. Danışmanınız bu tabloyu alır; hangi hıltın baskın olduğunu, hangi organın zorlandığını, hangi bitkinin dengeyi yeniden kuracağını okur. Sonra o bilgiyi size özel bir protokole dönüştürür.

Asırlık bilgelik ile insani dikkat, ikisi bir arada.`,
  },
]

const STEPS = [
  { num: '1', title: 'Formu Doldurun', desc: 'Şikayetlerinizi, yaşam alışkanlıklarınızı ve sağlık geçmişinizi kısa bir formla iletin. Üye olmadan başlayabilirsiniz.' },
  { num: '2', title: 'Danışmana İletilir', desc: 'Formunuz danışmanınıza iletilir. Klasik İslam tıbbı kaynakları ile analiz edilir, size özel protokol hazırlanır.' },
  { num: '3', title: 'WhatsApp ile Ulaşır', desc: '24-48 saat içinde danışmanınız WhatsApp üzerinden size ulaşır. Bitkisel protokolünüz ve sorularınız yanıtlanır.' },
]

const PLANS = [
  { id: 'monthly', name: 'Aylık', price: '690₺', period: '/ay', sub: 'günde 23₺', badge: null },
  { id: 'yearly', name: 'Yıllık', price: '390₺', period: '/ay', sub: '%43 indirim · günde 13₺', badge: 'EN AVANTAJLI' },
  { id: 'one_time', name: 'Tek Seferlik', price: '990₺', period: '', sub: '1 analiz + sonuç', badge: null },
]

export default function LandingPage() {
  const [langOpen, setLangOpen] = useState(false)
  const [currentLang, setCurrentLang] = useState(LANGS[0])
  const [aktifKart, setAktifKart] = useState<number | null>(null)
  const [user, setUser] = useState<{email?: string} | null>(null)
  const router = useRouter()
  const supabase = createClient()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { supabase.auth.getUser().then(({ data }) => setUser(data.user)) }, [])

  return (
    <div style={{ fontFamily: garamond.style.fontFamily, color: COLORS.dark, margin: 0 }}>

      {/* ===== HEADER ===== */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        backgroundColor: COLORS.primary,
        padding: '0 24px',
        height: 72,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <svg width="48" height="48" viewBox="0 0 64 64" fill="none">
            <ellipse cx="32" cy="37" rx="13" ry="11" fill="none" stroke="#C9A84C" strokeWidth="1.5"/>
            <path d="M22 37 Q22 25 32 23 Q42 25 42 37" fill="none" stroke="#C9A84C" strokeWidth="1.5"/>
            <rect x="28" y="21" width="8" height="4" rx="1.5" fill="none" stroke="#C9A84C" strokeWidth="1.5"/>
            <path d="M32 14 Q36 10 40 12 Q38 18 32 20 Q26 18 24 12 Q28 10 32 14Z" fill="#C9A84C"/>
            <path d="M32 38 Q28.5 42 32 45.5 Q35.5 42 32 38Z" fill="#C9A84C" opacity="0.8"/>
            <circle cx="32" cy="32" r="2.8" fill="#EF5350"/>
            <circle cx="26.5" cy="34" r="2" fill="#FF7043"/>
            <circle cx="37.5" cy="34" r="2" fill="#42A5F5"/>
            <circle cx="32" cy="38.5" r="1.8" fill="#AB47BC"/>
          </svg>
          <div>
            <span style={{
              fontFamily: cinzel.style.fontFamily,
              color: COLORS.gold,
              fontSize: 18,
              fontWeight: 600,
              letterSpacing: 4,
              display: 'block',
            }}>
              İPEK YOLU ŞİFACISI
            </span>
            <span style={{
              fontFamily: naskh.style.fontFamily,
              color: COLORS.gold,
              fontSize: 10,
              opacity: 0.7,
              display: 'block',
              marginTop: 2,
            }}>
              طريق الحرير الشافي
            </span>
          </div>
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Lang Selector */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setLangOpen(!langOpen)}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 8,
                padding: '6px 12px',
                color: '#fff',
                cursor: 'pointer',
                fontSize: 14,
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              {currentLang.flag} {currentLang.code}
              <span style={{ fontSize: 10 }}>▼</span>
            </button>
            {langOpen && (
              <div style={{
                position: 'absolute', top: 40, right: 0,
                backgroundColor: '#fff',
                borderRadius: 8,
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                overflow: 'hidden',
                minWidth: 120,
              }}>
                {LANGS.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setCurrentLang(lang); setLangOpen(false)
                      window.location.href = lang.code === 'TR' ? '/' : '/' + lang.code.toLowerCase()
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '10px 16px',
                      width: '100%',
                      border: 'none',
                      background: currentLang.code === lang.code ? COLORS.cream : '#fff',
                      cursor: 'pointer',
                      fontSize: 14,
                      color: COLORS.dark,
                    }}
                  >
                    {lang.flag} {lang.code}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Auth Button */}
          <div style={{ display: 'flex', gap: 8 }}>
            {user ? (
              <button onClick={() => router.push('/dashboard')}
                style={{ backgroundColor: COLORS.gold, color: COLORS.primary, border: 'none', borderRadius: 8, padding: '8px 16px', fontFamily: cinzel.style.fontFamily, fontSize: 12, fontWeight: 600, letterSpacing: 1, cursor: 'pointer' }}>
                Panel
              </button>
            ) : (
              <button onClick={() => router.push('/login')}
                style={{ backgroundColor: COLORS.gold, color: COLORS.primary, border: 'none', borderRadius: 8, padding: '8px 16px', fontFamily: cinzel.style.fontFamily, fontSize: 12, fontWeight: 600, letterSpacing: 1, cursor: 'pointer' }}>
                Giriş Yap
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ===== HERO ===== */}
      <section style={{
        backgroundColor: COLORS.cream,
        padding: '80px 24px',
        textAlign: 'center',
        minHeight: '70vh',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        {/* Badge */}
        <div style={{
          display: 'inline-block',
          backgroundColor: 'rgba(27,67,50,0.08)',
          border: '1px solid rgba(27,67,50,0.15)',
          borderRadius: 24,
          padding: '8px 20px',
          marginBottom: 32,
          fontSize: 13,
          color: COLORS.secondary,
          letterSpacing: 1,
        }}>
          {"İbn Sînâ · el-Kânûn fi't-Tıbb · Tahbîzü'l-Mathûn · İbn Beytâr"}
        </div>

        {/* Main Title */}
        <h1 style={{
          fontFamily: cinzel.style.fontFamily,
          fontSize: 'clamp(36px, 6vw, 64px)',
          fontWeight: 600,
          color: COLORS.primary,
          margin: '0 0 20px 0',
          lineHeight: 1.1,
          letterSpacing: 2,
        }}>
          İpek Yolu Şifacısı
        </h1>

        {/* Subtitle */}
        <p style={{
          fontFamily: garamond.style.fontFamily,
          fontStyle: 'italic',
          fontSize: 'clamp(18px, 2.5vw, 24px)',
          color: COLORS.secondary,
          maxWidth: 600,
          margin: '0 auto 16px auto',
          lineHeight: 1.6,
        }}>
          Vücudunuzun dilini anlıyoruz. Bin yıllık İslam tıbbı geleneğiyle hazırlanmış, size özel sağlık danışmanlığı.
        </p>

        {/* Arabic Text */}
        <p style={{
          fontFamily: naskh.style.fontFamily,
          fontSize: 'clamp(20px, 3vw, 28px)',
          color: COLORS.gold,
          margin: '0 0 40px 0',
          direction: 'rtl',
        }}>
          طريق الحرير الشافي
        </p>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => router.push('/analiz')}
            style={{
              backgroundColor: COLORS.primary,
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              padding: '16px 36px',
              fontFamily: cinzel.style.fontFamily,
              fontWeight: 600,
              fontSize: 16,
              cursor: 'pointer',
              letterSpacing: 1,
              transition: 'transform 0.2s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseOut={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            Ücretsiz Analizi Başlat
          </button>
          <button
            onClick={() => {
              document.getElementById('nasil-calisir')?.scrollIntoView({ behavior: 'smooth' })
            }}
            style={{
              backgroundColor: 'transparent',
              color: COLORS.primary,
              border: `2px solid ${COLORS.primary}`,
              borderRadius: 12,
              padding: '14px 36px',
              fontFamily: cinzel.style.fontFamily,
              fontWeight: 500,
              fontSize: 16,
              cursor: 'pointer',
              letterSpacing: 1,
            }}
          >
            Nasıl Çalışır?
          </button>
        </div>
      </section>

      {/* ===== ÖZELLİKLER ===== */}
      <section style={{
        backgroundColor: COLORS.white,
        padding: '80px 24px',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{
            fontFamily: cinzel.style.fontFamily,
            fontSize: 'clamp(24px, 4vw, 36px)',
            fontWeight: 600,
            color: COLORS.primary,
            textAlign: 'center',
            marginBottom: 12,
          }}>
            Neden İpek Yolu Şifacısı?
          </h2>
          <p style={{
            textAlign: 'center',
            color: COLORS.secondary,
            fontSize: 16,
            marginBottom: 48,
            fontStyle: 'italic',
          }}>
            {"Modern tıbbın çözemediği yerde, bin yıllık bilgelik devreye girer."}
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 24,
          }}>
            {FEATURES.map((f, i) => (
              <div key={i} onClick={() => setAktifKart(i)} style={{
                backgroundColor: COLORS.cream,
                borderRadius: 16,
                padding: 32,
                borderTop: `3px solid ${COLORS.gold}`,
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer',
              }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <div style={{ fontSize: 40, marginBottom: 16 }}>{f.icon}</div>
                <h3 style={{
                  fontFamily: cinzel.style.fontFamily,
                  fontSize: 18,
                  fontWeight: 600,
                  color: COLORS.primary,
                  marginBottom: 12,
                }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: 14, color: COLORS.secondary, lineHeight: 1.7 }}>
                  {f.desc}
                </p>
                <div style={{ marginTop: 16, fontSize: 13, color: COLORS.gold, fontWeight: 600, cursor: 'pointer' }}>
                  Daha Fazla Oku →
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== NASIL ÇALIŞIR ===== */}
      <section id="nasil-calisir" style={{
        backgroundColor: COLORS.cream,
        padding: '80px 24px',
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{
            fontFamily: cinzel.style.fontFamily,
            fontSize: 'clamp(24px, 4vw, 36px)',
            fontWeight: 600,
            color: COLORS.primary,
            textAlign: 'center',
            marginBottom: 48,
          }}>
            Nasıl Çalışır?
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 32,
          }}>
            {STEPS.map((s) => (
              <div key={s.num} style={{ textAlign: 'center' }}>
                <div style={{
                  width: 64, height: 64,
                  borderRadius: '50%',
                  backgroundColor: COLORS.primary,
                  color: COLORS.gold,
                  fontFamily: cinzel.style.fontFamily,
                  fontSize: 28,
                  fontWeight: 600,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 20px auto',
                }}>
                  {s.num}
                </div>
                <h3 style={{
                  fontFamily: cinzel.style.fontFamily,
                  fontSize: 18,
                  fontWeight: 600,
                  color: COLORS.primary,
                  marginBottom: 8,
                }}>
                  {s.title}
                </h3>
                <p style={{ fontSize: 15, color: COLORS.secondary, lineHeight: 1.6 }}>
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FİYATLANDIRMA ===== */}
      <section style={{
        backgroundColor: COLORS.white,
        padding: '80px 24px',
      }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <h2 style={{
            fontFamily: cinzel.style.fontFamily,
            fontSize: 'clamp(24px, 4vw, 36px)',
            fontWeight: 600,
            color: COLORS.primary,
            textAlign: 'center',
            marginBottom: 12,
          }}>
            Size Uygun Planı Seçin
          </h2>
          <p style={{
            textAlign: 'center',
            color: COLORS.secondary,
            fontSize: 16,
            marginBottom: 48,
            fontStyle: 'italic',
          }}>
            {"İlk analizden sonra fark yaşarsınız. Yıllık planda aylık 390₺ ile sınırsız takip."}
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 24,
          }}>
            {PLANS.map((plan) => (
              <div key={plan.id} style={{
                backgroundColor: plan.badge ? COLORS.primary : COLORS.cream,
                borderRadius: 20,
                padding: 36,
                textAlign: 'center',
                position: 'relative',
                border: plan.badge ? 'none' : '1px solid rgba(27,67,50,0.1)',
                transition: 'transform 0.2s',
              }}
                onMouseOver={(e) => (e.currentTarget.style.transform = 'translateY(-4px)')}
                onMouseOut={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                {plan.badge && (
                  <div style={{
                    position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
                    backgroundColor: COLORS.gold,
                    color: COLORS.primary,
                    fontFamily: cinzel.style.fontFamily,
                    fontSize: 11,
                    fontWeight: 600,
                    padding: '6px 16px',
                    borderRadius: 20,
                    letterSpacing: 1,
                    whiteSpace: 'nowrap',
                  }}>
                    {plan.badge}
                  </div>
                )}

                <h3 style={{
                  fontFamily: cinzel.style.fontFamily,
                  fontSize: 20,
                  fontWeight: 600,
                  color: plan.badge ? COLORS.gold : COLORS.primary,
                  marginBottom: 16,
                }}>
                  {plan.name}
                </h3>

                <div style={{
                  fontSize: 42,
                  fontWeight: 600,
                  color: plan.badge ? '#fff' : COLORS.primary,
                  fontFamily: cinzel.style.fontFamily,
                }}>
                  {plan.price}
                  <span style={{ fontSize: 16, fontWeight: 400 }}>{plan.period}</span>
                </div>

                <p style={{
                  fontSize: 14,
                  color: plan.badge ? 'rgba(255,255,255,0.7)' : COLORS.secondary,
                  margin: '12px 0 24px 0',
                }}>
                  {plan.sub}
                </p>

                <button
                  onClick={() => router.push(`/register?plan=${plan.id}`)}
                  style={{
                    width: '100%',
                    padding: '14px 0',
                    borderRadius: 10,
                    border: plan.badge ? `2px solid ${COLORS.gold}` : `2px solid ${COLORS.primary}`,
                    backgroundColor: plan.badge ? COLORS.gold : 'transparent',
                    color: plan.badge ? COLORS.primary : COLORS.primary,
                    fontFamily: cinzel.style.fontFamily,
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: 'pointer',
                    letterSpacing: 1,
                  }}
                >
                  Üye Ol
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer style={{
        backgroundColor: COLORS.primary,
        padding: '48px 24px',
        color: 'rgba(255,255,255,0.7)',
      }}>
        <div style={{
          maxWidth: 1100, margin: '0 auto',
          display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: 32,
        }}>
          {/* Logo + desc */}
          <div style={{ maxWidth: 360 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <svg width="28" height="28" viewBox="0 0 64 64" fill="none">
                <ellipse cx="32" cy="37" rx="13" ry="11" fill="none" stroke="#C9A84C" strokeWidth="1.5"/>
                <path d="M22 37 Q22 25 32 23 Q42 25 42 37" fill="none" stroke="#C9A84C" strokeWidth="1.5"/>
                <rect x="28" y="21" width="8" height="4" rx="1.5" fill="none" stroke="#C9A84C" strokeWidth="1.5"/>
                <path d="M32 14 Q36 10 40 12 Q38 18 32 20 Q26 18 24 12 Q28 10 32 14Z" fill="#C9A84C"/>
                <path d="M32 38 Q28.5 42 32 45.5 Q35.5 42 32 38Z" fill="#C9A84C" opacity="0.8"/>
                <circle cx="32" cy="32" r="2.8" fill="#EF5350"/>
                <circle cx="26.5" cy="34" r="2" fill="#FF7043"/>
                <circle cx="37.5" cy="34" r="2" fill="#42A5F5"/>
                <circle cx="32" cy="38.5" r="1.8" fill="#AB47BC"/>
              </svg>
              <span style={{
                fontFamily: cinzel.style.fontFamily,
                color: COLORS.gold,
                fontSize: 14,
                fontWeight: 600,
                letterSpacing: 2,
              }}>
                İPEK YOLU ŞİFACISI
              </span>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.7 }}>
              {"İbn Sînâ'nın el-Kânûn'undan süzülüp gelen bilgelikle, size özel sağlık danışmanlığı. Yapay zeka ile güçlendirilmiş, uzman denetimli klasik tıp."}
            </p>
          </div>

          {/* Links */}
          <div style={{ display: 'flex', gap: 48, flexWrap: 'wrap' }}>
            <div>
              <h4 style={{
                fontFamily: cinzel.style.fontFamily,
                color: COLORS.gold,
                fontSize: 13,
                fontWeight: 600,
                marginBottom: 16,
                letterSpacing: 1,
              }}>
                YASAL
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14 }}>
                <a href="/kvkk" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>KVKK Aydınlatma Metni</a>
                <a href="#" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Gizlilik Politikası</a>
                <a href="#" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Kullanım Koşulları</a>
              </div>
            </div>
            <div>
              <h4 style={{
                fontFamily: cinzel.style.fontFamily,
                color: COLORS.gold,
                fontSize: 13,
                fontWeight: 600,
                marginBottom: 16,
                letterSpacing: 1,
              }}>
                İLETİŞİM
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14 }}>
                <span>info@ipekyolusicifacisi.com</span>
                <span>WhatsApp Destek</span>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div style={{
          maxWidth: 1100, margin: '32px auto 0 auto',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          paddingTop: 24,
          textAlign: 'center',
          fontSize: 13,
        }}>
          © 2026 İpek Yolu Şifacısı. Tüm hakları saklıdır.
        </div>
      </footer>

      {/* ===== DETAY MODAL ===== */}
      {aktifKart !== null && (
        <div
          onClick={() => setAktifKart(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#fff',
              borderRadius: 20,
              maxWidth: 720,
              width: '100%',
              maxHeight: '85vh',
              overflowY: 'auto',
              padding: '40px 48px',
              position: 'relative',
            }}
          >
            <button
              onClick={() => setAktifKart(null)}
              style={{
                position: 'absolute', top: 20, right: 24,
                background: 'none', border: 'none',
                fontSize: 24, cursor: 'pointer', color: '#5C4A2A',
                lineHeight: 1,
              }}
            >
              ✕
            </button>
            <div style={{ fontSize: 48, marginBottom: 16 }}>
              {FEATURES[aktifKart].icon}
            </div>
            <h2 style={{
              fontFamily: cinzel.style.fontFamily,
              fontSize: 28, fontWeight: 600,
              color: '#1B4332', marginBottom: 24,
            }}>
              {FEATURES[aktifKart].title}
            </h2>
            <div style={{
              fontFamily: garamond.style.fontFamily,
              fontSize: 17, lineHeight: 1.85,
              color: '#2C1A00',
              whiteSpace: 'pre-line',
            }}>
              {FEATURES[aktifKart].detay
                .split('\n')
                .map((line, i) => {
                  if (line.startsWith('## ')) {
                    return <h2 key={i} style={{ fontFamily: cinzel.style.fontFamily, fontSize: 22, color: '#1B4332', margin: '0 0 16px 0', fontWeight: 600 }}>{line.replace('## ', '')}</h2>
                  }
                  if (line.startsWith('### ')) {
                    return <h3 key={i} style={{ fontFamily: cinzel.style.fontFamily, fontSize: 17, color: '#C9A84C', margin: '24px 0 10px 0', fontWeight: 600 }}>{line.replace('### ', '')}</h3>
                  }
                  if (line.startsWith('- ')) {
                    return <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 6 }}><span style={{ color: '#C9A84C', flexShrink: 0 }}>•</span><span>{line.replace('- ', '')}</span></div>
                  }
                  if (line.startsWith('**') && line.endsWith('**')) {
                    return <p key={i} style={{ fontWeight: 700, color: '#1B4332', margin: '12px 0 4px 0' }}>{line.replace(/\*\*/g, '')}</p>
                  }
                  if (line.trim() === '') {
                    return <div key={i} style={{ height: 10 }} />
                  }
                  return <p key={i} style={{ margin: '0 0 12px 0' }}>{line}</p>
                })
              }
            </div>
            <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid #F0E8DC' }}>
              <button
                onClick={() => { setAktifKart(null); router.push('/register') }}
                style={{
                  backgroundColor: '#1B4332', color: '#fff',
                  border: 'none', borderRadius: 10,
                  padding: '14px 32px',
                  fontFamily: cinzel.style.fontFamily,
                  fontWeight: 600, fontSize: 15,
                  cursor: 'pointer', letterSpacing: 1,
                }}
              >
                Ücretsiz Analizi Başlat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
