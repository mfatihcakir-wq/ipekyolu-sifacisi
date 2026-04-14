"""
Klasik Tıp Yazarları -> klasik_kaynaklar tablosuna yükleme
İbn Zühr, Zehrâvî, İbn Kıff, Mecûsî, Huneyn b. İshak
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

SRC_DIR = Path("/Users/fatih/Desktop/Klasik_Tip_Yazarlari")

DOSYA_META = {
    "01_IbnZuhr_el-Agziye.docx":       {"kaynak_kodu": "AGZ",     "yazar": "İbn Zühr (ö.557/1162)",                  "oncelik": 7},
    "02_IbnZuhr_et-Teysir_Cilt1.docx":  {"kaynak_kodu": "TSY",     "yazar": "İbn Zühr (ö.557/1162)",                  "oncelik": 7},
    "03_IbnZuhr_et-Teysir_Cilt2.docx":  {"kaynak_kodu": "TSY",     "yazar": "İbn Zühr (ö.557/1162)",                  "oncelik": 7},
    "04_Zehravi_el-Cerraha.docx":        {"kaynak_kodu": "ZHC",     "yazar": "Ebü'l-Kâsım ez-Zehrâvî (ö.427/1036)",   "oncelik": 7},
    "05_Zehravi_et-Tasrif_Tam.docx":     {"kaynak_kodu": "TSR",     "yazar": "Ebü'l-Kâsım ez-Zehrâvî (ö.427/1036)",   "oncelik": 7},
    "06_IbnKiff_el-Umde_Cilt1.docx":    {"kaynak_kodu": "SRC-018", "yazar": "İbn Kıff el-Mesîhî (ö.685/1286)",       "oncelik": 6},
    "07_IbnKiff_el-Umde_Cilt2.docx":    {"kaynak_kodu": "SRC-019", "yazar": "İbn Kıff el-Mesîhî (ö.685/1286)",       "oncelik": 6},
    "08_Mecusi_el-Kahhale.docx":         {"kaynak_kodu": "MCU",     "yazar": "Ali b. Abbas el-Mecûsî (ö.384/994)",    "oncelik": 7},
    "09_Mecusi_Kamil_Cilt1.docx":        {"kaynak_kodu": "MCU",     "yazar": "Ali b. Abbas el-Mecûsî (ö.384/994)",    "oncelik": 7},
    "10_Mecusi_Kamil_Cilt2.docx":        {"kaynak_kodu": "MCU",     "yazar": "Ali b. Abbas el-Mecûsî (ö.384/994)",    "oncelik": 7},
    "11_Huneyn_el-Mevludin.docx":        {"kaynak_kodu": "HUN",     "yazar": "Huneyn b. İshak (ö.260/873)",           "oncelik": 6},
    "12_Huneyn_Dis-Sagligı.docx":        {"kaynak_kodu": "HUN",     "yazar": "Huneyn b. İshak (ö.260/873)",           "oncelik": 6},
    "13_Huneyn_el-Mesail.docx":          {"kaynak_kodu": "HUN",     "yazar": "Huneyn b. İshak (ö.260/873)",           "oncelik": 6},
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
    """'02_IbnZuhr_et-Teysir_Cilt1.docx' -> 'et-Teysir Cilt1'"""
    name = Path(filename).stem
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
