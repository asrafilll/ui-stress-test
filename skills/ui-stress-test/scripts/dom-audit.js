/*
 * dom-audit.js: deterministic L5 element checks for the current page.
 *
 * Inject as an expression (Playwright: page.evaluate(source); DevTools or an
 * in-app preview: evaluate the file's contents). Returns a JSON-serialisable object:
 *
 * {
 *   page:      { url, title, viewport: {w, h, dpr}, scrollWidth, horizontalScroll },
 *   summary:   { targetsChecked, targetsFailAA, targetsBelowTouch, textChecked,
 *                contrastFail, contrastNeedsPixelCheck, contrastFromAncestors, smallText, overflow,
 *                unnamedControls, placeholderOnlyLabels, imagesNoAlt, headingIssues },
 *   targets:   [{ sel, text, w, h, level: "fail-aa" | "below-touch", spacingException: true | false | null }],
 *   contrast:  [{ uid, sel, text, fg, bg, ratio, required, large, status: "fail" | "needs-pixel-check", reason, method }],
 *   smallText: [{ sel, text, px }],
 *   overflow:  [{ sel, text, kind: "visible-overflow" | "text-clipped", by }],
 *   names:     [{ sel, tag, issue: "no-name" | "placeholder-only" | "img-no-alt" }],
 *   headings:  { outline: [{ level, text }], issues: [string] },
 *   landmarks: { main, nav, header, footer }
 * }
 *
 * Thresholds: WCAG 2.2 AA. Target size 24px (2.5.8) and 44px advisory for touch.
 * Contrast 4.5:1 normal text, 3:1 large text (>= 24px, or >= 18.66px at weight >= 700).
 * Contrast is computed only when the background under the text is a stack of
 * solid colours. Gradients, images, video, canvas, opacity, filters and blend
 * modes are reported as "needs-pixel-check". Each contrast item carries a `uid`
 * that is also written to the element as `data-uist`, so scripts/pixel-contrast.mjs
 * can find it again and measure it from a screenshot.
 *
 * Target size counts the effective hit area: the element's box plus any
 * absolutely positioned ::before/::after on it (the common "invisible 44px hit
 * area" pattern, including a centred translate). w and h report that effective size.
 *
 * Text outside the viewport can't be hit-tested, so its background is read from
 * its ancestors only (method "ancestors"); a background painted by a positioned
 * sibling is missed there. For a full-page audit, set the viewport height to the
 * page height first (see SKILL.md Step 3). summary.contrastFromAncestors counts them.
 */
(() => {
  const MAX = 60; // max items per list
  const TARGET_AA = 24, TARGET_TOUCH = 44, SMALL_TEXT = 12;
  const OVERFLOW_MIN = 4; // px; smaller overflow is rounding or decoration

  // ---------- helpers ----------
  const cv = document.createElement('canvas'); cv.width = cv.height = 1;
  const cx = cv.getContext('2d', { willReadFrequently: true });
  // Any CSS colour (rgb, oklch, color(), named…) -> [r,g,b,a] with a in 0..1
  const rgba = (c) => {
    if (!c || c === 'transparent') return [0, 0, 0, 0];
    cx.clearRect(0, 0, 1, 1); cx.fillStyle = '#000'; cx.fillStyle = c;
    cx.fillRect(0, 0, 1, 1);
    const d = cx.getImageData(0, 0, 1, 1).data;
    return [d[0], d[1], d[2], d[3] / 255];
  };
  const over = (top, bottom) => { // composite top over opaque-ish bottom
    const a = top[3] + bottom[3] * (1 - top[3]);
    if (a === 0) return [0, 0, 0, 0];
    const ch = (i) => (top[i] * top[3] + bottom[i] * bottom[3] * (1 - top[3])) / a;
    return [ch(0), ch(1), ch(2), a];
  };
  const lum = ([r, g, b]) => {
    const f = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
  const hex = (c) => '#' + c.slice(0, 3).map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
  const txt = (el, n = 60) => (el.innerText || el.textContent || el.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, n);
  const sel = (el) => {
    if (el.id && /^[A-Za-z][\w-]*$/.test(el.id)) return '#' + el.id;
    const parts = [];
    for (let e = el; e && e.nodeType === 1 && parts.length < 4; e = e.parentElement) {
      let p = e.tagName.toLowerCase();
      const cls = [...e.classList].filter((c) => /^[A-Za-z][\w-]{0,30}$/.test(c)).slice(0, 2);
      if (cls.length) p += '.' + cls.join('.');
      const sib = e.parentElement ? [...e.parentElement.children].filter((s) => s.tagName === e.tagName) : [];
      if (sib.length > 1) p += `:nth-of-type(${sib.indexOf(e) + 1})`;
      parts.unshift(p);
      if (e.id) break;
    }
    return parts.join(' > ');
  };
  const visible = (el) => {
    if (el.checkVisibility && !el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) return false;
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return false;
    return !el.closest('[aria-hidden="true"], [inert]');
  };
  const cs = (el) => getComputedStyle(el);

  // ---------- page ----------
  const de = document.documentElement;
  const page = {
    url: location.href, title: document.title,
    viewport: { w: innerWidth, h: innerHeight, dpr: devicePixelRatio },
    scrollWidth: de.scrollWidth, horizontalScroll: de.scrollWidth > de.clientWidth + 1,
  };

  // ---------- targets (2.5.8) ----------
  const INTERACTIVE = 'a[href], button, input:not([type=hidden]), select, textarea, summary, [role=button], [role=link], [role=checkbox], [role=radio], [role=switch], [role=tab], [role=menuitem], [role=option], [tabindex]:not([tabindex="-1"])';
  const all = [...document.querySelectorAll(INTERACTIVE)].filter(visible);
  const px = (v) => (/^-?[\d.]+px$/.test(v) ? parseFloat(v) : null);
  // Box of an absolutely positioned ::before/::after, resolved against its element
  // (its containing block when the element is positioned). Null when not a hit area.
  const pseudoBox = (el, r, which) => {
    const s = getComputedStyle(el, which);
    if (!s.content || s.content === 'none' || s.content === 'normal') return null;
    if (s.position !== 'absolute' || cs(el).position === 'static') return null;
    if (s.pointerEvents === 'none' || s.display === 'none' || s.visibility === 'hidden') return null;
    // Only a pure translate is resolved (e.g. the centred translate(-50%,-50%) hit area).
    let tx = 0, ty = 0;
    if (s.transform && s.transform !== 'none') {
      const m = s.transform.match(/^matrix\(([^)]+)\)$/);
      const v = m && m[1].split(',').map(Number);
      if (!v || v[0] !== 1 || v[1] !== 0 || v[2] !== 0 || v[3] !== 1) return null;
      tx = v[4]; ty = v[5];
    }
    const axis = (start, end, size, lo, hi) => {
      const a = px(start), b = px(end), z = px(size);
      if (a !== null && b !== null) return [lo + a, hi - b];
      if (a !== null && z !== null) return [lo + a, lo + a + z];
      if (b !== null && z !== null) return [hi - b - z, hi - b];
      return null;
    };
    const x = axis(s.left, s.right, s.width, r.left, r.right);
    const y = axis(s.top, s.bottom, s.height, r.top, r.bottom);
    if (!x || !y || x[1] <= x[0] || y[1] <= y[0]) return null;
    return { left: x[0] + tx, right: x[1] + tx, top: y[0] + ty, bottom: y[1] + ty };
  };
  const hitRect = (el) => {
    const r = el.getBoundingClientRect();
    let { left, right, top, bottom } = r;
    for (const p of ['::before', '::after']) {
      const b = pseudoBox(el, r, p);
      if (b) { left = Math.min(left, b.left); right = Math.max(right, b.right); top = Math.min(top, b.top); bottom = Math.max(bottom, b.bottom); }
    }
    return { left, right, top, bottom, width: right - left, height: bottom - top };
  };
  const rects = all.map(hitRect);
  const inlineInText = (el) => {
    if (el.tagName !== 'A') return false;
    if (!cs(el).display.startsWith('inline')) return false;
    const p = el.parentElement; if (!p) return false;
    return [...p.childNodes].some((n) => n !== el && n.nodeType === 3 && n.textContent.trim().length > 3);
  };
  const targets = [];
  let targetsFailAA = 0, targetsBelowTouch = 0;
  all.forEach((el, i) => {
    const r = rects[i];
    if (el.disabled || inlineInText(el)) return;
    const w = Math.round(r.width), h = Math.round(r.height);
    if (w >= TARGET_TOUCH && h >= TARGET_TOUCH) return;
    let level = 'below-touch', spacingException = null; // null = not evaluated (target >= 24px)
    if (w < TARGET_AA || h < TARGET_AA) {
      // Spacing exception: a 24px circle centred on the target touches no other target
      const cxp = r.left + r.width / 2, cyp = r.top + r.height / 2;
      spacingException = rects.every((o, j) => {
        if (j === i || all[j].contains(el) || el.contains(all[j])) return true;
        const nx = Math.max(o.left, Math.min(cxp, o.right)), ny = Math.max(o.top, Math.min(cyp, o.bottom));
        return Math.hypot(cxp - nx, cyp - ny) >= TARGET_AA / 2;
      });
      if (!spacingException) { level = 'fail-aa'; targetsFailAA++; }
    }
    if (level === 'below-touch') targetsBelowTouch++;
    if (targets.length < MAX) targets.push({ sel: sel(el), text: txt(el, 40), w, h, level, spacingException });
  });
  targets.sort((a, b) => (a.level === 'fail-aa' ? -1 : 1) - (b.level === 'fail-aa' ? -1 : 1));

  // ---------- text: contrast, small text ----------
  const textEls = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => (n.textContent.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT),
  });
  const seen = new Set();
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const el = n.parentElement;
    if (!el || seen.has(el) || /^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE|OPTION)$/.test(el.tagName)) continue;
    seen.add(el);
    if (visible(el)) textEls.push(el);
  }
  const root = rgba(cs(de).backgroundColor)[3] ? rgba(cs(de).backgroundColor)
    : rgba(cs(document.body).backgroundColor)[3] ? rgba(cs(document.body).backgroundColor) : [255, 255, 255, 1];

  const background = (el) => {
    // Layers under the text's centre point, top-down, starting below the text element.
    const r = el.getBoundingClientRect();
    const x = Math.min(Math.max(r.left + r.width / 2, 0), innerWidth - 1);
    const y = Math.min(Math.max(r.top + Math.min(r.height, 40) / 2, 0), innerHeight - 1);
    let stack = (r.bottom > 0 && r.top < innerHeight) ? document.elementsFromPoint(x, y) : [];
    let idx = stack.indexOf(el), method = 'hit-test';
    if (idx < 0) { // not hit-testable (offscreen, pointer-events:none): fall back to ancestors
      stack = []; for (let e = el; e; e = e.parentElement) stack.push(e); idx = 0; method = 'ancestors';
    }
    const layers = [];
    for (let i = idx; i < stack.length; i++) {
      const e = stack[i], s = cs(e);
      if (i > idx && /^(IMG|VIDEO|CANVAS|PICTURE|IFRAME|OBJECT|EMBED)$/.test(e.tagName)) return { reason: 'media under text: ' + e.tagName.toLowerCase() };
      if (s.backgroundImage && s.backgroundImage !== 'none') return { reason: 'background-image/gradient on ' + sel(e) };
      if (parseFloat(s.opacity) < 1) return { reason: 'opacity < 1 on ' + sel(e) };
      if (s.filter !== 'none' || s.backdropFilter && s.backdropFilter !== 'none' || s.mixBlendMode !== 'normal') return { reason: 'filter/blend on ' + sel(e) };
      const c = rgba(s.backgroundColor);
      if (c[3] > 0) { layers.push(c); if (c[3] >= 1) break; }
    }
    for (let e = el.parentElement; e; e = e.parentElement) { // opacity on ancestors also changes the text colour
      if (parseFloat(cs(e).opacity) < 1) return { reason: 'opacity < 1 on ancestor ' + sel(e) };
    }
    let bg = layers.length && layers[layers.length - 1][3] >= 1 ? layers.pop() : root;
    while (layers.length) bg = over(layers.pop(), bg);
    return { bg, method };
  };

  const contrast = [], smallText = [];
  let contrastFail = 0, needsPixel = 0, smallCount = 0, fromAncestors = 0, uidN = 0;
  const tag = (el) => { const id = 'c' + (++uidN); el.setAttribute('data-uist', id); return id; };
  document.querySelectorAll('[data-uist]').forEach((e) => e.removeAttribute('data-uist')); // ids from an earlier run
  for (const el of textEls) {
    const s = cs(el);
    const fontPx = parseFloat(s.fontSize), weight = parseInt(s.fontWeight, 10) || 400;
    if (fontPx < SMALL_TEXT) { smallCount++; if (smallText.length < MAX) smallText.push({ sel: sel(el), text: txt(el, 40), px: fontPx }); }
    if (el.closest(':disabled, [aria-disabled="true"]')) continue; // inactive UI is exempt (1.4.3)
    const large = fontPx >= 24 || (fontPx >= 18.66 && weight >= 700);
    const required = large ? 3 : 4.5;
    const b = background(el);
    const fgRaw = rgba(s.color);
    if (b.reason) {
      needsPixel++;
      if (contrast.length < MAX) contrast.push({ uid: tag(el), sel: sel(el), text: txt(el, 40), fg: hex(fgRaw), bg: null, ratio: null, required, large, status: 'needs-pixel-check', reason: b.reason, method: null });
      continue;
    }
    if (b.method === 'ancestors') fromAncestors++;
    const fg = fgRaw[3] < 1 ? over(fgRaw, b.bg) : fgRaw;
    const rt = Math.round(ratio(fg, b.bg) * 100) / 100;
    if (rt < required) {
      contrastFail++;
      if (contrast.length < MAX) contrast.push({ uid: tag(el), sel: sel(el), text: txt(el, 40), fg: hex(fg), bg: hex(b.bg), ratio: rt, required, large, status: 'fail', reason: null, method: b.method });
    }
  }
  contrast.sort((a, b) => (a.status === 'fail' ? -1 : 1) - (b.status === 'fail' ? -1 : 1));

  // ---------- overflow ----------
  // Text whose rendered lines reach past the element's own box by more than OVERFLOW_MIN.
  const textPastBox = (el, box) => {
    const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const range = document.createRange();
    let worst = 0, n = 0;
    for (let t = w.nextNode(); t && n < 200; t = w.nextNode(), n++) {
      if (!t.textContent.trim()) continue;
      range.selectNodeContents(t);
      for (const q of range.getClientRects()) {
        worst = Math.max(worst, q.right - box.right, box.left - q.left);
      }
    }
    return worst;
  };
  const overflow = [];
  let overflowCount = 0;
  for (const el of document.body.querySelectorAll('*')) {
    if (overflow.length >= MAX) break;
    if (/^(HTML|BODY|SCRIPT|STYLE|SVG|PATH)$/i.test(el.tagName) || !visible(el)) continue;
    const by = el.scrollWidth - el.clientWidth;
    if (by <= OVERFLOW_MIN || el.clientWidth === 0) continue;
    const s = cs(el);
    if (s.overflowX === 'auto' || s.overflowX === 'scroll') continue; // intended scroller
    if (s.overflowX === 'visible') {
      // Real content past the box (text or a child element); pseudo-element hit areas don't count.
      const box = el.getBoundingClientRect();
      let past = textPastBox(el, box);
      for (const c of el.children) { const q = c.getBoundingClientRect(); if (q.width) past = Math.max(past, q.right - box.right, box.left - q.left); }
      past = Math.round(past);
      if (past > OVERFLOW_MIN) { overflowCount++; overflow.push({ sel: sel(el), text: txt(el, 40), kind: 'visible-overflow', by: past }); }
    } else if (s.textOverflow !== 'ellipsis' && !s.webkitLineClamp?.match(/\d/)) {
      // hidden / clip: only a finding when text is cut, not decoration
      const cut = Math.round(textPastBox(el, el.getBoundingClientRect()));
      if (cut > OVERFLOW_MIN) { overflowCount++; overflow.push({ sel: sel(el), text: txt(el, 40), kind: 'text-clipped', by: cut }); }
    }
  }

  // ---------- accessible names ----------
  const nameOf = (el) => {
    const lb = el.getAttribute('aria-labelledby');
    if (lb) { const t = lb.split(/\s+/).map((id) => document.getElementById(id)?.textContent || '').join(' ').trim(); if (t) return t; }
    if (el.getAttribute('aria-label')?.trim()) return el.getAttribute('aria-label').trim();
    if (el.labels && [...el.labels].some((l) => l.textContent.trim())) return 'label';
    if (/^(INPUT|SELECT|TEXTAREA)$/.test(el.tagName)) {
      if (el.type === 'image') return el.alt || '';
      if (/^(submit|button|reset)$/.test(el.type)) return el.value || el.type;
      return el.title || '';
    }
    const t = (el.textContent || '').trim(); if (t) return t;
    const img = el.querySelector('img[alt]:not([alt=""]), svg[aria-label], [role=img][aria-label]');
    if (img) return img.getAttribute('alt') || img.getAttribute('aria-label');
    return el.title || '';
  };
  const names = [];
  let unnamed = 0, placeholderOnly = 0, imgNoAlt = 0;
  for (const el of all) {
    if (nameOf(el)) continue;
    const ph = el.getAttribute('placeholder');
    if (ph) { placeholderOnly++; if (names.length < MAX) names.push({ sel: sel(el), tag: el.tagName.toLowerCase(), issue: 'placeholder-only' }); }
    else { unnamed++; if (names.length < MAX) names.push({ sel: sel(el), tag: el.tagName.toLowerCase(), issue: 'no-name' }); }
  }
  for (const img of document.querySelectorAll('img:not([alt])')) {
    if (!visible(img)) continue;
    imgNoAlt++; if (names.length < MAX) names.push({ sel: sel(img), tag: 'img', issue: 'img-no-alt' });
  }

  // ---------- headings + landmarks ----------
  const hs = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6,[role=heading]')].filter(visible).map((h) => ({
    level: +h.getAttribute('aria-level') || (/^H[1-6]$/.test(h.tagName) ? +h.tagName[1] : 2), text: txt(h, 60),
  }));
  const hIssues = [];
  const h1 = hs.filter((h) => h.level === 1).length;
  if (h1 === 0) hIssues.push('no h1');
  if (h1 > 1) hIssues.push(`${h1} h1 elements`);
  hs.forEach((h, i) => { if (i && h.level > hs[i - 1].level + 1) hIssues.push(`skip h${hs[i - 1].level} -> h${h.level} at "${h.text}"`); });
  hs.filter((h) => !h.text).forEach(() => hIssues.push('empty heading'));
  const landmarks = {
    main: !!document.querySelector('main, [role=main]'), nav: !!document.querySelector('nav, [role=navigation]'),
    header: !!document.querySelector('header, [role=banner]'), footer: !!document.querySelector('footer, [role=contentinfo]'),
  };

  return {
    page,
    summary: {
      targetsChecked: all.length, targetsFailAA, targetsBelowTouch, textChecked: textEls.length,
      contrastFail, contrastNeedsPixelCheck: needsPixel, contrastFromAncestors: fromAncestors, smallText: smallCount, overflow: overflowCount,
      unnamedControls: unnamed, placeholderOnlyLabels: placeholderOnly, imagesNoAlt: imgNoAlt, headingIssues: hIssues.length,
    },
    targets, contrast, smallText, overflow, names,
    headings: { outline: hs.slice(0, MAX), issues: hIssues }, landmarks,
  };
})()
