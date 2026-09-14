/**
 * FR-XX - <feature name>
 * Source test cases: docs/Test-cases.md (TC ids in the csv `tc_id` column)
 * Test data:         data/fr-xx-<feature>.csv   <- edit the CSV, never this file, to add cases
 *
 * TODO(assumption): list here anything not given by the spec (selectors, URLs, messages).
 */
import { test, expect, readCsv, isTrue } from './fixtures';

const rows = readCsv('data/fr-xx-<feature>.csv');

test.describe('FR-XX - <feature name>', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/TODO_PATH');
  });

  for (const row of rows) {
    test(`${row.tc_id} - ${row.title}`, async ({ page }) => {
      // --- Arrange: one shared flow, data comes from the CSV row --------------
      const field = page.getByLabel('TODO_LABEL');
      const submit = page.getByRole('button', { name: 'TODO_BUTTON' });

      // Assertion #1 - state before interaction
      await expect(submit).toBeEnabled();

      // --- Act ----------------------------------------------------------------
      await field.fill(row.TODO_COLUMN);

      // Assertion #2 - input actually holds the CSV value
      await expect(field).toHaveValue(row.TODO_COLUMN);

      await submit.click();

      // --- Assert: branch only on the expected outcome, never duplicate the flow
      if (isTrue(row.expect_success)) {
        // Assertion #3 - navigation
        await expect(page).toHaveURL(new RegExp(`${row.expected_url_path}$`));
        // Assertion #4 - visible confirmation text
        await expect(page.getByRole('heading', { name: 'TODO' })).toBeVisible();
      } else {
        const error = page.getByRole('alert');
        // Assertion #5 - error text from the CSV expectation
        await expect(error).toBeVisible();
        await expect(error).toContainText(row.expected_message);
        await expect(page).toHaveURL(new RegExp(`${row.expected_url_path}$`));
      }
    });
  }
});
