"""
el-Şâmil (SRC-006) bolum alanındaki TR bitki kayıtlarını regex ile
çıkarıp bitkiler tablosuna ekler.
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

# ── SRC-006 tüm kayıtları pagination ile çek ─────────────────
tum_data = []
offset = 0
while True:
    r = supabase.table("klasik_kaynaklar") \
        .select("bolum,icerik_tr") \
        .eq("kaynak_kodu", "SRC-006") \
        .range(offset, offset + 999) \
        .execute()
    if not r.data:
        break
    tum_data.extend(r.data)
    print(f"  {len(r.data)} satır çekildi (toplam: {len(tum_data)})")
    if len(r.data) < 1000:
        break
    offset += 1000

print(f"SRC-006 toplam: {len(tum_data)} satır\n")

bitkiler = []
for row in tum_data:
    bolum = row.get("bolum", "")
    icerik = row.get("icerik_tr", "") or ""

    # Pattern: tüm dash varyasyonları ve Türkçe/ASCII iki nokta
    m = re.match(r"^Cilt \d+ [—\-–] (.+?)[:：]\s*(.*)$", bolum)
    if not m:
        continue

    ad_tr = m.group(1).strip()
    fayda_ozet = m.group(2).strip()

    # Mizaç sıcaklık
    mizac_s = "bilinmiyor"
    mizac_n = "bilinmiyor"

    icerik_lower = icerik.lower()
    if "ısıtıcı" in icerik_lower or "sıcak" in icerik_lower:
        mizac_s = "sıcak"
    elif "soğutucu" in icerik_lower or "soğuk" in icerik_lower:
        mizac_s = "soğuk"
    elif "ılık" in icerik_lower:
        mizac_s = "ılık"

    if "nemlendirici" in icerik_lower or "nemli" in icerik_lower or "ıslak" in icerik_lower:
        mizac_n = "nemli"
    elif "kurutucu" in icerik_lower or "kuru" in icerik_lower:
        mizac_n = "kuru"

    # Organlar
    organlar = []
    organ_map = {
        "karaciğer": "karaciğer", "mide": "mide", "böbrek": "böbrek",
        "akciğer": "akciğer", "kalp": "kalp", "beyin": "beyin",
        "idrar": "mesane", "bağırsak": "bağırsak", "göz": "göz",
        "saç": "saç", "cilt": "cilt", "eklem": "eklemler",
    }
    for k, v in organ_map.items():
        if k in icerik_lower and v not in organlar:
            organlar.append(v)

    bitkiler.append({
        "ad_tr": ad_tr,
        "mizac_sicaklik": mizac_s,
        "mizac_nem": mizac_n,
        "faydalari": fayda_ozet + ("\n\n" + icerik[:500] if icerik else ""),
        "organlar": organlar,
        "kaynaklar": ["el-Şâmil fi's-Sınâati't-Tıbbiyye — İbn Nefîs"],
        "kaynak_metin": icerik[:1000] if icerik else "",
    })

print(f"Toplam {len(bitkiler)} bitki bulundu")

# ── Mükerrer önleme ─────────────────────────────────────────
mevcut_res = supabase.table("bitkiler").select("ad_tr").execute()
mevcut_adlar = {b["ad_tr"].lower() for b in mevcut_res.data if b.get("ad_tr")}

yeni = [b for b in bitkiler if b["ad_tr"].lower() not in mevcut_adlar]
print(f"Mevcut tabloda: {len(mevcut_adlar)} bitki")
print(f"Yeni eklenecek: {len(yeni)}")

# ── 20'şer batch halinde ekle ────────────────────────────────
for i in range(0, len(yeni), 20):
    batch = yeni[i : i + 20]
    supabase.table("bitkiler").insert(batch).execute()
    print(f"{i + len(batch)}/{len(yeni)} eklendi")

print("\n✓ Tamamlandı!")
print(f"Özet: {len(yeni)} yeni bitki eklendi, {len(bitkiler) - len(yeni)} zaten vardı")
