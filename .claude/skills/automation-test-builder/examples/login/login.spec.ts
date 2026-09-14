/**
 * FR-00 - Login (fictional demo feature, SUT = examples/login/demo-app)
 * Test data: data/login.csv  <- add rows there, this file never changes
 *
 * Assumptions (fictional app, documented in examples/login/README.md):
 *  - /login.html has labelled "Email" and "Password" inputs and a "Sign in" button.
 *  - Errors are rendered in a role="alert" container on the same page.
 *  - Success navigates to /dashboard.html showing a "Welcome back" heading.
 */
import { test, expect, readCsv, isTrue } from './fixtures';

const rows = readCsv('data/login.csv');

test.describe('FR-00 - Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login.html');
  });

  for (const row of rows) {
    test(`${row.tc_id} - ${row.title}`, async ({ page }) => {
      const email = page.getByLabel('Email');
      const password = page.getByLabel('Password');
      const signIn = page.getByRole('button', { name: 'Sign in' });

      // 1. toBeEnabled - the form is usable before we touch it
      await expect(signIn).toBeEnabled();

      await email.fill(row.email);
      await password.fill(row.password);

      // 2. toHaveValue - the CSV value really reached the field
      await expect(email).toHaveValue(row.email);

      await signIn.click();

      if (isTrue(row.expect_success)) {
        // 3. toHaveURL - navigation happened
        await expect(page).toHaveURL(new RegExp(`${row.expected_url_path}$`));
        // 4. toBeVisible + 5. toContainText - the expected screen is really there
        const welcome = page.getByRole('heading', { name: row.expected_message });
        await expect(welcome).toBeVisible();
        await expect(welcome).toContainText(row.expected_message);
      } else {
        const error = page.getByRole('alert');
        await expect(error).toBeVisible();
        await expect(error).toContainText(row.expected_message);
        await expect(page).toHaveURL(new RegExp(`${row.expected_url_path}$`));
      }
    });
  }
});
