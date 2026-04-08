"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function KayitPage() {
  const router = useRouter()
  const supabase = createClient()
  const [ad, setAd] = useState('')
  const [email, setEmail] = useState('')
  const [telefon, setTelefon] = useState('')
  const [sifre, setSifre] = useState('')
  const [kvkk, setKvkk] = useState(false)
  const [yukleniyor, setYukleniyor] = useState(false)
  const [hata, setHata] = useState('')
  const [basarili, setBasarili] = useState(false)

  async function handleKayit() {
    if (!ad || !email || !sifre) { setHata('Ad, e-posta ve sifre zorunludur.'); return }
    if (sifre.length < 6) { setHata('Sifre en az 6 karakter olmalidir.'); return }
    if (!kvkk) { setHata('KVKK onayi gereklidir.'); return }
    setYukleniyor(true); setHata('')

    const { data, error } = await supabase.auth.signUp({
      email,
      password: sifre,
      options: { data: { ad_soyad: ad, telefon: telefon } }
    })

    if (error) {
      setYukleniyor(false)
      if (error.message.includes('already registered')) {
        setHata('Bu e-posta zaten kayitli. Giris yapin.')
      } else {
        setHata('Kayit basarisiz: ' + error.message)
      }
      return
    }

    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        ad: ad.split(' ')[0],
        soyad: ad.split(' ').slice(1).join(' '),
        telefon: telefon
      })
    }

    setYukleniyor(false)
    setBasarili(true)
  }

  if (basarili) {
    return (
      <div style={{minHeight:'100vh',background:'#FAF6EF',display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
        <div style={{background:'white',border:'1px solid #DEB887',borderRadius:20,padding:'40px 32px',maxWidth:440,width:'100%',textAlign:'center'}}>
          <div style={{width:64,height:64,background:'#E8F5E9',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 20px'}}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2D6A4F" strokeWidth="2">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
          </div>
          <h2 style={{fontFamily:'Cormorant Garamond,serif',fontSize:20,fontWeight:600,color:'#1C3A26',marginBottom:12}}>
            {"Kayit Tamamlandi"}
          </h2>
          <p style={{fontSize:16,color:'#5C4A2A',fontStyle:'italic',lineHeight:1.8,marginBottom:28}}>
            {"E-posta adresinize dogrulama baglantisi gonderdik. Onayladiktan sonra giris yapabilirsiniz."}
          </p>
          <button onClick={() => router.push('/giris')}
            style={{width:'100%',height:50,background:'#1C3A26',border:'none',borderRadius:12,fontFamily:'Cormorant Garamond,serif',fontSize:12,fontWeight:700,color:'#F5EFE0',letterSpacing:2,cursor:'pointer'}}>
            {"GIRIS YAP"}
          </button>
          <div style={{marginTop:14}}>
            <a href="/odeme" style={{fontFamily:'Cormorant Garamond,serif',fontSize:10,color:'#B8860B',letterSpacing:1,textDecoration:'none'}}>
              {"Plan secmek icin devam et \u2192"}
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{minHeight:'100vh',background:'#FAF6EF',display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <div style={{width:'100%',maxWidth:480}}>
        <div style={{textAlign:'center',marginBottom:28}}>
          <div style={{fontFamily:'Cormorant Garamond,serif',fontSize:22,fontWeight:600,color:'#1C3A26',letterSpacing:3,marginBottom:4}}>
            {"IPEK YOLU SIFACISI"}
          </div>
          <div style={{fontFamily:'serif',fontSize:13,color:'#9B8060',direction:'rtl' as const}}>
            {"\u0637\u0631\u064A\u0642 \u0627\u0644\u062D\u0631\u064A\u0631 \u0627\u0644\u0634\u0627\u0641\u064A"}
          </div>
        </div>

        <div style={{background:'#E8F5E9',border:'1px solid #C8E6C9',borderRadius:10,padding:'10px 16px',marginBottom:20,display:'flex',gap:10,alignItems:'flex-start'}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2D6A4F" strokeWidth="1.5" style={{flexShrink:0,marginTop:2}}>
            <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
          </svg>
          <div style={{fontSize:13,color:'#1C3A26',lineHeight:1.6,fontStyle:'italic'}}>
            {"Form verileriniz kayit sonrasinda otomatik aktarilacak; tekrar doldurmaniza gerek yok."}
          </div>
        </div>

        <div style={{background:'white',border:'1px solid #DEB887',borderRadius:20,padding:'36px 32px'}}>
          <h1 style={{fontFamily:'Cormorant Garamond,serif',fontSize:20,fontWeight:600,color:'#1C3A26',marginBottom:6,letterSpacing:0.5}}>
            {"Hesap Olusturun"}
          </h1>
          <p style={{fontSize:15,color:'#9B8060',fontStyle:'italic',marginBottom:28,lineHeight:1.6}}>
            {"Analizinize devam etmek icin kayit olun"}
          </p>

          {hata && (
            <div style={{background:'#FFF0F0',border:'1px solid #FFCDD2',borderRadius:8,padding:'10px 14px',marginBottom:16,fontSize:14,color:'#C62828'}}>
              {hata}
            </div>
          )}

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:14}}>
            <div style={{gridColumn:'1/-1'}}>
              <label style={{fontFamily:'Cormorant Garamond,serif',fontSize:10,color:'#1C3A26',letterSpacing:2,display:'block',marginBottom:7}}>{"AD SOYAD *"}</label>
              <input type="text" value={ad} onChange={e=>setAd(e.target.value)} placeholder="Adiniz Soyadiniz"
                style={{width:'100%',height:48,border:'1px solid #DEB887',borderRadius:10,padding:'0 16px',fontSize:16,fontFamily:'EB Garamond,serif',color:'#1A1208',background:'#FAF6EF',outline:'none',boxSizing:'border-box' as const}} />
            </div>
            <div>
              <label style={{fontFamily:'Cormorant Garamond,serif',fontSize:10,color:'#1C3A26',letterSpacing:2,display:'block',marginBottom:7}}>{"E-POSTA *"}</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="ornek@email.com"
                style={{width:'100%',height:48,border:'1px solid #DEB887',borderRadius:10,padding:'0 16px',fontSize:16,fontFamily:'EB Garamond,serif',color:'#1A1208',background:'#FAF6EF',outline:'none',boxSizing:'border-box' as const}} />
            </div>
            <div>
              <label style={{fontFamily:'Cormorant Garamond,serif',fontSize:10,color:'#1C3A26',letterSpacing:2,display:'block',marginBottom:7}}>{"TELEFON"}</label>
              <input type="tel" value={telefon} onChange={e=>setTelefon(e.target.value)} placeholder="+90 5XX XXX XX XX"
                style={{width:'100%',height:48,border:'1px solid #DEB887',borderRadius:10,padding:'0 16px',fontSize:16,fontFamily:'EB Garamond,serif',color:'#1A1208',background:'#FAF6EF',outline:'none',boxSizing:'border-box' as const}} />
              <div style={{fontSize:11,color:'#9B8060',fontStyle:'italic',marginTop:4}}>
                {"WhatsApp uzerinden ulasilacak"}
              </div>
            </div>
            <div style={{gridColumn:'1/-1'}}>
              <label style={{fontFamily:'Cormorant Garamond,serif',fontSize:10,color:'#1C3A26',letterSpacing:2,display:'block',marginBottom:7}}>{"SIFRE *"}</label>
              <input type="password" value={sifre} onChange={e=>setSifre(e.target.value)} placeholder="En az 6 karakter"
                style={{width:'100%',height:48,border:'1px solid #DEB887',borderRadius:10,padding:'0 16px',fontSize:16,fontFamily:'EB Garamond,serif',color:'#1A1208',background:'#FAF6EF',outline:'none',boxSizing:'border-box' as const}} />
            </div>
          </div>

          <div style={{display:'flex',alignItems:'flex-start',gap:10,marginBottom:24}}>
            <input type="checkbox" id="kvkk" checked={kvkk} onChange={e=>setKvkk(e.target.checked)}
              style={{marginTop:3,flexShrink:0,width:16,height:16,cursor:'pointer',accentColor:'#1C3A26'}} />
            <label htmlFor="kvkk" style={{fontSize:13,color:'#5C4A2A',lineHeight:1.65,cursor:'pointer'}}>
              {"Saglik verilerimin klasik Islam tibbi danismanligi amaciyla islenmesine, danismanima iletilmesine "}
              <a href="/kvkk" style={{color:'#B8860B',textDecoration:'none'}}>{"KVKK"}</a>
              {" kapsaminda onay veriyorum."}
            </label>
          </div>

          <button onClick={handleKayit} disabled={yukleniyor}
            style={{width:'100%',height:50,background:'#B8860B',border:'none',borderRadius:12,fontFamily:'Cormorant Garamond,serif',fontSize:12,fontWeight:700,color:'#1C3A26',letterSpacing:2,cursor:'pointer',opacity:yukleniyor?0.7:1}}>
            {yukleniyor ? 'Kayit yapiliyor...' : 'KAYIT OL VE DEVAM ET'}
          </button>

          <div style={{textAlign:'center',marginTop:20,fontSize:15,color:'#9B8060'}}>
            {"Zaten hesabiniz var mi? "}
            <a href="/giris" style={{fontFamily:'Cormorant Garamond,serif',fontSize:11,color:'#1C3A26',letterSpacing:1,textDecoration:'none'}}>{"GIRIS YAP"}</a>
          </div>
        </div>
      </div>
    </div>
  )
}
