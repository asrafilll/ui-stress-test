# Slop criteria

Each criterion: id, what to look for, Grep signals to count spread, default severity. Raise to `high` only for the cases listed in SKILL.md §3. Always check the repo convention first: if the repo has a good example, cite it in `good_example`.

## Frontend

| id | Look for | Grep signals | Default |
|---|---|---|---|
| fe-effect-misuse | `useEffect` for data fetching, derived state, syncing props→state, or chains of effects, where the repo has a data layer (React Query, loaders, server components) | `useEffect\(`, `fetch\(` inside effects, `setX(props.` | medium |
| fe-duplicate-ui | Buttons/modals/tables/forms/inputs re-implemented when a shared component exists; same component copied with small tweaks | Glob `components/**`; `<button`, `<dialog`, `role="dialog"`, `<table` in feature files | medium |
| fe-god-component | Component file > ~400 lines mixing fetching, business logic, and markup | file size from inventory | medium |
| fe-state-sprawl | 6+ `useState` in one component, same data in two stores, prop drilling 4+ levels | `useState\(` count per file | low |
| fe-data-layer | Mixed fetching styles in one app; ad-hoc query keys; mutations without invalidation | `useQuery\(`, `queryKey`, `invalidateQueries`, `axios\.|fetch\(` | medium |
| fe-missing-states | No loading/empty/error state; generic "something went wrong" where cause is known | `isLoading`, `isError`, `catch`, empty-list rendering | medium |
| fe-hardcoded-style | Hex colours, px spacing, inline style objects instead of tokens/theme | `#[0-9a-fA-F]{3,6}`, `style=\{\{` | low |
| fe-a11y-basics | Clickable div/span, input without label, icon button without accessible name | `onClick` on `div|span`, `<input` without `aria-label|id`+`label` | medium |

## Backend

| id | Look for | Grep signals | Default |
|---|---|---|---|
| be-fat-handler | Route handlers holding business logic + DB access + validation instead of the repo's service layer | DB client calls (`prisma\.`, `db\.`, `knex`) inside route files | medium |
| be-validation-gap | Request bodies cast (`as X`) instead of schema-validated; duplicated validation | `await req.json\(\) as`, `body as`, `c.req.json<` without schema | medium (high on money/auth) |
| be-authz-scoping | Mutation without the permission check sibling endpoints use; queries missing tenant/user filter | compare handlers in same module; `where:` without tenant key | high |
| be-n-plus-one | DB/HTTP call inside a loop; `Promise.all(items.map(async … db…))` per row | `for (…) { … await prisma`, `.map(async` + DB call | medium (high on hot paths) |
| be-unbounded-query | `findMany`/`select` without `take`/`limit` on user-growing tables; over-fetching full rows | `findMany\(` without `take`, `SELECT \*` | medium |
| be-error-swallow | Empty `catch`, catch-log-continue, inconsistent error shapes across endpoints | `catch \(\w*\) \{\s*\}`, `catch.*console\.(log|error)` | medium (high on money/auth) |
| be-copy-paste | Same helper/CRUD block written 3+ times; constants defined in several files | identical function names in many files; repeated literal blocks | medium |
| be-missing-transaction | Multiple related writes that can half-succeed | consecutive `create|update|delete` without `$transaction`/`transaction` | medium (high on money) |
| be-log-hygiene | Secrets/PII in logs, debug logs in production paths | `console\.log`, logger calls with `password|token|secret|email|phone` | low (high if secret/PII) |

## Both

| id | Look for | Grep signals | Default |
|---|---|---|---|
| x-dead-code | Unused exports/files, always-true flags, prototype routes still shipped, commented-out blocks | exported names with no importers (Grep the name), `if (true`, large `//` blocks | low |
| x-fake-abstraction | Wrapper/helper/"manager" with one caller that adds nothing; pass-through layers | Grep callers of each small wrapper | low |
| x-ai-fingerprint | Comments restating code, defensive checks for impossible states, "for future use" code, placeholder/mock data in prod paths | `// (Get|Set|Return|Check) the`, `TODO`, `lorem`, `mock`, `dummy`, `example.com` | low |
| x-type-erosion | `any`, `as unknown as`, non-null `!`, `@ts-ignore`/`@ts-expect-error`, lint-disable in a strict repo | `: any`, `as any`, `as unknown as`, `@ts-ignore`, `eslint-disable`, `biome-ignore` | medium if spreading, else low |
| x-inconsistency | Naming, file layout, or module structure that differs from the dominant convention | compare sibling modules | low |
| x-untested-risk | Money/auth/migration/webhook modules with no tests while the repo tests other layers | Glob tests next to danger-zone files | medium |

## Severity ladder
- **high**: data leak/loss, missing authz/tenant scoping, swallowed errors on money/auth, N+1/unbounded on hot paths, secrets/PII in logs.
- **medium**: will cause bugs or slow every future change (duplication, misuse of the framework, missing states).
- **low**: hygiene, consistency, dead code.
