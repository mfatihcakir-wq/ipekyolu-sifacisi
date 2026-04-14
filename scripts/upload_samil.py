"""
el-Şâmil DOCX -> klasik_kaynaklar tablosuna yükleme scripti
Ciltler: 10,11,12,13,14,16-30
"""

import os
import time
from pathlib import Path
from dotenv import load_dotenv
from docx import Document
import httpx
from supabase import create_client

# ── Ayarlar ──────────────────────────────────────────
DOCX_DIR = Path("/Users/fatih/Desktop/IbnNefis_Kitaplar")
CHUNK_SIZE = 500        # kelime
OVERLAP = 50            # kelime
BATCH_SIZE = 10

KAYNAK_KODU = "SRC-006"
YAZAR = "İbn Nefîs"
ONCELIK = 7

# Hedef ciltler: 10-14 ve 16-30 (15 haric)
HEDEF_CILTLER = list(range(10, 15)) + list(range(16, 31))

# ── Supabase bağlantısı ─────────────────────────────
load_dotenv(Path(__file__).resolve().parent.parent / ".env.local")

SUPABASE_URL = os.environ["NEXT_PUBLIC_SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]

sb = create_client(SUPABASE_URL, SUPABASE_KEY)

# postgrest client'ın HTTP/2 yerine HTTP/1.1 kullanmasını zorla
# Python 3.9 LibreSSL + HTTP/2 SSL hatası önlemi
sb.postgrest.session = httpx.Client(
    base_url=f"{SUPABASE_URL}/rest/v1",
    headers=sb.postgrest.session.headers,
    http2=False,
    timeout=httpx.Timeout(60.0),
)

MAX_RETRIES = 3


def docx_to_text(path: Path) -> str:
    """DOCX dosyasından düz metin çıkar."""
    doc = Document(str(path))
    return "\n".join(p.text for p in doc.paragraphs if p.text.strip())


def chunk_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = OVERLAP) -> list[str]:
    """Metni kelime bazlı chunk'lara böl."""
    words = text.split()
    chunks = []
    start = 0
    while start < len(words):
        end = start + chunk_size
        chunk = " ".join(words[start:end])
        if chunk.strip():
            chunks.append(chunk)
        start += chunk_size - overlap
    return chunks


def build_rows(cilt_no: int, chunks: list[str]) -> list[dict]:
    """Chunk'lardan Supabase satırları oluştur."""
    rows = []
    for i, chunk in enumerate(chunks, 1):
        rows.append({
            "kaynak_kodu": KAYNAK_KODU,
            "kitap_adi": f"eş-Şâmil Cilt {cilt_no}",
            "yazar": YAZAR,
            "bolum": f"Cilt {cilt_no} / Parça {i}",
            "icerik_tr": chunk,
            "oncelik": ONCELIK,
        })
    return rows


def upload_batch(rows: list[dict]) -> int:
    """Satırları batch halinde yükle, toplam yüklenen sayısını döndür."""
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

    for cilt in HEDEF_CILTLER:
        filename = f"{cilt:02d}_el-Samil_Cilt{cilt:02d}.docx"
        filepath = DOCX_DIR / filename

        if not filepath.exists():
            print(f"[!] Bulunamadı: {filename}")
            continue

        print(f"\n── {filename} okunuyor...")
        text = docx_to_text(filepath)
        word_count = len(text.split())
        print(f"   {word_count} kelime bulundu")

        chunks = chunk_text(text)
        print(f"   {len(chunks)} chunk oluşturuldu")

        rows = build_rows(cilt, chunks)
        uploaded = upload_batch(rows)
        toplam += uploaded

    print(f"\n{'='*50}")
    print(f"Toplam yüklenen: {toplam} satır")


if __name__ == "__main__":
    main()
