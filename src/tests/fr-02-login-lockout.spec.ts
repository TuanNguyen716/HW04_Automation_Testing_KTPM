/**
 * FR-02 - Đăng nhập & Khóa tài khoản (Login & account lockout)
 *
 * Source test cases: docs/HW04.md  §2.1   (ids mapped in the csv `tc_id` column)
 * Test data:         data/fr-02-login-lockout.csv   <- edit the CSV, never this file
 *
 * Spec under test (docs/System Requirements Specification.md, FR-02):
 *   - failed login increases the counter by exactly 1
 *   - >= 3 consecutive failures lock the account for 30 seconds
 *   - the error must not disclose the cause
 *   - success returns a JWT sent as `Authorization: Bearer <token>`
 *   - the email field must be `type="email"` (HTML5 format validation)
 *
 * Notes on the SUT (verified against the running app, not assumed):
 *   - the login form's <label>s are not associated with their <input>s (no
 *     for/id, no name, no placeholder, no data-testid), so getByLabel/getByRole
 *     cannot reach them. Positional CSS is the only available locator here.
 *   - the frontend replaces every backend error with one generic sentence, so
 *     the distinction "wrong password" vs "account locked" is only observable on
 *     the network response - hence `expected_status` in the CSV.
 */
import {
  test,
  expect,
  readCsv,
  isTrue,
  registerFreshUser,
  failLogin,
  apiLogin,
  FRESH_PASSWORD,
} from './fixtures';

const rows = readCsv('data/fr-02-login-lockout.csv');

/** The one generic message the UI renders for any login failure. */
const GENERIC_ERROR = 'Đăng nhập thất bại. Vui lòng kiểm tra lại.';

test.describe('FR-02 - Đăng nhập & Khóa tài khoản', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  for (const row of rows) {
    const waitSeconds = Number(row.wait_seconds || 0);

    test(`${row.tc_id} - ${row.title}`, async ({ page }) => {
      // The lock window is served by the backend in real time; give the rows
      // that wait it out enough budget on top of Playwright's default.
      test.setTimeout(30_000 + waitSeconds * 1000 * 2);

      // --- Arrange -----------------------------------------------------------
      // Each row owns a freshly registered account, so login_attempts /
      // locked_until start clean no matter what the other rows or the other two
      // browser projects are doing at the same time.
      const email =
        row.email === '{{FRESH}}' ? await registerFreshUser(row.tc_id) :
        row.email === '{{EMPTY}}' ? '' :
        row.email;
      const password =
        row.password === '{{CORRECT}}' ? FRESH_PASSWORD :
        row.password === '{{EMPTY}}' ? '' :
        row.password;

      const emailField = page.locator('form input').nth(0);
      const passwordField = page.locator('form input').nth(1);
      const submit = page.getByRole('button', { name: 'Sign In' });
      const error = page.getByText(GENERIC_ERROR);

      // Assertion pattern A - toBeVisible/toBeEnabled: the form is usable and
      // no stale error is on screen before we do anything.
      await expect(submit).toBeEnabled();
      await expect(error).toBeHidden();

      // Move the failed-login counter with the API: faster and more reliable
      // than repeating the UI flow, and it is the same endpoint the UI calls.
      if (Number(row.pre_fails) > 0) await failLogin(email, Number(row.pre_fails));
      if (waitSeconds > 0) {
        await new Promise((r) => setTimeout(r, waitSeconds * 1000));
      }

      // --- Checks that inspect the page/contract rather than the login outcome
      if (row.check === 'field_types') {
        // FR-02: "Trường email phải dùng type=email (có validate HTML5 format)".
        // Assertion pattern B - toHaveAttribute on the rendered markup.
        await expect(emailField).toHaveAttribute('type', 'email');
        // A password box must not render its value in clear text.
        await expect(passwordField).toHaveAttribute('type', 'password');
        return;
      }

      if (row.check === 'required_field') {
        await emailField.fill(email);
        await passwordField.fill(password);
        await submit.click();
        // The empty required field blocks submission: the browser keeps us on
        // /login and the field reports itself invalid.
        const empty = email === '' ? emailField : passwordField;
        await expect(page).toHaveURL(/\/login$/);
        await expect(empty).toHaveJSProperty('validity.valueMissing', true);
        await expect(error).toBeHidden();
        return;
      }

      if (row.check === 'html5_email') {
        await emailField.fill(email);
        await passwordField.fill(password);
        await submit.click();
        // HTML5 format validation must reject "user-at-eshop.com" before the
        // form is ever submitted.
        await expect(page).toHaveURL(/\/login$/);
        await expect(emailField).toHaveJSProperty('validity.typeMismatch', true);
        return;
      }

      if (row.check === 'no_enumeration') {
        // FR-02: the error "không để lộ chi tiết nguyên nhân" - an unknown email
        // and a known email with a wrong password must be indistinguishable.
        const unknown = await apiLogin(`no-such-user-${Date.now()}@eshop.test`, password);
        const knownWrongPassword = await apiLogin(email, password);
        expect(unknown.status).toBe(Number(row.expected_status));
        expect(knownWrongPassword.status).toBe(unknown.status);
        expect(knownWrongPassword.body).toEqual(unknown.body);

        // ...and the UI shows that same single message for both.
        await emailField.fill(email);
        await passwordField.fill(password);
        await submit.click();
        // Assertion pattern C - toContainText on the visible error.
        await expect(error).toBeVisible();
        await expect(error).toContainText(row.expected_message);
        return;
      }

      // --- Act: the shared login flow (login / bearer / no_password_leak) -----
      await emailField.fill(email);
      await passwordField.fill(password);

      // Assertion pattern D - toHaveValue: the CSV data really reached the form.
      await expect(emailField).toHaveValue(email);
      await expect(passwordField).toHaveValue(password);

      const loginResponse = page.waitForResponse(
        (r) => r.url().endsWith('/api/login') && r.request().method() === 'POST',
      );
      await submit.click();
      const response = await loginResponse;

      // The backend status is the only place the lock is observable, because the
      // frontend collapses every failure into one message.
      expect(response.status()).toBe(Number(row.expected_status));

      // --- Assert ------------------------------------------------------------
      if (!isTrue(row.expect_success)) {
        await expect(error).toBeVisible();
        await expect(error).toContainText(row.expected_message);
        await expect(page).toHaveURL(/\/login$/);
        // A rejected login must not leave a session behind.
        expect(await page.evaluate(() => localStorage.getItem('token'))).toBeNull();
        return;
      }

      // Assertion pattern E - toHaveURL: success leaves the login page.
      await expect(page).toHaveURL(/\/$/);
      await expect(error).toBeHidden();

      const body = await response.json();
      expect(body.token, 'login must return a JWT').toBeTruthy();
      // A JWT is header.payload.signature.
      expect(body.token).toMatch(/^[\w-]+\.[\w-]+\.[\w-]+$/);
      expect(await page.evaluate(() => localStorage.getItem('token'))).toBe(body.token);

      if (row.check === 'no_password_leak') {
        // FR-02 forbids disclosing details; the login response must never carry
        // the account's password back to the client.
        expect(body.user, 'login response must not include the password').not.toHaveProperty(
          'password',
        );
        return;
      }

      if (row.check === 'bearer') {
        // FR-02: "Token ... gửi kèm tất cả các yêu cầu có xác thực qua header
        // Authorization: Bearer <token>". Reload so the app re-issues its
        // authenticated call, and read the header off the wire.
        const authed = page.waitForRequest((r) => r.url().includes('/api/users/me'));
        await page.reload();
        const header = (await authed).headers()['authorization'];
        expect(header).toBe(`Bearer ${body.token}`);
      }
    });
  }
});
