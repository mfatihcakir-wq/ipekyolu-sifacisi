"""
İbn Rüşd + Antakî + Câlînûs -> klasik_kaynaklar tablosuna yükleme
"""

import os
import re
import time
from pathlib import Path
from dotenv import load_dotenv
from docx import Document
import httpx
from supabase import create_client

# ── Ayarlar ──────────────────────────────────────────
CHUNK_SIZE = 500
OVERLAP = 50
BATCH_SIZE = 50
MAX_RETRIES = 3

SRC_DIR = Path("/Users/fatih/Desktop/IbnRusd_Antaki_Calinus")

DOSYA_META = {
    "01_IbnRusd_el-Kulliyat.docx":          {"kaynak_kodu": "SRC-021", "yazar": "İbn Rüşd el-Endelüsî (ö.595/1198)", "oncelik": 7},
    "02_IbnRusd_Mecmuat-Resail.docx":       {"kaynak_kodu": "SRC-021", "yazar": "İbn Rüşd el-Endelüsî (ö.595/1198)", "oncelik": 7},
    "03_IbnRusd_Telhisat-Calinus.docx":     {"kaynak_kodu": "SRC-021", "yazar": "İbn Rüşd el-Endelüsî (ö.595/1198)", "oncelik": 7},
    "04_IbnRusd_Serhu-Ercuze.docx":         {"kaynak_kodu": "SRC-021", "yazar": "İbn Rüşd el-Endelüsî (ö.595/1198)", "oncelik": 7},
    "05_Antaki_Selase-Resail.docx":          {"kaynak_kodu": "SRC-008", "yazar": "Dâvûd el-Antâkî (ö.1008/1599)", "oncelik": 7},
    "06_Antaki_Nüzhetül-Ezhan.docx":        {"kaynak_kodu": "SRC-008", "yazar": "Dâvûd el-Antâkî (ö.1008/1599)", "oncelik": 7},
    "07_Antaki_Bugyetül-Muhtac.docx":       {"kaynak_kodu": "SRC-008", "yazar": "Dâvûd el-Antâkî (ö.1008/1599)", "oncelik": 7},
    "08_Calinus_Semane-Kütüb.docx":          {"kaynak_kodu": "GAL1", "yazar": "Galenos (Huneyn b. İshak trc.)", "oncelik": 6},
    "09_Calinus_es-Sinaatüs-Sagira.docx":   {"kaynak_kodu": "GAL1", "yazar": "Galenos (Huneyn b. İshak trc.)", "oncelik": 6},
    "10_Calinus_ila-Glukon.docx":            {"kaynak_kodu": "GAL1", "yazar": "Galenos (Huneyn b. İshak trc.)", "oncelik": 6},
    "11_Calinus_Ferkut-Tib.docx":            {"kaynak_kodu": "GAL1", "yazar": "Galenos (Huneyn b. İshak trc.)", "oncelik": 6},
}

# ── Supabase bağlantısı ─────────────────────────────
load_dotenv(Path(__file__).resolve().parent.parent / ".env.local")

sb = create_client(
    os.environ["NEXT_PUBLIC_SUPABASE_URL"],
    os.environ["SUPABASE_SERVICE_ROLE_KEY"],
)
sb.postgrest.session = httpx.Client(
    base_url=f"{os.environ['NEXT_PUBLIC_SUPABASE_URL']}/rest/v1",
    headers=sb.postgrest.session.headers,
    http2=False,
    timeout=httpx.Timeout(60.0),
)


def docx_to_text(path: Path) -> str:
    doc = Document(str(path))
    return "\n".join(p.text for p in doc.paragraphs if p.text.strip())


def chunk_text(text: str) -> list[str]:
    words = text.split()
    chunks = []
    start = 0
    while start < len(words):
        end = start + CHUNK_SIZE
        chunk = " ".join(words[start:end])
        if chunk.strip():
            chunks.append(chunk)
        start += CHUNK_SIZE - OVERLAP
    return chunks


def kitap_adi_from_filename(filename: str) -> str:
    """'03_IbnRusd_Telhisat-Calinus.docx' -> 'Telhisat-Calinus'"""
    name = Path(filename).stem
    # Numara ve yazar prefixini kaldır: 01_IbnRusd_, 05_Antaki_, 08_Calinus_
    name = re.sub(r'^\d+_[^_]+_', '', name)
    return name.replace('_', ' ')


def upload_batch(rows: list[dict]) -> int:
    uploaded = 0
    for i in range(0, len(rows), BATCH_SIZE):
        batch = rows[i : i + BATCH_SIZE]
        for attempt in range(1, MAX_RETRIES + 1):
            try:
                resp = sb.table("klasik_kaynaklar").insert(batch).execute()
                uploaded += len(resp.data)
                print(f"  -> {uploaded}/{len(rows)} satır yüklendi")
                break
            except Exception as e:
                if attempt < MAX_RETRIES:
                    print(f"  [!] Hata (deneme {attempt}/{MAX_RETRIES}): {e}")
                    time.sleep(2 * attempt)
                else:
                    raise
    return uploaded


def main():
    toplam = 0

    for filename, meta in DOSYA_META.items():
        filepath = SRC_DIR / filename
        if not filepath.exists():
            print(f"[!] Bulunamadı: {filename}")
            continue

        kitap_adi = kitap_adi_from_filename(filename)

        print(f"\n── {filename} okunuyor...")
        text = docx_to_text(filepath)
        word_count = len(text.split())
        print(f"   {word_count} kelime | {meta['kaynak_kodu']} | {meta['yazar']}")

        chunks = chunk_text(text)
        print(f"   {len(chunks)} chunk oluşturuldu")

        rows = [
            {
                "kaynak_kodu": meta["kaynak_kodu"],
                "kitap_adi": kitap_adi,
                "yazar": meta["yazar"],
                "bolum": f"{kitap_adi} — Blok {i}",
                "icerik_tr": chunk,
                "oncelik": meta["oncelik"],
            }
            for i, chunk in enumerate(chunks, 1)
        ]
        uploaded = upload_batch(rows)
        toplam += uploaded

    print(f"\n{'=' * 50}")
    print(f"Toplam yüklenen: {toplam} satır")


if __name__ == "__main__":
    main()
