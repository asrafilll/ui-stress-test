/*
 * pixel-contrast.mjs: measure contrast for text that dom-audit.js could not
 * (status "needs-pixel-check": gradients, images, translucency, filters).
 *
 * Playwright only. Run dom-audit.js first on the same page and pass its
 * contrast items; each carries a `uid` that dom-audit wrote to the element as
 * data-uist, so this module can find it again.
 *
 *   import { pixelContrast } from '<skill-dir>/scripts/pixel-contrast.mjs';
 *   const audit = await page.evaluate(domAuditSource);
 *   const measured = await pixelContrast(page, audit.contrast);
 *
 * For each item it scrolls the element into view, makes its own text
 * transparent, screenshots the box around its rendered text lines (not the
 * element's whole box), and restores the text. The
 * background pixels left in the shot are compared with the text colour.
 * It reports the ratio against the darkest and lightest 5% of background
 * pixels and judges on the worse of the two.
 *
 * Returns [{ uid, text, fg, bgDark, bgLight, ratio, required, status: "pass" | "fail" | "skipped", reason }].
 * A sticky header or overlay covering the element ends up in the shot: such
 * items come back "skipped" with reason "covered", and need a look by eye.
 */
export async function pixelContrast(page, items, { max = 40 } = {}) {
  const out = [];
  for (const item of items.filter((i) => i.status === 'needs-pixel-check' && i.uid).slice(0, max)) {
    const prep = await page.evaluate((uid) => {
      const el = document.querySelector(`[data-uist="${uid}"]`);
      if (!el) return { reason: 'element gone (re-run dom-audit)' };
      el.scrollIntoView({ block: 'center', inline: 'nearest' });
      // Clip to the rendered text lines, not the element's box: a block's box can
      // run under unrelated pictures (a mascot, a photo) that aren't behind the text.
      const range = document.createRange();
      const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      let L = Infinity, T = Infinity, R = -Infinity, B = -Infinity;
      for (let t = w.nextNode(); t; t = w.nextNode()) {
        if (!t.textContent.trim()) continue;
        range.selectNodeContents(t);
        for (const q of range.getClientRects()) { L = Math.min(L, q.left); T = Math.min(T, q.top); R = Math.max(R, q.right); B = Math.max(B, q.bottom); }
      }
      if (!(R > L && B > T)) return { reason: 'not visible' };
      const pad = 2;
      const r = { left: L - pad, top: T - pad, width: R - L + 2 * pad, height: B - T + 2 * pad };
      const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      if (top && top !== el && !el.contains(top) && !top.contains(el)) return { reason: 'covered' };
      const fg = getComputedStyle(el).color; // read before the text is hidden below
      const keep = el.getAttribute('style');
      el.dataset.uistStyle = keep === null ? '\u0000' : keep;
      for (const [k, v] of [['transition', 'none'], ['color', 'transparent'], ['-webkit-text-fill-color', 'transparent'], ['text-shadow', 'none'], ['caret-color', 'transparent']]) {
        el.style.setProperty(k, v, 'important');
      }
      const x = Math.max(0, r.left), y = Math.max(0, r.top);
      return { fg, clip: { x, y, width: Math.min(r.left + r.width, innerWidth) - x, height: Math.min(r.top + r.height, innerHeight) - y } };
    }, item.uid);
    if (prep.reason) { out.push({ uid: item.uid, text: item.text, status: 'skipped', reason: prep.reason }); continue; }

    let png;
    try {
      png = (await page.screenshot({ clip: prep.clip, animations: 'disabled' })).toString('base64');
    } finally {
      await page.evaluate((uid) => {
        const el = document.querySelector(`[data-uist="${uid}"]`);
        if (!el) return;
        const keep = el.dataset.uistStyle;
        if (keep === '\u0000') el.removeAttribute('style'); else el.setAttribute('style', keep);
        delete el.dataset.uistStyle;
      }, item.uid);
    }

    const m = await page.evaluate(async ({ png, fg }) => {
      const img = new Image();
      img.src = 'data:image/png;base64,' + png;
      await img.decode();
      const cv = document.createElement('canvas');
      cv.width = img.naturalWidth; cv.height = img.naturalHeight;
      const cx = cv.getContext('2d', { willReadFrequently: true });
      cx.drawImage(img, 0, 0);
      const d = cx.getImageData(0, 0, cv.width, cv.height).data;
      // text colour -> rgba via canvas, so any CSS colour syntax works
      cx.clearRect(0, 0, 1, 1); cx.fillStyle = '#000'; cx.fillStyle = fg; cx.fillRect(0, 0, 1, 1);
      const f = cx.getImageData(0, 0, 1, 1).data;
      const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
      const lum = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
      const px = [];
      const step = Math.max(1, Math.floor((d.length / 4) / 20000)); // sample at most ~20k pixels
      for (let i = 0; i < d.length; i += 4 * step) px.push([lum(d[i], d[i + 1], d[i + 2]), d[i], d[i + 1], d[i + 2]]);
      px.sort((a, b) => a[0] - b[0]);
      const pick = (q) => px[Math.min(px.length - 1, Math.floor(q * (px.length - 1)))];
      const dark = pick(0.05), light = pick(0.95);
      // a translucent text colour is blended over each background before comparing
      const fa = f[3] / 255;
      const blend = (bg) => [0, 1, 2].map((k) => f[k] * fa + bg[k + 1] * (1 - fa));
      const ratio = (bg) => { const t = blend(bg); const a = lum(...t), b = bg[0]; const [x, y] = a > b ? [a, b] : [b, a]; return (x + 0.05) / (y + 0.05); };
      const hex = (bg) => '#' + bg.slice(1).map((v) => v.toString(16).padStart(2, '0')).join('');
      return { fg: '#' + [f[0], f[1], f[2]].map((v) => v.toString(16).padStart(2, '0')).join(''), bgDark: hex(dark), bgLight: hex(light), ratio: Math.round(Math.min(ratio(dark), ratio(light)) * 100) / 100 };
    }, { png, fg: prep.fg });

    out.push({ uid: item.uid, text: item.text, ...m, required: item.required, status: m.ratio >= item.required ? 'pass' : 'fail', reason: null });
  }
  return out;
}
