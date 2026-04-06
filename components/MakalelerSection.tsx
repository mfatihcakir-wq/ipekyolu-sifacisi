"use client"
import { useEffect, useState } from 'react'

interface KaynakRef { hekim?: string; eser?: string }
interface Makale {
  id: string; baslik: string; baslik_ar?: string
  kategori?: string; ozet?: string
  kaynak_metinler?: KaynakRef[]; slug: string
}
interface Hekim {
  id: string; isim: string; isim_ar?: string
  dogum_olum?: string; eserler?: string[]; slug: string
}

const PLACEHOLDER_MAKALELER: Makale[] = [
  { id:'p1', slug:'mizac-teorisi',
    baslik:'Mizaç Teorisi: Dört Hılt, Dört Mevsim, Dört İnsan',
    baslik_ar:'نظرية الأمزجة والأخلاط',
    kategori:'TEMEL KAVRAMLAR',
    ozet:'İbn Sînâ\u2019nın el-Kânûn\u2019unda sistemleştirdiği hümoral tıbbın temelleri.',
    kaynak_metinler:[{hekim:'İbn Sînâ',eser:'el-Kânûn I'}] },
  { id:'p2', slug:'nabiz-sifatlari',
    baslik:'Nabız Dokuz Sıfatı: İbn Sînâ\u2019nın Teşhis Anahtarı',
    baslik_ar:'علم النبض عند ابن سينا',
    kategori:'NABIZ İLMİ',
    ozet:'Büyüklük, kuvvet, hız, dolgunluk ve 5 sıfatla teşhis yöntemi.',
    kaynak_metinler:[{hekim:'İbn Sînâ',eser:'el-Kânûn III'}] },
  { id:'p3', slug:'besin-mizac',
    baslik:'Mizaca Göre Beslenme: El-Hâvî\u2019nin Sofra Rehberi',
    baslik_ar:'الأغذية والأدوية المفردة',
    kategori:'BESİN İLMİ',
    ozet:'Er-Râzî\u2019nin besin maddeleri ve mevsimsel beslenme önerileri.',
    kaynak_metinler:[{hekim:'Er-Râzî',eser:'el-Hâvî V'}] },
  { id:'p4', slug:'kalp-hastaliklari',
    baslik:'Kalp Hastalıkları: Gazzâlî\u2019nin Nefs Muhasebesi',
    baslik_ar:'طب الأرواح والنفس',
    kategori:'RUHSAL SAĞLIK',
    ozet:'Kibir, hased ve dünya sevgisinin bedene yansımaları.',
    kaynak_metinler:[{hekim:'Gazzâlî',eser:'İhyâu Ulûm'}] },
  { id:'p5', slug:'zehravi-cerrahi',
    baslik:'Ez-Zehravî\u2019nin Cerrahi Aletleri: 200 Operasyon',
    baslik_ar:'الجراحة والعمليات',
    kategori:'CERRAHİ',
    ozet:'Et-Tasrîf\u2019teki cerrahi aletler ve modern karşılıkları.',
    kaynak_metinler:[{hekim:'Ez-Zehravî',eser:'et-Tasrîf'}] },
]

const PLACEHOLDER_HEKIMLER: Hekim[] = [
  {id:'h1',slug:'ibn-sina',isim:'İbn Sînâ',isim_ar:'ابن سينا',dogum_olum:'980–1037',eserler:['el-Kânûn fi\u2019t-Tıb']},
  {id:'h2',slug:'er-razi',isim:'Er-Râzî',isim_ar:'الرازي',dogum_olum:'865–925',eserler:['el-Hâvî fi\u2019t-Tıb']},
  {id:'h3',slug:'ez-zehravi',isim:'Ez-Zehravî',isim_ar:'الزهراوي',dogum_olum:'936–1013',eserler:['et-Tasrîf']},
  {id:'h4',slug:'ibn-beytar',isim:'İbn Beytâr',isim_ar:'ابن البيطار',dogum_olum:'1197–1248',eserler:['el-Câmi li-Müfredât']},
  {id:'h5',slug:'ibn-nefis',isim:'İbn Nefîs',isim_ar:'ابن النفيس',dogum_olum:'1213–1288',eserler:['el-Şâmil']},
  {id:'h6',slug:'el-herevi',isim:'El-Herevî',isim_ar:'الهروي',dogum_olum:'ö. 1533',eserler:['Bahrü\u2019l-Cevâhir']},
  {id:'h7',slug:'el-antaki',isim:'El-Antâkî',isim_ar:'الأنطاكي',dogum_olum:'ö. 1599',eserler:['Tezkîretü Uli\u2019l-Elbâb']},
  {id:'h8',slug:'tokatli',isim:'Tokatlı Mustafa Efendi',isim_ar:'توقاتي',dogum_olum:'18. yy',eserler:['Tahbîzü\u2019l-Mathûn']},
  {id:'h9',slug:'el-hayati',isim:'Hekim Ahmet el-Hayâtî',isim_ar:'الحياتي',dogum_olum:'15. yy',eserler:['Şeceretü\u2019t-Tıb']},
]

export default function MakalelerSection() {
  const [makaleler, setMakaleler] = useState<Makale[]>(PLACEHOLDER_MAKALELER)
  const [hekimler, setHekimler] = useState<Hekim[]>(PLACEHOLDER_HEKIMLER)

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) return

    fetch(`${url}/rest/v1/makaleler?yayinda=eq.true&order=olusturulma.desc&limit=5&select=id,baslik,baslik_ar,kategori,ozet,kaynak_metinler,slug`, {
      headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
    })
      .then(r => r.json())
      .then(data => { if (Array.isArray(data) && data.length > 0) setMakaleler(data) })
      .catch(() => {})

    fetch(`${url}/rest/v1/hekim_biyografileri?aktif=eq.true&order=sira.asc&select=id,isim,isim_ar,dogum_olum,eserler,slug`, {
      headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
    })
      .then(r => r.json())
      .then(data => { if (Array.isArray(data) && data.length > 0) setHekimler(data) })
      .catch(() => {})
  }, [])

  const featured = makaleler[0]
  const rest = makaleler.slice(1)

  const GEO = () => (
    <svg width="100%" height="100%" viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice" style={{position:'absolute',inset:0,pointerEvents:'none'}}>
      <g stroke="#D4A843" strokeWidth="0.5" fill="none" opacity="0.04">
        <polygon points="600,50 850,180 850,420 600,550 350,420 350,180"/>
        <circle cx="600" cy="300" r="200"/>
        <circle cx="600" cy="300" r="160"/>
        <line x1="600" y1="50" x2="600" y2="550"/>
        <line x1="350" y1="180" x2="850" y2="420"/>
        <line x1="850" y1="180" x2="350" y2="420"/>
      </g>
    </svg>
  )

  return (
    <>
    <section style={{background:'#1A2E1E',padding:'88px clamp(20px,5vw,80px)',position:'relative',overflow:'hidden'}}>
      <GEO/>
      <div style={{position:'relative',zIndex:2}}>
        <div style={{textAlign:'center',marginBottom:48}}>
          <div style={{fontFamily:'Cinzel,serif',fontSize:9,letterSpacing:5,color:'rgba(212,168,67,.5)',marginBottom:12}}>İLİM · MAARİF · HİKMET</div>
          <h2 style={{fontFamily:'Cinzel,serif',fontSize:'clamp(26px,3.5vw,40px)',fontWeight:700,color:'#F5EAD4',letterSpacing:2,marginBottom:8}}>Klasik Tıbbın <span style={{color:'#D4A843'}}>Hazinesi</span></h2>
          <div style={{fontFamily:'serif',fontSize:16,color:'rgba(212,168,67,.35)',marginBottom:12,direction:'rtl' as const}}>كنوز الطب الإسلامي الكلاسيكي</div>
          <p style={{fontFamily:'EB Garamond,serif',fontSize:17,fontStyle:'italic',color:'rgba(245,234,212,.4)',maxWidth:520,margin:'0 auto 16px',lineHeight:1.7}}>31.369 metin kaydından derlenen, kaynak gösterimli makaleler.</p>
          <div style={{display:'inline-block',background:'rgba(212,168,67,0.08)',border:'1px solid rgba(212,168,67,0.15)',borderRadius:20,padding:'6px 16px',fontFamily:'Cinzel,serif',fontSize:8,color:'rgba(212,168,67,0.5)',letterSpacing:2}}>✦ KLASİK METİNLERDEN DERLENDİ · KAYNAK GÖSTERİMLİ</div>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:18,maxWidth:1100,margin:'0 auto 40px'}}>
          {featured && (
            <div onClick={()=>{window.location.href=`/makale/${featured.slug}`}} style={{background:'rgba(212,168,67,0.04)',border:'1px solid rgba(212,168,67,0.2)',borderRadius:16,padding:28,cursor:'pointer',gridColumn:'span 2',display:'grid',gridTemplateColumns:'130px 1fr',gap:24,alignItems:'center'}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'center'}}>
                <svg width="110" height="110" viewBox="0 0 140 140" fill="none">
                  <circle cx="70" cy="70" r="65" stroke="#D4A843" strokeWidth="0.5" strokeOpacity="0.2"/>
                  <circle cx="70" cy="70" r="35" stroke="#D4A843" strokeWidth="0.8" strokeOpacity="0.3" fill="none" style={{animation:'rotS 20s linear infinite',transformOrigin:'70px 70px'}}/>
                  <circle cx="70" cy="70" r="20" fill="#1A2E1E" stroke="#D4A843" strokeWidth="0.6" strokeOpacity="0.4"/>
                  <circle cx="70" cy="70" r="5" fill="#D4A843" opacity="0.6"/>
                  <circle cx="70" cy="35" r="3.5" fill="#EF5350" opacity="0.7"/>
                  <circle cx="105" cy="70" r="3" fill="#FF8A65" opacity="0.7"/>
                  <circle cx="70" cy="105" r="3" fill="#64B5F6" opacity="0.7"/>
                  <circle cx="35" cy="70" r="3" fill="#CE93D8" opacity="0.7"/>
                </svg>
              </div>
              <div>
                <div style={{fontFamily:'Cinzel,serif',fontSize:7,letterSpacing:3,color:'#D4A843',padding:'4px 10px',border:'1px solid rgba(212,168,67,0.2)',borderRadius:20,display:'inline-block',marginBottom:12}}>{featured.kategori||'MAKALE'}</div>
                {featured.baslik_ar && (<div style={{fontFamily:'serif',fontSize:14,color:'rgba(212,168,67,0.4)',marginBottom:6,direction:'rtl' as const,textAlign:'right' as const}}>{featured.baslik_ar}</div>)}
                <div style={{fontFamily:'Cinzel,serif',fontSize:17,fontWeight:600,color:'#F5EAD4',lineHeight:1.3,marginBottom:10}}>{featured.baslik}</div>
                <div style={{fontFamily:'EB Garamond,serif',fontSize:15,color:'rgba(245,234,212,.45)',lineHeight:1.75,marginBottom:14,fontStyle:'italic'}}>{featured.ozet}</div>
                <div style={{display:'flex',alignItems:'center',gap:8,paddingTop:12,borderTop:'1px solid rgba(212,168,67,0.08)'}}>
                  <div style={{width:5,height:5,borderRadius:'50%',background:'#D4A843',opacity:0.5}}/>
                  <div style={{fontFamily:'Cinzel,serif',fontSize:8,color:'rgba(212,168,67,0.4)',letterSpacing:1}}>{featured.kaynak_metinler?.[0]?.hekim?.toUpperCase()}{' · '}{featured.kaynak_metinler?.[0]?.eser?.toUpperCase()}</div>
                  <div style={{marginLeft:'auto',fontFamily:'Cinzel,serif',fontSize:9,color:'rgba(212,168,67,0.4)'}}>DEVAMI →</div>
                </div>
              </div>
            </div>
          )}
          {rest.map(m => (
            <div key={m.id} onClick={()=>{window.location.href=`/makale/${m.slug}`}} style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(212,168,67,0.1)',borderRadius:16,padding:26,cursor:'pointer'}}>
              <div style={{fontFamily:'Cinzel,serif',fontSize:7,letterSpacing:3,color:'#D4A843',padding:'4px 10px',border:'1px solid rgba(212,168,67,0.2)',borderRadius:20,display:'inline-block',marginBottom:12}}>{m.kategori||'MAKALE'}</div>
              {m.baslik_ar && (<div style={{fontFamily:'serif',fontSize:13,color:'rgba(212,168,67,0.4)',marginBottom:6,direction:'rtl' as const,textAlign:'right' as const}}>{m.baslik_ar}</div>)}
              <div style={{fontFamily:'Cinzel,serif',fontSize:14,fontWeight:600,color:'#F5EAD4',lineHeight:1.35,marginBottom:10}}>{m.baslik}</div>
              <div style={{fontFamily:'EB Garamond,serif',fontSize:14,color:'rgba(245,234,212,.45)',lineHeight:1.75,marginBottom:14,fontStyle:'italic'}}>{m.ozet}</div>
              <div style={{display:'flex',alignItems:'center',gap:8,paddingTop:12,borderTop:'1px solid rgba(212,168,67,0.08)'}}>
                <div style={{width:5,height:5,borderRadius:'50%',background:'#D4A843',opacity:0.5}}/>
                <div style={{fontFamily:'Cinzel,serif',fontSize:8,color:'rgba(212,168,67,0.4)',letterSpacing:1}}>{m.kaynak_metinler?.[0]?.hekim?.toUpperCase()}</div>
                <div style={{marginLeft:'auto',fontFamily:'Cinzel,serif',fontSize:9,color:'rgba(212,168,67,0.4)'}}>→</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{textAlign:'center'}}>
          <button onClick={()=>{window.location.href='/makaleler'}} style={{fontFamily:'Cinzel,serif',fontSize:9,letterSpacing:3,color:'#D4A843',background:'transparent',border:'1px solid rgba(212,168,67,0.25)',padding:'12px 36px',borderRadius:8,cursor:'pointer'}}>TÜM MAKALELER →</button>
        </div>
      </div>
    </section>

    <section style={{background:'#122518',padding:'88px clamp(20px,5vw,80px)',position:'relative',overflow:'hidden',borderTop:'1px solid rgba(212,168,67,0.08)'}}>
      <GEO/>
      <div style={{position:'relative',zIndex:2}}>
        <div style={{textAlign:'center',marginBottom:48}}>
          <div style={{fontFamily:'Cinzel,serif',fontSize:9,letterSpacing:5,color:'rgba(212,168,67,.5)',marginBottom:12}}>BÜYÜK HEKİMLER</div>
          <h2 style={{fontFamily:'Cinzel,serif',fontSize:'clamp(26px,3.5vw,40px)',fontWeight:700,color:'#F5EAD4',letterSpacing:2,marginBottom:8}}>Sistemin <span style={{color:'#D4A843'}}>Mimarları</span></h2>
          <div style={{fontFamily:'serif',fontSize:16,color:'rgba(212,168,67,.35)',marginBottom:12,direction:'rtl' as const}}>أعلام الطب الإسلامي</div>
          <p style={{fontFamily:'EB Garamond,serif',fontSize:17,fontStyle:'italic',color:'rgba(245,234,212,.4)',maxWidth:520,margin:'0 auto',lineHeight:1.7}}>Veritabanımızdaki 38 eserin sahipleri. Her biyografi kendi eseri üzerinden yazılmıştır.</p>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))',gap:14,maxWidth:1100,margin:'0 auto'}}>
          {hekimler.map((h,i) => (
            <div key={h.id} onClick={()=>{window.location.href=`/hekim/${h.slug}`}} style={{background:'rgba(255,255,255,0.02)',border:'1px solid rgba(212,168,67,0.08)',borderRadius:14,padding:'22px 16px',textAlign:'center' as const,cursor:'pointer'}}>
              <div style={{width:60,height:60,margin:'0 auto 12px',position:'relative'}}>
                <div style={{position:'absolute',inset:0,borderRadius:'50%',border:'1px solid rgba(212,168,67,0.2)',animation:'gentlePulse 3s ease-in-out infinite',animationDelay:`${i*0.4}s`}}/>
                <div style={{width:'100%',height:'100%',borderRadius:'50%',background:'#1A2E1E',border:'1px solid rgba(212,168,67,0.15)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'serif',fontSize:10,color:'rgba(212,168,67,0.5)',lineHeight:1.3}}>{h.isim_ar?.split(' ').slice(-1)[0]||'—'}</div>
              </div>
              {h.isim_ar && (<div style={{fontFamily:'serif',fontSize:12,color:'rgba(212,168,67,0.4)',marginBottom:4,direction:'rtl' as const}}>{h.isim_ar}</div>)}
              <div style={{fontFamily:'Cinzel,serif',fontSize:10,fontWeight:600,color:'#F5EAD4',marginBottom:4,lineHeight:1.3}}>{h.isim}</div>
              <div style={{fontFamily:'EB Garamond,serif',fontSize:12,color:'rgba(245,234,212,.3)',fontStyle:'italic',marginBottom:6}}>{h.dogum_olum}</div>
              <div style={{fontFamily:'Cinzel,serif',fontSize:7,color:'rgba(212,168,67,0.3)',letterSpacing:1}}>{h.eserler?.[0]?.toUpperCase().substring(0,25)}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
    </>
  )
}
