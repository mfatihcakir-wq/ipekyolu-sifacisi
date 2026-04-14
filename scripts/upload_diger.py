"""
el-Hâvî Cilt 02 + Bahrü'l-Cevâhir Fasıl 11 -> klasik_kaynaklar tablosuna yükleme
"""

import os
import time
from pathlib import Path
from dotenv import load_dotenv
from docx import Document
import httpx
from supabase import create_client

# ── Ayarlar ──────────────────────────────────────────
CHUNK_SIZE = 500        # kelime
OVERLAP = 50            # kelime
BATCH_SIZE = 50
MAX_RETRIES = 3

DOSYALAR = [
    {
        "path": Path("/Users/fatih/Downloads/Havi_Cilt02.docx"),
        "kaynak_kodu": "SRC-010",
        "kitap_adi": "el-Hâvî fi't-Tıb",
        "yazar": "Ebû Bekr er-Râzî (ö.313/925)",
        "bolum_prefix": "el-Hâvî — Cilt 02 — Blok",
        "oncelik": 8,
    },
    {
        "path": Path("/Users/fatih/Downloads/BahrulCevahir_Fas11_s149-163.docx"),
        "kaynak_kodu": "BHR",
        "kitap_adi": "Bahrü'l-Cevâhir fi't-Tıb",
        "yazar": "Muhammed b. Yûsuf el-Herevî (16.yy)",
        "bolum_prefix": "Bahrü'l-Cevâhir — Fasıl 11 — Blok",
        "oncelik": 7,
    },
]

# ── Supabase bağlantısı ─────────────────────────────
load_dotenv(Path(__file__).resolve().parent.parent / ".env.local")

SUPABASE_URL = os.environ["NEXT_PUBLIC_SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]

sb = create_client(SUPABASE_URL, SUPABASE_KEY)

# Python 3.9 LibreSSL + HTTP/2 SSL hatası önlemi
sb.postgrest.session = httpx.Client(
    base_url=f"{SUPABASE_URL}/rest/v1",
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


def build_rows(meta: dict, chunks: list[str]) -> list[dict]:
    return [
        {
            "kaynak_kodu": meta["kaynak_kodu"],
            "kitap_adi": meta["kitap_adi"],
            "yazar": meta["yazar"],
            "bolum": f"{meta['bolum_prefix']} {i}",
            "icerik_tr": chunk,
            "oncelik": meta["oncelik"],
        }
        for i, chunk in enumerate(chunks, 1)
    ]


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

    for meta in DOSYALAR:
        filepath = meta["path"]
        if not filepath.exists():
            print(f"[!] Bulunamadı: {filepath}")
            continue

        print(f"\n── {filepath.name} okunuyor...")
        text = docx_to_text(filepath)
        word_count = len(text.split())
        print(f"   {word_count} kelime bulundu")

        chunks = chunk_text(text)
        print(f"   {len(chunks)} chunk oluşturuldu")

        rows = build_rows(meta, chunks)
        uploaded = upload_batch(rows)
        toplam += uploaded

    print(f"\n{'='*50}")
    print(f"Toplam yüklenen: {toplam} satır")


if __name__ == "__main__":
    main()
