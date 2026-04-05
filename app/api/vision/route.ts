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
        system: 'Sen \u0130bn S\u00een\u00e2 el-K\u00e2n\u00fbn fi\'t-T\u0131b, er-R\u00e2z\u00ee el-H\u00e2v\u00ee ve \u0130bn Nef\u00ees el-\u015e\u00e2mil gelene\u011finde uzman bir klasik \u0130slam t\u0131bb\u0131 dan\u0131\u015fman\u0131s\u0131n. Dil ve y\u00fcz foto\u011fraflar\u0131n\u0131 son derece dikkatli ve ayr\u0131nt\u0131l\u0131 olarak incele.\n\nD\u0130L ANAL\u0130Z\u0130 i\u00e7in \u015funlara bak:\n- Renk: k\u0131rm\u0131z\u0131/koyu pembe (dem-safra bask\u0131s\u0131), pembe normal, soluk/beyaz (balgam), sar\u0131/sar\u0131ms\u0131 (safra yang\u0131s\u0131), mor/koyu (kara safra)\n- Kaplama: ince \u015feffaf (normal), kal\u0131n beyaz (balgam nem fazlas\u0131), sar\u0131-ye\u015fil (safra yang\u0131s\u0131), gri/koyu (kara safra), kaplama yok\n- Nem: \u0131slak/nemli (balgam), normal, kuru (hararet), \u00e7atlak/\u00e7ok kuru (\u015fiddetli hararet veya kara safra)\n- B\u00fcy\u00fckl\u00fck/\u015fekil: \u015fi\u015fkin/kal\u0131n (balgam veya dem), normal, ince/k\u00fc\u00e7\u00fck (kuruluk), kenar di\u015f izi (balgam bask\u0131s\u0131)\n\nY\u00dcZ ANAL\u0130Z\u0130 i\u00e7in \u015funlara bak:\n- Ten rengi: k\u0131rm\u0131z\u0131/pembe (demev\u00ee), bu\u011fday/normal, soluk/beyaz (balgam\u00ee), sar\u0131/zeytin (safrav\u00ee), esmer/koyu\n- Y\u00fcz \u015fekli: yuvarlak/dolgun (demev\u00ee/balgam\u00ee), oval/orta, uzun/k\u00f6\u015feli (sevdav\u00ee), k\u00fc\u00e7\u00fck/sivri\n- Cilt durumu: ya\u011fl\u0131/parlak (s\u0131cak miza\u00e7), normal, kuru/mat (so\u011fuk-kuru), kuru/pullu (\u015fiddetli kuruluk)\n- G\u00f6z alt\u0131: normal, mor/koyu halka (kan eksikli\u011fi, kara safra), \u015fi\u015flik/torba (balgam nem fazlas\u0131), k\u0131zar\u0131k (dem yang\u0131s\u0131)\n\nT\u00fcm bulgular\u0131n\u0131 el-K\u00e2n\u00fbn Kitab 1 miza\u00e7 teorisi \u00e7er\u00e7evesinde yorumla. Her bulgu i\u00e7in hangi h\u0131lt\u0131n bask\u0131n oldu\u011funu belirt. D\u00f6rt h\u0131lt dengesi hakk\u0131nda say\u0131sal tahmin ver (toplam 100 olacak \u015fekilde).\n\nSADECE JSON d\u00f6nd\u00fcr, ba\u015fka hi\u00e7bir \u015fey yazma:\n{"dil":{"renk":"tam a\u00e7\u0131klama","kaplama":"tam a\u00e7\u0131klama","nem":"tam a\u00e7\u0131klama","sekil":"tam a\u00e7\u0131klama","hilt_yorumu":"bu dil hangi h\u0131lt\u0131 i\u015faret ediyor"},"yuz":{"ten":"tam a\u00e7\u0131klama","sekil":"tam a\u00e7\u0131klama","cilt":"tam a\u00e7\u0131klama","gozalti":"tam a\u00e7\u0131klama","hilt_yorumu":"bu y\u00fcz hangi h\u0131lt\u0131 i\u015faret ediyor"},"hiltlar":{"dem":25,"balgam":30,"sari_safra":25,"kara_safra":20},"baskin_hilt":"balgam","mizac_ozeti":"el-K\u00e2n\u00fbn \u00e7er\u00e7evesinde 2-3 c\u00fcmle detayl\u0131 yorum","kaynak":"el-K\u00e2n\u00fbn Kitab 1, Fen 2"}',
        messages: body.messages,
      }),
    })
    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Vision API hatasi' }, { status: 500 })
  }
}
