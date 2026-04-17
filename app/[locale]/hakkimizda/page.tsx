'use client'
import { useRouter } from 'next/navigation'
import { Cormorant_Garamond as Cinzel, EB_Garamond } from 'next/font/google'
import Header from '../components/Header'
import Footer from '../components/Footer'

const cinzel = Cinzel({ display: 'swap', preload: false, subsets: ['latin', 'latin-ext'], weight: ['400', '500', '600'] })
const garamond = EB_Garamond({ display: 'swap', preload: false, subsets: ['latin', 'latin-ext'], weight: ['400', '500'], style: ['normal', 'italic'] })

const C = { primary: '#1C3A26', gold: '#B8860B', cream: '#FAF6EF', secondary: '#6B5744', border: '#DEB887', white: '#FFFFFF', surface: '#FAF6EF' }

const KAYNAKLAR: { ad: string; ozel?: string }[] = [
  { ad: 'el-Hâvî fi\u2019t-Tıb — er-Râzî (Cilt 1-5, 8.348 kayıt)' },
  { ad: 'Tahbîzü\u2019l-Mathûn — Tokatlı Mustafa Efendi (6.076 kayıt)' },
  { ad: 'el-Şâmil fi\u2019s-Sınâati\u2019t-Tıbbiyye — İbn Nefîs (Cilt 1, 1.368 kayıt)' },
  { ad: 'Takâsîmü\u2019l-İlel — er-Râzî (1.000 kayıt)' },
  { ad: 'et-Tasrîf — ez-Zehrâvî (998 kayıt)' },
  { ad: 'el-Câmi\u2019 li-Müfredâti\u2019l-Edviye — İbn Beytâr (798 kayıt)' },
  { ad: 'el-Külliyyât fi\u2019t-Tıb — İbn Rüşd (637 kayıt)' },
  { ad: 'el-Mûcez fi\u2019t-Tıb — İbn Nefîs (492 kayıt)' },
  { ad: 'et-Teysîr — İbn Zühr (415 kayıt)' },
  { ad: 'Kâmilü\u2019s-Sınâati\u2019t-Tıbbiyye — el-Mecûsî (401 kayıt)' },
  { ad: 'Mecmûa-i Semâniye — Galenos / Huneyn (374 kayıt)' },
  { ad: 'ez-Zâhire fi\u2019t-Tıb — Sâbit b. Kurre (272 kayıt)' },
  { ad: 'el-Mesâil fi\u2019t-Tıb — Huneyn b. İshâk (256 kayıt)' },
  { ad: 'Buğyetü\u2019l-Muhtâc — Dâvûd el-Antâkî (222 kayıt)' },
  { ad: 'Mesâlihu\u2019l-Ebdân ve\u2019l-Enfüs — Belhî (189 kayıt)' },
  { ad: 'Aynu\u2019l-Hayât — el-Herevî (118 kayıt)' },
  { ad: 'Bahrü\u2019l-Cevâhir fi\u2019t-Tıb — el-Herevî (105 kayıt)' },
  { ad: 'el-Ağziye — İbn Zühr (91 kayıt)' },
  { ad: 'el-Kânûn fi\u2019t-Tıb — İbn Sînâ (Cilt 1-5)' },
  { ad: 'el-Hâvî fi\u2019t-Tıb — er-Râzî (Cilt 6-10)' },
  { ad: 'el-Hâvî fi\u2019t-Tıb — er-Râzî (Cilt 11-15)' },
  { ad: 'el-Hâvî fi\u2019t-Tıb — er-Râzî (Cilt 16-20)' },
  { ad: 'el-Mansûrî fi\u2019t-Tıb — er-Râzî' },
  { ad: 'el-Medhal ilâ Sınâati\u2019t-Tıb — er-Râzî' },
  { ad: 'Takâsîmü\u2019l-İlel — er-Râzî (ek ciltler)' },
  { ad: 'el-Şâmil fi\u2019s-Sınâati\u2019t-Tıbbiyye — İbn Nefîs (Cilt 2-5)' },
  { ad: 'el-Şâmil fi\u2019s-Sınâati\u2019t-Tıbbiyye — İbn Nefîs (Cilt 6-10)' },
  { ad: 'el-Şâmil fi\u2019s-Sınâati\u2019t-Tıbbiyye — İbn Nefîs (Cilt 11-15)' },
  { ad: 'el-Şâmil fi\u2019s-Sınâati\u2019t-Tıbbiyye — İbn Nefîs (Cilt 16-20)' },
  { ad: 'Şerhu Fusûli Buqrât — İbn Nefîs' },
  { ad: 'el-Muhtâr fi\u2019t-Tıb — İbn Nefîs' },
  { ad: 'el-Mûcez fi\u2019t-Tıb — İbn Nefîs (ek ciltler)' },
  { ad: 'Buğyetü\u2019l-Muhtâc — Dâvûd el-Antâkî (ek bölümler)' },
  { ad: 'Tuhfetü\u2019l-Mü\u2019minîn — Mü\u2019min Hüseynî' },
  { ad: 'Minhâcü\u2019l-Beyân — İbn Cezle' },
  { ad: 'el-Câmiü\u2019l-Kebîr — Seyyid İsmâil Cürcânî' },
  { ad: 'Zehîretü\u2019l-Hurûf — el-Herevî (ek ciltler)' },
  { ad: 'Şeceretü\u2019t-Tıb — Hekim Ahmet el-Hayâtî', ozel: '(İlk kez akademik düzeyde incelenen eser)' },
]

export default function HakkimizdaPage() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
const router = useRouter()
  return (
    <div style={{ background: C.cream, minHeight: '100vh', fontFamily: garamond.style.fontFamily }}>
      <Header />

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px' }}>
        <h1 style={{ fontFamily: cinzel.style.fontFamily, fontSize: 32, color: C.primary, marginBottom: 16, fontWeight: 500 }}>{"Hakkımızda"}</h1>
        <p style={{ fontSize: 17, color: C.secondary, lineHeight: 1.8, fontStyle: 'italic', marginBottom: 40 }}>
          {"İpek Yolu Şifacısı, klasik İslam ve Osmanlı tıbbının bin yıllık birikimini modern dijital danışmanlıkla buluşturan bir klasik tıp danışmanlık platformudur."}
        </p>

        {/* MİSYON */}
        <div style={{ marginBottom: 36 }}>
          <h2 style={{ fontFamily: cinzel.style.fontFamily, fontSize: 18, color: C.gold, marginBottom: 12, letterSpacing: 2 }}>{"MİSYON"}</h2>
          <p style={{ fontSize: 15, color: C.secondary, lineHeight: 1.8 }}>
            {"Klasik İslam tıbbının asırlık gözlem ve tedavi birikimini, modern derleme yöntemleriyle birleştirerek kişiye özel mizaç danışmanlığı sunmak. Her bireyin fıtrî mizacını anlamak ve hâlî dengesizlikleri kaynağında tespit etmek."}
          </p>
        </div>

        {/* VİZYON */}
        <div style={{ marginBottom: 36 }}>
          <h2 style={{ fontFamily: cinzel.style.fontFamily, fontSize: 18, color: C.gold, marginBottom: 12, letterSpacing: 2 }}>{"VİZYON"}</h2>
          <p style={{ fontSize: 15, color: C.secondary, lineHeight: 1.8 }}>
            {"Geleneksel tıp bilgisini dijital çağa taşıyan, akademik titizlikle çalışan, uydurma bilgiye yer vermeyen bir referans platformu olmak. Her önerinin arkasında somut bir klasik kaynak bulunmasını sağlamak."}
          </p>
        </div>

        {/* YAKLAŞIM */}
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ fontFamily: cinzel.style.fontFamily, fontSize: 18, color: C.gold, marginBottom: 12, letterSpacing: 2 }}>{"YAKLAŞIM"}</h2>
          <p style={{ fontSize: 15, color: C.secondary, lineHeight: 1.8 }}>
            {"Analizlerimiz 38 klasik İslam ve Osmanlı tıbbı eserinden derlenen dijitalleştirilmiş bilgi tabanına dayanır. Sistemimiz bu kaynaklardan ilgili bölümleri bulur ve eşleştirir; ancak nihai karar her zaman danışman tarafından verilir. Kaynak gösterilemeyen hiçbir öneri sunulmaz."}
          </p>
        </div>

        {/* 18 KLASİK ESER */}
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ fontFamily: cinzel.style.fontFamily, fontSize: 18, color: C.gold, marginBottom: 16, letterSpacing: 2 }}>{"BİLGİ TABANIMIZ — 38 KLASİK ESER"}</h2>
          <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: '20px 24px' }}>
            {KAYNAKLAR.map((k, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: i < KAYNAKLAR.length - 1 ? `1px solid ${C.border}` : 'none', alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: C.gold, fontWeight: 600, minWidth: 28 }}>{i + 1}.</span>
                <span style={{ fontSize: 13, color: C.secondary }}>
                  {k.ad}
                  {k.ozel && <span style={{ fontSize: 11, color: C.gold, fontStyle: 'italic', marginLeft: 8 }}>{k.ozel}</span>}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* DANIŞMAN PROFİLİ */}
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ fontFamily: cinzel.style.fontFamily, fontSize: 18, color: C.gold, marginBottom: 16, letterSpacing: 2 }}>{"DANIŞMAN"}</h2>
          <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: '28px 32px' }}>
            <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 20, color: C.primary, marginBottom: 4 }}>{"M. Fatih Çakır"}</div>
            <div style={{ fontSize: 13, color: C.gold, marginBottom: 16, fontStyle: 'italic' }}>{"Klasik İslam Tıbbı Araştırmacısı"}</div>
            <div style={{ fontSize: 14, color: C.secondary, lineHeight: 1.8 }}>
              <p style={{ marginBottom: 12 }}>{"Kocaeli Üniversitesi İslam Tarihi yüksek lisansı. FSM Vakıf Üniversitesi İslam Bilim Tarihi doktora programı öğrencisi."}</p>
              <p style={{ marginBottom: 12 }}>{"Osmanlı Türkçesi, Arapça ve Farsça bilgisiyle birincil kaynaklara doğrudan erişen, Hekim Ahmet el-Hayâtî'nin Şeceretü't-Tıb adlı yazma eserini ilk kez akademik düzeyde inceleyen araştırmacı."}</p>
              <p>{"Sistemin bilgi tabanının dijitalleştirilmesi, kaynak doğrulama ve analiz algoritmasının geliştirilmesi süreçlerini bizzat yönetmektedir."}</p>
            </div>
          </div>
        </div>

        {/* UYARI */}
        <div style={{ background: '#FFF8E7', border: `1px solid ${C.gold}`, borderRadius: 10, padding: '14px 18px', fontSize: 13, color: C.secondary, lineHeight: 1.7 }}>
          {"Bu platform klasik İslam tıbbı geleneğine dayalı danışmanlık hizmeti sunmaktadır. Modern tıbbın tanı ve tedavilerinin yerini tutmaz. Ciddi sağlık sorunlarında mutlaka uzman hekime başvurunuz."}
        </div>
      </div>

      {/* FOOTER */}
      <Footer />
    </div>
  )
}
