'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Cinzel, EB_Garamond } from 'next/font/google'
import { createClient } from '@/lib/supabase'
import Header from '../components/Header'
import Footer from '../components/Footer'

const cinzel = Cinzel({ subsets: ['latin', 'latin-ext'], weight: ['400', '500', '600'] })
const garamond = EB_Garamond({ subsets: ['latin', 'latin-ext'], weight: ['400', '500'], style: ['normal', 'italic'] })

const C = {
  primary: '#1B4332', gold: '#C9A84C', cream: '#F5EFE6',
  dark: '#1C1C1C', secondary: '#5C4A2A', border: '#E0D5C5',
  white: '#FFFFFF', surface: '#FAF7F2',
}

const CEVAP_SECENEKLERI = [
  { value: 0, label: 'Hic' },
  { value: 1, label: 'Bazen' },
  { value: 2, label: 'Siklikla' },
  { value: 3, label: 'Cogunlukla' },
]

const CEPHELER = [
  {
    id: 'dunya', ad: 'Dunya Cephesi', ad_ar: '\u062C\u0628\u0647\u0629 \u0627\u0644\u062F\u0646\u064A\u0627',
    aciklama: 'Dunyanin aldatici cazibesine karsi savunma',
    sorular: [
      { asker: 'riya', soru: 'Yaptigim iyiliklerin fark edilmesini isterim' },
      { asker: 'tefahur', soru: 'Sahip olduklarimla ovunme egilimim var' },
      { asker: 'batar', soru: 'Nimetler karsisinda sukur yerine sevinc yasarim' },
      { asker: 'heva', soru: 'Aklima gelen her istegin pesinden giderim' },
      { asker: 'lub', soru: 'Bos eglenceler zamanimi tuketir' },
      { asker: 'zur', soru: 'Birini kotulemek icin gercegi carptitirim' },
      { asker: 'kizb', soru: 'Zaman zaman yalan soylerim' },
      { asker: 'giss', soru: 'Baskalari manipule ederim' },
      { asker: 'hadia', soru: 'Insanlari yaniltirim' },
      { asker: 'tefrit', soru: 'Dini yukumluluklerimi erteleyip ihmal ederim' },
    ],
  },
  {
    id: 'heva', ad: 'Heva Cephesi', ad_ar: '\u062C\u0628\u0647\u0629 \u0627\u0644\u0647\u0648\u0649',
    aciklama: 'Nefsin tutkularinin yonettigi cephe',
    sorular: [
      { asker: 'hased', soru: 'Baskasindaki nimeti icime sindiremem' },
      { asker: 'tecebbur', soru: 'Haksizlik etme egilimim var' },
      { asker: 'ucub', soru: 'Basarilarimin kendi cabamdan kaynaklandigini dusunurum' },
      { asker: 'tekebbur', soru: 'Kendimi baskasindan ustun goruyorum' },
      { asker: 'gill', soru: 'Icim disima uymaz' },
      { asker: 'mekr', soru: 'Amacima ulasmak icin hile yaparim' },
      { asker: 'vesvese', soru: 'Zihnim karanlik ve supheli dusuncelerle dolar' },
      { asker: 'gadr', soru: 'Verdigim sozu tutmam' },
      { asker: 'hikd', soru: 'Kin beslerim' },
      { asker: 'muhalefet', soru: 'Kurallara ve otoriteye uymakta zorlanirim' },
    ],
  },
  {
    id: 'nefs', ad: 'Nefs Cephesi', ad_ar: '\u062C\u0628\u0647\u0629 \u0627\u0644\u0646\u0641\u0633',
    aciklama: 'Nefsin zayifliklarindan beslenen cephe',
    sorular: [
      { asker: 'hirs', soru: 'Baskasindaki gibi ben de istiyorum diye arzulara kapilirim' },
      { asker: 'sehvet', soru: 'Nefsimin isteklerine kolayca boyun egerim' },
      { asker: 'suhh', soru: 'Sahip olduklarimi paylasmakta zorlanirim' },
      { asker: 'ragbet', soru: 'Iyilik yerine dunyevi seylere yonelirim' },
      { asker: 'zayig', soru: 'Batil ve anlamsiz seylere meyledigimi fark ederim' },
      { asker: 'kasavet', soru: 'Gunahlarim beni etkilemez, vicdan azabi duymam' },
      { asker: 'buhl', soru: 'Vermem gereken yerde cimri davranirim' },
      { asker: 'emel', soru: 'Gercekci olmayan hayaller kurarak oyalanirim' },
      { asker: 'tama', soru: 'Supheli de olsa elde etmek icin cabalarim' },
      { asker: 'kesel', soru: 'Ibadet ve sorumluluklarimda tembellik yaparim' },
    ],
  },
  {
    id: 'seytan', ad: 'Seytan Cephesi', ad_ar: '\u062C\u0628\u0647\u0629 \u0627\u0644\u0634\u064A\u0637\u0627\u0646',
    aciklama: 'Iman ve inanc savasinin cephesi',
    sorular: [
      { asker: 'zulum', soru: 'Haksizlik yaparim' },
      { asker: 'hiyanet', soru: 'Guvenilir degilimdir' },
      { asker: 'kufur', soru: 'Iman ve inanc konularinda ciddi supheler yasarim' },
      { asker: 'terk_ane', soru: 'Yardim etmem gereken yerde seyirci kalirim' },
      { asker: 'bugz', soru: 'Dindar ve erdemli insanlara karsi icimde sogukluk var' },
      { asker: 'nifak', soru: 'Sozlerim ve davranislarim birbiriyle celisir' },
      { asker: 'sekk', soru: 'Allahin gucune dair suphelerim olur' },
      { asker: 'hilaf_emr', soru: 'Ilahi emirlere uymakta direnc gosteririm' },
      { asker: 'tegaful', soru: 'Sunneti ve dini pratikleri onemsemem' },
      { asker: 'bidat', soru: 'Dinde olmayan seyleri dine dahil ederim' },
    ],
  },
]

export default function KarakterAnaliziPage() {
  const router = useRouter()
  const supabase = createClient()
  const [adim, setAdim] = useState(0) // 0-3 cepheler, 4 = gonder
  const [cevaplar, setCevaplar] = useState<Record<string, number>>({})
  const [fizikselMizac, setFizikselMizac] = useState('')
  const [yukleniyor, setYukleniyor] = useState(false)
  const [toast, setToast] = useState<{ mesaj: string, tip: 'hata' | 'basari' } | null>(null)

  function gosterToast(mesaj: string, tip: 'hata' | 'basari' = 'hata') {
    setToast({ mesaj, tip })
    setTimeout(() => setToast(null), 4000)
  }

  // Fiziksel mizac otomatik cek
  useEffect(() => {
    async function mizacCek() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('analyses')
        .select('sonuc_json')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      if (data?.sonuc_json?.mizac_tipi || data?.sonuc_json?.mizac) {
        setFizikselMizac(data.sonuc_json.mizac_tipi || data.sonuc_json.mizac || '')
      }
    }
    mizacCek()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function cevapVer(asker: string, deger: number) {
    setCevaplar(prev => ({ ...prev, [asker]: deger }))
  }

  const mevcutCephe = CEPHELER[adim] || null
  const toplamSoru = 40
  const cevaplanmisSoru = Object.keys(cevaplar).length
  const ilerleme = Math.round((cevaplanmisSoru / toplamSoru) * 100)

  // Cephe skoru hesapla
  function cepheSkoru(cepheId: string): number {
    const cephe = CEPHELER.find(c => c.id === cepheId)
    if (!cephe) return 0
    const toplam = cephe.sorular.reduce((s, q) => s + (cevaplar[q.asker] || 0), 0)
    return Math.round((toplam / (cephe.sorular.length * 3)) * 100)
  }

  // Aktif askerler (skor >= 2)
  function aktifAskerler(): string[] {
    return Object.entries(cevaplar)
      .filter(([, v]) => v >= 2)
      .map(([k]) => k)
  }

  async function gonder() {
    if (cevaplanmisSoru < 20) {
      gosterToast('Lutfen en az 20 soruyu cevaplayin.')
      return
    }
    setYukleniyor(true)

    try {
      const aktif = aktifAskerler()
      const skorlar = {
        dunya: cepheSkoru('dunya'),
        heva: cepheSkoru('heva'),
        nefs: cepheSkoru('nefs'),
        seytan: cepheSkoru('seytan'),
      }

      // API cagir
      const res = await fetch('/api/karakter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          form_cevaplari: { cevaplar, skorlar },
          fiziksel_mizac: fizikselMizac,
          aktif_askerler: aktif,
        }),
      })

      const sonuc = await res.json()

      if (sonuc.kriz_tespit) {
        gosterToast(sonuc.kriz_mesaji || 'Lutfen bir uzmana danisin.', 'hata')
        setYukleniyor(false)
        return
      }

      // LocalStorage'a kaydet ve yonlendir
      localStorage.setItem('ipekyolu_karakter_sonuc', JSON.stringify(sonuc))
      localStorage.setItem('ipekyolu_karakter_skorlar', JSON.stringify(skorlar))
      router.push('/karakter/sonuc')
    } catch {
      gosterToast('Analiz sirasinda hata olustu. Tekrar deneyin.')
    }
    setYukleniyor(false)
  }

  return (
    <div style={{ background: C.cream, minHeight: '100vh', fontFamily: garamond.style.fontFamily }}>
      <Header />

      {/* TOAST */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999,
          background: toast.tip === 'hata' ? '#FCEBEB' : '#EAF3DE',
          border: `1px solid ${toast.tip === 'hata' ? '#F7C1C1' : '#C0DD97'}`,
          color: toast.tip === 'hata' ? '#A32D2D' : '#3B6D11',
          padding: '14px 20px', borderRadius: 10, fontSize: 13, maxWidth: 360,
          boxShadow: '0 4px 20px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span>{toast.mesaj}</span>
          <button onClick={() => setToast(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'inherit' }}>{'\u2715'}</button>
        </div>
      )}

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 20px 60px' }}>

        {/* BASLIK */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <h1 style={{ fontFamily: cinzel.style.fontFamily, fontSize: 26, color: C.primary, marginBottom: 6, fontWeight: 500 }}>
            {"Karakter Analizi"}
          </h1>
          <p style={{ fontSize: 15, color: C.secondary, fontStyle: 'italic', maxWidth: 500, margin: '0 auto 12px' }}>
            {"Klasik Islam dusuncesi cercevesinde oz-degerlendirme"}
          </p>
          <div style={{ background: '#FFF8E7', border: `1px solid ${C.gold}`, borderRadius: 10, padding: '10px 16px', fontSize: 12, color: C.secondary, display: 'inline-block' }}>
            {"Bu arac tibbi veya psikolojik tedavinin yerini tutmaz."}
          </div>
        </div>

        {/* PROGRESS BAR */}
        <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.border}`, padding: '14px 20px', marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontFamily: cinzel.style.fontFamily, fontSize: 12, color: C.primary, letterSpacing: 1 }}>
              {adim < 4 ? `Cephe ${adim + 1} / 4` : 'Tamamla'}
            </span>
            <span style={{ fontSize: 11, color: '#999' }}>{cevaplanmisSoru}/{toplamSoru} soru ({ilerleme}%)</span>
          </div>
          <div style={{ height: 4, background: C.border, borderRadius: 2 }}>
            <div style={{ height: 4, background: C.gold, borderRadius: 2, width: `${ilerleme}%`, transition: 'width 0.3s' }} />
          </div>
          <div style={{ display: 'flex', gap: 4, marginTop: 10 }}>
            {CEPHELER.map((c, i) => {
              const skor = cepheSkoru(c.id)
              const aktif = i === adim
              const bitti = i < adim
              return (
                <button key={c.id} onClick={() => setAdim(i)}
                  style={{
                    flex: 1, padding: '6px 4px', borderRadius: 8, fontSize: 10, cursor: 'pointer',
                    border: `1px solid ${aktif ? C.gold : bitti ? C.primary : C.border}`,
                    background: aktif ? C.gold : bitti ? C.primary : C.white,
                    color: aktif ? C.primary : bitti ? C.gold : '#999',
                    fontWeight: aktif ? 600 : 400,
                  }}>
                  {bitti ? `\u2713 ${skor}%` : c.id.charAt(0).toUpperCase() + c.id.slice(1)}
                </button>
              )
            })}
          </div>
        </div>

        {/* CEPHE SORULARI */}
        {mevcutCephe && adim < 4 && (
          <div>
            <div style={{ background: C.primary, borderRadius: 12, padding: '16px 20px', marginBottom: 20 }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: 2, marginBottom: 4 }}>
                CEPHE {adim + 1}
              </div>
              <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 18, color: C.gold, marginBottom: 4 }}>
                {mevcutCephe.ad}
              </div>
              <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', fontFamily: 'serif' }}>
                {mevcutCephe.ad_ar}
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 8 }}>
                {mevcutCephe.aciklama}
              </div>
            </div>

            {mevcutCephe.sorular.map((s, qi) => {
              const secili = cevaplar[s.asker]
              return (
                <div key={s.asker} style={{
                  background: C.white, borderRadius: 12, border: `1px solid ${secili !== undefined ? C.primary : C.border}`,
                  padding: '16px 20px', marginBottom: 10,
                }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                    <span style={{ fontSize: 11, color: C.gold, fontWeight: 600, minWidth: 20 }}>{qi + 1}.</span>
                    <span style={{ fontSize: 14, color: C.dark, lineHeight: 1.6 }}>{s.soru}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {CEVAP_SECENEKLERI.map(c => (
                      <button key={c.value} onClick={() => cevapVer(s.asker, c.value)}
                        style={{
                          flex: 1, padding: '8px 4px', borderRadius: 8, fontSize: 12, cursor: 'pointer',
                          border: `1.5px solid ${secili === c.value ? C.primary : C.border}`,
                          background: secili === c.value ? C.primary : C.white,
                          color: secili === c.value ? C.gold : C.secondary,
                          fontWeight: secili === c.value ? 600 : 400,
                        }}>
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}

            {/* Navigasyon */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
              {adim > 0 ? (
                <button onClick={() => setAdim(adim - 1)}
                  style={{ padding: '10px 24px', border: `1px solid ${C.border}`, borderRadius: 8, background: C.white, color: C.secondary, cursor: 'pointer', fontSize: 13 }}>
                  {"\u2190 Geri"}
                </button>
              ) : <div />}
              <button onClick={() => setAdim(adim + 1)}
                style={{ padding: '10px 28px', background: C.primary, border: 'none', borderRadius: 8, color: C.gold, cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: cinzel.style.fontFamily }}>
                {adim < 3 ? "Ileri \u2192" : "Sonuclari Gor \u2192"}
              </button>
            </div>
          </div>
        )}

        {/* GONDER EKRANI */}
        {adim >= 4 && (
          <div>
            {/* Cephe skorlari ozet */}
            <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: '24px', marginBottom: 20 }}>
              <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 13, color: C.gold, letterSpacing: 2, marginBottom: 16 }}>{"CEPHE SKORLARI"}</div>
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
                      <div style={{ height: 6, background: renk, borderRadius: 3, width: `${skor}%`, transition: 'width 0.5s' }} />
                    </div>
                  </div>
                )
              })}

              <div style={{ fontSize: 11, color: '#999', marginTop: 12 }}>
                {"Aktif asker sayisi:"} {aktifAskerler().length} / 40
              </div>
            </div>

            {/* Fiziksel mizac */}
            {fizikselMizac && (
              <div style={{ background: C.surface, borderRadius: 10, border: `1px solid ${C.border}`, padding: '12px 16px', marginBottom: 16, fontSize: 13 }}>
                <span style={{ color: '#999' }}>{"Fiziksel mizac:"} </span>
                <span style={{ color: C.primary, fontWeight: 600 }}>{fizikselMizac}</span>
              </div>
            )}
            {!fizikselMizac && (
              <div style={{ background: '#FFF8E7', borderRadius: 10, border: `1px solid ${C.gold}`, padding: '12px 16px', marginBottom: 16, fontSize: 12, color: C.secondary }}>
                {"Fiziksel mizac analiziniz bulunamadi."}{' '}
                <a href="/analiz" style={{ color: C.gold, fontWeight: 600 }}>{"Mizac analizi yapmak ister misiniz?"}</a>
              </div>
            )}

            {/* Gonder */}
            <button onClick={gonder} disabled={yukleniyor}
              style={{
                width: '100%', padding: '16px', background: yukleniyor ? '#999' : C.primary,
                border: 'none', borderRadius: 12, cursor: yukleniyor ? 'not-allowed' : 'pointer',
                fontFamily: cinzel.style.fontFamily, fontSize: 15, fontWeight: 600, color: C.gold,
                letterSpacing: 2,
              }}>
              {yukleniyor ? 'Analiz ediliyor...' : 'ANALIZIMI TAMAMLA'}
            </button>

            <button onClick={() => setAdim(0)}
              style={{ width: '100%', marginTop: 8, padding: '10px', background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 8, cursor: 'pointer', fontSize: 12, color: C.secondary }}>
              {"Cevaplari duzenle"}
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
