/**
 * FR-11 - Xem lịch sử đơn hàng (User)
 *
 * Source test cases: docs/FR-11.md            (ids mapped in the csv `tc_id` column)
 * Test data:         data/fr-11-order-history.csv   <- edit the CSV, never this file
 *
 * Spec under test (docs/System Requirements Specification.md, FR-11):
 *   - a user only ever sees their own orders
 *   - each order shows Mã đơn, Ngày đặt, Tổng tiền, Trạng thái
 *   - the status must be translated to Vietnamese and colour-coded distinctly
 *
 * Notes on the SUT (verified against the running app, not assumed):
 *   - there is no /orders route. Order history is the right-hand panel of
 *     /profile, under the heading "Lịch sử đơn hàng" - the page's only <table>.
 *   - not logged in, the page renders the plain text "Vui lòng đăng nhập" and
 *     never calls /api/orders/my-orders (the frontend short-circuits on a null
 *     token). The API itself answers 401, which is the real enforcement point.
 *   - the empty state is the sentence "Bạn chưa có đơn hàng nào." with no table.
 *   - date and amount are rendered with `toLocaleDateString()` /
 *     `toLocaleString()`, i.e. in the *browser's* locale, so the expected string
 *     is derived in-page from the backend value rather than hard-coded. That
 *     still binds the cell to that order's real created_at / total_amount.
 *   - the session is a JWT in localStorage under `token`; seeding it and
 *     reloading is a real logged-in session (AuthContext re-fetches the user).
 *     Only FR11-TC01 drives the actual login form, as its test case requires.
 */
import {
  test,
  expect,
  readCsv,
  splitList,
  registerAndLogin,
  seedOrders,
  getMyOrders,
  getOrderById,
  VI_STATUS,
  FRESH_PASSWORD,
  type Account,
  type Order,
} from './fixtures';

const rows = readCsv('data/fr-11-order-history.csv');

const EMPTY_STATE = 'Bạn chưa có đơn hàng nào.';
const LOGIN_PROMPT = 'Vui lòng đăng nhập';

test.describe('FR-11 - Xem lịch sử đơn hàng (User)', () => {
  for (const row of rows) {
    test(`${row.tc_id} - ${row.title}`, async ({ page }) => {
      // Seeding is several sequential API round-trips; give it room.
      test.setTimeout(60_000);

      // --- Arrange -----------------------------------------------------------
      const statuses = splitList(row.statuses);
      const amounts = splitList(row.amounts).map(Number);
      const otherStatuses = splitList(row.other_user_statuses);
      const expectedRows = Number(row.expect_rows || 0);

      // Every row owns a private account, so the 3 browser projects running in
      // parallel never see each other's orders.
      const user: Account = await registerAndLogin(row.tc_id.toLowerCase());
      const seeded: Order[] = statuses.length ? await seedOrders(user, statuses, amounts) : [];

      let other: Account | undefined;
      let otherOrders: Order[] = [];
      if (otherStatuses.length) {
        other = await registerAndLogin(`${row.tc_id.toLowerCase()}-b`);
        otherOrders = await seedOrders(other, otherStatuses, amounts.length ? amounts : [500000]);
      }

      const historyHeading = page.getByRole('heading', { name: 'Lịch sử đơn hàng' });
      const table = page.getByRole('table');
      const orderRows = table.locator('tbody tr');
      const emptyState = page.getByText(EMPTY_STATE);
      const loginPrompt = page.getByText(LOGIN_PROMPT);

      // --- FR11-TC11: no session at all --------------------------------------
      if (row.check === 'anonymous') {
        // The frontend must not even ask for someone else's history.
        const calls: string[] = [];
        page.on('request', (r) => {
          if (r.url().includes('/api/orders')) calls.push(r.url());
        });

        await page.goto('/profile');

        // Assertion pattern A - toBeVisible / toBeHidden.
        await expect(loginPrompt).toBeVisible();
        await expect(loginPrompt).toHaveText(row.expected_message);
        await expect(historyHeading).toBeHidden();
        await expect(table).toBeHidden();
        expect(calls, 'anonymous page must not request order history').toEqual([]);

        // The real gate is the API, not the hidden UI: a direct unauthenticated
        // call must be rejected.
        const anon = await getMyOrders('');
        expect(anon.status, 'GET /api/orders/my-orders without a token').toBe(401);
        return;
      }

      // --- Log in ------------------------------------------------------------
      if (row.check === 'list') {
        // FR11-TC01 is specified as "user logs in and opens Order History", so
        // this row goes through the real form and the real header link.
        await page.goto('/login');
        await page.locator('form input').nth(0).fill(user.email);
        await page.locator('form input').nth(1).fill(FRESH_PASSWORD);
        await page.getByRole('button', { name: 'Sign In' }).click();
        await page.waitForURL(/\/$/);
        await page.locator('header').getByRole('link', { name: /Chào/ }).click();
        // Assertion pattern B - toHaveURL.
        await expect(page).toHaveURL(/\/profile$/);
      } else {
        await page.goto('/profile');
        await page.evaluate((t) => localStorage.setItem('token', t), user.token);
        await page.reload();
      }

      await expect(historyHeading).toBeVisible();

      // --- Empty state -------------------------------------------------------
      if (row.check === 'empty') {
        await expect(emptyState).toBeVisible();
        await expect(emptyState).toHaveText(row.expected_message);
        await expect(table).toBeHidden();
        expect(seeded, 'this row seeds no orders').toHaveLength(0);
        return;
      }

      // Every remaining row expects a populated table.
      await expect(table).toBeVisible();
      await expect(emptyState).toBeHidden();
      // Assertion pattern C - toHaveCount: the user's orders, all of them.
      await expect(orderRows).toHaveCount(expectedRows);
      expect(seeded).toHaveLength(expectedRows);

      // --- FR11-TC03: the four required columns ------------------------------
      if (row.check === 'columns') {
        const headers = await table.getByRole('columnheader').allInnerTexts();
        // FR-11: "Hiển thị: Mã đơn, Ngày đặt, Tổng tiền, Trạng thái".
        expect(headers).toEqual(
          expect.arrayContaining(['Mã ĐH', 'Ngày đặt', 'Tổng tiền', 'Trạng thái']),
        );
        return;
      }

      // --- FR11-TC04: every cell matches the backing record ------------------
      if (row.check === 'fields') {
        const order = seeded[0];
        const cells = orderRows.first().getByRole('cell');

        // Assertion pattern D - toHaveText on an exact, derived expectation.
        await expect(cells.nth(0)).toHaveText(`#${order.id}`);

        // Date and amount are locale-formatted by the page; derive the expected
        // string from the backend value inside the same browser.
        const [expectedDate, expectedAmount] = await page.evaluate(
          ([createdAt, total]) => [
            new Date(createdAt as string).toLocaleDateString(),
            `${Number(total).toLocaleString()} ₫`,
          ],
          [order.created_at, order.total_amount] as const,
        );
        await expect(cells.nth(1)).toHaveText(expectedDate);
        await expect(cells.nth(2)).toHaveText(expectedAmount);
        await expect(cells.nth(3)).toHaveText(VI_STATUS[order.status]);

        // ...and the date really is a date, not an "Invalid Date" passthrough.
        expect(expectedDate).not.toContain('Invalid');
        expect(new Date(order.created_at).getTime()).not.toBeNaN();
        return;
      }

      // --- FR11-TC05: currency formatting ------------------------------------
      if (row.check === 'currency') {
        const amountCell = orderRows.first().getByRole('cell').nth(2);
        const text = (await amountCell.innerText()).trim();
        // 1234567 must be grouped (1,234,567 / 1.234.567 - the separator is the
        // browser's) and carry the đồng sign. A bare "1234567 ₫" fails here.
        expect(text, 'total must be grouped and suffixed with ₫').toMatch(
          /^\d{1,3}([.,  ]\d{3})+\s*₫$/,
        );
        expect(
          text.replace(/[^\d]/g, ''),
          'the digits must still be the order total',
        ).toBe(String(seeded[0].total_amount));
        return;
      }

      // --- FR11-TC06 / TC07: status label + colour ---------------------------
      if (row.check === 'vi_status' || row.check === 'colors') {
        const badges = orderRows.locator('td:nth-child(4) span');
        await expect(badges).toHaveCount(expectedRows);

        const seen = new Map<string, string>(); // vietnamese label -> background
        for (let i = 0; i < expectedRows; i++) {
          const badge = badges.nth(i);
          const label = (await badge.innerText()).trim();
          const bg = await badge.evaluate((e) => getComputedStyle(e).backgroundColor);
          seen.set(label, bg);
        }

        if (row.check === 'vi_status') {
          // Every seeded status must appear under its Vietnamese label...
          const expectedLabels = statuses.map((s) => VI_STATUS[s]);
          expect([...seen.keys()].sort()).toEqual([...new Set(expectedLabels)].sort());
          // ...and no raw backend code may leak into the table.
          const tableText = await table.innerText();
          for (const code of Object.keys(VI_STATUS)) {
            expect(tableText.toLowerCase(), `raw status "${code}" must not be shown`).not.toContain(
              code,
            );
          }
          return;
        }

        // FR-11: "phân biệt màu sắc" - N distinct statuses, N distinct colours.
        const colours = [...seen.values()];
        expect(new Set(colours).size, `each status needs its own colour: ${[...seen]}`).toBe(
          seen.size,
        );
        for (const [label, bg] of seen) {
          expect(bg, `"${label}" must have a real background colour`).not.toBe(
            'rgba(0, 0, 0, 0)',
          );
        }
        return;
      }

      // --- FR11-TC08: nothing missing ----------------------------------------
      if (row.check === 'multiple') {
        const shown = await orderRows.locator('td:nth-child(1)').allInnerTexts();
        expect(shown.map((t) => t.trim()).sort()).toEqual(
          seeded.map((o) => `#${o.id}`).sort(),
        );
        return;
      }

      // --- FR11-TC09: User A never sees User B's rows ------------------------
      if (row.check === 'isolation_ui') {
        const shown = (await table.innerText()).trim();
        for (const foreign of otherOrders) {
          expect(shown, `order #${foreign.id} belongs to another user`).not.toContain(
            `#${foreign.id}`,
          );
        }
        const mine = await orderRows.locator('td:nth-child(1)').allInnerTexts();
        expect(mine.map((t) => t.trim()).sort()).toEqual(seeded.map((o) => `#${o.id}`).sort());
        return;
      }

      // --- FR11-TC10: the same rule at the API ------------------------------
      if (row.check === 'isolation_api') {
        const mine = await getMyOrders(user.token);
        expect(mine.status).toBe(200);
        expect(mine.orders.every((o) => o.user_id === user.userId)).toBe(true);
        expect(mine.orders.map((o) => o.id)).not.toContain(otherOrders[0].id);

        // FR-11: "Người dùng chỉ xem được đơn hàng của chính mình" - fetching
        // another user's order by id must be refused, not served.
        const foreign = await getOrderById(otherOrders[0].id, user.token);
        expect(
          [401, 403, 404],
          `GET /api/orders/${otherOrders[0].id} with another user's token returned ` +
            `${foreign.status} ${JSON.stringify(foreign.body)}`,
        ).toContain(foreign.status);
        return;
      }

      // --- FR11-TC12: the history survives a reload --------------------------
      if (row.check === 'refresh') {
        const before = (await table.innerText()).trim();
        await page.reload();
        await expect(historyHeading).toBeVisible();
        await expect(orderRows).toHaveCount(expectedRows);
        // Assertion pattern E - toContainText on the reloaded table.
        for (const order of seeded) {
          await expect(table).toContainText(`#${order.id}`);
          await expect(table).toContainText(VI_STATUS[order.status]);
        }
        expect((await table.innerText()).trim(), 'reload must render the same rows').toBe(before);
        return;
      }

      // --- FR11-TC01 falls through: the list itself is the assertion ----------
      const listed = await orderRows.locator('td:nth-child(1)').allInnerTexts();
      expect(listed.map((t) => t.trim()).sort()).toEqual(seeded.map((o) => `#${o.id}`).sort());
    });
  }
});
