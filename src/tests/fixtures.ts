/**
 * Shared test base for every feature spec.
 *
 *  - `readCsv()`  : loads the separate .csv test-data file (no inline test data).
 *  - `test`       : @playwright/test `test` extended with an auto fixture that
 *                   stamps `Run by: 20127420 - Nguyen Tran Minh Tuan` on every
 *                   test, so it is visible in the Playwright HTML report.
 *
 * Import from here instead of from '@playwright/test':
 *   import { test, expect, readCsv } from './fixtures';
 */
import { test as base, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

export const RUN_BY = '20127420 - Nguyễn Trần Minh Tuấn';

export type CsvRow = Record<string, string>;

/** RFC4180-ish parser: quoted fields, embedded commas/newlines, "" escapes, CRLF, BOM. */
export function parseCsv(text: string): CsvRow[] {
  const src = text.replace(/^﻿/, '');
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  let dirty = false; // this physical row has content

  const endField = () => { row.push(field); field = ''; dirty = true; };
  const endRow = () => { endField(); rows.push(row); row = []; dirty = false; };

  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (quoted) {
      if (c === '"' && src[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') quoted = false;
      else field += c;
      continue;
    }
    if (c === '"') { quoted = true; dirty = true; }
    else if (c === ',') endField();
    else if (c === '\n') endRow();
    else if (c !== '\r') field += c;
  }
  if (dirty || field !== '') endRow();

  const grid = rows.filter((r) => r.some((v) => v.trim() !== ''));
  if (grid.length === 0) return [];
  const header = grid[0].map((h) => h.trim());
  return grid.slice(1).map((r) =>
    Object.fromEntries(header.map((h, i) => [h, (r[i] ?? '').trim()])) as CsvRow,
  );
}

/**
 * Read a CSV test-data file. `file` is resolved against the directory Playwright
 * was started from (the project root holding playwright.config.ts), e.g.
 *   readCsv('data/fr-01-login.csv')
 * An absolute path is used as-is.
 */
export function readCsv(file: string): CsvRow[] {
  const abs = path.isAbsolute(file) ? file : path.resolve(process.cwd(), file);
  if (!fs.existsSync(abs)) {
    throw new Error(`CSV test data not found: ${abs} (run Playwright from the project root)`);
  }
  const rows = parseCsv(fs.readFileSync(abs, 'utf8'));
  if (rows.length === 0) throw new Error(`CSV test data is empty: ${abs}`);
  return rows;
}

/** `true`/`1`/`yes` (any case) -> true. CSV values are always strings. */
export function isTrue(v: string | undefined): boolean {
  return ['true', '1', 'yes'].includes((v ?? '').trim().toLowerCase());
}

export const test = base.extend<{ runBy: void }>({
  runBy: [
    async ({}, use, testInfo) => {
      testInfo.annotations.push({ type: 'Run by', description: RUN_BY });
      await use();
    },
    { auto: true },
  ],
});

export { expect };

/* ------------------------------------------------------------------------- *
 * EShop SUT helpers - shared by FR-02 / FR-11 / FR-12.
 * The backend is the source of truth for accounts; driving registration and
 * the failed-login counter through the API keeps UI tests fast and lets each
 * test own a private account, so the 3 browser projects never collide on
 * shared lockout state.
 * ------------------------------------------------------------------------- */

export const API_BASE = process.env.API_BASE || 'http://localhost:3000';

/** Password used for every account this suite creates. */
export const FRESH_PASSWORD = 'Test1234!';

export type LoginResult = { status: number; body: any };

/** POST /api/login straight to the backend (no browser). */
export async function apiLogin(email: string, password: string): Promise<LoginResult> {
  const res = await fetch(`${API_BASE}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return { status: res.status, body: await res.json().catch(() => null) };
}

/**
 * Register a brand-new account and return its email. Unique per call, so each
 * test starts from `login_attempts = 0` / `locked_until = NULL` regardless of
 * what other tests or browser projects did.
 */
export async function registerFreshUser(tag: string): Promise<string> {
  const email = `fr02-${tag}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@eshop.test`;
  const res = await fetch(`${API_BASE}/api/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: `Auto ${tag}`, email, password: FRESH_PASSWORD }),
  });
  if (!res.ok) throw new Error(`registerFreshUser failed (${res.status}) for ${email}`);
  return email;
}

/** Drive `count` consecutive failed logins through the API to move the counter. */
export async function failLogin(email: string, count: number): Promise<LoginResult[]> {
  const out: LoginResult[] = [];
  for (let i = 0; i < count; i++) out.push(await apiLogin(email, 'DefinitelyWrong9!'));
  return out;
}
