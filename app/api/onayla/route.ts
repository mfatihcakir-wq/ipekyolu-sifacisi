import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { form_id, analiz_sonucu, hasta_email, hasta_adi } = await req.json()
    if (!form_id || !analiz_sonucu) {
      return NextResponse.json({ error: 'form_id ve analiz_sonucu zorunlu' }, { status: 400 })
    }

    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { error: updateErr } = await sb
      .from('detailed_forms')
      .update({
        analiz_sonucu,
        durum: 'onaylandi',
        onay_tarihi: new Date().toISOString(),
      })
      .eq('id', form_id)

    if (updateErr) {
      return NextResponse.json({ error: 'DB güncelleme başarısız', detail: updateErr.message }, { status: 500 })
    }

    // Hastaya mail gönder
    let mailGonderildi = false
    if (hasta_email && process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY)
        const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev'
        await resend.emails.send({
          from: `İpek Yolu Şifacısı <${FROM_EMAIL}>`,
          to: [hasta_email],
          subject: 'Analiziniz Hazır — İpek Yolu Şifacısı',
          html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
            <div style="background:#1C3A26;padding:24px;text-align:center">
              <h1 style="color:#B8860B;margin:0;font-size:20px;letter-spacing:2px">İPEK YOLU ŞİFACISI</h1>
            </div>
            <div style="padding:32px 24px;background:#FAF6EF;color:#1A1208">
              <h2 style="color:#1C3A26;margin:0 0 16px;font-family:Georgia,serif">${hasta_adi || 'Değerli kullanıcı'},</h2>
              <p style="font-size:16px;line-height:1.7;color:#5C4A2A;margin-bottom:24px">
                Analiziniz danışmanınız tarafından incelendi ve onaylandı. Hasta panelinizde
                klasik İslam tıbbı kaynaklarına dayalı detaylı protokolünüzü görüntüleyebilirsiniz.
              </p>
              <a href="https://www.ipekyolusifacisi.com/hasta" style="display:inline-block;background:#B8860B;color:#1C3A26;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:700;letter-spacing:1px">
                ANALİZİMİ GÖRÜNTÜLE →
              </a>
              <p style="font-size:13px;color:#9B8060;margin-top:32px;font-style:italic">
                İpek Yolu Şifacısı — Klasik İslam Tıbbı Danışmanlığı
              </p>
            </div>
          </div>`,
        })
        mailGonderildi = true
      } catch (e) {
        console.error('Mail gönderim hatası:', e)
      }
    }

    return NextResponse.json({ ok: true, mailGonderildi })
  } catch (err) {
    const detay = err instanceof Error ? err.message : JSON.stringify(err)
    return NextResponse.json({ error: detay }, { status: 500 })
  }
}
