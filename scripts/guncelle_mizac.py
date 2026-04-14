import os, time
from dotenv import load_dotenv
from supabase import create_client
import anthropic

load_dotenv('.env.local')
sb = create_client(os.getenv('NEXT_PUBLIC_SUPABASE_URL'), os.getenv('SUPABASE_SERVICE_ROLE_KEY'))
claude = anthropic.Anthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))

# bilinmiyor kayıtları çek
r = sb.table('bitkiler').select('id,ad_tr,ad_ar').eq('mizac_sicaklik', 'bilinmiyor').execute()
print(f'{len(r.data)} bilinmiyor kayıt bulundu')

# klasik_kaynaklar'ı tek seferde belleğe al (ilike sorgusu DB'de timeout veriyor)
print('klasik_kaynaklar belleğe alınıyor...')
kk = []
off = 0
while True:
    kr = sb.table('klasik_kaynaklar').select('icerik_tr,kaynak_kodu').range(off, off + 999).execute()
    if not kr.data:
        break
    kk.extend(kr.data)
    if len(kr.data) < 1000:
        break
    off += 1000
print(f'{len(kk)} klasik_kaynaklar kaydı belleğe alındı')

def ara_kaynaklar(terim, limit=3):
    t = terim.lower()
    out = []
    for row in kk:
        ic = (row.get('icerik_tr') or '').lower()
        if t in ic:
            out.append(row)
            if len(out) >= limit:
                break
    return out

guncellendi = 0
atlanan = 0

for i, bitki in enumerate(r.data):
    ad_tr = bitki.get('ad_tr', '')
    ad_ar = bitki.get('ad_ar', '')

    # Klasik kaynaklarda ara
    arama = ad_tr or ad_ar
    if not arama or len(arama) < 2:
        atlanan += 1
        continue

    kaynak_rows = ara_kaynaklar(arama[:15], limit=3)

    if not kaynak_rows:
        atlanan += 1
        continue

    # İçerikleri birleştir
    icerik = '\n\n'.join([
        f"[{k['kaynak_kodu']}]: {(k['icerik_tr'] or '')[:400]}"
        for k in kaynak_rows
    ])

    prompt = f"""Klasik İslam tıbbı kaynaklarında '{ad_tr}' bitkisi hakkında şu bilgiler var:

{icerik}

Bu bilgilere göre JSON formatında yanıt ver:
{{"mizac_sicaklik": "sıcak|soğuk|ılık|bilinmiyor", "mizac_nem": "nemli|kuru|bilinmiyor", "mizac_derece": 1-4 veya null, "faydalari": "kısa özet Türkçe"}}

Sadece JSON döndür, başka bir şey yazma."""

    try:
        resp = claude.messages.create(
            model='claude-sonnet-4-20250514',
            max_tokens=200,
            messages=[{'role': 'user', 'content': prompt}]
        )

        import json, re
        text = resp.content[0].text.strip()
        # JSON çıkar
        m = re.search(r'\{.*\}', text, re.DOTALL)
        if not m:
            atlanan += 1
            continue

        data = json.loads(m.group())

        update = {}
        if data.get('mizac_sicaklik') in ['sıcak','soğuk','ılık']:
            update['mizac_sicaklik'] = data['mizac_sicaklik']
        if data.get('mizac_nem') in ['nemli','kuru']:
            update['mizac_nem'] = data['mizac_nem']
        if data.get('mizac_derece'):
            update['mizac_derece'] = data['mizac_derece']
        if data.get('faydalari') and len(data['faydalari']) > 10:
            update['faydalari'] = data['faydalari']

        if update:
            sb.table('bitkiler').update(update).eq('id', bitki['id']).execute()
            guncellendi += 1
        else:
            atlanan += 1

    except Exception as e:
        print(f'Hata ({ad_tr}): {e}')
        atlanan += 1

    # Her 10 kayıtta bir rapor
    if (i+1) % 10 == 0:
        print(f'{i+1}/{len(r.data)} — güncellenen: {guncellendi}, atlanan: {atlanan}')

    time.sleep(0.3)  # rate limit

print(f'\nTamamlandı: {guncellendi} güncellendi, {atlanan} atlandı')
