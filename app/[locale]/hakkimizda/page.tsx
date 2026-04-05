'use client'
import { useRouter } from 'next/navigation'
import { Cinzel, EB_Garamond } from 'next/font/google'
import Header from '../components/Header'
import Footer from '../components/Footer'

const cinzel = Cinzel({ display: 'swap', preload: false, subsets: ['latin', 'latin-ext'], weight: ['400', '500', '600'] })
const garamond = EB_Garamond({ display: 'swap', preload: false, subsets: ['latin', 'latin-ext'], weight: ['400', '500'], style: ['normal', 'italic'] })

const C = { primary: '#1C3A26', gold: '#B8860B', cream: '#FAF6EF', secondary: '#6B5744', border: '#DEB887', white: '#FFFFFF', surface: '#FAF6EF' }

const KAYNAKLAR: { ad: string; ozel?: string }[] = [
  { ad: 'el-Havi fit-Tib — er-Râzî (Cilt 1-5, 8.348 kayit)' },
  { ad: 'Tahbizul-Mathun — Tokadi Mustafa Efendi (6.076 kayit)' },
  { ad: 'el-Samil fis-Sinaatit-Tibbiyye — İbn Nefîs (Cilt 1, 1.368 kayit)' },
  { ad: 'Takasimul-Ilel — er-Râzî (1.000 kayit)' },
  { ad: 'et-Tasrif — ez-Zehravi (998 kayit)' },
  { ad: 'el-Cami li-Mufredatil-Edviye — Ibn Baytar (798 kayit)' },
  { ad: 'el-Kulliyyat fit-Tib — İbn Rüşd (637 kayit)' },
  { ad: 'el-Mucez fit-Tib — İbn Nefîs (492 kayit)' },
  { ad: 'et-Teysir — İbn Zühr (415 kayit)' },
  { ad: 'Kamilus-Sinaatit-Tibbiyye — el-Mecusi (401 kayit)' },
  { ad: 'Mecmua-i Semaniye — Galenos / Huneyn (374 kayit)' },
  { ad: 'ez-Zahire fit-Tib — Sabit b. Kurre (272 kayit)' },
  { ad: 'el-Mesail fit-Tib — Huneyn b. Ishak (256 kayit)' },
  { ad: 'Bugyetul-Muhtac — Davud el-Antaki (222 kayit)' },
  { ad: 'Mesalihul-Ebdan vel-Enfus — Belhi (189 kayit)' },
  { ad: 'Aynul-Hayat — el-Herevi (118 kayit)' },
  { ad: 'Bahrul-Cevahir fit-Tib — el-Herevi (105 kayit)' },
  { ad: 'el-Agziye — İbn Zühr (91 kayit)' },
  { ad: 'el-Kânûn fit-Tib — İbn Sînâ (Cilt 1-5)' },
  { ad: 'el-Havi fit-Tib — er-Râzî (Cilt 6-10)' },
  { ad: 'el-Havi fit-Tib — er-Râzî (Cilt 11-15)' },
  { ad: 'el-Havi fit-Tib — er-Râzî (Cilt 16-20)' },
  { ad: 'el-Mansuri fit-Tib — er-Râzî' },
  { ad: 'el-Medhal ila Sinaatit-Tib — er-Râzî' },
  { ad: 'Takasimul-Ilel — er-Râzî (ek ciltler)' },
  { ad: 'el-Samil fis-Sinaatit-Tibbiyye — İbn Nefîs (Cilt 2-5)' },
  { ad: 'el-Samil fis-Sinaatit-Tibbiyye — İbn Nefîs (Cilt 6-10)' },
  { ad: 'el-Samil fis-Sinaatit-Tibbiyye — İbn Nefîs (Cilt 11-15)' },
  { ad: 'el-Samil fis-Sinaatit-Tibbiyye — İbn Nefîs (Cilt 16-20)' },
  { ad: 'Serhu Fusuli Buqrat — İbn Nefîs' },
  { ad: 'el-Muhtar fit-Tib — İbn Nefîs' },
  { ad: 'el-Mucez fit-Tib — İbn Nefîs (ek ciltler)' },
  { ad: 'Bugyetul-Muhtac — Davud el-Antaki (ek bolumler)' },
  { ad: 'Tuhfetul-Muminin — Mumin Huseyni' },
  { ad: 'Minhacul-Beyan — Ibn Cezle' },
  { ad: 'el-Camiul-Kebir — Seyyid Ismail Curcani' },
  { ad: 'Zehiretul-Huruf — el-Herevi (ek ciltler)' },
  { ad: 'Seceretut-Tib — Hekim Ahmet el-Hayati', ozel: '(Ilk kez akademik duzeyde incelenen eser)' },
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
          {"İpek Yolu Şifacısı, klasik İslam ve Osmanlı tıbbının bin yıllık birikimini modern dijital danışmanlıkla buluşturan bir sağlık platformudur."}
        </p>

        {/* MİSYON */}
        <div style={{ marginBottom: 36 }}>
          <h2 style={{ fontFamily: cinzel.style.fontFamily, fontSize: 18, color: C.gold, marginBottom: 12, letterSpacing: 2 }}>{"MİSYON"}</h2>
          <p style={{ fontSize: 15, color: C.secondary, lineHeight: 1.8 }}>
            {"Klasik İslam tıbbının asırlık gözlem ve tedavi birikimini, yapay zeka destekli analiz ile birleştirerek kişiye özel sağlık danışmanlığı sunmak. Her bireyin fıtrî mizacını anlamak ve hâlî dengesizlikleri kaynağında tespit etmek."}
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
            {"Analizlerimiz 38 klasik İslam ve Osmanlı tıbbı eserinden derlenen dijitalleştirilmiş bilgi tabanına dayanır. Yapay zeka (Claude) bu kaynaklardan ilgili bölümleri bulur ve eşleştirir; ancak nihai karar her zaman danışman tarafından verilir. Kaynak gösterilemeyen hiçbir öneri sunulmaz."}
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
              <p style={{ marginBottom: 12 }}>{"Kocaeli Üniversitesi Tıp Tarihi yüksek lisansı. FSM Vakıf Üniversitesi İslam Bilim Tarihi doktora programı öğrencisi."}</p>
              <p style={{ marginBottom: 12 }}>{"Osmanlı Türkçesi ve Arapça bilgisiyle birincil kaynaklara doğrudan erişen, Tahbîzü'l-Mathûn üzerinde Türkiye'deki ilk kapsamlı akademik çalışmaları yürüten isimdir."}</p>
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
