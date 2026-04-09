'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Cormorant_Garamond as Cinzel, EB_Garamond } from 'next/font/google'
import { createClient } from '@/lib/supabase'

const cinzel = Cinzel({ display: 'swap', preload: false, subsets: ['latin', 'latin-ext'], weight: ['400', '500', '600'] })
const garamond = EB_Garamond({ display: 'swap', preload: false, subsets: ['latin', 'latin-ext'], weight: ['400', '500'], style: ['normal', 'italic'] })

const C = {
  primary: '#1C3A26', gold: '#B8860B', cream: '#FAF6EF',
  dark: '#1C1C1C', secondary: '#6B5744', border: '#DEB887',
  white: '#FFFFFF', surface: '#FAF6EF',
}

interface DetailedForm {
  id: string
  tam_ad: string
  telefon: string
  durum: string
  created_at: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tum_form_verisi: any
  user_id: string
}

export default function DashboardPage() {
  const [forms, setForms] = useState<DetailedForm[]>([])
  const [secili, setSecili] = useState<DetailedForm | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [analiz, setAnaliz] = useState<any>(null)
  const [yukleniyor, setYukleniyor] = useState(false)
  const [toast, setToast] = useState<{mesaj: string, tip: 'hata' | 'basari'} | null>(null)
  function gosterToast(mesaj: string, tip: 'hata' | 'basari' = 'hata') {
    setToast({ mesaj, tip })
    setTimeout(() => setToast(null), 4000)
  }
  const [analizYukleniyor, setAnalizYukleniyor] = useState(false)
  const [analizTipi, setAnalizTipi] = useState('tumu')
  const [istatistik, setIstatistik] = useState({ bekleyen: 0, tamamlanan: 0, toplam: 0 })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [gecmisAnalizler, setGecmisAnalizler] = useState<any[]>([])
  const [gecmisYukleniyor, setGecmisYukleniyor] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const supabase = createClient()

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { formlariYukle() }, [])

  // URL'den form_id varsa o formu otomatik ac
  useEffect(() => {
    const formId = searchParams.get('form_id')
    if (!formId || forms.length === 0) return
    const hedef = forms.find(f => f.id === formId)
    if (hedef && (!secili || secili.id !== formId)) {
      setSecili(hedef)
      setAnaliz(null)
      // Smooth scroll to top of content
      setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forms, searchParams])

  useEffect(() => {
    if (!secili) { setGecmisAnalizler([]); return }
    const formId = secili.id
    async function gecmisiYukle() {
      setGecmisYukleniyor(true)
      try {
        const { data } = await supabase
          .from('analyses')
          .select('id, mizac, durum, created_at, sonuc_json')
          .eq('form_id', formId)
          .order('created_at', { ascending: false })
        setGecmisAnalizler(data || [])
      } catch {
        setGecmisAnalizler([])
      }
      setGecmisYukleniyor(false)
    }
    gecmisiYukle()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secili?.id])

  async function formlariYukle() {
    setYukleniyor(true)
    const { data } = await supabase
      .from('detailed_forms')
      .select('*')
      .order('created_at', { ascending: false })
    const genelList = (data || []).map((f: DetailedForm) => ({ ...f, _tip: 'genel' as const }))

    // Cilt formlarini da cek
    const { data: ciltData } = await supabase
      .from('cilt_forms')
      .select('id, created_at, durum, sorunlar, user_id')
      .order('created_at', { ascending: false })
    const ciltList = (ciltData || []).map((f: { id: string; created_at: string; durum: string; sorunlar: string[]; user_id: string }) => ({
      id: f.id,
      tam_ad: 'Cilt Analizi',
      telefon: '',
      durum: f.durum === 'bekliyor' ? 'bekliyor' : f.durum === 'onaylandi' ? 'tamamlandi' : f.durum,
      created_at: f.created_at,
      tum_form_verisi: { symptoms: f.sorunlar?.join(', ') || '' },
      user_id: f.user_id,
      _tip: 'cilt' as const,
    }))

    const list = [...genelList, ...ciltList].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    setForms(list)
    setIstatistik({
      bekleyen: list.filter(f => f.durum === 'bekliyor').length,
      tamamlanan: list.filter(f => f.durum === 'tamamlandi').length,
      toplam: list.length,
    })
    setYukleniyor(false)
  }

  async function analizYap() {
    if (!secili) return

    // Onceki analizi kontrol et
    try {
      const { data: eskiAnaliz } = await supabase
        .from('analyses')
        .select('sonuc_json')
        .eq('form_id', secili.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (eskiAnaliz?.sonuc_json) {
        setAnaliz(eskiAnaliz.sonuc_json)
        setAnalizYukleniyor(false)
        return
      }
    } catch {
      // Analiz yok, devam et
    }

    setAnalizYukleniyor(true)
    setAnaliz(null)
    try {
      const f = secili.tum_form_verisi || {}
      const res = await fetch('/api/analiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ad_soyad: secili.tam_ad,
          cinsiyet: f.gender,
          yas_grubu: f.age_group,
          sikayet: f.symptoms,
          mevsim: f.season,
          kronik: f.chronic,
          height: f.height,
          weight: f.weight,
          sweating: f.sweating,
          chillhot: f.chillhot,
          sleep: f.sleep,
          digestion: f.digestion,
          appetite: f.appetite,
          hgb: f.hgb, ferritin: f.ferritin, crp: f.crp,
          alt: f.alt, ast: f.ast, ggt: f.ggt,
          tsh: f.tsh, uric_acid: f.uric_acid,
          glucose: f.glucose, hba1c: f.hba1c,
          vit_d: f.vit_d, b12: f.b12,
          fitri_sac: f.fitri_sac, fitri_cilt: f.fitri_cilt,
          fitri_beden: f.fitri_beden, fitri_uyku: f.fitri_uyku,
          fitri_sindirim: f.fitri_sindirim, fitri_mizac_ruh: f.fitri_mizac_ruh,
          fitri_terleme: f.fitri_terleme, fitri_isi_hassas: f.fitri_isi_hassas,
          fitri_mevsim: f.fitri_mevsim, fitri_kilo: f.fitri_kilo, fitri_enerji: f.fitri_enerji,
          nabiz: {
            buyukluk: f.nb_buyukluk, kuvvet: f.nb_kuvvet, hiz: f.nb_hiz_sinif,
            dolgunluk: f.nb_dolgunluk, sertlik: f.nb_sertlik, isi: f.nb_isi,
            ritim: f.nb_ritim, esitlik: f.nb_esitlik, sureklitik: f.nb_sureklitik,
          },
          dil: { renk: f.dil_renk, kaplama: f.dil_kaplama, nem: f.dil_nem, sekil: f.dil_sekil },
          yuz: { ten: f.yuz_ten, sekil: f.yuz_sekil, cilt: f.yuz_cilt, gozalti: f.yuz_gozalti },
          idrar: { renk: f.urine_color, miktar: f.urine_amount, berraklik: f.urine_clarity, kopuk: f.urine_foam, tortu: f.urine_sediment },
          diski: { renk: f.stool_color, kivam: f.stool_consistency },
          vucut: { isi: f.body_temp, el_ayak: f.extremity_temp, cilt: f.skin_type },
          yasam: { egzersiz: f.exercise_habit, beslenme: f.diet_type, ruh: f.mood_detail },
          notlar: f.notlar || '',
        }),
      })
      const parsed = await res.json()
      if (parsed.error) throw new Error(parsed.error)
      setAnaliz(parsed)

      await supabase.from('detailed_forms')
        .update({ durum: 'inceleniyor' })
        .eq('id', secili.id)

      try {
        await supabase.from('analyses').insert({
          hasta_id: secili.user_id || null,
          form_id: secili.id,
          mizac: parsed.mizac || '',
          sonuc_json: parsed,
          durum: 'tamamlandi',
        })
      } catch {
      }

      formlariYukle()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Bilinmeyen hata'
      gosterToast('Analiz hatasi: ' + msg)
    }
    setAnalizYukleniyor(false)
  }

  async function onaylaVeGonder() {
    if (!secili || !analiz) { gosterToast('Önce analiz yapın'); return }
    try {
      const hastaEmail = secili.tum_form_verisi?.email || ''
      const res = await fetch('/api/onayla', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          form_id: secili.id,
          analiz_sonucu: analiz,
          hasta_email: hastaEmail,
          hasta_adi: secili.tam_ad,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Onay başarısız')
      gosterToast(data.mailGonderildi ? 'Onaylandı ve maille gönderildi.' : 'Onaylandı (mail adresi yok).', 'basari')
      formlariYukle()
    } catch (e) {
      gosterToast('Hata: ' + (e instanceof Error ? e.message : 'bilinmeyen'))
    }
  }

  async function tamamlandiIsaretle() {
    if (!secili) return
    await supabase.from('detailed_forms')
      .update({ durum: 'tamamlandi' })
      .eq('id', secili.id)

    // Email gonderimi
    if (analiz && secili.tum_form_verisi) {
      try {
        const hastaEmail = secili.tum_form_verisi.email || ''
        const kayitNo = 'IYS-' + new Date().toISOString().slice(2, 10).replace(/-/g, '')
        if (hastaEmail) {
          await fetch('/api/email/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: hastaEmail,
              type: 'analiz',
              sonuc_verisi: analiz,
              hasta_adi: secili.tam_ad,
              kayit_no: kayitNo,
            }),
          })
          gosterToast('Rapor e-posta ile gonderildi', 'basari')
        } else {
          gosterToast('Hasta e-posta adresi bulunamadi', 'hata')
        }
      } catch {
        gosterToast('E-posta gonderilemedi', 'hata')
      }
    }

    setSecili(prev => prev ? { ...prev, durum: 'tamamlandi' } : null)
    formlariYukle()
  }

  function pdfIndir() {
    if (!analiz || !secili) return
    const f = secili.tum_form_verisi || {}

    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const safeStr = (v: any) => String(v || '').replace(/'/g, '').replace(/"/g, '&quot;')

    const html = `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<title>Kisisel Mizac Recetesi - ${safeStr(secili.tam_ad)}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'EB Garamond', serif; font-size: 13px; color: #1C1C1C; background: white; }
  .page { max-width: 800px; margin: 0 auto; padding: 40px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; padding-bottom: 20px; border-bottom: 2px solid #1C3A26; }
  .logo-area { display: flex; flex-direction: column; gap: 4px; }
  .logo-title { font-family: 'Cormorant Garamond', serif; font-size: 18px; font-weight: 600; color: #1C3A26; letter-spacing: 3px; }
  .logo-ar { font-size: 14px; color: #B8860B; }
  .meta { text-align: right; font-size: 11px; color: #999; line-height: 1.8; }
  .hasta-baslik { background: #1C3A26; color: #B8860B; font-family: 'Cormorant Garamond', serif; font-size: 22px; font-weight: 600; padding: 16px 24px; border-radius: 8px; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 2px; }
  .hasta-alt { font-size: 12px; color: #6B5744; margin-bottom: 24px; }
  .section { margin-bottom: 20px; page-break-inside: avoid; }
  .section-title { font-family: 'Cormorant Garamond', serif; font-size: 11px; font-weight: 600; color: #B8860B; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 10px; padding-bottom: 4px; border-bottom: 1px solid #DEB887; }
  .mizac-kart { background: #1C3A26; color: white; border-radius: 8px; padding: 16px 20px; margin-bottom: 16px; }
  .mizac-buyuk { font-family: 'Cormorant Garamond', serif; font-size: 18px; color: #B8860B; margin-bottom: 12px; }
  .hilt-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 16px; }
  .hilt-kart { border-radius: 6px; padding: 8px 12px; border-left: 3px solid; }
  .hilt-dem { border-color: #EF5350; background: #FFF8F8; }
  .hilt-balgam { border-color: #42A5F5; background: #F0F8FF; }
  .hilt-safra { border-color: #FFA726; background: #FFFAF0; }
  .hilt-karasafra { border-color: #AB47BC; background: #F8F0FF; }
  .hilt-yuzde { font-size: 18px; font-weight: 600; float: right; }
  .ozet-metin { font-size: 13px; line-height: 1.8; color: #2C1A00; background: #FAF6EF; border-radius: 6px; padding: 14px; margin-bottom: 16px; }
  .bitki-kart { background: #FAF6EF; border-radius: 6px; padding: 12px; margin-bottom: 8px; border-left: 3px solid #1C3A26; }
  .bitki-ad { font-family: 'Cormorant Garamond', serif; font-size: 14px; font-weight: 600; color: #1C3A26; }
  .bitki-ar { font-size: 13px; color: #B8860B; margin-bottom: 6px; }
  .bitki-detay { font-size: 11px; color: #6B5744; line-height: 1.6; }
  .bitki-kaynak { font-size: 10px; color: #999; font-style: italic; margin-top: 4px; border-top: 1px solid #DEB887; padding-top: 4px; }
  .rutin-blok { border-radius: 6px; padding: 10px 14px; margin-bottom: 8px; }
  .sabah-blok { background: #FFF8E7; }
  .ogle-blok { background: #F0FDF4; }
  .aksam-blok { background: #EDE7F6; }
  .rutin-baslik { font-family: 'Cormorant Garamond', serif; font-size: 11px; font-weight: 600; color: #1C3A26; margin-bottom: 6px; }
  .rutin-item { font-size: 11px; color: #2C1A00; padding: 2px 0; border-bottom: 1px solid rgba(0,0,0,0.05); }
  .beslenme-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .beslenme-oneri { background: #F0FDF4; border-radius: 6px; padding: 10px; }
  .beslenme-kacin { background: #FFF3E0; border-radius: 6px; padding: 10px; }
  .beslenme-baslik { font-size: 10px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 6px; }
  .oneri-baslik { color: #1B5E20; }
  .kacin-baslik { color: #E65100; }
  .liste-item { font-size: 11px; color: #2C1A00; padding: 1px 0; }
  .hikmet-kart { background: #1C3A26; color: white; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 16px; }
  .hikmet-ar { font-size: 20px; color: #B8860B; line-height: 1.8; margin-bottom: 8px; }
  .hikmet-tr { font-size: 13px; color: rgba(255,255,255,0.7); font-style: italic; }
  .hikmet-kaynak { font-size: 10px; color: rgba(255,255,255,0.4); margin-top: 8px; }
  .kaynaklar { display: flex; flex-wrap: wrap; gap: 6px; }
  .kaynak-pill { font-size: 10px; background: #E8F5E9; color: #1C3A26; padding: 3px 10px; border-radius: 20px; font-style: italic; }
  .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #DEB887; text-align: center; font-size: 10px; color: #999; line-height: 1.8; }
  .uyari { background: #FFF8E7; border: 1px solid #B8860B; border-radius: 6px; padding: 10px 14px; font-size: 11px; color: #6B5744; margin-bottom: 16px; }
  .label-sm { font-size: 9px; color: #999; text-transform: uppercase; letter-spacing: 1px; }
  .val-sm { font-size: 12px; font-weight: 600; color: #1C1C1C; }
  .info-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 16px; }
  .info-kart { background: #FAF6EF; border-radius: 6px; padding: 8px 10px; }
  @media print {
    body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
    .page { padding: 20px; }
  }
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="logo-area">
      <div class="logo-title">İPEK YOLU ŞİFACISI</div>
      <div class="logo-ar">\u0637\u0631\u064a\u0642 \u0627\u0644\u062d\u0631\u064a\u0631 \u0627\u0644\u0634\u0627\u0641\u064a</div>
      <div style="font-size:10px;color:#999;margin-top:4px;">Klasik İslam Tıbbı Danismanligi</div>
    </div>
    <div class="meta">
      <div style="font-family:'Cormorant Garamond',serif;font-size:13px;font-weight:600;color:#1C3A26;">KISISEL MIZAC RECETESI</div>
      <div>${new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
      <div>MZ-${Date.now().toString().slice(-8)}</div>
    </div>
  </div>

  <div class="hasta-baslik">${safeStr(secili.tam_ad)}</div>
  <div class="hasta-alt">
    ${safeStr(secili.telefon)} | Yas: ${safeStr(f.age_group)} | Cinsiyet: ${safeStr(f.gender)} | Mevsim: ${safeStr(f.season)}
  </div>

  <div class="info-grid">
    <div class="info-kart"><div class="label-sm">Sikayet Suresi</div><div class="val-sm">${safeStr(f.sikayet_suresi)}</div></div>
    <div class="info-kart"><div class="label-sm">Kronik</div><div class="val-sm">${safeStr(f.chronic) || 'Yok'}</div></div>
    <div class="info-kart"><div class="label-sm">Nabiz</div><div class="val-sm">${safeStr(f.nb_buyukluk)}</div></div>
    <div class="info-kart"><div class="label-sm">Dil Renk</div><div class="val-sm">${safeStr(f.dil_renk)}</div></div>
  </div>

  <div style="background:#FAF6EF;border-radius:6px;padding:10px 14px;margin-bottom:16px;font-size:12px;color:#2C1A00;line-height:1.6;">
    <strong>Sikayetler:</strong> ${safeStr(f.symptoms)}
  </div>

  ${analiz.mizac ? `<div class="section"><div class="mizac-kart"><div class="label-sm" style="color:rgba(255,255,255,.4);letter-spacing:2px;">TESPIT EDILEN MIZAC</div><div class="mizac-buyuk">${safeStr(analiz.mizac)}</div>${analiz.fitri_hali ? `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;"><div style="background:rgba(255,255,255,.08);border-radius:6px;padding:8px;"><div class="label-sm" style="color:rgba(255,255,255,.4);">FITRI</div><div style="font-size:12px;color:white;margin-top:2px;">${safeStr(analiz.fitri_hali.fitri_mizac)}</div></div><div style="background:rgba(255,255,255,.08);border-radius:6px;padding:8px;"><div class="label-sm" style="color:rgba(255,255,255,.4);">HALI</div><div style="font-size:12px;color:white;margin-top:2px;">${safeStr(analiz.fitri_hali.hali_mizac)}</div></div></div>${analiz.fitri_hali.tedavi_hedefi ? `<div style="background:rgba(184,146,42,.15);border-radius:6px;padding:8px;margin-top:8px;"><div class="label-sm" style="color:#B8860B;">TEDAVI HEDEFI</div><div style="font-size:12px;color:rgba(255,255,255,.85);margin-top:2px;">${safeStr(analiz.fitri_hali.tedavi_hedefi)}</div></div>` : ''}` : ''}</div></div>` : ''}

  ${analiz.hilt_dengesi ? `<div class="section"><div class="section-title">Hilt Dengesi</div><div class="hilt-grid">${analiz.hilt_dengesi.dem ? `<div class="hilt-kart hilt-dem"><div style="font-weight:600;font-size:12px;">Dem</div><div class="hilt-yuzde" style="color:#EF5350;">${analiz.hilt_dengesi.dem.yuzde}%</div><div style="font-size:10px;color:#6B5744;margin-top:4px;">${safeStr(analiz.hilt_dengesi.dem.yorum)}</div></div>` : ''}${analiz.hilt_dengesi.balgam ? `<div class="hilt-kart hilt-balgam"><div style="font-weight:600;font-size:12px;">Balgam</div><div class="hilt-yuzde" style="color:#42A5F5;">${analiz.hilt_dengesi.balgam.yuzde}%</div><div style="font-size:10px;color:#6B5744;margin-top:4px;">${safeStr(analiz.hilt_dengesi.balgam.yorum)}</div></div>` : ''}${analiz.hilt_dengesi.safra ? `<div class="hilt-kart hilt-safra"><div style="font-weight:600;font-size:12px;">Safra</div><div class="hilt-yuzde" style="color:#FFA726;">${analiz.hilt_dengesi.safra.yuzde}%</div><div style="font-size:10px;color:#6B5744;margin-top:4px;">${safeStr(analiz.hilt_dengesi.safra.yorum)}</div></div>` : ''}${analiz.hilt_dengesi.kara_safra ? `<div class="hilt-kart hilt-karasafra"><div style="font-weight:600;font-size:12px;">Kara Safra</div><div class="hilt-yuzde" style="color:#AB47BC;">${analiz.hilt_dengesi.kara_safra.yuzde}%</div><div style="font-size:10px;color:#6B5744;margin-top:4px;">${safeStr(analiz.hilt_dengesi.kara_safra.yorum)}</div></div>` : ''}</div></div>` : ''}

  ${analiz.ozet ? `<div class="section"><div class="section-title">Genel Degerlendirme</div><div class="ozet-metin">${safeStr(analiz.ozet)}</div></div>` : ''}

  ${analiz.bitki_recetesi?.length > 0 ? `<div class="section"><div class="section-title">Bitkisel Protokol</div>${analiz.bitki_recetesi.map((b: {bitki?:string,bitki_ar?:string,doz?:string,zaman?:string,sure?:string,etki?:string,kaynak?:string}) => `<div class="bitki-kart"><div class="bitki-ad">${safeStr(b.bitki)}</div>${b.bitki_ar ? `<div class="bitki-ar">${safeStr(b.bitki_ar)}</div>` : ''}<div class="bitki-detay"><strong>Doz:</strong> ${safeStr(b.doz)}<br><strong>Zaman:</strong> ${safeStr(b.zaman)} | <strong>Sure:</strong> ${safeStr(b.sure)}${b.etki ? `<br>${safeStr(b.etki)}` : ''}</div>${b.kaynak ? `<div class="bitki-kaynak">${safeStr(b.kaynak)}</div>` : ''}</div>`).join('')}</div>` : ''}

  ${analiz.gunluk_rutin ? `<div class="section"><div class="section-title">Gunluk Rutin</div>${analiz.gunluk_rutin.sabah?.length ? `<div class="rutin-blok sabah-blok"><div class="rutin-baslik">Sabah</div>${analiz.gunluk_rutin.sabah.map((i: string) => `<div class="rutin-item">${safeStr(i)}</div>`).join('')}</div>` : ''}${analiz.gunluk_rutin.ogle?.length ? `<div class="rutin-blok ogle-blok"><div class="rutin-baslik">Ogle</div>${analiz.gunluk_rutin.ogle.map((i: string) => `<div class="rutin-item">${safeStr(i)}</div>`).join('')}</div>` : ''}${analiz.gunluk_rutin.aksam?.length ? `<div class="rutin-blok aksam-blok"><div class="rutin-baslik">Aksam</div>${analiz.gunluk_rutin.aksam.map((i: string) => `<div class="rutin-item">${safeStr(i)}</div>`).join('')}</div>` : ''}</div>` : ''}

  ${analiz.beslenme_onerileri ? `<div class="section"><div class="section-title">Beslenme</div>${typeof analiz.beslenme_onerileri === 'string' ? `<div class="ozet-metin">${safeStr(analiz.beslenme_onerileri)}</div>` : `${analiz.beslenme_onerileri.temel_ilke ? `<div style="font-style:italic;color:#1C3A26;font-weight:500;margin-bottom:10px;">${safeStr(analiz.beslenme_onerileri.temel_ilke)}</div>` : ''}<div class="beslenme-grid">${analiz.beslenme_onerileri.onerililer?.length ? `<div class="beslenme-oneri"><div class="beslenme-baslik oneri-baslik">Onerilen</div>${analiz.beslenme_onerileri.onerililer.map((g: string) => `<div class="liste-item">${safeStr(g)}</div>`).join('')}</div>` : ''}${analiz.beslenme_onerileri.kacinilacaklar?.length ? `<div class="beslenme-kacin"><div class="beslenme-baslik kacin-baslik">Kacinilacak</div>${analiz.beslenme_onerileri.kacinilacaklar.map((g: string) => `<div class="liste-item">${safeStr(g)}</div>`).join('')}</div>` : ''}</div>`}</div>` : ''}

  ${analiz.hikmet ? `<div class="section"><div class="hikmet-kart"><div class="label-sm" style="color:rgba(255,255,255,.4);letter-spacing:2px;margin-bottom:10px;">HIKMET</div>${analiz.hikmet.arapca ? `<div class="hikmet-ar">${safeStr(analiz.hikmet.arapca)}</div>` : ''}${analiz.hikmet.turkce ? `<div class="hikmet-tr">${safeStr(analiz.hikmet.turkce)}</div>` : ''}${analiz.hikmet.kaynak ? `<div class="hikmet-kaynak">- ${safeStr(analiz.hikmet.kaynak)}</div>` : ''}</div></div>` : ''}

  ${analiz.kaynaklar?.length > 0 ? `<div class="section"><div class="section-title">Kullanilan Kaynaklar</div><div class="kaynaklar">${analiz.kaynaklar.map((k: string) => `<span class="kaynak-pill">${safeStr(k)}</span>`).join('')}</div></div>` : ''}

  <div class="uyari">Bu analiz klasik Islam tibbi gelenegine dayanmaktadir. Modern tibbin yerini tutmaz. Ciddi sikayetlerde mutlaka uzman hekime basvurunuz.</div>

  <div class="footer">
    İpek Yolu Şifacısı - Klasik İslam Tıbbı Danismanligi<br>
    Bu protokol yalnizca ${safeStr(secili.tam_ad)} icin hazirlanmistir.
  </div>
</div>
<script>window.onload = function() { window.print(); }<\/script>
</body>
</html>`

    printWindow.document.write(html)
    printWindow.document.close()
  }

  const durumRenk = (d: string) => {
    if (d === 'bekliyor') return { bg: '#FFF8E7', color: '#92400E', text: 'Bekliyor' }
    if (d === 'inceleniyor') return { bg: '#E3F2FD', color: '#1565C0', text: 'Inceleniyor' }
    return { bg: '#E8F5E9', color: '#1B5E20', text: 'Tamamlandi' }
  }

  return (
    <div style={{ background: C.cream, minHeight: '100vh', fontFamily: garamond.style.fontFamily }}>
      <header style={{ background: C.primary, padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <svg width="36" height="36" viewBox="0 0 64 64" fill="none">
            <ellipse cx="32" cy="37" rx="13" ry="11" fill="none" stroke="#B8860B" strokeWidth="1.5"/>
            <path d="M22 37 Q22 25 32 23 Q42 25 42 37" fill="none" stroke="#B8860B" strokeWidth="1.5"/>
            <rect x="28" y="21" width="8" height="4" rx="1.5" fill="none" stroke="#B8860B" strokeWidth="1.5"/>
            <path d="M32 14 Q36 10 40 12 Q38 18 32 20 Q26 18 24 12 Q28 10 32 14Z" fill="#B8860B"/>
            <circle cx="32" cy="32" r="2.8" fill="#EF5350"/>
            <circle cx="26.5" cy="34" r="2" fill="#FF7043"/>
            <circle cx="37.5" cy="34" r="2" fill="#42A5F5"/>
            <circle cx="32" cy="38.5" r="1.8" fill="#AB47BC"/>
          </svg>
          <div>
            <div style={{ fontFamily: cinzel.style.fontFamily, color: C.gold, fontSize: 15, fontWeight: 600, letterSpacing: 3 }}>İPEK YOLU PANEL</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>Danisман Paneli</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' as const }}>
          <button onClick={() => router.push('/dashboard/hastalar')} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: 8, padding: '7px 14px', fontSize: 12, cursor: 'pointer' }}>Hastalar</button>
          <button onClick={() => router.push('/dashboard/arsiv')} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: 8, padding: '7px 14px', fontSize: 12, cursor: 'pointer' }}>Arsiv</button>
          <button onClick={formlariYukle} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: 8, padding: '7px 14px', fontSize: 12, cursor: 'pointer' }}>Yenile</button>
          <button onClick={() => { supabase.auth.signOut(); router.push('/login') }} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: 8, padding: '7px 14px', fontSize: 12, cursor: 'pointer' }}>Cikis</button>
        </div>
      </header>

      {/* TOAST */}
      {toast && (
        <div style={{
          position: 'fixed' as const, top: 20, right: 20, zIndex: 9999,
          background: toast.tip === 'hata' ? '#FCEBEB' : '#EAF3DE',
          border: `1px solid ${toast.tip === 'hata' ? '#F7C1C1' : '#C0DD97'}`,
          color: toast.tip === 'hata' ? '#A32D2D' : '#3B6D11',
          padding: '14px 20px', borderRadius: 10, fontSize: 13,
          maxWidth: 360, boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
          display: 'flex', alignItems: 'center', gap: 10
        }}>
          <span>{toast.tip === 'hata' ? '\u26A0' : '\u2713'}</span>
          <span>{toast.mesaj}</span>
          <button onClick={() => setToast(null)}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'inherit', padding: '0 4px' }}>
            {'\u2715'}
          </button>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'row' as const, flexWrap: 'wrap' as const }}>
        {/* SIDEBAR */}
        <aside style={{ background: C.white, borderRight: `1px solid ${C.border}`, height: 'calc(100vh - 64px)', position: 'sticky' as const, top: 64, display: 'flex', flexDirection: 'column' as const, padding: '20px 0', overflow: 'hidden' as const, width: 200, flexShrink: 0 }}>
          <div style={{ padding: '0 16px 16px', borderBottom: `1px solid ${C.border}`, marginBottom: 12 }}>
            <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 11, color: C.gold, letterSpacing: 3, marginBottom: 2 }}>{"İPEK YOLU"}</div>
            <div style={{ fontSize: 10, color: '#999' }}>{"Danışman Paneli"}</div>
          </div>
          <nav style={{ flex: 1, padding: '0 8px', display: 'flex', flexDirection: 'column' as const }}>
            {[
              { label: 'Genel Bakis', href: '/dashboard', icon: '\u229E' },
              { label: 'Hastalar', href: '/dashboard/hastalar', icon: '\uD83D\uDC65' },
              { label: 'Bekleyen Analizler', href: '/dashboard', icon: '\u23F3' },
              { label: 'Cilt Analizleri', href: '/dashboard/cilt', icon: '\uD83C\uDF38' },
              { label: 'Klinik Arsiv', href: '/dashboard/arsiv', icon: '\uD83D\uDCCB' },
              { label: 'Yorumlar', href: '/dashboard/yorumlar', icon: '\uD83D\uDCAC' },
              { label: 'Bitkiler', href: '/bitkiler', icon: '\uD83C\uDF3F' },
              { label: 'Ayarlar', href: '/dashboard', icon: '\u2699' },
            ].map(item => {
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
              return (
                <Link key={item.href} href={item.href} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 12px', borderRadius: 6, marginBottom: 4,
                  background: isActive ? C.primary : 'transparent',
                  color: isActive ? C.gold : C.secondary,
                  fontSize: 13, fontWeight: isActive ? 600 : 400,
                  textDecoration: 'none', transition: 'all .15s',
                }}>
                  <span style={{ fontSize: 15 }}>{item.icon}</span>
                  {item.label}
                </Link>
              )
            })}
          </nav>
          <div style={{ padding: '12px 16px', borderTop: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 12, color: C.secondary, marginBottom: 8 }}>{"M. Fatih Çakır"}</div>
            <button onClick={() => { supabase.auth.signOut(); router.push('/login') }}
              style={{ width: '100%', padding: '7px 12px', background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 6, color: '#999', fontSize: 11, cursor: 'pointer' }}>
              {"Çıkış Yap"}
            </button>
          </div>
        </aside>

        {/* ANA İÇERİK */}
        <div style={{ padding: '24px 20px', maxWidth: 1200, flex: 1, minWidth: 0 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Toplam Hasta', val: istatistik.toplam, accent: '#6B5744' },
            { label: 'Bekleyen', val: istatistik.bekleyen, accent: '#B8860B' },
            { label: 'Bu Hafta', val: forms.filter(f => (Date.now() - new Date(f.created_at).getTime()) / 86400000 <= 7).length, accent: C.gold },
            { label: 'Tamamlanan', val: istatistik.tamamlanan, accent: C.primary },
            { label: 'Ort. Yakinlasma', val: '-', accent: '#AB47BC' },
          ].map(s => (
            <div key={s.label} style={{ background: C.white, borderRadius: 12, padding: '16px 20px', border: `1px solid ${C.border}`, borderLeft: `4px solid ${s.accent}` }}>
              <div style={{ fontSize: 10, color: C.secondary, marginBottom: 6, letterSpacing: 1, textTransform: 'uppercase' as const }}>{s.label}</div>
              <div style={{ fontSize: 24, fontWeight: 600, fontFamily: cinzel.style.fontFamily, color: s.accent }}>{s.val}</div>
            </div>
          ))}
        </div>

        {/* Analiz Tipi Sekmeleri */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' as const }}>
          {[
            { label: 'Tum Analizler', val: 'tumu' },
            { label: 'Genel Analiz', val: 'genel' },
            { label: 'Cilt Analizi', val: 'cilt' },
          ].map(t => (
            <button key={t.val} onClick={() => setAnalizTipi(t.val)}
              style={{ padding: '7px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: analizTipi === t.val ? 'none' : `1px solid ${C.border}`, background: analizTipi === t.val ? C.primary : 'transparent', color: analizTipi === t.val ? C.gold : C.secondary, transition: 'all .15s' }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Filtre bar */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' as const }}>
          {[
            { label: 'Tumunu Goster', val: '' },
            { label: 'Acil', val: 'acil' },
            { label: 'Bekleyen', val: 'bekliyor' },
            { label: 'Tamamlanan', val: 'tamamlandi' },
          ].map(f => (
            <button key={f.val} onClick={() => { /* filtre state eklenebilir */ }}
              style={{ padding: '6px 14px', borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: 'pointer', border: `1px solid ${C.border}`, background: f.val === '' ? C.primary : 'transparent', color: f.val === '' ? C.gold : C.secondary }}>
              {f.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: secili ? 'min(380px, 100%) 1fr' : '1fr', gap: 16 }}>
          <div>
            <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 12, color: C.primary, letterSpacing: 2, marginBottom: 12, textTransform: 'uppercase' as const }}>Gelen Formlar ({forms.length})</div>
            {yukleniyor ? (
              <div style={{ textAlign: 'center', padding: 40, color: C.secondary }}>Yukleniyor...</div>
            ) : forms.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.4 }}>{"🏛️"}</div>
                <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 18, color: '#1C3A26', marginBottom: 8 }}>{"Henüz analiz formu gelmedi"}</div>
                <div style={{ fontSize: 14, color: '#6B5744' }}>{"Hastalar form doldurduğunda burada görünecek"}</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {forms.filter(f => {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const tip = (f as any)._tip || 'genel'
                  if (analizTipi === 'tumu') return true
                  return analizTipi === tip
                }).map(f => {
                  const dr = durumRenk(f.durum)
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const tip = (f as any)._tip || 'genel'
                  const isCilt = tip === 'cilt'
                  const tarih = new Date(f.created_at).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                  const highlightId = searchParams.get('form_id')
                  const isHighlighted = highlightId === f.id
                  return (
                    <div key={f.id}
                      ref={el => { if (isHighlighted && el) { setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'center' }), 200) } }}
                      onClick={() => { if (isCilt) { router.push(`/dashboard/cilt/${f.id}`) } else { setSecili(f); setAnaliz(null) } }}
                      style={{ background: isHighlighted ? '#FFF8E7' : (secili?.id === f.id ? '#E8F5E9' : C.white), border: isHighlighted ? '2px solid #B8860B' : `1px solid ${secili?.id === f.id ? C.primary : C.border}`, borderRadius: 12, padding: '14px 16px', cursor: 'pointer', borderLeft: isHighlighted ? '4px solid #B8860B' : (isCilt ? '3px solid #AB47BC' : undefined), boxShadow: isHighlighted ? '0 4px 12px rgba(184,134,11,0.18)' : undefined }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ fontWeight: 600, fontSize: 14, color: C.dark }}>{f.tam_ad}</div>
                          <span style={{ fontSize: 9, background: isCilt ? '#F3E5F5' : '#EFF6FF', color: isCilt ? '#7B1FA2' : '#2563EB', padding: '2px 7px', borderRadius: 20, fontWeight: 600 }}>{isCilt ? 'Cilt' : 'Genel'}</span>
                        </div>
                        <span style={{ fontSize: 10, background: dr.bg, color: dr.color, padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>{dr.text}</span>
                      </div>
                      <div style={{ fontSize: 12, color: C.secondary }}>{f.telefon}</div>
                      <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>{tarih}</div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {secili && (
            <div>
              <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: '20px 24px', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div>
                    <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 18, color: C.primary }}>{secili.tam_ad}</div>
                    <div style={{ fontSize: 13, color: C.secondary, marginTop: 2 }}>{secili.telefon}</div>
                  </div>
                  <button onClick={() => { setSecili(null); setAnaliz(null) }} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#999' }}>x</button>
                </div>

                {secili.tum_form_verisi && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 }}>
                    {[
                      { label: 'Yas', val: secili.tum_form_verisi.age_group },
                      { label: 'Cinsiyet', val: secili.tum_form_verisi.gender },
                      { label: 'Mevsim', val: secili.tum_form_verisi.season },
                      { label: 'Kronik', val: secili.tum_form_verisi.chronic },
                      { label: 'Sikayet Suresi', val: secili.tum_form_verisi.sikayet_suresi },
                      { label: 'Nabiz', val: secili.tum_form_verisi.nb_buyukluk },
                      { label: 'Nabiz Kuvvet', val: secili.tum_form_verisi.nb_kuvvet },
                      { label: 'Dil Renk', val: secili.tum_form_verisi.dil_renk },
                      { label: 'Vucut Isi', val: secili.tum_form_verisi.body_temp },
                      { label: 'Egzersiz', val: secili.tum_form_verisi.exercise_habit },
                      { label: 'Boy/Kilo', val: secili.tum_form_verisi.height ? `${secili.tum_form_verisi.height}cm / ${secili.tum_form_verisi.weight}kg` : '' },
                      { label: 'HGB', val: secili.tum_form_verisi.hgb ? `${secili.tum_form_verisi.hgb} g/dL` : '' },
                    ].filter(i => i.val).map(i => (
                      <div key={i.label} style={{ background: C.surface, borderRadius: 6, padding: '6px 10px' }}>
                        <div style={{ fontSize: 9, color: '#999', textTransform: 'uppercase' as const, letterSpacing: 1, marginBottom: 2 }}>{i.label}</div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: C.dark }}>{i.val}</div>
                      </div>
                    ))}
                  </div>
                )}

                {secili.tum_form_verisi?.symptoms && (
                  <div style={{ background: C.surface, borderRadius: 8, padding: '10px 14px', marginBottom: 14 }}>
                    <div style={{ fontSize: 10, color: C.secondary, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' as const, marginBottom: 6 }}>Sikayetler</div>
                    <div style={{ fontSize: 14, color: C.dark, lineHeight: 1.6 }}>{secili.tum_form_verisi.symptoms}</div>
                  </div>
                )}

                {!analiz && (
                  <button onClick={analizYap} disabled={analizYukleniyor}
                    style={{ width: '100%', padding: 16, background: analizYukleniyor ? '#999' : C.primary, border: 'none', borderRadius: 10, cursor: analizYukleniyor ? 'not-allowed' : 'pointer', fontFamily: cinzel.style.fontFamily, fontSize: 14, fontWeight: 600, color: C.white, letterSpacing: 2 }}>
                    {analizYukleniyor ? 'Klasik kaynaklar taraniyor...' : 'Analiz Et'}
                  </button>
                )}
              </div>

              {analizYukleniyor && (
                <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: '32px 24px', marginTop: 14, textAlign: 'center' as const }}>
                  <div style={{ marginBottom: 20 }}>
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" style={{ animation: 'spin 1.5s linear infinite', display: 'block', margin: '0 auto' }}>
                      <circle cx="20" cy="20" r="16" stroke="#DEB887" strokeWidth="3" fill="none"/>
                      <path d="M20 4 A16 16 0 0 1 36 20" stroke="#1C3A26" strokeWidth="3" strokeLinecap="round" fill="none"/>
                    </svg>
                    <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
                  </div>
                  <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 13, color: C.primary, letterSpacing: 2, marginBottom: 8 }}>
                    {"KLASİK KAYNAKLAR TARANIYOR"}
                  </div>
                  <div style={{ fontSize: 12, color: C.secondary, fontStyle: 'italic', marginBottom: 20 }}>
                    {"el-Hâvî · el-Şâmil · Tahbîzül-Mathûn · el-Câmi"}
                  </div>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' as const }}>
                    {['el-Mansuri', 'el-Samil', 'Tahbiz', 'el-Havi', 'el-Cami', 'el-Kulliyyat'].map((k, i) => (
                      <span key={k} style={{
                        fontSize: 10, padding: '3px 10px', borderRadius: 20, fontStyle: 'italic',
                        background: i % 2 === 0 ? '#E8F5E9' : '#FFF8E7',
                        color: i % 2 === 0 ? C.primary : '#92400E',
                        animation: `pulse 1.5s ease-in-out infinite`,
                        animationDelay: `${i * 0.2}s`
                      }}>{k}</span>
                    ))}
                  </div>
                  <style>{`@keyframes pulse { 0%,100%{opacity:.4} 50%{opacity:1} }`}</style>
                </div>
              )}

              {analiz && (
                <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.border}`, padding: '20px 24px' }}>

                  {/* MİZAÇ KARTI */}
                  <div style={{ background: C.primary, borderRadius: 12, padding: '16px 20px', marginBottom: 14 }}>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', letterSpacing: 2, textTransform: 'uppercase' as const, marginBottom: 4 }}>Baskin Mizac</div>
                    <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 20, color: C.gold, marginBottom: 8 }}>{analiz.mizac}</div>
                    {analiz.fitri_hali && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
                        <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 8, padding: '8px 10px' }}>
                          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', letterSpacing: 1 }}>FITRI</div>
                          <div style={{ fontSize: 12, color: 'white', marginTop: 2 }}>{analiz.fitri_hali.fitri_mizac}</div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 8, padding: '8px 10px' }}>
                          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', letterSpacing: 1 }}>HALI</div>
                          <div style={{ fontSize: 12, color: 'white', marginTop: 2 }}>{analiz.fitri_hali.hali_mizac}</div>
                        </div>
                        {analiz.fitri_hali.sapma && (
                          <div style={{ gridColumn: '1/-1', background: 'rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 10px' }}>
                            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', letterSpacing: 1 }}>SAPMA</div>
                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>{analiz.fitri_hali.sapma}</div>
                          </div>
                        )}
                        {analiz.fitri_hali.tedavi_hedefi && (
                          <div style={{ gridColumn: '1/-1', background: 'rgba(184,146,42,0.15)', borderRadius: 8, padding: '8px 10px' }}>
                            <div style={{ fontSize: 9, color: C.gold, letterSpacing: 1 }}>TEDAVI HEDEFI</div>
                            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 2 }}>{analiz.fitri_hali.tedavi_hedefi}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* HILT DENGESİ */}
                  {analiz.hilt_dengesi && (
                    <div style={{ marginBottom: 14 }}>
                      <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 11, color: C.gold, letterSpacing: 2, marginBottom: 10, textTransform: 'uppercase' as const }}>Hilt Dengesi</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        {[
                          { key: 'dem', label: 'Dem — Kan', ar: 'الدم', color: '#EF5350' },
                          { key: 'balgam', label: 'Balgam', ar: 'البلغم', color: '#42A5F5' },
                          { key: 'safra', label: 'Sari Safra', ar: 'الصفراء', color: '#FFA726' },
                          { key: 'kara_safra', label: 'Kara Safra', ar: 'السوداء', color: '#AB47BC' },
                        ].map(h => {
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          const d = (analiz.hilt_dengesi as any)[h.key]
                          if (!d) return null
                          const durum = d.durum === 'fazla' ? 'Fazla \u2191' : d.durum === 'eksik' ? 'Eksik \u2193' : 'Normal'
                          const durumColor = d.durum === 'fazla' ? '#C62828' : d.durum === 'eksik' ? '#1565C0' : '#2E7D32'
                          return (
                            <div key={h.key} style={{ background: C.surface, borderRadius: 8, padding: '10px 12px', borderLeft: `3px solid ${h.color}` }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                <div>
                                  <div style={{ fontSize: 11, fontWeight: 600, color: C.dark }}>{h.label}</div>
                                  <div style={{ fontSize: 10, color: '#999' }}>{h.ar}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                  <div style={{ fontSize: 18, fontWeight: 600, color: h.color }}>{d.yuzde}%</div>
                                  <div style={{ fontSize: 9, color: durumColor, fontWeight: 600 }}>{durum}</div>
                                </div>
                              </div>
                              <div style={{ height: 4, background: '#eee', borderRadius: 2, overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${d.yuzde}%`, background: h.color, borderRadius: 2 }} />
                              </div>
                              {d.yorum && <div style={{ fontSize: 10, color: C.secondary, marginTop: 4 }}>{d.yorum}</div>}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* ÖZET */}
                  {analiz.ozet && (
                    <div style={{ background: C.surface, borderRadius: 10, padding: '14px 16px', marginBottom: 12, fontSize: 13, color: C.dark, lineHeight: 1.8 }}>
                      {analiz.ozet}
                    </div>
                  )}

                  {/* KLİNİK GÖZLEMLER */}
                  {analiz.klinik_gozlemler?.length > 0 && (
                    <div style={{ marginBottom: 14 }}>
                      <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 11, color: C.gold, letterSpacing: 2, marginBottom: 10, textTransform: 'uppercase' as const }}>Klinik Gozlemler</div>
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {analiz.klinik_gozlemler.map((g: any, i: number) => (
                        <div key={i} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: `1px solid ${C.border}` }}>
                          <div style={{ width: 28, height: 28, background: '#E3F2FD', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>🔬</div>
                          <div>
                            <div style={{ fontSize: 12, color: C.dark, lineHeight: 1.6 }}>{g.gozlem}</div>
                            {g.kaynak && <div style={{ fontSize: 10, color: '#999', fontStyle: 'italic', marginTop: 2 }}>{g.kaynak}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* BİTKİ PROTOKOLÜ */}
                  {analiz.bitki_recetesi?.length > 0 && (
                    <div style={{ marginBottom: 14 }}>
                      <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 11, color: C.gold, letterSpacing: 2, marginBottom: 10, textTransform: 'uppercase' as const }}>Bitkisel Protokol</div>
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {analiz.bitki_recetesi.map((b: any, i: number) => (
                        <div key={i} style={{ background: C.surface, borderRadius: 8, padding: '12px 14px', marginBottom: 8 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: 13, color: C.primary }}>🌿 {b.bitki}</div>
                              {b.bitki_ar && <div style={{ fontSize: 12, color: C.gold, fontFamily: 'serif' }}>{b.bitki_ar}</div>}
                            </div>
                            {b.sure && <div style={{ fontSize: 10, background: '#E8F5E9', color: '#1B5E20', padding: '2px 8px', borderRadius: 10 }}>{b.sure}</div>}
                          </div>
                          <div style={{ fontSize: 12, color: C.secondary, marginBottom: 4 }}>{b.doz}</div>
                          <div style={{ fontSize: 11, color: '#777', marginBottom: 4 }}>🕐 {b.zaman}</div>
                          {b.etki && <div style={{ fontSize: 11, color: C.dark, lineHeight: 1.5, marginBottom: 4 }}>{b.etki}</div>}
                          {b.kaynak && <div style={{ fontSize: 10, color: '#999', fontStyle: 'italic', borderTop: `1px solid ${C.border}`, paddingTop: 6, marginTop: 4 }}>📖 {b.kaynak}</div>}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* BİLEŞİK FORMÜL */}
                  {analiz.bilesik_formul?.ad && (
                    <div style={{ background: '#FFF8E7', border: `1px solid ${C.gold}`, borderRadius: 10, padding: '14px 16px', marginBottom: 14 }}>
                      <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 11, color: C.gold, letterSpacing: 2, marginBottom: 8, textTransform: 'uppercase' as const }}>🏺 Bilesik Formul</div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: C.primary, marginBottom: 8 }}>{analiz.bilesik_formul.ad}</div>
                      {analiz.bilesik_formul.bilesenler?.length > 0 && (
                        <div style={{ marginBottom: 8 }}>
                          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                          {analiz.bilesik_formul.bilesenler.map((b: any, i: number) => (
                            <div key={i} style={{ display: 'flex', gap: 8, fontSize: 12, padding: '3px 0', borderBottom: '1px solid rgba(184,146,42,0.2)' }}>
                              <span style={{ fontWeight: 600, minWidth: 120, color: C.primary }}>{b.madde}</span>
                              <span style={{ color: C.gold, minWidth: 60 }}>{b.miktar}</span>
                              <span style={{ color: C.secondary }}>{b.etki}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {analiz.bilesik_formul.hazirlama && <div style={{ fontSize: 12, color: C.dark, lineHeight: 1.6, marginBottom: 6 }}>{analiz.bilesik_formul.hazirlama}</div>}
                      {analiz.bilesik_formul.doz && <div style={{ fontSize: 12, color: C.secondary }}>Doz: {analiz.bilesik_formul.doz}</div>}
                      {analiz.bilesik_formul.kaynak && <div style={{ fontSize: 10, color: '#999', fontStyle: 'italic', marginTop: 6 }}>📖 {analiz.bilesik_formul.kaynak}</div>}
                    </div>
                  )}

                  {/* GÜNLÜK RUTİN */}
                  {analiz.gunluk_rutin && (
                    <div style={{ marginBottom: 14 }}>
                      <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 11, color: C.gold, letterSpacing: 2, marginBottom: 10, textTransform: 'uppercase' as const }}>Gunluk Rutin</div>
                      {[
                        { key: 'sabah', label: 'Sabah', icon: '🌅', color: '#FFF8E7' },
                        { key: 'ogle', label: 'Ogle', icon: '☀️', color: '#F0FDF4' },
                        { key: 'aksam', label: 'Aksam', icon: '🌆', color: '#EDE7F6' },
                      ].map(t => {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const items = (analiz.gunluk_rutin as any)[t.key]
                        if (!items?.length) return null
                        return (
                          <div key={t.key} style={{ background: t.color, borderRadius: 8, padding: '10px 12px', marginBottom: 8 }}>
                            <div style={{ fontSize: 11, fontWeight: 600, color: C.primary, marginBottom: 6 }}>{t.icon} {t.label}</div>
                            {items.map((item: string, i: number) => (
                              <div key={i} style={{ fontSize: 11, color: C.dark, padding: '2px 0', borderBottom: i < items.length-1 ? '1px solid rgba(0,0,0,0.05)' : 'none' }}>{item}</div>
                            ))}
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* BESLENME */}
                  {analiz.beslenme_onerileri && (
                    <div style={{ background: '#F0FDF4', border: '1px solid #A5D6A7', borderRadius: 10, padding: '12px 14px', marginBottom: 12 }}>
                      <div style={{ fontSize: 10, color: '#1B5E20', fontWeight: 600, letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' as const }}>Beslenme</div>
                      {typeof analiz.beslenme_onerileri === 'string' ? (
                        <div style={{ fontSize: 13, color: C.dark, lineHeight: 1.6 }}>{analiz.beslenme_onerileri}</div>
                      ) : (
                        <>
                          {analiz.beslenme_onerileri.temel_ilke && <div style={{ fontSize: 12, fontStyle: 'italic', color: C.primary, marginBottom: 8, fontWeight: 500 }}>{analiz.beslenme_onerileri.temel_ilke}</div>}
                          {analiz.beslenme_onerileri.onerililer?.length > 0 && (
                            <div style={{ marginBottom: 8 }}>
                              <div style={{ fontSize: 10, color: '#2E7D32', fontWeight: 600, marginBottom: 4 }}>ONERILEN GIDALAR</div>
                              {analiz.beslenme_onerileri.onerililer.map((g: string, i: number) => (
                                <div key={i} style={{ fontSize: 11, color: C.dark, padding: '1px 0' }}>{'\u2713'} {g}</div>
                              ))}
                            </div>
                          )}
                          {analiz.beslenme_onerileri.kacinilacaklar?.length > 0 && (
                            <div style={{ marginBottom: 8 }}>
                              <div style={{ fontSize: 10, color: '#C62828', fontWeight: 600, marginBottom: 4 }}>KACINILACAKLAR</div>
                              {analiz.beslenme_onerileri.kacinilacaklar.map((g: string, i: number) => (
                                <div key={i} style={{ fontSize: 11, color: C.dark, padding: '1px 0' }}>{'\u2717'} {g}</div>
                              ))}
                            </div>
                          )}
                          {analiz.beslenme_onerileri.pisirme_notu && <div style={{ fontSize: 11, color: C.secondary, fontStyle: 'italic' }}>{analiz.beslenme_onerileri.pisirme_notu}</div>}
                        </>
                      )}
                    </div>
                  )}

                  {/* EGZERSİZ */}
                  {analiz.egzersiz_recetesi && (
                    <div style={{ background: '#E8F5E9', border: '1px solid #A5D6A7', borderRadius: 10, padding: '12px 14px', marginBottom: 12 }}>
                      <div style={{ fontSize: 10, color: '#1B5E20', fontWeight: 600, letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' as const }}>Egzersiz Recetesi</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, marginBottom: 8 }}>
                        {[
                          { label: 'Tur', val: analiz.egzersiz_recetesi.tur },
                          { label: 'Zaman', val: analiz.egzersiz_recetesi.zaman },
                          { label: 'Sure', val: analiz.egzersiz_recetesi.sure },
                          { label: 'Siddet', val: analiz.egzersiz_recetesi.siddet },
                        ].map(e => e.val ? (
                          <div key={e.label} style={{ background: 'white', borderRadius: 6, padding: '6px 8px', textAlign: 'center' as const }}>
                            <div style={{ fontSize: 9, color: '#999', textTransform: 'uppercase' as const }}>{e.label}</div>
                            <div style={{ fontSize: 11, fontWeight: 600, color: C.primary, marginTop: 2 }}>{e.val}</div>
                          </div>
                        ) : null)}
                      </div>
                      {analiz.egzersiz_recetesi.aciklama && <div style={{ fontSize: 11, color: C.dark, lineHeight: 1.5, marginBottom: 4 }}>{analiz.egzersiz_recetesi.aciklama}</div>}
                      {analiz.egzersiz_recetesi.kacinilacaklar && <div style={{ fontSize: 11, color: '#C62828' }}>{'\u26A0'} {analiz.egzersiz_recetesi.kacinilacaklar}</div>}
                      {analiz.egzersiz_recetesi.kaynak && <div style={{ fontSize: 10, color: '#999', fontStyle: 'italic', marginTop: 4 }}>📖 {analiz.egzersiz_recetesi.kaynak}</div>}
                    </div>
                  )}

                  {/* SEBEP ANALİZİ */}
                  {analiz.sebep_analizi && (
                    <div style={{ background: C.surface, borderRadius: 10, padding: '12px 14px', marginBottom: 12, border: `1px solid ${C.border}` }}>
                      <div style={{ fontSize: 10, color: C.secondary, fontWeight: 600, letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' as const }}>Sebep Analizi — İbn Rüşd</div>
                      {analiz.sebep_analizi.badi && (
                        <div style={{ marginBottom: 6 }}>
                          <span style={{ fontSize: 10, fontWeight: 600, color: '#C62828' }}>YAKIN SEBEP: </span>
                          <span style={{ fontSize: 12, color: C.dark }}>{analiz.sebep_analizi.badi}</span>
                        </div>
                      )}
                      {analiz.sebep_analizi.muid?.length > 0 && (
                        <div style={{ marginBottom: 6 }}>
                          <div style={{ fontSize: 10, fontWeight: 600, color: '#1565C0', marginBottom: 4 }}>UZAK SEBEPLER:</div>
                          {analiz.sebep_analizi.muid.map((m: string, i: number) => (
                            <div key={i} style={{ fontSize: 11, color: C.dark, padding: '1px 0' }}>{'\u2192'} {m}</div>
                          ))}
                        </div>
                      )}
                      {analiz.sebep_analizi.kok_mudahale && (
                        <div style={{ fontSize: 11, color: C.primary, fontStyle: 'italic', borderTop: `1px solid ${C.border}`, paddingTop: 6, marginTop: 6 }}>
                          Kok Mudahale: {analiz.sebep_analizi.kok_mudahale}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ALTERNATİF BİTKİLER */}
                  {analiz.alternatif_bitkiler?.length > 0 && (
                    <div style={{ background: '#F3E5F5', borderRadius: 10, padding: '12px 14px', marginBottom: 12 }}>
                      <div style={{ fontSize: 10, color: '#6A1B9A', fontWeight: 600, letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' as const }}>Alternatif Bitkiler (el-Ebdal)</div>
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {analiz.alternatif_bitkiler.map((a: any, i: number) => (
                        <div key={i} style={{ fontSize: 11, color: C.dark, padding: '3px 0' }}>
                          {'\u2194'} <strong>{a.asil}</strong> bulunamazsa {'\u2192'} {a.alternatif} {a.doz ? `(${a.doz})` : ''}
                          {a.kaynak && <span style={{ color: '#999', fontStyle: 'italic' }}> — {a.kaynak}</span>}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* İLAÇ ETKİLEŞİMLERİ */}
                  {analiz.ilac_etkilesimleri?.length > 0 && (
                    <div style={{ background: '#FFF3E0', border: '1px solid #FFCC80', borderRadius: 10, padding: '12px 14px', marginBottom: 12 }}>
                      <div style={{ fontSize: 10, color: '#E65100', fontWeight: 600, letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' as const }}>Ilac-Bitki Etkilesimleri</div>
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {analiz.ilac_etkilesimleri.map((e: any, i: number) => (
                        <div key={i} style={{ display: 'flex', gap: 8, padding: '4px 0', alignItems: 'flex-start' }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: e.risk === 'red' ? '#C62828' : '#F57C00', marginTop: 4, flexShrink: 0 }} />
                          <div>
                            <div style={{ fontSize: 11, fontWeight: 600, color: C.dark }}>{e.ilac} — {e.bitki}</div>
                            <div style={{ fontSize: 11, color: C.secondary }}>{e.uyari}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* KAÇINILACAKLAR */}
                  {analiz.kacinilacaklar?.length > 0 && (
                    <div style={{ background: '#FFF3E0', border: '1px solid #FFCC80', borderRadius: 10, padding: '12px 14px', marginBottom: 12 }}>
                      <div style={{ fontSize: 10, color: '#E65100', fontWeight: 600, letterSpacing: 1, marginBottom: 6, textTransform: 'uppercase' as const }}>Kacinilacaklar</div>
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {analiz.kacinilacaklar.map((k: any, i: number) => (
                        <div key={i} style={{ fontSize: 12, color: C.dark, marginBottom: 3 }}>- {k}</div>
                      ))}
                    </div>
                  )}

                  {/* SONRAKI KONTROL */}
                  {analiz.sonraki_kontrol && (
                    <div style={{ background: '#E3F2FD', borderRadius: 10, padding: '12px 14px', marginBottom: 12 }}>
                      <div style={{ fontSize: 10, color: '#1565C0', fontWeight: 600, letterSpacing: 1, marginBottom: 6, textTransform: 'uppercase' as const }}>Sonraki Kontrol — {analiz.sonraki_kontrol.sure}</div>
                      {analiz.sonraki_kontrol.amac && <div style={{ fontSize: 12, color: C.dark, marginBottom: 6 }}>{analiz.sonraki_kontrol.amac}</div>}
                      {analiz.sonraki_kontrol.takip_parametreleri?.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {analiz.sonraki_kontrol.takip_parametreleri.map((p: string, i: number) => (
                            <span key={i} style={{ fontSize: 10, background: 'white', color: '#1565C0', padding: '2px 8px', borderRadius: 10, border: '1px solid #90CAF9' }}>📍 {p}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* HİKMET */}
                  {analiz.hikmet && (
                    <div style={{ background: C.primary, borderRadius: 10, padding: '16px 20px', marginBottom: 14, textAlign: 'center' as const }}>
                      <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', letterSpacing: 2, marginBottom: 10, textTransform: 'uppercase' as const }}>Hikmet</div>
                      {analiz.hikmet.arapca && <div style={{ fontSize: 18, color: C.gold, fontFamily: 'serif', marginBottom: 8, lineHeight: 1.8 }}>{analiz.hikmet.arapca}</div>}
                      {analiz.hikmet.turkce && <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontStyle: 'italic', marginBottom: 6 }}>{analiz.hikmet.turkce}</div>}
                      {analiz.hikmet.kaynak && <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>— {analiz.hikmet.kaynak}</div>}
                    </div>
                  )}

                  {/* KAYNAKLAR */}
                  {analiz.kaynaklar?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {analiz.kaynaklar.map((k: any, i: number) => (
                        <span key={i} style={{ fontSize: 10, background: '#E8F5E9', color: C.primary, padding: '3px 8px', borderRadius: 20, fontStyle: 'italic' }}>{k}</span>
                      ))}
                    </div>
                  )}

                  {/* PDF BUTONU */}
                  <button onClick={pdfIndir}
                    style={{ width: '100%', marginBottom: 10, padding: 14, background: '#B8860B', border: 'none', borderRadius: 10, cursor: 'pointer', fontFamily: cinzel.style.fontFamily, fontSize: 13, fontWeight: 600, color: 'white', letterSpacing: 1 }}>
                    PDF Indir / Yazdir
                  </button>

                  {/* AKSIYON BUTONLARI */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 16 }}>
                    <button onClick={tamamlandiIsaretle}
                      style={{ background: secili.durum === 'tamamlandi' ? '#E8F5E9' : C.primary, color: secili.durum === 'tamamlandi' ? C.primary : 'white', border: 'none', borderRadius: 10, padding: 14, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: cinzel.style.fontFamily }}>
                      {secili.durum === 'tamamlandi' ? 'Tamamlandi' : 'Onayla ve Gonder'}
                    </button>
                    <a href="https://wa.me/905331687226"
                      target="_blank"
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: 'transparent', color: '#25D366', border: '1px solid #25D366', borderRadius: 10, padding: 14, fontSize: 12, fontWeight: 600, textDecoration: 'none', fontFamily: cinzel.style.fontFamily }}>
                      {"💬 Kisisel Not Ekle"}
                    </a>
                  </div>
                  <div style={{ fontSize: 10, color: '#999', marginTop: 4, textAlign: 'center' as const }}>{"Rapora ek yorum veya soru sormak icin"}</div>

                  <button onClick={onaylaVeGonder}
                    style={{ width: '100%', marginTop: 12, padding: 14, background: '#B8860B', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#1C3A26', fontFamily: cinzel.style.fontFamily, letterSpacing: 1.5 }}>
                    {"✓ ONAYLA VE HASTAYA GÖNDER"}
                  </button>

                  <button onClick={analizYap}
                    style={{ width: '100%', marginTop: 8, padding: 10, background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 8, cursor: 'pointer', fontSize: 12, color: C.secondary, fontFamily: cinzel.style.fontFamily }}>
                    Yeniden Analiz Et
                  </button>

                  {/* ANALİZ GEÇMİŞİ */}
                  <div style={{ marginTop: 20, borderTop: `1px solid ${C.border}`, paddingTop: 16 }}>
                    <div style={{ fontFamily: cinzel.style.fontFamily, fontSize: 11, color: C.gold, letterSpacing: 2, marginBottom: 10, textTransform: 'uppercase' as const }}>{"Analiz Geçmişi"}</div>
                    {gecmisYukleniyor ? (
                      <div style={{ fontSize: 12, color: C.secondary, fontStyle: 'italic', padding: '8px 0' }}>{"Yükleniyor..."}</div>
                    ) : gecmisAnalizler.length === 0 ? (
                      <div style={{ fontSize: 12, color: '#999', fontStyle: 'italic', padding: '8px 0' }}>{"Henüz analiz yapılmamış."}</div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {gecmisAnalizler.map((ga: any) => {
                          const gTarih = new Date(ga.created_at).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                          const gMizac = ga.mizac || '-'
                          const gMr = (() => {
                            const ml = (ga.mizac || '').toLowerCase()
                            if (ml.includes('safra')) return { bg: '#FFF8E7', color: '#B8860B' }
                            if (ml.includes('dem')) return { bg: '#FFE8E8', color: '#C62828' }
                            if (ml.includes('balgam')) return { bg: '#E3F2FD', color: '#1565C0' }
                            if (ml.includes('sevda')) return { bg: '#F3E5F5', color: '#6A1B9A' }
                            return { bg: '#E8F5E9', color: '#1B5E20' }
                          })()
                          const gDurum = ga.durum === 'tamamlandi'
                            ? { bg: '#E8F5E9', color: '#1B5E20', text: 'Tamamlandı' }
                            : { bg: '#FFF8E7', color: '#92400E', text: ga.durum || 'Bekliyor' }
                          return (
                            <div key={ga.id} style={{ background: C.surface, borderRadius: 8, padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                              <div style={{ fontSize: 11, color: '#999', minWidth: 100 }}>{gTarih}</div>
                              <span style={{ fontSize: 10, background: gMr.bg, color: gMr.color, padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>{gMizac.split(',')[0]}</span>
                              <span style={{ fontSize: 10, background: gDurum.bg, color: gDurum.color, padding: '2px 8px', borderRadius: 20 }}>{gDurum.text}</span>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>

                </div>
              )}
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  )
}
