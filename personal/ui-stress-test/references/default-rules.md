# Rules: where they come from

Load rules in this order. A higher source wins when two conflict.

1. **Project rules:** AGENTS.md, CLAUDE.md, CONTRIBUTING, a design-system doc (DESIGN.md, tokens, a Storybook), a brand guide. They describe this product and win over everything below.
2. **The user's personal rules:** a memory or preferences file, if the environment has one. Apply only the rules about UI, copy or design.
3. **The defaults below**, for anything the first two don't cover.

Cite a rule as `PR:<file>` for project rules, `UR:<name>` for personal rules, or `DR-n` for the defaults. Breaking a rule from any of these sources is a **Fix**.

**Existing brand assets** (logos, mascots, product photography, illustrations already shipped) are exempt from style rules. Report a concern about them as an Improve, never as a Fix.

## Defaults (DR)

1. **DR-1 Confirm in a modal, then toast.** An action that needs confirmation uses a modal dialog with a specific verb ("Delete 3 invoices"), not a browser `confirm()` or an inline "are you sure". Every confirmed or saved action ends with a toast saying what happened, with Undo when it can be undone.
2. **DR-2 No browser-default controls in a styled product.** Selects, checkboxes, date inputs, `alert()` and `confirm()` come from the product's component library.
3. **DR-3 Unhappy paths are designed.** Long text, big counts, empty, many items, errors and offline are handled, each with a written overflow rule (clamp, truncate with the full text on hover or focus, wrap, min and max widths).
4. **DR-4 Data-heavy internal tools have real structure:** navigation in its own panel, scannable cards or tables, key numbers as stat tiles, charts where trends matter, status as chips with text.
5. **DR-5 Images are cropped on their subject**, never a default centre crop that cuts the subject off.
6. **DR-6 No widows** in headings and short UI copy.
7. **DR-7 Copy in plain language** for the product's locale. If a writing-style skill exists for that language, run proposed copy through it.
