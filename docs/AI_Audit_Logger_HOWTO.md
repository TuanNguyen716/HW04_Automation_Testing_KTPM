# How to use the `ai-audit-logger` skill

Keeps a record of every AI interaction (prompt, AI output, your review, your correction)
in `ai-audit-log.json`, and generates `AI Audit Report.md` from it for the HW04 submission.

Run everything from the repo root. Shorthand used below:

```bash
audit() { python3 .claude/skills/ai-audit-logger/scripts/audit.py "$@"; }
```

Each write command takes a **JSON object on stdin** (`<<'JSON' … JSON`), so multi-line
prompts and code paste in without escaping.

---

## 0. Once per homework — already done

```bash
audit init <<'JSON'
{"student_name":"Nguyễn Trần Minh Tuấn","student_id":"20127420","homework_id":"HW04","ai_tool":"Claude"}
JSON
```

Run it again any time to add or change session fields (it merges, never deletes):

```bash
audit init <<'JSON'
{"sut":"https://your-eshop.test","feature":"FR-01 Registration"}
JSON
```

---

## 1. After every AI interaction — log it

Paste the prompt and the AI's answer **verbatim**. Do not summarise, do not rewrite later.

```bash
audit log <<'JSON'
{"category":"Automation script generation",
 "purpose":"Playwright test for TC-01 valid registration",
 "feature":"FR-01 Registration",
 "test_case_id":"TC-01",
 "prompt":"...the exact prompt you sent...",
 "ai_output":"...the exact answer you got...",
 "output_lang":"ts",
 "file_modified":"src/tests/fr01-registration.spec.ts"}
JSON
```

Prints the new ID (`A001`, `A002`, …). Date/time and AI tool fill in automatically.

**Categories** — pick one from `.claude/skills/ai-audit-logger/reference/fields.md`:
Test case analysis · Test data generation · Automation script generation · Data-driven
testing · Assertion design · Selector design · Multi-browser configuration · Debugging ·
Code review · Test maintenance · HTML report generation · Bug analysis · Documentation.

---

## 2. After you review the AI output — record your review

This is the part that earns the marks: your judgement, kept separate from the AI's answer.

```bash
audit update A002 <<'JSON'
{"human_review":"'.btn-primary' is fragile — three buttons on the page share that class.",
 "human_action":"Replaced it with getByRole('button', { name: 'Create account' }).",
 "reason_for_modification":"Selector stability.",
 "accepted":true,
 "modified":true,
 "status":"accepted_with_modification"}
JSON
```

`status` is one of: `accepted`, `accepted_with_modification`, `rejected`, `pending_review`.

---

## 3. Record each mistake the AI made

One command per problem found. Repeat for the same ID as many times as needed.

```bash
audit issue A002 <<'JSON'
{"description":"Fragile CSS selector",
 "severity":"high",
 "why":"The AI could not see the DOM and guessed a common Bootstrap class.",
 "human_correction":"Switched to a role-based locator.",
 "resolution":"Fixed — test green on Chromium, Firefox, WebKit."}
JSON
```

`severity`: `low` · `medium` · `high` · `critical`.

---

## 4. Check what you have

```bash
audit list        # one line per interaction
audit validate    # PASS / WARNING / ERROR
```

- **ERROR** — a required field is missing (`ai_tool`, `timestamp`, `prompt`, `ai_output`). Must fix.
- **WARNING** — no human review / action recorded yet, or status still `pending_review`.
- **PASS** — complete.

Fix a warning by recording what actually happened (step 2), **never** by inventing a review.

---

## 5. Generate the report before submitting

```bash
audit report -o "docs/AI Audit Report.md"
```

Regenerate it every time the log changes. Never edit the Markdown by hand — it is
overwritten. `ai-audit-log.json` is the source of truth.

---

## Rules to remember

- **No secrets.** Passwords, API keys, tokens and cookies are auto-replaced with
  `[REDACTED]` and a `SECURITY:` warning is printed. That is intended — leave it.
- **No invented evidence.** Leave a field out if it did not happen; the report prints
  `_Not provided_`.
- **Reusable.** Same commands for `FR-08 Checkout`, a different AI tool (`"ai_tool":"ChatGPT"`
  per interaction), or the next homework (`audit log --path hw05-audit.json …` — the option goes after the subcommand).

Worked example: `.claude/skills/ai-audit-logger/examples/` (demo data — do not submit it).
