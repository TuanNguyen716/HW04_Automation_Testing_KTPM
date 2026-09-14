import { defineConfig, devices } from '@playwright/test';

/** Shown as the HTML report header title and as an annotation on every test. */
const RUN_BY = '20127420 - Nguyễn Trần Minh Tuấn';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,

  /* HTML reporter. `title` is rendered as the report header (.header-title);
     tests/fixtures.ts repeats it as a per-test annotation. Both are config-driven -
     the generated report is never edited by hand. */
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never', title: `Run by: ${RUN_BY}` }],
    ['list'],
  ],

  use: {
    /* Override per run:  BASE_URL=https://sut.example npx playwright test */
    baseURL: process.env.BASE_URL || 'TODO_BASE_URL',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  /* Every feature runs on all three required browsers. */
  projects: [
    { name: 'chrome', use: { ...devices['Desktop Chrome'], channel: 'chrome' } },
    { name: 'edge', use: { ...devices['Desktop Edge'], channel: 'msedge' } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  ],
});
