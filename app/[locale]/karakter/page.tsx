'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Cormorant_Garamond as Cinzel, EB_Garamond } from 'next/font/google'
import { createClient } from '@/lib/supabase'

const cinzel = Cinzel({ display: 'swap', preload: false, subsets: ['latin', 'latin-ext'], weight: ['400', '500', '600'] })
const garamond = EB_Garamond({ display: 'swap', preload: false, subsets: ['latin', 'latin-ext'], weight: ['400', '500'], style: ['normal', 'italic'] })

const CEPHE_META: Record<string, {name:string,arabic:string,yon:string,renk:string,tanim:string}> = {
  dunya: { name:'Dünyâ', arabic:'جبهة الدنيا', yon:'ÖNDEN · CEPHE I', renk:'#D4A843', tanim:'Dünyanın aldatıcı cazibesine karşı kalbin savunması' },
  heva: { name:'Hevâ', arabic:'جبهة الهوى', yon:'SAĞDAN · CEPHE III', renk:'#78A0C8', tanim:'Nefsin tutkuları ve arzularının yönettiği cephe' },
  nefs: { name:'Nefs', arabic:'جبهة النفس', yon:'SOLDAN · CEPHE II', renk:'#C47878', tanim:'Nefsin karanlık yüzü; kibir ve ucubun kalbi kuşattığı cephe' },
  seytan: { name:'Şeytân', arabic:'جبهة الشيطان', yon:'ENSEDEN · CEPHE IV', renk:'#A07BC8', tanim:'İman ve yakîn savaşının en gizli cephesi' },
}

interface Asker {
  id: string; soru: string; tanim: string; ornek: string
}

interface Cephe {
  id: string; ad: string; ad_ar: string; aciklama: string; askerler: Asker[]
}

const CEPHELER: Cephe[] = [
  { id: 'dunya', ad: 'Dünyâ Cephesi', ad_ar: '\u062C\u0628\u0647\u0629 \u0627\u0644\u062F\u0646\u064A\u0627', aciklama: 'Dünyanın aldatıcı cazibesine karşı kalbin savunması', askerler: [
    { id: 'riya', soru: 'Yaptığım iyiliklerin fark edilmesini isterim', tanim: 'İbadetle dünyevî menfaat murat etmek', ornek: 'Bir iyilik yaptığında, kimse görmedi mi diye içinde hafif bir boşluk hissediyorsun.' },
    { id: 'tefahur', soru: 'Sahip olduklarımla övünme eğilimim var', tanim: 'Mal, makam, nesep gibi dünyevî şeylerle büyüklenmek', ornek: 'Konuşmalar sırasında başarılarını, geçmişini ya da sahip olduklarını sıkça gündeme getirdiğini fark ediyorsun.' },
    { id: 'batar', soru: 'Nimetler karşısında şükür yerine şımarık bir sevinç yaşarım', tanim: 'Nimete kavuşunca şükür yerine şımarıklıkla ferahlamak', ornek: 'İyi bir haber aldığında ilk tepkin şükürden çok "işte böyle olur" hissi oluyor.' },
    { id: 'heva', soru: 'Aklıma gelen her isteğin peşinden giderim', tanim: 'Nefsin meşru olmayan arzularına uymak', ornek: 'Bir şeyi istememeye karar versem bile, bir süre sonra kendimi onu yaparken buluyorum.' },
    { id: 'lub', soru: 'Boş eğlenceler zamanımı tüketir', tanim: 'Oyun ve geçici eğlencelere dalmak', ornek: 'Önemli şeyleri erteleyip anlık eğlenceler için zaman harcadığını fark ediyorsun.' },
    { id: 'zur', soru: 'Birini kötülemek için gerçeği çarpıtırım', tanim: 'Buhtana yakın, başkasını küçültmek için söylenen yalan', ornek: 'Birinden şikâyet ederken olayı olduğundan farklı anlattığın olmuştur.' },
    { id: 'kizb', soru: 'Zaman zaman yalan söylerim', tanim: 'Gerçeği söylemekten kaçınmak; yalan beyan', ornek: 'Zor bir durumdan kurtulmak ya da birini üzmemek için gerçek olmayan şeyler söylediğin oluyor.' },
    { id: 'giss', soru: 'Başkalarını manipüle ederim', tanim: 'İçinde başka niyet taşıyarak dışarıda farklı görünmek', ornek: 'Birini bir şeye ikna ederken asıl niyetini açıkça söylemediğin olmuştur.' },
    { id: 'hadia', soru: 'İnsanları yanıltırım', tanim: 'Aldatmak; söz ya da davranışla yanılgıya düşürmek', ornek: 'Birinin yanlış anlamasına izin verdiğin ya da bunu kullandığın olmuştur.' },
    { id: 'tefrit', soru: 'Dinî yükümlülüklerimi erteleyip ihmal ederim', tanim: 'Şer-i şerifte amelde kusur ve ihmal etmek', ornek: 'Namaz, oruç gibi yükümlülükleri ertelediğinde içinde hafif bir sıkışma hissediyorsun ama geçiyor.' },
  ]},
  { id: 'heva', ad: 'Hevâ Cephesi', ad_ar: '\u062C\u0628\u0647\u0629 \u0627\u0644\u0647\u0648\u0649', aciklama: 'Nefsin tutkularının yönettiği cephe', askerler: [
    { id: 'hased', soru: 'Birinin başarısı karşısında içimde bir sıkışma hissederim', tanim: 'Başkasındaki nimetin gitmesini ya da ona ulaşamamasını istemek', ornek: 'Bir arkadaşın terfi aldığında sevinmek istiyorsun ama bir köşede "neden o, ben değil?" sorusu dolaşıyor.' },
    { id: 'tecebbur', soru: 'Haksızlık etme eğilimim var', tanim: 'Zalim olmak; gücü haksız yere kullanmak', ornek: 'Elinde fırsat ya da otorite olduğunda, bunu kendi çıkarın için kullandığın olmuştur.' },
    { id: 'ucub', soru: 'Başarılarımın kendi çabamdan kaynaklandığını düşünürüm', tanim: 'Başarıyı Hakk\u2019ın lutfundan değil kendinden bilmek', ornek: 'Bir şeyi başardığında "Allah nasip etti" demek yerine "ben yaptım" hissi öne geçiyor.' },
    { id: 'tekebbur', soru: 'Kendimi başkasından üstün görüyorum', tanim: 'Büyüklük ve iyilik iddiasıyla başkalarını küçültmek', ornek: 'Bazı insanlarla konuşurken onları içten içe yetersiz ya da sıradan bulduğun oluyor.' },
    { id: 'gill', soru: 'İçim dışıma uymaz', tanim: 'Dışarıda farklı görünüp içeride başka hissetmek', ornek: 'Güler yüz gösterdiğinde de içinde o kişiye karşı soğukluk ya da kırgınlık taşıdığın oluyor.' },
    { id: 'mekr', soru: 'Amacıma ulaşmak için hile yaparım', tanim: 'Hile etmek; dolaylı yollarla istediğini elde etmek', ornek: 'Doğrudan sormak yerine dolaylı yollarla ya da oyunlarla istediğini elde etmeye çalıştığın olmuştur.' },
    { id: 'vesvese', soru: 'Zihnim karanlık ve şüpheli düşüncelerle dolar', tanim: 'Gönlünde yerleşen gizli karanlık kelâm', ornek: 'Zihnin bazen seni sürüklediği düşüncelerden rahatsız oluyorsun ama onları durduramıyorsun.' },
    { id: 'gadr', soru: 'Verdiğim sözü tutmam', tanim: 'Hıyanet edip doğruluğunu yitirmek', ornek: 'Verdiğin sözü ya da taahhüdü şartlar değişince kolayca geçersiz saydığın olmuştur.' },
    { id: 'hikd', soru: 'Kin beslerim', tanim: 'Kin tutmak; birine karşı duyguyu içte yaşatmak', ornek: 'Yıllar önce yaşanan bir olay aklına geldiğinde hâlâ aynı acıyı ya da öfkeyi hissediyorsun.' },
    { id: 'muhalefet', soru: 'Kurallara ve otoriteye uymakta zorlanırım', tanim: 'İlâhî ve şerî emirlere uymaktan içten kaçınmak', ornek: 'Bir kural ya da emir mantıklı gelse bile, sırf biri söyledi diye ona uymakta içsel bir direnç hissediyorsun.' },
  ]},
  { id: 'nefs', ad: 'Nefs Cephesi', ad_ar: '\u062C\u0628\u0647\u0629 \u0627\u0644\u0646\u0641\u0633', aciklama: 'Nefsin zayıflıklarından beslenen cephe', askerler: [
    { id: 'hirs', soru: 'Başkasındaki gibi ben de istiyorum diye arzulara kapılırım', tanim: 'Başkasında gördüğü nimete benzerini elde etmek için arzuya düşmek', ornek: 'Birinin sahip olduğu bir şeyi görünce "bende de olsaydı" düşüncesi zihni meşgul etmeye başlıyor.' },
    { id: 'sehvet', soru: 'Nefsimin isteklerine kolayca boyun eğerim', tanim: 'Nefsin muvâfık olanı talep etmesi; dizginlenemeyen arzu', ornek: 'Yapmamaya karar verdiğin bir şeyi, o an önüne gelince yapıveriyorsun.' },
    { id: 'suhh', soru: 'Sahip olduklarımı paylaşmakta zorlanırım', tanim: 'Kendinden ve başkasından eli tutmak; aşırı pintilik', ornek: 'Paylaşman gereken bir şeyi verirken içinde belirgin bir isteksizlik ya da pişmanlık hissediyorsun.' },
    { id: 'ragbet', soru: 'İyilik yerine dünyevî şeylere yönelirim', tanim: 'Hayra meyletmeyip başka şeylere yönelmek', ornek: 'Değerli olduğunu biliyorsun ama zamanın büyük bölümü seni asıl geliştirecek şeyler için değil başka şeyler için geçiyor.' },
    { id: 'zayig', soru: 'Bâtıl ve anlamsız şeylere meylettiğimi fark ederim', tanim: 'Bâtıla meyledip eğilmek; değersiz olana kayma', ornek: 'Zamanının ya da enerjinin önemli bir kısmının gerçekten anlam ifade etmeyen şeylere gittiğini görüyorsun.' },
    { id: 'kasavet', soru: 'Günahlarım beni etkilemez, vicdan azabı duymam', tanim: 'Kalbin katılaşması; günahtan elem duymamak', ornek: 'Yanlış bir şey yaptığında içinde bir sızı yerine "zaten herkes yapar" hissi geliyor.' },
    { id: 'buhl', soru: 'Vermem gereken yerde cimri davranırım', tanim: 'Şer\u2019an ve mürüvveten gerekli yerde mali harcamamak', ornek: 'İnsan ilişkilerinde ya da hayırda vermesi gereken yerde gerekçe arayıp ertelediğin oluyor.' },
    { id: 'emel', soru: 'Gerçekçi olmayan hayaller kurarak oyalanırım', tanim: 'Uzun arzu ve temenni; ahireti unutturan dünya hayalleri', ornek: 'Gelecek için büyük planlar kuruyorsun ama bugün yapman gerekenleri sürekli yarına bırakıyorsun.' },
    { id: 'tama', soru: 'Şüpheli de olsa elde etmek için çabalarım', tanim: 'Haram veya mekruh ihtimali olan şeyi elde etmeye kasdetmek', ornek: 'Bir şeyin doğruluğundan tam emin olmasan da elde etmek için görmezden geldiğin olmuştur.' },
    { id: 'kesel', soru: 'İbadet ve sorumluluklarımda tembellik yaparım', tanim: 'Süstlük; ibadet ve sorumluluklarda yorgunluk ve isteksizlik', ornek: 'Yapman gerektiğini bildiğin şeyleri sürekli erteliyorsun, başlamak için bir türlü doğru an gelmiyor.' },
  ]},
  { id: 'seytan', ad: 'Şeytân Cephesi', ad_ar: '\u062C\u0628\u0647\u0629 \u0627\u0644\u0634\u064A\u0637\u0627\u0646', aciklama: 'İman ve inanç savaşının cephesi', askerler: [
    { id: 'zulum', soru: 'Haksızlık yaparım', tanim: 'Bir şeyin uygun olmayan yere konulması', ornek: 'Güç ya da bilgi avantajını birinin aleyhine kullandığın, buna rağmen "haksızlık etmedim" dediğin olmuştur.' },
    { id: 'hiyanet', soru: 'Güvenilir değilimdir', tanim: 'İşinde hainlik edip doğru sözü saklayıp söylememek', ornek: 'Biri sana bir şeyi emanet ettiğinde ya da güvendiğinde beklentisini tam karşılamadığın olmuştur.' },
    { id: 'kufur', soru: 'İman ve inanç konularında ciddi şüpheler yaşarım', tanim: 'Mü\u2019min olmak gerekirken mü\u2019min olmamak', ornek: 'Bazı anlarda temel inançlarına dair içten bir şüphe ya da soğukluk hissediyorsun.' },
    { id: 'terk_avn', soru: 'Yardım etmem gereken yerde seyirci kalırım', tanim: 'Yerinde ve zamanında yardım etmemek', ornek: 'Birisinin zor durumda olduğunu gördüğünde yardım etme kapasiten olsa da geçip gittiğin olmuştur.' },
    { id: 'bugz', soru: 'Dindar ve erdemli insanlara karşı içimde soğukluk var', tanim: 'Ulemâyı ve salihleri sevmemek', ornek: 'Dinî hassasiyetleri olan insanlar söz konusu olunca içinde açıklaması güç bir soğukluk ya da rahatsızlık beliriyor.' },
    { id: 'nifak', soru: 'Sözlerim ve davranışlarım birbiriyle çelişir', tanim: 'Sözün işine, içinin dışına muhalif olmak', ornek: 'Doğruluktan, dürüstlükten söz ederken davranışlarınla bunu yansıtmadığın olmuştur.' },
    { id: 'sekk', soru: 'Allah\u2019ın gücüne dair şüphelerim olur', tanim: 'Hak Teâlâ\u2019nın her şeye gücünün yettiğine dair şüphe', ornek: 'Zor bir durumda "Allah bunu düzeltebilir mi?" değil "düzeltmeyecek" hissi geliyor.' },
    { id: 'hilaf_emr', soru: 'İlâhî emirlere uymakta direnç gösteririm', tanim: 'Hak Teâlâ\u2019nın emrine ve emrettiğine içten uymamak', ornek: 'Bir emri bildiğin halde "şimdi değil" deyip sürekli ertelediğin ya da geçerli saymadığın oluyor.' },
    { id: 'tegaful', soru: 'Sünneti ve dinî pratikleri önemsemem', tanim: 'Sünnetten gafil olmak; onu hayattan dışlamak', ornek: 'Sünnetin önemli olduğunu biliyorsun ama pratikte hayatında çok az yer kaplıyor.' },
    { id: 'bidat', soru: 'Dinde olmayan şeyleri dine dahil ederim', tanim: 'Resul ve Sahâbe\u2019den sonra izinsiz dinde icat etmek', ornek: 'Dinî konularda "herkes böyle yapıyor" ya da "ben böyle hissediyorum" gerekçesiyle kaynaklarda olmayan şeyleri benimsediğin olmuştur.' },
  ]},
]

const CEPHE_SIRASI = ['dunya', 'heva', 'nefs', 'seytan'] as const

export default function KarakterAnaliziPage() {
  const router = useRouter()
  const supabase = createClient()
  const [soruIndex, setSoruIndex] = useState(0)
  const [cevaplar, setCevaplar] = useState<Record<string, number>>({})
  const [fizikselMizac, setFizikselMizac] = useState('')
  const [yukleniyor, setYukleniyor] = useState(false)
  const [gorunum, setGorunum] = useState<'harita' | 'form' | 'sonuc'>('harita')
  const [toast, setToast] = useState<{ mesaj: string, tip: 'hata' | 'basari' } | null>(null)
  const formRef = useRef<HTMLDivElement>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [authModal, setAuthModal] = useState(false)

  function gosterToast(mesaj: string, tip: 'hata' | 'basari' = 'hata') {
    setToast({ mesaj, tip }); setTimeout(() => setToast(null), 4000)
  }

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      setIsLoggedIn(true)
      // Fiziksel mizac
      const { data } = await supabase.from('analyses').select('sonuc_verisi, mizac_tipi').order('created_at', { ascending: false }).limit(1).single()
      if (data?.mizac_tipi || data?.sonuc_verisi?.mizac) setFizikselMizac(data.mizac_tipi || data.sonuc_verisi?.mizac || '')
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Tum sorular duz liste
  const tumSorular = CEPHELER.flatMap((c, ci) => c.askerler.map((a, ai) => ({ ...a, cephe: c, cepheIdx: ci, askerIdx: ai })))
  const mevcutSoru = tumSorular[soruIndex]
  const toplamSoru = tumSorular.length

  function cevapVer(deger: number) {
    if (!mevcutSoru) return
    setCevaplar(prev => ({ ...prev, [mevcutSoru.id]: deger }))
    if (soruIndex < toplamSoru - 1) {
      setTimeout(() => { setSoruIndex(soruIndex + 1); formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }, 300)
    } else {
      setGorunum('sonuc')
    }
  }

  function cepheSkoru(cepheId: string): number {
    const c = CEPHELER.find(x => x.id === cepheId)
    if (!c) return 0
    const t = c.askerler.reduce((s, a) => s + (cevaplar[a.id] || 0), 0)
    return Math.round((t / (c.askerler.length * 3)) * 100)
  }

  function aktifAskerler(): string[] {
    return Object.entries(cevaplar).filter(([, v]) => v >= 2).map(([k]) => k)
  }

  async function gonder() {
    if (Object.keys(cevaplar).length < 20) { gosterToast('En az 20 soruyu cevaplayin.'); return }
    setYukleniyor(true)
    try {
      const res = await fetch('/api/karakter', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          form_cevaplari: { cevaplar, skorlar: { dunya: cepheSkoru('dunya'), heva: cepheSkoru('heva'), nefs: cepheSkoru('nefs'), seytan: cepheSkoru('seytan') } },
          fiziksel_mizac: fizikselMizac, aktif_askerler: aktifAskerler(),
        }),
      })
      const sonuc = await res.json()
      if (sonuc.kriz_tespit) { gosterToast(sonuc.kriz_mesaji || 'Lutfen bir uzmana basvurun.'); setYukleniyor(false); return }
      localStorage.setItem('ipekyolu_karakter_sonuc', JSON.stringify(sonuc))
      localStorage.setItem('ipekyolu_karakter_skorlar', JSON.stringify({ dunya: cepheSkoru('dunya'), heva: cepheSkoru('heva'), nefs: cepheSkoru('nefs'), seytan: cepheSkoru('seytan') }))
      router.push('/karakter/sonuc')
    } catch { gosterToast('Analiz sirasinda hata olustu.') }
    setYukleniyor(false)
  }

  // Derive current cephe from soruIndex
  const currentCepheId = CEPHE_SIRASI[Math.floor(soruIndex / 10)] || 'dunya'
  const currentCepheMeta = CEPHE_META[currentCepheId]
  const currentCepheAskerler = CEPHELER[Math.floor(soruIndex / 10)]?.askerler || []
  const askerIdxInCephe = soruIndex % 10

  const LIKERT = [
    { value: 0, label: 'Hic boyle degilim' },
    { value: 1, label: 'Bazen boyleyim' },
    { value: 2, label: 'Siklikla boyleyim' },
    { value: 3, label: 'Cogunlukla boyleyim' },
  ]

  return (
    <div style={{ background: '#1A2E1E', minHeight: '100vh', fontFamily: garamond.style.fontFamily }}>

      {/* TOAST */}
      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, background: toast.tip === 'hata' ? '#FCEBEB' : '#EAF3DE', border: `1px solid ${toast.tip === 'hata' ? '#F7C1C1' : '#C0DD97'}`, color: toast.tip === 'hata' ? '#A32D2D' : '#3B6D11', padding: '14px 20px', borderRadius: 10, fontSize: 13, maxWidth: 360, boxShadow: '0 4px 20px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span>{toast.mesaj}</span>
          <button onClick={() => setToast(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'inherit' }}>{'\u2715'}</button>
        </div>
      )}

      {/* ============ VIEW 1: HARITA ============ */}
      {gorunum === 'harita' && (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', position: 'relative' }}>
          {/* Eyebrow */}
          <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 7, letterSpacing: 5, color: 'rgba(212,168,67,0.4)', textTransform: 'uppercase', marginBottom: 16, textAlign: 'center' }}>
            KLASiK iSLAM DUSUNCESi &middot; NEFS MUHASEBESi
          </div>

          {/* Title */}
          <h1 style={{ fontFamily: cinzel.style.fontFamily, fontSize: 48, fontWeight: 500, margin: '0 0 10px', textAlign: 'center' }}>
            <span style={{ color: '#FFFFFF' }}>Kalp</span>{' '}
            <span style={{ color: '#D4A843' }}>Sehri</span>
          </h1>

          {/* Subtitle */}
          <p style={{ fontSize: 15, fontStyle: 'italic', color: 'rgba(255,255,255,0.3)', margin: '0 0 40px', textAlign: 'center', maxWidth: 440 }}>
            40 askerin dort cepheden kusattigi kalbin muhasebesi
          </p>

          {/* SVG Heart Map */}
          <div style={{ position: 'relative', width: '100%', maxWidth: 500, margin: '0 auto 40px' }}>
            <svg viewBox="0 0 500 450" style={{ width: '100%', height: 'auto' }}>
              {/* Background octagon pattern */}
              <g opacity="0.045" stroke="#D4A843" strokeWidth="0.5" fill="none">
                <polygon points="250,40 370,90 410,210 370,330 250,380 130,330 90,210 130,90" />
                <polygon points="250,80 340,115 370,210 340,305 250,340 160,305 130,210 160,115" />
                <polygon points="250,120 310,140 330,210 310,280 250,300 190,280 170,210 190,140" />
              </g>

              {/* Attack lines; dashed animated */}
              <line x1="250" y1="60" x2="250" y2="155" stroke="#D4A843" strokeWidth="1" strokeDasharray="4 4" opacity="0.25" className="karakter-dash" />
              <line x1="440" y1="225" x2="325" y2="225" stroke="#78A0C8" strokeWidth="1" strokeDasharray="4 4" opacity="0.25" className="karakter-dash" />
              <line x1="60" y1="225" x2="175" y2="225" stroke="#C47878" strokeWidth="1" strokeDasharray="4 4" opacity="0.25" className="karakter-dash" />
              <line x1="250" y1="390" x2="250" y2="295" stroke="#A07BC8" strokeWidth="1" strokeDasharray="4 4" opacity="0.25" className="karakter-dash" />

              {/* Central heart circle */}
              <circle cx="250" cy="225" r="70" fill="#152A1A" stroke="rgba(212,168,67,0.3)" strokeWidth="1.5" className="karakter-hb" />

              {/* Inner heart anatomy */}
              <ellipse cx="235" cy="210" rx="22" ry="26" fill="none" stroke="rgba(212,168,67,0.15)" strokeWidth="0.8" />
              <ellipse cx="265" cy="210" rx="22" ry="26" fill="none" stroke="rgba(212,168,67,0.15)" strokeWidth="0.8" />
              <ellipse cx="240" cy="240" rx="18" ry="22" fill="none" stroke="rgba(212,168,67,0.12)" strokeWidth="0.8" />
              <ellipse cx="260" cy="240" rx="18" ry="22" fill="none" stroke="rgba(212,168,67,0.12)" strokeWidth="0.8" />

              {/* Heart label */}
              <text x="250" y="228" textAnchor="middle" fill="#D4A843" fontFamily={cinzel.style.fontFamily} fontSize="11" letterSpacing="3" opacity="0.7">KALP</text>

              {/* Gate points with glow */}
              <circle cx="250" cy="155" r="5" fill="#D4A843" opacity="0.6" className="karakter-glow" />
              <circle cx="325" cy="225" r="5" fill="#78A0C8" opacity="0.6" className="karakter-glow" />
              <circle cx="175" cy="225" r="5" fill="#C47878" opacity="0.6" className="karakter-glow" />
              <circle cx="250" cy="295" r="5" fill="#A07BC8" opacity="0.6" className="karakter-glow" />

              {/* Directional labels */}
              {/* Dunya; top */}
              <text x="250" y="40" textAnchor="middle" fill="#D4A843" fontFamily={cinzel.style.fontFamily} fontSize="9" letterSpacing="2" opacity="0.7">ONDEN</text>
              <text x="250" y="55" textAnchor="middle" fill="#D4A843" fontFamily={cinzel.style.fontFamily} fontSize="13" opacity="0.9">Dunya</text>

              {/* Heva; right */}
              <text x="450" y="220" textAnchor="middle" fill="#78A0C8" fontFamily={cinzel.style.fontFamily} fontSize="9" letterSpacing="2" opacity="0.7">SAGDAN</text>
              <text x="450" y="235" textAnchor="middle" fill="#78A0C8" fontFamily={cinzel.style.fontFamily} fontSize="13" opacity="0.9">Heva</text>

              {/* Nefs; left */}
              <text x="50" y="220" textAnchor="middle" fill="#C47878" fontFamily={cinzel.style.fontFamily} fontSize="9" letterSpacing="2" opacity="0.7">SOLDAN</text>
              <text x="50" y="235" textAnchor="middle" fill="#C47878" fontFamily={cinzel.style.fontFamily} fontSize="13" opacity="0.9">Nefs</text>

              {/* Seytan; bottom */}
              <text x="250" y="405" textAnchor="middle" fill="#A07BC8" fontFamily={cinzel.style.fontFamily} fontSize="9" letterSpacing="2" opacity="0.7">ENSEDEN</text>
              <text x="250" y="420" textAnchor="middle" fill="#A07BC8" fontFamily={cinzel.style.fontFamily} fontSize="13" opacity="0.9">Seytan</text>
            </svg>
          </div>

          {/* Warning */}
          <div style={{ background: 'rgba(212,168,67,0.08)', border: '1px solid rgba(212,168,67,0.2)', borderRadius: 8, padding: '8px 18px', fontSize: 11, color: 'rgba(212,168,67,0.6)', marginBottom: 32, textAlign: 'center', maxWidth: 400 }}>
            Bu arac tibbi veya psikolojik tedavinin yerini tutmaz.
          </div>

          {/* CTA */}
          <button
            onClick={() => { if (!isLoggedIn) setAuthModal(true); else { setGorunum('form'); setSoruIndex(0) } }}
            style={{
              padding: '16px 48px',
              background: '#D4A843',
              border: 'none',
              borderRadius: 8,
              color: '#1A2E1E',
              fontFamily: cinzel.style.fontFamily,
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: 3,
              cursor: 'pointer',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            MUHASEBEYE BASLA
          </button>
        </div>
      )}

      {/* ============ VIEW 2: FORM ============ */}
      {gorunum === 'form' && mevcutSoru && (
        <div ref={formRef} className="karakter-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '100vh' }}>
          {/* LEFT PANEL */}
          <div className="karakter-left-panel" style={{ background: '#1A2E1E', padding: '48px 36px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {/* Cephe direction */}
            <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 7, letterSpacing: 4, color: currentCepheMeta.renk, opacity: 0.7, marginBottom: 12, textTransform: 'uppercase' }}>
              {currentCepheMeta.yon}
            </div>

            {/* Cephe name */}
            <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 36, fontWeight: 700, color: '#F5EAD4', marginBottom: 6 }}>
              {currentCepheMeta.name}
            </div>

            {/* Arabic name */}
            <div style={{ fontFamily: 'serif', fontSize: 18, color: currentCepheMeta.renk, opacity: 0.55, marginBottom: 16, direction: 'rtl' as const }}>
              {currentCepheMeta.arabic}
            </div>

            {/* Divider */}
            <div style={{ width: 40, height: 1, background: 'rgba(212,168,67,0.2)', marginBottom: 16 }} />

            {/* Description */}
            <div style={{ fontSize: 13, fontStyle: 'italic', color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, marginBottom: 28, maxWidth: 320 }}>
              {currentCepheMeta.tanim}
            </div>

            {/* Asker chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {currentCepheAskerler.map((asker, idx) => {
                const isActive = idx === askerIdxInCephe
                const isPast = idx < askerIdxInCephe
                const isFuture = idx > askerIdxInCephe
                return (
                  <div
                    key={asker.id}
                    style={{
                      padding: '5px 10px',
                      borderRadius: 20,
                      fontSize: 10,
                      fontFamily: cinzel.style.fontFamily,
                      letterSpacing: 1,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      ...(isActive
                        ? { background: '#D4A843', color: '#1A2E1E', fontWeight: 600 }
                        : isPast
                          ? { background: 'transparent', border: '1px solid rgba(212,168,67,0.15)', color: 'rgba(212,168,67,0.3)' }
                          : isFuture
                            ? { background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.3)' }
                            : {}
                      ),
                    }}
                    onClick={() => {
                      const base = Math.floor(soruIndex / 10) * 10
                      setSoruIndex(base + idx)
                    }}
                  >
                    {asker.id.charAt(0).toUpperCase() + asker.id.slice(1).replace('_', ' ')}
                  </div>
                )
              })}
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div style={{ background: '#FAF6EF', padding: '48px 36px', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
            {/* Question number */}
            <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 7, letterSpacing: 4, color: 'rgba(0,0,0,0.3)', marginBottom: 20, textTransform: 'uppercase' }}>
              SORU {soruIndex + 1} / 40
            </div>

            {/* Cephe + asker label */}
            <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.35)', marginBottom: 8 }}>
              {currentCepheMeta.name} &middot; {mevcutSoru.id.charAt(0).toUpperCase() + mevcutSoru.id.slice(1).replace('_', ' ')}
            </div>

            {/* Question text */}
            <p style={{ fontFamily: garamond.style.fontFamily, fontSize: 18, lineHeight: 1.7, color: '#1A2E1E', marginBottom: 32, maxWidth: 440 }}>
              {mevcutSoru.soru}
            </p>

            {/* Likert options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 32 }}>
              {LIKERT.map(opt => {
                const secili = cevaplar[mevcutSoru.id] === opt.value
                return (
                  <button
                    key={opt.value}
                    onClick={() => cevapVer(opt.value)}
                    style={{
                      padding: '11px 14px',
                      borderRadius: 8,
                      border: secili ? '0.5px solid #D4A843' : '0.5px solid rgba(0,0,0,0.1)',
                      background: secili ? 'rgba(212,168,67,0.08)' : 'transparent',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: 14,
                      color: secili ? '#1A2E1E' : 'rgba(0,0,0,0.55)',
                      fontFamily: garamond.style.fontFamily,
                      fontWeight: secili ? 600 : 400,
                      transition: 'all 0.15s',
                    }}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>

            {/* Navigation buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={() => { if (soruIndex > 0) setSoruIndex(soruIndex - 1); else setGorunum('harita') }}
                style={{ padding: '8px 20px', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 6, background: 'transparent', color: 'rgba(0,0,0,0.4)', cursor: 'pointer', fontSize: 12 }}
              >
                {soruIndex > 0 ? '\u2190 Onceki' : '\u2190 Harita'}
              </button>
              {soruIndex < toplamSoru - 1 && (
                <button
                  onClick={() => setSoruIndex(soruIndex + 1)}
                  style={{ padding: '8px 20px', background: '#D4A843', border: 'none', borderRadius: 6, color: '#1A2E1E', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
                >
                  Sonraki &rarr;
                </button>
              )}
            </div>

            {/* Progress bar */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: 'rgba(0,0,0,0.05)' }}>
              <div style={{ height: 3, background: '#D4A843', width: `${((soruIndex + 1) / toplamSoru) * 100}%`, transition: 'width 0.3s' }} />
            </div>
          </div>
        </div>
      )}

      {/* ============ VIEW 3: SONUC ============ */}
      {gorunum === 'sonuc' && (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
          <div style={{ maxWidth: 600, width: '100%' }}>
            <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 8, letterSpacing: 4, color: 'rgba(212,168,67,0.5)', textAlign: 'center', marginBottom: 20, textTransform: 'uppercase' }}>
              CEPHE SKORLARI
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 28 }}>
              {CEPHELER.map(c => {
                const skor = cepheSkoru(c.id)
                const meta = CEPHE_META[c.id]
                return (
                  <div key={c.id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '20px' }}>
                    <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 8, letterSpacing: 3, color: meta.renk, opacity: 0.6, marginBottom: 6 }}>{meta.yon}</div>
                    <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 18, color: '#F5EAD4', marginBottom: 4 }}>{meta.name}</div>
                    <div style={{ fontSize: 28, fontWeight: 700, color: meta.renk, marginBottom: 8 }}>{skor}%</div>
                    <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
                      <div style={{ height: 3, background: meta.renk, borderRadius: 2, width: `${skor}%`, transition: 'width 0.5s', opacity: 0.7 }} />
                    </div>
                  </div>
                )
              })}
            </div>

            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginBottom: 8 }}>
              Aktif asker: {aktifAskerler().length}/40
            </div>

            {fizikselMizac && (
              <div style={{ background: 'rgba(212,168,67,0.06)', borderRadius: 8, border: '1px solid rgba(212,168,67,0.15)', padding: '10px 16px', marginBottom: 16, fontSize: 13, textAlign: 'center' }}>
                <span style={{ color: 'rgba(255,255,255,0.4)' }}>Fiziksel mizac: </span>
                <span style={{ color: '#D4A843', fontWeight: 600 }}>{fizikselMizac}</span>
              </div>
            )}
            {!fizikselMizac && (
              <div style={{ background: 'rgba(212,168,67,0.06)', borderRadius: 8, border: '1px solid rgba(212,168,67,0.15)', padding: '10px 16px', marginBottom: 16, fontSize: 12, color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>
                Fiziksel mizac analiziniz bulunamadi.{' '}
                <a href="/analiz" style={{ color: '#D4A843', fontWeight: 600 }}>Mizac analizi yapmak ister misiniz?</a>
              </div>
            )}

            <button onClick={gonder} disabled={yukleniyor}
              style={{
                width: '100%', padding: '16px', border: 'none', borderRadius: 8, cursor: yukleniyor ? 'not-allowed' : 'pointer',
                fontFamily: cinzel.style.fontFamily, fontSize: 14, fontWeight: 600, letterSpacing: 3,
                background: yukleniyor ? 'rgba(255,255,255,0.1)' : '#D4A843',
                color: yukleniyor ? 'rgba(255,255,255,0.3)' : '#1A2E1E',
              }}>
              {yukleniyor ? 'Analiz ediliyor...' : 'ANALIZIMI TAMAMLA'}
            </button>
            <button onClick={() => { setGorunum('form'); setSoruIndex(0) }}
              style={{ width: '100%', marginTop: 8, padding: '10px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, cursor: 'pointer', fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
              Cevaplari duzenle
            </button>
          </div>
        </div>
      )}

      {/* ============ AUTH MODAL ============ */}
      {authModal && (
        <div onClick={() => setAuthModal(false)} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#FAF6EF', borderRadius: 20, maxWidth: 420, width: '100%', padding: '40px 36px', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>{'\uD83D\uDD12'}</div>
            <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 20, color: '#1A2E1E', marginBottom: 8 }}>Bu Özellik Üyelere Özeldir</div>
            <p style={{ fontSize: 14, color: 'rgba(0,0,0,0.5)', lineHeight: 1.6, marginBottom: 24 }}>
              Kalp Şehri karakter analizini kullanmak için giriş yapın veya üye olun.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button onClick={() => router.push('/giris')}
                style={{ padding: '12px 28px', borderRadius: 10, background: '#1A2E1E', color: '#D4A843', fontFamily: cinzel.style.fontFamily, fontSize: 14, fontWeight: 600, letterSpacing: 1, border: 'none', cursor: 'pointer' }}>
                Giriş Yap
              </button>
              <button onClick={() => router.push('/kayit')}
                style={{ padding: '12px 28px', borderRadius: 10, background: '#D4A843', color: '#1A2E1E', fontFamily: cinzel.style.fontFamily, fontSize: 14, fontWeight: 600, letterSpacing: 1, border: 'none', cursor: 'pointer' }}>
                Üye Ol
              </button>
            </div>
            <button onClick={() => setAuthModal(false)}
              style={{ marginTop: 16, background: 'none', border: 'none', color: '#999', fontSize: 13, cursor: 'pointer' }}>
              Kapat
            </button>
          </div>
        </div>
      )}

      {/* ============ CSS ANIMATIONS ============ */}
      <style>{`
        @keyframes hb {
          0%, 100% { transform: scale(1); }
          20% { transform: scale(1.06); }
          40% { transform: scale(1); }
        }
        @keyframes dash {
          to { stroke-dashoffset: -20; }
        }
        @keyframes glow {
          0%, 100% { opacity: 0.35; }
          50% { opacity: 0.7; }
        }
        @keyframes fadeUp {
          from { transform: translateY(12px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .karakter-hb {
          animation: hb 2.5s ease-in-out infinite;
          transform-origin: center;
        }
        .karakter-dash {
          animation: dash 1.5s linear infinite;
        }
        .karakter-glow {
          animation: glow 2s ease-in-out infinite;
        }
        @media (max-width: 768px) {
          .karakter-grid {
            grid-template-columns: 1fr !important;
          }
          .karakter-left-panel {
            height: 120px !important;
            padding: 16px 24px !important;
            justify-content: flex-start !important;
            overflow: hidden;
          }
        }
      `}</style>
    </div>
  )
}
