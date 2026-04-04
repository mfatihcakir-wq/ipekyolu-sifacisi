import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const body = await req.formData()
  const token = body.get('token')
  const status = body.get('status')

  console.log('iyzico callback — token:', token, 'status:', status)

  if (status === 'success') {
    return NextResponse.redirect(new URL('/odeme/basarili', req.url))
  }
  return NextResponse.redirect(new URL('/odeme/basarisiz', req.url))
}
