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
  nefs: { name:'Nefs', arabic:'جبهة النفس', yon:'SOLDAN · CEPHE II', renk:'#C47878', tanim:'Nefsin karanlık yüzü — kibir ve ucubun kalbi kuşattığı cephe' },
  seytan: { name:'Şeytân', arabic:'جبهة الشيطان', yon:'ENSEDEN · CEPHE IV', renk:'#A07BC8', tanim:'İman ve yakîn savaşının en gizli cephesi' },
}

interface Asker {
  id: string; soru: string; tanim: string; ornek: string
}

interface Cephe {
  id: string; ad: string; ad_ar: string; aciklama: string; askerler: Asker[]
}

const CEPHELER: Cephe[] = [
  { id: 'dunya', ad: 'Dunya Cephesi', ad_ar: '\u062C\u0628\u0647\u0629 \u0627\u0644\u062F\u0646\u064A\u0627', aciklama: 'Dunyanin aldatici cazibesine karsi savunma', askerler: [
    { id: 'riya', soru: 'Yaptigim iyiliklerin fark edilmesini isterim', tanim: 'Ibadetle dunya menfaatini murad etmek', ornek: 'Bir iyilik yaptiginda, kimse gormedi mi diye icinde hafif bir bosluk hissediyorsun.' },
    { id: 'tefahur', soru: 'Sahip olduklarimla ovunme egilimim var', tanim: 'Mal, makam, nesep gibi dunyevi seylerle buyuklenmek', ornek: 'Konusmalar sirasinda basarilarini, gecmisini ya da sahip olduklarini sikca gundeme getirdigini fark ediyorsun.' },
    { id: 'batar', soru: 'Nimetler karsisinda sukur yerine simarik bir sevinc yasarim', tanim: 'Nimete kavusunca sukur yerine simariklikla ferahlamak', ornek: 'Iyi bir haber aldiginda ilk tepkin sevincten cok iste boyle olur hissi oluyor.' },
    { id: 'heva', soru: 'Aklima gelen her istegin pesinden giderim', tanim: 'Nefsin mesru olmayan arzularina uymak', ornek: 'Bir seyi istememeye karar versem bile, bir sure sonra kendimi onu yaparken buluyorum.' },
    { id: 'lub', soru: 'Bos eglenceler zamanimi tuketir', tanim: 'Oyun ve gecici eglencelere dalmak', ornek: 'Onemli seyleri erteleyip anlik eglenceler icin zaman harcadigini fark ediyorsun.' },
    { id: 'zur', soru: 'Birini kotulemek icin gercegi carpitirim', tanim: 'Buhtana yakin, baskasini kucultmek icin soylenen yalan', ornek: 'Birinden sikayet ederken olayi oldugundan farkli anlattigin olmustur.' },
    { id: 'kizb', soru: 'Zaman zaman yalan soylerim', tanim: 'Mutlak yalan — gercegi soylemekten kacinmak', ornek: 'Zor bir durumdan kurtulmak ya da birini uzmemek icin gercek olmayan seyler soyledigin oluyor.' },
    { id: 'giss', soru: 'Baskalari manipule ederim', tanim: 'Icinde baska niyet tasiyarak disarida farkli gorunmek', ornek: 'Birini bir seye ikna ederken asil niyetini acikca soylemedin olmustur.' },
    { id: 'hadia', soru: 'Insanlari yaniltirim', tanim: 'Aldatmak — soz ya da davranisla yanilgiya dusurmek', ornek: 'Birinin yanlis anlamasina izin verdigin ya da bunu kullandigin olmustur.' },
    { id: 'tefrit', soru: 'Dini yukumluluklerimi erteleyip ihmal ederim', tanim: 'Ser-i serifle amelde kusur ve ihmal etmek', ornek: 'Namaz, oruc gibi yukumlulukleri ertelediginde icinde hafif bir sikisma hissediyorsun ama geciyor.' },
  ]},
  { id: 'heva', ad: 'Heva Cephesi', ad_ar: '\u062C\u0628\u0647\u0629 \u0627\u0644\u0647\u0648\u0649', aciklama: 'Nefsin tutkularinin yonettigi cephe', askerler: [
    { id: 'hased', soru: 'Birinin basarisi karsisinda icimde bir sikisma hissederim', tanim: 'Baskasindaki nimetin gitmesini ya da ona ulasamamasini istemek', ornek: 'Bir arkadasin terfi aldiginda sevinmek istiyorsun ama bir kosede neden o ben degil sorusu dolaniyor.' },
    { id: 'tecebbur', soru: 'Haksizlik etme egilimim var', tanim: 'Zalim olmak — gucu haksiz yere kullanmak', ornek: 'Elinde firsat ya da otorite oldugunda, bunu kendi cikarin icin kullandigin olmustur.' },
    { id: 'ucub', soru: 'Basarilarimin kendi cabamdan kaynaklandigini dusunurum', tanim: 'Basariyi Hakkin lutfundan degil kendinden bilmek', ornek: 'Bir seyi basardiginda Allah nasip etti demek yerine ben yaptim hissi one geciyor.' },
    { id: 'tekebbur', soru: 'Kendimi baskasindan ustun goruyorum', tanim: 'Buyukluk ve iyilik iddiasiyla baskalari kuculusemek', ornek: 'Bazi insanlarla konusurken onlari icten ice yetersiz ya da siradan buldugun oluyor.' },
    { id: 'gill', soru: 'Icim disima uymaz', tanim: 'Disarida farkli gorunup iceride baska hissetmek', ornek: 'Guler yuz gostersen de icinde o kisiye karsi sogukluk ya da kirginlik tasidigini oluyor.' },
    { id: 'mekr', soru: 'Amacima ulasmak icin hile yaparim', tanim: 'Hile etmek — dolayli yollarla istedigini elde etmek', ornek: 'Dogrudan sormak yerine dolayli yollarla ya da oyunlarla istedigini elde etmeye calistigin olmustur.' },
    { id: 'vesvese', soru: 'Zihnim karanlik ve supheli dusuncelerle dolar', tanim: 'Gonlunde yerlesen gizli karanlik kelam', ornek: 'Zihnin bazen seni surukledigi dusuncelerden rahatsiz oluyorsun ama onlari durduramiiyorsun.' },
    { id: 'gadr', soru: 'Verdigim sozu tutmam', tanim: 'Hiyanet edip dogrulugunu yitirmek', ornek: 'Verdigin sozu ya da taahüdü sartlar degisince kolayca gecersiz saydigin olmustur.' },
    { id: 'hikd', soru: 'Kin beslerim', tanim: 'Kin tutmak — birine karsi duyguyu icte yasatmak', ornek: 'Yillar once yasanan bir olay aklina geldiginde hala ayni aciyi ya da ofkeyi hissediyorsun.' },
    { id: 'muhalefet', soru: 'Kurallara ve otoriteye uymakta zorlanirim', tanim: 'Ilahi ve seri emirlere uymaktan icten kacinmak', ornek: 'Bir kural ya da emir mantikli gelse bile, sirf biri soyledi diye ona uymakta icsel bir direnc hissediyorsun.' },
  ]},
  { id: 'nefs', ad: 'Nefs Cephesi', ad_ar: '\u062C\u0628\u0647\u0629 \u0627\u0644\u0646\u0641\u0633', aciklama: 'Nefsin zayifliklarindan beslenen cephe', askerler: [
    { id: 'hirs', soru: 'Baskasindaki gibi ben de istiyorum diye arzulara kapilirim', tanim: 'Baskasinda gordugu nimete benzerini elde etmek icin arzuya dusmek', ornek: 'Birinin sahip oldugu bir seyi gorunce bende de olsaydi dusuncesi zihni mesgul etmeye basliyor.' },
    { id: 'sehvet', soru: 'Nefsimin isteklerine kolayca boyun egerim', tanim: 'Nefsin muvafik olani talep etmesi — dizginlenemeyen arzu', ornek: 'Yapmamaya karar verdigin bir seyi, o an onune gelince yapiveriyorsun.' },
    { id: 'suhh', soru: 'Sahip olduklarimi paylasmakta zorlanirim', tanim: 'Uzerinden ve baskasindan eli tutmak — asiri pintilik', ornek: 'Paylasman gereken bir seyi verirken icinde belirgin bir isteksizlik ya da pismanlik hissediyorsun.' },
    { id: 'ragbet', soru: 'Iyilik yerine dunyevi seylere yonelirim', tanim: 'Hayra meyletmeyip baska seylere yonelmek', ornek: 'Degerli biliyorsun ama zamanin buyuk bolumu seni asil gelistirecek seyler icin degil baska seyler icin geciyor.' },
    { id: 'zayig', soru: 'Batil ve anlamsiz seylere meyledigimi fark ederim', tanim: 'Batila meyledip egilmek — degersiz olana kayma', ornek: 'Zamaninin ya da enerjinin onemli bir kisminin gercekten anlam ifade etmeyen seylere gittigini goruyorsun.' },
    { id: 'kasavet', soru: 'Gunahlarim beni etkilemez, vicdan azabi duymam', tanim: 'Kalbin katilasmassi — gunahtan elem duymamak', ornek: 'Yanlis bir sey yaptiginda icinde bir sizi yerine zaten herkes yapar hissi geliyor.' },
    { id: 'buhl', soru: 'Vermem gereken yerde cimri davranirim', tanim: 'Seran ve muruvveten gerekli yerde mali harcamamak', ornek: 'Insan iliskilerinde ya da hayirda vermesi gereken yerde gerekce arayip erteledigin oluyor.' },
    { id: 'emel', soru: 'Gercekci olmayan hayaller kurarak oyalanirim', tanim: 'Uzun arzu ve temenni — ahireti unutturan dunya hayalleri', ornek: 'Gelecek icin buyuk planlar kuruyorsun ama bugun yapman gerekenleri surekli yarina birakiyorsun.' },
    { id: 'tama', soru: 'Supheli de olsa elde etmek icin cabalarim', tanim: 'Haram veya mekruha ihtimali olan seyi elde etmeye kast etmek', ornek: 'Bir seyin dogrulundangun tam emin olmassan da elde etmek icin gormezden geldigin olmustur.' },
    { id: 'kesel', soru: 'Ibadet ve sorumlulukdlarimda tembellik yaparim', tanim: 'Sustluk — ibadet ve sorumlulukdlarda yorgunluk ve isteksizlik', ornek: 'Yapman gerektigini bildigin seyleri surekli erteliyorsun, baslamak icin bir turlu dogru an gelmiyor.' },
  ]},
  { id: 'seytan', ad: 'Seytan Cephesi', ad_ar: '\u062C\u0628\u0647\u0629 \u0627\u0644\u0634\u064A\u0637\u0627\u0646', aciklama: 'Iman ve inanc savasinin cephesi', askerler: [
    { id: 'zulum', soru: 'Haksizlik yaparim', tanim: 'Seyin mevziine uygun olmayan yere konulmasi', ornek: 'Guc ya da bilgi avantajini birinin aleyhine kullandigin, buna ragmen haksizlik etmedim dedigin olmustur.' },
    { id: 'hiyanet', soru: 'Guvenilir degilimdir', tanim: 'Isinde hainlik edip dogru sozu saklayip soylememek', ornek: 'Biri sana bir seyi emanet ettiginde ya da guvendiginde beklentisini tam karsilamadigin olmustur.' },
    { id: 'kufur', soru: 'Iman ve inanc konularinda ciddi supheler yasarim', tanim: 'Mumin olmak gerekirken mumin olmamak', ornek: 'Bazi anlarda temel inancharina dair icten bir suphe ya da sogukluk hissediyorsun.' },
    { id: 'terk_ane', soru: 'Yardim etmem gereken yerde seyirci kalirim', tanim: 'Yerinde ve zamaninda yardim etmemek', ornek: 'Birisinin zor durumda oldugunu gordugunde yardim etme kapasiten olsa da gecip gittigin olmustur.' },
    { id: 'bugz', soru: 'Dindar ve erdemli insanlara karsi icimde sogukluk var', tanim: 'Ulemayi ve salihleri sevmemek', ornek: 'Dini hassasiyetleri olan insanlar soz konusu olunca icinde aciklamsasi guc bir sogukluk ya da rahatsizlik beliriyor.' },
    { id: 'nifak', soru: 'Sozlerim ve davranislarim birbiriyle celisir', tanim: 'Sozu isine ve icerisi disina muhalif olmak', ornek: 'Dogruluktan, durustlukten soz ederken davranislarinla bunu yansitmadigin olmustur.' },
    { id: 'sekk', soru: 'Allahin gucune dair suphelerim olur', tanim: 'Hak Tealanin her seye gucunun yettigine dair suphe', ornek: 'Zor bir durumda Allah bunu duzeltebilir mi sorusu degil duzeltmeyecek hissi geliyor.' },
    { id: 'hilaf_emr', soru: 'Ilahi emirlere uymakta direnc gosteririm', tanim: 'Hak Tealanin emrine ve emrettigine icten uymamak', ornek: 'Bir emri bildigin halde simdi degil deyip surekli erteledigin ya da gecerli saymaigin oluyor.' },
    { id: 'tegaful', soru: 'Sunneti ve dini pratikleri onemsemem', tanim: 'Sunnetten gafil olmak — onu hayattan dislamak', ornek: 'Sunnetin onemli oldugunu biliyorsun ama pratikte hayatinda cok az yer kapliyor.' },
    { id: 'bidat', soru: 'Dinde olmayan seyleri dine dahil ederim', tanim: 'Rasul ve Sahabe den sonra izinsiz dinde icat etmek', ornek: 'Dini konularda herkes boyle yapiyor ya da ben boyle hissediyorum gerekcresiyle kaynaklarda olmayan seyleri benimsedigin olmustur.' },
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

              {/* Attack lines — dashed animated */}
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
              {/* Dunya — top */}
              <text x="250" y="40" textAnchor="middle" fill="#D4A843" fontFamily={cinzel.style.fontFamily} fontSize="9" letterSpacing="2" opacity="0.7">ONDEN</text>
              <text x="250" y="55" textAnchor="middle" fill="#D4A843" fontFamily={cinzel.style.fontFamily} fontSize="13" opacity="0.9">Dunya</text>

              {/* Heva — right */}
              <text x="450" y="220" textAnchor="middle" fill="#78A0C8" fontFamily={cinzel.style.fontFamily} fontSize="9" letterSpacing="2" opacity="0.7">SAGDAN</text>
              <text x="450" y="235" textAnchor="middle" fill="#78A0C8" fontFamily={cinzel.style.fontFamily} fontSize="13" opacity="0.9">Heva</text>

              {/* Nefs — left */}
              <text x="50" y="220" textAnchor="middle" fill="#C47878" fontFamily={cinzel.style.fontFamily} fontSize="9" letterSpacing="2" opacity="0.7">SOLDAN</text>
              <text x="50" y="235" textAnchor="middle" fill="#C47878" fontFamily={cinzel.style.fontFamily} fontSize="13" opacity="0.9">Nefs</text>

              {/* Seytan — bottom */}
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
            <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 20, color: '#1A2E1E', marginBottom: 8 }}>Bu Ozellik Uyelere Ozeldir</div>
            <p style={{ fontSize: 14, color: 'rgba(0,0,0,0.5)', lineHeight: 1.6, marginBottom: 24 }}>
              Kalp Sehri karakter analizini kullanmak icin giris yapin veya uye olun.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button onClick={() => router.push('/giris')}
                style={{ padding: '12px 28px', borderRadius: 10, background: '#1A2E1E', color: '#D4A843', fontFamily: cinzel.style.fontFamily, fontSize: 14, fontWeight: 600, letterSpacing: 1, border: 'none', cursor: 'pointer' }}>
                Giris Yap
              </button>
              <button onClick={() => router.push('/kayit')}
                style={{ padding: '12px 28px', borderRadius: 10, background: '#D4A843', color: '#1A2E1E', fontFamily: cinzel.style.fontFamily, fontSize: 14, fontWeight: 600, letterSpacing: 1, border: 'none', cursor: 'pointer' }}>
                Uye Ol
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
