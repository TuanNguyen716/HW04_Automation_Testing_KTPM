# AI Audit Report

> Generated from `ai-audit-log.json` by the `ai-audit-logger` Agent Skill on 2026-09-14 09:55:48 +0700.
> Every entry below was recorded at the time of the interaction; fields that were
> never recorded are shown as _Not provided_ and are **not** reconstructed after the fact.

## 1. AI Usage Declaration

AI tools were used as a **collaborator** in this assignment, not as an unreviewed code generator.
Every AI-generated artifact listed in this report was read, reviewed and, where necessary,
corrected by the student before being accepted into the deliverable. The prompt, the raw AI
output, the human review and the resulting human action are recorded separately for each
interaction so the contribution of each party is traceable.

Declared by: EXAMPLE STUDENT (demo data - not real submission evidence) (00000000)

## 2. Project / Homework Information

| Field | Value |
| --- | --- |
| Student name | EXAMPLE STUDENT (demo data - not real submission evidence) |
| Student ID | 00000000 |
| Homework | HW04 |
| Course | Software Testing (KTPM) |
| Project | HW04 Automation Testing - E-shop |
| Repository / path | ./src |
| System under test | https://example-eshop.test |
| Feature(s) under test | FR-01 Registration |
| Audit started | 2026-09-14 09:00:00 +0700 |
| Audit last updated | 2026-09-14 09:55:40 +0700 |
| Interactions recorded | 3 |

## 3. AI Tools Used

| AI tool | Interactions | Used for |
| --- | --- | --- |
| Claude | 3 | Automation script generation, Multi-browser configuration, Test case analysis |

## 4. AI Interaction Log

### A001 - Derive test cases for valid user registration (FR-01)

| Field | Value |
| --- | --- |
| Date / time | 2026-09-14 09:12:40 +0700 |
| AI tool | Claude |
| Category | Test case analysis |
| Feature | FR-01 Registration |
| Test case ID | TC-01..TC-03 |
| File modified | docs/HW04.md |
| Commit | _Not provided_ |
| Output accepted | Yes |
| Output modified | Yes |
| Related interaction | _Not provided_ |
| Final status | accepted_with_modification |

**Prompt**

```
For the registration form at /register (fields: full name, email, password, confirm password, accept-terms checkbox), list the test cases for the VALID registration path only. Give each an ID and expected result.
```

**AI output**

```
TC-01 Register with all valid fields -> account created, redirected to /login with success banner.
TC-02 Register with the minimum valid password length (8 chars) -> account created.
TC-03 Register with a full name containing diacritics -> account created, name shown correctly on profile.
```

**Human review**

TC-01..TC-03 are reasonable and match the spec. AI did not ask whether email confirmation is required before login, which the spec does require - so TC-01's expected result is incomplete.

**Human decision / action**

Kept all three cases, amended TC-01's expected result to 'account created in PENDING state, confirmation email sent, login blocked until confirmed'. Added TC-04 for the confirmation step myself.

**Reason for modification**

AI assumed immediate activation; the SUT requires email confirmation.

**Issues found in this output:** Incorrect assumption that registration activates the account (medium)

---

### A002 - Generate a Playwright test for TC-01 valid registration

| Field | Value |
| --- | --- |
| Date / time | 2026-09-14 10:05:18 +0700 |
| AI tool | Claude |
| Category | Automation script generation |
| Feature | FR-01 Registration |
| Test case ID | TC-01 |
| File modified | src/tests/fr01-registration.spec.ts |
| Commit | (not committed at time of logging) |
| Output accepted | Yes |
| Output modified | Yes |
| Related interaction | _Not provided_ |
| Final status | accepted_with_modification |

**Prompt**

```
Write a Playwright test in TypeScript for TC-01 (valid registration) on https://example-eshop.test/register. Test account: newuser+{ts}@example.test, password: [REDACTED] Assert the user lands on /login with a success message.
```

**AI output**

```ts
import { test, expect } from '@playwright/test';

test('TC-01 valid registration', async ({ page }) => {
  await page.goto('https://example-eshop.test/register');
  await page.fill('#name', 'Minh Tuan');
  await page.fill('#email', `newuser+${Date.now()}@example.test`);
  await page.fill('#password', process.env.TEST_PASSWORD!);
  await page.fill('#confirm', process.env.TEST_PASSWORD!);
  await page.check('#terms');
  await page.click('.btn-primary');
  await page.waitForTimeout(3000);
  await expect(page).toHaveURL(/login/);
});
```

**Human review**

Three problems. (1) '.btn-primary' is fragile: the registration page has three buttons with that class (Submit, Cancel, and the newsletter button in the footer), so the test could click the wrong one and would break on any restyling. (2) waitForTimeout(3000) is an arbitrary sleep - flaky under load and slow. (3) The only assertion is the URL; the success banner and the PENDING account state required by TC-01 are never asserted, so the test would pass even if registration silently failed and redirected.

**Human decision / action**

Replaced the click with getByRole('button', { name: 'Create account' }); removed waitForTimeout in favour of Playwright's auto-waiting web-first assertions; added assertions for the success banner text and for the confirmation-required message. Kept the AI's structure, env-var password handling and unique-email pattern.

**Reason for modification**

Selector stability, flaky wait, and insufficient assertions - the test as generated could pass while the feature was broken.

**Issues found in this output:** Fragile CSS selector '.btn-primary' - three buttons on the p (high), waitForTimeout(3000) hard-coded sleep instead of a web-first (medium), Missing assertions - only the URL was checked, not the succe (high)

---

### A003 - Configure the Playwright project matrix for Chromium, Firefox and WebKit

| Field | Value |
| --- | --- |
| Date / time | 2026-09-14 11:20:03 +0700 |
| AI tool | Claude |
| Category | Multi-browser configuration |
| Feature | FR-01 Registration |
| Test case ID | _Not provided_ |
| File modified | _Not provided_ |
| Commit | _Not provided_ |
| Output accepted | _Not provided_ |
| Output modified | _Not provided_ |
| Related interaction | _Not provided_ |
| Final status | pending_review |

**Prompt**

```
Show the projects section of playwright.config.ts to run every spec on Chromium, Firefox and WebKit, with an HTML reporter.
```

**AI output**

```ts
export default defineConfig({
  reporter: [['html', { outputFolder: 'playwright-report' }]],
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit',   use: { ...devices['Desktop Safari'] } },
  ],
});
```

**Human review**

_Not provided_ (no review was recorded for this interaction)

**Human decision / action**

_Not provided_

---

## 5. Human Review and Corrections

| ID | AI proposed | Human review | Human action | Status |
| --- | --- | --- | --- | --- |
| A001 | TC-01 Register with all valid fields -> account created, redirected to /login with succes… | TC-01..TC-03 are reasonable and match the spec. AI did not ask whether email confirmation… | Kept all three cases, amended TC-01's expected result to 'account created in PENDING stat… | accepted_with_modification |
| A002 | import { test, expect } from '@playwright/test'; test('TC-01 valid registration', async (… | Three problems. (1) '.btn-primary' is fragile: the registration page has three buttons wi… | Replaced the click with getByRole('button', { name: 'Create account' }); removed waitForT… | accepted_with_modification |

Interactions where AI output was accepted unchanged: 0 of 3.

## 6. AI Mistakes / Missed Issues

| ID | Issue | Severity | Why AI produced/missed it | Human correction | Resolution |
| --- | --- | --- | --- | --- | --- |
| A001 | Incorrect assumption that registration activates the account immediately | medium | The prompt described the form fields but not the post-submit flow, so the AI filled the g… | Expected results rewritten against the spec; a TC-04 for email confirmation was added by … | Resolved before any automation was written. |
| A002 | Fragile CSS selector '.btn-primary' - three buttons on the page share the class | high | The AI had no access to the live DOM and inferred a selector from a common Bootstrap clas… | getByRole('button', { name: 'Create account' }) - semantic, unique, and resilient to rest… | Fixed. Test re-run green on Chromium, Firefox and WebKit. |
| A002 | waitForTimeout(3000) hard-coded sleep instead of a web-first assertion | medium | A fixed sleep is a common pattern in older tutorials that dominate training data; the AI … | Removed the sleep; relied on expect(page).toHaveURL() and expect(locator).toBeVisible() a… | Fixed. Test runtime dropped from ~4.1s to ~1.3s. |
| A002 | Missing assertions - only the URL was checked, not the success banner or the PENDING acco… | high | The prompt asked to 'assert the user lands on /login with a success message' but the AI i… | Added expect(page.getByText('Registration successful')).toBeVisible() and an assertion fo… | Fixed. Verified the test now fails when the banner is suppressed. |

Issues by severity: high=2, medium=2

## 7. Summary of AI Assistance

| Metric | Value |
| --- | --- |
| Total AI interactions | 3 |
| Interactions with human review recorded | 2 |
| AI outputs accepted as-is | 0 |
| AI outputs accepted after human modification | 2 |
| AI outputs rejected | 0 |
| Issues found during human review | 4 |

**AI usage by category**

| Category | Interactions |
| --- | --- |
| Automation script generation | 1 |
| Multi-browser configuration | 1 |
| Test case analysis | 1 |

## 8. Final Notes

DEMONSTRATION ENTRY SET. This file ships with the ai-audit-logger skill to show the expected shape of a real audit log. It is fabricated example data and must never be submitted as evidence of actual AI use.

**Scope of this report.** It reproduces only what was recorded in `ai-audit-log.json`. It is evidence of the
AI-use process, not a guarantee that the assignment's audit requirements are met - the student
remains responsible for checking the submission against the HW04 specification.

No credentials were stored in this log. Test-account passwords appearing in prompts were redacted to [REDACTED] by the logger.
