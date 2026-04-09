import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? ''
const DANISMAN_EMAIL = Deno.env.get('DANISMAN_EMAIL') ?? 'm.fatih.cakir@gmail.com'

serve(async (req) => {
  try {
    const payload = await req.json()
    const record = payload.record

    if (!record) return new Response('no record', { status: 400 })

    const fv = record.tum_form_verisi || {}

    const html = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#1C3A26;padding:20px;text-align:center">
          <h1 style="color:#8B6914;margin:0;font-size:20px">İpek Yolu Şifacısı</h1>
          <p style="color:rgba(255,255,255,.6);margin:4px 0 0;font-size:12px">Yeni Danışmanlık Formu</p>
        </div>
        <div style="padding:24px;background:#FDFAF5">
          <h2 style="color:#1C3A26;margin:0 0 16px">${record.tam_ad}</h2>
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:8px 0;color:#666;width:140px">Telefon</td><td style="padding:8px 0;font-weight:600">${record.telefon}</td></tr>
            <tr><td style="padding:8px 0;color:#666">Tarih</td><td style="padding:8px 0">${new Date(record.created_at).toLocaleString('tr-TR')}</td></tr>
            <tr><td style="padding:8px 0;color:#666">Yaş</td><td style="padding:8px 0">${fv.age_group || '-'}</td></tr>
            <tr><td style="padding:8px 0;color:#666">Cinsiyet</td><td style="padding:8px 0">${fv.gender || '-'}</td></tr>
            <tr><td style="padding:8px 0;color:#666">Mevsim</td><td style="padding:8px 0">${fv.season || '-'}</td></tr>
          </table>
          <div style="background:white;border-radius:8px;padding:16px;margin:16px 0">
            <div style="font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">Şikayetler</div>
            <div style="color:#1C3A26">${fv.symptoms || 'Belirtilmemiş'}</div>
          </div>
          <a href="https://www.ipekyolusifacisi.com/dashboard?form_id=${record.id}" style="display:block;background:#1C3A26;color:#B8860B;text-align:center;padding:14px;border-radius:8px;text-decoration:none;font-weight:600">Panelde İncele → Form #${record.id}</a>
        </div>
      </div>
    `

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'İpek Yolu Şifacısı <onboarding@resend.dev>',
        to: DANISMAN_EMAIL,
        subject: `Yeni Form: ${record.tam_ad}`,
        html,
      }),
    })

    const data = await res.json()
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
      status: res.ok ? 200 : 400,
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
  }
})
