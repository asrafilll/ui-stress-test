# Five patterns that turn into flow changes

During Step 2, test every job against each pattern. A match is a **Flow change** finding at layer L1–L3. State its before and after step counts. Each example comes from a different domain on purpose: learn the shape of the pattern, not the domain.

| Pattern | What it looks like | Typical flow change | Example |
|---|---|---|---|
| **1. The model doesn't match the real world** | The system records something different from what really happens, so users keep the real state somewhere else (a spreadsheet, chat, memory). | Add the missing field, state or entity so the system can answer the user's real question. | **E-commerce returns:** the system marks a return "received" at the warehouse, but in reality it's "received, damaged, waiting for the supplier's decision". Agents track that in a spreadsheet. Add an inspection state with an outcome. |
| **2. Wrong starting point** | The role lands on a generic screen and must navigate or scroll to their job every time. | A home per role; open on today, on "mine", on the next pending action. | **Clinic booking:** reception lands on a month calendar, but their job is today's arrivals. Open on today's list, with the next patient first. |
| **3. Validation comes too late** | A rule the system could check early is only enforced at the final submit, so the user redoes work. | Check when the field is left, or as soon as the data is known; warn before the effort is spent. | **Support queue:** an agent writes a long reply, and only on send learns the ticket was already closed by a colleague. Show "taken by Sam" when the ticket opens, and lock or warn on conflict. |
| **4. One at a time when the job is a batch** | The job covers many items, but the UI handles one per screen or dialog. | Bulk actions, a stepper through the batch, "approve all, then reject the exceptions". | **Expense approvals:** a manager approves 30 routine expenses by opening each one: 30 × 3 taps. Add a select-all list with exceptions flagged, so 90 taps become about 5. |
| **5. The wrong person holds the task** | The person who knows the facts isn't the one who can enter them, so information is relayed by chat, email or paper. | Give the task, or a light version of it, to the person who has the information, on their device. | **Field service:** only the office can close a job, but the technician on site knows it's done and emails photos. Let the technician close it from their phone, with the photos attached. |

## How to spot them

- **Leaving the app** during a job (chat, email, paper, a spreadsheet) is the strongest signal of patterns 1 and 5.
- A **"learn the rule too late"** friction point is pattern 3.
- **The same action repeated N times** in a walk is pattern 4.
- **Navigation or scrolling before the first useful action**, every time, is pattern 2.
- In code:
  - a field users keep asking about that has no column or state (pattern 1);
  - validation only in the submit handler (pattern 3);
  - endpoints that take one ID where the job is a list (pattern 4);
  - a permission check that excludes the role that has the information (pattern 5).

## Friction checklist (mark it for each step of each job)

| Friction | Question |
|---|---|
| Remember | Must the user carry information from another screen or from outside the app? |
| Guess | Is the user unsure what happened or what counts (still counted? saved? sent?) |
| Lose work | Can an error, back, refresh or timeout throw away what they entered? |
| Irreversible | Can one tap do something that can't be undone, with no confirm and no undo? |
| Learn too late | Is a rule revealed only after the effort is spent? |
