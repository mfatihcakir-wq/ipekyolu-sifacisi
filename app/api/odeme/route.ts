import { NextRequest, NextResponse } from 'next/server'

const IYZICO_API_KEY = process.env.IYZICO_API_KEY || 'sandbox-api-key'
const IYZICO_SECRET = process.env.IYZICO_SECRET_KEY || 'sandbox-secret'
const IYZICO_BASE_URL = process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com'

const PLAN_FIYATLARI: Record<string, number> = {
  monthly: 69000,
  yearly: 46800,
  one_time: 99000,
}

export async function POST(req: NextRequest) {
  try {
    const { plan, ad, soyad, email } = await req.json()

    const fiyat = PLAN_FIYATLARI[plan] || 99000
    const fiyatStr = (fiyat / 100).toFixed(2)

    const conversationId = `IYS-${Date.now()}`

    const requestBody = {
      locale: 'tr',
      conversationId,
      price: fiyatStr,
      paidPrice: fiyatStr,
      currency: 'TRY',
      basketId: conversationId,
      paymentGroup: 'SUBSCRIPTION',
      callbackUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://ipekyolu-sifacisi.vercel.app'}/api/odeme/callback`,
      buyer: {
        id: `buyer-${Date.now()}`,
        name: ad,
        surname: soyad,
        email,
        identityNumber: '11111111111',
        registrationAddress: 'Turkiye',
        city: 'Istanbul',
        country: 'Turkey',
      },
      shippingAddress: {
        contactName: `${ad} ${soyad}`,
        city: 'Istanbul',
        country: 'Turkey',
        address: 'Turkiye',
      },
      billingAddress: {
        contactName: `${ad} ${soyad}`,
        city: 'Istanbul',
        country: 'Turkey',
        address: 'Turkiye',
      },
      basketItems: [
        {
          id: plan,
          name: `İpek Yolu Şifacısı - ${plan}`,
          category1: 'Saglik',
          itemType: 'VIRTUAL',
          price: fiyatStr,
        },
      ],
    }

    const crypto = await import('crypto')
    const randomKey = Math.random().toString(36).substring(2)
    const hashStr = IYZICO_API_KEY + randomKey + IYZICO_SECRET + JSON.stringify(requestBody)
    const hash = crypto.createHmac('sha256', IYZICO_SECRET).update(hashStr).digest('base64')

    const response = await fetch(`${IYZICO_BASE_URL}/payment/iyzipos/checkoutform/initialize/auth/ecom`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `IYZWS apiKey="${IYZICO_API_KEY}", randomKey="${randomKey}", signature="${hash}"`,
        'x-iyzi-rnd': randomKey,
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    const data = await response.json()

    if (data.status === 'success') {
      return NextResponse.json({ checkoutFormContent: data.checkoutFormContent })
    } else {
      return NextResponse.json({ error: data.errorMessage || 'Odeme baslatilamadi' }, { status: 400 })
    }
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
