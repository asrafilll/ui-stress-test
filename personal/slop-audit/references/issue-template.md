<!-- slop-id: <criterion-id>:<area> -->
## Problem
<one or two sentences: what the slop is and where>

**Criterion:** `<criterion-id>` · **Kind:** pattern (<count> places) | instance · **Area:** <area>

## Evidence
- `path:line` — <what is wrong here>
- … (max 15, then "+n more")

## Why it matters
<concrete consequence: bug class, security/data risk, cost of every future change>

## How to fix
1. <step>
2. <step>
3. <step>

Follow the repo's own example: `<good_example path>` (or "none — introduce the pattern below").

```<lang>
// before (from <path:line>)
<short snippet>

// after
<short snippet>
```

**For a pattern:** fix new code first, then the highest-churn files listed above; don't rewrite everything in one PR.

## Acceptance criteria
- [ ] <checkable outcome, e.g. no `useEffect` fetching in <area>>
- [ ] existing tests pass; new test added where the repo tests this layer
- [ ] <repo checks command from review-context `checks:`> passes

**Effort:** S | M | L · **Safe for an AI agent:** yes | no (<reason: touches auth/payments/migrations>)

_Found by `/slop-audit` on <date> at `<short commit>`._
