"""
el-Hâvî Cilt 01,03-07 + Râzî Kitapları -> klasik_kaynaklar tablosuna yükleme
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

YAZAR = "Ebû Bekr er-Râzî (ö.313/925)"

HAVI_DIR = Path("/Users/fatih/Desktop/Toplanan_havi_20260316_015037/Havi_Ciltler")
HAVI_CILTLER = [1, 3, 4, 5, 6, 7]  # Cilt02 zaten yüklü

RAZI_DIR = Path("/Users/fatih/Desktop/Razi_Kitaplar")

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


def process_file(filepath: Path, kaynak_kodu: str, kitap_adi: str, bolum_prefix: str, oncelik: int) -> int:
    if not filepath.exists():
        print(f"[!] Bulunamadı: {filepath.name}")
        return 0

    print(f"\n── {filepath.name} okunuyor...")
    text = docx_to_text(filepath)
    word_count = len(text.split())
    print(f"   {word_count} kelime bulundu")

    chunks = chunk_text(text)
    print(f"   {len(chunks)} chunk oluşturuldu")

    rows = [
        {
            "kaynak_kodu": kaynak_kodu,
            "kitap_adi": kitap_adi,
            "yazar": YAZAR,
            "bolum": f"{bolum_prefix} {i}",
            "icerik_tr": chunk,
            "oncelik": oncelik,
        }
        for i, chunk in enumerate(chunks, 1)
    ]
    return upload_batch(rows)


def kitap_adi_from_filename(filename: str) -> str:
    """'03_Hastalıkların_Tasnifi.docx' -> 'Hastalıkların Tasnifi'"""
    name = Path(filename).stem
    name = re.sub(r'^\d+_', '', name)
    return name.replace('_', ' ')


def main():
    toplam = 0

    # ── 1. el-Hâvî ciltleri ─────────────────────────
    print("=" * 50)
    print("el-Hâvî fi't-Tıb ciltleri")
    print("=" * 50)

    for cilt in HAVI_CILTLER:
        filepath = HAVI_DIR / f"Havi_Cilt{cilt:02d}.docx"
        toplam += process_file(
            filepath,
            kaynak_kodu="SRC-010",
            kitap_adi="el-Hâvî fi't-Tıb",
            bolum_prefix=f"el-Hâvî — Cilt {cilt:02d} — Blok",
            oncelik=8,
        )

    # ── 2. Râzî kitapları ────────────────────────────
    print(f"\n{'=' * 50}")
    print("Râzî Kitapları")
    print("=" * 50)

    for filepath in sorted(RAZI_DIR.glob("*.docx")):
        adi = kitap_adi_from_filename(filepath.name)
        toplam += process_file(
            filepath,
            kaynak_kodu="SRC-011",
            kitap_adi=adi,
            bolum_prefix=f"{adi} — Blok",
            oncelik=7,
        )

    print(f"\n{'=' * 50}")
    print(f"Toplam yüklenen: {toplam} satır")


if __name__ == "__main__":
    main()
