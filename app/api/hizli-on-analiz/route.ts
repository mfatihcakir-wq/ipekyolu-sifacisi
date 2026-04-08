import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const SYSTEM_PROMPT = `Sen klasik İslam tıbbı uzmanısın. Kullanıcının şikayetini SADECE aşağıdaki klasik kaynak pasajlarına dayanarak 2-3 cümleyle değerlendir. Kaynaklarda olmayan hiçbir bilgi ekleme.
Hangi mizaç tipine işaret edebileceğini pasajlardan çıkar.
Kesin teşhis verme, merak uyandır.
Sade, sıcak, Türkçe yaz.
Sonunda: 'Nabız, dil ve yaşam alışkanlıklarınızı da değerlendirerek size özel bir analiz hazırlayabiliriz.'`

interface Pasaj {
  icerik_tr: string
  kaynak_kodu: string
  kitap_adi: string
}

export async function POST(req: NextRequest) {
  try {
    const { sikayet } = await req.json()
    if (!sikayet || typeof sikayet !== 'string' || sikayet.trim().length < 3) {
      return NextResponse.json({ onBilgi: null })
    }

    const query = sikayet.trim().split(/\s+/).filter(w => w.length > 2).join(' | ')
    if (!query) return NextResponse.json({ onBilgi: null })

    // Karakter ve klasik kaynaklardan paralel FTS
    const [karakterRes, klasikRes] = await Promise.all([
      supabase.from('karakter_kaynaklar').select('icerik_tr, kaynak_kodu, kitap_adi').textSearch('icerik_tr', query).limit(3),
      supabase.from('klasik_kaynaklar').select('icerik_tr, kaynak_kodu, kitap_adi').textSearch('icerik_tr', query).limit(3),
    ])

    const pasajlar: Pasaj[] = [
      ...(karakterRes.data || []),
      ...(klasikRes.data || []),
    ].filter(p => p.icerik_tr && p.icerik_tr.length > 20)

    if (pasajlar.length === 0) {
      return NextResponse.json({ onBilgi: null })
    }

    // Pasajları birleştir
    const pasajMetni = pasajlar
      .slice(0, 6)
      .map((p, i) => `[${i + 1}] ${p.kitap_adi || p.kaynak_kodu}: ${p.icerik_tr.slice(0, 400)}`)
      .join('\n\n')

    const userMessage = `Şikayet: ${sikayet.trim()}\n\nKlasik kaynak pasajları:\n${pasajMetni}`

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 350,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    })

    const onBilgi = response.content
      .filter(c => c.type === 'text')
      .map(c => (c as { type: 'text'; text: string }).text)
      .join('')
      .trim()

    if (!onBilgi) return NextResponse.json({ onBilgi: null })

    return NextResponse.json({ onBilgi })
  } catch (err) {
    console.error('[hizli-on-analiz]', err)
    return NextResponse.json({ onBilgi: null })
  }
}
