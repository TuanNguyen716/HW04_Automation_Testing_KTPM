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
| B | FR-11 Order history view | 12 | 12 |
| C | FR-12 Access control | 12 | *pending* |

**Design of the 12 FR-02 cases** — distribution: 3 positive (TC-01, TC-05, TC-08), 7 negative (TC-02, TC-03, TC-04, TC-06, TC-07, TC-10, TC-11), 2 contract/security (TC-09, TC-12). The lockout boundary (2 / 3 / ≥3 consecutive failures) is covered by TC-05, TC-06 and TC-07 as a boundary-value triple.

**Design of the 12 FR-11 cases** — distribution: 8 display/content (TC-01, TC-03 … TC-08, TC-12), 1 empty-state edge case (TC-02), 3 access control (TC-09, TC-10, TC-11). FR-11 is a read-only view, so the budget goes to *what is rendered* and *whose data it is*, rather than to input validation. The three access-control cases attack the same requirement from three angles: another user's rows must not appear in the table (TC-09), must not be reachable through the API (TC-10), and no rows at all may be served without a session (TC-11).

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



### 2.3 FR-11 — manual test cases (as originally designed)

| ID    | Test case                                     | Expected result                                             |
| ----- | --------------------------------------------- | ----------------------------------------------------------- |
| TC-01 | User đăng nhập và mở **Order History**        | Hiển thị danh sách lịch sử đơn hàng của user                |
| TC-02 | User không có đơn hàng                        | Hiển thị trạng thái/danh sách rỗng phù hợp                  |
| TC-03 | Kiểm tra thông tin một đơn hàng               | Có **Mã đơn, Ngày đặt, Tổng tiền, Trạng thái**              |
| TC-04 | Kiểm tra mã đơn hàng                          | Mã đơn được hiển thị chính xác                              |
| TC-05 | Kiểm tra ngày đặt hàng                        | Ngày đặt được hiển thị chính xác                            |
| TC-06 | Kiểm tra tổng tiền                            | Tổng tiền hiển thị chính xác và đúng định dạng tiền tệ      |
| TC-07 | Kiểm tra trạng thái đơn hàng                  | Trạng thái được hiển thị bằng **tiếng Việt**                |
| TC-08 | Kiểm tra màu sắc trạng thái                   | Các trạng thái được **phân biệt bằng màu sắc**              |
| TC-09 | User có nhiều đơn hàng                        | Tất cả đơn hàng của user được hiển thị, không thiếu dữ liệu |
| TC-10 | User A mở lịch sử đơn hàng                    | Không xuất hiện đơn hàng thuộc User B                       |
| TC-11 | User chưa đăng nhập truy cập Order History    | Không được xem lịch sử đơn hàng; yêu cầu authentication     |
| TC-12 | Refresh trang Order History sau khi đăng nhập | Lịch sử đơn hàng vẫn được tải và hiển thị đúng              |

### 2.4 FR-11 — automated test cases (after review)

Reviewing this set against the running SUT found one three-way redundancy and two expectations with no usable oracle. It also found a factual error running through several cases: **there is no Order History page.** Order history is the right-hand panel of `/profile`, under the heading `Lịch sử đơn hàng`, and it is the only `<table>` on that page. Final automated set, as it exists in `src/data/fr-11-order-history.csv`:

| Automated ID | Test case | Maps to | Expectation |
|---|---|---|---|
| FR11-TC01 | Đăng nhập qua UI rồi mở Lịch sử đơn hàng thì thấy đơn của mình | TC-01 | real form login → `/profile`, rows = the user's order ids |
| FR11-TC02 | User chưa có đơn hàng nào thì hiển thị trạng thái rỗng | TC-02 | `Bạn chưa có đơn hàng nào.`, no table |
| FR11-TC03 | Bảng có đủ 4 cột Mã đơn / Ngày đặt / Tổng tiền / Trạng thái | TC-03 | column headers `Mã ĐH`, `Ngày đặt`, `Tổng tiền`, `Trạng thái` |
| FR11-TC04 | Bốn giá trị của một đơn hàng khớp với dữ liệu backend | TC-04 + TC-05 + TC-06 | all four cells equal the record returned by `/api/orders/my-orders` |
| FR11-TC05 | Tổng tiền đúng định dạng tiền tệ có phân nhóm và ký hiệu ₫ | TC-06 (format clause) | `1234567` → grouped + `₫`; digits still equal the total |
| FR11-TC06 | Mọi trạng thái được dịch sang tiếng Việt và không lộ mã tiếng Anh | TC-07 | all 5 statuses show their Vietnamese label; no `pending`/`confirmed`/… in the table |
| FR11-TC07 | Các trạng thái khác nhau được phân biệt bằng màu sắc khác nhau | TC-08 | 5 statuses → 5 pairwise-distinct computed `background-color`, none transparent |
| FR11-TC08 | User có nhiều đơn hàng thì hiển thị đủ không thiếu dòng nào | TC-09 | 6 seeded orders → the displayed id set equals the API id set |
| FR11-TC09 | Lịch sử của User A không chứa đơn hàng của User B | TC-10 | User B's order ids absent from the table |
| FR11-TC10 | API chỉ trả đơn hàng của chính chủ token | **new** | `my-orders` scoped to the token; `GET /api/orders/:id` of another user must be refused |
| FR11-TC11 | Chưa đăng nhập thì không xem được lịch sử đơn hàng | TC-11 | `Vui lòng đăng nhập`, no table, no `/api/orders` request, API → 401 |
| FR11-TC12 | Refresh trang vẫn tải và hiển thị đúng lịch sử đơn hàng | TC-12 | after reload, identical rendered table |

**Consolidations and their reason:**

| Change | Reason |
|---|---|
| TC-04 + TC-05 + TC-06 merged into FR11-TC04, with TC-06's format clause split out as FR11-TC05 | Three cases asserting three cells of one row, and none of them said *correct against what*. FR11-TC04 binds all four cells to the record the backend returns for that order; the currency **format** requirement is a separate clause and keeps its own case. Net: 3 cases → 2, one slot freed |
| The freed slot spent on FR11-TC10 | FR-11's "chỉ xem được đơn hàng của chính mình" was only covered at the UI list level (TC-10). The same rule at the API had no coverage — and that is exactly where it is broken (§6, bug 6) |
| TC-03 reworded | "Có Mã đơn, Ngày đặt, Tổng tiền, Trạng thái" was ambiguous between *the columns exist* and *the values are right*. Split cleanly: FR11-TC03 checks the four required columns, FR11-TC04 checks the values |
| TC-08 rewritten | "Phân biệt bằng màu sắc" has no oracle as written. Restated as a measurable property: N distinct statuses on screen must yield N distinct computed background colours, none of them transparent |
| TC-11 strengthened | The frontend merely hides the panel and never calls the API when the token is null, so the UI alone proves nothing about authorisation. The case now asserts the UI message, the *absence* of any `/api/orders` request, **and** that a direct unauthenticated call returns 401 |
| TC-01 kept on the real login form | Every other row seeds its session by writing the JWT to `localStorage`. TC-01 is specified as "user logs in and opens Order History", so it alone drives the actual `/login` form and the header link, to keep that path covered |

**Considered and rejected as untestable.** `Profile.jsx:99` falls back to `status.toUpperCase()` — raw English — for any status outside the known five, which would violate the Vietnamese-label requirement. It cannot be reached: `PUT /api/admin/orders/:id/status` whitelists transitions, so no unknown status can be written through the API. Testing it would need direct SQLite access, which is outside the automation boundary.


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

The same five steps were repeated for FR-11. Step 1 mattered even more there: the manual test cases referred to an "Order History" page, and the DOM probe showed that no such route exists — the panel lives inside `/profile`. Had the suite been generated from the test-case document alone, all 12 cases would have failed on `page.goto('/orders')` and none of them would have tested FR-11 at all.

### 3.2 Data-driven testing

- Data format: `.csv`
- Data files: `src/data/fr-02-login-lockout.csv`, `src/data/fr-11-order-history.csv` (12 rows each, one per test case)
- Spec files: `src/tests/fr-02-login-lockout.spec.ts`, `src/tests/fr-11-order-history.spec.ts`
- Shared helpers: `src/tests/fixtures.ts` (one file, reused by both features)

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

FR-11 uses the same structure with its own columns:

| Column | Role |
|---|---|
| `tc_id`, `title` | test name, so report rows map back to this document |
| `check` | selects the assertion group (`list`, `empty`, `columns`, `fields`, `currency`, `vi_status`, `colors`, `multiple`, `isolation_ui`, `isolation_api`, `anonymous`, `refresh`) |
| `statuses` | pipe-separated orders to seed for the test's own user, e.g. `pending\|confirmed\|shipping\|delivered\|canceled` |
| `amounts` | pipe-separated totals; a single value is reused for every order |
| `other_user_statuses` | orders seeded for a *second* user, used by the isolation cases |
| `expect_rows` | expected number of table rows |
| `expected_message` | the empty-state or login-prompt text |

**Test isolation.** Every row that needs an account registers its own via `POST /api/register`, so `login_attempts` and `locked_until` always start clean. Without this the 180-second lock leaks between test cases and between browser projects, and the suite cannot run in parallel. This is the single most important design decision in the suite.

The same rule carries FR-11: each row registers its own user and seeds that user's orders through `POST /api/checkout` plus admin status transitions, so order ids never collide across rows or across browser projects, and the isolation cases get a genuinely foreign second user to test against.

**Locale-safe expectations.** `Profile.jsx` renders the date with `toLocaleDateString()` and the total with `toLocaleString()`, i.e. in the *browser's* locale — so `1,234,567 ₫` on this machine could be `1.234.567 ₫` on another. Hard-coding either string would produce a suite that passes only on the machine it was written on. The expected value is instead derived inside the page from the backend record:

```ts
const [expectedDate, expectedAmount] = await page.evaluate(
  ([createdAt, total]) => [
    new Date(createdAt).toLocaleDateString(),
    `${Number(total).toLocaleString()} ₫`,
  ],
  [order.created_at, order.total_amount] as const,
);
await expect(cells.nth(1)).toHaveText(expectedDate);
await expect(cells.nth(2)).toHaveText(expectedAmount);
```

This still binds the cell to *that order's* real `created_at` and `total_amount` — a cell showing another order's date, or a hardcoded placeholder, fails. The currency **format** requirement is then asserted separately and locale-agnostically by FR11-TC05, with a regex that accepts any thousands separator but requires grouping and the `₫` sign.

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

FR-11 adds three more:

| Assertion | Usage |
|---|---|
| `toHaveCount` | the table holds exactly the user's orders — no missing rows, no foreign rows (FR11-TC08) |
| `toHaveText` | exact cell equality against the backend record: `#id`, locale date, locale amount, Vietnamese status (FR11-TC04) |
| `toContainText` | after a reload the table still carries every order id and status label (FR11-TC12) |
| `getComputedStyle` via `locator.evaluate` | status badges must resolve to distinct, non-transparent background colours (FR11-TC07) |
| `expect.arrayContaining` | the four required column headers are present (FR11-TC03) |

### 3.4 Multi-browser execution

Configured in `src/playwright.config.ts`:

```ts
projects: [
  { name: 'chrome',  use: { ...devices['Desktop Chrome'], channel: 'chrome'  } },
  { name: 'edge',    use: { ...devices['Desktop Edge'],   channel: 'msedge'  } },
  { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
]
```

- Chrome: ✓ 12 runs per feature (FR-02, FR-11)
- Edge: ✓ 12 runs per feature (FR-02, FR-11)
- Firefox: ✗ **blocked — see the note below**
- Browser runs: **24** for FR-02 and **24** for FR-11, i.e. **48** of the 72 configured across the two automated features

> **Firefox is blocked by a host-environment fault, not by the test code.** On this machine (macOS 26 / Darwin 27, Apple Silicon) Playwright's Firefox fails to launch in two distinct ways: build `firefox-1543` (Firefox 155, shipped with Playwright 1.63) aborts with `Could not find profile folder` in headless mode, and build `firefox-1490` (Firefox 141, Playwright 1.55) gets past that but deadlocks in the software compositor with `RenderCompositorSWGL failed mapping default framebuffer`.
>
> Attempted and ruled out: reinstall and `--force` reinstall; disabling the sandbox; headed mode; re-signing the app bundle inside-out after finding its code signature invalid (`Sealed Resources=none`, which caused macOS to `SIGKILL` Firefox's child processes); pinning Playwright 1.55; disabling WebRender and the GPU process via prefs and environment variables.
>
> Firefox forks are **not** a substitute: Playwright drives Firefox over the **Juggler** protocol, which exists only in Playwright's patched builds. Both Zen `1.22.1b` and Floorp were checked — each has **0** Juggler entries in `omni.ja` against **19** in Playwright's build, and Floorp was confirmed by a real launch attempt to fail. Playwright 1.63 also exposes no public WebDriver BiDi browser type, so no stock Firefox build can be driven.
>
> The `firefox` project is retained in the config. The remaining 24 runs need either a machine where Playwright's Firefox launches, or the official `mcr.microsoft.com/playwright` Linux container, where neither fault occurs. WebKit was verified working on this machine and is available as a substitute if a third browser is required sooner.

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
npm run test:fr11     # FR-11 on Chrome + Edge
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
| Non-existent page (FR-11) | The manual cases assume an "Order History" page; the obvious generated locator would have been `page.goto('/orders')` | Read `App.jsx`, found no such route, and located the panel inside `/profile` | All 12 cases would have failed on navigation and tested nothing. The test-case document described the *feature*, not the *implementation* — only the running app settles that |
| Machine-dependent assertion (FR-11) | Expected date `9/14/2026` and amount `1,234,567 ₫` are the natural literals to hard-code from an observed run | Derive both inside the page from the backend record via `page.evaluate` (§3.2); assert the *format* separately with a separator-agnostic regex | The page formats with `toLocaleDateString()` / `toLocaleString()`, so the literals are this machine's locale. A hard-coded suite would pass here and fail on the grader's machine for a reason unrelated to the product |
| Unfalsifiable expectation (FR-11) | Manual TC-08 "các trạng thái được phân biệt bằng màu sắc" cannot be turned into an assertion as written | Restated as: N distinct statuses → N pairwise-distinct computed `background-color`, none transparent; seeded all five statuses to exercise it | A test case that cannot fail is not a test. Making the oracle explicit also fixed the data requirement — the case is meaningless with fewer than two statuses on screen |
| Miscounted consolidation (FR-11) | Claimed the field-level merge "freed 2 slots" and that FR11-TC03 and FR11-TC10 were both new | Recounted: 3 cases → 2, so **1** slot freed; FR11-TC03 is TC-03 reworded, and FR11-TC10 is the only genuinely new case | The AI merged TC-04/05/06 but then split TC-06's format clause back out, and did not subtract that from its own arithmetic. The 12 automated cases were correct — only the narrative explaining them was wrong (audit `A010`) |
| Ignored project convention (FR-11) | Ran `playwright test` across all three projects, yielding 12 Firefox environment failures mixed in with the one real defect | Re-ran via a new `npm run test:fr11` pinned to Chrome + Edge, matching the existing `test:fr02` | Firefox is already documented as unlaunchable on this host (§3.4). Mixing known environment noise into a result set makes a genuine defect easy to miss (audit `A011`) |

## 5. Execution Results

Run on 2026-09-14 against the live SUT. Results are identical on both browsers.

| Feature | Browser | Passed | Failed | Report |
|---|---|---:|---:|---|
| A (FR-02) | Chrome | 7 | 5 | `src/playwright-report/index.html` |
| A (FR-02) | Edge | 7 | 5 | `src/playwright-report/index.html` |
| A (FR-02) | Firefox | — | — | blocked, see §3.4 |
| B (FR-11) | Chrome | 11 | 1 | `src/playwright-report/index.html` |
| B (FR-11) | Edge | 11 | 1 | `src/playwright-report/index.html` |
| B (FR-11) | Firefox | — | — | blocked, see §3.4 |
| C (FR-12) | — | — | — | pending |

**FR-02 totals: 24 runs, 14 passed, 10 failed.**
**FR-11 totals: 24 runs, 22 passed, 2 failed.**
**Combined: 48 runs, 36 passed, 12 failed.**

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

FR-11, per test case (same on Chrome and Edge):

| Test case | Result | Note |
|---|---|---|
| FR11-TC01 | ✅ pass | login form → `/profile`, the user's orders listed |
| FR11-TC02 | ✅ pass | `Bạn chưa có đơn hàng nào.`, no table |
| FR11-TC03 | ✅ pass | all four required columns present |
| FR11-TC04 | ✅ pass | id, date, total and status all match the backend record |
| FR11-TC05 | ✅ pass | `1,234,567 ₫` — grouped and suffixed |
| FR11-TC06 | ✅ pass | all five statuses in Vietnamese; no raw English code leaks |
| FR11-TC07 | ✅ pass | five statuses, five distinct badge colours |
| FR11-TC08 | ✅ pass | six seeded orders, six rows, ids match exactly |
| FR11-TC09 | ✅ pass | User B's orders absent from User A's table |
| FR11-TC10 | ❌ fail | **defect** — another user's order is served by `GET /api/orders/:id` |
| FR11-TC11 | ✅ pass | login prompt shown, no `/api/orders` call, API returns 401 |
| FR11-TC12 | ✅ pass | table renders identically after reload |

Every one of the 12 failures is a genuine product defect. No test-side failures remain.

Read together, FR-11's results say the *display* half of the requirement is implemented correctly — the columns, the Vietnamese labels, the colour coding and the per-user list scoping all hold — while the *authorisation* half holds only where the UI happens to route through the scoped endpoint.

## 6. Bugs & Unautomated Cases

### Genuine bugs

Six distinct defects, each confirmed in the source of the system under test.

| # | Bug | Test case | Severity | Cause | GitHub Issue |
|---|---|---|---|---|---|
| 1 | Account locks after **2** consecutive failed logins; FR-02 requires lockout only from **3** | FR02-TC05 | High | `backend/server.js:54` — `const newAttempts = user.login_attempts + 2;` increments the counter by 2 instead of 1, so the `>= 3` threshold is crossed one attempt early | https://github.com/TuanNguyen716/HW04_Automation_Testing_KTPM/issues/2 |
| 2 | Lockout lasts **180 seconds**; FR-02 specifies **30 seconds** | FR02-TC08 | High | `backend/server.js:57` — `new Date(Date.now() + 180000)`; should be `30000` | https://github.com/TuanNguyen716/HW04_Automation_Testing_KTPM/issues/3 |
| 3 | Email field is not `type="email"`, so HTML5 format validation never runs | FR02-TC02, FR02-TC11 | Medium | `frontend-web/src/pages/Login.jsx:30` — email input is `type="text"`, directly contradicting FR-02 | https://github.com/TuanNguyen716/HW04_Automation_Testing_KTPM/issues/1 |
| 4 | Password field renders its value in clear text | FR02-TC11 | Medium | `frontend-web/src/pages/Login.jsx:40` — password input is `type="text"` instead of `type="password"` | `https://github.com/TuanNguyen716/HW04_Automation_Testing_KTPM/issues/4 |
| 5 | Login response returns the account's password to the client | FR02-TC12 | **Critical** | `backend/server.js:52` — `res.json({ message, token, user })` serialises the whole user row, including the stored password | https://github.com/TuanNguyen716/HW04_Automation_Testing_KTPM/issues/5 |
| 6 | Any order is readable by any caller — no authentication and no ownership check | FR11-TC10 | **Critical** | `backend/server.js:344` — `app.get("/api/orders/:id", (req, res) => …)` is registered **without** the `authenticateToken` middleware and queries `WHERE id = ?` with no `user_id` predicate, so `GET /api/orders/30` returns User B's order to User A, or to nobody at all | *to file* |

Bugs 1 and 2 are the two defects seeded in the lockout logic itself; both are single-token errors in `server.js` and neither is visible from the UI, which is why FR02-TC05 and FR02-TC08 assert the HTTP status rather than on-screen text.

Bug 6 is a broken-object-level-authorisation flaw (OWASP API1). It is invisible from the web frontend, which only ever calls the correctly scoped `/api/orders/my-orders`; the order ids are sequential integers, so enumerating every order in the system needs nothing but a loop and no credentials at all. It was found only because FR11-TC10 asserts FR-11's ownership rule at the API rather than at the table — the UI-level equivalent, FR11-TC09, passes. The two-line fix is to add the `authenticateToken` middleware and an ownership predicate:

```js
app.get("/api/orders/:id", authenticateToken, (req, res) => {
  db.get("SELECT * FROM orders WHERE id = ? AND user_id = ?",
    [req.params.id, req.user.id], (err, order) => {
      if (!order) return res.status(404).json({ error: "Order not found" });
      res.json(order);
    });
});
```

**Related observations (not counted as separate defects):** the login page heading reads `Đăng Ký` ("Register") instead of `Đăng Nhập`, and the email field is labelled `Username`. Both are in `Login.jsx` and are cosmetic/labelling faults outside the FR-02 assertions.

> Screenshots for each failing assertion are produced automatically (`screenshot: 'only-on-failure'`) under `src/test-results/`. GitHub Issues still to be filed.

### Unautomated test cases

`All 12 selected test cases for FR-02 and all 12 for FR-11 were automated.`

**FR-02** — four of the original manual cases were consolidated into two (§2.2) and the freed budget was spent on two additional cases, so the automated set is 12 cases covering the same behaviour plus two uncovered FR-02 requirements.

**FR-11** — three of the original manual cases were consolidated into two (§2.4) and the single freed slot was spent on FR11-TC10, the API-level ownership check. One behaviour was examined and deliberately **not** automated: `Profile.jsx:99` renders a raw uppercased English code for any status outside the known five, violating the Vietnamese-label requirement, but the backend's transition whitelist makes that state unreachable through the API. Automating it would require writing directly to `database.sqlite`, which would test a state the product cannot actually enter.

## 7. Agent Skills

Agent Skills used:

1. **`ai-audit-logger`** — records AI interactions and audit information into `ai-audit-log.json`, and generates `AI_Audit_Report.md`.
2. **`automation-test-builder`** — converts written test cases into data-driven Playwright tests: one `.spec.ts` looped over a separate `.csv`, three browser projects, and the HTML reporter stamped with the student ID.
3. **`automation-reviewer`** — reviews the generated automation and identifies gaps and issues.

**End-to-end reuse example (FR-02).** `automation-test-builder` was invoked with the feature id and the SUT URLs. It produced `src/data/fr-02-login-lockout.csv`, `src/tests/fr-02-login-lockout.spec.ts`, the shared `src/tests/fixtures.ts`, and `src/playwright.config.ts` with the three browser projects and the `Run by:` stamp already wired. The skill's own quality rules drove several outcomes visible in the result: the prohibition on inventing selectors forced the DOM to be verified first; the ban on `waitForTimeout` kept the suite on web-first assertions; and the "expected values belong in the CSV" rule is why `expected_status` exists as a column rather than as a literal in the spec.

**The reuse claim, tested on FR-11.** The same skill was then run for FR-11 and the prediction held: `playwright.config.ts` was not touched at all, and `fixtures.ts` was *extended*, not forked. FR-11 consumed `registerFreshUser` and `apiLogin` unchanged and contributed a second layer beside them — `registerAndLogin`, `createOrder`, `setOrderStatus`, `seedOrders`, `getMyOrders`, `getOrderById`, `VI_STATUS` — placed in the same shared file for the same reason, so FR-12 (which needs an admin token and a non-admin token) inherits them too. The only edit to existing FR-02 code was renaming the generated-account prefix from `fr02-` to `eshop-`, since the helper is no longer FR-02's alone.

Two of the skill's quality rules changed the FR-11 output specifically. "Never invent a URL" is what turned up the missing `/orders` route before any code was written. "Expected values belong in the CSV" is why the seeded order statuses (`pending|confirmed|shipping|delivered|canceled`) live in a data column: adding a sixth status to the product means adding it to one CSV cell, not editing the spec.

The same skill applies unchanged to FR-12 — the feature id only decides the file names and the CSV columns.

## 8. Bloom-AI Alignment

| Level | Evidence |
|---|---|
| G9.2 Apply | Applied AI to generate two data-driven Playwright suites (FR-02, FR-11): 24 CSV-driven cases, 12 assertion patterns, multi-browser configuration, stamped HTML report, with `fixtures.ts` and `playwright.config.ts` written once and reused |
| G9.3 Analyse | Reviewed both manual test-case sets against the running system — found two redundant pairs and two unobservable expectations in FR-02, and in FR-11 a three-way redundancy, an unfalsifiable colour expectation, and a page that does not exist; identified an invalid measurement caused by shared account state and re-measured correctly; classified all 12 failures as genuine defects and traced each to a source line |
| G9.4 Collaborate | Iterated with AI across probing, generation, execution, and environment debugging, including rejecting a proposed browser substitution after verifying that Firefox forks lack the Juggler protocol; caught and corrected the AI's own miscount of the FR-11 consolidation arithmetic rather than accepting its summary (audit `A010`) |

## 9. Summary

| Metric | Result |
|---|---:|
| Features | 3 |
| Test cases | 36 (12 per feature) |
| Automated | 24 (FR-02, FR-11); FR-12 pending |
| Executed | 48 runs |
| Passed | 36 |
| Failed | 12 |
| Browser runs | 48 of 72 for the two automated features (Firefox blocked, §3.4) |
| Genuine bugs | 6 (2 critical) |

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
- [x] Scripts + CSV data + HTML reports *(FR-02, FR-11)*
- [ ] Multi-browser HTML reports *(Chrome + Edge done; Firefox blocked, §3.4)*
- [ ] Unlisted YouTube demo link
- [x] AI Audit Report: Markdown + PDF
- [ ] AI Critique: Markdown + PDF
- [ ] Git commit log text file
- [ ] Bug reports + screenshots *(6 defects documented in §6; GitHub Issue for bug 6 still to file)*
- [ ] README.md with self-assessment + test summary
- [ ] Agent Skills + demonstration video
