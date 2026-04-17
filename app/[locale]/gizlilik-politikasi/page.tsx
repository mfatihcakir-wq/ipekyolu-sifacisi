'use client'
import { Cormorant_Garamond as Cinzel, EB_Garamond } from 'next/font/google'
import Header from '../components/Header'
import Footer from '../components/Footer'

const cinzel = Cinzel({ display: 'swap', preload: false, subsets: ['latin', 'latin-ext'], weight: ['400', '500', '600'] })
const garamond = EB_Garamond({ display: 'swap', preload: false, subsets: ['latin', 'latin-ext'], weight: ['400', '500'], style: ['normal', 'italic'] })

const C = { primary: '#1C3A26', gold: '#B8860B', cream: '#FAF6EF', secondary: '#6B5744', border: '#DEB887', white: '#FFFFFF' }

const h2Style = { fontFamily: cinzel.style.fontFamily, fontSize: 16, color: C.primary, marginBottom: 10, fontWeight: 500 as const }
const pStyle = { fontSize: 14, color: C.secondary, lineHeight: 1.8, marginBottom: 10 }
const ulStyle = { fontSize: 14, color: C.secondary, lineHeight: 1.8, marginBottom: 10, paddingLeft: 22 }

export default function GizlilikPage() {
  return (
    <div style={{ background: C.cream, minHeight: '100vh', fontFamily: garamond.style.fontFamily }}>
      <Header />

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px' }}>
        <h1 style={{ fontFamily: cinzel.style.fontFamily, fontSize: 28, color: C.primary, marginBottom: 8, fontWeight: 500 }}>{"Gizlilik Politikası"}</h1>
        <p style={{ fontSize: 13, color: '#999', marginBottom: 32 }}>{"Son güncelleme: Nisan 2026"}</p>

        <div style={{ marginBottom: 28 }}>
          <h2 style={h2Style}>{"1. Genel"}</h2>
          <p style={pStyle}>{"Bu gizlilik politikası, ipekyolusifacisi.com adresinde sunulan hizmetlerin kullanıcılarına ait kişisel verilerin nasıl toplandığı, işlendiği ve korunduğunu açıklamak amacıyla hazırlanmıştır. Ayrıntılı aydınlatma metni için "}<a href="/kvkk" style={{ color: C.primary, textDecoration: 'underline' }}>{"KVKK Aydınlatma Metni"}</a>{" sayfasına bakınız."}</p>
        </div>

        <div style={{ marginBottom: 28 }}>
          <h2 style={h2Style}>{"2. Toplanan Veriler"}</h2>
          <p style={pStyle}>{"Platformumuzda aşağıdaki veriler toplanır:"}</p>
          <ul style={ulStyle}>
            <li>{"ad ve soyad"}</li>
            <li>{"telefon numarası (WhatsApp iletişimi için)"}</li>
            <li>{"e-posta adresi"}</li>
            <li>{"yaş grubu, cinsiyet"}</li>
            <li>{"sağlık şikayetleri ve semptomlar"}</li>
            <li>{"yaşam tarzı bilgileri (uyku, beslenme, egzersiz)"}</li>
            <li>{"nabız ve fiziksel gözlem verileri"}</li>
            <li>{"isteğe bağlı laboratuvar değerleri"}</li>
            <li>{"fıtrî mizaç bilgileri"}</li>
          </ul>
        </div>

        <div style={{ marginBottom: 28 }}>
          <h2 style={h2Style}>{"3. Kullanım Amacı"}</h2>
          <p style={pStyle}>{"Toplanan veriler yalnızca şu amaçlarla kullanılır:"}</p>
          <ul style={ulStyle}>
            <li>{"klasik İslam tıbbı geleneğine dayalı kişisel danışmanlık sunmak"}</li>
            <li>{"danışmanınızın size özel bilgi rehberi hazırlaması"}</li>
            <li>{"WhatsApp üzerinden iletişim kurulması"}</li>
            <li>{"hizmet kalitesinin iyileştirilmesi ve analiz motorunun geliştirilmesi"}</li>
          </ul>
        </div>

        <div style={{ marginBottom: 28 }}>
          <h2 style={h2Style}>{"4. Veri Paylaşımı"}</h2>
          <p style={pStyle}>{"Kişisel verileriniz hiçbir koşulda reklam amacıyla üçüncü taraflarla paylaşılmaz. Veriler yalnızca teknik altyapı sağlayıcılarıyla — "}<strong>{"Supabase"}</strong>{" (veritabanı), "}<strong>{"Vercel"}</strong>{" (hosting) ve "}<strong>{"Anthropic"}</strong>{" (yapay zeka analizi) — hizmetin ifası için zorunlu olarak paylaşılır. Anthropic, API çağrıları üzerinden gelen verileri model eğitiminde kullanmaz."}</p>
        </div>

        <div style={{ marginBottom: 28 }}>
          <h2 style={h2Style}>{"5. Çerez Politikası"}</h2>
          <p style={pStyle}>{"Platformumuz yalnızca zorunlu oturum çerezlerini kullanır. İzleme çerezi, reklam çerezi veya üçüncü taraf analitik aracı (Google Analytics vb.) kullanılmamaktadır."}</p>
        </div>

        <div style={{ marginBottom: 28 }}>
          <h2 style={h2Style}>{"6. Veri Güvenliği"}</h2>
          <p style={pStyle}>{"Tüm veriler Supabase üzerinde Row Level Security (RLS) ile korunmaktadır. Kimlik doğrulama Supabase Auth altyapısı ile sağlanır; şifreleriniz sunucularımızda açık biçimde saklanmaz."}</p>
        </div>

        <div style={{ marginBottom: 28 }}>
          <h2 style={h2Style}>{"7. Saklama Süresi"}</h2>
          <p style={pStyle}>{"Sağlık verileriniz, hizmet ilişkisinin sona ermesinden itibaren 2 yıl süreyle saklanır. Silme talebiniz 30 gün içinde yerine getirilir."}</p>
        </div>

        <div style={{ marginBottom: 28 }}>
          <h2 style={h2Style}>{"8. Haklarınız"}</h2>
          <p style={pStyle}>{"KVKK md. 11 kapsamındaki haklarınız ve başvuru yöntemleri için "}<a href="/kvkk" style={{ color: C.primary, textDecoration: 'underline' }}>{"KVKK Aydınlatma Metni"}</a>{" sayfamıza bakınız. İletişim: "}<strong>{"m.fatih.cakir@gmail.com"}</strong></p>
        </div>

        <div style={{ marginBottom: 28 }}>
          <h2 style={h2Style}>{"9. Değişiklikler"}</h2>
          <p style={pStyle}>{"Bu gizlilik politikası gerektiğinde güncellenebilir. Önemli değişiklikler e-posta veya platform üzerinden bildirilir."}</p>
        </div>
      </div>
      <Footer />
    </div>
  )
}
