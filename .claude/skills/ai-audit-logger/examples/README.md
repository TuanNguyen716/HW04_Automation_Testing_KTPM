# Demonstration scenario (fabricated example data)

> The two files beside this README are **example output, not real submission evidence**.
> `ai-audit-log.json` / `AI_Audit_Report.md` here were produced by the commands below to
> show the expected shape of a real audit. Do not submit them.

Scenario: **HW04**, feature **FR-01 Registration**, AI tool **Claude**, task *generate a
Playwright test for valid user registration*. Claude produces a script with a fragile CSS
selector; the human reviews it, identifies three defects, and corrects them.

## Install

The skill lives at `.claude/skills/ai-audit-logger/` in this repo, so Claude Code picks it
up automatically for this project. For every project, copy the directory to
`~/.claude/skills/ai-audit-logger/` instead. No dependencies - Python 3 stdlib only.

Verify: `python3 .claude/skills/ai-audit-logger/scripts/audit.py selftest` -> `selftest OK`

## Run the demo (5-7 minute video script)

```bash
cd .claude/skills/ai-audit-logger/examples
audit() { python3 ../scripts/audit.py "$@"; }        # shorthand

rm -f ai-audit-log.json AI_Audit_Report.md       # 1. start clean
audit init < /dev/stdin                              #    (session JSON on stdin)
audit log  < /dev/stdin                              # 2. log the prompt + AI output verbatim
audit update A002 < /dev/stdin                       # 3. add human review + human action
audit issue  A002 < /dev/stdin                       # 4. record each AI mistake
audit list                                           # 5. show the accumulated trail
audit validate                                       # 6. PASS / WARNING / ERROR
audit report -o AI_Audit_Report.md                   # 7. regenerate the Markdown report
```

The exact JSON payloads used to build these files are the ones in `SKILL.md`'s workflow
section, extended with the FR-01 content visible in `ai-audit-log.json`.

## What the demo shows

| # | Point | Where to look |
| --- | --- | --- |
| 1 | AI output, human review and human action are three separate fields | `A002` in the report, section 4 |
| 2 | AI mistakes are recorded with severity, cause and correction | report section 6 - fragile selector (high), flaky wait (medium), weak assertion (high) |
| 3 | Credentials are never stored | the `A002` prompt shows `password: [REDACTED]`; the logger printed a `SECURITY:` warning when it was logged |
| 4 | Nothing is invented | `A003` has no review yet, so the report prints `_Not provided_` instead of inventing one |
| 5 | Completeness is checkable | `audit validate` -> `2 pass, 1 warning, 0 error`, warning naming `A003` |
| 6 | The log accumulates and is reusable | rerun steps 2-4 for `FR-08 Checkout` with no change to the skill |

## Validation reference

`validate` exits **1** if any ERROR is present, so it can gate a commit:

- **ERROR** - a required HW04 field is missing: `ai_tool`, `timestamp`, `prompt`, `ai_output`
  (also errors when the log has no interactions at all).
- **WARNING** - the interaction is recorded but the human side is not: no `human_review`,
  no `human_action`, `status` still `pending_review`, output rejected with no correction,
  or an issue with no `human_correction`. Also warns when session metadata is missing.
- **PASS** - required fields present and the human review/action/status are recorded.

The validator never fills anything in. Fix a WARNING by recording what actually happened
(`update <ID>`), never by inventing a review.
