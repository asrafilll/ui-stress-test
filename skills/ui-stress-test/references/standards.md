# Standards to judge against

Cite the standard by its short id in each finding (for example `NN-5`, `WCAG 1.4.3`, `Forms-3`).

## Nielsen's 10 usability heuristics (NN-1 … NN-10)
1. Visibility of system status: feedback within about 100 ms, progress for anything over 1 s
2. Match between system and the real world: the user's words, not database field names
3. User control and freedom: undo, cancel, back, an exit from every modal
4. Consistency and standards: same label, same place, same behaviour; follow platform conventions
5. Error prevention: constraints, sensible defaults, confirmation for destructive actions
6. Recognition rather than recall: visible options, recent items, no memorising IDs
7. Flexibility and efficiency: shortcuts, bulk actions and saved filters for power users
8. Aesthetic and minimalist design: every element earns its place; clear hierarchy
9. Help users recognise, diagnose and recover from errors: plain language, the cause, the fix
10. Help and documentation: contextual help where a task is complex

### Severity scale for the score (Nielsen)
Score each heuristic once per role, using the worst finding under it:
0 no usability problem · 1 cosmetic, fix if there's time · 2 minor, low priority · 3 major, high priority · 4 catastrophe, must fix before release.
Total out of 40; lower is better, so call it a "problem score". Compare totals only across audits of the same product and scope that used this scale; a score where 4 meant "good" runs the other way.

## WCAG 2.2 AA (the criteria most often hit)
1.1.1 non-text alternatives · 1.3.1 info and relationships · 1.4.3 contrast · 1.4.4 resize text · 1.4.10 reflow · 1.4.11 non-text contrast · 1.4.12 text spacing · 2.1.1 keyboard · 2.4.3 focus order · 2.4.7 focus visible · 2.4.11 focus not obscured · 2.5.8 target size · 3.3.1 error identification · 3.3.2 labels or instructions · 3.3.7 redundant entry · 3.3.8 accessible authentication · 4.1.2 name, role, value

## Forms
1. One column, labels above the fields, optional fields marked (not required ones), unless the house style says otherwise
2. Validate inline on blur, never on every keystroke. Keep what the user typed after an error.
3. The error message says what went wrong and how to fix it, next to the field. On submit, move focus to the first error.
4. Input types match the data (`inputmode="numeric"`, date pickers, autocomplete attributes)
5. The primary button names the outcome ("Simpan vendor", not "Submit"). Disable it with a pending state while submitting.
6. Long forms: sections, progress, autosave or an unsaved-changes guard

## Tables and data
1. Numbers right-aligned in tabular figures; text left-aligned
2. Sticky header, sortable columns marked, filters visible as chips that can be cleared
3. Mobile strategy chosen on purpose: cards, priority columns, or horizontal scroll with a pinned first column
4. Pagination or virtualisation past about 100 rows; show the total count
5. Bulk select with a clear count and actions; row actions reachable without hover on touch

## Feedback and confirmation
1. Destructive or irreversible actions: a confirm modal with a specific verb ("Hapus 3 vendor")
2. Every completed action: a toast saying what happened, with Undo when possible
3. Loading: a skeleton for content, a spinner for actions, no layout shift when data lands
4. Empty states: explain why it's empty and give the next action

## Screen (L4)
1. The thing this role needs for this job is first, above the fold at the role's device size
2. Time-based views open on today or now, not on the start of the period
3. Lists open on "mine" or "needs action" for roles that work a queue
4. The primary action for the job is visible without scrolling, and there is only one per view
5. Information needed to decide sits next to the decision (no remembering from another screen)

## Navigation and IA
1. The current location is always visible (active nav, breadcrumb, page title)
2. At most one primary action per view
3. Deep links work; the URL reflects filters, tabs and pagination
4. The back button behaves as the user expects

## Visual system
1. Spacing on one scale (4 or 8 px grid); consistent radius and shadow tokens
2. Type scale limited to about 5 or 6 sizes; line length 45 to 75 characters for body text
3. One accent colour for primary actions; status colours that are consistent and meaningful
4. Alignment: shared edges, optical alignment of icons and text

## Platform guidelines
- Web apps: shadcn/Radix behaviour (Dialog, AlertDialog, Sheet, Popover, Command, Sonner toasts)
- Android or Material: Material 3 components, 48 dp targets
- iOS: Apple HIG. For deep iOS or macOS reviews, use an Apple HIG review skill if one exists.

## Performance as UX (live apps only)
LCP under 2.5 s, INP under 200 ms, CLS under 0.1 (Core Web Vitals "good" thresholds). Measure with a PerformanceObserver in the browser when it matters to the flow.
