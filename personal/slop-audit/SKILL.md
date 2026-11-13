---
name: slop-audit
description: "Audit a whole repo (or chosen areas) for frontend and backend slop — copy-paste, dead code, useEffect misuse, fat handlers, N+1, swallowed errors, type erosion, fake abstractions, missing authz/validation — rank it, write a report, and open GitHub issues with prio:high/medium/low labels and concrete how-to-fix steps. Tracks what has been checked in .claude/slop-audit.md so later runs continue where the last stopped. Read-only on code. Invoke with /slop-audit [paths...] [--fe|--be] [--continue] [--dry-run] [--yes]. Only use when the user explicitly asks for a slop audit or /slop-audit."
---

# slop-audit

Find code that works but is copy-pasted, inconsistent, dead, or fragile. Output a ranked fix list as issues a human or agent can pick up. You never edit source code.

`<skill>` = this skill's directory (normally `~/.claude/skills/slop-audit`). Use absolute paths.

## Args
- `paths...` audit only these directories/files.
- `--fe` / `--be` only frontend / backend criteria.
- `--continue` audit the next `pending` areas from the ledger.
- `--dry-run` report only, no issues.
- `--yes` create issues without asking.

## 0. Ground rules
- Never run `git diff`/`git log` directly (shell hooks may compress output). Use the scripts in `<skill>/scripts/`.
- No external analyzers (knip, jscpd, eslint plugins…). Use Grep/Glob/Read and the bundled scripts only.
- Read `.claude/review-context.md` and `AGENTS.md` first if present: stack, conventions, example files, known debt, danger zones.
- Judge against the repo's own dominant convention, not your taste. Find the good example before calling something slop.

## 1. Inventory and scope
Run `bash <skill>/scripts/inventory.sh` and `bash <skill>/scripts/churn.sh`.
- Read the ledger `.claude/slop-audit.md` if it exists (template: `<skill>/references/ledger-template.md`). Skip areas `checked` at the current commit unless named in args.
- Areas = what `inventory.sh` lists (monorepo `apps/*`, `packages/*`, else top-level source dirs).
- **Too big for one run** (more than 400 source files or 60k LOC in scope, no paths given, no `--continue`): stop and ask the user which areas to scan first. Show the area table (files, LOC, churn rank) and recommend the 2–3 highest-churn areas. Headless: write the ledger with all areas `pending`, print the table, end.

## 2. Scan (parallel, read-only)
Load `<skill>/references/criteria.md`. Spawn one Agent per area (max 6 per message; batch if more), each:
```
Audit <abs area path> in repo <abs root> for slop. Read <skill>/references/criteria.md and apply the
<frontend|backend|both> sections. Repo context: <abs path to .claude/review-context.md or "none">.
Churn (most-changed files first): <top churn lines for this area>.
Method: Grep each signal across the whole area to count spread; fully Read the 10 largest and 10
highest-churn files; sample the rest. Find the repo's good example before flagging a convention breach.
Never edit files. Never run shell commands.
Return ONLY JSON: {"area": "...", "files_scanned": n, "findings": [{"id": "<criterion-id>",
"title": "...", "severity": "high|medium|low", "kind": "pattern|instance", "count": n,
"files": ["path:line", ...], "evidence": "...", "why": "...", "good_example": "path or null",
"fix": "...", "effort": "S|M|L", "agent_safe": true|false}], "clean": ["criterion-ids checked with no findings"]}
```

No `Agent` tool in this harness (Codex, OMP, …)? Use its own subagent/task tool if it has one; otherwise audit the areas yourself, one at a time, producing the same JSON per area before merging.

## 3. Merge and rank
- Same criterion across files = ONE `pattern` finding with count + file list (cap 15 paths, then "+n more"). Real one-offs stay `instance`.
- Merge the same criterion across areas when the fix is the same.
- Priority = severity, then spread (count), then churn. Known debt from context: cap at `low` unless spreading into new code.
- `high` only for: data leak/loss, missing authz or tenant scoping, swallowed errors on money/auth paths, N+1 or unbounded query on hot paths, secrets/PII in logs.

## 4. Report
Write `.review/slop-audit-<YYYY-MM-DD>.md` (`.review/` is gitignored): scope, commit, per-priority findings (title, count, files, why, fix), criteria checked clean, areas not scanned. Print counts per priority and the top 5.

## 5. Issues (skip with `--dry-run`)
1. Show the planned issue list (priority, title, count). Ask for confirmation unless `--yes`.
2. Labels (create if missing): `gh label create <name> --color <hex> --description <d> --force` for `slop` (`5319e7`), `prio:high` (`d73a4a`), `prio:medium` (`fbca04`), `prio:low` (`0e8a16`), `area:frontend` (`1d76db`), `area:backend` (`0052cc`).
3. Dedupe: `gh issue list --label slop --state open --limit 200 --json number,title,body`; skip findings whose `slop-id` marker is already open, and add a comment there only if the count grew.
4. One issue per finding: `gh issue create --title "[slop] <title>" --body-file <tmp> --label slop,prio:<p>,area:<a>`. Body from `<skill>/references/issue-template.md`. The how-to-fix section is mandatory: steps, before/after snippet using the repo's own good example, acceptance checklist.
5. `low` findings: one issue per area grouping all lows, not one each.

## 6. Ledger
Update `.claude/slop-audit.md` (create from template): per area status `checked|pending|skipped`, date, short commit, findings per priority, issue numbers; plus the criteria list with what was checked. Keep manual notes. Tell the user to commit it so other machines/agents continue from it.

## Output to user
Scope scanned, counts per priority, top 5 with issue links, areas still pending, the next command (`/slop-audit --continue`).
