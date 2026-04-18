import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { MIZAN_SYSTEM_PROMPT, MIZAN_SYSTEM_PROMPT_VERSION } from '@/lib/mizan/system-prompt'
import { klasikKaynakCek } from '@/lib/mizan/kaynak-cek'

const MODEL = 'claude-opus-4-7'
const MAX_TOKENS = 12000
const INPUT_COST_PER_TOKEN = 5 / 1_000_000
const OUTPUT_COST_PER_TOKEN = 25 / 1_000_000

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ talepId: string }> }
) {
  const { talepId } = await params
  const supabase = createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Giriş gerekli' }, { status: 401 })

  const rol = (user.app_metadata as { rol?: string } | undefined)?.rol
  if (rol !== 'hekim') return NextResponse.json({ error: 'Yetki yok' }, { status: 403 })

  const { data: talep, error: talepError } = await supabase
    .from('analiz_talepleri')
    .select('*')
    .eq('id', talepId)
    .single()

  if (talepError || !talep) {
    return NextResponse.json({ error: 'Talep bulunamadı' }, { status: 404 })
  }

  const { data: mevcutSonuc } = await supabase
    .from('analiz_sonuclari')
    .select('id')
    .eq('talep_id', talepId)
    .maybeSingle()

  if (mevcutSonuc) {
    return NextResponse.json(
      { error: 'Bu talep için zaten taslak mevcut. Taslağı düzenle.' },
      { status: 409 }
    )
  }

  await supabase
    .from('analiz_talepleri')
    .update({
      durum: 'isleniyor',
      islenmeye_baslandi_at: new Date().toISOString(),
      atanan_hekim_id: user.id,
    })
    .eq('id', talepId)

  try {
    const klasikContext = await klasikKaynakCek(talep)

    const userPrompt = `HASTA VERİSİ:

Ad: ${talep.ad_soyad || 'Belirtilmemiş'}
Yaş Grubu: ${talep.yas_grubu || 'Belirtilmemiş'}
Cinsiyet: ${talep.cinsiyet || 'Belirtilmemiş'}

Şikayetler: ${talep.sikayetler || 'Belirtilmemiş'}
Şikayet Süresi: ${talep.sikayet_suresi || 'Belirtilmemiş'}
Kronik Hastalıklar: ${talep.kronik_hastaliklar || 'Yok'}
Kullanılan İlaçlar: ${talep.kullanilan_ilaclar || 'Yok'}

Yaşam Tarzı: ${JSON.stringify(talep.yasam_tarzi || {}, null, 2)}
Nabız: ${JSON.stringify(talep.nabiz || {}, null, 2)}
Dil: ${JSON.stringify(talep.dil || {}, null, 2)}
Yüz: ${JSON.stringify(talep.yuz || {}, null, 2)}
İdrar: ${JSON.stringify(talep.idrar || {}, null, 2)}
Dışkı: ${JSON.stringify(talep.diski || {}, null, 2)}
Fizik Ölçüm: ${JSON.stringify(talep.fizik_olcum || {}, null, 2)}
Fıtrî Mizaç: ${JSON.stringify(talep.fitri_mizac || {}, null, 2)}

${klasikContext}

[ANALİZ TALİMATI]
Yukarıdaki TÜM verileri bütünleştirerek kişisel öneri rehberi hazırla. Hılt oranları toplamı 100 olmalı. Klasik kaynaklardan gelen metinleri reçeteye doğrudan yansıt. SADECE JSON döndür.`

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: [
        {
          type: 'text',
          text: MIZAN_SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [{ role: 'user', content: userPrompt }],
    })

    const rawText = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('')

    let parsedCikti: Record<string, unknown>
    try {
      const jsonText = rawText
        .replace(/^```json\s*/i, '')
        .replace(/```\s*$/, '')
        .trim()
      parsedCikti = JSON.parse(jsonText)
    } catch (parseError) {
      console.error('JSON parse hatası:', parseError)
      parsedCikti = { _ham_metin: rawText, _parse_hatasi: true }
    }

    const inputTokens = response.usage.input_tokens
    const outputTokens = response.usage.output_tokens
    const maliyet = inputTokens * INPUT_COST_PER_TOKEN + outputTokens * OUTPUT_COST_PER_TOKEN

    const { data: sonuc, error: sonucError } = await supabase
      .from('analiz_sonuclari')
      .insert({
        talep_id: talepId,
        ham_cikti: parsedCikti,
        input_token_sayisi: inputTokens,
        output_token_sayisi: outputTokens,
        tahmini_maliyet_usd: maliyet,
        sistem_prompt_versiyonu: MIZAN_SYSTEM_PROMPT_VERSION,
        model_versiyonu: MODEL,
      })
      .select()
      .single()

    if (sonucError) throw new Error('Sonuç kaydedilemedi: ' + sonucError.message)

    await supabase
      .from('analiz_talepleri')
      .update({
        durum: 'taslak_hazir',
        taslak_hazir_at: new Date().toISOString(),
      })
      .eq('id', talepId)

    return NextResponse.json({
      success: true,
      sonuc_id: sonuc.id,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      maliyet_usd: maliyet,
    })
  } catch (err) {
    await supabase
      .from('analiz_talepleri')
      .update({ durum: 'yeni', islenmeye_baslandi_at: null })
      .eq('id', talepId)

    const mesaj = err instanceof Error ? err.message : 'Beklenmeyen hata'
    console.error('Analiz başlatma hatası:', err)
    return NextResponse.json({ error: mesaj }, { status: 500 })
  }
}
