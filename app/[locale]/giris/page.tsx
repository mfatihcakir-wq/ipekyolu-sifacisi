"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function GirisPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [sifre, setSifre] = useState('')
  const [yukleniyor, setYukleniyor] = useState(false)
  const [hata, setHata] = useState('')

  async function handleGiris() {
    if (!email || !sifre) { setHata('E-posta ve sifre zorunludur.'); return }
    setYukleniyor(true); setHata('')
    const { error } = await supabase.auth.signInWithPassword({ email, password: sifre })
    setYukleniyor(false)
    if (error) { setHata('E-posta veya sifre hatali.'); return }
    router.push('/hasta')
  }

  return (
    <div style={{minHeight:'100vh',background:'#FDFAF5',display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <div style={{width:'100%',maxWidth:440}}>
        <div style={{textAlign:'center',marginBottom:32}}>
          <div style={{fontFamily:'Cinzel,serif',fontSize:22,fontWeight:600,color:'#1C3A26',letterSpacing:3,marginBottom:4}}>
            {"IPEK YOLU SIFACISI"}
          </div>
          <div style={{fontFamily:'serif',fontSize:13,color:'#9B8060',direction:'rtl' as const}}>
            {"\u0637\u0631\u064A\u0642 \u0627\u0644\u062D\u0631\u064A\u0631 \u0627\u0644\u0634\u0627\u0641\u064A"}
          </div>
        </div>
        <div style={{background:'white',border:'1px solid #EDD9A3',borderRadius:20,padding:'36px 32px'}}>
          <h1 style={{fontFamily:'Cinzel,serif',fontSize:20,fontWeight:600,color:'#1C3A26',marginBottom:6,letterSpacing:0.5}}>
            {"Tekrar Hosgeldiniz"}
          </h1>
          <p style={{fontSize:15,color:'#9B8060',fontStyle:'italic',marginBottom:28,lineHeight:1.6}}>
            {"Hesabiniza giris yapin"}
          </p>
          {hata && (
            <div style={{background:'#FFF0F0',border:'1px solid #FFCDD2',borderRadius:8,padding:'10px 14px',marginBottom:16,fontSize:14,color:'#C62828'}}>
              {hata}
            </div>
          )}
          <div style={{marginBottom:16}}>
            <label style={{fontFamily:'Cinzel,serif',fontSize:10,color:'#1C3A26',letterSpacing:2,display:'block',marginBottom:7}}>{"E-POSTA"}</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="ornek@email.com"
              style={{width:'100%',height:48,border:'1px solid #EDD9A3',borderRadius:10,padding:'0 16px',fontSize:16,fontFamily:'EB Garamond,serif',color:'#1A1208',background:'#FDFAF5',outline:'none',boxSizing:'border-box' as const}} />
          </div>
          <div style={{marginBottom:8}}>
            <label style={{fontFamily:'Cinzel,serif',fontSize:10,color:'#1C3A26',letterSpacing:2,display:'block',marginBottom:7}}>{"SIFRE"}</label>
            <input type="password" value={sifre} onChange={e=>setSifre(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleGiris()} placeholder="--------"
              style={{width:'100%',height:48,border:'1px solid #EDD9A3',borderRadius:10,padding:'0 16px',fontSize:16,fontFamily:'EB Garamond,serif',color:'#1A1208',background:'#FDFAF5',outline:'none',boxSizing:'border-box' as const}} />
          </div>
          <div style={{textAlign:'right',marginBottom:24}}>
            <a href="/sifremi-unuttum" style={{fontFamily:'Cinzel,serif',fontSize:9,color:'#C47D0E',letterSpacing:1,textDecoration:'none'}}>{"Sifremi unuttum"}</a>
          </div>
          <button onClick={handleGiris} disabled={yukleniyor}
            style={{width:'100%',height:50,background:'#1C3A26',border:'none',borderRadius:12,fontFamily:'Cinzel,serif',fontSize:12,fontWeight:700,color:'#F5E9C8',letterSpacing:2,cursor:'pointer',opacity:yukleniyor?0.7:1}}>
            {yukleniyor ? 'Giris yapiliyor...' : 'GIRIS YAP'}
          </button>
          <div style={{textAlign:'center',marginTop:20,fontSize:15,color:'#9B8060'}}>
            {"Hesabiniz yok mu? "}
            <a href="/kayit" style={{fontFamily:'Cinzel,serif',fontSize:11,color:'#1C3A26',letterSpacing:1,textDecoration:'none'}}>{"KAYIT OL"}</a>
          </div>
        </div>
        <div style={{textAlign:'center',marginTop:20,fontSize:13,color:'#9B8060',fontStyle:'italic'}}>
          {"Formu uye olmadan doldurabilirsiniz. "}
          <a href="/analiz" style={{color:'#C47D0E',textDecoration:'none'}}>{"Analizi baslat"}</a>
        </div>
      </div>
    </div>
  )
}
