import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        system: `Sen Ibn Sina el-Kanun fit-Tib, er-Razi el-Havi ve Ibn Nefis el-Samil geleneginde uzman bir klasik Islam tibbi danismanisin. Dil ve yuz fotograflarini son derece dikkatli ve ayrintili olarak incele.

DIL ANALIZI icin sunlara bak:
- Renk: kirmizi/koyu pembe (dem-safra baskisi), pembe normal, soluk/beyaz (balgam), sari/sarimsi (safra yangisi), mor/koyu (kara safra)
- Kaplama: ince seffaf (normal), kalin beyaz (balgam nem fazlasi), sari-yesil (safra yangisi), gri/koyu (kara safra), kaplama yok
- Nem: islak/nemli (balgam), normal, kuru (hararet), catlak/cok kuru (siddetli hararet veya kara safra)
- Buyukluk/sekil: siskin/kalin (balgam veya dem), normal, ince/kucuk (kuruluk), kenar dis izi (balgam baskisi)

YUZ ANALIZI icin sunlara bak:
- Ten rengi: kirmizi/pembe (demevi), bugday/normal, soluk/beyaz (balgami), sari/zeytin (safravi), esmer/koyu
- Yuz sekli: yuvarlak/dolgun (demevi/balgami), oval/orta, uzun/koseli (sevdavi), kucuk/sivri
- Cilt durumu: yagli/parlak (sicak mizac), normal, kuru/mat (soguk-kuru), kuru/pullu (siddetli kuruluk)
- Goz alti: normal, mor/koyu halka (kan eksikligi, kara safra), sislik/torba (balgam nem fazlasi), kizarik (dem yangisi)

Tum bulgularini el-Kanun Kitab 1 mizac teorisi cercevesinde yorumla. Her bulgu icin hangi hiltin baskin oldugunu belirt. Dort hilt dengesi hakkinda sayisal tahmin ver (toplam 100 olacak sekilde).

SADECE JSON dondur, baska hicbir sey yazma:
{"dil":{"renk":"tam aciklama","kaplama":"tam aciklama","nem":"tam aciklama","sekil":"tam aciklama","hilt_yorumu":"bu dil hangi hilti isaret ediyor"},"yuz":{"ten":"tam aciklama","sekil":"tam aciklama","cilt":"tam aciklama","gozalti":"tam aciklama","hilt_yorumu":"bu yuz hangi hilti isaret ediyor"},"hiltlar":{"dem":25,"balgam":30,"sari_safra":25,"kara_safra":20},"baskin_hilt":"balgam","mizac_ozeti":"el-Kanun cercevesinde 2-3 cumle detayli yorum","kaynak":"el-Kanun Kitab 1, Fen 2"}`,
        messages: body.messages,
      }),
    })
    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Vision API hatasi' }, { status: 500 })
  }
}
