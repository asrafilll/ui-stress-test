/*
 * axe.js: run axe-core (WCAG 2.0/2.1/2.2 A + AA rules) on the current page.
 *
 * Inject as an expression; it returns a Promise (Playwright's page.evaluate awaits it).
 * Uses window.axe if the page already has it. Otherwise it loads a pinned axe-core
 * from jsDelivr. In Playwright you can avoid the CDN with
 *   await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') })
 * before evaluating this file. If loading fails (offline, CSP), it returns
 * { available: false, reason } and the audit relies on dom-audit.js alone.
 *
 * Returns:
 * { available: true, url, counts: {violations, incomplete, passes},
 *   violations: [{ id, impact, help, helpUrl, wcag: [tags], nodes: [{ target, summary }] }],
 *   incomplete: [{ id, help, nodes: n }] }   // "incomplete" = axe could not decide: check by hand
 */
(async () => {
  const SRC = 'https://cdn.jsdelivr.net/npm/axe-core@4.10.2/axe.min.js';
  const MAX_NODES = 8;
  if (!window.axe) {
    try {
      await new Promise((ok, fail) => {
        const s = document.createElement('script');
        s.src = SRC; s.onload = ok; s.onerror = () => fail(new Error('script load failed (offline or CSP)'));
        document.head.appendChild(s);
        setTimeout(() => fail(new Error('timeout loading axe-core')), 10000);
      });
    } catch (e) {
      return { available: false, reason: String(e.message || e) };
    }
  }
  const r = await window.axe.run(document, {
    runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
    resultTypes: ['violations', 'incomplete'],
  });
  return {
    available: true,
    url: location.href,
    counts: { violations: r.violations.length, incomplete: r.incomplete.length, passes: r.passes.length },
    violations: r.violations.map((v) => ({
      id: v.id, impact: v.impact, help: v.help, helpUrl: v.helpUrl,
      wcag: v.tags.filter((t) => /^wcag\d/.test(t)),
      nodes: v.nodes.slice(0, MAX_NODES).map((n) => ({ target: n.target.join(' '), summary: (n.failureSummary || '').slice(0, 200) })),
    })),
    incomplete: r.incomplete.map((v) => ({ id: v.id, help: v.help, nodes: v.nodes.length })),
  };
})()
