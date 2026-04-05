'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Cinzel, EB_Garamond } from 'next/font/google'
import Header from '../components/Header'
import Footer from '../components/Footer'

const cinzel = Cinzel({ subsets: ['latin', 'latin-ext'], weight: ['400', '500', '600'] })
const garamond = EB_Garamond({ subsets: ['latin', 'latin-ext'], weight: ['400', '500'], style: ['normal', 'italic'] })

const C = { primary: '#1B4332', gold: '#C9A84C', cream: '#F5EFE6', secondary: '#5C4A2A', border: '#E0D5C5', white: '#FFFFFF' }

const SORULAR = [
  { s: 'Bu analiz tıbbi teşhis midir?', c: 'Hayır. Bu analiz klasik İslam tıbbı geleneğine dayanan bir danışmanlık hizmetidir. Modern tıbbın tanı ve tedavilerinin yerini tutmaz. Ciddi sağlık sorunlarında mutlaka uzman hekime başvurunuz.' },
  { s: 'Analiz ne kadar sürer?', c: 'Formunuz iletildikten sonra danışmanınız 24-48 saat içinde WhatsApp üzerinden size ulaşır. Acil durumlarda doğrudan WhatsApp hattımızdan iletişime geçebilirsiniz.' },
  { s: 'Hangi klasik kaynaklardan yararlanıyorsunuz?', c: '18 büyük İslam tıbbı eserinden yararlanıyoruz. Başlıcaları: el-Havi fit-Tib (er-Razi), el-Samil (İbn Nefis), Tahbizul-Mathun (Tokadi Mustafa Efendi) ve el-Kanun fit-Tib (İbn Sina). Tamamı dijitalleştirilmiş ve yapılandırılmış formatta analiz motoruna entegre edilmiştir.' },
  { s: 'Analiz sonuçları kişiye özel midir?', c: 'Evet. Her analiz; nabız gözlemi (9 sıfat), dil ve yüz muayenesi, idrar ve dışkı gözlemi, laboratuvar değerleri ve fıtrî mizaç sorularına göre ayrı ayrı değerlendirilir. Hiçbir analiz bir diğerinin kopyası değildir.' },
  { s: 'Ödeme güvenli mi?', c: 'Tüm ödemeler iyzico altyapısı ile 256-bit SSL şifreleme altında gerçekleştirilir. Kart bilgileriniz sunucularımızda saklanmaz.' },
  { s: 'Aboneliği iptal edebilir miyim?', c: 'Evet, dilediğiniz zaman iptal edebilirsiniz. İptal sonrası mevcut dönem sonuna kadar hizmetiniz devam eder. İade politikası için info@ipekyolusicifacisi.com adresine yazabilirsiniz.' },
  { s: 'Danışman kimdir?', c: 'Danışmanınız Dr. M. Fatih Çakır; Kocaeli Üniversitesi Tıp Tarihi yüksek lisansı ve FSM Vakıf Üniversitesi İslam Bilim Tarihi doktora programı öğrencisidir. Osmanlı Türkçesi ve Arapça bilgisiyle birincil kaynaklara doğrudan erişen bir araştırmacıdır.' },
  { s: 'Verilerim güvende mi?', c: 'Evet. Tüm sağlık verileriniz 6698 sayılı KVKK kapsamında korunmaktadır. Bilgileriniz üçüncü taraflarla paylaşılmaz, reklam amacıyla kullanılmaz. Detaylar için KVKK Aydınlatma Metnimizi inceleyebilirsiniz.' },
  { s: 'Yapay zeka mı karar veriyor?', c: 'Hayır. Yapay zeka (Anthropic Claude) klasik kaynaklardan ilgili bölümleri bulur ve eşleştirir; ancak nihai değerlendirme ve protokol kararı her zaman danışman tarafından verilir. Yapay zeka araçtır, karar insanındır.' },
  { s: 'Üye olmadan form doldurabilir miyim?', c: 'Evet. Analiz formunu üye olmadan doldurabilirsiniz. Formunuz danışmana iletilir. Detaylı analiz ve sürekli takip için üyelik gereklidir.' },
]

export default function SSSPage() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
const router = useRouter()
  const [acik, setAcik] = useState<number | null>(null)

  return (
    <div style={{ background: C.cream, minHeight: '100vh', fontFamily: garamond.style.fontFamily }}>
      <Header />

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
        <h1 style={{ fontFamily: cinzel.style.fontFamily, fontSize: 28, color: C.primary, marginBottom: 8, fontWeight: 500 }}>{"Sıkça Sorulan Sorular"}</h1>
        <p style={{ fontSize: 14, color: C.secondary, fontStyle: 'italic', marginBottom: 36 }}>{"Merak ettikleriniz ve yanıtları"}</p>

        {SORULAR.map((item, i) => (
          <div key={i} style={{ background: C.white, borderRadius: 12, border: `1px solid ${acik === i ? C.primary : C.border}`, marginBottom: 10, overflow: 'hidden', transition: 'all .15s' }}>
            <button
              onClick={() => setAcik(acik === i ? null : i)}
              style={{ width: '100%', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: 'none', background: 'none', cursor: 'pointer', fontFamily: garamond.style.fontFamily, textAlign: 'left' as const }}
            >
              <span style={{ fontSize: 15, fontWeight: 600, color: C.primary, flex: 1, paddingRight: 12 }}>{item.s}</span>
              <span style={{ fontSize: 18, color: C.gold, flexShrink: 0, transition: 'transform .2s', transform: acik === i ? 'rotate(45deg)' : 'rotate(0)' }}>+</span>
            </button>
            {acik === i && (
              <div style={{ padding: '0 20px 16px', fontSize: 14, color: C.secondary, lineHeight: 1.8 }}>
                {item.c}
              </div>
            )}
          </div>
        ))}

        <div style={{ marginTop: 32, textAlign: 'center' as const }}>
          <p style={{ fontSize: 13, color: '#999', marginBottom: 12 }}>{"Sorunuz burada yok mu?"}</p>
          <a href="https://wa.me/905331687226" target="_blank" style={{ display: 'inline-block', background: '#25D366', color: 'white', borderRadius: 10, padding: '12px 24px', fontSize: 13, fontWeight: 600, textDecoration: 'none', fontFamily: cinzel.style.fontFamily, letterSpacing: 1 }}>
            {"WhatsApp ile Sorun"}
          </a>
        </div>
      </div>
      <Footer />
    </div>
  )
}
