# Finding format (subagent return shape)

Each subagent returns a list of findings. One per root cause.

```yaml
- title: Vendor integration fails with connection reset to gateway
  bucket: Broken            # Broken | Friction | Missing | Opportunity | Hypothesis
  who: vendor (end user), client ops team
  count: 6                  # occurrences seen; "1" is fine, be honest
  evidence:
    - "chat: troubleshot group, 2026-10-13, vendor support — curl error 56 on updateStatus"
    - "code: app/Services/Gateway.php:88 — no retry, error swallowed to generic message"
  workaround: users ping support group to manually check status
  notes: started after port change? unconfirmed
```

Rules:
- `evidence` is mandatory for anything not `Hypothesis`.
- Paraphrase chats; no phone numbers, emails, tokens.
- Prefer the user-visible symptom in `title`, root cause in `notes`.
