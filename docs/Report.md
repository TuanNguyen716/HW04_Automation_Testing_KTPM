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
| C | FR-12 Access control | 12 | 12 |

**Design of the 12 FR-02 cases** — distribution: 3 positive (TC-01, TC-05, TC-08), 7 negative (TC-02, TC-03, TC-04, TC-06, TC-07, TC-10, TC-11), 2 contract/security (TC-09, TC-12). The lockout boundary (2 / 3 / ≥3 consecutive failures) is covered by TC-05, TC-06 and TC-07 as a boundary-value triple.

**Design of the 12 FR-11 cases** — distribution: 8 display/content (TC-01, TC-03 … TC-08, TC-12), 1 empty-state edge case (TC-02), 3 access control (TC-09, TC-10, TC-11). FR-11 is a read-only view, so the budget goes to *what is rendered* and *whose data it is*, rather than to input validation. The three access-control cases attack the same requirement from three angles: another user's rows must not appear in the table (TC-09), must not be reachable through the API (TC-10), and no rows at all may be served without a session (TC-11).

**Design of the 12 FR-12 cases** — distribution: 3 positive controls (TC-01, TC-08, TC-11), 9 negative/security (TC-02 … TC-07, TC-09, TC-10, TC-12). FR-12 is a pure authorisation requirement, so the set is organised as a credential × resource matrix: five credential kinds (none, forged signature, tampered payload, valid non-admin, valid admin) crossed against the two protected surfaces named in the spec (`/api/admin/*` and the data-affecting writes), plus the Web Admin UI itself. The positive controls are not padding — without them a suite that rejects everything would look identical to a correct one.

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


### 2.5 FR-12 — manual test cases (as originally designed)

| ID    | Test case                                 | Pre-condition / Action                                                | Expected result                                         |
| ----- | ----------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------- |
| TC-01 | Admin truy cập Web Admin với JWT hợp lệ   | Login bằng `admin@eshop.com`, truy cập Admin                          | Truy cập thành công, hiển thị Admin UI                  |
| TC-02 | User truy cập Web Admin                   | Login bằng `test@eshop.com`, truy cập Admin                           | Bị từ chối truy cập / redirect, không hiển thị Admin UI |
| TC-03 | Truy cập Admin API không có token         | Gọi `GET /api/admin/users` không Authorization                        | Request bị từ chối (`401/403`)                          |
| TC-04 | Truy cập Admin API với token không hợp lệ | Gọi Admin API với JWT giả/sai                                         | Request bị từ chối (`401/403`)                          |
| TC-05 | User gọi Admin API                        | Dùng JWT của user gọi `GET /api/admin/users`                          | Request bị từ chối (`403`)                              |
| TC-06 | Admin gọi Admin API                       | Dùng JWT của admin gọi `GET /api/admin/users`                         | Request thành công                                      |
| TC-07 | User tạo sản phẩm                         | Dùng JWT user → `POST /api/products`                                  | Request bị từ chối, sản phẩm không được tạo             |
| TC-08 | Admin tạo sản phẩm                        | Dùng JWT admin → `POST /api/products`                                 | Request thành công, sản phẩm được tạo                   |
| TC-09 | User sửa sản phẩm                         | Dùng JWT user → `PUT /api/products/:id`                               | Request bị từ chối, dữ liệu không thay đổi              |
| TC-10 | Admin sửa sản phẩm                        | Dùng JWT admin → `PUT /api/products/:id`                              | Request thành công, dữ liệu được cập nhật               |
| TC-11 | User xóa dữ liệu Admin                    | Dùng JWT user → `DELETE /api/products/:id` hoặc `/api/categories/:id` | Request bị từ chối, dữ liệu không bị xóa                |
| TC-12 | Admin thực hiện các thao tác quản trị     | Dùng JWT admin → tạo/sửa/xóa hoặc gọi `/api/admin/*`                  | Request được phép thực hiện                             |

### 2.6 FR-12 — automated test cases (after review)

Reviewing this set against the running SUT found one case that was wholly redundant, two groups that were the same flow under different HTTP verbs, and one condition that is **not testable on this build at all**. Consolidation freed four slots, all spent on attack paths the original set left uncovered. Final automated set, as it exists in `src/data/fr-12-access-control.csv`:

| Automated ID | Test case | Maps to | Expectation |
|---|---|---|---|
| FR12-TC01 | Admin đăng nhập Web Admin bằng JWT hợp lệ thì vào được Dashboard | TC-01 | dashboard mounts; stored `adminToken` decodes to `role=admin`; no error dialog |
| FR12-TC02 | User thường đăng nhập Web Admin thì bị từ chối và không thấy Admin UI | TC-02 | `Bạn không phải là admin!`; login form stays; no session stored |
| FR12-TC03 | Chặn truy cập Admin UI không được làm ở phía client có thể vượt qua | **new** | a non-admin JWT planted in `localStorage.adminToken` must not unlock the dashboard |
| FR12-TC04 | Gọi API Admin không kèm token thì bị từ chối | TC-03 | `401 Unauthorized` on `/api/admin/users`, `/api/admin/orders`, `/api/coupons` |
| FR12-TC05 | Gọi API Admin với JWT giả mạo chữ ký thì bị từ chối | TC-04 | `403 Forbidden`; no admin collection in the body |
| FR12-TC06 | Sửa `role` trong payload JWT mà không ký lại thì vẫn bị từ chối | **new** | payload `role`→`admin` with the original signature must still be `403` |
| FR12-TC07 | User dùng token của mình gọi API Admin thì bị từ chối 403 | TC-05 | `403` on all three admin endpoints; body must not be the collection |
| FR12-TC08 | Admin dùng token hợp lệ gọi API Admin thì thành công | TC-06 | `200` + array body on all three endpoints |
| FR12-TC09 | Không có token thì không được tạo sửa xóa sản phẩm | **new** | anonymous `POST`/`PUT`/`DELETE /api/products` refused; product unchanged and not deleted |
| FR12-TC10 | User thường không được tạo sửa xóa sản phẩm và danh mục | TC-07 + TC-09 + TC-11 | non-admin `POST`/`PUT`/`DELETE` refused on `/api/products` and `/api/categories`; data unchanged |
| FR12-TC11 | Admin được phép tạo sửa xóa sản phẩm | TC-08 + TC-10 | create → read back → update persists → delete removes the row |
| FR12-TC12 | User không thể tự nâng quyền thành admin qua API cập nhật hồ sơ | **new** | `PUT /api/users/me` with `{"role":"admin"}` must not promote; re-login must not mint an admin token |

**Consolidations and their reason:**

| Change | Reason |
|---|---|
| TC-12 dropped entirely | "Admin thực hiện các thao tác quản trị — tạo/sửa/xóa hoặc gọi `/api/admin/*`" is exactly the union of TC-06, TC-08 and TC-10. It also has no single expected result that could be written as an assertion; a case whose oracle is "whatever the other three already check" cannot fail independently |
| TC-07 + TC-09 + TC-11 merged into FR12-TC10 | Three cases differing only in the HTTP verb sent by the same credential to the same resource. One case walks `POST` → `PUT` → `DELETE` in sequence and, crucially, re-reads the record after each to prove the refusal actually protected the data. Net: 3 cases → 1, two slots freed |
| TC-08 + TC-10 merged into FR12-TC11 | Same pairing on the admin side, and merging strengthens it: the single case creates a product, reads it back, updates it, verifies the update persisted, deletes it, and verifies it is gone — a lifecycle no single original case asserted |
| The four freed slots spent on FR12-TC03, TC-06, TC-09 and TC-12 | The original set tested only *user vs admin* on endpoints someone had already thought to protect. The four new cases attack the mechanism instead: the client-side guard (TC-03), the signature check (TC-06), endpoints with **no** credential requirement at all (TC-09), and the role field itself (TC-12). Three of the four found defects the original set could not have reached |
| TC-04 split into FR12-TC05 and FR12-TC06 | "JWT giả/sai" conflates two different failures. A wrongly-signed token and a correctly-signed token whose payload was edited afterwards exercise different halves of `jwt.verify`; only the second proves the signature actually covers the `role` claim |

**Considered and rejected as untestable.** A token-expiry case is the obvious 13th candidate and was deliberately excluded: `backend/server.js:51` signs `jwt.sign({ id, role }, SECRET_KEY)` with **no `exp` claim and no `expiresIn` option**, so tokens issued by this build never expire. There is no input that makes such a case fail, and a test that cannot fail is not a test. (The missing expiry is itself arguably a defect, but FR-12 does not state a session-lifetime requirement, so it is recorded here rather than counted in §6.)


## 3. Automation Approach

### 3.1 AI-first workflow

```
                 HUMAN
                   │
                   ▼
        Select 1 Feature / FR
                   │
                   ▼
   Design 12 test cases (by hand)
                   │
                   ▼
         ┌───────────────────┐
         │ Skill #2          │
         │ test-builder      │  → CSV + spec + 3 browser projects
         └─────────┬─────────┘
                   ▼
          Execute the suite
                   │
                   ▼
       HUMAN REVIEW of results
          ┌────────┴────────┐
          ▼                 ▼
     Genuine bug        Test issue
          │                 │
          ▼                 ▼
     Bug report      Fix test / CSV
          └────────┬────────┘
                   ▼
         ┌───────────────────┐
         │ Skill #1          │
         │ ai-audit-logger   │
         └─────────┬─────────┘
                   ▼
             Final Report
```

The human owns feature selection, test-case design, and the verdict on every failure; the AI owns generation and the audit trail. Two rules made the difference:

1. **Ground truth before generation.** The DOM, the real endpoints and the observed behaviour were read from the *running* system before any test code was written, so no selector, URL or error message was invented. For FR-11 this is what caught that there is no "Order History" page — generating from the test-case document alone would have produced 12 cases all failing on `page.goto('/orders')`.
2. **Every failure is classified before it is reported.** Genuine defect → §6; test defect → fix the spec or the CSV and re-run (§4).

### 3.2 Data-driven testing

- Data format: `.csv`
- Data files: `src/data/fr-02-login-lockout.csv`, `src/data/fr-11-order-history.csv`, `src/data/fr-12-access-control.csv` (12 rows each, one per test case)
- Spec files: `src/tests/fr-02-login-lockout.spec.ts`, `src/tests/fr-11-order-history.spec.ts`, `src/tests/fr-12-access-control.spec.ts`
- Shared helpers: `src/tests/fixtures.ts` (one file, reused by all three features)

The spec contains **no inline test data**. It reads the CSV at module level and generates one `test()` per row:

```ts
const rows = readCsv('data/fr-02-login-lockout.csv');
for (const row of rows) {
  test(`${row.tc_id} - ${row.title}`, async ({ page }) => { /* one shared flow */ });
}
```

All three CSVs share the same shape — `tc_id` and `title` name the test so report rows map back to this document, `check` selects the assertion group, and the `expect_*` / `expected_*` columns hold the expected outcome. The rest are the inputs each feature needs:

| Feature | Feature-specific columns |
|---|---|
| FR-02 | `email` (`{{FRESH}}` registers a new account, `{{EMPTY}}`, or a literal), `password` (`{{CORRECT}}`, `{{EMPTY}}`, or a literal), `pre_fails` (failed logins before the measured attempt), `wait_seconds` (FR02-TC08 uses 35) |
| FR-11 | `statuses` (pipe-separated orders seeded for the test's own user), `amounts`, `other_user_statuses` (orders seeded for a *second* user, for the isolation cases), `expect_rows` |
| FR-12 | `method` (HTTP verb; the write rows drive `POST`/`PUT`/`DELETE` in sequence), `paths` (pipe-separated endpoints the row attacks), `token` (credential kind — `none`, `invalid`, `tampered`, `user`, `admin` — resolved to a real header by `tokenFor()`) |

Putting the credential kind in a data column is what keeps FR-12 to one flow: adding "what happens with an expired token" later means adding a row and a `tokenFor` case, not a second spec.

**Test isolation.** Every row that needs an account registers its own via `POST /api/register`, so `login_attempts` and `locked_until` always start clean. Without this the 180-second lock leaks between test cases and between browser projects, and the suite cannot run in parallel. This is the single most important design decision in the suite.

FR-12 adds a second obligation on top of isolation: **teardown**. Because its negative cases assert that a write is *refused*, every row where the product wrongly allows the write leaves a real row behind in the SUT. Each such row is therefore recorded the moment it is created — before the assertion that will throw — and removed in a `finally` block, along with the escalated account from FR12-TC12, which would otherwise leave a genuine extra admin in the database for every run:

```ts
const created = await apiCall('POST', path, token, body);
// Record any row that slipped through BEFORE asserting: the assertion below
// throws on a leak, and the teardown can only remove what was tracked by then.
if (created.body?.id) strays.push({ path, id: created.body.id });
expect(DENIED, `POST ${path} as "${kind}" must be rejected`).toContain(created.status);
```

This ordering was a real bug in the first generated version, where the `push` sat *after* the assertion and so never ran — see §4. Verified: products, categories and admin accounts all return to their seed counts after a full run.

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

FR-12 adds two more, and reuses the rest:

| Assertion | Usage |
|---|---|
| `expect.poll` | the Web Admin rejection arrives through a blocking `alert()`, captured by a `page.on('dialog')` handler and polled until it appears (FR12-TC02) |
| `toBeHidden` on a privileged element | the admin-only sidebar entry must not render for a non-admin session (FR12-TC02, FR12-TC03) |
| `toContain` on a status allow-list | `expect(DENIED).toContain(res.status)` — the request must be refused *somehow* (401 or 403), then pinned to the exact code the case names, so a `200` can never pass |
| read-back after a rejected write | the strongest pattern in the feature: after a refused `PUT`/`DELETE`, the record is fetched again and compared to its pre-state. A product that is "protected" by a 403 but silently modified anyway would still fail (FR12-TC09, FR12-TC10) |

**Dialog handling.** The admin app calls `alert()` on a non-admin login. Playwright auto-dismisses dialogs, which would make the rejection invisible to the test and let FR12-TC02 pass for the wrong reason. The handler is installed *before* the submit click so the message is captured rather than silently discarded.

### 3.4 Multi-browser execution

Configured in `src/playwright.config.ts`:

```ts
projects: [
  { name: 'chrome',  use: { ...devices['Desktop Chrome'], channel: 'chrome'  } },
  { name: 'edge',    use: { ...devices['Desktop Edge'],   channel: 'msedge'  } },
  { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
]
```

- Chrome: ✓ 12 runs per feature (FR-02, FR-11, FR-12)
- Edge: ✓ 12 runs per feature (FR-02, FR-11, FR-12)
- Firefox: ✗ **blocked — see the note below**
- Browser runs: **24** each for FR-02, FR-11 and FR-12, i.e. **72** of the 108 configured across the three features

> **Firefox is blocked by an environment fault, not by the test code.** Playwright's bundled Firefox fails to launch on this host in two distinct ways (a missing profile folder in headless mode on the 1.63 build, a software-compositor deadlock on the 1.55 build) and survives none of the usual remedies — force reinstall, no-sandbox, headed mode, pinning Playwright 1.55, disabling WebRender. Firefox forks are not a substitute: Playwright drives Firefox over the **Juggler** protocol, which exists only in its own patched builds (Zen and Floorp were checked — 0 Juggler entries against 19). The `firefox` project stays in the config; the remaining 36 runs need either another machine or the official `mcr.microsoft.com/playwright` container.

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
npm run test:fr12     # FR-12 on Chrome + Edge
npm run report        # open the HTML report
```

The SUT must be running on `:3000`, `:5173` and — for FR-12 — `:5174` first. Override with `BASE_URL` / `API_BASE` if the ports differ.

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
| Leaked test data (FR-12) | The generated teardown recorded a wrongly-created row *after* the assertion that the row must not exist | Moved the bookkeeping above the assertion, into a `finally`-backed list | Because the assertion throws on exactly the case that creates the row, the cleanup could only ever run when there was nothing to clean. A full run left 8 stray products and a self-promoted admin account in the SUT; the defect in the test was invisible from its own pass/fail output and only showed up by diffing the database against its seed state |
| Contaminated SUT (FR-12) | Exploratory probing of the write endpoints ran `PUT /api/products/1` against a **seeded** product, overwriting "iPhone 15 Pro Max" | Restored the row from `backend/database.js` and moved all destructive probing onto rows created for the purpose | Probing an authorisation boundary means sending requests that *succeed* when the product is broken. Doing that against seed data silently corrupts the fixture every later test depends on — FR-11's currency and status cases read those same products |
| Unverifiable stamp claim (FR-12) | Report title first read back as `None`, suggesting the `Run by` stamp had been lost | Re-checked: the value lives at `options.title` inside the report payload, not at the top level; it is present and correct | The first check looked at the wrong key and would have prompted a pointless "fix" to a working config. Same failure mode as the earlier `grep` false negative, one layer deeper |
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
| C (FR-12) | Chrome | 7 | 5 | `src/playwright-report/index.html` |
| C (FR-12) | Edge | 7 | 5 | `src/playwright-report/index.html` |
| C (FR-12) | Firefox | — | — | blocked, see §3.4 |

**FR-02 totals: 24 runs, 14 passed, 10 failed.**
**FR-11 totals: 24 runs, 22 passed, 2 failed.**
**FR-12 totals: 24 runs, 14 passed, 10 failed.**
**Combined: 72 runs, 50 passed, 22 failed.**

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

FR-12, per test case (same on Chrome and Edge):

| Test case | Result | Note |
|---|---|---|
| FR12-TC01 | ✅ pass | admin reaches the dashboard; stored token decodes to `role=admin` |
| FR12-TC02 | ✅ pass | `Bạn không phải là admin!`; dashboard never renders; no session stored |
| FR12-TC03 | ❌ fail | **defect** — a user JWT in `localStorage` unlocks the whole Admin UI |
| FR12-TC04 | ✅ pass | `401` on all three admin endpoints |
| FR12-TC05 | ✅ pass | forged signature → `403` |
| FR12-TC06 | ✅ pass | tampered payload → `403`; the signature does cover `role` |
| FR12-TC07 | ❌ fail | **defect** — a plain user gets `200` and the full admin collections |
| FR12-TC08 | ✅ pass | admin gets `200` + array on all three |
| FR12-TC09 | ❌ fail | **defect** — anonymous callers create, modify and delete products |
| FR12-TC10 | ❌ fail | **defect** — a plain user creates, modifies and deletes products and categories |
| FR12-TC11 | ✅ pass | admin create → update → delete lifecycle all persist correctly |
| FR12-TC12 | ❌ fail | **defect** — user self-promotes to admin; re-login mints a real admin JWT |

Every one of the 22 failures is a genuine product defect. No test-side failures remain.

The seven FR-12 passes carry as much weight as the five failures: they show the token *signature* path is implemented correctly (TC-05, TC-06) and that admin operations genuinely work (TC-01, TC-08, TC-11), which is what makes the five failures attributable to a missing **role** check specifically, rather than to a broken auth layer in general.

Read together, FR-12's results say the system authenticates but does not authorise: it will correctly tell you *who* a caller is, and then ignore the answer. Every case that turns on identity passes; every case that turns on privilege fails.

Read together, FR-11's results say the *display* half of the requirement is implemented correctly — the columns, the Vietnamese labels, the colour coding and the per-user list scoping all hold — while the *authorisation* half holds only where the UI happens to route through the scoped endpoint.

## 6. Bugs & Unautomated Cases

### Genuine bugs

Ten distinct defects, each confirmed in the source of the system under test.

| # | Bug | Test case | Severity | Cause | GitHub Issue |
|---|---|---|---|---|---|
| 1 | Account locks after **2** consecutive failed logins; FR-02 requires lockout only from **3** | FR02-TC05 | High | `backend/server.js:54` — `const newAttempts = user.login_attempts + 2;` increments the counter by 2 instead of 1, so the `>= 3` threshold is crossed one attempt early | https://github.com/TuanNguyen716/HW04_Automation_Testing_KTPM/issues/2 |
| 2 | Lockout lasts **180 seconds**; FR-02 specifies **30 seconds** | FR02-TC08 | High | `backend/server.js:57` — `new Date(Date.now() + 180000)`; should be `30000` | https://github.com/TuanNguyen716/HW04_Automation_Testing_KTPM/issues/3 |
| 3 | Email field is not `type="email"`, so HTML5 format validation never runs | FR02-TC02, FR02-TC11 | Medium | `frontend-web/src/pages/Login.jsx:30` — email input is `type="text"`, directly contradicting FR-02 | https://github.com/TuanNguyen716/HW04_Automation_Testing_KTPM/issues/1 |
| 4 | Password field renders its value in clear text | FR02-TC11 | Medium | `frontend-web/src/pages/Login.jsx:40` — password input is `type="text"` instead of `type="password"` | `https://github.com/TuanNguyen716/HW04_Automation_Testing_KTPM/issues/4 |
| 5 | Login response returns the account's password to the client | FR02-TC12 | **Critical** | `backend/server.js:52` — `res.json({ message, token, user })` serialises the whole user row, including the stored password | https://github.com/TuanNguyen716/HW04_Automation_Testing_KTPM/issues/5 |
| 6 | Any order is readable by any caller — no authentication and no ownership check | FR11-TC10 | **Critical** | `backend/server.js:344` — `app.get("/api/orders/:id", (req, res) => …)` is registered **without** the `authenticateToken` middleware and queries `WHERE id = ?` with no `user_id` predicate, so `GET /api/orders/30` returns User B's order to User A, or to nobody at all | https://github.com/TuanNguyen716/HW04_Automation_Testing_KTPM/issues/6 |
| 7 | A logged-in user can promote **itself to admin**: `PUT /api/users/me` accepts a `role` field from the request body | FR12-TC12 | **Critical** | `backend/server.js:119-126` — `const { name, shipping_address, phone, role } = req.body;` followed by `if (role) { query += ", role = ?" }`. The endpoint is specified as "chỉ cho phép cập nhật thông tin cá nhân cơ bản". After the call the next login mints a genuine `role=admin` JWT | https://github.com/TuanNguyen716/HW04_Automation_Testing_KTPM/issues/9 |
| 8 | `POST`, `PUT` and `DELETE /api/products` require **no credential at all** — not even a token | FR12-TC09 | **Critical** | `backend/server.js:167,179,191` — all three routes are registered with no middleware argument: `app.post("/api/products", (req, res) => …)`. FR-12 names these endpoints explicitly as requiring a valid JWT *and* `role = 'admin'` | https://github.com/TuanNguyen716/HW04_Automation_Testing_KTPM/issues/8 |
| 9 | **No role check exists anywhere in the backend.** `authenticateToken` verifies the signature and nothing else | FR12-TC07, FR12-TC10 | **Critical** | `backend/server.js:100-110` — the middleware sets `req.user` and calls `next()`; no route consults `req.user.role`. Every authenticated user therefore reaches `GET /api/admin/users`, `GET /api/admin/orders`, `GET /api/coupons`, `POST /api/categories`, `POST /api/admin/coupons`, `POST /api/admin/import-products` and `DELETE /api/admin/users/:id` | https://github.com/TuanNguyen716/HW04_Automation_Testing_KTPM/issues/7 |
| 10 | The Web Admin guard is client-side only and is bypassed by writing a token to `localStorage` | FR12-TC03 | High | `frontend-admin/src/App.jsx:65` — the `role !== "admin"` check lives inside `handleLogin` and nowhere else; `App.jsx:188` then gates the whole dashboard on `if (!token)`. Nothing re-validates the role on mount or reload | https://github.com/TuanNguyen716/HW04_Automation_Testing_KTPM/issues/10 |

Bugs 1 and 2 are the two defects seeded in the lockout logic; both are single-token errors in `server.js` and neither is visible from the UI, which is why FR02-TC05 and FR02-TC08 assert the HTTP status rather than on-screen text.

**Bug 6** is a broken-object-level-authorisation flaw (OWASP API1), invisible from the frontend, which only ever calls the correctly scoped `/api/orders/my-orders`. Order ids are sequential integers, so enumerating every order in the system needs a loop and no credentials. It was found only because FR11-TC10 asserts the ownership rule at the API; the UI-level equivalent, FR11-TC09, passes. Fix:

```js
app.get("/api/orders/:id", authenticateToken, (req, res) => {
  db.get("SELECT * FROM orders WHERE id = ? AND user_id = ?",
    [req.params.id, req.user.id], (err, order) => {
      if (!order) return res.status(404).json({ error: "Order not found" });
      res.json(order);
    });
});
```

**Bugs 7–10 are one architectural failure seen from four angles.** The system authenticates and does not authorise: `authenticateToken` answers "is this a real token?" and no route asks "is this caller allowed?". Bug 9 is the root cause, bug 8 the same gap with authentication missing too, bug 10 the frontend compensating in the one place that cannot be trusted. Bug 7 is the worst by exploitability — bugs 8–10 need an attacker to know which endpoints are unguarded, while bug 7 turns any registered account into a legitimate admin. The minimal fix is one middleware plus one field removal:

```js
const requireAdmin = (req, res, next) =>
  req.user?.role === "admin" ? next() : res.status(403).json({ error: "Forbidden" });

// every /api/admin/* route and every data-affecting write:
app.post("/api/products", authenticateToken, requireAdmin, (req, res) => { … });

// and in PUT /api/users/me — never read `role` from the request body:
const { name, shipping_address, phone } = req.body;
```

**Related observations (not counted as separate defects):** the login page heading reads `Đăng Ký` ("Register") instead of `Đăng Nhập`, and the email field is labelled `Username`. Both are in `Login.jsx` and are cosmetic/labelling faults outside the FR-02 assertions.

> Screenshots for each failing assertion are produced automatically (`screenshot: 'only-on-failure'`) under `src/test-results/`. GitHub Issues still to be filed.

### Unautomated test cases

`All 12 selected test cases for FR-02, all 12 for FR-11 and all 12 for FR-12 were automated.`

**FR-02** — four of the original manual cases were consolidated into two (§2.2) and the freed budget was spent on two additional cases, so the automated set is 12 cases covering the same behaviour plus two uncovered FR-02 requirements.

**FR-12** — one manual case was dropped as wholly redundant and two groups of verb-only duplicates were merged (§2.6), freeing four slots that were spent on the client-guard bypass, JWT payload tampering, fully anonymous writes, and privilege escalation. One condition was examined and deliberately **not** automated: token expiry, because this build signs JWTs with no `exp` claim, so no input could ever make such a case fail.

**FR-11** — three of the original manual cases were consolidated into two (§2.4) and the single freed slot was spent on FR11-TC10, the API-level ownership check. One behaviour was examined and deliberately **not** automated: `Profile.jsx:99` renders a raw uppercased English code for any status outside the known five, violating the Vietnamese-label requirement, but the backend's transition whitelist makes that state unreachable through the API. Automating it would require writing directly to `database.sqlite`, which would test a state the product cannot actually enter.

## 7. Agent Skills

Agent Skills used:

1. **`ai-audit-logger`** — records AI interactions and audit information into `ai-audit-log.json`, and generates `AI_Audit_Report.md`.
2. **`automation-test-builder`** — converts written test cases into data-driven Playwright tests: one `.spec.ts` looped over a separate `.csv`, three browser projects, and the HTML reporter stamped with the student ID.

**Reuse across the three features.** `automation-test-builder` was invoked with the feature id and the SUT URLs. For FR-02 it produced the CSV, the spec, the shared `fixtures.ts` and `playwright.config.ts` with the three browser projects and the `Run by:` stamp already wired. Running it again for FR-11 and FR-12 touched `playwright.config.ts` not at all and *extended* `fixtures.ts` rather than forking it: FR-11 reused `registerFreshUser` and `apiLogin` unchanged and added `registerAndLogin`, `createOrder`, `seedOrders`, `VI_STATUS` beside them, which FR-12 then inherited. The only edit to existing FR-02 code was renaming the account prefix `fr02-` → `eshop-`, since the helper is no longer FR-02's alone.

Three of the skill's quality rules are visible in the output: "never invent a selector" forced the DOM to be verified first; "never invent a URL" turned up the missing `/orders` route before any code was written; "expected values belong in the CSV" is why `expected_status` and the seeded statuses are data columns rather than literals in the spec.

## 8. Bloom-AI Alignment

| Level | Evidence |
|---|---|
| G9.2 Apply | Applied AI to generate three data-driven Playwright suites (FR-02, FR-11, FR-12): 36 CSV-driven cases, 16 assertion patterns, multi-browser configuration, stamped HTML report, with `fixtures.ts` and `playwright.config.ts` written once and reused across all three features |
| G9.3 Analyse | Reviewed both manual test-case sets against the running system — found two redundant pairs and two unobservable expectations in FR-02, and in FR-11 a three-way redundancy, an unfalsifiable colour expectation, and a page that does not exist; identified an invalid measurement caused by shared account state and re-measured correctly; in FR-12 a wholly redundant case, two verb-only duplications and an untestable expiry condition; classified all 22 failures as genuine defects and traced each to a source line, including recognising bugs 7–10 as four symptoms of one missing authorisation layer rather than four unrelated faults |
| G9.4 Collaborate | Iterated with AI across probing, generation, execution, and environment debugging, including rejecting a proposed browser substitution after verifying that Firefox forks lack the Juggler protocol; caught and corrected the AI's own miscount of the FR-11 consolidation arithmetic rather than accepting its summary (audit `A010`); caught the AI corrupting seeded product data while probing FR-12's write endpoints and required it to restore the fixture and isolate its probes |

## 9. Summary

| Metric | Result |
|---|---:|
| Features | 3 |
| Test cases | 36 (12 per feature) |
| Automated | 36 (FR-02, FR-11, FR-12) |
| Executed | 72 runs |
| Passed | 50 |
| Failed | 22 |
| Browser runs | 72 of 108 (Firefox blocked, §3.4) |
| Genuine bugs | 10 (5 critical) |

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

- [x] Main report: Markdown + PDF
- [x] Public GitHub repository link
- [x] Scripts + CSV data + HTML reports *(FR-02, FR-11, FR-12)*
- [ ] Multi-browser HTML reports *(Chrome + Edge done; Firefox blocked, §3.4)*
- [ ] Unlisted YouTube demo link
- [x] AI Audit Report: Markdown + PDF
- [ ] AI Critique: Markdown + PDF
- [ ] Git commit log text file
- [ ] Bug reports + screenshots *(10 defects documented in §6; GitHub Issues for bugs 6–10 still to file)*
- [ ] README.md with self-assessment + test summary
- [ ] Agent Skills + demonstration video
