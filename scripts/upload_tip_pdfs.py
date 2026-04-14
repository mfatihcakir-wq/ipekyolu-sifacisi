"""
Osmanlı Tıp PDF'leri -> klasik_kaynaklar tablosuna yükleme

1. /Users/fatih/Desktop/tıp altındaki tüm PDF'leri bulur
2. İlk sayfa metni > 200 karakter olanları "makine okunur" kabul eder
3. Taranmış (OCR gerekli) PDF'leri atlar
4. Metin çıkarır, chunk'lar, Supabase'e yükler
"""

import os
import time
from pathlib import Path
from dotenv import load_dotenv
import pdfplumber
import httpx
from supabase import create_client

# ── Ayarlar ──────────────────────────────────────────
PDF_DIR = Path("/Users/fatih/Desktop/tıp")
CHUNK_SIZE = 500
OVERLAP = 50
BATCH_SIZE = 50
MAX_RETRIES = 3
MIN_FIRST_PAGE_CHARS = 200   # Makine okunur eşiği

KAYNAK_KODU = "SRC-022"
YAZAR = "Osmanlı Tıp Kaynakları"
ONCELIK = 5

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
    timeout=httpx.Timeout(120.0),
)


def ilk_sayfa_karakter(path: Path) -> int:
    """İlk sayfanın metin karakter sayısını döndür."""
    try:
        with pdfplumber.open(path) as f:
            if not f.pages:
                return 0
            text = f.pages[0].extract_text() or ""
            return len(text.strip())
    except Exception:
        return -1


def pdf_to_text(path: Path) -> str:
    """Tüm sayfalardan metin çıkar."""
    parts = []
    with pdfplumber.open(path) as f:
        for pg in f.pages:
            try:
                t = pg.extract_text() or ""
                if t.strip():
                    parts.append(t)
            except Exception:
                continue
    return "\n".join(parts)


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
                break
            except Exception as e:
                if attempt < MAX_RETRIES:
                    print(f"    [!] Hata (deneme {attempt}/{MAX_RETRIES}): {str(e)[:100]}", flush=True)
                    time.sleep(2 * attempt)
                else:
                    raise
    return uploaded


def main():
    # ── 1. Tüm PDF'leri bul ──────────────────────────
    pdfler = sorted(PDF_DIR.rglob("*.pdf"))
    print(f"Toplam PDF: {len(pdfler)}", flush=True)

    makine_okunur = 0
    taranmis      = 0
    hatali        = 0
    islenen       = 0
    toplam_chunk  = 0

    # ── 2-5. Her PDF için tara, çıkar, yükle ─────────
    for idx, path in enumerate(pdfler, 1):
        isim = path.name
        chars = ilk_sayfa_karakter(path)

        if chars < 0:
            hatali += 1
            print(f"[{idx}/{len(pdfler)}] HATA    {isim[:70]}", flush=True)
            continue
        if chars < MIN_FIRST_PAGE_CHARS:
            taranmis += 1
            # Taranmış olanları sessiz geç
            continue

        makine_okunur += 1
        print(f"[{idx}/{len(pdfler)}] OKUNUR  {isim[:70]}", flush=True)

        try:
            text = pdf_to_text(path)
        except Exception as e:
            hatali += 1
            print(f"    [!] Metin çıkarma hatası: {str(e)[:100]}", flush=True)
            continue

        word_count = len(text.split())
        chunks = chunk_text(text)

        if not chunks:
            print(f"    [!] Chunk yok, atla", flush=True)
            continue

        kitap_adi = path.stem
        rows = [
            {
                "kaynak_kodu": KAYNAK_KODU,
                "kitap_adi": kitap_adi,
                "yazar": YAZAR,
                "bolum": f"{kitap_adi} — Blok {i}",
                "icerik_tr": chunk,
                "oncelik": ONCELIK,
            }
            for i, chunk in enumerate(chunks, 1)
        ]

        try:
            uploaded = upload_batch(rows)
            toplam_chunk += uploaded
            islenen += 1
            print(f"    {word_count} kelime → {len(chunks)} chunk → {uploaded} yüklendi", flush=True)
        except Exception as e:
            hatali += 1
            print(f"    [!] Yükleme hatası: {str(e)[:150]}", flush=True)

    # ── 6. Özet ──────────────────────────────────────
    print(f"\n{'=' * 60}", flush=True)
    print(f"Toplam PDF         : {len(pdfler)}", flush=True)
    print(f"Makine okunur      : {makine_okunur}", flush=True)
    print(f"Taranmış (atlandı) : {taranmis}", flush=True)
    print(f"Hatalı             : {hatali}", flush=True)
    print(f"Başarıyla işlenen  : {islenen}", flush=True)
    print(f"Toplam chunk yüklendi: {toplam_chunk}", flush=True)


if __name__ == "__main__":
    main()
