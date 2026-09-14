# AI Audit Report

> Generated from `ai-audit-log.json` by the `ai-audit-logger` Agent Skill on 2026-09-14 14:31:56 +0700.
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
| System under test | EShop SUT - backend http://localhost:3000, frontend http://localhost:5173, web admin http://localhost:5174 |
| Feature(s) under test | FR-02 Login and account lockout; FR-11 Order history view (user); FR-12 Access control |
| Audit started | 2026-09-14 10:06:25 +0700 |
| Audit last updated | 2026-09-14 14:31:48 +0700 |
| Interactions recorded | 16 |

## 3. AI Tools Used

| AI tool | Interactions | Used for |
| --- | --- | --- |
| Claude | 15 | Agent Skill development, Automation script generation, Bug analysis, Debugging, Documentation, Test case analysis |
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

### A005 - Review the 12 manually-designed FR-02 test cases for redundancy, missing context and untestable expectations, and propose replacements.

| Field | Value |
| --- | --- |
| Date / time | 2026-09-14 13:22:08 +0700 |
| AI tool | Claude |
| Category | Test case analysis |
| Feature | FR-02 Login and account lockout |
| Test case ID | _Not provided_ |
| File modified | docs/Report.md |
| Commit | _Not provided_ |
| Output accepted | Yes |
| Output modified | No |
| Related interaction | _Not provided_ |
| Final status | accepted |

**Prompt**

```
Please help me create Playwright test cases for automation testing. The system specifications are described in @"docs/System Requirements Specification.md", I have the system running and ready. I want to start with test cases for the FR-02 function, test cases I think are manually described in @docs/HW04.md, The limit is 12 test cases per function; please let me know if any seem redundant, lack context, or are untestable, and feel free to suggest any additional test cases you think should be included.

[follow-up in the same turn] the api specification in the @docs/api_specification.md file.
```

**AI output**

```md
Findings after probing the running SUT:

REDUNDANT (2 slots freed)
- TC-05 is strictly contained in TC-06: 'one wrong password' vs 'two wrong passwords, counter +1 each' share the same flow and assertion. Merged.
- TC-08 and TC-10 are the same case: 'correct credentials during the lock window -> refused'. Identical flow and expectation. Merged.

UNOBSERVABLE AS WRITTEN
- TC-05/TC-06 'counter tang dung 1': the counter is not exposed by the UI or the API. Retested through its only observable consequence - 2 failures must not lock, the 3rd must.
- TC-07/TC-12 expected distinct error messages per cause, but Login.jsx:18 replaces every backend error with one generic sentence. The distinction is only visible on the HTTP response status (401 vs 403), so that is what is asserted.

ADDED (using the 2 freed slots)
- FR02-TC11: email field must be type=email and password field must be type=password. FR-02 states the email type requirement explicitly and it had no coverage.
- FR02-TC12: the login response must not return the account's password.

Final set: 12 automated cases, mapping documented in docs/Report.md section 2.2.
```

**Human review**

Not recorded as a line-by-line review. The user accepted the analysis in practice by asking for it to be written into the main report (docs/Report.md section 2.2) without contesting any of the four changes.

**Human decision / action**

Directed the consolidated 12-case set into docs/Report.md section 2.2.

---

### A006 - Generate a data-driven Playwright suite for FR-02: one spec looped over a separate CSV, three browser projects, HTML report stamped with the student id.

| Field | Value |
| --- | --- |
| Date / time | 2026-09-14 13:22:08 +0700 |
| AI tool | Claude |
| Category | Automation script generation |
| Feature | FR-02 Login and account lockout |
| Test case ID | _Not provided_ |
| File modified | src/tests/fr-02-login-lockout.spec.ts |
| Commit | _Not provided_ |
| Output accepted | _Not provided_ |
| Output modified | _Not provided_ |
| Related interaction | _Not provided_ |
| Final status | pending_review |

**Prompt**

```
Please help me create Playwright test cases for automation testing. The system specifications are described in @"docs/System Requirements Specification.md", I have the system running and ready. I want to start with test cases for the FR-02 function, test cases I think are manually described in @docs/HW04.md, The limit is 12 test cases per function; please let me know if any seem redundant, lack context, or are untestable, and feel free to suggest any additional test cases you think should be included.

[follow-up in the same turn] the api specification in the @docs/api_specification.md file.
```

**AI output**

```ts
Generated via the automation-test-builder skill:
  src/data/fr-02-login-lockout.csv   12 rows, one per test case
  src/tests/fr-02-login-lockout.spec.ts
  src/tests/fixtures.ts              CSV parser + EShop API helpers
  src/playwright.config.ts           chrome / edge / firefox + HTML reporter

No inline test data; the spec reads the CSV at module level:

const rows = readCsv('data/fr-02-login-lockout.csv');
for (const row of rows) {
  test(`${row.tc_id} - ${row.title}`, async ({ page }) => { /* one shared flow */ });
}

Key design decision: every row that needs an account registers its own through POST /api/register, so login_attempts and locked_until always start clean. Without this the 180-second lock leaks between test cases and between browser projects and the suite cannot run in parallel.

Eight assertion patterns used (requirement is 3): toBeVisible/toBeHidden, toBeEnabled, toHaveValue, toHaveAttribute, toHaveJSProperty, toHaveURL, toContainText, and toBe/toEqual/toMatch/not.toHaveProperty.
```

**Human review**

PENDING - the user has not yet performed a line-by-line review of the generated spec. Two points flagged by the AI itself that need a human decision: (1) the login form's labels have no for/id association and the inputs have no name, placeholder or data-testid, so positional CSS (form input) was used instead of a semantic locator; (2) the 'check' column branches the spec into 7 assertion groups rather than a single flow.

**Human decision / action**

_Not provided_

**Issues found in this output:** The login inputs are located by position - page.locator('for (medium)

---

### A007 - Measure the real lockout behaviour of the SUT and classify every failing assertion as a genuine defect or a test defect.

| Field | Value |
| --- | --- |
| Date / time | 2026-09-14 13:22:08 +0700 |
| AI tool | Claude |
| Category | Bug analysis |
| Feature | FR-02 Login and account lockout |
| Test case ID | _Not provided_ |
| File modified | docs/Report.md |
| Commit | _Not provided_ |
| Output accepted | Yes |
| Output modified | No |
| Related interaction | _Not provided_ |
| Final status | accepted |

**Prompt**

```
Please help me create Playwright test cases for automation testing. The system specifications are described in @"docs/System Requirements Specification.md", I have the system running and ready. I want to start with test cases for the FR-02 function, test cases I think are manually described in @docs/HW04.md, The limit is 12 test cases per function; please let me know if any seem redundant, lack context, or are untestable, and feel free to suggest any additional test cases you think should be included.

[follow-up in the same turn] the api specification in the @docs/api_specification.md file.
```

**AI output**

```md
Measured against freshly registered accounts, then confirmed in the SUT source.

Execution: 24 runs on Chrome + Edge, 14 passed, 10 failed. All 10 failures are genuine product defects, identical on both browsers.

1. Account locks after 2 consecutive failures, FR-02 requires 3.
   backend/server.js:54  const newAttempts = user.login_attempts + 2;   (should be + 1)
2. Lockout lasts 180 seconds, FR-02 specifies 30.
   backend/server.js:57  new Date(Date.now() + 180000)                  (should be 30000)
3. Email field is not type=email, so HTML5 format validation never runs.
   frontend-web/src/pages/Login.jsx:30
4. Password field renders its value in clear text.
   frontend-web/src/pages/Login.jsx:40
5. CRITICAL - the login response returns the account's password to the client.
   backend/server.js:52  res.json({ message, token, user })  serialises the whole row.

Passing cases confirm real behaviour too: FR02-TC10 shows an unknown email and a wrong password return byte-identical responses, so there is no user enumeration.
```

**Human review**

Not recorded as an independent verification. The user accepted the defect list by asking for it to be written into docs/Report.md section 6. The source line citations were re-checked against the SUT before writing.

**Human decision / action**

Directed the 5 defects into docs/Report.md section 6. GitHub Issues not yet filed.

**Issues found in this output:** Reported the wrong lockout threshold. The first probe ran ag (high)

---

### A008 - Get a third browser running for the multi-browser requirement after Firefox failed to launch.

| Field | Value |
| --- | --- |
| Date / time | 2026-09-14 13:22:08 +0700 |
| AI tool | Claude |
| Category | Debugging |
| Feature | FR-02 Login and account lockout |
| Test case ID | _Not provided_ |
| File modified | src/playwright.config.ts |
| Commit | _Not provided_ |
| Output accepted | No |
| Output modified | No |
| Related interaction | _Not provided_ |
| Final status | rejected |

**Prompt**

```
[user, after being offered the choice to swap to WebKit or try to fix Firefox] Try to fix Firefox

[later] I've tried reloading Firefox - please check if it's working now. If it still doesn't work, try using the Zen browser (which I've already installed on the machine).

[later] What bout floorp, can it work?

[later] I just installed floorp, please check again.
```

**AI output**

```bash
Firefox is blocked by a host-environment fault, not by the test code. Two distinct failures on macOS 26 / Darwin 27, Apple Silicon:
  firefox-1543 (FF 155, Playwright 1.63) -> 'Could not find profile folder' in headless
  firefox-1490 (FF 141, Playwright 1.55) -> launches, then deadlocks with
     'RenderCompositorSWGL failed mapping default framebuffer'

Attempted and ruled out: reinstall; --force reinstall; disabling the sandbox; headed mode; re-signing the app bundle inside-out after finding its code signature invalid (Sealed Resources=none, which caused macOS to SIGKILL Firefox's child processes); pinning Playwright 1.55; disabling WebRender and the GPU process via prefs and env vars.

Firefox forks are NOT a substitute. Playwright drives Firefox over the Juggler protocol, which exists only in Playwright's patched builds:
  unzip -l Zen.app/Contents/Resources/omni.ja    | grep -ci juggler  -> 0
  unzip -l Floorp.app/Contents/Resources/omni.ja | grep -ci juggler  -> 0
  unzip -l <playwright firefox>/omni.ja          | grep -ci juggler  -> 19
Floorp was additionally confirmed by a real launch attempt, which failed. Playwright 1.63 exposes no public WebDriver BiDi browser type (only chromium/firefox/webkit), so no stock Firefox build can be driven.

WebKit was verified working on this machine and is available as a substitute. Docker is installed but the daemon was not running; the official mcr.microsoft.com/playwright Linux image has neither fault.
```

**Human review**

The user rejected the AI's first recommendation (swap Firefox for WebKit) and directed it to fix Firefox instead, then proposed Zen and Floorp as alternatives. Both proposals were investigated and shown to be structurally impossible rather than merely unconfigured.

**Human decision / action**

Deferred Firefox ('I'll figure out how to get Firefox working later') and redirected the session back to FR-02. The firefox project was kept in playwright.config.ts; the suite currently covers 24 of 36 runs.

**Reason for modification**

No code change resolved it - the fault is in the host environment's Firefox build, outside the test suite.

---

### A009 - Restructure the main report against the template and fill in the FR-02 automation sections.

| Field | Value |
| --- | --- |
| Date / time | 2026-09-14 13:22:08 +0700 |
| AI tool | Claude |
| Category | Documentation |
| Feature | FR-02 Login and account lockout |
| Test case ID | _Not provided_ |
| File modified | docs/Report.md |
| Commit | _Not provided_ |
| Output accepted | _Not provided_ |
| Output modified | _Not provided_ |
| Related interaction | _Not provided_ |
| Final status | pending_review |

**Prompt**

```
Alright, please update my report at `Report.md`. It currently contains the manual test cases for FR-20 that I devised, but lacks the automated test cases you created with Playwright; please revise the report to make it complete. You can refer to `Main_Report_Template.md` for guidance.
```

**AI output**

```md
Rewrote docs/Report.md against docs/Main_Report_Template.md, preserving the existing header, feature selection, manual test-case table and ASCII workflow diagram.

Added: section 2.2 automated test cases mapped to the manual TC ids plus the consolidation rationale; 3.2 data-driven design and CSV columns; 3.3 the 8 assertion patterns; 3.4 multi-browser config with the Firefox blocker documented; 3.5 HTML report config and the two places the 'Run by:' stamp is set; 4 human review and gap analysis; 5 execution results per browser and per test case; 6 the 5 defects with severity and source line; 7-10 and the appendices.

Source line citations were verified against the SUT before writing: server.js:52/54/57 and Login.jsx:18/30/40.
```

**Human review**

Not yet reviewed. The AI flagged two items for the user's attention: (1) the section 4 'Human Review & Gap Analysis' table was written from what happened in the session, but several entries are the AI catching its own errors rather than the user reviewing AI output, and the assignment asks specifically what the student caught - so attribution needs rewriting in the user's own voice; (2) section 3.4 reports 24 of 36 browser runs and must be updated if Firefox is fixed.

**Human decision / action**

_Not provided_

**Issues found in this output:** The 'Human Review & Gap Analysis' table written into docs/Re (medium)

---

### A010 - Review the 12 hand-written FR-11 test cases in docs/FR-11.md against the running SUT for redundancy, missing context and untestable expectations, within a 12-case budget

| Field | Value |
| --- | --- |
| Date / time | 2026-09-14 13:59:26 +0700 |
| AI tool | Claude |
| Category | Test case analysis |
| Feature | FR-11 Order history view (user) |
| Test case ID | _Not provided_ |
| File modified | docs/FR-11.md (reviewed, not edited) |
| Commit | _Not provided_ |
| Output accepted | Yes |
| Output modified | No |
| Related interaction | _Not provided_ |
| Final status | accepted |

**Prompt**

```
Please help me create Playwright test cases for automation testing. The system specifications are described in @"docs/System Requirements Specification.md", the api specification in @"docs/api_specification.md", I have the system running and ready. I want to start with test cases for the FR-11: Order history view (user) function, test cases I think are described in @docs/FR-11.md, The limit is 12 test cases per function; please let me know if any seem redundant, lack context, or are untestable, and feel free to suggest any additional test cases you think should be included.
```

**AI output**

```md
## Review of your FR-11 list

**Redundant - merged.** TC-04/05/06 ("ma don correct", "ngay correct", "tong tien correct") are three tests over three cells of one row, and none of them state *correct against what*. I collapsed them into one case (FR11-TC04) that asserts all four cells against the record the backend returns for that order, and kept currency **format** separately (FR11-TC05) since "dung dinh dang tien te" is its own clause. That freed 2 slots.

**Lacked context - pinned down against the running app.** Several cases named a page that doesn't exist: there is no /orders route. Order history is the right-hand panel of /profile. Concrete strings now in the spec: empty state = "Ban chua co don hang nao.", logged-out = "Vui long dang nhap", columns = Ma DH / Ngay dat / Tong tien / Trang thai.

**Untestable as worded - reworded.** TC-08 "phan biet mau sac" has no oracle. It's now: N distinct statuses on screen => N pairwise-distinct computed background-color values, none transparent. TC-11 was also under-specified: the UI merely hides the panel, so the test asserts *both* the UI message and that GET /api/orders/my-orders without a token returns 401 - the actual enforcement point.

**Added with the 2 freed slots.** FR11-TC03 (the four required columns exist - traces 1:1 to the SRS "Hien thi:" line) and FR11-TC10 (ownership at the API).

**Not testable at all, so dropped from consideration:** Profile.jsx falls back to status.toUpperCase() (English) for an unknown status, violating the Vietnamese requirement - but the backend whitelists transitions, so no unknown status can be reached through the API. Would need direct DB access.
```

**Human review**

Accepted the consolidation and the 12-case set as proposed, and directed that docs/Report.md be updated to match the automated cases. No changes requested to the case selection.

**Human decision / action**

Approved the set; asked for the audit log and the report section to be written from it.

**Issues found in this output:** Mis-stated the consolidation accounting: claimed merging the (medium)

---

### A011 - Generate the data-driven Playwright suite for FR-11: a 12-row CSV, one spec looped over it, and reusable order-seeding helpers in the shared fixtures

| Field | Value |
| --- | --- |
| Date / time | 2026-09-14 13:59:43 +0700 |
| AI tool | Claude |
| Category | Automation script generation |
| Feature | FR-11 Order history view (user) |
| Test case ID | FR11-TC01..FR11-TC12 |
| File modified | src/data/fr-11-order-history.csv, src/tests/fr-11-order-history.spec.ts, src/tests/fixtures.ts, src/package.json |
| Commit | _Not provided_ |
| Output accepted | Yes |
| Output modified | No |
| Related interaction | A010 |
| Final status | accepted |

**Prompt**

```
(same turn as A010) ... I want to start with test cases for the FR-11: Order history view (user) function ... The limit is 12 test cases per function
```

**AI output**

```ts
data/fr-11-order-history.csv (12 rows):
tc_id,title,check,statuses,amounts,other_user_statuses,expect_rows,expected_message
FR11-TC01,...,list,pending|confirmed,250000|99000,,2,
FR11-TC02,...,empty,,,,0,Ban chua co don hang nao.
FR11-TC03,...,columns,pending,250000,,1,
FR11-TC04,...,fields,shipping,1234567,,1,
FR11-TC05,...,currency,pending,1234567,,1,
FR11-TC06,...,vi_status,pending|confirmed|shipping|delivered|canceled,100000,,5,
FR11-TC07,...,colors,pending|confirmed|shipping|delivered|canceled,100000,,5,
FR11-TC08,...,multiple,pending|confirmed|shipping|delivered|canceled|pending,100000,,6,
FR11-TC09,...,isolation_ui,pending|confirmed,250000,pending|delivered,2,
FR11-TC10,...,isolation_api,pending,250000,pending,1,
FR11-TC11,...,anonymous,,,,0,Vui long dang nhap
FR11-TC12,...,refresh,pending|confirmed|shipping,250000,,3,

Key design decision in tests/fr-11-order-history.spec.ts - date and amount are rendered by the page with toLocaleDateString()/toLocaleString(), i.e. in the BROWSER's locale, so the expected string is derived in-page from the backend value instead of being hard-coded:

  const [expectedDate, expectedAmount] = await page.evaluate(
    ([createdAt, total]) => [
      new Date(createdAt).toLocaleDateString(),
      `${Number(total).toLocaleString()} d`,
    ],
    [order.created_at, order.total_amount],
  );
  await expect(cells.nth(1)).toHaveText(expectedDate);
  await expect(cells.nth(2)).toHaveText(expectedAmount);

Order seeding helpers added to the shared tests/fixtures.ts (registerAndLogin, seedOrders, setOrderStatus, getMyOrders, getOrderById, VI_STATUS), so every row owns a private account and the browser projects never see each other's orders.
```

**Human review**

Accepted. Suite executed against the live SUT: 11 of 12 pass on Chrome and on Edge; the single failure is a genuine product defect, not a script defect.

**Human decision / action**

Kept the generated files; added npm run test:fr11 pinned to Chrome + Edge.

**Issues found in this output:** Ran the new FR-11 suite against all three browser projects e (low), Attempted a TypeScript typecheck with `npx tsc --noEmit` on  (low)

---

### A012 - Classify the single FR-11 failure as a product defect or a test defect, and trace it to source

| Field | Value |
| --- | --- |
| Date / time | 2026-09-14 13:59:56 +0700 |
| AI tool | Claude |
| Category | Bug analysis |
| Feature | FR-11 Order history view (user) |
| Test case ID | FR11-TC10 |
| File modified | _Not provided_ |
| Commit | _Not provided_ |
| Output accepted | Yes |
| Output modified | No |
| Related interaction | A011 |
| Final status | accepted |

**Prompt**

```
(same turn as A010/A011) - run the generated FR-11 suite against the running system and report the outcome
```

**AI output**

```js
FR11-TC10 fails:

  GET /api/orders/30 with another user's token returned 200
  {"id":30,"user_id":110,"total_amount":250000,"status":"pending",...}

backend/server.js:344 - GET /api/orders/:id has NO authenticateToken middleware and no ownership check:

  app.get("/api/orders/:id", (req, res) => {
    db.get("SELECT * FROM orders WHERE id = ?", [req.params.id], (err, order) => {
      if (!order) return res.status(404).json({ error: "Order not found" });
      res.json(order);
    });
  });

Any order is readable by anyone, including unauthenticated callers. This contradicts FR-11 'Nguoi dung chi xem duoc don hang cua chinh minh'. The my-orders list IS correctly scoped (WHERE user_id = ?), which is why FR11-TC09 passes and FR11-TC10 does not. The test was left asserting the correct behaviour (401/403/404) so it stays red until the product is fixed.
```

**Human review**

Confirmed as a genuine product defect (broken object-level authorisation / IDOR), not a test defect. Verified independently with a direct unauthenticated curl against the endpoint before the suite was written.

**Human decision / action**

Kept FR11-TC10 asserting the correct behaviour so the suite stays red until fixed; recorded the defect in the report as FR-11 bug #6.

---

### A013 - Review the 12 draft FR-12 access-control test cases for redundancy, missing context and untestability, then propose the final automated set

| Field | Value |
| --- | --- |
| Date / time | 2026-09-14 14:30:33 +0700 |
| AI tool | Claude |
| Category | Test case analysis |
| Feature | FR-12 Access control |
| Test case ID | _Not provided_ |
| File modified | docs/FR-12.md |
| Commit | _Not provided_ |
| Output accepted | Yes |
| Output modified | No |
| Related interaction | _Not provided_ |
| Final status | accepted |

**Prompt**

```
Please help me create Playwright test cases for automation testing. The system specifications are described in @"docs/System Requirements Specification.md", the api specification in @"docs/api_specification.md", I have the system running and ready. I want to start with test cases for the FR-12 Access control  function, test cases I think are described in @docs/FR-12.md, The limit is 12 test cases per function; please let me know if any seem redundant, lack context, or are untestable, and feel free to suggest any additional test cases you think should be included.
```

**AI output**

```md
[EXCERPT] Findings on the draft set:

- TC-12 ('Admin thuc hien cac thao tac quan tri') is wholly redundant - it is the union of TC-06, TC-08 and TC-10, and has no independent oracle. Dropped.
- TC-07 + TC-09 + TC-11 (user create / edit / delete) are one flow under three HTTP verbs. Merged into FR12-TC10, which walks POST -> PUT -> DELETE and re-reads the record after each to prove the refusal protected the data. 3 cases -> 1.
- TC-08 + TC-10 (admin create / edit) merged into FR12-TC11 as a full create -> read-back -> update -> delete lifecycle.
- TC-04 ('JWT gia/sai') conflates two different failures; split into FR12-TC05 (wrong signature) and FR12-TC06 (payload edited, original signature kept).

Four freed slots spent on paths the draft could not reach:
- FR12-TC03 admin UI guard bypass via localStorage
- FR12-TC06 tampered JWT payload
- FR12-TC09 fully anonymous writes to /api/products
- FR12-TC12 privilege escalation via PUT /api/users/me {"role":"admin"}

Untestable and deliberately excluded: token expiry. backend/server.js:51 signs jwt.sign({id, role}, SECRET_KEY) with no exp claim and no expiresIn, so tokens issued by this build never expire. No input could make such a case fail.
```

**Human review**

Accepted the consolidated 12-case set, including the four replacement cases and the exclusion of the token-expiry case, and instructed that docs/Report.md be updated to match it.

**Human decision / action**

Replied 'Yes, please edit my docs/Report.md matching the use cases you have written'.

---

### A014 - Generate the data-driven FR-12 Playwright suite (spec + CSV + shared helpers) from the reviewed test cases

| Field | Value |
| --- | --- |
| Date / time | 2026-09-14 14:30:59 +0700 |
| AI tool | Claude |
| Category | Automation script generation |
| Feature | FR-12 Access control |
| Test case ID | FR12-TC01..FR12-TC12 |
| File modified | src/tests/fr-12-access-control.spec.ts, src/data/fr-12-access-control.csv, src/tests/fixtures.ts, src/package.json |
| Commit | _Not provided_ |
| Output accepted | _Not provided_ |
| Output modified | _Not provided_ |
| Related interaction | _Not provided_ |
| Final status | pending_review |

**Prompt**

```
(continuation of A013 - same user turn) Generate the Playwright automation for the agreed FR-12 set, following the project's existing data-driven convention: one spec looped over a separate CSV, shared helpers in fixtures.ts, three browser projects, HTML report stamped with the student id.
```

**AI output**

```ts
[EXCERPT] fixtures.ts extended with an FR-12 section: ADMIN_BASE (the Web Admin app on :5174, separate from the storefront baseURL), a TokenKind union ('none'|'invalid'|'tampered'|'user'|'admin'), tamperRole() which edits the JWT payload and keeps the original signature, FORGED_TOKEN, tokenFor(), apiCall(), DENIED = [401,403], and product fixture helpers.

CSV shaped as a credential x resource matrix:

  tc_id,title,check,method,paths,token,expect_status,expected_message
  FR12-TC07,User dung token cua minh goi API Admin thi bi tu choi 403,api_denied,GET,/api/admin/users|/api/admin/orders|/api/coupons,user,403,

Spec branches on row.check and reuses one flow:

  const rows = readCsv('data/fr-12-access-control.csv');
  for (const row of rows) {
    test(`${row.tc_id} - ${row.title}`, async ({ page }) => {
      const user = await registerAndLogin(row.tc_id.toLowerCase());
      const token = await tokenFor(row.token as TokenKind, user);
      ...
    });
  }

Added npm script test:fr12 matching the existing test:fr02 / test:fr11 convention.

Result: 12 cases x 3 browser projects listed; on Chrome and Edge 7 passed / 5 failed, the 5 failures being the access-control defects recorded in A015.
```

**Human review**

_Not provided_ (no review was recorded for this interaction)

**Human decision / action**

_Not provided_

**Issues found in this output:** Teardown could never run: the generated write_denied flow re (high), Exploratory probing corrupted seeded SUT data: PUT /api/prod (high)

---

### A015 - Trace each FR-12 failure to a source line in the SUT and determine whether it is a product defect or a test defect

| Field | Value |
| --- | --- |
| Date / time | 2026-09-14 14:31:28 +0700 |
| AI tool | Claude |
| Category | Bug analysis |
| Feature | FR-12 Access control |
| Test case ID | FR12-TC03, FR12-TC07, FR12-TC09, FR12-TC10, FR12-TC12 |
| File modified | docs/FR-12.md, docs/Report.md |
| Commit | _Not provided_ |
| Output accepted | _Not provided_ |
| Output modified | _Not provided_ |
| Related interaction | _Not provided_ |
| Final status | pending_review |

**Prompt**

```
(continuation of A013 - same user turn) Determine for each failing FR-12 case whether it is a genuine product defect, and cite the responsible source line.
```

**AI output**

```js
[EXCERPT] Four defects, all confirmed in the SUT source and reproduced by direct API calls before any test was written.

Bug 9 (root cause) - no role check exists anywhere. backend/server.js:100-110:
  const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (token == null) return res.status(401).json({ error: "Unauthorized" });
    jwt.verify(token, SECRET_KEY, (err, user) => {
      if (err) return res.status(403).json({ error: "Forbidden" });
      req.user = user; next();
    });
  };
It verifies the signature and never consults req.user.role; no route does either.

Bug 8 - server.js:167,179,191 register POST/PUT/DELETE /api/products with no middleware at all, so anonymous callers write.

Bug 7 (worst by exploitability) - server.js:119-126 destructures role from req.body and applies it, so a user self-promotes; the next login mints a genuine role=admin JWT. Verified end to end on a throwaway account.

Bug 10 - frontend-admin/src/App.jsx:65 puts the role check inside handleLogin only; App.jsx:188 gates the dashboard on if (!token), so a user JWT written to localStorage unlocks the whole Admin UI.

These are one architectural failure seen from four angles: the system authenticates and does not authorise. The seven passing cases support that reading - the signature path (TC-05, TC-06) and the admin operations (TC-01, TC-08, TC-11) are all correct, which localises the fault to the missing role check rather than a broken auth layer.
```

**Human review**

_Not provided_ (no review was recorded for this interaction)

**Human decision / action**

_Not provided_

---

### A016 - Propagate the FR-12 results through docs/Report.md - test case sections, automation approach, execution results, bug table and summary metrics

| Field | Value |
| --- | --- |
| Date / time | 2026-09-14 14:31:28 +0700 |
| AI tool | Claude |
| Category | Documentation |
| Feature | FR-12 Access control |
| Test case ID | _Not provided_ |
| File modified | docs/Report.md, docs/FR-12.md |
| Commit | _Not provided_ |
| Output accepted | _Not provided_ |
| Output modified | _Not provided_ |
| Related interaction | _Not provided_ |
| Final status | pending_review |

**Prompt**

```
Yes, please edit my @../docs/Report.md matching the use cases you have written
```

**AI output**

```md
[EXCERPT] Added sections 2.5 (FR-12 manual cases as drafted) and 2.6 (automated set + consolidation rationale); extended 3.2 with the FR-12 CSV column table and a teardown subsection; added four assertion patterns to 3.3; updated 3.4 browser runs from 48 to 72 of 108; added test:fr12 to 3.5; added three review rows to section 4; added the FR-12 results table and per-case breakdown to section 5 (combined 72 runs, 50 passed, 22 failed); added bugs 7-10 with source citations plus the shared root-cause analysis and minimal fix to section 6; updated sections 8 and 9 (10 bugs, 5 critical).
```

**Human review**

_Not provided_ (no review was recorded for this interaction)

**Human decision / action**

_Not provided_

**Issues found in this output:** An edit to docs/Report.md deleted the entire 'Submission Che (medium), Falsely reported that the HTML report's 'Run by' stamp was m (low)

---

## 5. Human Review and Corrections

| ID | AI proposed | Human review | Human action | Status |
| --- | --- | --- | --- | --- |
| A001 | [Files, not chat text] Produced .claude/skills/ai-audit-logger/ containing: SKILL.md (fro… | Structure and behaviour accepted. Two gaps surfaced while actually using it: (1) the skil… | Accepted the skill. Ran `audit init` with my real name (Nguyen Tran Minh Tuan) and MSSV 2… | accepted_with_modification |
| A002 | [File] docs/AI_Audit_Logger_HOWTO.md - five numbered steps (init once / log each interact… | Content is fine, but I could not tell what `A` meant - it looks like the interaction IDs … | Requested the rename; `A` was replaced with `audit` in both docs/AI_Audit_Logger_HOWTO.md… | accepted_with_modification |
| A003 | Explained that an Agent Skill is instructions for Claude, not a program the student launc… | Answer resolved the confusion - confirmed that running the Python file manually is not re… | Asked Claude to log this working session into the audit log using the skill itself, which… | accepted |
| A005 | Findings after probing the running SUT: REDUNDANT (2 slots freed) - TC-05 is strictly con… | Not recorded as a line-by-line review. The user accepted the analysis in practice by aski… | Directed the consolidated 12-case set into docs/Report.md section 2.2. | accepted |
| A006 | Generated via the automation-test-builder skill: src/data/fr-02-login-lockout.csv 12 rows… | PENDING - the user has not yet performed a line-by-line review of the generated spec. Two… | _Not provided_ | pending_review |
| A007 | Measured against freshly registered accounts, then confirmed in the SUT source. Execution… | Not recorded as an independent verification. The user accepted the defect list by asking … | Directed the 5 defects into docs/Report.md section 6. GitHub Issues not yet filed. | accepted |
| A008 | Firefox is blocked by a host-environment fault, not by the test code. Two distinct failur… | The user rejected the AI's first recommendation (swap Firefox for WebKit) and directed it… | Deferred Firefox ('I'll figure out how to get Firefox working later') and redirected the … | rejected |
| A009 | Rewrote docs/Report.md against docs/Main_Report_Template.md, preserving the existing head… | Not yet reviewed. The AI flagged two items for the user's attention: (1) the section 4 'H… | _Not provided_ | pending_review |
| A010 | ## Review of your FR-11 list **Redundant - merged.** TC-04/05/06 ("ma don correct", "ngay… | Accepted the consolidation and the 12-case set as proposed, and directed that docs/Report… | Approved the set; asked for the audit log and the report section to be written from it. | accepted |
| A011 | data/fr-11-order-history.csv (12 rows): tc_id,title,check,statuses,amounts,other_user_sta… | Accepted. Suite executed against the live SUT: 11 of 12 pass on Chrome and on Edge; the s… | Kept the generated files; added npm run test:fr11 pinned to Chrome + Edge. | accepted |
| A012 | FR11-TC10 fails: GET /api/orders/30 with another user's token returned 200 {"id":30,"user… | Confirmed as a genuine product defect (broken object-level authorisation / IDOR), not a t… | Kept FR11-TC10 asserting the correct behaviour so the suite stays red until fixed; record… | accepted |
| A013 | [EXCERPT] Findings on the draft set: - TC-12 ('Admin thuc hien cac thao tac quan tri') is… | Accepted the consolidated 12-case set, including the four replacement cases and the exclu… | Replied 'Yes, please edit my docs/Report.md matching the use cases you have written'. | accepted |

Interactions where AI output was accepted unchanged: 7 of 16.

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
| A006 | The login inputs are located by position - page.locator('form input').nth(0) and .nth(1) … | medium | Not an AI shortcut: the SUT's form genuinely offers nothing better. The labels have no fo… | None applied. The constraint and its reason are documented in the spec file header so the… | Accepted as a known limitation. Adding or reordering a field in Login.jsx will break thes… |
| A007 | Reported the wrong lockout threshold. The first probe ran against the shared test@eshop.c… | high | The account already carried a failed attempt from an earlier UI interaction in the same s… | Re-measured on a freshly registered account via POST /api/register, which showed the thre… | Fixed. The suite now registers a private account per test row so every measurement starts… |
| A009 | The 'Human Review & Gap Analysis' table written into docs/Report.md section 4 presents AI… | medium | The AI populated a section whose entire purpose is to record what the student caught in A… | Not yet applied - flagged to the user at delivery, with the recommendation to rewrite tho… | Open. Section 4 of docs/Report.md must not be submitted as-is. |
| A010 | Mis-stated the consolidation accounting: claimed merging the field-level cases 'freed 2 s… | medium | The AI counted the merge as 3 cases collapsing into 1 (TC-04 + TC-05 + TC-06 -> FR11-TC04… | Corrected the accounting in docs/Report.md §2.4: 3 original cases (TC-04, TC-05, TC-06) b… | Fixed in the report before submission. The 12 automated cases themselves were unaffected … |
| A011 | Ran the new FR-11 suite against all three browser projects even though Firefox is already… | low | The AI executed the default `playwright test` (all projects) instead of following the pro… | Re-ran through a new `npm run test:fr11` script pinned to Chrome + Edge, matching the exi… | Fixed; src/package.json now carries test:fr11 pinned to Chrome + Edge. Clean run: 22 pass… |
| A011 | Attempted a TypeScript typecheck with `npx tsc --noEmit` on the edited fixtures; TypeScri… | low | The AI assumed a TypeScript compiler was available because the project is written in .ts,… | Used `playwright test --list` as the compile gate instead - it transpiles and loads the s… | Resolved; --list reported all 12 tests, and the subsequent live run executed the spec suc… |
| A014 | Teardown could never run: the generated write_denied flow recorded a wrongly-created row … | high | The AI wrote the cleanup bookkeeping in reading order (call -> assert -> record) without … | Not human-caught. The AI found it by diffing the SUT database against its seed state afte… | Fixed. A full Chrome+Edge run now leaves products at 5, categories at 3 and no stray admi… |
| A014 | Exploratory probing corrupted seeded SUT data: PUT /api/products/1 overwrote the seeded p… | high | Probing an authorisation boundary means sending requests that succeed when the product is… | Not human-caught. The AI noticed the mutated row in a follow-up listing, recovered the or… | Fixed. Product 1 restored to its seeded name, price, description, imageUrl and category_i… |
| A016 | An edit to docs/Report.md deleted the entire 'Submission Checklist' section from the end … | medium | The AI applied a series of string replacements to the whole document without diffing the … | Not human-caught. The AI detected it when a later replacement failed to find its anchor t… | Restored with FR-12 values reflected, and every remaining deleted line in git diff was ch… |
| A016 | Falsely reported that the HTML report's 'Run by' stamp was missing | low | The AI read the report payload's top-level 'title' key, which is absent; the stamp actual… | Not human-caught. The AI re-inspected the payload keys and found the value present and co… | No change needed; the config was already correct. Had the false reading been acted on, it… |

Issues by severity: high=3, low=7, medium=7

## 7. Summary of AI Assistance

| Metric | Value |
| --- | --- |
| Total AI interactions | 16 |
| Interactions with human review recorded | 12 |
| AI outputs accepted as-is | 7 |
| AI outputs accepted after human modification | 2 |
| AI outputs rejected | 1 |
| Issues found during human review | 17 |

**AI usage by category**

| Category | Interactions |
| --- | --- |
| Documentation | 4 |
| Automation script generation | 3 |
| Bug analysis | 3 |
| Test case analysis | 3 |
| Agent Skill development | 2 |
| Debugging | 1 |

## 8. Final Notes

Entries A001-A003 cover the creation of the ai-audit-logger skill itself (2026-09-14). They were logged retrospectively at the end of that working session, so the timestamps are accurate to within a few minutes, not to the second. Prompts marked [EXCERPT] are shortened; the full text is in the Claude Code session transcript.

Entries A005-A009 cover the FR-02 Playwright automation session (2026-09-14). They were logged at the end of that session from the live transcript, so the prompts are verbatim but the timestamps are the logging time, not the time each exchange occurred. A006 and A009 are deliberately left pending_review: the user has not performed a line-by-line review of the generated spec or of the rewritten report, and this log does not claim otherwise. A008 is recorded as rejected because no code change resolved it - Playwright's Firefox will not launch on this host, which is why the suite currently covers 24 of the 36 configured browser runs.

Entries A013-A016 cover the FR-12 Access control session (2026-09-14). Prompts are verbatim from the live transcript; timestamps are the logging time, not the time each exchange occurred. A013 is recorded as accepted because the user explicitly accepted the consolidated 12-case set and asked for the report to be updated to match it. A014, A015 and A016 are left pending_review: the user has not performed a line-by-line review of the generated spec, of the defect analysis, or of the rewritten report sections, and this log does not claim otherwise.

All four issues attached to A014 and A016 were found by the AI itself rather than by the human, and the human_correction field says so in each case. Two of them - the unreachable teardown and the overwritten seed product - were only detectable by comparing the SUT database against its seed state, not from the suite's own pass/fail output. The corrections were applied by the AI in-session and remain unverified by the human.

FR-12 execution: 12 cases x 2 usable browsers = 24 runs, 14 passed, 10 failed, all ten failures being genuine product defects. Firefox remains unlaunchable on this host (see A008), so the three-feature suite covers 72 of the 108 configured browser runs.

**Scope of this report.** It reproduces only what was recorded in `ai-audit-log.json`. It is evidence of the
AI-use process, not a guarantee that the assignment's audit requirements are met - the student
remains responsible for checking the submission against the HW04 specification.
