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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function AnalizKart({ analiz, hasta }: { analiz: any, hasta: any }) {
  if (!analiz) return null;
  const r = analiz;
  const hNames: Record<string,string> = { dem:'Dem — Kan Hıltı', balgam:'Balgam Hıltı', sari_safra:'Sarı Safra', kara_safra:'Kara Safra' };
  const hAr: Record<string,string> = { dem:'الدم', balgam:'البلغم', sari_safra:'المرّة الصفراء', kara_safra:'السوداء' };
  const hColors: Record<string,string> = { dem:'#E53935', balgam:'#2196F3', sari_safra:'#FF8F00', kara_safra:'#5D4037' };
  const dColors: Record<string,string> = { normal:'#2D6A4F', fazla:'#C0392B', eksik:'#D97706' };
  const dLabels: Record<string,string> = { normal:'Dengeli ✓', fazla:'Fazla ↑', eksik:'Eksik ↓' };
  const dBg: Record<string,string> = { normal:'#D8F3DC', fazla:'#FDECEA', eksik:'#FEF3C7' };
  const tarih = new Date().toLocaleDateString('tr-TR',{day:'2-digit',month:'long',year:'numeric'});
  const mizac = typeof r.mizac === 'object' ? r.mizac : { tip: r.mizac || '', tam_tanim: r.mizac || '' };
  const hiltlar = r.hiltlar || r.hilt_dengesi || {};
  const bitkiler = r.bitki_recetesi || r.bitkisel_recete || r.bitkiler || [];
  const terkib = r.terkib_recetesi || [];
  const klinik = r.klinik_gozlemler || r.gozlemler || [];
  const beslenme = r.beslenme_recetesi || (typeof r.beslenme_onerileri === 'object' ? r.beslenme_onerileri : null);
  const egzersiz = r.egzersiz_recetesi || {};
  const gunlukRutin = r.gunluk_rutin || {};
  const uyum = mizac?.uyum_skoru || 0;

  return (
    <div style={{borderRadius:16,boxShadow:'0 8px 40px rgba(0,0,0,0.15)',overflow:'hidden',width:'100%',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>

      {/* MARKA BAŞLIĞI */}
      <div style={{background:'linear-gradient(135deg,#0F2A1A 0%,#1B4332 50%,#2D5A3D 100%)',padding:'28px 28px 22px',position:'relative',overflow:'hidden'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <div style={{width:46,height:46,background:'linear-gradient(135deg,#F4A823,#B5840C)',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22}}>🏺</div>
            <div>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:13,fontWeight:900,color:'#F4A823',letterSpacing:3}}>İPEK YOLU ŞİFACISI</div>
              <div style={{fontFamily:"'EB Garamond',serif",fontSize:11,color:'rgba(255,255,255,0.55)',letterSpacing:1.5,fontStyle:'italic'}}>ipek yolu şifacısı · الطب الكلاسيكي الإسلامي</div>
            </div>
          </div>
          <div style={{textAlign:'right',fontFamily:"'Cinzel',serif",fontSize:11,color:'rgba(255,255,255,0.4)',letterSpacing:2}}>
            <div>{tarih}</div>
          </div>
        </div>
        <div style={{fontFamily:"'Noto Naskh Arabic',serif",fontSize:15,color:'rgba(212,175,55,0.6)',marginBottom:6}}>تقرير تحليل المزاج والأخلاط الشخصي</div>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:20,fontWeight:900,color:'#fff',letterSpacing:2,textTransform:'uppercase' as const}}>KİŞİSEL MİZAÇ & SAĞLIK REÇETESİ</div>
        {hasta && (
          <div style={{marginTop:14,background:'rgba(244,168,35,0.10)',border:'1px solid rgba(244,168,35,0.25)',borderRadius:8,padding:'10px 16px'}}>
            <div style={{fontFamily:"'EB Garamond',serif",fontSize:11,color:'rgba(255,255,255,0.45)',letterSpacing:2,textTransform:'uppercase' as const,marginBottom:4}}>Düzenlendiği Kişi</div>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:15,color:'#F4A823',fontWeight:700}}>Sayın {hasta.tam_ad || 'Hasta'}</div>
          </div>
        )}
        <div style={{width:'100%',height:1,background:'linear-gradient(90deg,rgba(212,175,55,0.5),rgba(82,183,136,0.3),transparent)',marginTop:16}}/>
      </div>

      {/* MİZAÇ BLOKU */}
      <div style={{background:'linear-gradient(135deg,#1B4332,#2D6A4F)',padding:'24px 28px',position:'relative',overflow:'hidden'}}>
        <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:16}}>
          <div style={{flex:1}}>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:10,color:'rgba(255,255,255,0.5)',letterSpacing:3,textTransform:'uppercase' as const,marginBottom:6}}>Tespit Edilen Mizaç</div>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:22,fontWeight:900,color:'#F4A823',marginBottom:4,lineHeight:1.2}}>{mizac?.tam_tanim || mizac?.tip || ''}</div>
            <div style={{fontFamily:"'Noto Naskh Arabic',serif",fontSize:18,color:'rgba(255,255,255,0.65)',marginBottom:14}}>{mizac?.tip_ar || ''}</div>
            <div style={{display:'flex',gap:8,flexWrap:'wrap' as const}}>
              {mizac?.ana_element && <div style={{background:'rgba(255,255,255,0.1)',border:'1px solid rgba(255,255,255,0.18)',borderRadius:6,padding:'6px 12px'}}><span style={{fontSize:9,color:'rgba(255,255,255,0.45)',letterSpacing:2,display:'block',marginBottom:2}}>ANA ELEMENT</span><div style={{fontSize:13,fontWeight:600,color:'white'}}>{mizac.ana_element}</div></div>}
              {mizac?.alt_mizac && <div style={{background:'rgba(255,255,255,0.1)',border:'1px solid rgba(255,255,255,0.18)',borderRadius:6,padding:'6px 12px'}}><span style={{fontSize:9,color:'rgba(255,255,255,0.45)',letterSpacing:2,display:'block',marginBottom:2}}>ALT MİZAÇ</span><div style={{fontSize:13,fontWeight:600,color:'white'}}>{mizac.alt_mizac}</div></div>}
            </div>
            {mizac?.mevsim_etkisi && <div style={{marginTop:10,background:'rgba(255,255,255,0.08)',borderRadius:6,padding:'8px 12px',fontSize:13,color:'rgba(255,255,255,0.7)'}}>🌿 {mizac.mevsim_etkisi}</div>}
          </div>
          <div style={{display:'flex',flexDirection:'column' as const,alignItems:'center',gap:8}}>
            <div style={{width:84,height:84,borderRadius:'50%',background:`conic-gradient(#F4A823 ${uyum*3.6}deg,rgba(255,255,255,0.1) 0)`,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Cinzel',serif",fontSize:19,fontWeight:900,color:'#F4A823',position:'relative' as const}}>
              <div style={{position:'absolute' as const,inset:6,background:'#2D6A4F',borderRadius:'50%'}}/>
              <span style={{position:'relative' as const,zIndex:1}}>{uyum}%</span>
            </div>
            <div style={{fontSize:9,color:'rgba(255,255,255,0.4)',letterSpacing:1,textTransform:'uppercase' as const,textAlign:'center' as const}}>Uyum<br/>Skoru</div>
          </div>
        </div>
        {mizac?.sure && <div style={{marginTop:16,fontFamily:"'EB Garamond',serif",fontSize:16,color:'rgba(255,255,255,0.78)',fontStyle:'italic',lineHeight:1.7}}>{mizac.sure}</div>}
        {mizac?.kaynak && <div style={{marginTop:10,fontFamily:"'EB Garamond',serif",fontSize:13,color:'rgba(255,255,255,0.4)',fontStyle:'italic'}}>📖 {mizac.kaynak}</div>}
      </div>

      {/* FITRİ-HÂLİ */}
      {r.fitri_hali?.sapma && (
        <div style={{background:'#F3EFF8',padding:'22px 28px',borderTop:'1px solid #EDE7DC'}}>
          <div style={{display:'flex',alignItems:'center',gap:10,fontFamily:"'Cinzel',serif",fontSize:10,color:'#6A1B9A',letterSpacing:3,textTransform:'uppercase' as const,marginBottom:14}}>🔮 Fıtrî-Hâlî Karşılaştırması</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
            <div style={{background:'white',border:'1px solid #E8D5F5',borderRadius:8,padding:12}}><div style={{fontSize:10,color:'#6A1B9A',letterSpacing:1,marginBottom:4}}>FITRİ MİZAÇ</div><div style={{fontSize:14,fontWeight:600}}>{r.fitri_hali.fitri_mizac || 'Belirlenmedi'}</div></div>
            <div style={{background:'white',border:'1px solid #E8D5F5',borderRadius:8,padding:12}}><div style={{fontSize:10,color:'#6A1B9A',letterSpacing:1,marginBottom:4}}>HÂLİ MİZAÇ</div><div style={{fontSize:14,fontWeight:600}}>{r.fitri_hali.hali_mizac || '—'}</div></div>
          </div>
          <div style={{marginTop:10,background:'white',border:'1px solid #E8D5F5',borderRadius:8,padding:12}}><div style={{fontSize:10,color:'#6A1B9A',letterSpacing:1,marginBottom:4}}>SAPMA</div><div style={{fontFamily:"'EB Garamond',serif",fontSize:14,fontStyle:'italic'}}>{r.fitri_hali.sapma}</div></div>
          {r.fitri_hali.tedavi_hedefi && <div style={{marginTop:8,background:'#EDE7F6',borderRadius:8,padding:'10px 12px',fontSize:13,color:'#4A148C'}}>🎯 Tedavi Hedefi: {r.fitri_hali.tedavi_hedefi}</div>}
        </div>
      )}

      {/* HILTLAR */}
      {Object.keys(hiltlar).length > 0 && (
        <div style={{background:'#FFFDF8',padding:'22px 28px',borderTop:'1px solid #EDE7DC'}}>
          <div style={{display:'flex',alignItems:'center',gap:10,fontFamily:"'Cinzel',serif",fontSize:10,color:'#2D6A4F',letterSpacing:3,textTransform:'uppercase' as const,marginBottom:14}}>⚗️ Hılt Dengesi — الأخلاط الأربعة<div style={{flex:1,height:1,background:'linear-gradient(90deg,#C8C0B0,transparent)',marginLeft:10}}/></div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {Object.entries(hiltlar).map(([k, hRaw]: [string, any]) => {
              const h = typeof hRaw === 'object' && hRaw !== null ? hRaw : {oran: hRaw, durum:'normal', aciklama:''};
              const isDom = r.baskin_hilt === k;
              return (
                <div key={k} style={{background:'white',border:`1.5px solid ${isDom ? '#B5840C' : '#E8E0D0'}`,borderRadius:10,padding:14,boxShadow:isDom ? '0 4px 16px rgba(181,132,12,0.15)' : '0 2px 8px rgba(0,0,0,0.05)'}}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
                    <div>
                      <div style={{fontWeight:700,fontSize:12,color:'#1C1C1C'}}>{hNames[k] || k}</div>
                      <div style={{fontFamily:"'Noto Naskh Arabic',serif",fontSize:15,color:hColors[k]}}>{hAr[k]}</div>
                    </div>
                    {isDom && <span style={{fontSize:9,background:'#FEF3C7',border:'1px solid #B5840C',borderRadius:20,padding:'2px 8px',color:'#B5840C',fontFamily:"'Cinzel',serif",letterSpacing:1,fontWeight:700}}>BASKIN</span>}
                  </div>
                  <div style={{height:6,background:'#F0EBE0',borderRadius:3,overflow:'hidden',marginBottom:7}}><div style={{height:'100%',width:`${h.oran}%`,background:hColors[k],borderRadius:3}}/></div>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                    <div style={{fontSize:12,fontWeight:700,color:'#4A4A4A'}}>%{h.oran}</div>
                    <div style={{fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:20,background:dBg[h.durum||'normal'],color:dColors[h.durum||'normal']}}>{dLabels[h.durum||'normal']}</div>
                  </div>
                  {h.aciklama && <div style={{marginTop:8,fontFamily:"'EB Garamond',serif",fontSize:13,color:'#666',fontStyle:'italic',lineHeight:1.5}}>{h.aciklama}</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SEBEP ANALİZİ */}
      {r.sebep_analizi?.badi_sebep && r.sebep_analizi.badi_sebep !== 'Yakın/Mevcut sebep' && (
        <div style={{background:'#F3F4F6',padding:'22px 28px',borderTop:'1px solid #EDE7DC',borderLeft:'4px solid #6B7280'}}>
          <div style={{display:'flex',alignItems:'center',gap:10,fontFamily:"'Cinzel',serif",fontSize:10,color:'#374151',letterSpacing:3,textTransform:'uppercase' as const,marginBottom:14}}>🔍 Sebep Analizi — İbn Rüşd (el-Külliyyât)</div>
          <div style={{fontSize:13,marginBottom:6}}><strong>Yakın Sebep (Bâdî):</strong> {r.sebep_analizi.badi_sebep}</div>
          {(r.sebep_analizi.muid_sebepler||[]).map((s: string, i: number) => <div key={i} style={{fontSize:12,padding:'2px 0',color:'#6B7280'}}>→ {s}</div>)}
          {r.sebep_analizi.kok_mudahale && <div style={{fontSize:12,marginTop:6,color:'#059669'}}>Kök Müdahale: {r.sebep_analizi.kok_mudahale}</div>}
        </div>
      )}

      {/* KLİNİK GÖZLEMLER */}
      {klinik.length > 0 && (
        <div style={{background:'white',padding:'22px 28px',borderTop:'1px solid #EDE7DC'}}>
          <div style={{display:'flex',alignItems:'center',gap:10,fontFamily:"'Cinzel',serif",fontSize:10,color:'#2D6A4F',letterSpacing:3,textTransform:'uppercase' as const,marginBottom:14}}>🔬 Klinik Gözlemler — الملاحظات السريرية<div style={{flex:1,height:1,background:'linear-gradient(90deg,#C8C0B0,transparent)',marginLeft:10}}/></div>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {klinik.map((g: any, i: number) => {
            const obs = typeof g === 'string' ? {baslik: g, icerik:'', kaynak:''} : g;
            return (
              <div key={i} style={{display:'flex',gap:12,alignItems:'flex-start',padding:'12px 0',borderBottom:'1px solid #F0EBE0'}}>
                <div style={{width:34,height:34,borderRadius:8,background:'#D8F3DC',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,flexShrink:0}}>🔬</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:11,fontWeight:700,color:'#2D6A4F',letterSpacing:1,textTransform:'uppercase' as const,marginBottom:3}}>{obs.baslik}</div>
                  <div style={{fontFamily:"'EB Garamond',serif",fontSize:15,color:'#1C1C1C',lineHeight:1.6}}>{obs.icerik}</div>
                  {obs.kaynak && <div style={{fontSize:11,color:'#888',fontStyle:'italic',marginTop:3,fontFamily:"'EB Garamond',serif"}}>📖 {obs.kaynak}</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* BİTKİSEL REÇETE */}
      {bitkiler.length > 0 && (
        <div style={{background:'#FFFDF8',padding:'22px 28px',borderTop:'1px solid #EDE7DC'}}>
          <div style={{display:'flex',alignItems:'center',gap:10,fontFamily:"'Cinzel',serif",fontSize:10,color:'#2D6A4F',letterSpacing:3,textTransform:'uppercase' as const,marginBottom:14}}>🌿 Bitkisel Reçete — وصفة الأعشاب الطبية<div style={{flex:1,height:1,background:'linear-gradient(90deg,#C8C0B0,transparent)',marginLeft:10}}/></div>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {bitkiler.map((b: any, i: number) => (
            <div key={i} style={{background:'#F7FBF8',border:'1px solid #C8E6C9',borderRadius:10,padding:16,marginBottom:10}}>
              <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
                <div style={{background:'#2D6A4F',borderRadius:8,padding:'8px 12px',textAlign:'center' as const,flexShrink:0,minWidth:72}}>
                  <div style={{fontFamily:"'Noto Naskh Arabic',serif",fontSize:16,color:'#A5D6A7',display:'block',marginBottom:2}}>{b.ar}</div>
                  <div style={{fontFamily:"'Cinzel',serif",fontSize:9,color:'#F4A823',letterSpacing:1}}>{b.ad || b.bitki}</div>
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:700,color:'#1C1C1C',marginBottom:2}}>{b.bitki || b.ad || b.isim}</div>
                  {b.mizac && <div style={{fontSize:11,color:'#2D6A4F',fontStyle:'italic'}}>Mizaç: {b.mizac}</div>}
                  {b.endikasyon && <div style={{fontSize:12,color:'#555',marginTop:2}}>{b.endikasyon}</div>}
                </div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                {b.doz && <div style={{background:'white',borderRadius:6,padding:'8px 10px',border:'1px solid #E0F0E0'}}><div style={{fontSize:9,fontWeight:700,color:'#2D6A4F',letterSpacing:1,marginBottom:3}}>DOZ</div><div style={{fontSize:12}}>{b.doz}</div></div>}
                {b.hazirlanis && <div style={{background:'white',borderRadius:6,padding:'8px 10px',border:'1px solid #E0F0E0',gridColumn:'1/-1'}}><div style={{fontSize:9,fontWeight:700,color:'#2D6A4F',letterSpacing:1,marginBottom:3}}>HAZIRLANIS</div><div style={{fontSize:12}}>{b.hazirlanis}</div></div>}
              </div>
              {b.kontrendikasyon && <div style={{marginTop:8,background:'#FFF3E0',borderRadius:6,padding:'6px 10px',fontSize:11,color:'#E65100'}}>⚠ {b.kontrendikasyon}</div>}
              {b.kaynak && <div style={{marginTop:6,fontSize:11,color:'#888',fontStyle:'italic',fontFamily:"'EB Garamond',serif"}}>📖 {b.kaynak}</div>}
            </div>
          ))}
        </div>
      )}

      {/* TERKİB REÇETESİ */}
      {terkib.length > 0 && (
        <div style={{background:'white',padding:'22px 28px',borderTop:'1px solid #EDE7DC'}}>
          <div style={{display:'flex',alignItems:'center',gap:10,fontFamily:"'Cinzel',serif",fontSize:10,color:'#2D6A4F',letterSpacing:3,textTransform:'uppercase' as const,marginBottom:14}}>⚗️ Bileşik Formül (Terkib) — الأدوية المركبة<div style={{flex:1,height:1,background:'linear-gradient(90deg,#C8C0B0,transparent)',marginLeft:10}}/></div>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {terkib.map((t: any, i: number) => (
            <div key={i} style={{background:'#FFF8F0',border:'1px solid #FFE0B2',borderRadius:10,padding:16,marginBottom:10}}>
              <div style={{fontSize:14,fontWeight:700,color:'#E65100',marginBottom:4}}>{t.isim}</div>
              {t.tur && <div style={{fontSize:11,color:'#888',marginBottom:8}}>{t.tur}</div>}
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(t.bilesenler||[]).map((bl: any, j: number) => <div key={j} style={{fontSize:12,padding:'3px 0',borderBottom:'1px solid #FFE0B2'}}>• {bl.ad} — {bl.miktar}</div>)}
              {t.uygulama && <div style={{marginTop:8,fontSize:13,fontFamily:"'EB Garamond',serif"}}>{t.uygulama}</div>}
              {t.kaynak && <div style={{marginTop:6,fontSize:11,color:'#888',fontStyle:'italic'}}>📖 {t.kaynak}</div>}
            </div>
          ))}
        </div>
      )}

      {/* GÜNLÜK RUTİN */}
      {(gunlukRutin.sabah || gunlukRutin.oglen || gunlukRutin.aksam) && (
        <div style={{background:'#FFFDF8',padding:'22px 28px',borderTop:'1px solid #EDE7DC'}}>
          <div style={{display:'flex',alignItems:'center',gap:10,fontFamily:"'Cinzel',serif",fontSize:10,color:'#2D6A4F',letterSpacing:3,textTransform:'uppercase' as const,marginBottom:14}}>🕐 Günlük Rutin — الروتين اليومي<div style={{flex:1,height:1,background:'linear-gradient(90deg,#C8C0B0,transparent)',marginLeft:10}}/></div>
          {(['sabah','oglen','aksam'] as const).map((vakit) => {
            const items = gunlukRutin[vakit];
            if (!items) return null;
            const list = Array.isArray(items) ? items : [items];
            const labels: Record<string,string> = {sabah:'🌅 Sabah', oglen:'☀️ Öğle', aksam:'🌆 Akşam'};
            return (
              <div key={vakit} style={{marginBottom:8,padding:'10px 14px',background:'white',borderRadius:8,border:'1px solid #E8E0D0',borderLeft:'3px solid #2D6A4F'}}>
                <div style={{fontSize:11,fontWeight:700,color:'#2D6A4F',letterSpacing:1,marginBottom:4}}>{labels[vakit]}</div>
                {list.map((item: string, i: number) => <div key={i} style={{fontFamily:"'EB Garamond',serif",fontSize:14,color:'#333',lineHeight:1.6}}>{item}</div>)}
              </div>
            );
          })}
        </div>
      )}

      {/* BESLENME */}
      {beslenme && (
        <div style={{background:'#FFFDF8',padding:'22px 28px',borderTop:'1px solid #EDE7DC'}}>
          <div style={{display:'flex',alignItems:'center',gap:10,fontFamily:"'Cinzel',serif",fontSize:10,color:'#2D6A4F',letterSpacing:3,textTransform:'uppercase' as const,marginBottom:14}}>🍽️ Beslenme Reçetesi — التغذية الطبية<div style={{flex:1,height:1,background:'linear-gradient(90deg,#C8C0B0,transparent)',marginLeft:10}}/></div>
          {beslenme.ilke && <div style={{background:'linear-gradient(135deg,#1B4332,#2D6A4F)',borderRadius:8,padding:'12px 16px',marginBottom:14}}><div style={{fontSize:10,letterSpacing:2,color:'rgba(255,255,255,0.55)',textTransform:'uppercase' as const,marginBottom:4}}>TEMEL İLKE</div><div style={{fontSize:15,color:'rgba(255,255,255,0.9)'}}>{beslenme.ilke}</div></div>}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <div style={{background:'#D8F3DC',border:'1px solid #52B788',borderRadius:8,padding:14}}>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:2,textTransform:'uppercase' as const,color:'#2D6A4F',marginBottom:8}}>Önerilen Gıdalar</div>
              <ul style={{listStyle:'none',margin:0,padding:0}}>
                {(Array.isArray(beslenme.onerililer) ? beslenme.onerililer : []).map((x: string, i: number) => <li key={i} style={{fontFamily:"'EB Garamond',serif",fontSize:14,color:'#333',padding:'2px 0',lineHeight:1.5}}>• {x}</li>)}
              </ul>
            </div>
            <div style={{background:'#FDECEA',border:'1px solid #EF9A9A',borderRadius:8,padding:14}}>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:2,textTransform:'uppercase' as const,color:'#C0392B',marginBottom:8}}>Kaçınılacaklar</div>
              <ul style={{listStyle:'none',margin:0,padding:0}}>
                {(Array.isArray(beslenme.kacinilacaklar) ? beslenme.kacinilacaklar : []).map((x: string, i: number) => <li key={i} style={{fontFamily:"'EB Garamond',serif",fontSize:14,color:'#333',padding:'2px 0',lineHeight:1.5}}>• {x}</li>)}
              </ul>
            </div>
          </div>
          {(beslenme.pisirime_yontemi || beslenme.ozel_tavsiyeler) && (
            <div style={{marginTop:12,background:'#FEF3C7',borderRadius:8,padding:12,border:'1px solid #F4A823',fontFamily:"'EB Garamond',serif",fontSize:15,color:'#333',lineHeight:1.6}}>
              {beslenme.pisirime_yontemi && <><strong style={{color:'#B5840C'}}>Pişirme:</strong> {beslenme.pisirime_yontemi}<br/></>}
              {beslenme.ozel_tavsiyeler}
              {beslenme.kaynak && <div style={{marginTop:8,fontSize:13,color:'#888'}}>{beslenme.kaynak}</div>}
            </div>
          )}
        </div>
      )}

      {/* EGZERSİZ */}
      {(egzersiz.tur || egzersiz.ozel) && (
        <div style={{background:'white',padding:'22px 28px',borderTop:'1px solid #EDE7DC'}}>
          <div style={{display:'flex',alignItems:'center',gap:10,fontFamily:"'Cinzel',serif",fontSize:10,color:'#2D6A4F',letterSpacing:3,textTransform:'uppercase' as const,marginBottom:14}}>🏃 Egzersiz Reçetesi — التمارين الرياضية<div style={{flex:1,height:1,background:'linear-gradient(90deg,#C8C0B0,transparent)',marginLeft:10}}/></div>
          <div style={{background:'linear-gradient(135deg,#EEF7EE,#D8F3DC)',border:'1.5px solid #52B788',borderRadius:10,padding:16}}>
            <div style={{display:'flex',gap:10,flexWrap:'wrap' as const,marginBottom:12}}>
              {egzersiz.tur && <div style={{background:'white',borderRadius:6,padding:'7px 12px',border:'1px solid #C8E6C9',textAlign:'center' as const}}><span style={{fontSize:9,color:'#2D6A4F',letterSpacing:1,display:'block',marginBottom:2}}>TÜR</span><div style={{fontSize:13,fontWeight:700}}>{egzersiz.tur}</div></div>}
              {egzersiz.zaman && <div style={{background:'white',borderRadius:6,padding:'7px 12px',border:'1px solid #C8E6C9',textAlign:'center' as const}}><span style={{fontSize:9,color:'#2D6A4F',letterSpacing:1,display:'block',marginBottom:2}}>ZAMAN</span><div style={{fontSize:13,fontWeight:700}}>{egzersiz.zaman}</div></div>}
              {egzersiz.sure && <div style={{background:'white',borderRadius:6,padding:'7px 12px',border:'1px solid #C8E6C9',textAlign:'center' as const}}><span style={{fontSize:9,color:'#2D6A4F',letterSpacing:1,display:'block',marginBottom:2}}>SÜRE</span><div style={{fontSize:13,fontWeight:700}}>{egzersiz.sure}</div></div>}
              {egzersiz.siddet && <div style={{background:'white',borderRadius:6,padding:'7px 12px',border:'1px solid #C8E6C9',textAlign:'center' as const}}><span style={{fontSize:9,color:'#2D6A4F',letterSpacing:1,display:'block',marginBottom:2}}>YOĞUNLUK</span><div style={{fontSize:13,fontWeight:700}}>{egzersiz.siddet}</div></div>}
            </div>
            {egzersiz.ozel && <div style={{fontFamily:"'EB Garamond',serif",fontSize:15,color:'#1C1C1C',lineHeight:1.6,marginBottom:10}}>{egzersiz.ozel}</div>}
            {egzersiz.kacinilacaklar && <div style={{background:'white',borderRadius:6,padding:'10px 12px',borderLeft:'3px solid #EF5350'}}><div style={{fontSize:10,fontWeight:700,color:'#C0392B',letterSpacing:1,marginBottom:4}}>⚠ Kaçınılacak</div><div style={{fontFamily:"'EB Garamond',serif",fontSize:14,color:'#333'}}>{egzersiz.kacinilacaklar}</div></div>}
            {egzersiz.kaynak && <div style={{marginTop:10,fontSize:12,color:'#666',fontFamily:"'EB Garamond',serif",fontStyle:'italic'}}>📖 {egzersiz.kaynak}</div>}
          </div>
        </div>
      )}

      {/* İLAÇ ETKİLEŞİMLERİ */}
      {(r.ilac_etkilesimleri||[]).length > 0 && (
        <div style={{background:'#FFF3E0',padding:'22px 28px',borderTop:'1px solid #EDE7DC',borderLeft:'4px solid #FF8F00'}}>
          <div style={{display:'flex',alignItems:'center',gap:10,fontFamily:"'Cinzel',serif",fontSize:10,color:'#E65100',letterSpacing:3,textTransform:'uppercase' as const,marginBottom:14}}>💊 İlaç-Bitki Etkileşim Uyarıları</div>
          {r.ilac_etkilesimleri.map((e: string, i: number) => <div key={i} style={{padding:'6px 0',fontSize:13,borderBottom:'1px solid #FFE0B2'}}>⚡ {e}</div>)}
        </div>
      )}

      {/* ALTERNATİF BİTKİLER */}
      {(r.alternatif_bitkiler||[]).length > 0 && (
        <div style={{background:'#E8F5E9',padding:'22px 28px',borderTop:'1px solid #EDE7DC',borderLeft:'4px solid #43A047'}}>
          <div style={{display:'flex',alignItems:'center',gap:10,fontFamily:"'Cinzel',serif",fontSize:10,color:'#2E7D32',letterSpacing:3,textTransform:'uppercase' as const,marginBottom:14}}>🔄 Alternatifler (el-Ebdâl)</div>
          {r.alternatif_bitkiler.map((a: string, i: number) => <div key={i} style={{padding:'4px 0',fontSize:13}}>↔ {a}</div>)}
        </div>
      )}

      {/* HASTA YAŞI NOTU */}
      {r.hasta_yasina_gore_not && (
        <div style={{background:'#EDE7F6',padding:'22px 28px',borderTop:'1px solid #EDE7DC',borderLeft:'4px solid #7B1FA2'}}>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:10,color:'#6A1B9A',letterSpacing:3,textTransform:'uppercase' as const,marginBottom:10}}>👤 Yaş/Durum Özel Notu</div>
          <div style={{fontSize:13,lineHeight:1.7}}>{r.hasta_yasina_gore_not}</div>
        </div>
      )}

      {/* SONRAKİ KONTROL */}
      {r.sonraki_kontrol?.sure && (
        <div style={{background:'#E3F2FD',padding:'22px 28px',borderTop:'1px solid #EDE7DC',borderLeft:'4px solid #1976D2'}}>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:10,color:'#0D47A1',letterSpacing:3,textTransform:'uppercase' as const,marginBottom:10}}>📅 Sonraki Kontrol — {r.sonraki_kontrol.sure}</div>
          {r.sonraki_kontrol.amac && <div style={{fontSize:13,marginBottom:6}}>{r.sonraki_kontrol.amac}</div>}
          {(r.sonraki_kontrol.odak_parametreler||[]).length > 0 && (
            <div style={{display:'flex',flexWrap:'wrap' as const,gap:6,marginTop:6}}>
              {r.sonraki_kontrol.odak_parametreler.map((p: string, i: number) => <span key={i} style={{background:'#BBDEFB',borderRadius:12,padding:'3px 10px',fontSize:11,color:'#0D47A1'}}>📍 {p}</span>)}
            </div>
          )}
        </div>
      )}

      {/* HİKMETLİ SÖZ */}
      {r.hikmetli_soz?.metin && (
        <div style={{background:'linear-gradient(135deg,#FDF6E3,#FEF3C7)',border:'1px solid #D4AF37',padding:'22px 24px',margin:'0 0 2px'}}>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:10,color:'#8B6914',letterSpacing:3,textTransform:'uppercase' as const,marginBottom:14}}>Hikmet — حكمة</div>
          {r.hikmetli_soz.metin_ar && <div style={{fontFamily:"'Noto Naskh Arabic',serif",fontSize:22,color:'#5D4037',direction:'rtl' as const,textAlign:'right' as const,lineHeight:1.9,marginBottom:12}}>{r.hikmetli_soz.metin_ar}</div>}
          <div style={{fontFamily:"'EB Garamond',serif",fontSize:18,color:'#3E2723',lineHeight:1.7,marginBottom:10}}>{r.hikmetli_soz.metin}</div>
          {r.hikmetli_soz.kaynak && <div style={{fontSize:12,color:'#8B6914',fontFamily:"'Cinzel',serif",letterSpacing:1}}>— {r.hikmetli_soz.kaynak}</div>}
        </div>
      )}

      {/* UYARILAR */}
      {(r.uyarilar||[]).length > 0 && (
        <div style={{background:'white',padding:'22px 28px',borderTop:'1px solid #EDE7DC'}}>
          <div style={{display:'flex',alignItems:'center',gap:10,fontFamily:"'Cinzel',serif",fontSize:10,color:'#2D6A4F',letterSpacing:3,textTransform:'uppercase' as const,marginBottom:14}}>⚠️ Uyarılar</div>
          {r.uyarilar.map((u: string, i: number) => (
            <div key={i} style={{display:'flex',gap:10,alignItems:'flex-start',background:'#FFFDE7',borderRadius:7,padding:'10px 12px',borderLeft:'3px solid #F4A823',marginBottom:6}}>
              <span style={{fontSize:15,flexShrink:0}}>⚠️</span>
              <div style={{fontFamily:"'EB Garamond',serif",fontSize:14,color:'#333',lineHeight:1.5}}>{u}</div>
            </div>
          ))}
        </div>
      )}

      {/* ÖZET */}
      {r.ozet && (
        <div style={{background:'linear-gradient(135deg,#1B4332,#2D6A4F)',padding:'22px 28px'}}>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:10,color:'rgba(255,255,255,0.5)',letterSpacing:3,textTransform:'uppercase' as const,marginBottom:10}}>Genel Değerlendirme — التقييم العام</div>
          <div style={{fontFamily:"'EB Garamond',serif",fontSize:16,color:'rgba(255,255,255,0.85)',lineHeight:1.8,fontStyle:'italic'}}>{r.ozet}</div>
        </div>
      )}

      {/* FOOTER */}
      <div style={{background:'#0F2A1A',padding:'16px 28px',borderRadius:'0 0 16px 16px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:12,color:'rgba(212,175,55,0.7)',letterSpacing:3}}>⚗️ İPEK YOLU ŞİFACISI</div>
        <div style={{fontFamily:"'EB Garamond',serif",fontSize:11,color:'rgba(255,255,255,0.3)',fontStyle:'italic',maxWidth:340,textAlign:'right' as const,lineHeight:1.5}}>Bu kart klasik İslam tıbbı çerçevesinde bilgilendirme amaçlıdır. Tıbbi teşhis yerine geçmez.</div>
      </div>

    </div>
  );
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
          .select('id, mizac_tipi, created_at, sonuc_verisi')
          .eq('detailed_form_id', formId)
          .order('created_at', { ascending: false })
        const list = Array.isArray(data) ? data : []
        setGecmisAnalizler(list)
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
      const { data: eskiList } = await supabase
        .from('analyses')
        .select('sonuc_verisi')
        .eq('detailed_form_id', secili.id)
        .order('created_at', { ascending: false })
        .limit(1)
      const eskiAnaliz = Array.isArray(eskiList) && eskiList.length > 0 ? eskiList[0] : null
      if (eskiAnaliz?.sonuc_verisi) {
        setAnaliz(eskiAnaliz.sonuc_verisi)
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
          detailed_form_id: secili.id,
          mizac_tipi: (typeof parsed.mizac === 'object' ? (parsed.mizac?.tip || parsed.mizac?.tip_ar || '') : parsed.mizac) || '',
          sonuc_verisi: parsed,
          recete: parsed.bitki_recetesi || null,
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

  ${analiz.mizac ? `<div class="section"><div class="mizac-kart"><div class="label-sm" style="color:rgba(255,255,255,.4);letter-spacing:2px;">TESPIT EDILEN MIZAC</div><div class="mizac-buyuk">${safeStr(typeof analiz.mizac === 'object' ? (analiz.mizac?.tip || '') : (analiz.mizac || ''))}</div>${analiz.fitri_hali ? `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;"><div style="background:rgba(255,255,255,.08);border-radius:6px;padding:8px;"><div class="label-sm" style="color:rgba(255,255,255,.4);">FITRI</div><div style="font-size:12px;color:white;margin-top:2px;">${safeStr(analiz.fitri_hali.fitri_mizac)}</div></div><div style="background:rgba(255,255,255,.08);border-radius:6px;padding:8px;"><div class="label-sm" style="color:rgba(255,255,255,.4);">HALI</div><div style="font-size:12px;color:white;margin-top:2px;">${safeStr(analiz.fitri_hali.hali_mizac)}</div></div></div>${analiz.fitri_hali.tedavi_hedefi ? `<div style="background:rgba(184,146,42,.15);border-radius:6px;padding:8px;margin-top:8px;"><div class="label-sm" style="color:#B8860B;">TEDAVI HEDEFI</div><div style="font-size:12px;color:rgba(255,255,255,.85);margin-top:2px;">${safeStr(analiz.fitri_hali.tedavi_hedefi)}</div></div>` : ''}` : ''}</div></div>` : ''}

  ${analiz.hilt_dengesi ? `<div class="section"><div class="section-title">Hilt Dengesi</div><div class="hilt-grid">${analiz.hilt_dengesi.dem ? `<div class="hilt-kart hilt-dem"><div style="font-weight:600;font-size:12px;">Dem</div><div class="hilt-yuzde" style="color:#EF5350;">${analiz.hilt_dengesi.dem.yuzde}%</div><div style="font-size:10px;color:#6B5744;margin-top:4px;">${safeStr(analiz.hilt_dengesi.dem.yorum)}</div></div>` : ''}${analiz.hilt_dengesi.balgam ? `<div class="hilt-kart hilt-balgam"><div style="font-weight:600;font-size:12px;">Balgam</div><div class="hilt-yuzde" style="color:#42A5F5;">${analiz.hilt_dengesi.balgam.yuzde}%</div><div style="font-size:10px;color:#6B5744;margin-top:4px;">${safeStr(analiz.hilt_dengesi.balgam.yorum)}</div></div>` : ''}${analiz.hilt_dengesi.safra ? `<div class="hilt-kart hilt-safra"><div style="font-weight:600;font-size:12px;">Safra</div><div class="hilt-yuzde" style="color:#FFA726;">${analiz.hilt_dengesi.safra.yuzde}%</div><div style="font-size:10px;color:#6B5744;margin-top:4px;">${safeStr(analiz.hilt_dengesi.safra.yorum)}</div></div>` : ''}${analiz.hilt_dengesi.kara_safra ? `<div class="hilt-kart hilt-karasafra"><div style="font-weight:600;font-size:12px;">Kara Safra</div><div class="hilt-yuzde" style="color:#AB47BC;">${analiz.hilt_dengesi.kara_safra.yuzde}%</div><div style="font-size:10px;color:#6B5744;margin-top:4px;">${safeStr(analiz.hilt_dengesi.kara_safra.yorum)}</div></div>` : ''}</div></div>` : ''}

  ${analiz.ozet ? `<div class="section"><div class="section-title">Genel Degerlendirme</div><div class="ozet-metin">${safeStr(analiz.ozet)}</div></div>` : ''}

  ${analiz.bitki_recetesi?.length > 0 ? `<div class="section"><div class="section-title">Bitkisel Protokol</div>${(Array.isArray(analiz.bitki_recetesi)?analiz.bitki_recetesi:[]).map((b: {bitki?:string,bitki_ar?:string,doz?:string,zaman?:string,sure?:string,etki?:string,kaynak?:string}) => `<div class="bitki-kart"><div class="bitki-ad">${safeStr(b.bitki)}</div>${b.bitki_ar ? `<div class="bitki-ar">${safeStr(b.bitki_ar)}</div>` : ''}<div class="bitki-detay"><strong>Doz:</strong> ${safeStr(b.doz)}<br><strong>Zaman:</strong> ${safeStr(b.zaman)} | <strong>Sure:</strong> ${safeStr(b.sure)}${b.etki ? `<br>${safeStr(b.etki)}` : ''}</div>${b.kaynak ? `<div class="bitki-kaynak">${safeStr(b.kaynak)}</div>` : ''}</div>`).join('')}</div>` : ''}

  ${analiz.gunluk_rutin ? `<div class="section"><div class="section-title">Gunluk Rutin</div>${(Array.isArray(analiz.gunluk_rutin?.sabah) ? analiz.gunluk_rutin.sabah : typeof analiz.gunluk_rutin?.sabah === 'string' ? [analiz.gunluk_rutin.sabah] : []).length ? `<div class="rutin-blok sabah-blok"><div class="rutin-baslik">Sabah</div>${(Array.isArray(analiz.gunluk_rutin.sabah) ? analiz.gunluk_rutin.sabah : [analiz.gunluk_rutin.sabah]).map((i: string) => `<div class="rutin-item">${safeStr(i)}</div>`).join('')}</div>` : ''}${(Array.isArray(analiz.gunluk_rutin?.ogle) ? analiz.gunluk_rutin.ogle : typeof analiz.gunluk_rutin?.ogle === 'string' ? [analiz.gunluk_rutin.ogle] : []).length ? `<div class="rutin-blok ogle-blok"><div class="rutin-baslik">Ogle</div>${(Array.isArray(analiz.gunluk_rutin.ogle) ? analiz.gunluk_rutin.ogle : [analiz.gunluk_rutin.ogle]).map((i: string) => `<div class="rutin-item">${safeStr(i)}</div>`).join('')}</div>` : ''}${(Array.isArray(analiz.gunluk_rutin?.aksam) ? analiz.gunluk_rutin.aksam : typeof analiz.gunluk_rutin?.aksam === 'string' ? [analiz.gunluk_rutin.aksam] : []).length ? `<div class="rutin-blok aksam-blok"><div class="rutin-baslik">Aksam</div>${(Array.isArray(analiz.gunluk_rutin.aksam) ? analiz.gunluk_rutin.aksam : [analiz.gunluk_rutin.aksam]).map((i: string) => `<div class="rutin-item">${safeStr(i)}</div>`).join('')}</div>` : ''}</div>` : ''}

  ${analiz.beslenme_onerileri ? `<div class="section"><div class="section-title">Beslenme</div>${typeof analiz.beslenme_onerileri === 'string' ? `<div class="ozet-metin">${safeStr(analiz.beslenme_onerileri)}</div>` : `${analiz.beslenme_onerileri.temel_ilke ? `<div style="font-style:italic;color:#1C3A26;font-weight:500;margin-bottom:10px;">${safeStr(analiz.beslenme_onerileri.temel_ilke)}</div>` : ''}<div class="beslenme-grid">${analiz.beslenme_onerileri.onerililer?.length ? `<div class="beslenme-oneri"><div class="beslenme-baslik oneri-baslik">Onerilen</div>${(Array.isArray(analiz.beslenme_onerileri?.onerililer)?analiz.beslenme_onerileri.onerililer:[]).map((g: string) => `<div class="liste-item">${safeStr(g)}</div>`).join('')}</div>` : ''}${analiz.beslenme_onerileri.kacinilacaklar?.length ? `<div class="beslenme-kacin"><div class="beslenme-baslik kacin-baslik">Kacinilacak</div>${(Array.isArray(analiz.beslenme_onerileri?.kacinilacaklar)?analiz.beslenme_onerileri.kacinilacaklar:[]).map((g: string) => `<div class="liste-item">${safeStr(g)}</div>`).join('')}</div>` : ''}</div>`}</div>` : ''}

  ${analiz.hikmet ? `<div class="section"><div class="hikmet-kart"><div class="label-sm" style="color:rgba(255,255,255,.4);letter-spacing:2px;margin-bottom:10px;">HIKMET</div>${analiz.hikmet.arapca ? `<div class="hikmet-ar">${safeStr(analiz.hikmet.arapca)}</div>` : ''}${analiz.hikmet.turkce ? `<div class="hikmet-tr">${safeStr(analiz.hikmet.turkce)}</div>` : ''}${analiz.hikmet.kaynak ? `<div class="hikmet-kaynak">- ${safeStr(analiz.hikmet.kaynak)}</div>` : ''}</div></div>` : ''}

  ${analiz.kaynaklar?.length > 0 ? `<div class="section"><div class="section-title">Kullanilan Kaynaklar</div><div class="kaynaklar">${(Array.isArray(analiz.kaynaklar)?analiz.kaynaklar:[]).map((k: string) => `<span class="kaynak-pill">${safeStr(k)}</span>`).join('')}</div></div>` : ''}

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

                  <AnalizKart analiz={analiz} hasta={secili} />

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
                          const gMizac = ga.mizac_tipi || '-'
                          const gMr = (() => {
                            const ml = (ga.mizac_tipi || '').toLowerCase()
                            if (ml.includes('safra')) return { bg: '#FFF8E7', color: '#B8860B' }
                            if (ml.includes('dem')) return { bg: '#FFE8E8', color: '#C62828' }
                            if (ml.includes('balgam')) return { bg: '#E3F2FD', color: '#1565C0' }
                            if (ml.includes('sevda')) return { bg: '#F3E5F5', color: '#6A1B9A' }
                            return { bg: '#E8F5E9', color: '#1B5E20' }
                          })()
                          const gDurum = { bg: '#E8F5E9', color: '#1B5E20', text: 'Tamamlandı' }
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
