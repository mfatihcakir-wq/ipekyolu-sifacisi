// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function analizRaporuHtml(data: {
  hasta_adi: string
  kayit_no: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sonuc: any
}): string {
  const { hasta_adi, kayit_no, sonuc } = data
  const primary = '#1C3A26'
  const gold = '#8B6914'
  const cream = '#FAF7F2'
  const dark = '#1C1C1C'
  const border = '#E8DFD4'
  const surface = '#FAF7F2'

  const bitkilerHtml = (sonuc.bitki_recetesi || []).map((b: { bitki: string; ar?: string; doz?: string; sure?: string; endikasyon?: string; kaynak?: string }) => `
    <tr><td style="padding:8px 0;border-bottom:1px solid ${border};">
      <div style="font-size:14px;font-weight:600;color:${primary};">🌿 ${b.bitki}${b.ar ? ` (${b.ar})` : ''}</div>
      ${b.doz ? `<div style="font-size:13px;color:${dark};margin-top:2px;">Doz: ${b.doz}</div>` : ''}
      ${b.sure ? `<div style="font-size:12px;color:#666;">Sure: ${b.sure}</div>` : ''}
      ${b.endikasyon ? `<div style="font-size:12px;color:#666;">${b.endikasyon}</div>` : ''}
      ${b.kaynak ? `<div style="font-size:11px;color:#999;font-style:italic;margin-top:2px;">${b.kaynak}</div>` : ''}
    </td></tr>
  `).join('')

  const terkibHtml = (sonuc.terkib_recetesi || []).map((t: { ad: string; tur?: string; icerik?: string; hazirlama?: string; doz?: string; kaynak?: string }) => `
    <tr><td style="padding:10px 0;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:${surface};border:1px solid ${border};border-radius:8px;">
        <tr><td style="padding:14px;">
          <div style="font-size:15px;font-weight:600;color:${primary};">${t.ad}</div>
          ${t.tur ? `<div style="font-size:11px;color:${gold};text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">${t.tur}</div>` : ''}
          ${t.icerik ? `<div style="font-size:13px;color:${dark};margin-bottom:4px;"><strong>Icerik:</strong> ${t.icerik}</div>` : ''}
          ${t.hazirlama ? `<div style="font-size:13px;color:${dark};margin-bottom:4px;"><strong>Hazirlama:</strong> ${t.hazirlama}</div>` : ''}
          ${t.doz ? `<div style="font-size:13px;color:${dark};"><strong>Doz:</strong> ${t.doz}</div>` : ''}
          ${t.kaynak ? `<div style="font-size:11px;color:#999;font-style:italic;margin-top:4px;">${t.kaynak}</div>` : ''}
        </td></tr>
      </table>
    </td></tr>
  `).join('')

  const gidaHtml = (sonuc.gida_protokolu || []).length > 0 ? `
    <tr><td style="padding:16px 0 8px;">
      <div style="font-size:11px;font-weight:700;color:${primary};letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;">Gida Protokolu</div>
      ${(sonuc.gida_protokolu || []).map((g: string) => `<div style="font-size:13px;color:${dark};padding:2px 0;">✓ ${g}</div>`).join('')}
    </td></tr>
  ` : ''

  const hikmetHtml = sonuc.hikmetli_soz ? `
    <tr><td style="padding:20px 0;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:${primary};border-radius:8px;">
        <tr><td style="padding:20px;text-align:center;">
          ${sonuc.hikmetli_soz.metin_ar ? `<div style="font-size:18px;color:${gold};margin-bottom:8px;direction:rtl;font-family:serif;">${sonuc.hikmetli_soz.metin_ar}</div>` : ''}
          <div style="font-size:14px;color:${cream};margin-bottom:6px;font-style:italic;">${sonuc.hikmetli_soz.metin}</div>
          ${sonuc.hikmetli_soz.kaynak ? `<div style="font-size:11px;color:rgba(255,255,255,0.5);">— ${sonuc.hikmetli_soz.kaynak}</div>` : ''}
        </td></tr>
      </table>
    </td></tr>
  ` : ''

  return `<!DOCTYPE html>
<html lang="tr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:${cream};font-family:Georgia,'Times New Roman',serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#FFFFFF;">
  <tr><td style="background:${primary};padding:24px;text-align:center;">
    <div style="font-size:18px;color:${gold};letter-spacing:4px;font-weight:600;">IPEK YOLU SIFACISI</div>
    <div style="font-size:11px;color:rgba(255,255,255,0.5);margin-top:4px;letter-spacing:2px;">MIZAC ANALIZ RAPORU</div>
  </td></tr>

  <tr><td style="background:${surface};padding:12px 24px;border-bottom:1px solid ${border};">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td style="font-size:12px;color:${dark};">Hasta: <strong>${hasta_adi}</strong></td>
      <td style="font-size:12px;color:#999;text-align:right;">Kayit: ${kayit_no}</td>
    </tr></table>
  </td></tr>

  <tr><td style="padding:24px;">
    ${sonuc.ozet ? `
    <div style="font-size:11px;font-weight:700;color:${primary};letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;">Degerlendirme</div>
    <div style="font-size:14px;color:${dark};line-height:1.7;margin-bottom:16px;">${sonuc.ozet}</div>
    ` : ''}

    ${sonuc.mizac_tipi ? `<div style="display:inline-block;background:${primary};color:${cream};font-size:11px;padding:4px 12px;border-radius:12px;margin-bottom:16px;">${sonuc.mizac_tipi}</div>` : ''}

    ${sonuc.fitri_hali ? `
    <div style="background:#FFF8E7;border-left:3px solid ${gold};padding:10px 14px;border-radius:0 6px 6px 0;margin-bottom:16px;">
      <div style="font-size:12px;font-weight:600;color:${primary};margin-bottom:4px;">Fitri-Hali Karsilastirmasi</div>
      ${sonuc.fitri_hali.fitri_mizac ? `<div style="font-size:13px;color:${dark};">Fitri: ${sonuc.fitri_hali.fitri_mizac}</div>` : ''}
      ${sonuc.fitri_hali.hali_mizac ? `<div style="font-size:13px;color:${dark};">Hali: ${sonuc.fitri_hali.hali_mizac}</div>` : ''}
      ${sonuc.fitri_hali.tedavi_hedefi ? `<div style="font-size:13px;color:${dark};margin-top:4px;font-weight:600;">${sonuc.fitri_hali.tedavi_hedefi}</div>` : ''}
    </div>
    ` : ''}

    <table width="100%" cellpadding="0" cellspacing="0">
      ${bitkilerHtml ? `
      <tr><td style="padding:12px 0 4px;">
        <div style="font-size:11px;font-weight:700;color:${primary};letter-spacing:2px;text-transform:uppercase;">Bitkisel Protokol</div>
      </td></tr>
      ${bitkilerHtml}
      ` : ''}
      ${terkibHtml ? `
      <tr><td style="padding:16px 0 4px;">
        <div style="font-size:11px;font-weight:700;color:${primary};letter-spacing:2px;text-transform:uppercase;">Terkib Receteleri</div>
      </td></tr>
      ${terkibHtml}
      ` : ''}
      ${gidaHtml}
      ${hikmetHtml}
    </table>

    ${(sonuc.ozel_uyarilar || []).length > 0 ? `
    <div style="margin-top:16px;padding:12px;background:#FFF8E7;border:1px solid ${gold};border-radius:8px;">
      <div style="font-size:11px;font-weight:700;color:#8B0000;letter-spacing:2px;margin-bottom:6px;">UYARILAR</div>
      ${(sonuc.ozel_uyarilar || []).map((n: string) => `<div style="font-size:13px;color:${dark};padding:2px 0;">⚠ ${n}</div>`).join('')}
    </div>
    ` : ''}
  </td></tr>

  <tr><td style="background:${primary};padding:16px 24px;text-align:center;">
    <div style="font-size:10px;color:rgba(255,255,255,0.4);letter-spacing:1px;">Bu rapor klasik Islam tibbi kaynaklarina dayanmaktadir.</div>
    <div style="font-size:10px;color:rgba(255,255,255,0.3);margin-top:4px;">Tibbi tedavi yerine gecmez. Hekiminize danisiniz.</div>
  </td></tr>
</table>
</body>
</html>`
}
