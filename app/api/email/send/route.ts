import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { ciltRaporuHtml } from '@/app/emails/cilt-raporu'
import { analizRaporuHtml } from '@/app/emails/analiz-raporu'

export async function POST(request: NextRequest) {
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: 'Email servisi yapilandirilmamis' }, { status: 503 })
  }
  const resend = new Resend(process.env.RESEND_API_KEY)
  const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev'
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'm.fatih.cakir@gmail.com'
  try {
    const { to, subject, type, sonuc_verisi, hasta_adi, kayit_no } = await request.json()

    if (!to || !type) {
      return NextResponse.json({ error: 'to ve type zorunludur' }, { status: 400 })
    }

    let html: string
    const raporData = { hasta_adi: hasta_adi || 'Hasta', kayit_no: kayit_no || '', sonuc: sonuc_verisi }

    if (type === 'cilt') {
      html = ciltRaporuHtml(raporData)
    } else {
      html = analizRaporuHtml(raporData)
    }

    const emailSubject = subject || `İpek Yolu Şifacısı — ${type === 'cilt' ? 'Cilt Analiz' : 'Mizac Analiz'} Raporu`

    const { data, error } = await resend.emails.send({
      from: `İpek Yolu Şifacısı <${FROM_EMAIL}>`,
      to: [to],
      subject: emailSubject,
      html,
    })

    if (error) {
      console.error('Resend hatasi:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Admin'e de bildirim
    try {
      await resend.emails.send({
        from: `İpek Yolu Şifacısı <${FROM_EMAIL}>`,
        to: [ADMIN_EMAIL],
        subject: `[Rapor Gonderildi] ${hasta_adi} — ${type}`,
        html: `<p><strong>${hasta_adi}</strong> icin ${type} raporu gonderildi.</p><p>Alici: ${to}</p><p>Kayit: ${kayit_no}</p>`,
      })
    } catch { /* admin bildirimi opsiyonel */ }

    return NextResponse.json({ success: true, id: data?.id })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Email gonderim hatasi'
    console.error('Email API error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
