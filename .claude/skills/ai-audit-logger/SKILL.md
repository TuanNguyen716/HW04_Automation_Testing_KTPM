---
name: ai-audit-logger
description: Record and maintain an auditable trail of AI-assisted software-testing work - prompt, AI output, human review, human correction, AI mistakes - in a structured ai-audit-log.json, then generate AI_Audit_Report.md from it. Use whenever the user asks to log an AI interaction, start or update an AI audit, record a human review or an AI mistake, validate audit completeness, or produce an AI audit report for a homework/assignment (e.g. HW04 Automation Testing), and use it proactively after generating or reviewing test artifacts (test cases, Playwright scripts, selectors, assertions, test data) in a project that has an ai-audit-log.json.
---

# AI Audit Logger

Keeps a machine-readable trail of AI collaboration on testing work so the process
`AI -> human review -> human correction -> final result` is observable, not hidden.

**`ai-audit-log.json` is the source of truth.** `AI_Audit_Report.md` is regenerated
from it and must never be hand-edited - edits there are lost on the next `report`.

## Tool

All commands are `python3 scripts/audit.py <cmd>` (stdlib only, no install).
Every write command takes **a JSON object on stdin** - that is how multi-line prompts
and code blocks are passed without quoting problems. Options go *after* the subcommand:
`--path <log.json>` (default `ai-audit-log.json`), `--no-redact`.

| Command | Purpose |
| --- | --- |
| `init` | create or merge session metadata (student, homework, tool, repo, feature) |
| `log` | append an AI interaction; auto-assigns `A001`, `A002`, … and a timestamp |
| `update <ID>` | patch an interaction - this is how human review / action / status are added |
| `issue <ID>` | attach an AI mistake or missed item to an interaction |
| `list` | one line per interaction |
| `validate` | PASS / WARNING / ERROR per interaction; exit 1 if any ERROR |
| `report -o AI_Audit_Report.md` | regenerate the Markdown report |
| `selftest` | run the built-in checks in a temp dir |

Field names, categories, severities and issue types: `reference/fields.md`.
Read it before logging so categories stay consistent across the project.

## Workflow

1. **Start once per homework/project**

   ```bash
   python3 scripts/audit.py init <<'JSON'
   {"student_name":"...","student_id":"...","homework_id":"HW04",
    "project_name":"...","ai_tool":"Claude","repo_path":".","feature":"FR-01 Registration"}
   JSON
   ```
   Unknown fields are simply omitted - never invent them. Re-running `init` merges
   new metadata and keeps existing interactions.

2. **Log the interaction immediately after it happens** - the real prompt and the
   real output, verbatim, not a summary written later:

   ```bash
   python3 scripts/audit.py log <<'JSON'
   {"category":"Automation script generation","purpose":"...","feature":"FR-01 Registration",
    "prompt":"...","ai_output":"...","output_lang":"ts","test_case_id":"TC-01","file_modified":"tests/register.spec.ts"}
   JSON
   ```

3. **Record the human review separately.** This is the point of the skill: keep
   *AI output*, *human review* and *human action* as three distinct fields.

   ```bash
   python3 scripts/audit.py update A001 <<'JSON'
   {"human_review":"Selector .btn-primary is fragile - several buttons share the class.",
    "human_action":"Replaced with getByRole('button', { name: 'Login' }).",
    "accepted":true,"modified":true,"reason_for_modification":"...","status":"accepted_with_modification"}
   JSON
   ```

4. **Record each AI mistake or missed item** found during that review:

   ```bash
   python3 scripts/audit.py issue A001 <<'JSON'
   {"description":"Fragile CSS selector","severity":"medium",
    "why":"AI inferred the selector from class names without checking uniqueness in the DOM.",
    "human_correction":"Switched to a role-based locator.","resolution":"Fixed; test re-run green on 3 browsers."}
   JSON
   ```

5. **Validate, then regenerate the report** before submitting:

   ```bash
   python3 scripts/audit.py validate
   python3 scripts/audit.py report -o AI_Audit_Report.md
   ```

## Rules

- **Never invent audit evidence.** If a prompt, output, review or timestamp was not
  actually recorded, leave the field out - the report prints `_Not provided_`. Do not
  reconstruct plausible prompts after the fact, and do not backdate timestamps.
- **Never store credentials.** Passwords, API keys, tokens, bearer headers, cookies and
  JWTs are auto-redacted to `[REDACTED]` and reported on stderr. Only pass `--no-redact`
  when the value is a deliberately fake fixture the user wants kept as evidence.
- **One interaction = one logical AI request.** A follow-up correction round is either
  `follow_up_prompt` on the same entry, or a new entry with `related_id`.
- **Categories are open.** Prefer the list in `reference/fields.md`; if nothing fits, use
  a new short category rather than forcing a bad one - the report groups whatever it finds.
- **Status values**: `accepted`, `accepted_with_modification`, `rejected`, `pending_review`.
- The skill produces evidence of the AI-use process. It does **not** certify that the
  assignment's audit requirements are met - say so rather than claiming compliance.

## Reuse

Nothing is feature-specific. The same skill serves `FR-01 Registration`, `FR-08 Checkout`,
other AI tools (`ai_tool` is per-interaction), and future assignments (`--path` selects a
different log, one per homework). It composes with test-generation and test-review skills:
generate or review an artifact, then immediately `log` + `update` that exchange.

A worked HW04 example (fragile selector found and corrected) is in `examples/`.
