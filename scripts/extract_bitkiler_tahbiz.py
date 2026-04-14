"""
Kânûn (SRC-007) Müfredât bölümlerindeki TR bitki kayıtlarını çıkarır.
Tahbîzü'l-Mathûn, Kânûn'un Türkçe şerhi/tercümesi olduğu için bu yol
aslında aynı metinsel kaynağı hedefliyor.
"""
import re
import os
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client

load_dotenv(Path(__file__).resolve().parent.parent / ".env.local")

supabase = create_client(
    os.environ["NEXT_PUBLIC_SUPABASE_URL"],
    os.environ["SUPABASE_SERVICE_ROLE_KEY"],
)

# Tahbîz Müfredat kayıtlarını çek
tum_data = []
offset = 0
while True:
    r = supabase.table('klasik_kaynaklar')\
        .select('bolum,icerik_tr')\
        .eq('kaynak_kodu', 'SRC-007')\
        .ilike('bolum', '%Müfredat%')\
        .range(offset, offset+999)\
        .execute()
    if not r.data:
        break
    tum_data.extend(r.data)
    if len(r.data) < 1000:
        break
    offset += 1000

print(f'Toplam {len(tum_data)} Müfredat kaydı')

bitkiler = []
for row in tum_data:
    bolum = row.get('bolum', '')
    icerik = row.get('icerik_tr', '') or ''

    # Pattern: tüm dash varyasyonları ile "Müfredat [— – -] MaddeAdı"
    m = re.search(r"Müfredat[,\s—\-–]+(.+?)(?:\s*[—\-–]|\s*$)", bolum)
    if not m:
        continue

    ad_tr = m.group(1).strip()
    if len(ad_tr) < 2 or len(ad_tr) > 60:
        continue

    icerik_lower = icerik.lower()

    mizac_s = 'bilinmiyor'
    mizac_n = 'bilinmiyor'

    if any(x in icerik_lower for x in ['ısıtıcı','sıcak','harr','müsahhin']):
        mizac_s = 'sıcak'
    elif any(x in icerik_lower for x in ['soğutucu','soğuk','bârid','müberrid']):
        mizac_s = 'soğuk'
    elif 'ılık' in icerik_lower:
        mizac_s = 'ılık'

    if any(x in icerik_lower for x in ['nemlendirici','nemli','ratb','mürettib']):
        mizac_n = 'nemli'
    elif any(x in icerik_lower for x in ['kurutucu','kuru','yâbis','müceffe']):
        mizac_n = 'kuru'

    organlar = []
    organ_map = {
        'karaciğer':'karaciğer','mide':'mide','böbrek':'böbrek',
        'akciğer':'akciğer','kalp':'kalp','beyin':'beyin',
        'mesane':'mesane','bağırsak':'bağırsak','göz':'göz',
        'saç':'saç','cilt':'cilt','eklem':'eklemler','dalak':'dalak'
    }
    for k,v in organ_map.items():
        if k in icerik_lower and v not in organlar:
            organlar.append(v)

    bitkiler.append({
        'ad_tr': ad_tr,
        'mizac_sicaklik': mizac_s,
        'mizac_nem': mizac_n,
        'faydalari': icerik[:600] if icerik else '',
        'organlar': organlar,
        'kaynaklar': ["Tahbîzü'l-Mathûn — Tokatlı Mustafa Efendi"],
        'kaynak_metin': icerik[:1000] if icerik else ''
    })

print(f'{len(bitkiler)} bitki çıkarıldı')

mevcut_adlar = set()
moff = 0
while True:
    mr = supabase.table('bitkiler').select('ad_tr').range(moff, moff + 999).execute()
    if not mr.data:
        break
    for b in mr.data:
        if b.get('ad_tr'):
            mevcut_adlar.add(b['ad_tr'].lower())
    if len(mr.data) < 1000:
        break
    moff += 1000

yeni = [b for b in bitkiler if b['ad_tr'].lower() not in mevcut_adlar]
print(f'{len(yeni)} yeni bitki eklenecek')

for i in range(0, len(yeni), 20):
    batch = yeni[i:i+20]
    supabase.table('bitkiler').insert(batch).execute()
    print(f'{i+len(batch)}/{len(yeni)} eklendi')

print('Tamamlandı!')
