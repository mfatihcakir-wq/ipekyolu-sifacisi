"""
07_dipnot_duzelt.py
Dipnot yigilma sorununu cozer.
Her dipnot, kendi numarasina en yakin tablonun TR metninde
ilgili terimin ilk gecisine yerlestirilir.
Kisa ve belirsiz terimler icin genis arama yerine
dipnot numarasina gore tablo eslestirmesi yapilir.
Girdi: razi_05.docx + fn_icerik.json
Cikti: razi_06.docx + 07_log.txt
"""

import zipfile, io, json, re, shutil
from lxml import etree

GIRIS     = "razi_05.docx"
CIKIS     = "razi_06.docx"
FN_ICERIK = "fn_icerik.json"
LOG       = "07_log.txt"
W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"

def wt(tag): return f"{{{W}}}{tag}"
def gt(el):  return "".join(t.text or "" for t in el.iter(wt("t"))).strip()

satirlar = []
def log(m): print(m); satirlar.append(m)

# ── Dosyalari ac ─────────────────────────────────────────────────────
shutil.copy(GIRIS, CIKIS)
with open(CIKIS, "rb") as f: raw = f.read()
z = zipfile.ZipFile(io.BytesIO(raw))
files = {n: z.read(n) for n in z.namelist()}
doc = etree.fromstring(files["word/document.xml"])

with open(FN_ICERIK, encoding="utf-8") as f:
    fn_icerik = json.load(f)

# ── Tum mevcut fn ref leri kaldir ────────────────────────────────────
kaldirildi = 0
for fn_ref in list(doc.findall(f".//{wt('footnoteReference')}")):
    r = fn_ref.getparent()
    if r is not None:
        rp = r.getparent()
        if rp is not None:
            rp.remove(r)
            kaldirildi += 1
log(f"Kaldirildi: {kaldirildi} fn ref")

# ── Tablo listesi ────────────────────────────────────────────────────
tbls = doc.findall(f".//{wt('tbl')}")
log(f"Tablo: {len(tbls)}")

# Her tablo icin TR metnini al
tbl_tr = []   # [(tablo_idx, tr_cell, tr_metin)]
for i, tbl in enumerate(tbls):
    rows = tbl.findall(wt("tr"))
    if not rows: continue
    cells = rows[0].findall(wt("tc"))
    if len(cells) < 2: continue
    tr_cell = cells[0]
    tbl_tr.append((i, tr_cell, gt(tr_cell)))

# ── Dipnot numarasina gore tablo bul ─────────────────────────────────
# fn 1-231 araligini 127 tabloya esit dagilimla eslesir
# fn 1 → T1 civarı, fn 231 → T127 civari
def fn_numarasina_gore_tablo(fid_int, toplam_fn, toplam_tbl):
    """Dipnot numarasini tablo indeksine donusturur."""
    idx = int((fid_int - 1) * toplam_tbl / toplam_fn)
    return max(0, min(idx, toplam_tbl - 1))

# ── Terim cikar ───────────────────────────────────────────────────────
def terim_al(fn_txt):
    m = re.match(r"^([^(:—\(\n]+?)(?:\s*[\(:—])", fn_txt)
    t = m.group(1).strip() if m else fn_txt[:30].strip()
    return re.sub(r"^(Bkz\.|bkz\.)\s*", "", t).strip()

# ── Arama terimleri uret (kisa terimleri filtrele) ────────────────────
def arama_terimleri(fn_txt):
    ter = terim_al(fn_txt).lower()
    c = set()

    # Ana terimi ekle (min 5 harf)
    if len(ter) >= 5:
        c.add(ter)

    # Kelimeleri ayri ekle (min 5 harf — kisa terimler cok eslesir)
    for k in ter.split():
        if len(k) >= 5:
            c.add(k)
            # Uzun unlu varyasyonlari
            v = k.replace("â","a").replace("î","i").replace("û","u")
            if len(v) >= 5:
                c.add(v)

    # Arapca terim (min 4 harf)
    for a in re.findall(r"[\u0600-\u06FF]{4,}", fn_txt)[:2]:
        c.add(a[:12])

    # Latince bilimsel ad
    for l in re.findall(r"\b([A-Z][a-z]{4,} [a-z]{4,})\b", fn_txt)[:1]:
        c.add(l.lower())

    # Uzundan kisaya sirala
    return sorted(c, key=len, reverse=True)

# ── Superscript fn ref olustur ───────────────────────────────────────
def yeni_fn_run(fid):
    r = etree.Element(wt("r"))
    rpr = etree.SubElement(r, wt("rPr"))
    etree.SubElement(rpr, wt("vertAlign")).set(wt("val"), "superscript")
    etree.SubElement(r, wt("footnoteReference")).set(wt("id"), fid)
    return r

# ── Hucrede terimi bul, yanina ekle ──────────────────────────────────
def ekle_yanina(cell, arama, fn_run):
    al = arama.lower()
    for para in cell.findall(f".//{wt('p')}"):
        runs = para.findall(wt("r"))
        for i, run in enumerate(runs):
            if al in gt(run).lower():
                rp = run.getparent()
                rp.insert(list(rp).index(run) + 1, fn_run)
                return True
            if i < len(runs) - 1:
                birlesik = (gt(run) + gt(runs[i+1])).lower()
                if al in birlesik:
                    rp = runs[i+1].getparent()
                    rp.insert(list(rp).index(runs[i+1]) + 1, fn_run)
                    return True
    return False

# ── Ana dongu ────────────────────────────────────────────────────────
yanina    = 0
tablo_son = 0
hata      = 0

toplam_fn  = len(fn_icerik)
toplam_tbl = len(tbl_tr)

for fid in sorted(fn_icerik, key=lambda x: int(x) if x.isdigit() else 9999):
    fn_txt   = fn_icerik[fid]
    fid_int  = int(fid) if fid.isdigit() else 1
    aramalar = arama_terimleri(fn_txt)
    fn_run   = yeni_fn_run(fid)

    # Dipnot numarasina gore hedef tablo araligini belirle
    # Her dipnot sadece kendi numarasina yakin tablolarda aranir
    # (+-10 tablo penceresi)
    hedef_idx  = fn_numarasina_gore_tablo(fid_int, toplam_fn, toplam_tbl)
    pencere_bas = max(0, hedef_idx - 10)
    pencere_bit = min(toplam_tbl, hedef_idx + 11)
    aday_tablolar = tbl_tr[pencere_bas:pencere_bit]

    yerlestirildi = False

    # Once hedef tabloda ara, sonra pencereyi genislet
    for arama in aramalar:
        if len(arama) < 4:
            continue
        for tbl_idx, tr_cell, tr_metin in aday_tablolar:
            if arama in tr_metin.lower():
                if ekle_yanina(tr_cell, arama, fn_run):
                    yanina += 1
                    yerlestirildi = True
                    log(f"  ok fn{fid:>4} T{tbl_idx+1} -> '{arama[:25]}'")
                    break
        if yerlestirildi:
            break

    if not yerlestirildi:
        # Hedef tablonun sonuna ekle
        try:
            _, tr_cell, _ = tbl_tr[hedef_idx]
            paras = tr_cell.findall(wt("p"))
            if paras:
                paras[-1].append(fn_run)
            else:
                p = etree.SubElement(tr_cell, wt("p"))
                p.append(fn_run)
            tablo_son += 1
            log(f"  ~  fn{fid:>4} T{hedef_idx+1} sonuna -> '{terim_al(fn_txt)}'")
        except Exception as e:
            hata += 1
            log(f"  ERR fn{fid}: {e}")

# ── Ozet ─────────────────────────────────────────────────────────────
toplam_ref = len(doc.findall(f".//{wt('footnoteReference')}"))
log(f"\n{'='*45}")
log(f"Yanina    : {yanina}")
log(f"Tablo sonu: {tablo_son}")
log(f"Hata      : {hata}")
log(f"Toplam ref: {toplam_ref}")

# ── Dagılım kontrolu ─────────────────────────────────────────────────
from collections import Counter
refs_per_para = Counter()
para_txt = {}
for fn_ref in doc.findall(f".//{wt('footnoteReference')}"):
    p = fn_ref.getparent()
    while p is not None:
        tag = p.tag.split("}")[1] if "}" in p.tag else p.tag
        if tag == "p": break
        p = p.getparent()
    if p is not None:
        pid = id(p)
        refs_per_para[pid] += 1
        if pid not in para_txt:
            para_txt[pid] = gt(p)[:50]

log(f"\nDagilim:")
log(f"  Max ref/para : {max(refs_per_para.values()) if refs_per_para else 0}")
log(f"  Tek ref      : {sum(1 for v in refs_per_para.values() if v == 1)}")
log(f"  2-3 ref      : {sum(1 for v in refs_per_para.values() if 2 <= v <= 3)}")
log(f"  4+ ref       : {sum(1 for v in refs_per_para.values() if v >= 4)}")
for pid, cnt in sorted(refs_per_para.items(), key=lambda x: -x[1])[:3]:
    if cnt >= 4:
        log(f"    {cnt} ref: {para_txt.get(pid,'?')}")

# ── Kaydet ───────────────────────────────────────────────────────────
files["word/document.xml"] = etree.tostring(
    doc, xml_declaration=True, encoding="UTF-8", standalone=True
)
with open(CIKIS, "wb") as out:
    with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as zout:
        for n, d in files.items(): zout.writestr(n, d)

log(f"\n✓ {CIKIS} kaydedildi")
with open(LOG, "w", encoding="utf-8") as f: f.write("\n".join(satirlar))
