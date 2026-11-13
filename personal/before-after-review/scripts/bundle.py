#!/usr/bin/env python3
"""Check a before-after review page and make a one-file copy that can be sent to anyone.

Usage: python3 bundle.py path/to/index.html

1. Checks the page: every local image exists, no template text is left over,
   every card has an ID, a decision block named after that ID, and a legend
   line for each numbered callout.
2. Writes index.standalone.html next to it, with every local image inlined as
   a data URI, so the single file shows everything on another machine.

Prints one line per problem, then PASS or FAIL. Exit 1 on FAIL; the standalone
file is written only on PASS. Stdlib only.
"""
import base64
import mimetypes
import re
import sys
from pathlib import Path

LEFTOVER = [
    "SCOPE", "VERDICT SENTENCE", "TITLE OF THE", "WHAT IS WRONG HERE", "WHAT IS DIFFERENT NOW",
    "THE EXACT CHANGE", "INPUT OR STATE", "JOB OUTCOME", "path/to/file", "YYYY-MM-DD",
    ". SCREEN", ": SCREEN", "(ROLE)", ">ROLE<", "TOP JOBS", "Pattern N:", "WHAT CHANGES THERE",
]


def main(page: Path) -> int:
    html = page.read_text(encoding="utf-8")
    errors = []

    body = html.split("<body", 1)[-1]
    for word in LEFTOVER:
        if word in body:
            errors.append(f'template text left in the page: "{word}"')

    cards = re.findall(r'<section class="card"(.*?)</section>', html, flags=re.S)
    if not cards:
        errors.append("no finding cards")
    ids = []
    for card in cards:
        m = re.search(r'\bid="([^"]+)"', card.split(">", 1)[0])
        cid = m.group(1) if m else None
        if not cid:
            errors.append("a card has no id")
            continue
        ids.append(cid)
        if f'name="decide-{cid}"' not in card:
            errors.append(f"{cid}: no decision block named decide-{cid}")
        for pane in re.findall(r'<div class="pane (?:before|after)">(.*?)(?=<div class="pane |<div class="notes"|<div class="arrow")', card, flags=re.S):
            marks = set(re.findall(r'class="mark"[^>]*data-n="(\d+)"', pane))
            legend = set(re.findall(r"<li><b>(\d+)</b>", pane))
            for n in sorted(marks - legend, key=int):
                errors.append(f"{cid}: callout {n} has no legend line")
    for dup in sorted({i for i in ids if ids.count(i) > 1}):
        errors.append(f"duplicate card id {dup}")

    def inline(match):
        src = match.group(2)
        if re.match(r"^(data:|https?:|//)", src):
            if not src.startswith("data:"):
                errors.append(f"remote image (the page must work offline): {src}")
            return match.group(0)
        path = (page.parent / src).resolve()
        if not path.is_file():
            errors.append(f"image not found: {src}")
            return match.group(0)
        mime = mimetypes.guess_type(path.name)[0] or "application/octet-stream"
        data = base64.b64encode(path.read_bytes()).decode("ascii")
        return f'{match.group(1)}data:{mime};base64,{data}{match.group(3)}'

    bundled = re.sub(r'(<img\b[^>]*?\bsrc=")([^"]+)(")', inline, html)

    for e in errors:
        print("ERROR", e)
    if errors:
        print("FAIL")
        return 1
    out = page.with_name(page.stem + ".standalone.html")
    out.write_text(bundled, encoding="utf-8")
    print(f"cards={len(ids)} ({', '.join(ids)}) · wrote {out} ({out.stat().st_size // 1024} KB)")
    print("PASS")
    return 0


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    sys.exit(main(Path(sys.argv[1])))
