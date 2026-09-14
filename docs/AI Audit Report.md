# AI Audit Report

> Generated from `ai-audit-log.json` by the `ai-audit-logger` Agent Skill on 2026-09-14 12:24:16 +0700.
> Every entry below was recorded at the time of the interaction; fields that were
> never recorded are shown as _Not provided_ and are **not** reconstructed after the fact.

## 1. AI Usage Declaration

AI tools were used as a **collaborator** in this assignment, not as an unreviewed code generator.
Every AI-generated artifact listed in this report was read, reviewed and, where necessary,
corrected by the student before being accepted into the deliverable. The prompt, the raw AI
output, the human review and the resulting human action are recorded separately for each
interaction so the contribution of each party is traceable.

Declared by: Nguyễn Trần Minh Tuấn (20127420)

## 2. Project / Homework Information

| Field | Value |
| --- | --- |
| Student name | Nguyễn Trần Minh Tuấn |
| Student ID | 20127420 |
| Homework | HW04 |
| Course | Kiểm thử phần mềm (KTPM) |
| Project | HW04 - Automation Testing |
| Repository / path | ./src |
| System under test | _Not provided_ |
| Feature(s) under test | _Not provided_ |
| Audit started | 2026-09-14 10:06:25 +0700 |
| Audit last updated | 2026-09-14 12:24:06 +0700 |
| Interactions recorded | 4 |

## 3. AI Tools Used

| AI tool | Interactions | Used for |
| --- | --- | --- |
| Claude | 3 | Agent Skill development, Documentation |
| Claude (Claude Code, Opus 5) | 1 | Agent Skill development |

## 4. AI Interaction Log

### A001 - Build a reusable Agent Skill that records the AI audit trail required by HW04

| Field | Value |
| --- | --- |
| Date / time | 2026-09-14 09:40:00 +0700 |
| AI tool | Claude |
| Category | Agent Skill development |
| Feature | HW04 tooling (not a SUT feature) |
| Test case ID | _Not provided_ |
| File modified | .claude/skills/ai-audit-logger/ (SKILL.md, scripts/audit.py, reference/fields.md, examples/) |
| Commit | _Not provided_ |
| Output accepted | Yes |
| Output modified | Yes |
| Related interaction | _Not provided_ |
| Final status | accepted_with_modification |

**Prompt**

```
[EXCERPT - full brief in the session transcript] I am working on HW04 - Automation Testing. The assignment requires the entire AI-use process to be recorded in a complete log (AI tool name, date/time, prompt, AI output) and encourages building Agent Skills that perform these activities automatically. Create a production-quality Agent Skill named `ai-audit-logger` that can: start an audit session; record an AI interaction; classify AI usage; explicitly capture HUMAN REVIEW as distinct from AI OUTPUT and HUMAN ACTION; track AI mistakes and missed items with severity/cause/correction/resolution; maintain ai-audit-log.json as the machine-readable source of truth and generate AI_Audit_Report.md from it; validate audit completeness with PASS/WARNING/ERROR; never store secrets; never invent missing information; stay reusable across features (FR-01 Registration, FR-08 Checkout), AI tools and future assignments. Provide the complete skill: directory structure, SKILL.md, supporting templates, example log, example report, workflow, install and validation instructions, and a demonstration scenario (fragile CSS selector found and corrected).
```

**AI output**

```text
[Files, not chat text] Produced .claude/skills/ai-audit-logger/ containing: SKILL.md (frontmatter + workflow + rules); scripts/audit.py (470 lines, Python stdlib only; subcommands init/log/update/issue/list/validate/report/selftest, JSON on stdin, auto IDs A001.., auto timestamps, credential redaction, built-in selftest); reference/fields.md (field dictionary, open category list, issue types); examples/ (README.md demo walkthrough + generated ai-audit-log.json and AI_Audit_Report.md for the FR-01 fragile-selector scenario). Verified by running `audit.py selftest` -> selftest OK, and by generating the example report (3 interactions, 4 issues, validate = 2 pass / 1 warning / 0 error).
```

**Human review**

Structure and behaviour accepted. Two gaps surfaced while actually using it: (1) the skill shipped with no way visible to me to put my own name and student ID in - I had to ask; (2) the documentation used a bare `A` as the shell shorthand, which collides visually with the interaction IDs A001/A002 and left me unsure whether `A` was part of the tool. I also did not initially understand whether the skill is run in a separate terminal or inside Claude Code.

**Human decision / action**

Accepted the skill. Ran `audit init` with my real name (Nguyen Tran Minh Tuan) and MSSV 20127420 to create the project audit log. Requested a plain usage document, which became docs/AI_Audit_Logger_HOWTO.md. Requested the shorthand be renamed from `A` to `audit`.

**Reason for modification**

Usability of the documentation, not correctness of the tool.

**Issues found in this output:** argparse: --path and --no-redact were defined on the parent  (medium)

---

### A002 - Write a simple usage guide for the ai-audit-logger skill

| Field | Value |
| --- | --- |
| Date / time | 2026-09-14 10:10:00 +0700 |
| AI tool | Claude |
| Category | Documentation |
| Feature | HW04 tooling (not a SUT feature) |
| Test case ID | _Not provided_ |
| File modified | docs/AI_Audit_Logger_HOWTO.md, .claude/skills/ai-audit-logger/examples/README.md |
| Commit | _Not provided_ |
| Output accepted | Yes |
| Output modified | Yes |
| Related interaction | A001 |
| Final status | accepted_with_modification |

**Prompt**

```
please write a simple markdown file how to use the skill.
```

**AI output**

```text
[File] docs/AI_Audit_Logger_HOWTO.md - five numbered steps (init once / log each interaction / record human review / record AI mistakes / validate and generate the report), each with a copy-pasteable command block, plus a shell shorthand defined at the top as `A() { python3 .claude/skills/ai-audit-logger/scripts/audit.py "$@"; }`, the status and severity value lists, and three closing rules (no secrets, no invented evidence, reusable across features and homeworks). Deliberately did not duplicate the field dictionary, linking to reference/fields.md instead.
```

**Human review**

Content is fine, but I could not tell what `A` meant - it looks like the interaction IDs A001/A002 and reads as if it were part of the tool. Asked for it to be renamed.

**Human decision / action**

Requested the rename; `A` was replaced with `audit` in both docs/AI_Audit_Logger_HOWTO.md and the skill's examples/README.md.

**Reason for modification**

Ambiguous naming - a one-letter shorthand collided visually with the A001/A002 interaction IDs.

**Issues found in this output:** Confusing shell shorthand: the guide used a bare `A`, indist (low), Incorrect command syntax in the guide: `audit --path hw05-au (medium)

---

### A003 - Clarify how an Agent Skill is actually invoked

| Field | Value |
| --- | --- |
| Date / time | 2026-09-14 10:20:00 +0700 |
| AI tool | Claude |
| Category | Documentation |
| Feature | HW04 tooling (not a SUT feature) |
| Test case ID | _Not provided_ |
| File modified | _Not provided_ |
| Commit | _Not provided_ |
| Output accepted | Yes |
| Output modified | No |
| Related interaction | A002 |
| Final status | accepted |

**Prompt**

```
Tôi vẫn chưa hiểu là chạy skill thế nào, chạy ở terminal riêng hay là chạy ở trong chính claude code?
```

**AI output**

```text
Explained that an Agent Skill is instructions for Claude, not a program the student launches: (1) inside Claude Code, describe the interaction in plain language and Claude reads SKILL.md and runs audit.py itself; (2) optionally, run the same commands manually in a terminal. Both write to the same ai-audit-log.json and can be mixed. Recommended using method 1 in the homework video, then showing `audit validate` and `audit report` in a terminal.
```

**Human review**

Answer resolved the confusion - confirmed that running the Python file manually is not required.

**Human decision / action**

Asked Claude to log this working session into the audit log using the skill itself, which produced entries A001-A003.

---

### A004 - Build a reusable Agent Skill that turns HW04 test cases into data-driven Playwright scripts (CSV data, >=3 assertions, 3 browsers, HTML report stamped with student name/ID)

| Field | Value |
| --- | --- |
| Date / time | 2026-09-14 12:20:00 +0700 |
| AI tool | Claude (Claude Code, Opus 5) |
| Category | Agent Skill development |
| Feature | HW04 tooling (not a SUT feature) |
| Test case ID | _Not provided_ |
| File modified | .claude/skills/automation-test-builder/ (SKILL.md, templates/playwright.config.ts, templates/fixtures.ts, templates/fixtures.check.spec.ts, templates/feature.spec.ts, templates/feature.csv, examples/login/*) |
| Commit | _Not provided_ |
| Output accepted | _Not provided_ |
| Output modified | _Not provided_ |
| Related interaction | _Not provided_ |
| Final status | pending_review |

**Prompt**

```
Create an Agent Skill named `automation-test-builder` for my HW04 Automation Testing assignment.

Its purpose is to convert test cases into maintainable Playwright automation scripts following these fixed requirements:

1. Data-driven testing - Test data MUST be stored in a separate .csv file. Do NOT use hardcoded inline arrays or objects for test data. Playwright tests must load and use the CSV data. The Skill should support multiple test cases and datasets.
2. Assertions - Generated tests must use at least 3 distinct assertion patterns, for example: toHaveURL(), toHaveText()/toContainText(), toBeVisible()/toBeHidden(), toHaveValue(), toBeEnabled()/toBeDisabled(). Choose assertions that are appropriate to the actual test scenario rather than adding meaningless assertions just to satisfy the count.
3. Browsers - Configure Playwright to run every feature on Chrome, Edge, Firefox. Each feature must be executable on all 3 browsers.
4. HTML reports - Use Playwright HTML Reporter. Every test run must produce an HTML report that visibly contains: `Run by: 20127420 - Nguyễn Trần Minh Tuấn`. Prefer configuring this through Playwright reporter/project metadata rather than manually modifying the generated report after execution.
5. Input - The Skill should accept: Feature/requirement, Test cases, Test data requirements, SUT information, Existing selectors or page information when available. It should generate: Playwright .spec.js or .spec.ts, Separate .csv test-data file, Playwright configuration for Chrome, Edge and Firefox, HTML reporter configuration.
6. Quality rules - Generated scripts should: prefer stable semantic locators (getByRole, getByLabel, etc.); avoid unnecessary hard waits such as waitForTimeout(); include meaningful assertions; avoid duplicated test logic; be reusable and maintainable; never invent selectors, URLs, or application behavior when the provided information does not support them, clearly mark missing information instead.
7. Workflow - Test Cases -> Analyze test steps/data -> Design CSV test data -> Generate data-driven Playwright tests -> Apply >=3 assertion patterns -> Configure Chrome/Edge/Firefox -> Configure HTML Reporter with `Run by: 20127420` -> Validate the generated files -> Provide a short summary of assumptions and potential issues.
8. Deliverables - Create the complete Agent Skill, including: SKILL.md, recommended folder structure, any necessary templates/config files, one small example using a fictional login feature, concise usage instructions.

Design it so I can reuse the same Skill for FR-01, FR-02, FR-03, etc. without modifying the Skill itself. Before presenting the final Skill, verify that it satisfies every requirement above.
```

**AI output**

```text
[Files, not chat text] Created .claude/skills/automation-test-builder/ with 11 files:

- SKILL.md - frontmatter (name + trigger description), Usage block, Input contract table (what to ask for, what to emit as TODO_ when absent), Output layout, 8-step workflow (analyse -> design CSV -> generate spec -> >=3 assertions -> 3 browsers -> HTML report title -> validate -> summarise assumptions), Quality rules (locator priority, no waitForTimeout, single flow per feature, tc_id in test titles), Files list.
- templates/playwright.config.ts - projects chrome (channel 'chrome'), edge (channel 'msedge'), firefox; reporter [['html', { outputFolder: 'playwright-report', open: 'never', title: `Run by: ${RUN_BY}` }], ['list']]; baseURL from process.env.BASE_URL with TODO_BASE_URL fallback.
- templates/fixtures.ts - zero-dependency RFC4180-ish CSV parser (quoted fields, embedded commas/newlines, "" escapes, CRLF, BOM), readCsv() resolved from process.cwd(), isTrue() helper, and `test` extended with an auto fixture pushing annotation { type: 'Run by', description: '20127420 - Nguyen Tran Minh Tuan' } onto every test.
- templates/fixtures.check.spec.ts - unit check for the CSV parser, runs without a browser.
- templates/feature.spec.ts + templates/feature.csv - per-feature skeletons; spec reads the CSV at module level and loops `for (const row of rows) test(...)`, branching on isTrue(row.expect_success).
- examples/login/ - fictional FR-00 login: login.spec.ts, login.csv (4 datasets), README.md, and a 2-page static demo app (login.html + dashboard.html) so the example runs offline.

Verification actually executed in a scratchpad copy of the project (demo app served on localhost):
- `npx playwright test --list` -> 12 tests (4 CSV rows x 3 browser projects); proves data comes from the CSV.
- `npx playwright test --project=chrome --project=edge` -> 10 passed.
- CSV parser unit check passed on all 3 projects.
- Rendered the generated HTML report with Playwright and read the DOM: .header-title = "Run by: 20127420 - Nguyen Tran Minh Tuan"; each test detail page shows the same string as a "Run by" annotation.
- 5 assertion patterns used in the example: toBeEnabled, toHaveValue, toHaveURL, toBeVisible, toContainText.

Not verified: Firefox execution. The bundled Playwright Firefox on this machine fails to launch with "Could not find profile folder", reproduced outside Playwright by launching the binary manually with an explicit -profile directory, and still failing after `npx playwright install --force firefox`. The firefox project is configured and enumerates correctly; only the local browser binary is broken.
```

**Human review**

_Not provided_ (no review was recorded for this interaction)

**Human decision / action**

_Not provided_

**Issues found in this output:** The 'Run by: 20127420 - Nguyễn Trần Minh Tuấn' stamp was fir (medium), SKILL.md's validation step told the user to verify the repor (low), SKILL.md's validation step included `npx tsc --noEmit ...` a (low), The CSV-parser self-check was first written as a standalone  (low)

---

## 5. Human Review and Corrections

| ID | AI proposed | Human review | Human action | Status |
| --- | --- | --- | --- | --- |
| A001 | [Files, not chat text] Produced .claude/skills/ai-audit-logger/ containing: SKILL.md (fro… | Structure and behaviour accepted. Two gaps surfaced while actually using it: (1) the skil… | Accepted the skill. Ran `audit init` with my real name (Nguyen Tran Minh Tuan) and MSSV 2… | accepted_with_modification |
| A002 | [File] docs/AI_Audit_Logger_HOWTO.md - five numbered steps (init once / log each interact… | Content is fine, but I could not tell what `A` meant - it looks like the interaction IDs … | Requested the rename; `A` was replaced with `audit` in both docs/AI_Audit_Logger_HOWTO.md… | accepted_with_modification |
| A003 | Explained that an Agent Skill is instructions for Claude, not a program the student launc… | Answer resolved the confusion - confirmed that running the Python file manually is not re… | Asked Claude to log this working session into the audit log using the skill itself, which… | accepted |

Interactions where AI output was accepted unchanged: 1 of 4.

## 6. AI Mistakes / Missed Issues

| ID | Issue | Severity | Why AI produced/missed it | Human correction | Resolution |
| --- | --- | --- | --- | --- | --- |
| A001 | argparse: --path and --no-redact were defined on the parent parser, so `audit.py log --pa… | medium | Known argparse behaviour - a parent-level option placed after a subcommand is not parsed.… | Caught by the AI's own built-in selftest on first run (not by human review); fixed by mov… | Fixed before delivery. selftest OK. Options now go after the subcommand. |
| A002 | Confusing shell shorthand: the guide used a bare `A`, indistinguishable from the A001/A00… | low | The AI optimised the example commands for brevity without considering that the same lette… | Human asked what `A` meant and requested a rename; the shorthand is now `audit`. | Fixed in both documents. |
| A002 | Incorrect command syntax in the guide: `audit --path hw05-audit.json` - the option must c… | medium | The AI documented the option as if it were global, contradicting its own argparse fix fro… | Not caught by human review; found by the AI while verifying the rename. Corrected to `aud… | Fixed. Would have made the reuse example fail if copied verbatim. |
| A004 | The 'Run by: 20127420 - Nguyễn Trần Minh Tuấn' stamp was first implemented with Playwrigh… | medium | The AI followed the user's hint ('reporter/project metadata') from general knowledge of n… | _Not provided_ | Caught by the AI's own verification (rendered the generated report in a browser and read … |
| A004 | SKILL.md's validation step told the user to verify the report stamp with `grep -r "201274… | low | The AI assumed the HTML report embeds its data as plain text; in this version the report … | _Not provided_ | Found while running the step; replaced with `npx playwright show-report` plus an explicit… |
| A004 | SKILL.md's validation step included `npx tsc --noEmit ...` although TypeScript is not a d… | low | The AI added a conventional type-check step without checking the project's devDependencie… | _Not provided_ | Removed the step. Playwright transpiles the specs itself and `npx playwright test --list`… |
| A004 | The CSV-parser self-check was first written as a standalone Node script (.ts, then .mts) … | low | The AI relied on Node 24 TypeScript type-stripping without accounting for the package's c… | _Not provided_ | Abandoned the standalone runner; the check ships as templates/fixtures.check.spec.ts, run… |

Issues by severity: low=4, medium=3

## 7. Summary of AI Assistance

| Metric | Value |
| --- | --- |
| Total AI interactions | 4 |
| Interactions with human review recorded | 3 |
| AI outputs accepted as-is | 1 |
| AI outputs accepted after human modification | 2 |
| AI outputs rejected | 0 |
| Issues found during human review | 7 |

**AI usage by category**

| Category | Interactions |
| --- | --- |
| Agent Skill development | 2 |
| Documentation | 2 |

## 8. Final Notes

Entries A001-A003 cover the creation of the ai-audit-logger skill itself (2026-09-14). They were logged retrospectively at the end of that working session, so the timestamps are accurate to within a few minutes, not to the second. Prompts marked [EXCERPT] are shortened; the full text is in the Claude Code session transcript.

**Scope of this report.** It reproduces only what was recorded in `ai-audit-log.json`. It is evidence of the
AI-use process, not a guarantee that the assignment's audit requirements are met - the student
remains responsible for checking the submission against the HW04 specification.
