'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Cinzel, EB_Garamond } from 'next/font/google'
import { createClient } from '@/lib/supabase'
import Header from '../components/Header'
import Footer from '../components/Footer'

const cinzel = Cinzel({ display: 'swap', preload: false, subsets: ['latin', 'latin-ext'], weight: ['400', '500', '600'] })
const garamond = EB_Garamond({ display: 'swap', preload: false, subsets: ['latin', 'latin-ext'], weight: ['400', '500'], style: ['normal', 'italic'] })

const C = {
  primary: '#1C3A26', gold: '#8B6914', cream: '#FAF7F2',
  dark: '#1C1C1C', secondary: '#6B5744', border: '#E8DFD4',
  white: '#FFFFFF', surface: '#FAF7F2',
}

const CEPHE_RENK: Record<string, string> = { dunya: '#2563EB', heva: '#F59E0B', nefs: '#DC2626', seytan: '#7C3AED' }
const CEPHE_YON: Record<string, string> = { dunya: 'ONDEN', heva: 'SAGDAN', nefs: 'SOLDAN', seytan: 'ENSEDEN' }

const CEVAPLAR = [
  { value: 0, label: 'Hic', alt: 'Bu beni tanimlamiyor' },
  { value: 1, label: 'Bazen', alt: 'Nadiren, fark ediyorum' },
  { value: 2, label: 'Siklikla', alt: 'Cogu zaman boyle oluyor' },
  { value: 3, label: 'Cogunlukla', alt: 'Guclu sekilde tanimliyor' },
]

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

export default function KarakterAnaliziPage() {
  const router = useRouter()
  const supabase = createClient()
  const [soruIndex, setSoruIndex] = useState(0)
  const [cevaplar, setCevaplar] = useState<Record<string, number>>({})
  const [fizikselMizac, setFizikselMizac] = useState('')
  const [yukleniyor, setYukleniyor] = useState(false)
  const [gorunum, setGorunum] = useState<'harita' | 'form' | 'sonuc' | 'paywall'>('harita')
  const [toast, setToast] = useState<{ mesaj: string, tip: 'hata' | 'basari' } | null>(null)
  const formRef = useRef<HTMLDivElement>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isAbone, setIsAbone] = useState(false)
  const [authModal, setAuthModal] = useState(false)

  function gosterToast(mesaj: string, tip: 'hata' | 'basari' = 'hata') {
    setToast({ mesaj, tip }); setTimeout(() => setToast(null), 4000)
  }

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      setIsLoggedIn(true)
      // Fiziksel mizac
      const { data } = await supabase.from('analyses').select('sonuc_json').order('created_at', { ascending: false }).limit(1).single()
      if (data?.sonuc_json?.mizac_tipi || data?.sonuc_json?.mizac) setFizikselMizac(data.sonuc_json.mizac_tipi || data.sonuc_json.mizac || '')
      // Abonelik kontrol
      const { data: ab } = await supabase.from('abonelikler').select('durum').eq('kullanici_id', user.id).eq('durum', 'aktif').single()
      setIsAbone(!!ab)
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
      setGorunum(isAbone ? 'sonuc' : 'paywall')
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

  return (
    <div style={{ background: C.cream, minHeight: '100vh', fontFamily: garamond.style.fontFamily }}>
      <Header />

      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, background: toast.tip === 'hata' ? '#FCEBEB' : '#EAF3DE', border: `1px solid ${toast.tip === 'hata' ? '#F7C1C1' : '#C0DD97'}`, color: toast.tip === 'hata' ? '#A32D2D' : '#3B6D11', padding: '14px 20px', borderRadius: 10, fontSize: 13, maxWidth: 360, boxShadow: '0 4px 20px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span>{toast.mesaj}</span>
          <button onClick={() => setToast(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'inherit' }}>{'\u2715'}</button>
        </div>
      )}

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px 60px' }}>

        {/* BASLIK */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontFamily: cinzel.style.fontFamily, fontSize: 'clamp(28px, 5vw, 38px)', color: C.primary, marginBottom: 8, fontWeight: 500 }}>{"Kalp Sehri"}</h1>
          <p style={{ fontSize: 16, color: C.secondary, fontStyle: 'italic', maxWidth: 500, margin: '0 auto 14px' }}>{"Klasik Islam dusuncesi cercevesinde oz-degerlendirme"}</p>
          <div style={{ background: '#FFF8E7', border: `1px solid ${C.gold}`, borderRadius: 10, padding: '10px 16px', fontSize: 12, color: C.secondary, display: 'inline-block' }}>
            {"Bu arac tibbi veya psikolojik tedavinin yerini tutmaz."}
          </div>
        </div>

        {/* HARITA */}
        {gorunum === 'harita' && (
          <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: '28px', marginBottom: 28 }}>
            <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 10, color: C.gold, letterSpacing: 3, textAlign: 'center', marginBottom: 20 }}>{"KALBIN KUSATMA HARITASI"}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'auto auto auto', gap: 12, maxWidth: 480, margin: '0 auto' }}>
              {/* Ust orta: Dunya */}
              <div />
              <button onClick={() => { if (!isLoggedIn) { setAuthModal(true); return } setGorunum('form'); setSoruIndex(0) }} style={{ background: `${CEPHE_RENK.dunya}10`, border: `1.5px solid ${CEPHE_RENK.dunya}`, borderRadius: 12, padding: '14px 10px', cursor: 'pointer', textAlign: 'center' }}>
                <div style={{ fontSize: 9, color: CEPHE_RENK.dunya, letterSpacing: 2 }}>ONDEN</div>
                <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 14, color: C.primary, marginTop: 4 }}>Dunya</div>
                <div style={{ fontSize: 13, color: C.gold, fontFamily: 'serif' }}>{CEPHELER[0].ad_ar}</div>
                <div style={{ fontSize: 10, color: '#999', marginTop: 4 }}>10 asker</div>
              </button>
              <div />

              {/* Orta: Nefs — Kalp — Heva */}
              <button onClick={() => { if (!isLoggedIn) { setAuthModal(true); return } setGorunum('form'); setSoruIndex(20) }} style={{ background: `${CEPHE_RENK.nefs}10`, border: `1.5px solid ${CEPHE_RENK.nefs}`, borderRadius: 12, padding: '14px 10px', cursor: 'pointer', textAlign: 'center' }}>
                <div style={{ fontSize: 9, color: CEPHE_RENK.nefs, letterSpacing: 2 }}>SOLDAN</div>
                <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 14, color: C.primary, marginTop: 4 }}>Nefs</div>
                <div style={{ fontSize: 13, color: C.gold, fontFamily: 'serif' }}>{CEPHELER[2].ad_ar}</div>
                <div style={{ fontSize: 10, color: '#999', marginTop: 4 }}>10 asker</div>
              </button>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                  <span style={{ fontSize: 24, color: C.gold }}>{'\u2665'}</span>
                  <span style={{ fontFamily: cinzel.style.fontFamily, fontSize: 10, color: C.gold, letterSpacing: 2 }}>KALP</span>
                </div>
              </div>
              <button onClick={() => { if (!isLoggedIn) { setAuthModal(true); return } setGorunum('form'); setSoruIndex(10) }} style={{ background: `${CEPHE_RENK.heva}10`, border: `1.5px solid ${CEPHE_RENK.heva}`, borderRadius: 12, padding: '14px 10px', cursor: 'pointer', textAlign: 'center' }}>
                <div style={{ fontSize: 9, color: CEPHE_RENK.heva, letterSpacing: 2 }}>SAGDAN</div>
                <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 14, color: C.primary, marginTop: 4 }}>Heva</div>
                <div style={{ fontSize: 13, color: C.gold, fontFamily: 'serif' }}>{CEPHELER[1].ad_ar}</div>
                <div style={{ fontSize: 10, color: '#999', marginTop: 4 }}>10 asker</div>
              </button>

              {/* Alt orta: Seytan */}
              <div />
              <button onClick={() => { if (!isLoggedIn) { setAuthModal(true); return } setGorunum('form'); setSoruIndex(30) }} style={{ background: `${CEPHE_RENK.seytan}10`, border: `1.5px solid ${CEPHE_RENK.seytan}`, borderRadius: 12, padding: '14px 10px', cursor: 'pointer', textAlign: 'center' }}>
                <div style={{ fontSize: 9, color: CEPHE_RENK.seytan, letterSpacing: 2 }}>ENSEDEN</div>
                <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 14, color: C.primary, marginTop: 4 }}>Seytan</div>
                <div style={{ fontSize: 13, color: C.gold, fontFamily: 'serif' }}>{CEPHELER[3].ad_ar}</div>
                <div style={{ fontSize: 10, color: '#999', marginTop: 4 }}>10 asker</div>
              </button>
              <div />
            </div>
            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <button onClick={() => { if (!isLoggedIn) { setAuthModal(true); return } setGorunum('form'); setSoruIndex(0) }}
                style={{ padding: '14px 36px', background: C.primary, border: 'none', borderRadius: 12, color: C.gold, fontFamily: cinzel.style.fontFamily, fontSize: 14, fontWeight: 600, cursor: 'pointer', letterSpacing: 2 }}>
                {"BASLAT"}
              </button>
            </div>
          </div>
        )}

        {/* FORM */}
        {gorunum === 'form' && mevcutSoru && (
          <div ref={formRef}>
            {/* Progress */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#999', marginBottom: 6 }}>
                <span>{mevcutSoru.cephe.ad} {'\u00b7'} {mevcutSoru.askerIdx + 1}/10</span>
                <span>{soruIndex + 1}/{toplamSoru}</span>
              </div>
              <div style={{ height: 4, background: C.border, borderRadius: 2 }}>
                <div style={{ height: 4, background: CEPHE_RENK[mevcutSoru.cephe.id], borderRadius: 2, width: `${((soruIndex + 1) / toplamSoru) * 100}%`, transition: 'width 0.3s' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              {/* SOL: Asker kimligi */}
              <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: '24px' }}>
                <div style={{ fontSize: 10, color: CEPHE_RENK[mevcutSoru.cephe.id], letterSpacing: 2, marginBottom: 6 }}>
                  {mevcutSoru.cephe.ad.toUpperCase()} {'\u00b7'} {CEPHE_YON[mevcutSoru.cephe.id]} {'\u00b7'} {mevcutSoru.askerIdx + 1}/10
                </div>
                <h2 style={{ fontFamily: cinzel.style.fontFamily, fontSize: 22, color: C.primary, marginBottom: 4 }}>{mevcutSoru.id.charAt(0).toUpperCase() + mevcutSoru.id.slice(1).replace('_', ' ')}</h2>
                <div style={{ background: C.surface, borderLeft: `3px solid ${C.gold}`, borderRadius: '0 8px 8px 0', padding: '10px 14px', marginBottom: 12, fontSize: 13, color: C.secondary, lineHeight: 1.6 }}>
                  {mevcutSoru.tanim}
                </div>
                <div style={{ background: '#FFF8E7', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: C.secondary, fontStyle: 'italic', lineHeight: 1.6 }}>
                  {mevcutSoru.ornek}
                </div>
              </div>

              {/* SAG: Soru */}
              <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ width: 4, height: 32, background: CEPHE_RENK[mevcutSoru.cephe.id], borderRadius: 2, marginBottom: 16 }} />
                <p style={{ fontFamily: cinzel.style.fontFamily, fontSize: 18, color: C.primary, lineHeight: 1.5, marginBottom: 24 }}>
                  {mevcutSoru.soru}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {CEVAPLAR.map(c => {
                    const secili = cevaplar[mevcutSoru.id] === c.value
                    return (
                      <button key={c.value} onClick={() => cevapVer(c.value)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                          borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                          border: `1.5px solid ${secili ? C.primary : C.border}`,
                          background: secili ? `${C.primary}08` : C.white,
                          borderLeft: secili ? `4px solid ${C.primary}` : `4px solid transparent`,
                        }}>
                        <div>
                          <div style={{ fontSize: 14, color: secili ? C.primary : C.dark, fontWeight: secili ? 600 : 400 }}>{c.label}</div>
                          <div style={{ fontSize: 11, color: '#999' }}>{c.alt}</div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Nav */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
              <button onClick={() => { if (soruIndex > 0) setSoruIndex(soruIndex - 1); else setGorunum('harita') }}
                style={{ padding: '10px 24px', border: `1px solid ${C.border}`, borderRadius: 8, background: C.white, color: C.secondary, cursor: 'pointer', fontSize: 13 }}>
                {soruIndex > 0 ? '\u2190 Onceki' : '\u2190 Harita'}
              </button>
              {soruIndex < toplamSoru - 1 && (
                <button onClick={() => setSoruIndex(soruIndex + 1)}
                  style={{ padding: '10px 24px', background: C.primary, border: 'none', borderRadius: 8, color: C.gold, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                  {"Sonraki \u2192"}
                </button>
              )}
            </div>

            <style>{`@media(max-width:768px){[style*="grid-template-columns: 1fr 1fr"]{grid-template-columns:1fr !important}}`}</style>
          </div>
        )}

        {/* SONUC EKRANI */}
        {gorunum === 'sonuc' && (
          <div>
            <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: '24px', marginBottom: 20 }}>
              <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 12, color: C.gold, letterSpacing: 2, marginBottom: 16 }}>{"CEPHE SKORLARI"}</div>
              {CEPHELER.map(c => {
                const skor = cepheSkoru(c.id)
                const renk = skor > 60 ? '#C62828' : skor > 35 ? '#F57C00' : '#2E7D32'
                return (
                  <div key={c.id} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                      <span style={{ color: C.dark }}>{c.ad}</span>
                      <span style={{ color: renk, fontWeight: 600 }}>{skor}%</span>
                    </div>
                    <div style={{ height: 6, background: '#eee', borderRadius: 3 }}>
                      <div style={{ height: 6, background: CEPHE_RENK[c.id], borderRadius: 3, width: `${skor}%`, transition: 'width 0.5s' }} />
                    </div>
                  </div>
                )
              })}
              <div style={{ fontSize: 11, color: '#999', marginTop: 10 }}>{"Aktif asker:"} {aktifAskerler().length}/40</div>
            </div>

            {fizikselMizac && (
              <div style={{ background: C.surface, borderRadius: 10, border: `1px solid ${C.border}`, padding: '12px 16px', marginBottom: 16, fontSize: 13 }}>
                <span style={{ color: '#999' }}>{"Fiziksel mizac:"} </span>
                <span style={{ color: C.primary, fontWeight: 600 }}>{fizikselMizac}</span>
              </div>
            )}
            {!fizikselMizac && (
              <div style={{ background: '#FFF8E7', borderRadius: 10, border: `1px solid ${C.gold}`, padding: '12px 16px', marginBottom: 16, fontSize: 12, color: C.secondary }}>
                {"Fiziksel mizaç analiziniz bulunamadi."}{' '}
                <a href="/analiz" style={{ color: C.gold, fontWeight: 600 }}>{"Mizac analizi yapmak ister misiniz?"}</a>
              </div>
            )}

            <button onClick={gonder} disabled={yukleniyor}
              style={{ width: '100%', padding: '16px', background: yukleniyor ? '#999' : C.primary, border: 'none', borderRadius: 12, cursor: yukleniyor ? 'not-allowed' : 'pointer', fontFamily: cinzel.style.fontFamily, fontSize: 15, fontWeight: 600, color: C.gold, letterSpacing: 2 }}>
              {yukleniyor ? 'Analiz ediliyor...' : 'ANALIZIMI TAMAMLA'}
            </button>
            <button onClick={() => { setGorunum('form'); setSoruIndex(0) }}
              style={{ width: '100%', marginTop: 8, padding: '10px', background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 8, cursor: 'pointer', fontSize: 12, color: C.secondary }}>
              {"Cevaplari duzenle"}
            </button>
          </div>
        )}
        {/* PAYWALL — giris yapmis ama abone degil */}
        {gorunum === 'paywall' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: '40px 32px', marginBottom: 20 }}>
              {/* Bulanik onizleme */}
              <div style={{ filter: 'blur(6px)', pointerEvents: 'none', userSelect: 'none', marginBottom: 20 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {CEPHELER.map(c => (
                    <div key={c.id} style={{ background: C.surface, borderRadius: 10, padding: 16 }}>
                      <div style={{ fontSize: 13, color: C.primary, fontWeight: 600 }}>{c.ad}</div>
                      <div style={{ fontSize: 24, color: CEPHE_RENK[c.id], fontWeight: 600, marginTop: 4 }}>{cepheSkoru(c.id)}%</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ position: 'relative', marginTop: -60, paddingTop: 20, background: 'rgba(255,255,255,0.85)', borderRadius: 12 }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>{'\uD83D\uDD12'}</div>
                <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 20, color: C.primary, marginBottom: 8 }}>Sonuclari Gormek Icin Plan Secin</div>
                <p style={{ fontSize: 14, color: C.secondary, lineHeight: 1.6, marginBottom: 24, maxWidth: 400, margin: '0 auto 24px' }}>
                  Sorulari tamamladiniz. Detayli karakter analizi sonuclarinizi ve kisisel tavsiyeleri gormek icin uyelik plani secin.
                </p>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' as const }}>
                  <button onClick={() => router.push('/odeme')}
                    style={{ padding: '14px 32px', background: C.gold, border: 'none', borderRadius: 10, fontFamily: cinzel.style.fontFamily, fontSize: 14, fontWeight: 600, color: C.primary, cursor: 'pointer', letterSpacing: 1 }}>
                    Plan Sec — 590{'\u20BA'}/ay
                  </button>
                </div>
              </div>
            </div>
            <button onClick={() => { setGorunum('form'); setSoruIndex(0) }}
              style={{ padding: '10px 20px', background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12, color: C.secondary, cursor: 'pointer' }}>
              Cevaplari Duzenle
            </button>
          </div>
        )}
      </div>

      {/* AUTH MODAL — giris yapmamis */}
      {authModal && (
        <div onClick={() => setAuthModal(false)} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: C.white, borderRadius: 20, maxWidth: 420, width: '100%', padding: '40px 36px', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>{'\uD83D\uDD12'}</div>
            <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 20, color: C.primary, marginBottom: 8 }}>Bu Ozellik Uyelere Ozeldir</div>
            <p style={{ fontSize: 14, color: C.secondary, lineHeight: 1.6, marginBottom: 24 }}>
              Kalp Sehri karakter analizini kullanmak icin giris yapin veya uye olun.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button onClick={() => router.push('/giris')}
                style={{ padding: '12px 28px', borderRadius: 10, background: C.primary, color: C.gold, fontFamily: cinzel.style.fontFamily, fontSize: 14, fontWeight: 600, letterSpacing: 1, border: 'none', cursor: 'pointer' }}>
                Giris Yap
              </button>
              <button onClick={() => router.push('/kayit')}
                style={{ padding: '12px 28px', borderRadius: 10, background: C.gold, color: C.primary, fontFamily: cinzel.style.fontFamily, fontSize: 14, fontWeight: 600, letterSpacing: 1, border: 'none', cursor: 'pointer' }}>
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

      <Footer />
    </div>
  )
}
