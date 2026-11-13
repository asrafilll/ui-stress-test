# Asrafil's agent skills

Agent skills for [Claude Code](https://claude.com/claude-code), Codex and other agents that read `SKILL.md` folders. Most of them are about UI and design work.

There are two folders:

- [`personal/`](personal/): skills I wrote.
- [`preferences/`](preferences/): skills by other people that I use every day. They are copied here with credit and their licenses. See [Credits](#credits).

The repo started as the home of `ui-stress-test` (it used to be `asrafilll/ui-stress-test`; old links redirect here).

## Personal

| Skill | What it does |
|---|---|
| **ui-stress-test** | Top-down UI/UX audit. It walks each user job end to end, reads the code behind it, then breaks the screens: targets, contrast on rendered colours, overflow, names, headings, states. The report lists flow changes, then Fix and Improve items with P0–P3 severity, evidence and the standard each one breaks (Nielsen, WCAG 2.2 AA). Report only. |
| **before-after-review** | Turns findings (a `ui-stress-test` report or any numbered list) into before → after visuals, one row per finding. Draws on a connected design canvas, or builds a self-contained HTML page. Each row gets an Apply / Later / Skip choice that is written back into the report. |
| **pm-audit** | Product-manager audit of a running product. Gathers evidence from the repo, the live app, user chats, meetings, issues and competitors, then ranks what to fix. Every finding cites a source; fixes come before features. |
| **whats-next** | Proposes what to build next from the repo and the market, backed by an evidence-based SWOT. |
| **pre-flight** | Briefing before you build a feature or fix a bug: what changes, current state, assumptions, business-flow impact, expected outcome. Waits for your go before any code. |
| **slop-audit** | Whole-repo audit for frontend and backend slop: copy-paste, dead code, `useEffect` misuse, fat handlers, N+1 queries, swallowed errors. Ranked report plus GitHub issues. |
| **security-audit** | Attacker-minded audit of a repo and its production setup against OWASP Top 10 2025, API Top 10 and LLM Top 10. Assessment only. |
| **production-readiness-audit** | SRE-style production readiness review: delivery and rollback, SLOs, scaling, data safety, observability. Graded scorecard and fix plan. |

How I chain them for UI work: `ui-stress-test` finds what is wrong → `before-after-review` draws the fixes → you pick Apply, Later or Skip for each one.

## Preferences

Skills from other authors, grouped by what I use them for. Each one keeps its author's license. Upstream links are in [`preferences/SOURCES.md`](preferences/SOURCES.md).

| Use | Skills |
|---|---|
| Motion and animation | `animation-vocabulary`, `apple-design`, `emil-design-eng`, `find-animation-opportunities`, `improve-animations`, `review-animations` |
| UI design and polish | `impeccable`, `design-taste-frontend`, `frontend-design`, `make-interfaces-feel-better`, `mobile-native`, `break-ui` |
| Plain writing | `bahasa-indonesia-plain`, `english-plain` |
| Planning and issues | `grill-me`, `grill-with-docs`, `to-prd`, `to-issues`, `triage`, `handoff`, `setup-matt-pocock-skills` |
| Writing skills and security | `effective-agent-skills`, `security-and-hardening` |

## Install

**Claude Code plugin**

```
/plugin marketplace add asrafilll/skills
/plugin install asrafil-personal@asrafil-skills
/plugin install asrafil-preferences@asrafil-skills
```

**skills CLI** (Claude Code, Codex and others)

```sh
npx skills add asrafilll/skills                          # pick from the list
npx skills add asrafilll/skills --skill ui-stress-test   # one skill
```

**By hand**

```sh
git clone https://github.com/asrafilll/skills.git
cd skills
./install.sh --list
./install.sh ui-stress-test before-after-review                  # into Claude Code
./install.sh --target both personal                              # all personal skills, Claude Code and Codex
```

`--target` is `claude` (default), `codex` or `both`. Override the folders with `CLAUDE_SKILLS_DIR` or `CODEX_SKILLS_DIR`. Restart your agent after installing.

## Credits

The skills in `preferences/` belong to their authors. Thank you:

- [Emil Kowalski](https://github.com/emilkowalski/skills): the motion and animation skills, `break-ui` and `mobile-native`. `break-ui` also shaped the stress cases in `ui-stress-test`.
- [Jakub Krehel](https://github.com/jakubkrehel/make-interfaces-feel-better): `make-interfaces-feel-better`.
- [Anthropic](https://github.com/anthropics/skills): `frontend-design`.
- [Paul Bakaus](https://github.com/pbakaus/impeccable): `impeccable`.
- [Leonxlnx](https://github.com/Leonxlnx/taste-skill): `design-taste-frontend`.
- [orepras](https://gist.github.com/orepras): `bahasa-indonesia-plain` and the original `english-plain`. Both use orepras's RASA check (Ritmis, Akurat, Sarat makna, Alami).
- [Matt Pocock](https://github.com/mattpocock/skills): `grill-me`, `grill-with-docs`, `to-prd`, `to-issues`, `triage`, `handoff`, `setup-matt-pocock-skills`.
- [David Ondrej](https://github.com/davidondrej/skills): `effective-agent-skills`.
- [Addy Osmani](https://github.com/addyosmani/agent-skills): `security-and-hardening`.

I also use these, but they are not copied here. Install them from their authors:

| Skill | Author | Why it is not copied |
|---|---|---|
| [kami](https://github.com/tw93/kami) | tw93 | Large (bundled fonts, about 76 MB) |
| [apple-hig-review](https://github.com/dickwu/apple-design-skill) | dickwu | No license |

## License

The skills in `personal/` are MIT, see [LICENSE](LICENSE). Each skill in `preferences/` keeps its author's license, listed in [`preferences/SOURCES.md`](preferences/SOURCES.md). `bahasa-indonesia-plain` and `english-plain` come from orepras's public gists, which have no license; they are shared here with credit and will be taken down if the author asks.
