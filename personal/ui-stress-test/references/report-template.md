# UI stress test: <scope>

<!-- This file is the contract with follow-up skills (visual review, issue writing).
     Keep the section headings and the finding ID format: FC<n>, F<n>, I<n>. -->

- **Date:** YYYY-MM-DD
- **Input:** live app <url, environment: local | staging | production (read-only)> | material <files, capture date> | design file <file / frames>
- **Code read:** <repo path, commit> | not available (L3 not checked)
- **Rules applied:** project <files> · personal <source or none> · defaults
- **Fallbacks used:** … (for example "browser automation crashed, static review for job 3")
- **Not tested:** … (and why)

**Verdict:** one sentence. Can each role finish their jobs, and what is the single biggest gap?

## Do first

At most 5. Highest severity first; within a severity, smallest effort first.

| # | Finding | Severity | Effort | Why first |
|---|---|---|---|---|
| 1 | [F1](#fix) <short title> | P0 | S | blocks Job 2 for every support agent |

<!-- Re-audit only: keep this section, otherwise delete it. -->
## Since the last audit (<previous report file>)

| | Fixed | Still open | Changed | New | Not re-tested |
|---|---|---|---|---|---|
| Flow change | | | | | |
| Fix | | | | | |
| Improve | | | | | |

| ID | Was | Now | Evidence |
|---|---|---|---|
| F1 | P0 | fixed | ![](2026-11-16/f1-fixed.png) |
| F3 | P1 | still open | `file:line` |

Problem score: Role A <before> → <after> /40.

## Job brief (L1)

| Role | Situation (where, device, how often, stakes) | Top jobs | Best in class |
|---|---|---|---|
| Support agent | Desk, two monitors, 40+ tickets a day; a wrong refund costs money and trust | 1. Every eligible return is refunded the same day · 2. … | … |

Mark ⚠️ on anything guessed.

## Role access map (L3)

| Screen / action | Role A | Role B | Role C |
|---|---|---|---|
| Refunds → issue refund | can edit | read-only | **redirects silently** |

Values: can open · can edit · read-only · hidden · error · redirects silently. Bold anything where the UI and the code disagree.

## Job walks (L2–L3)

### Job 1: <outcome> · role <role> · device <size>

| | Ideal | Real | Best in class |
|---|---|---|---|
| Taps | | | |
| Screens | | | |
| Typed fields | | | |
| Leaves the app | | | |

| Step | Screen | Friction (remember / guess / lose work / irreversible / too late) | Code behind it (`file:line`) | UI vs rules |
|---|---|---|---|---|
| 1 | | | | |

Patterns matched: …

## Summary

| | P0 | P1 | P2 | P3 |
|---|---|---|---|---|
| Flow change | | | | |
| Fix | | | | |
| Improve | | | | |

**Nielsen problem score** (0–4 per heuristic on the severity scale, worst finding under it; total out of 40, **lower is better**; not comparable with "higher is better" scores from older audits):

| Heuristic | Role A | Role B |
|---|---|---|
| NN-1 … NN-10 | | |
| **Total** | /40 | /40 |

## Flow changes

### FC1 · P1 · L2 · <short title> · effort S/M/L
- **Job:** Job n, role
- **Pattern:** 1–5 from flow-patterns.md
- **Now:** the real path, in N steps
- **Proposed:** the new path, in M steps (who does what, where)
- **Evidence:** screenshots, `file:line`
- **Standard:** NN-5, …
- **What has to change:** UI, rule, data model, permission

## Fix

### F1 · P0 · L6 State fix · <short title> · effort S/M/L
- **Where:** screen / component / `file:line` / design node id
- **What breaks:** the concrete input or state → what happens
- **Evidence:** ![](YYYY-MM-DD/f1.png) (path relative to this file) or script output (mark `(inferred)` if not reproduced)
- **Standard:** NN-9, WCAG 3.3.1, DR-1, PR:DESIGN.md …
- **Fix:** the exact change

## Improve

### I1 · P2 · L4 Screen fix · <short title> · effort S/M/L
- **Where:** …
- **Now:** what it does today
- **Better:** the pattern, and who does it this way
- **Standard:** NN-7 …
- **Gain:** fewer steps, fewer errors, faster scanning …

## Stress matrix results (L5–L6)
| Area | Pass | Break | n/a |
|---|---|---|---|
| Content extremes | | | |
| States | | | |
| Viewports and zoom | | | |
| Input and interaction | | | |
| Accessibility (dom-audit + axe summary) | | | |
| Localisation | | | |

## Test records

| Record (ID, table or screen) | Created for | Reverted? |
|---|---|---|
| uist-2026-11-09-… | | yes / **no, because …** |

## Open questions
- **Confirm the brief:** every ⚠️ role, situation or job from the job brief, as a yes/no question.
- …

## Appendix: minor items
- …

<!-- Added after a visual review, by the review skill. Leave it out until then. -->
## Decisions
- YYYY-MM-DD · Apply: FC1, F1 · Later: F3 · Skip: I2 (reason, if given)
