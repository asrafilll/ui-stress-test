---
name: ui-stress-test
description: 'Stress-test a UI and report what to Fix and what to Improve, including flow changes, judged against Nielsen, WCAG 2.2 AA and best-in-class tools. Use for "stress test the UI", "UX audit", "review this flow", "what breaks", "is this good UX", or a shared screen with "what should I fix". Unlike design or polish skills, it walks each user job end to end and reads the code behind it. For worst-case data on a single component, prefer a component-level skill such as break-ui.'
---

# UI Stress Test

## The root idea

A screen exists so that **a specific person can finish a specific job in their real situation**. Every issue is a gap between three things:

1. **The job:** the outcome the person is after, such as "every order that came back today is refunded" or "the patient leaves with a confirmed appointment".
2. **The situation:** who they are and where they are while doing it. A support agent with 40 tickets in the queue. A nurse booking between patients on a shared desktop. A customer on a cheap phone with patchy data.
3. **What the system asks of them:** taps, screens, typing, remembering, guessing, waiting, risk.

If the system asks more than the job needs, or asks it at the wrong moment, that is an issue. If the system's idea of the job differs from the real job, that is a **flow issue**. Flow issues lead to flow changes, not just screen fixes.

Audit top-down. Most reviews only check layers 5 and 6. The findings that change flows come from layers 1 to 3.

| Layer | Question |
|---|---|
| L1 Job and situation | Who, when, where, on what device, how often, how much is at stake? |
| L2 Flow | What is the shortest path to finish the job, and how far is the real path from it? |
| L3 System truth | What do the code, data model and permissions actually allow? Does the UI tell the truth about it? |
| L4 Screen | Is the most important thing for this job first? |
| L5 Element | Can it be tapped, read, understood? |
| L6 States | Empty, error, loading, long, wrong input, other device sizes? |

## Rules

- **The output is a report.** Don't edit code, designs or canvases. Visuals and fixes are offered at the end, not done by default.
- **Evidence for every finding:** a screenshot, `file:line`, script output, or a design node id, plus the standard, pattern or rule it breaks. No evidence means it's an open question.
- **Real extremes** from the product's data, not lorem ipsum.
- **Rules, in priority order:** the project's own rules (AGENTS.md, CLAUDE.md, a design-system doc, brand guide), then the user's personal rules if any exist, then [references/default-rules.md](references/default-rules.md).
- **Live data safety:**
  - Stress-test only on local or staging. If the only target is production, keep to read-only flows (browse, search, open, cancel before submit) and mark everything else `(inferred)`.
  - Write down every record you create (ID, table or screen) and delete or revert each one at the end. List any you couldn't revert in the report.
  - Never trigger real outbound effects: messages, email, SMS, push, payments, webhooks, exports to third parties. If you can't tell whether a button sends something, don't press it; mark it `(inferred)`.
  - If another agent or person may be writing to the same database, use your own clearly named test records (prefix `uist-<date>-`) and touch nothing else.

## Step 0: Reach the input

Check each capability before relying on it. Use whatever is available.

| Need | Use | Fallback |
|---|---|---|
| **Context** (who uses it, past decisions, repo path) | Project notes or a memory tool, if available (for example a team wiki search). Otherwise README, docs, issues. | Ask in Step 1. |
| **Code** | The repo, if it's present or the notes point to it. | Without code, L3 is limited to `(inferred)`; the report says so. |
| **Live app** | Any browser automation: in-app preview tools, Playwright, Chrome DevTools Protocol. | Static review of screenshots. |
| **Design file** | A design-tool MCP that is connected with a file open: read its current state first, then export the frames to images and look at them. | Ask for exported images. |
| **Given material** | Read the images; open HTML in the browser; read component code and data types. | – |

**A report for this scope already exists** (`.ui-stress/*-<scope>.md`): this is a re-audit. Read the newest one first and carry its job brief and finding IDs forward.
- Re-test every finding in it before looking for new ones, and give each a status: **fixed** (the evidence no longer reproduces; new screenshot or `file:line`), **still open**, **changed** (partly fixed, or the fix broke something else) or **not re-tested** (and why).
- Keep the old IDs. New findings continue the numbering after the highest ID ever used; never reuse an ID.
- If that report has a `## Decisions` section (written after a visual review), a finding the user chose to **skip** stays out of the new findings and the Do first list. List it once under "Skipped by decision", with the date and their reason.
- Write a new dated report with the "Since the last audit" table from the template, and compare problem scores only with that previous report.

## Step 1: L1, the job brief (required)

Write this before looking at any screen. Fill it from context and code (role enums, permission checks, routes, seed data). Ask the user in **one** message only for what's still unknown.

- **Roles:** who uses it. For each role: where they are, the device, how often, and what's at stake if it goes wrong.
- **Jobs:** the top 3 to 5 jobs per role, each phrased as the real-world outcome, not as a screen ("every refund is issued today", not "use the refunds page").
- **Best in class:** for each job, 1 or 2 tools that do the same job well.

If the brief is guessed, mark it ⚠️ and keep going. Every ⚠️ item goes to the top of the open questions as "confirm the brief": a wrong role or job makes the findings under it wrong.

## Step 2: L2 and L3, walk each job

For every job in the brief, do these five things in order. Log them in the per-job tables of [references/report-template.md](references/report-template.md).

1. **Write the ideal path** from what the system already knows. If the email is known at step 1, a duplicate account can be caught at step 1.
2. **Walk the real path** as that role, at that role's device size. Count taps, screens, typed fields, scrolls, and every moment the user must **leave the app** (email a colleague, check a spreadsheet). On static material, walk the frames and mark where a frame is missing.
3. **Mark the friction points**, places where the user must **remember**, **guess**, can **lose work**, can make an **irreversible mistake** in one tap, or **learns a rule too late**. The checklist is in [references/flow-patterns.md](references/flow-patterns.md).
4. **Read the code behind each step:** route, handler, validation, data model, permission check. Note where the screen and the rules disagree, where the UI promises something the data can't back, and which of the user's questions the data model can't answer.
5. **Match against the five flow-change patterns** in [references/flow-patterns.md](references/flow-patterns.md). Each match is a candidate flow change.

**More than one role:**
- Give each role its own browser session or context, so logins and cookies don't mix.
- For a big app (3 or more roles, or more than 10 jobs), run one subagent per role if your environment supports it. Give each one the job brief and the report template and have it fill in that role's job walks. Then merge their results and remove duplicates.
- **Required L3 output: a role access map.** For each role and each main screen or action, record one of: can open, can edit, read-only, hidden, error, or **redirects silently**. Check it in the UI and in the code. A silent redirect or a button the server then rejects is a finding.

## Step 3: L4 to L6, break it

- **L4 Screen:** on each screen of each job, is what this role needs first actually first, at this device size? Does it open on today, on the role's own work, on the action they came for?
- **L5 Element:** on a live page, inject [scripts/dom-audit.js](scripts/dom-audit.js) and read its JSON (tap targets, contrast, small text, overflow, unnamed controls, heading outline). Then run [scripts/axe.js](scripts/axe.js) if the page can load axe-core. Never estimate contrast by eye. Items marked `needs-pixel-check` (gradient, image or translucent background) go to [scripts/pixel-contrast.mjs](scripts/pixel-contrast.mjs) in Playwright; without Playwright, sample the background from a screenshot and say so. Items it returns as `skipped` (covered by a sticky bar, gone) need a look by eye. With no DOM at all (a design file, tokens, a screenshot), read each text and background colour pair and run them through [scripts/contrast.mjs](scripts/contrast.mjs) (`node <skill-dir>/scripts/contrast.mjs '#8A98AE' '#FFFFFF'`, or many pairs on stdin); it returns the ratio and the closest shade that passes, which goes into the fix.
- **L6 States:** run [references/stress-matrix.md](references/stress-matrix.md). For content extremes, map each screen's fields and limits first, then use realistic or schema-limit values only (its section 1).

How to run the scripts. `<skill-dir>` is the folder this SKILL.md is in; use its absolute path, because the agent's working directory is the project, not the skill.

```js
// Playwright. Full-page audit: make the viewport as tall as the page first, so
// every text element can be hit-tested (otherwise text below the fold falls back
// to an ancestors-only background read; summary.contrastFromAncestors counts them).
const S = '<skill-dir>/scripts/';
const h = await page.evaluate(() => document.documentElement.scrollHeight);
await page.setViewportSize({ width: 390, height: Math.min(h, 16000) });
const audit = await page.evaluate(await fs.readFile(S + 'dom-audit.js', 'utf8'));
const axe = await page.evaluate(await fs.readFile(S + 'axe.js', 'utf8'));
await page.setViewportSize({ width: 390, height: 844 }); // back to the real device size
const { pixelContrast } = await import(S + 'pixel-contrast.mjs');
const measured = await pixelContrast(page, audit.contrast);
// In-app preview or DevTools: evaluate the contents of dom-audit.js and axe.js as
// expressions, and scroll page by page instead of resizing.
// Output shapes are documented at the top of each file.
```

Tall viewports change layouts that depend on viewport height (`100vh` heroes, sticky footers). Take the layout findings from the real device size; use the tall pass for contrast only.

On static material, reason it through and mark findings `(inferred)`. Save screenshots under `.ui-stress/<date>/`. Before the first write into a repo, check `git check-ignore -q .ui-stress`; if it isn't ignored, add `.ui-stress/` to `.git/info/exclude` (local only, nothing to commit), not to `.gitignore`.

## Step 4: Judge, score and compare

- Check each job against [references/standards.md](references/standards.md).
- **Problem score:** rate the 10 Nielsen heuristics from 0 to 4 per role on Nielsen's severity scale (0 = no problem, 4 = catastrophe; details in standards.md). Report the total out of 40 per role; **lower is better**. Call it "problem score" in the report, and don't compare it with older scores that used a "higher is better" scale. It is a comparison aid; the findings are what matter.
- **Compare** each job with the best-in-class tools from the brief: their step count, and the pattern they use that this one doesn't. Cite what you saw, or mark it `(from knowledge)`.

## Step 5: Classify and rank

Each finding gets:
- a **layer** (L1–L6);
- a **type:** **Flow change**, **Screen fix** (L4), **Element fix** (L5) or **State fix** (L6);
- a **bucket:** **Fix** (wrong today: broken, loses data, misleads, blocks, breaks a standard or rule) or **Improve** (works, but a known better pattern exists);
- a **severity:** P0 blocks the job or loses data · P1 hurts many users often · P2 annoys or confuses · P3 cosmetic;
- an **effort:** S (under 1 hour), M (under 1 day), L (more than 1 day). Mark a guess with ⚠️.

Merge symptoms that share a root cause. Within each severity, list flow changes first.

Then pick the **Do first** list: at most 5 findings, highest severity first and, within a severity, smallest effort first. A P0 or P1 of effort S always makes the list. It answers "where do we start on Monday".

## Step 6: Verify and report

1. Re-open the evidence for every P0, P1 and flow change. Does the screenshot, script output or code really show it? Drop or downgrade any that don't hold up.
2. Each flow change states its job's before → after step counts.
3. Each finding has a concrete fix (new path, component, rule, copy), not "consider improving".
4. Every test record is reverted, or listed as not reverted.
5. Every image link in the report resolves from the report's own folder.

Write `.ui-stress/YYYY-MM-DD-<scope>.md` with [references/report-template.md](references/report-template.md) (in the repo root, or in a temp folder when there's no repo). Keep the finding IDs stable (FC1, F1, I1); other skills read this file. Link screenshots by a path relative to the report (`2026-11-09/f1.png`), so the report still shows them on a teammate's machine or in the repo; use absolute paths only in chat.

In chat, give: a verdict line, the job brief in 3 lines, the flow changes (each with before → after steps), the "Do first" list, the top Fix items with screenshots, the top 3 Improve items, the Nielsen score per role, open questions, and the report path.

Then the visual review. Never end an audit without it being either run or offered:
- **If the user's personal or project rules ask for visuals after every audit**, run the visual before → after review right away, without asking. Use a skill for it if one exists (for example `before-after-review`) and hand it the report path.
- **Otherwise, always offer it** as the first next step, in one line the user can answer with "yes".

Other next steps, one at a time and only on a yes:
- Apply the P0 and P1 fixes, then re-run this skill on the same scope. The re-run is a re-audit: it reports which findings are fixed, still open or new.
- For a component with many content breaks: a full worst-case run with a dev-only "Demo data / Worst case" toggle, so the team can flip between them (with the `break-ui` skill if it's installed). This adds a fixture and a toggle to the project, so it needs a yes.
- Turn the findings into tracker issues (with an issue-writing skill if one exists).

## Failure modes

- **Only one screenshot, no code:** still write the brief and the ideal path. Missing frames and states become findings ("state not designed"). Mark L3 as not checked.
- **Login wall:** ask once for credentials for each role. If none come, audit the logged-out screens and mark role-specific jobs `(inferred)`.
- **Brief unknown and the user is unavailable:** infer roles from code, mark ⚠️, and list the brief questions under open questions.
- **Time-dependent states** (today, end of month or period, expired, overdue, after a deadline): set the clock if the app allows it (a test clock, a fake-timer flag, or a browser clock override), otherwise pick seed data that's already in that state. If neither works, mark it `(inferred)`.
- **Screenshots or design frames older than the live app:** write the capture date next to every static finding. On the live app, find elements by visible text or role, not by position or by an ID from the capture. If the two disagree, the live app wins and the old capture is noted as stale.
- **Others writing to the same canvas or database:** read the current state right before each action, work only on your own prefixed records, and never move or delete what you didn't create.
- **A tool's engine fails** (browser automation crashes, the design tool errors out): retry once, then use its command-line or headless mode if it has one, then fall back to static review or an HTML capture. Write in the report which steps used a fallback.
- **Too many findings:** report all flow changes and the top 10 Fix items. Put the rest in the appendix.
- **The user's taste conflicts with a standard:** report the standard and the trade-off once; the user decides.
- **Secrets or personal data on screen:** blur or crop screenshots; never paste real phone numbers, emails or IDs into the report.
