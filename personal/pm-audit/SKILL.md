---
name: pm-audit
description: 'Product-manager audit of a running product: gathers evidence from the repo, the live app, client chats, meetings, issues, and competitors, then ranks what to fix or improve. Use when the user says "pm audit", "audit this product", "what should we improve", "act as PM", "I just took over this app", or wants a prioritized improvement list for an existing product. Differs from whats-next (proposes new features from repo + market); pm-audit finds real problems backed by user/client evidence, fixes before features.'
---

# PM Audit

Act as a PM who just inherited a running product. Understand first, find problems with evidence, prioritize, hand the human a decision doc. Read-only on code.

Core rules — break none:
1. **No evidence, no finding.** Every finding cites a source (file:line, chat date + sender role, meeting, issue #, screenshot, URL). No source → it goes under "Hypotheses", never "Findings".
2. **Facts vs hypotheses kept separate.** "12 tickets mention X" is fact. "Users want Y" is hypothesis.
3. **Problem before solution.** Name the pain, then the fix. Feature requests are traced to the need behind them.
4. **Human decides.** You recommend; you never commit to a roadmap or open tickets without a yes.

## Step 0 — Scope and goals (ask, then wait)

State-check first: is cwd a product repo? Is there a prior `.pm/audit-*.md`? If prior audit exists, read it — this run diffs against it (what got fixed, what's new, what's stale).

Then ask the user in ONE message (skip what's already known from the conversation or your notes):
- Product + who uses it vs who pays (B2B: buyer ≠ daily user)
- Business goal right now (retention, revenue, client satisfaction, cost, compliance, contract renewal)
- Hard constraints (deadline, team size, frozen areas, client sign-off)
- Known pain they already suspect (so you can test it, not just echo it)
- Live app URL / test credentials, if any

## Step 1 — Gather evidence in parallel

Launch one subagent per available source in a single message (background). Each returns raw findings in the shape from `references/finding-format.md`. Skip a source silently if unavailable; list skipped sources in the report.

| Source | How | What to extract |
|---|---|---|
| Repo | Flow recon (routes, states, services); a code-index tool if you have one; `TODO`/`FIXME`/`HACK`; error handling gaps; dead/half-built modules | Feature inventory, flow map, fragile areas |
| Live app | Browser/preview tools: walk each main flow, screenshot each step | Friction: extra steps, confusing copy, slow pages, dead ends, errors |
| Client/user chats | Your notes or chat archive, if the agent can search it (a notes wiki, exported chats, a support inbox) | Complaints, repeated asks, workarounds, escalations, quotes of the bar ("better than X") |
| Meetings | Your meeting-notes tool, if connected, scoped to the product or client | Commitments, asks, decisions, unresolved items |
| Issues | `gh issue list --state all --limit 200`; Linear/Jira if connected | Recurring bugs, aging issues, labels clusters |
| Market | WebSearch competitors + domain table-stakes | Gaps vs what users compare against |

Count frequency. One loud complaint ≠ ten quiet ones — record both count and who.

## Step 2 — Classify

Merge subagent results, dedupe (same root cause = one finding, multiple sources). Bucket each:

- **Broken** — errors, failed flows, wrong data. Hurts trust. Default top priority.
- **Friction** — works but slow, confusing, manual, too many steps.
- **Missing** — users work around it outside the product (Excel, WhatsApp, manual SOP, asking support).
- **Opportunity** — new value, new users, new revenue.

Look hard for workarounds — they are the strongest signal of a Missing item.

## Step 3 — Prioritize

Score each finding (1–5): **Reach** (how many users/flows) × **Severity** (blocked=5, annoyed=3, cosmetic=1) × **Goal fit** (ties to Step 0 goal) ÷ **Effort** (1=hours … 5=weeks; estimate from code, mark ⚠️ if guessed). Show the score; it's a conversation aid, not truth.

Then pick:
- **Quick wins** — high score, effort ≤2. Builds trust fast.
- **Big bets** — high impact, effort ≥3. Max 3.
- **Not now** — explicitly say what to ignore and why.

## Step 4 — Verify before reporting

Re-check every Finding: does its citation actually say that? Open the file/chat line. Drop or demote to Hypothesis anything that doesn't hold. Check the top 5 against the Step 0 goal — if none serve it, say so.

## Step 5 — Output

Write `.pm/audit-YYYY-MM-DD.md` in the repo using `references/report-template.md`. In chat give only: the top 5, quick wins, open questions, and the file path.

Close by offering next steps, one at a time, only on yes:
- Item to spec → `to-prd`, then `to-issues`
- Stress-test priorities → `grill-me`
- Build-ready brief → `pre-flight`
- New-feature ideas beyond fixes → `whats-next`
- Durable decision made → write it to the project's notes or decision log

## Failure modes

- **Thin evidence** (no chats, no issues, no live app): say so up top, run repo + market only, label the report "low-evidence — validate with users".
- **Everything looks Broken**: you're probably reading dev chatter, not user pain. Re-weight by who complained (end user/client > internal dev).
- **Client wants feature X loudly**: record it, trace the need behind it, score it like anything else.
- **Secrets / personal data in evidence**: never copy tokens, phone numbers, emails, or long verbatim private messages into the report. Paraphrase + date + role.
