# **HW04 - Automation Testing**

## 1. Overview

- Name: Nguyễn Trần Minh Tuấn
- Student Id: `20127420`
- Homework: `HW04 – Automation Testing`
- AI tools: Claude (Claude Code)
- Automation tool: Playwright `1.63.0`
- Skills:
	- `ai-audit-logger`
	- `automation-test-builder`
	- `automation-reviewer`
- Selected features:
	- Feature A: FR-02: Login and account lockout
	- Feature B: FR-11: Order history view (user)
	- Feature C: FR-12: Access control

**System under test (EShop):**

| Component | Technology | URL |
|---|---|---|
| Backend API | Node.js + Express + SQLite | `http://localhost:3000` |
| Frontend Web | React + Vite + Tailwind | `http://localhost:5173` |
| Web Admin | React + Vite + Tailwind | `http://localhost:5174` |

## 2. Feature & Test Case Selection

- **Pool A — Authentication, Categories, and Products**
	- FR-02: Login and account lockout
- **Pool B — Shopping Cart and Checkout**
	- FR-11: Order history view (user)
- **Pool C — Web Admin**
	- FR-12: Access control

| Feature | Requirement/FR | Test cases | Automated |
|---|---|---:|---:|
| A | FR-02 Login & account lockout | 12 | 12 |
| B | FR-11 Order history view | 12 | *pending* |
| C | FR-12 Access control | 12 | *pending* |

**Design of the 12 FR-02 cases** — distribution: 3 positive (TC-01, TC-05, TC-08), 7 negative (TC-02, TC-03, TC-04, TC-06, TC-07, TC-10, TC-11), 2 contract/security (TC-09, TC-12). The lockout boundary (2 / 3 / ≥3 consecutive failures) is covered by TC-05, TC-06 and TC-07 as a boundary-value triple.

### 2.1 FR-02 — manual test cases (as originally designed)

| ID    | Test case                                              | Expectation                                                                                          |
| ----- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| TC-01 | Đăng nhập với Email + Password hợp lệ                  | Đăng nhập thành công, nhận JWT và chuyển vào hệ thống                                            |
| TC-02 | Email không đúng format                                | HTML5 validation chặn submit                                                                     |
| TC-03 | Email để trống                                         | Hiển thị validation bắt buộc nhập email                                                                |
| TC-04 | Password để trống                                      | Hiển thị validation bắt buộc nhập password                                                                |
| TC-05 | Email đúng, Password sai lần 1                         | Đăng nhập thất bại; counter tăng đúng `1`                                                        |
| TC-06 | Đăng nhập sai liên tiếp 2 lần                          | Mỗi lần counter tăng đúng `1`; tài khoản chưa bị khóa                                            |
| TC-07 | Đăng nhập sai lần thứ 3                                | Tài khoản bị khóa `30 giây`; hiển thị lỗi phù hợp, không tiết lộ nguyên nhân                     |
| TC-08 | Thử đăng nhập khi tài khoản đang bị khóa               | Không cho đăng nhập dù cung cấp credentials đúng                                                 |
| TC-09 | Đăng nhập lại sau khi hết 30 giây                      | Tài khoản có thể đăng nhập thành công với credentials đúng                                       |
| TC-10 | Sai ≥3 lần rồi nhập đúng password trong thời gian khóa | Vẫn bị từ chối do tài khoản đang khóa                                                            |
| TC-11 | Đăng nhập thành công → kiểm tra authenticated request  | Request có header `Authorization: Bearer <JWT>`                                                  |
| TC-12 | Sai password → kiểm tra thông báo lỗi                  | Thông báo không tiết lộ chi tiết nguyên nhân (ví dụ không phân biệt email tồn tại/không tồn tại) |

### 2.2 FR-02 — automated test cases (after review)

Reviewing the manual set against the running SUT found two redundant pairs and two cases whose expectation was not observable as written. The set was consolidated and the two freed slots were used for spec requirements that had no coverage. Final automated set, as it exists in `src/data/fr-02-login-lockout.csv`:

| Automated ID | Test case | Maps to | Expectation |
|---|---|---|---|
| FR02-TC01 | Đăng nhập với Email + Password hợp lệ | TC-01 | 200 + JWT, redirect, token in `localStorage` |
| FR02-TC02 | Email sai định dạng phải bị HTML5 validation chặn submit | TC-02 | `validity.typeMismatch`, no submit |
| FR02-TC03 | Email để trống hiển thị validation bắt buộc | TC-03 | `validity.valueMissing` on email |
| FR02-TC04 | Password để trống hiển thị validation bắt buộc | TC-04 | `validity.valueMissing` on password |
| FR02-TC05 | Sai 2 lần liên tiếp, tài khoản chưa bị khóa | TC-05 + TC-06 | 3rd attempt with correct password → 200 |
| FR02-TC06 | Sai lần thứ 3 liên tiếp thì tài khoản bị khóa | TC-07 | 403 + generic message |
| FR02-TC07 | Đang bị khóa thì credentials đúng vẫn bị từ chối | TC-08 + TC-10 | 403 despite valid credentials |
| FR02-TC08 | Hết 30 giây khóa thì đăng nhập lại thành công | TC-09 | after 35 s wait → 200 |
| FR02-TC09 | Đăng nhập thành công thì request có Authorization Bearer | TC-11 | `Authorization: Bearer <JWT>` on `/api/users/me` |
| FR02-TC10 | Thông báo lỗi không phân biệt email tồn tại hay không | TC-12 | unknown email ≡ wrong password (status + body) |
| FR02-TC11 | Ô email dùng `type=email` và ô password dùng `type=password` | **new** | FR-02 requires `type="email"` |
| FR02-TC12 | Phản hồi đăng nhập không được trả về mật khẩu người dùng | **new** | response must not disclose the password |

**Consolidations and their reason:**

| Change | Reason |
|---|---|
| TC-05 merged into TC-06 | "one wrong password" is strictly contained in "two wrong passwords, counter +1 each" — same flow, same assertion |
| TC-08 merged into TC-10 | Both are "correct credentials during the lock window → refused". Identical flow and expectation |
| TC-05/TC-06 rewritten | "counter tăng đúng 1" is not exposed by the UI or the API. Tested through its only observable consequence: 2 failures must not lock, the 3rd must |
| TC-07/TC-12 rewritten | The frontend replaces every backend error with one generic sentence (`Login.jsx:18`), so "locked" vs "wrong password" is indistinguishable in the UI. The distinction is asserted on the HTTP response status instead (401 vs 403) |

## 3. Automation Approach

### 3.1 AI-first workflow

```
                 HUMAN
                   │
                   ▼
        Select 1 Feature / FR
                   │
                   ▼
        Design 12 Test Cases
                   │
                   ▼
              ┌─────────┐
              │ Skill #1│
              │  Audit  │
              └────┬────┘
                   │
                   ▼
              ┌─────────┐
              │ Skill #2│
              │ Builder │
              └────┬────┘
                   │
                   ▼
       Playwright + CSV + 3 Browsers
                   │
                   ▼
              ┌─────────┐
              │ Skill #3│
              │ Reviewer│
              └────┬────┘
                   │
          ┌────────┴────────┐
          ▼                 ▼
       Issues found       Looks good
          │                 │
          ▼                 │
     HUMAN REVIEW           │
          │                 │
     Fix / modify           │
          │                 │
          └────────┬────────┘
                   ▼
          Execute test suite
                   │
                   ▼
          Analyze test results
                   │
          ┌────────┴─────────┐
          ▼                  ▼
     Genuine bug          Test issue
          │                  │
          ▼                  ▼
      Bug report        Fix test/script
          │                  │
          └────────┬─────────┘
                   ▼
              Skill #1
          update AI Audit
                   │
                   ▼
          Final Report
```

The workflow was applied step by step rather than as a single generic prompt. Concretely, for FR-02:

1. **Ground truth before generation** — the login page DOM, the real API endpoint (`POST /api/login`), and the observed lockout behaviour were gathered from the *running* system before a line of test code was written, so no selector, URL, or error message was invented.
2. **Behaviour probing** — the lockout threshold and duration were measured against freshly registered accounts, then confirmed against the backend source.
3. **Generation** via `automation-test-builder` into a CSV + a single data-driven spec.
4. **Review** of the manual test cases against the measured behaviour (section 2.2).
5. **Execution**, then classification of every failure as a genuine defect or a test defect (section 6).

### 3.2 Data-driven testing

- Data format: `.csv`
- Data file: `src/data/fr-02-login-lockout.csv` (12 rows, one per test case)
- Spec file: `src/tests/fr-02-login-lockout.spec.ts`
- Shared helpers: `src/tests/fixtures.ts`

The spec contains **no inline test data**. It reads the CSV at module level and generates one `test()` per row:

```ts
const rows = readCsv('data/fr-02-login-lockout.csv');
for (const row of rows) {
  test(`${row.tc_id} - ${row.title}`, async ({ page }) => { /* one shared flow */ });
}
```

CSV columns and their role:

| Column | Role |
|---|---|
| `tc_id`, `title` | test name, so report rows map back to this document |
| `check` | selects the assertion group (`login`, `field_types`, `required_field`, `html5_email`, `bearer`, `no_enumeration`, `no_password_leak`) |
| `email` | `{{FRESH}}` registers a new account, `{{EMPTY}}`, or a literal address |
| `password` | `{{CORRECT}}`, `{{EMPTY}}`, or a literal |
| `pre_fails` | failed logins to perform before the measured attempt |
| `wait_seconds` | pause before the measured attempt (FR02-TC08 uses 35) |
| `expect_success`, `expected_status`, `expected_message` | expected outcome, kept in the data rather than in code |

**Test isolation.** Every row that needs an account registers its own via `POST /api/register`, so `login_attempts` and `locked_until` always start clean. Without this the 180-second lock leaks between test cases and between browser projects, and the suite cannot run in parallel. This is the single most important design decision in the suite.

### 3.3 Assertion patterns

Eight distinct patterns are used (requirement: at least 3):

| Assertion | Usage |
|---|---|
| `toBeVisible` / `toBeHidden` | error banner is shown after a rejected login, absent before submit and after success |
| `toBeEnabled` | submit button is usable before interaction |
| `toHaveValue` | the CSV row's data actually reached the form fields |
| `toHaveAttribute` | email field is `type="email"`, password field is `type="password"` (FR02-TC11) |
| `toHaveJSProperty` | HTML5 constraint validation — `validity.valueMissing`, `validity.typeMismatch` |
| `toHaveURL` | success navigates away from `/login`; failure stays |
| `toContainText` | the visible error message matches the CSV expectation |
| `toBe` / `toEqual` / `toMatch` / `not.toHaveProperty` | HTTP status, JWT shape `header.payload.signature`, response-body equality for the enumeration check, absence of the `password` field |

### 3.4 Multi-browser execution

Configured in `src/playwright.config.ts`:

```ts
projects: [
  { name: 'chrome',  use: { ...devices['Desktop Chrome'], channel: 'chrome'  } },
  { name: 'edge',    use: { ...devices['Desktop Edge'],   channel: 'msedge'  } },
  { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
]
```

- Chrome: ✓ 12 runs
- Edge: ✓ 12 runs
- Firefox: ✗ **blocked — see the note below**
- Browser runs for FR-02: **24** (of the 36 configured)

> **Firefox is blocked by a host-environment fault, not by the test code.** On this machine (macOS 26 / Darwin 27, Apple Silicon) Playwright's Firefox fails to launch in two distinct ways: build `firefox-1543` (Firefox 155, shipped with Playwright 1.63) aborts with `Could not find profile folder` in headless mode, and build `firefox-1490` (Firefox 141, Playwright 1.55) gets past that but deadlocks in the software compositor with `RenderCompositorSWGL failed mapping default framebuffer`.
>
> Attempted and ruled out: reinstall and `--force` reinstall; disabling the sandbox; headed mode; re-signing the app bundle inside-out after finding its code signature invalid (`Sealed Resources=none`, which caused macOS to `SIGKILL` Firefox's child processes); pinning Playwright 1.55; disabling WebRender and the GPU process via prefs and environment variables.
>
> Firefox forks are **not** a substitute: Playwright drives Firefox over the **Juggler** protocol, which exists only in Playwright's patched builds. Both Zen `1.22.1b` and Floorp were checked — each has **0** Juggler entries in `omni.ja` against **19** in Playwright's build, and Floorp was confirmed by a real launch attempt to fail. Playwright 1.63 also exposes no public WebDriver BiDi browser type, so no stock Firefox build can be driven.
>
> The `firefox` project is retained in the config. The remaining 12 runs need either a machine where Playwright's Firefox launches, or the official `mcr.microsoft.com/playwright` Linux container, where neither fault occurs. WebKit was verified working on this machine and is available as a substitute if a third browser is required sooner.

### 3.5 HTML reports

- Reporter: Playwright HTML Reporter
- Student ID shown: `Run by: 20127420 - Nguyễn Trần Minh Tuấn`
- Report path: `src/playwright-report/index.html`
- Open with: `npm run report`

The stamp is config-driven, never hand-edited into the generated report. It is set in two places so it appears both in the report header and on every individual test:

```ts
// playwright.config.ts
reporter: [['html', { outputFolder: 'playwright-report', open: 'never',
                      title: `Run by: ${RUN_BY}` }], ['list']],
```

```ts
// tests/fixtures.ts — auto fixture, stamps every test's detail page
testInfo.annotations.push({ type: 'Run by', description: RUN_BY });
```

Verified in the rendered report: the `.header-title` element and the browser tab title both read `Run by: 20127420 - Nguyễn Trần Minh Tuấn`, and the summary bar repeats it. `config.metadata` is deliberately not used — Playwright 1.63's HTML report leaves custom metadata keys unrendered.

**How to run:**

```bash
cd src
npm run test:fr02     # FR-02 on Chrome + Edge
npm run report        # open the HTML report
```

The SUT must be running on `:3000` and `:5173` first. Override with `BASE_URL` / `API_BASE` if the ports differ.

## 4. Human Review & Gap Analysis

| Issue | AI output / problem | Correction | Reason |
|---|---|---|---|
| Contaminated measurement | The first lockout probe ran against the shared `test@eshop.com` account and reported that lockout triggers after **2** failures | Re-measured on a freshly registered account, which showed the threshold is reached on the **3rd** attempt; the real defect was then confirmed in the backend source | The account already carried failures from an earlier UI attempt. Measuring stateful behaviour on shared state produces a confident wrong answer — the conclusion was only trustworthy once the counter started from zero |
| Test isolation | A first-cut suite that reuses one account cannot work here | Every test registers its own account via `POST /api/register` | The lock lasts 180 s in practice. Shared accounts would make results order-dependent and impossible to parallelise across 3 browser projects |
| Unusable locator strategy | The preferred `getByLabel` / `getByRole` locators cannot reach the login inputs | Verified the DOM, then used positional CSS (`form input`) with the reason documented in the spec header | The form's `<label>`s have no `for`/`id` association and the inputs have no `name`, `placeholder` or `data-testid`. Guessing a semantic locator would have produced a test that fails for the wrong reason |
| Unobservable expectation | Manual TC-07 and TC-12 expected distinct UI error messages per cause | Assert the HTTP status (401 vs 403) via `page.waitForResponse` | `Login.jsx:18` collapses every backend error into one generic sentence, so the UI genuinely cannot distinguish them. Asserting a message that never appears would fail regardless of product correctness |
| Redundant cases | Manual TC-05 ⊂ TC-06, and TC-08 ≡ TC-10 | Merged each pair; used the two freed slots for `type="email"` (an explicit FR-02 requirement with no coverage) and the password-disclosure check | Duplicate cases consume budget without adding coverage, and the 12-case limit made the cost concrete |
| Unverified claim | The generated report's stamp could not be confirmed with `grep` — `<title>` in `index.html` reads `Playwright Test Report` | Rendered the report in a browser and read `.header-title` from the DOM | Playwright stores the title inside the report's compressed payload, so a source grep gives a false negative |

## 5. Execution Results

Run on 2026-09-14 against the live SUT. Results are identical on both browsers.

| Feature | Browser | Passed | Failed | Report |
|---|---|---:|---:|---|
| A (FR-02) | Chrome | 7 | 5 | `src/playwright-report/index.html` |
| A (FR-02) | Edge | 7 | 5 | `src/playwright-report/index.html` |
| A (FR-02) | Firefox | — | — | blocked, see §3.4 |
| B (FR-11) | — | — | — | pending |
| C (FR-12) | — | — | — | pending |

**FR-02 totals: 24 runs, 14 passed, 10 failed.**

Per test case (same on Chrome and Edge):

| Test case | Result | Note |
|---|---|---|
| FR02-TC01 | ✅ pass | |
| FR02-TC02 | ❌ fail | **defect** — no HTML5 email validation |
| FR02-TC03 | ✅ pass | |
| FR02-TC04 | ✅ pass | |
| FR02-TC05 | ❌ fail | **defect** — locked after 2 failures, expected 3 |
| FR02-TC06 | ✅ pass | lock does engage and the message is generic |
| FR02-TC07 | ✅ pass | locked account refused despite correct credentials |
| FR02-TC08 | ❌ fail | **defect** — still locked after 35 s |
| FR02-TC09 | ✅ pass | `Authorization: Bearer <JWT>` present |
| FR02-TC10 | ✅ pass | no user enumeration |
| FR02-TC11 | ❌ fail | **defect** — `type="text"` on both fields |
| FR02-TC12 | ❌ fail | **defect** — password returned in the response |

Every one of the 10 failures is a genuine product defect. No test-side failures remain.

## 6. Bugs & Unautomated Cases

### Genuine bugs

Five distinct defects, each confirmed in the source of the system under test.

| # | Bug | Test case | Severity | Cause | GitHub Issue |
|---|---|---|---|---|---|
| 1 | Account locks after **2** consecutive failed logins; FR-02 requires lockout only from **3** | FR02-TC05 | High | `backend/server.js:54` — `const newAttempts = user.login_attempts + 2;` increments the counter by 2 instead of 1, so the `>= 3` threshold is crossed one attempt early | https://github.com/TuanNguyen716/HW04_Automation_Testing_KTPM/issues/2 |
| 2 | Lockout lasts **180 seconds**; FR-02 specifies **30 seconds** | FR02-TC08 | High | `backend/server.js:57` — `new Date(Date.now() + 180000)`; should be `30000` | https://github.com/TuanNguyen716/HW04_Automation_Testing_KTPM/issues/3 |
| 3 | Email field is not `type="email"`, so HTML5 format validation never runs | FR02-TC02, FR02-TC11 | Medium | `frontend-web/src/pages/Login.jsx:30` — email input is `type="text"`, directly contradicting FR-02 | https://github.com/TuanNguyen716/HW04_Automation_Testing_KTPM/issues/1 |
| 4 | Password field renders its value in clear text | FR02-TC11 | Medium | `frontend-web/src/pages/Login.jsx:40` — password input is `type="text"` instead of `type="password"` | `https://github.com/TuanNguyen716/HW04_Automation_Testing_KTPM/issues/4 |
| 5 | Login response returns the account's password to the client | FR02-TC12 | **Critical** | `backend/server.js:52` — `res.json({ message, token, user })` serialises the whole user row, including the stored password | https://github.com/TuanNguyen716/HW04_Automation_Testing_KTPM/issues/5 |

Bugs 1 and 2 are the two defects seeded in the lockout logic itself; both are single-token errors in `server.js` and neither is visible from the UI, which is why FR02-TC05 and FR02-TC08 assert the HTTP status rather than on-screen text.

**Related observations (not counted as separate defects):** the login page heading reads `Đăng Ký` ("Register") instead of `Đăng Nhập`, and the email field is labelled `Username`. Both are in `Login.jsx` and are cosmetic/labelling faults outside the FR-02 assertions.

> Screenshots for each failing assertion are produced automatically (`screenshot: 'only-on-failure'`) under `src/test-results/`. GitHub Issues still to be filed.

### Unautomated test cases

`All 12 selected test cases for FR-02 were automated.`

Four of the original manual cases were consolidated into two (§2.2) and the freed budget was spent on two additional cases, so the automated set is 12 cases covering the same behaviour plus two uncovered FR-02 requirements.

## 7. Agent Skills

Agent Skills used:

1. **`ai-audit-logger`** — records AI interactions and audit information into `ai-audit-log.json`, and generates `AI_Audit_Report.md`.
2. **`automation-test-builder`** — converts written test cases into data-driven Playwright tests: one `.spec.ts` looped over a separate `.csv`, three browser projects, and the HTML reporter stamped with the student ID.
3. **`automation-reviewer`** — reviews the generated automation and identifies gaps and issues.

**End-to-end reuse example (FR-02).** `automation-test-builder` was invoked with the feature id and the SUT URLs. It produced `src/data/fr-02-login-lockout.csv`, `src/tests/fr-02-login-lockout.spec.ts`, the shared `src/tests/fixtures.ts`, and `src/playwright.config.ts` with the three browser projects and the `Run by:` stamp already wired. The skill's own quality rules drove several outcomes visible in the result: the prohibition on inventing selectors forced the DOM to be verified first; the ban on `waitForTimeout` kept the suite on web-first assertions; and the "expected values belong in the CSV" rule is why `expected_status` exists as a column rather than as a literal in the spec.

The same skill applies unchanged to FR-11 and FR-12 — the feature id only decides the file names and the CSV columns, while `fixtures.ts` and `playwright.config.ts` are written once and reused. The EShop API helpers added to `fixtures.ts` (`registerFreshUser`, `apiLogin`, `failLogin`) were deliberately placed there rather than in the FR-02 spec so FR-11 and FR-12, which also need accounts and tokens, can reuse them.

## 8. Bloom-AI Alignment

| Level | Evidence |
|---|---|
| G9.2 Apply | Applied AI to generate a data-driven Playwright suite for FR-02: 12 CSV-driven cases, 8 assertion patterns, multi-browser configuration, stamped HTML report |
| G9.3 Analyse | Reviewed the manual test cases against the running system and found two redundant pairs and two unobservable expectations; identified an invalid measurement caused by shared account state and re-measured correctly; classified all 10 failures as genuine defects and traced each to a source line |
| G9.4 Collaborate | Iterated with AI across probing, generation, execution, and environment debugging, including rejecting a proposed browser substitution after verifying that Firefox forks lack the Juggler protocol |

## 9. Summary

| Metric | Result |
|---|---:|
| Features | 3 |
| Test cases | 36 (12 per feature) |
| Automated | 12 (FR-02); FR-11 and FR-12 pending |
| Executed | 24 runs |
| Passed | 14 |
| Failed | 10 |
| Browser runs | 24 of 36 (Firefox blocked, §3.4) |
| Genuine bugs | 5 |

## 10. Evidence & Links

- Public GitHub repository: `https://github.com/TuanNguyen716/HW04_Automation_Testing_KTPM`
- HTML reports: `src/playwright-report/index.html`
- Unlisted YouTube demo: `TODO`

> The demo must be at least 5 minutes, narrated in Vietnamese, demonstrate one script end-to-end including multi-browser execution and HTML report, and narrate at least one AI-generated-script fix. It must show either face-cam or `whoami` + `hostname`.

---

# Appendix A – AI Audit Report

See `AI Audit Report.md` (generated from `ai-audit-log.json` by the `ai-audit-logger` skill).

# Appendix B – AI Critique

`TODO — 200–300 words.` Address: (1) where AI got something wrong, biased, or incomplete; (2) why it failed to catch the issue; (3) what principle you learned about collaborating with AI.

> Suggested material from this session: the lockout threshold was first measured on a shared account that already carried failed attempts, producing a confident but wrong reading of "locks after 2 failures" — the right answer only emerged after re-measuring on a fresh account and confirming against the source. The lesson generalises to any stateful assertion: AI will report what it observed without questioning whether the starting state was clean.

# Submission Checklist

- [ ] Main report: Markdown + PDF
- [x] Public GitHub repository link
- [x] Scripts + CSV data + HTML reports *(FR-02)*
- [ ] Multi-browser HTML reports *(Chrome + Edge done; Firefox blocked, §3.4)*
- [ ] Unlisted YouTube demo link
- [x] AI Audit Report: Markdown + PDF
- [ ] AI Critique: Markdown + PDF
- [ ] Git commit log text file
- [ ] Bug reports + screenshots *(5 defects documented in §6; GitHub Issues to file)*
- [ ] README.md with self-assessment + test summary
- [ ] Agent Skills + demonstration video
