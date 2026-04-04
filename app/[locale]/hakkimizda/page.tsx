'use client'
import { useRouter } from 'next/navigation'
import { Cinzel, EB_Garamond } from 'next/font/google'

const cinzel = Cinzel({ subsets: ['latin'], weight: ['400', '500', '600'] })
const garamond = EB_Garamond({ subsets: ['latin'], weight: ['400', '500'], style: ['normal', 'italic'] })

const C = { primary: '#1B4332', gold: '#C9A84C', cream: '#F5EFE6', secondary: '#5C4A2A', border: '#E0D5C5', white: '#FFFFFF', surface: '#FAF7F2' }

const KAYNAKLAR = [
  'el-Havi fit-Tib — er-Razi (8.348 kayit)',
  'Tahbizul-Mathun — Tokadi Mustafa Efendi (6.076 kayit)',
  'el-Samil fis-Sinaatit-Tibbiyye — Ibn Nefis (1.368 kayit)',
  'Takasimul-Ilel — er-Razi (1.000 kayit)',
  'et-Tasrif — ez-Zehravi (998 kayit)',
  'el-Cami li-Mufredatil-Edviye — Ibn Baytar (798 kayit)',
  'el-Kulliyyat fit-Tib — Ibn Rusd (637 kayit)',
  'el-Mucez fit-Tib — Ibn Nefis (492 kayit)',
  'et-Teysir — Ibn Zuhr (415 kayit)',
  'Kamilus-Sinaatit-Tibbiyye — el-Mecusi (401 kayit)',
  'Mecmua-i Semaniye — Galenos / Huneyn (374 kayit)',
  'ez-Zahire fit-Tib — Sabit b. Kurre (272 kayit)',
  'el-Mesail fit-Tib — Huneyn b. Ishak (256 kayit)',
  'Bugyetul-Muhtac — Davud el-Antaki (222 kayit)',
  'Mesalihul-Ebdan vel-Enfus — Belhi (189 kayit)',
  'Aynul-Hayat — el-Herevi (118 kayit)',
  'Bahrul-Cevahir fit-Tib — el-Herevi (105 kayit)',
  'el-Agziye — Ibn Zuhr (91 kayit)',
]

export default function HakkimizdaPage() {
  const router = useRouter()
  return (
    <div style={{ background: C.cream, minHeight: '100vh', fontFamily: garamond.style.fontFamily }}>
      <header style={{ background: C.primary, padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: cinzel.style.fontFamily, color: C.gold, fontSize: 15, fontWeight: 600, letterSpacing: 3, cursor: 'pointer' }} onClick={() => router.push('/')}>{"İPEK YOLU ŞİFACISI"}</div>
        <button onClick={() => router.push('/')} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: 8, padding: '7px 14px', fontSize: 12, cursor: 'pointer' }}>Ana Sayfa</button>
      </header>

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
            {"Analizlerimiz 18 temel İslam tıbbı eserinden derlenen dijitalleştirilmiş bilgi tabanına dayanır. Yapay zeka (Claude) bu kaynaklardan ilgili bölümleri bulur ve eşleştirir; ancak nihai karar her zaman danışman tarafından verilir. Kaynak gösterilemeyen hiçbir öneri sunulmaz."}
          </p>
        </div>

        {/* 18 KLASİK ESER */}
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ fontFamily: cinzel.style.fontFamily, fontSize: 18, color: C.gold, marginBottom: 16, letterSpacing: 2 }}>{"BİLGİ TABANIMIZ — 18 KLASİK ESER"}</h2>
          <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: '20px 24px' }}>
            {KAYNAKLAR.map((k, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: i < KAYNAKLAR.length - 1 ? `1px solid ${C.border}` : 'none', alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: C.gold, fontWeight: 600, minWidth: 24 }}>{i + 1}.</span>
                <span style={{ fontSize: 13, color: C.secondary }}>{k}</span>
              </div>
            ))}
          </div>
        </div>

        {/* DANIŞMAN PROFİLİ */}
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ fontFamily: cinzel.style.fontFamily, fontSize: 18, color: C.gold, marginBottom: 16, letterSpacing: 2 }}>{"DANIŞMAN"}</h2>
          <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: '28px 32px' }}>
            <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 20, color: C.primary, marginBottom: 4 }}>{"Dr. M. Fatih Çakır"}</div>
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
      <footer style={{ background: C.primary, padding: '32px 24px', marginTop: 48, textAlign: 'center' as const }}>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>{"© 2026 İpek Yolu Şifacısı. Tüm hakları saklıdır."}</div>
      </footer>
    </div>
  )
}
