"use client"
import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function GirisPage() {
  const searchParams = useSearchParams()
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
    const callbackUrl = searchParams.get('callbackUrl') || '/hasta'
    window.location.href = callbackUrl
  }

  return (
    <div style={{minHeight:'100vh',background:'#FAF6EF',display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <div style={{width:'100%',maxWidth:440}}>
        <div style={{textAlign:'center',marginBottom:32}}>
          <div style={{fontFamily:'Cormorant Garamond,serif',fontSize:22,fontWeight:600,color:'#1C3A26',letterSpacing:3,marginBottom:4}}>
            {"IPEK YOLU SIFACISI"}
          </div>
          <div style={{fontFamily:'serif',fontSize:13,color:'#9B8060',direction:'rtl' as const}}>
            {"\u0637\u0631\u064A\u0642 \u0627\u0644\u062D\u0631\u064A\u0631 \u0627\u0644\u0634\u0627\u0641\u064A"}
          </div>
        </div>
        <div style={{background:'white',border:'1px solid #DEB887',borderRadius:20,padding:'36px 32px'}}>
          <h1 style={{fontFamily:'Cormorant Garamond,serif',fontSize:20,fontWeight:600,color:'#1C3A26',marginBottom:6,letterSpacing:0.5}}>
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
            <label style={{fontFamily:'Cormorant Garamond,serif',fontSize:10,color:'#1C3A26',letterSpacing:2,display:'block',marginBottom:7}}>{"E-POSTA"}</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="ornek@email.com"
              style={{width:'100%',height:48,border:'1px solid #DEB887',borderRadius:10,padding:'0 16px',fontSize:16,fontFamily:'EB Garamond,serif',color:'#1A1208',background:'#FAF6EF',outline:'none',boxSizing:'border-box' as const}} />
          </div>
          <div style={{marginBottom:8}}>
            <label style={{fontFamily:'Cormorant Garamond,serif',fontSize:10,color:'#1C3A26',letterSpacing:2,display:'block',marginBottom:7}}>{"SIFRE"}</label>
            <input type="password" value={sifre} onChange={e=>setSifre(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleGiris()} placeholder="--------"
              style={{width:'100%',height:48,border:'1px solid #DEB887',borderRadius:10,padding:'0 16px',fontSize:16,fontFamily:'EB Garamond,serif',color:'#1A1208',background:'#FAF6EF',outline:'none',boxSizing:'border-box' as const}} />
          </div>
          <div style={{textAlign:'right',marginBottom:24}}>
            <a href="/sifremi-unuttum" style={{fontFamily:'Cormorant Garamond,serif',fontSize:9,color:'#B8860B',letterSpacing:1,textDecoration:'none'}}>{"Sifremi unuttum"}</a>
          </div>
          <button onClick={handleGiris} disabled={yukleniyor}
            style={{width:'100%',height:50,background:'#1C3A26',border:'none',borderRadius:12,fontFamily:'Cormorant Garamond,serif',fontSize:12,fontWeight:700,color:'#F5EFE0',letterSpacing:2,cursor:'pointer',opacity:yukleniyor?0.7:1}}>
            {yukleniyor ? 'Giris yapiliyor...' : 'GIRIS YAP'}
          </button>

          <div style={{display:'flex',alignItems:'center',gap:10,margin:'18px 0 10px'}}>
            <div style={{flex:1,height:1,background:'#E0D9CE'}} />
            <span style={{fontSize:10,color:'#9B8060',letterSpacing:2}}>VEYA</span>
            <div style={{flex:1,height:1,background:'#E0D9CE'}} />
          </div>

          <button
            onClick={async () => {
              const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: { redirectTo: `${window.location.origin}/auth/callback` }
              })
              if (error) console.error(error)
            }}
            style={{width:'100%',padding:'12px',background:'white',border:'1.5px solid #E0D9CE',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',gap:10,cursor:'pointer',fontSize:14,fontWeight:600,color:'#333'}}>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google ile Giriş Yap
          </button>

          <div style={{textAlign:'center',marginTop:20,fontSize:15,color:'#9B8060'}}>
            {"Hesabiniz yok mu? "}
            <a href="/kayit" style={{fontFamily:'Cormorant Garamond,serif',fontSize:11,color:'#1C3A26',letterSpacing:1,textDecoration:'none'}}>{"KAYIT OL"}</a>
          </div>
        </div>
        <div style={{textAlign:'center',marginTop:20,fontSize:13,color:'#9B8060',fontStyle:'italic'}}>
          {"Formu uye olmadan doldurabilirsiniz. "}
          <a href="/analiz" style={{color:'#B8860B',textDecoration:'none'}}>{"Analizi baslat"}</a>
        </div>
      </div>
    </div>
  )
}
