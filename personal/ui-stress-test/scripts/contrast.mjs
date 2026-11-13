#!/usr/bin/env node
/*
 * contrast.mjs: WCAG contrast for colour pairs you read from a design file,
 * design tokens or a screenshot, when there is no DOM for dom-audit.js.
 *
 *   node contrast.mjs '#8A98AE' '#FFFFFF'            one pair, normal text (4.5:1)
 *   node contrast.mjs '#8A98AE' '#FFFFFF' --large    large text (3:1)
 *   node contrast.mjs '#DFE6F0' '#FFFFFF' --ui       borders, icons, focus rings (3:1, WCAG 1.4.11)
 *   printf '#8A98AE #fff\n#A9B6C9 #F7F9FC\n' | node contrast.mjs -     many pairs, "fg bg [large|ui]" per line
 *
 * Colours: #rgb, #rrggbb, #rrggbbaa, rgb(r g b), rgb(r, g, b), rgba(r, g, b, a).
 * A translucent foreground is blended over the background first.
 *
 * Prints one JSON object per pair:
 *   { fg, bg, ratio, required, pass, fix }
 * `fix` is the closest foreground that passes, found by moving `fg` toward black
 * or white, whichever needs the smaller change. It is null when the pair passes
 * and "none" when no shade of `fg` can pass on that background.
 */
import { readFileSync } from 'node:fs';

const parse = (c) => {
  c = c.trim();
  let m = c.match(/^#([0-9a-f]{3,8})$/i);
  if (m) {
    let h = m[1];
    if (h.length === 3 || h.length === 4) h = [...h].map((x) => x + x).join('');
    if (h.length !== 6 && h.length !== 8) throw new Error(`bad colour: ${c}`);
    const n = (i) => parseInt(h.slice(i, i + 2), 16);
    return [n(0), n(2), n(4), h.length === 8 ? n(6) / 255 : 1];
  }
  m = c.match(/^rgba?\(([^)]+)\)$/i);
  if (m) {
    const p = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
    if (p.length >= 3 && p.every(Number.isFinite)) return [p[0], p[1], p[2], p[3] ?? 1];
  }
  throw new Error(`bad colour: ${c} (use #hex or rgb())`);
};
const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
const lum = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const hex = (c) => '#' + c.slice(0, 3).map((v) => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase();
const mix = (a, b, t) => [0, 1, 2].map((i) => a[i] + (b[i] - a[i]) * t);

const check = (fgRaw, bgRaw, kind) => {
  const bgA = parse(bgRaw), fgA = parse(fgRaw);
  const bg = bgA[3] < 1 ? mix([255, 255, 255], bgA, bgA[3]) : bgA.slice(0, 3); // translucent bg assumed on white
  const fg = fgA[3] < 1 ? mix(bg, fgA, fgA[3]) : fgA.slice(0, 3);
  const required = kind === 'large' || kind === 'ui' ? 3 : 4.5;
  const r = ratio(fg, bg);
  let fix = null;
  if (r < required) {
    fix = 'none';
    let best = 2;
    for (const end of [[0, 0, 0], [255, 255, 255]]) {
      for (let t = 0.01; t <= 1.0001 && t < best; t += 0.01) {
        // judge the rounded colour, so the suggested hex itself passes
        const c = mix(fg, end, t).map(Math.round);
        if (ratio(c, bg) >= required) { best = t; fix = `${hex(c)} (${ratio(c, bg).toFixed(2)}:1)`; break; }
      }
    }
  }
  return { fg: hex(fg), bg: hex(bg), ratio: Math.round(r * 100) / 100, required, pass: r >= required, fix };
};

const args = process.argv.slice(2);
try {
  if (args[0] === '-') {
    for (const line of readFileSync(0, 'utf8').split('\n')) {
      const p = line.trim().split(/\s+(?![^(]*\))/);
      if (p.length < 2 || line.trim().startsWith('//')) continue;
      console.log(JSON.stringify(check(p[0], p[1], p[2])));
    }
  } else if (args.length >= 2) {
    const kind = args.includes('--large') ? 'large' : args.includes('--ui') ? 'ui' : undefined;
    console.log(JSON.stringify(check(args[0], args[1], kind)));
  } else {
    console.error("usage: node contrast.mjs <fg> <bg> [--large|--ui]   or   node contrast.mjs -   (pairs on stdin)");
    process.exit(2);
  }
} catch (e) {
  console.error(String(e.message || e));
  process.exit(2);
}
