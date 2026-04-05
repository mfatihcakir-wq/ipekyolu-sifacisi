// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ciltRaporuHtml(data: {
  hasta_adi: string
  kayit_no: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sonuc: any
}): string {
  const { hasta_adi, kayit_no, sonuc } = data
  const primary = '#1C3A26'
  const gold = '#B8860B'
  const cream = '#FAF6EF'
  const dark = '#1C1C1C'
  const border = '#DEB887'
  const surface = '#FAF6EF'

  const urunlerHtml = (sonuc.urunler || []).map((u: {
    isim: string; tur: string; bilesenler: string[]; hazirlanis: string; uygulama: string; sure?: string; kaynak?: string
  }) => `
    <tr><td style="padding:12px 0;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:${surface};border:1px solid ${border};border-radius:8px;">
        <tr><td style="padding:16px;">
          <div style="font-size:16px;font-weight:600;color:${primary};margin-bottom:4px;">${u.isim}</div>
          <div style="font-size:12px;color:${gold};text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">${u.tur}</div>
          <div style="font-size:13px;color:${dark};margin-bottom:6px;"><strong>Bilesenler:</strong> ${(u.bilesenler || []).join(', ')}</div>
          <div style="font-size:13px;color:${dark};margin-bottom:6px;"><strong>Hazirlenis:</strong> ${u.hazirlanis}</div>
          <div style="font-size:13px;color:${dark};margin-bottom:6px;"><strong>Uygulama:</strong> ${u.uygulama}</div>
          ${u.sure ? `<div style="font-size:12px;color:#666;margin-top:4px;">Sure: ${u.sure}</div>` : ''}
          ${u.kaynak ? `<div style="font-size:11px;color:#999;margin-top:4px;font-style:italic;">Kaynak: ${u.kaynak}</div>` : ''}
        </td></tr>
      </table>
    </td></tr>
  `).join('')

  const rutinHtml = sonuc.gunluk_rutin ? `
    <tr><td style="padding:20px 0 8px;">
      <div style="font-size:11px;font-weight:700;color:${primary};letter-spacing:2px;text-transform:uppercase;margin-bottom:12px;">Gunluk Rutin</div>
      ${sonuc.gunluk_rutin.sabah ? `
        <div style="background:${surface};border-left:3px solid ${gold};padding:10px 14px;border-radius:0 6px 6px 0;margin-bottom:8px;">
          <div style="font-size:12px;font-weight:600;color:${primary};margin-bottom:4px;">Sabah</div>
          ${(sonuc.gunluk_rutin.sabah || []).map((a: string) => `<div style="font-size:13px;color:${dark};padding:2px 0;">- ${a}</div>`).join('')}
        </div>
      ` : ''}
      ${sonuc.gunluk_rutin.aksam ? `
        <div style="background:${surface};border-left:3px solid ${primary};padding:10px 14px;border-radius:0 6px 6px 0;margin-bottom:8px;">
          <div style="font-size:12px;font-weight:600;color:${primary};margin-bottom:4px;">Aksam</div>
          ${(sonuc.gunluk_rutin.aksam || []).map((a: string) => `<div style="font-size:13px;color:${dark};padding:2px 0;">- ${a}</div>`).join('')}
        </div>
      ` : ''}
      ${sonuc.gunluk_rutin.haftalik ? `
        <div style="background:#FFF8E7;border-left:3px solid ${gold};padding:10px 14px;border-radius:0 6px 6px 0;margin-bottom:8px;">
          <div style="font-size:12px;font-weight:600;color:${primary};margin-bottom:4px;">Haftalik Ozel Bakim</div>
          ${(sonuc.gunluk_rutin.haftalik || []).map((a: string) => `<div style="font-size:13px;color:${dark};padding:2px 0;">- ${a}</div>`).join('')}
        </div>
      ` : ''}
    </td></tr>
  ` : ''

  const beslenmeHtml = sonuc.beslenme ? `
    <tr><td style="padding:20px 0 8px;">
      <div style="font-size:11px;font-weight:700;color:${primary};letter-spacing:2px;text-transform:uppercase;margin-bottom:12px;">Beslenme Onerileri</div>
      ${sonuc.beslenme.ilke ? `<div style="font-size:13px;color:${dark};margin-bottom:10px;font-style:italic;">${sonuc.beslenme.ilke}</div>` : ''}
      ${(sonuc.beslenme.onerililer || []).length > 0 ? `
        <div style="margin-bottom:8px;">
          <div style="font-size:12px;font-weight:600;color:${primary};margin-bottom:4px;">Onerilen Gidalar:</div>
          ${(sonuc.beslenme.onerililer || []).map((g: { gida: string; neden: string }) => `<div style="font-size:13px;color:${dark};padding:2px 0;">✓ <strong>${g.gida}</strong> — ${g.neden}</div>`).join('')}
        </div>
      ` : ''}
      ${(sonuc.beslenme.kacinilacaklar || []).length > 0 ? `
        <div style="margin-bottom:8px;">
          <div style="font-size:12px;font-weight:600;color:#8B0000;margin-bottom:4px;">Kacinilacaklar:</div>
          ${(sonuc.beslenme.kacinilacaklar || []).map((g: { gida: string; neden: string }) => `<div style="font-size:13px;color:${dark};padding:2px 0;">✗ <strong>${g.gida}</strong> — ${g.neden}</div>`).join('')}
        </div>
      ` : ''}
      ${sonuc.beslenme.su_tavsiyesi ? `<div style="font-size:13px;color:${dark};margin-top:6px;">Su: ${sonuc.beslenme.su_tavsiyesi}</div>` : ''}
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
  <!-- Header -->
  <tr><td style="background:${primary};padding:24px;text-align:center;">
    <div style="font-size:18px;color:${gold};letter-spacing:4px;font-weight:600;">İPEK YOLU ŞİFACISI</div>
    <div style="font-size:11px;color:rgba(255,255,255,0.5);margin-top:4px;letter-spacing:2px;">CILT BAKIM RAPORU</div>
  </td></tr>

  <!-- Info bar -->
  <tr><td style="background:${surface};padding:12px 24px;border-bottom:1px solid ${border};">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td style="font-size:12px;color:${dark};">Hasta: <strong>${hasta_adi}</strong></td>
      <td style="font-size:12px;color:#999;text-align:right;">Kayit: ${kayit_no}</td>
    </tr></table>
  </td></tr>

  <!-- Content -->
  <tr><td style="padding:24px;">
    <!-- Teshis -->
    ${sonuc.sorun_ozeti ? `
    <div style="font-size:11px;font-weight:700;color:${primary};letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;">Teshis</div>
    <div style="font-size:14px;color:${dark};line-height:1.6;margin-bottom:8px;">${sonuc.sorun_ozeti}</div>
    ` : ''}
    ${sonuc.hilt_baglantisi ? `
    <div style="background:#FFF8E7;border-left:3px solid ${gold};padding:10px 14px;border-radius:0 6px 6px 0;font-size:13px;color:${dark};margin-bottom:16px;">
      <strong>Mizac Baglantisi:</strong> ${sonuc.hilt_baglantisi}
    </div>
    ` : ''}
    ${sonuc.mizac_tipi ? `<div style="display:inline-block;background:${primary};color:${cream};font-size:11px;padding:4px 12px;border-radius:12px;margin-bottom:16px;">${sonuc.mizac_tipi}</div>` : ''}

    <!-- Urunler -->
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="padding:16px 0 4px;">
        <div style="font-size:11px;font-weight:700;color:${primary};letter-spacing:2px;text-transform:uppercase;">Urunler</div>
      </td></tr>
      ${urunlerHtml}
      ${rutinHtml}
      ${beslenmeHtml}
      ${hikmetHtml}
    </table>

    <!-- Ozel Notlar -->
    ${(sonuc.ozel_notlar || []).length > 0 ? `
    <div style="margin-top:16px;padding:12px;background:${surface};border-radius:8px;border:1px solid ${border};">
      <div style="font-size:11px;font-weight:700;color:${primary};letter-spacing:2px;margin-bottom:6px;">OZEL NOTLAR</div>
      ${(sonuc.ozel_notlar || []).map((n: string) => `<div style="font-size:13px;color:${dark};padding:2px 0;">- ${n}</div>`).join('')}
    </div>
    ` : ''}
  </td></tr>

  <!-- Footer -->
  <tr><td style="background:${primary};padding:16px 24px;text-align:center;">
    <div style="font-size:10px;color:rgba(255,255,255,0.4);letter-spacing:1px;">Bu rapor klasik Islam tibbi kaynaklarina dayanmaktadir.</div>
    <div style="font-size:10px;color:rgba(255,255,255,0.3);margin-top:4px;">Tibbi tedavi yerine gecmez. Hekiminize danisiniz.</div>
  </td></tr>
</table>
</body>
</html>`
}
