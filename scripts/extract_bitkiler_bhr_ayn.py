"""
BHR (Bahru'l-Cevahir fi't-Tib) ve AYN kaynaklarından madde kayıtlarını çıkarır.
- BHR: her blok içinde ':' ile biten kısa satırlar madde başlığıdır.
- AYN: bir blok içinde kısa tek satır (<= 4 kelime, çoğunluk Arapça) madde başlığıdır;
  ardından gelen paragraf tanımdır.
Not: Bu kaynaklar Arapça/Farsça olduğu için `ad_ar` alanına başlık, `ad_tr` alanına
transliterasyon yerine aynı başlık yazılır (ad_tr NOT NULL olabileceği için).
"""
import re
import os
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client

load_dotenv(Path(__file__).resolve().parent.parent / ".env.local")

sb = create_client(
    os.environ["NEXT_PUBLIC_SUPABASE_URL"],
    os.environ["SUPABASE_SERVICE_ROLE_KEY"],
)

ARABIC_RE = re.compile(r"[\u0600-\u06FF]")


def fetch_all(kod):
    data = []
    off = 0
    while True:
        r = (
            sb.table("klasik_kaynaklar")
            .select("bolum,icerik_tr")
            .eq("kaynak_kodu", kod)
            .range(off, off + 999)
            .execute()
        )
        if not r.data:
            break
        data.extend(r.data)
        if len(r.data) < 1000:
            break
        off += 1000
    return data


def detect_mizac(text):
    s = text
    sicak = any(x in s for x in ["حار", "مسخن", "حرار"])
    soguk = any(x in s for x in ["بارد", "مبرد"])
    kuru = any(x in s for x in ["يابس", "مجفف"])
    nemli = any(x in s for x in ["رطب", "مرطب"])
    m_s = "sıcak" if sicak and not soguk else ("soğuk" if soguk else "bilinmiyor")
    m_n = "kuru" if kuru and not nemli else ("nemli" if nemli else "bilinmiyor")
    return m_s, m_n


ORGAN_AR = {
    "كبد": "karaciğer",
    "معدة": "mide",
    "كلية": "böbrek",
    "كلى": "böbrek",
    "رئة": "akciğer",
    "قلب": "kalp",
    "دماغ": "beyin",
    "مثانة": "mesane",
    "أمعاء": "bağırsak",
    "معى": "bağırsak",
    "عين": "göz",
    "شعر": "saç",
    "جلد": "cilt",
    "مفصل": "eklemler",
    "طحال": "dalak",
}


def detect_organlar(text):
    organlar = []
    for k, v in ORGAN_AR.items():
        if k in text and v not in organlar:
            organlar.append(v)
    return organlar


def parse_bhr(blocks):
    out = []
    for b in blocks:
        icerik = b.get("icerik_tr", "") or ""
        lines = icerik.split("\n")
        cur_ad = None
        cur_body = []
        for ln in lines:
            s = ln.strip()
            if not s:
                continue
            # Madde başlığı: ':' ile biter, kısa, Arapça içerir
            if s.endswith(":") and len(s) <= 50 and ARABIC_RE.search(s):
                if cur_ad and cur_body:
                    out.append((cur_ad, "\n".join(cur_body).strip()))
                cur_ad = s.rstrip(" :").strip()
                cur_body = []
            else:
                if cur_ad:
                    cur_body.append(s)
        if cur_ad and cur_body:
            out.append((cur_ad, "\n".join(cur_body).strip()))
    return out


def parse_ayn(blocks):
    out = []
    for b in blocks:
        icerik = b.get("icerik_tr", "") or ""
        # AYN'da net madde başlık kalıbı yok. "حرف الكاف" gibi harf başlıklarını atla;
        # kısa tek kelimeli satır + dolu paragraf kalıbını ara.
        lines = [ln.strip() for ln in icerik.split("\n")]
        i = 0
        while i < len(lines):
            s = lines[i]
            # Aday madde başlığı: 1-3 kelime, 2-25 char, Arapça, ':' veya nokta içermez
            if (
                s
                and 2 <= len(s) <= 25
                and 1 <= len(s.split()) <= 3
                and ARABIC_RE.search(s)
                and not re.search(r"[:.،؛]", s)
                and "حرف" not in s
            ):
                # Sonraki dolu satırı tanım olarak al (en az 40 char)
                body = []
                j = i + 1
                while j < len(lines) and lines[j]:
                    body.append(lines[j])
                    j += 1
                body_text = " ".join(body)
                if len(body_text) >= 40:
                    out.append((s, body_text.strip()))
                i = j + 1
                continue
            i += 1
    return out


def to_row(ad, body, kaynak_ad):
    m_s, m_n = detect_mizac(body)
    return {
        "ad_tr": ad[:60],
        "ad_ar": ad[:60],
        "mizac_sicaklik": m_s,
        "mizac_nem": m_n,
        "mizac_derece": "bilinmiyor",
        "faydalari": body[:600],
        "organlar": detect_organlar(body),
        "kaynaklar": [kaynak_ad],
        "kaynak_metin": body[:1000],
    }


def mevcut_adlar_set():
    adlar = set()
    off = 0
    while True:
        r = sb.table("bitkiler").select("ad_tr").range(off, off + 999).execute()
        if not r.data:
            break
        for b in r.data:
            if b.get("ad_tr"):
                adlar.add(b["ad_tr"].lower())
        if len(r.data) < 1000:
            break
        off += 1000
    return adlar


def insert_batched(rows):
    for i in range(0, len(rows), 20):
        batch = rows[i : i + 20]
        sb.table("bitkiler").insert(batch).execute()
        print(f"  {i + len(batch)}/{len(rows)} eklendi")


def main():
    print("BHR çekiliyor...")
    bhr = fetch_all("BHR")
    print(f"  {len(bhr)} blok")
    bhr_items = parse_bhr(bhr)
    print(f"  {len(bhr_items)} madde çıkarıldı")

    print("AYN çekiliyor...")
    ayn = fetch_all("AYN")
    print(f"  {len(ayn)} blok")
    ayn_items = parse_ayn(ayn)
    print(f"  {len(ayn_items)} madde çıkarıldı")

    bhr_rows = [to_row(ad, body, "Bahru'l-Cevahir fi't-Tib") for ad, body in bhr_items]
    ayn_rows = [to_row(ad, body, "AYN (Ayn kaynağı)") for ad, body in ayn_items]

    print("Mevcut bitki adları okunuyor...")
    mevcut = mevcut_adlar_set()
    print(f"  {len(mevcut)} mevcut kayıt")

    def uniq_new(rows):
        seen = set()
        out = []
        for r in rows:
            k = r["ad_tr"].lower()
            if k in mevcut or k in seen:
                continue
            seen.add(k)
            out.append(r)
        return out

    bhr_new = uniq_new(bhr_rows)
    ayn_new = uniq_new(ayn_rows)

    print(f"BHR yeni: {len(bhr_new)}")
    insert_batched(bhr_new)

    print(f"AYN yeni: {len(ayn_new)}")
    insert_batched(ayn_new)

    print("Tamamlandı.")


if __name__ == "__main__":
    main()
