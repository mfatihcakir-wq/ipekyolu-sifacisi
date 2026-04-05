import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  try {
    const body = await req.json()
    console.log('[Shopier Webhook]', body)

    const status = body.status || body.payment_status
    if (status !== 'success' && status !== 'completed') {
      return NextResponse.json({ ok: false })
    }

    const email = body.buyer_email || body.email
    const productId = body.product_id || body.item_number

    let plan = 'aylik'
    if (String(productId).includes('45901595') || String(body.product_name || '').toLowerCase().includes('yillik')) {
      plan = 'yillik'
    } else if (String(productId).includes('45901613') || String(body.product_name || '').toLowerCase().includes('tek')) {
      plan = 'tek_seferlik'
    }

    const now = new Date()
    const bitis = new Date()
    if (plan === 'yillik') bitis.setFullYear(now.getFullYear() + 1)
    else if (plan === 'aylik') bitis.setMonth(now.getMonth() + 1)
    else bitis.setFullYear(now.getFullYear() + 10)

    const { data: userData } = await supabase.auth.admin.listUsers()
    const user = userData?.users?.find(u => u.email === email)

    if (user) {
      await supabase.from('subscriptions').upsert({
        user_id: user.id,
        plan,
        status: 'active',
        shopier_order_id: body.order_id || body.id,
        baslangic: now.toISOString(),
        bitis: bitis.toISOString(),
        updated_at: now.toISOString(),
      }, { onConflict: 'user_id' })
    } else {
      await supabase.from('pending_subscriptions').upsert({
        email,
        plan,
        shopier_order_id: body.order_id || body.id,
        olusturulma: now.toISOString(),
      }, { onConflict: 'email' })
    }

    try {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'https://www.ipekyolusifacisi.com'}/api/email/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: 'm.fatih.cakir@gmail.com',
          type: 'analiz',
          subject: `Yeni Odeme: ${plan} - ${email}`,
          sonuc_verisi: { ozet: `Yeni odeme alindi. Plan: ${plan}, Email: ${email}, Order: ${body.order_id || body.id}` },
          hasta_adi: email,
          kayit_no: body.order_id || body.id || '',
        }),
      })
    } catch { /* admin bildirim opsiyonel */ }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[Shopier Webhook Error]', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
