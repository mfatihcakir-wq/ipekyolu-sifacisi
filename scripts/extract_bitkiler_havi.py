"""
el-Hâvî Cilt 7 (Müfredat ve Bileşik İlaçlar) — SRC-010 içinde ~600 chunk.
Claude ile her Arapça chunk'ı okuyup yapılandırılmış bitki/madde listesi çıkarır,
bitkiler tablosuna mükerrer olmadığını kontrol ederek ekler.
"""

import os
import re
import json
import time
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client
import anthropic

load_dotenv(Path(__file__).resolve().parent.parent / ".env.local")

sb = create_client(
    os.environ["NEXT_PUBLIC_SUPABASE_URL"],
    os.environ["SUPABASE_SERVICE_ROLE_KEY"],
)
claude = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

# ── Hâvî Cilt 7 chunk'larını pagination ile çek ──────────────
tum_data = []
offset = 0
while True:
    r = sb.table("klasik_kaynaklar") \
        .select("id,bolum,icerik_tr") \
        .eq("kaynak_kodu", "SRC-010") \
        .ilike("bolum", "%Cilt 7%") \
        .range(offset, offset + 999) \
        .execute()
    if not r.data:
        break
    tum_data.extend(r.data)
    if len(r.data) < 1000:
        break
    offset += 1000

print(f"{len(tum_data)} Hâvî Cilt 7 chunk bulundu\n")

# ── Mevcut bitkileri pagination ile çek ──────────────────────
mevcut_tr = set()
mevcut_ar = set()
moff = 0
while True:
    mr = sb.table("bitkiler").select("ad_tr,ad_ar").range(moff, moff + 999).execute()
    if not mr.data:
        break
    for b in mr.data:
        if b.get("ad_tr"):
            mevcut_tr.add(b["ad_tr"].lower())
        if b.get("ad_ar"):
            mevcut_ar.add(b["ad_ar"].lower())
    if len(mr.data) < 1000:
        break
    moff += 1000
print(f"Mevcut: {len(mevcut_tr)} TR adı, {len(mevcut_ar)} AR adı\n")

eklenen = 0
atlanan = 0

for i, chunk in enumerate(tum_data):
    icerik = chunk.get("icerik_tr", "") or ""
    if len(icerik) < 50:
        atlanan += 1
        continue

    prompt = f"""Bu metin klasik İslam tıbbı kaynağı el-Hâvî'den (er-Râzî) Müfredat bölümüdür.

Metin:
{icerik[:800]}

Bu metinde geçen tıbbi bitki, madde veya ilaç hammaddelerini çıkar.
ÖNEMLI: Tüm alanları TÜRKÇE yaz. Arapça bilmiyorsan transliterasyon yap.

Her biri için JSON array döndür:
[
  {{
    "ad_tr": "Türkçe adı veya Türkçe okunuşu (örn: Zencefil, Tarçın, Safran, Hindistan cevizi)",
    "ad_ar": "Arapça yazılışı",
    "ad_lat": "Latince bilimsel adı (varsa, örn: Zingiber officinale)",
    "mizac_sicaklik": "sıcak|soğuk|ılık|bilinmiyor",
    "mizac_nem": "nemli|kuru|bilinmiyor",
    "mizac_derece": 1-4 veya null,
    "faydalari": "Türkçe kısa fayda özeti — er-Râzî'ye göre ne işe yarar",
    "organlar": ["mide", "karaciğer" gibi Türkçe organ adları]
  }}
]

Sadece JSON array döndür. Bitki/madde yoksa [] döndür."""

    try:
        resp = claude.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=600,
            messages=[{"role": "user", "content": prompt}],
        )

        text = resp.content[0].text.strip()
        m = re.search(r"\[.*\]", text, re.DOTALL)
        if not m:
            atlanan += 1
            continue

        bitkiler = json.loads(m.group())
        if not bitkiler:
            atlanan += 1
            continue

        for b in bitkiler:
            ad_tr = (b.get("ad_tr") or "").strip()
            ad_ar = (b.get("ad_ar") or "").strip()

            if not ad_tr or len(ad_tr) < 2:
                continue

            if ad_tr.lower() in mevcut_tr:
                continue
            if ad_ar and ad_ar.lower() in mevcut_ar:
                continue

            kayit = {
                "ad_tr": ad_tr,
                "ad_ar": ad_ar or None,
                "ad_lat": b.get("ad_lat") or None,
                "mizac_sicaklik": b.get("mizac_sicaklik", "bilinmiyor"),
                "mizac_nem": b.get("mizac_nem", "bilinmiyor"),
                "mizac_derece": b.get("mizac_derece") or None,
                "faydalari": b.get("faydalari") or None,
                "organlar": b.get("organlar") or [],
                "kaynaklar": ["el-Hâvî fi't-Tıb — Ebû Bekr er-Râzî"],
                "kaynak_metin": icerik[:500],
            }

            try:
                sb.table("bitkiler").insert(kayit).execute()
                mevcut_tr.add(ad_tr.lower())
                if ad_ar:
                    mevcut_ar.add(ad_ar.lower())
                eklenen += 1
            except Exception as insErr:
                print(f"  [insert fail chunk {i}]: {str(insErr)[:80]}")

    except Exception as e:
        print(f"Hata chunk {i}: {str(e)[:120]}")
        atlanan += 1

    if (i + 1) % 20 == 0:
        print(f"{i + 1}/{len(tum_data)} — eklenen: {eklenen}, atlanan: {atlanan}", flush=True)

    time.sleep(0.5)

print(f"\n✓ Tamamlandı: {eklenen} yeni bitki eklendi, {atlanan} chunk atlandı")
