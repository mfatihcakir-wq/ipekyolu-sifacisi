import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function POST(request: NextRequest) {
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: 'Email servisi yapilandirilmamis' }, { status: 503 })
  }

  const resend = new Resend(process.env.RESEND_API_KEY)
  const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev'
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'm.fatih.cakir@gmail.com'

  try {
    const {
      form_id,
      ad_soyad,
      email,
      telefon,
      cilt_tipi,
      sorunlar,
    } = await request.json() as {
      form_id?: string
      ad_soyad?: string
      email?: string
      telefon?: string
      cilt_tipi?: string
      sorunlar?: string[]
    }

    if (!form_id || !ad_soyad) {
      return NextResponse.json({ error: 'form_id ve ad_soyad zorunludur' }, { status: 400 })
    }

    const dashboardUrl = 'https://www.ipekyolusifacisi.com/dashboard'
    const sorunListesi = Array.isArray(sorunlar) && sorunlar.length
      ? sorunlar.map(s => `<li>${escapeHtml(s)}</li>`).join('')
      : '<li><em>Belirtilmemis</em></li>'

    const html = `
      <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;padding:24px;color:#1C1C1C;background:#FAF6EF;border:1px solid #DEB887;border-radius:12px">
        <h2 style="color:#1C3A26;margin:0 0 12px;font-size:18px;letter-spacing:1px">YENİ CİLT ANALİZİ FORMU</h2>
        <p style="color:#6B5744;margin:0 0 20px;font-style:italic">Yeni bir cilt formu gonderildi. Dashboard'dan inceleyip doneni yapabilirsiniz.</p>

        <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
          <tr><td style="padding:6px 0;color:#6B5744;font-size:12px;letter-spacing:1px">AD SOYAD</td><td style="padding:6px 0;color:#1C1C1C"><strong>${escapeHtml(ad_soyad)}</strong></td></tr>
          <tr><td style="padding:6px 0;color:#6B5744;font-size:12px;letter-spacing:1px">E-POSTA</td><td style="padding:6px 0;color:#1C1C1C">${escapeHtml(email || '—')}</td></tr>
          <tr><td style="padding:6px 0;color:#6B5744;font-size:12px;letter-spacing:1px">TELEFON</td><td style="padding:6px 0;color:#1C1C1C">${escapeHtml(telefon || '—')}</td></tr>
          <tr><td style="padding:6px 0;color:#6B5744;font-size:12px;letter-spacing:1px">CİLT TİPİ</td><td style="padding:6px 0;color:#1C1C1C">${escapeHtml(cilt_tipi || '—')}</td></tr>
          <tr><td style="padding:6px 0;color:#6B5744;font-size:12px;letter-spacing:1px">FORM ID</td><td style="padding:6px 0;color:#1C1C1C;font-family:monospace;font-size:12px">${escapeHtml(form_id)}</td></tr>
        </table>

        <div style="margin-bottom:20px">
          <div style="color:#6B5744;font-size:12px;letter-spacing:1px;margin-bottom:6px">ŞİKÂYETLER</div>
          <ul style="margin:0;padding-left:20px;color:#1C1C1C">${sorunListesi}</ul>
        </div>

        <a href="${dashboardUrl}" style="display:inline-block;background:#1C3A26;color:#B8860B;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;letter-spacing:1px">Dashboard'a Git →</a>
      </div>
    `

    const { data, error } = await resend.emails.send({
      from: `İpek Yolu Şifacısı <${FROM_EMAIL}>`,
      to: [ADMIN_EMAIL],
      subject: `Yeni Cilt Analizi Formu — ${ad_soyad}`,
      html,
    })

    if (error) {
      console.error('Resend hatasi (cilt bildirim):', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, id: data?.id })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Bildirim gonderim hatasi'
    console.error('Cilt bildirim API error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

function escapeHtml(raw: string): string {
  return String(raw)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
