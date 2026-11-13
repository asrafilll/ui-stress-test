---
name: english-plain
description: Write, rewrite, or review English text that people will read, so it is plain, inclusive, and clear on the first read, including for non-native readers. Use when the user asks to "rewrite this", "make this clearer", "simplify this", "proofread", "fix the wording", or "review this copy", and when a task adds or changes user-facing English text such as button labels, error messages, empty states, notifications, emails, guides, or public-service content. Not for Indonesian text (use bahasa-indonesia-plain), and not for code comments, commit messages, API reference, or legal wording.
argument-hint: "[text or file path]"
---

# English plain

Make English text clear on the first read without losing meaning, nuance, or accuracy. Many readers use English as a second language or read through a translation tool, so write for them too.

## Where this applies

Apply this skill only to the target: the text the user asked for, or the user-facing strings the current task adds or changes. If the user passed text or a file path with the command, that is the target.

Do not apply it to your own chat replies, commit messages, code comments, logs, or identifiers.

Leave these as they are:

- code, data, and direct quotations
- legal, contract, and regulatory wording
- names, error codes, and IDs
- technical terms with a defined meaning, such as "require" in a specification

The project wins. If the project has a style guide, a design system, or a clear pattern in its existing text (casing, date format, spelling, button labels), follow it. Use the conventions here only where the project is silent.

## Before you write

Work out four things from the request and the surrounding files:

- who reads the text
- what they need to do or decide
- where it appears and how much room it has
- the voice the product already uses

Ask the user only when you cannot infer the reader or a needed fact, and a wrong guess would change the meaning. Otherwise state your assumption in one line and continue.

## Pick the mode

- Write: produce new text.
- Rewrite: change only the passage the user pointed at. If you see other problems nearby, name them in one line and leave them.
- Review: list findings and suggested wording. Change nothing.

Edit a file in place only when the user asked for that file to be changed, or when the task is already editing it. Otherwise return the text in your reply.

## Four limits

These come before every other rule.

1. Add no facts. Do not invent numbers, comparisons, time estimates, or reassurance such as "Your data is safe". When the text needs a fact you do not have, write a placeholder like `[confirm: refund time]` and tell the user.
2. Keep the meaning. Skip a word swap when it changes what the text commits to. Keep error codes and IDs next to the plain message, because support staff need them.
3. Change text only. When the real fix is a layout change, a new feature, or a translation, recommend it and leave it to the user.
4. Trace changed strings. When you change a string in code, search for the old string in tests, snapshots, selectors, and locale files. Update what the task covers and report the rest.

## Core rules

When two rules conflict, the earlier one in this order wins: accurate, clear, short, warm.

- Start from what the reader needs to know to act, and put it first.
- Keep one idea in a sentence. Aim for 12 to 20 words, and split a sentence that passes 25.
- Use active voice and say who does what.
- Use everyday words, and keep the technical terms the reader already uses.
- Use the exact numbers, names, and dates the source gives.
- Use literal wording. Skip idioms, sports metaphors, and references that depend on one culture.
- Call the reader "you" and the organization "we".
- In an error, say what happened and what to do next, without blame.
- State a deadline only when it is real.
- Cut any word that adds no meaning.

House conventions that differ from common defaults:

- sentence case for headings, buttons, and labels
- dates as "4 June 2026"
- "to" in ranges, not a hyphen or dash
- "for example" and "that is", not "e.g." and "i.e."
- "and", not "&"
- link text that says where the link goes
- bold only for the names of interface elements

## Read a reference when the text calls for it

- Buttons, errors, empty states, confirmations, onboarding, loading, or consent text: read `references/ui-copy.md`.
- Text about people, health, money, or legal trouble, or text with several numbers: read `references/inclusive.md`.
- Text longer than a paragraph, or text with dates, times, currency, lists, headings, or links: read `references/conventions.md`.

A short label or a single message usually needs only `references/ui-copy.md`.

## Check once with RASA

RASA is a four-part check. The name comes from the Indonesian word "rasa" (taste, feeling, meaning).

- Rhythmic: sentences vary in length, no three in a row open the same way, and no phrase forces a reread.
- Accurate: every word means exactly what you intend, no vague qualifier remains, and every fact traces to the source.
- Substantive: every line carries a point. Delete a line if nothing is lost without it.
- Authentic: a person would say it, the tone fits the moment, and it does not read like a translation.

Size the check to the text. For text under about 50 words, make one pass covering all four parts. For longer text, make one pass for each part. Revise once, then deliver. Run the check silently unless the user asks to see it.

## What to return

- Write or rewrite: the text, then up to three short notes covering placeholders, anything you left unchanged on purpose, and non-text recommendations.
- Review: a list with the most harmful finding first. Give each finding as the quoted text, the problem, and a suggested replacement.
- Strings changed during a coding task: make the change, and mention it in your final summary with any tests or locale files you updated or left.
