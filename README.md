# ui-stress-test

An agent skill for Claude Code and Codex that stress-tests a UI and reports what to **Fix** and what to **Improve**, including flow changes.

It works on one idea: a screen exists so that a specific person can finish a specific job in their real situation. So it audits top-down:

| Layer | Question |
|---|---|
| L1 Job and situation | Who, when, where, on what device, how much is at stake? |
| L2 Flow | How far is the real path from the shortest path to finish the job? |
| L3 System truth | What do the code, data model and permissions allow? Does the UI tell the truth? |
| L4 Screen | Is the most important thing for this job first? |
| L5 Element | Can it be tapped, read, understood? (`dom-audit.js`, axe-core, pixel contrast) |
| L6 States | Empty, error, loading, long text, wrong input, other screen sizes? |

The output is a report (`.ui-stress/YYYY-MM-DD-<scope>.md`): flow changes with before → after step counts, then Fix and Improve items with layer, P0–P3 severity, evidence (`file:line`, screenshots, script output), the standard it breaks (Nielsen, WCAG 2.2 AA, forms, tables) and a concrete fix, plus a Nielsen problem score per role. It does not edit your code.

Works on a live app (any browser automation: Playwright, Chrome DevTools, in-app preview), on a design file through a design-tool MCP, or on screenshots. Safe on live data: local or staging only, test records reverted, no outbound effects.

## Install

**Claude Code plugin**

```
/plugin marketplace add asrafilll/ui-stress-test
/plugin install ui-stress-test@ui-stress-test
```

**skills CLI (Claude Code, Codex and others)**

```sh
npx skills add asrafilll/ui-stress-test
```

**By hand**

```sh
git clone https://github.com/asrafilll/ui-stress-test.git
cd ui-stress-test
./install.sh          # claude (default) | codex | both
```

## Use

Ask in plain words: "stress test the UI of the checkout flow", "UX audit this screen", "what breaks here?", or call `/ui-stress-test`.

Give it what you have: a URL (local or staging), the repo, a design file, or screenshots. It writes the job brief first and asks once for anything it can't infer.

## What's inside

```
skills/ui-stress-test/
  SKILL.md                     the method
  references/                  standards, flow patterns, stress matrix, report template, default rules
  scripts/dom-audit.js         targets, contrast on rendered colours, overflow, names, headings
  scripts/axe.js               runs axe-core (loaded from a pinned CDN if the page has none)
  scripts/pixel-contrast.mjs   contrast for text on gradients and images (Playwright)
```

Optional companions: a `break-ui` skill for worst-case data on one component, and a `before-after-review` skill to draw the fixes.

## Credits

The content-extremes method in `references/stress-matrix.md` is adapted from Emil Kowalski's `break-ui` skill (MIT).

## License

MIT
