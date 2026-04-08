"use client"
import { useState } from 'react'
import { createClient } from '@/lib/supabase'

export default function SifremiUnuttumPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [gonderildi, setGonderildi] = useState(false)
  const [yukleniyor, setYukleniyor] = useState(false)

  async function handleGonder() {
    if (!email) return
    setYukleniyor(true)
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://www.ipekyolusifacisi.com/sifre-sifirla'
    })
    setYukleniyor(false)
    setGonderildi(true)
  }

  return (
    <div style={{minHeight:'100vh',background:'#FAF6EF',display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <div style={{background:'white',border:'1px solid #DEB887',borderRadius:20,padding:'40px 32px',maxWidth:440,width:'100%',textAlign:'center'}}>
        <div style={{fontFamily:'Cormorant Garamond,serif',fontSize:20,fontWeight:600,color:'#1C3A26',marginBottom:6}}>
          {"Sifremi Unuttum"}
        </div>
        {!gonderildi ? (
          <>
            <p style={{fontSize:15,color:'#9B8060',fontStyle:'italic',lineHeight:1.7,marginBottom:24}}>
              {"E-posta adresinizi girin, sifirlama baglantisi gondeRelim."}
            </p>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="ornek@email.com"
              style={{width:'100%',height:48,border:'1px solid #DEB887',borderRadius:10,padding:'0 16px',fontSize:16,marginBottom:16,background:'#FAF6EF',outline:'none',boxSizing:'border-box' as const}} />
            <button onClick={handleGonder} disabled={yukleniyor}
              style={{width:'100%',height:48,background:'#1C3A26',border:'none',borderRadius:10,fontFamily:'Cormorant Garamond,serif',fontSize:11,fontWeight:700,color:'#F5EFE0',letterSpacing:2,cursor:'pointer'}}>
              {yukleniyor ? 'Gonderiliyor...' : 'BAGLANTI GONDER'}
            </button>
          </>
        ) : (
          <p style={{fontSize:16,color:'#2D6A4F',lineHeight:1.8,marginTop:16}}>
            {"Baglanti gonderildi. E-posta kutunuzu kontrol edin."}
          </p>
        )}
        <div style={{marginTop:20}}>
          <a href="/giris" style={{fontFamily:'Cormorant Garamond,serif',fontSize:10,color:'#9B8060',letterSpacing:1,textDecoration:'none'}}>
            {"\u2190 Giris sayfasina don"}
          </a>
        </div>
      </div>
    </div>
  )
}
