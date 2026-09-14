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
  const email = `eshop-${tag}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@eshop.test`;
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

/* ------------------------------------------------------------------------- *
 * Orders - shared by FR-11 (and anything else that needs seeded order data).
 *
 * Orders are seeded through the API for the same reason the login counter is:
 * driving the UI checkout flow for every row would be slow, and each test needs
 * a private user so the 3 browser projects never see each other's rows.
 * ------------------------------------------------------------------------- */

/** The five statuses the backend accepts, and their required Vietnamese label. */
export const VI_STATUS: Record<string, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  shipping: 'Đang giao',
  delivered: 'Đã giao',
  canceled: 'Đã hủy',
};

/** Admin-driven transitions needed to move a new order from `pending` to `target`. */
const STATUS_PATH: Record<string, string[]> = {
  pending: [],
  confirmed: ['confirmed'],
  shipping: ['confirmed', 'shipping'],
  delivered: ['confirmed', 'shipping', 'delivered'],
  canceled: ['canceled'],
};

export type Account = { email: string; token: string; userId: number };
export type Order = {
  id: number;
  user_id: number;
  total_amount: number;
  status: string;
  created_at: string;
};

/** Register a fresh account and log it in. Returns the JWT plus the user id. */
export async function registerAndLogin(tag: string): Promise<Account> {
  const email = await registerFreshUser(tag);
  const { status, body } = await apiLogin(email, FRESH_PASSWORD);
  if (status !== 200 || !body?.token) throw new Error(`login failed (${status}) for ${email}`);
  return { email, token: body.token, userId: body.user.id };
}

let adminTokenCache: Promise<string> | undefined;

/** Admin JWT - the only account allowed to move an order's status. */
export function adminToken(): Promise<string> {
  adminTokenCache ??= apiLogin('admin@eshop.com', 'Admin123!').then(({ status, body }) => {
    if (status !== 200 || !body?.token) throw new Error(`admin login failed (${status})`);
    return body.token as string;
  });
  return adminTokenCache;
}

const authHeaders = (token: string) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

/** POST /api/checkout - creates one order in status `pending`. */
export async function createOrder(token: string, totalAmount: number): Promise<number> {
  const res = await fetch(`${API_BASE}/api/checkout`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ total_amount: totalAmount, shipping_address: '1 Le Loi, Q1, TP.HCM' }),
  });
  const body = await res.json();
  if (!res.ok || !body?.orderId) throw new Error(`checkout failed (${res.status})`);
  return body.orderId;
}

/** PUT /api/admin/orders/:id/status - one hop; the backend rejects invalid transitions. */
export async function setOrderStatus(orderId: number, status: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/admin/orders/${orderId}/status`, {
    method: 'PUT',
    headers: authHeaders(await adminToken()),
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    throw new Error(`status -> ${status} failed on order ${orderId} (${res.status})`);
  }
}

/** GET /api/orders/my-orders. `token` empty -> unauthenticated call (expected 401). */
export async function getMyOrders(token: string): Promise<{ status: number; orders: Order[] }> {
  const res = await fetch(`${API_BASE}/api/orders/my-orders`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const body = await res.json().catch(() => null);
  return { status: res.status, orders: Array.isArray(body) ? body : [] };
}

/** GET /api/orders/:id - used to check that one user cannot read another's order. */
export async function getOrderById(orderId: number, token: string) {
  const res = await fetch(`${API_BASE}/api/orders/${orderId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return { status: res.status, body: await res.json().catch(() => null) };
}

/**
 * Create one order per entry in `statuses`, walking each to its target status.
 * `amounts` may hold a single value, which is then used for every order.
 * Returns the orders as the backend reports them (newest id first).
 */
export async function seedOrders(
  account: Account,
  statuses: string[],
  amounts: number[],
): Promise<Order[]> {
  for (const [i, status] of statuses.entries()) {
    if (!(status in STATUS_PATH)) throw new Error(`unknown seed status: ${status}`);
    const id = await createOrder(account.token, amounts[i] ?? amounts[0]);
    for (const hop of STATUS_PATH[status]) await setOrderStatus(id, hop);
  }
  const { orders } = await getMyOrders(account.token);
  return orders;
}

/** Split a pipe-separated CSV cell: "a|b|c" -> ['a','b','c'], "" -> []. */
export function splitList(cell: string | undefined): string[] {
  return (cell ?? '').split('|').map((s) => s.trim()).filter(Boolean);
}
