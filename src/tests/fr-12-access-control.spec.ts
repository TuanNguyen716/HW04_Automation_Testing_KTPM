/**
 * FR-12 - Kiểm soát truy cập (Access Control)
 *
 * Source test cases: docs/FR-12.md              (ids mapped in the csv `tc_id` column)
 * Test data:         data/fr-12-access-control.csv   <- edit the CSV, never this file
 *
 * Spec under test (docs/System Requirements Specification.md, FR-12):
 *   - the Admin subsystem is only for accounts with `role = 'admin'`
 *   - EVERY `/api/admin/*` route and every data-affecting write
 *     (POST/PUT/DELETE on /api/products, /api/categories, /api/coupons)
 *     must require BOTH (1) a valid JWT and (2) `role = 'admin'` in that JWT.
 *
 * Notes on the SUT (verified against the running app, not assumed):
 *   - Web Admin is a separate Vite app on :5174 (the storefront on the config's
 *     baseURL is :5173), so these rows navigate with an absolute ADMIN_BASE url.
 *   - the admin app has no router: it keeps the JWT in localStorage under
 *     `adminToken` and renders the login form when that key is empty, the
 *     dashboard when it is set. "Access denied" is therefore an alert() plus
 *     staying on the login form - there is no redirect to assert.
 *   - a non-admin login is refused with a blocking alert("Bạn không phải là
 *     admin!"), so these rows install a dialog handler before submitting.
 *   - the role gate lives ONLY in that click handler. Nothing re-checks the
 *     role on reload, which is what FR12-TC03 probes.
 *   - the backend signs `{id, role}` with no `exp` claim, so token *expiry*
 *     is not a testable condition on this build and is deliberately absent.
 *
 * Several of these rows are expected to FAIL on the current build: they assert
 * what FR-12 requires, not what the code currently does. The failures are the
 * deliverable - each one is a real access-control defect.
 */
import {
  test,
  expect,
  readCsv,
  splitList,
  registerAndLogin,
  apiCall,
  tokenFor,
  adminToken,
  createProductAsAdmin,
  deleteProductAsAdmin,
  getProduct,
  productBody,
  DENIED,
  ADMIN_BASE,
  FRESH_PASSWORD,
  type Account,
  type TokenKind,
} from "./fixtures";

const rows = readCsv("data/fr-12-access-control.csv");

/** Sidebar entry that only ever renders once the dashboard is mounted. */
const ADMIN_ONLY_NAV = "Người dùng";

test.describe("FR-12 - Kiểm soát truy cập (Access Control)", () => {
  for (const row of rows) {
    test(`${row.tc_id} - ${row.title}`, async ({ page }) => {
      test.setTimeout(60_000);

      const paths = splitList(row.paths);
      const kind = row.token as TokenKind;

      // Every row owns a private, freshly-registered non-admin account, so the
      // 3 browser projects never fight over one user's role or token.
      const user: Account = await registerAndLogin(row.tc_id.toLowerCase());
      const token = await tokenFor(kind, user);

      /* ---------------------------------------------------------------- *
       * UI rows - the Web Admin subsystem on :5174
       * ---------------------------------------------------------------- */
      if (row.check.startsWith("admin_ui")) {
        const loginHeading = page.getByRole("heading", { name: "Admin Login" });
        const adminNav = page.getByText(ADMIN_ONLY_NAV, { exact: true });

        // The admin app blocks on alert(); capture the text instead of hanging.
        const dialogs: string[] = [];
        page.on("dialog", async (d) => {
          dialogs.push(d.message());
          await d.dismiss();
        });

        await page.goto(ADMIN_BASE);
        // Assertion pattern A - toBeVisible: the gate is up before we log in.
        await expect(loginHeading).toBeVisible();

        // FR12-TC03 skips the form entirely: it plants a *user* token in the
        // same storage key the app trusts, then reloads. FR-12 says the admin
        // subsystem is for role=admin only, so this must NOT yield a dashboard.
        if (row.check === "admin_ui_bypass") {
          await page.evaluate(
            (t) => localStorage.setItem("adminToken", t),
            user.token,
          );
          await page.reload();

          await expect(
            adminNav,
            "a non-admin JWT in localStorage must not unlock the Admin UI",
          ).toBeHidden();
          await expect(loginHeading).toBeVisible();
          return;
        }

        // FR12-TC01 / FR12-TC02 drive the real login form.
        const email =
          row.check === "admin_ui_login" ? "admin@eshop.com" : user.email;
        const password =
          row.check === "admin_ui_login" ? "Admin123!" : FRESH_PASSWORD;
        await page.getByPlaceholder("Email").fill(email);
        await page.getByPlaceholder("Password").fill(password);
        await page.getByRole("button", { name: "Login" }).click();

        if (row.check === "admin_ui_login") {
          // Admin gets in: the dashboard mounts and the gate disappears.
          await expect(adminNav).toBeVisible();
          await expect(loginHeading).toBeHidden();
          expect(
            dialogs,
            "a valid admin login must not raise an error dialog",
          ).toEqual([]);
          // ...and the session it stored is genuinely an admin token.
          const stored = await page.evaluate(() =>
            localStorage.getItem("adminToken"),
          );
          expect(stored, "admin session token must be stored").toBeTruthy();
          const claims = JSON.parse(
            Buffer.from(stored!.split(".")[1], "base64url").toString("utf8"),
          );
          expect(claims.role).toBe("admin");
          return;
        }

        // FR12-TC02: the non-admin is turned away and nothing admin renders.
        // Assertion pattern B - toContain on the captured dialog text.
        await expect
          .poll(() => dialogs.join("|"), {
            message: "expected a rejection dialog",
          })
          .toContain(row.expected_message);
        await expect(adminNav).toBeHidden();
        await expect(loginHeading).toBeVisible();
        const stored = await page.evaluate(() =>
          localStorage.getItem("adminToken"),
        );
        expect(
          stored,
          "a rejected login must not leave a session behind",
        ).toBeFalsy();
        return;
      }

      /* ---------------------------------------------------------------- *
       * API rows - read access to /api/admin/* and /api/coupons
       * ---------------------------------------------------------------- */
      if (row.check === "api_denied" || row.check === "api_allowed") {
        const expected = Number(row.expect_status);

        for (const path of paths) {
          const res = await apiCall(row.method, path, token);
          const where = `${row.method} ${path} as "${kind}"`;

          if (row.check === "api_allowed") {
            // Assertion pattern C - exact status on the positive control.
            expect(res.status, where).toBe(expected);
            expect(
              Array.isArray(res.body),
              `${where} must return the collection`,
            ).toBe(true);
            continue;
          }

          // FR-12: a missing, forged, tampered or non-admin token is refused.
          // The status is asserted as "some rejection", then pinned to the
          // specific code the test case names, so a 200 can never slip past.
          expect(
            DENIED,
            `${where} must be rejected, got ${res.status}`,
          ).toContain(res.status);
          if (expected) expect(res.status, where).toBe(expected);
          // A rejected call must not leak the protected collection.
          expect(
            Array.isArray(res.body),
            `${where} must not return admin data`,
          ).toBe(false);
          if (row.expected_message) {
            expect(JSON.stringify(res.body ?? ""), where).toContain(
              row.expected_message,
            );
          }
        }
        return;
      }

      /* ---------------------------------------------------------------- *
       * Write rows - POST / PUT / DELETE on data-affecting resources
       * ---------------------------------------------------------------- */
      if (row.check === "write_denied") {
        // A real product to aim PUT/DELETE at, created through the admin path.
        const targetId = await createProductAsAdmin(
          `FR12 fixture ${row.tc_id}`,
        );
        const before = (await getProduct(targetId)).body;
        // Because these writes are *supposed* to be refused, anything that does
        // get created is a defect - and litter. Track it per resource so the
        // teardown can remove it whatever endpoint let it through.
        const strays: { path: string; id: number }[] = [];

        try {
          for (const path of paths) {
            const isProduct = path === "/api/products";
            const body = isProduct
              ? productBody(`FR12 illegal create ${row.tc_id}`)
              : { name: `FR12 illegal category ${row.tc_id}` };

            // --- CREATE must be refused -----------------------------------
            const created = await apiCall("POST", path, token, body);
            // Record any row that slipped through BEFORE asserting: the
            // assertion below throws on a leak, and the teardown can only
            // remove what was tracked by then.
            if (created.body?.id) strays.push({ path, id: created.body.id });
            expect(
              DENIED,
              `POST ${path} as "${kind}" must be rejected, got ${created.status}`,
            ).toContain(created.status);
            // ...and must not have written anything.
            expect(
              created.body?.id,
              `POST ${path} as "${kind}" must not create a row`,
            ).toBeUndefined();

            if (!isProduct) continue;

            // --- UPDATE must be refused, and the row must be untouched ----
            const updated = await apiCall("PUT", `${path}/${targetId}`, token, {
              ...productBody("HACKED BY FR12"),
              price: 1,
            });
            expect(
              DENIED,
              `PUT ${path}/${targetId} as "${kind}" must be rejected, got ${updated.status}`,
            ).toContain(updated.status);

            // Assertion pattern D - the data itself is the assertion.
            const afterUpdate = (await getProduct(targetId)).body;
            expect(
              afterUpdate?.name,
              "a rejected PUT must not change the product",
            ).toBe(before?.name);

            // --- DELETE must be refused, and the row must still exist -----
            const deleted = await apiCall(
              "DELETE",
              `${path}/${targetId}`,
              token,
            );
            expect(
              DENIED,
              `DELETE ${path}/${targetId} as "${kind}" must be rejected, got ${deleted.status}`,
            ).toContain(deleted.status);
            const afterDelete = (await getProduct(targetId)).body;
            expect(
              afterDelete?.id,
              "a rejected DELETE must not remove the product",
            ).toBe(targetId);
          }
        } finally {
          await deleteProductAsAdmin(targetId);
          for (const { path, id } of strays) {
            await apiCall("DELETE", `${path}/${id}`, await adminToken());
          }
        }
        return;
      }

      // FR12-TC11 - the positive control: admin really can write.
      if (row.check === "write_allowed") {
        const path = paths[0];
        const created = await apiCall(
          "POST",
          path,
          token,
          productBody(`FR12 admin create ${row.tc_id}`),
        );
        expect(created.status, `POST ${path} as admin`).toBe(
          Number(row.expect_status),
        );
        const id = created.body.id;
        expect(id, "admin create must return the new id").toBeTruthy();

        try {
          expect((await getProduct(id)).body?.name).toContain(
            "FR12 admin create",
          );

          const renamed = `FR12 admin updated ${row.tc_id}`;
          const updated = await apiCall("PUT", `${path}/${id}`, token, {
            ...productBody(renamed),
          });
          expect(updated.status, `PUT ${path}/${id} as admin`).toBe(200);
          expect(
            (await getProduct(id)).body?.name,
            "admin update must persist",
          ).toBe(renamed);
        } finally {
          const removed = await apiCall(
            "DELETE",
            `${path}/${id}`,
            await adminToken(),
          );
          expect(removed.status, `DELETE ${path}/${id} as admin`).toBe(200);
          // Assertion pattern E - the row is really gone.
          expect(
            (await getProduct(id)).body?.id,
            "admin delete must remove the row",
          ).toBeUndefined();
        }
        return;
      }

      /* ---------------------------------------------------------------- *
       * FR12-TC12 - privilege escalation
       *
       * FR-12 grants the Admin subsystem to `role = 'admin'` only. If a plain
       * user can set their own role through the profile endpoint, every other
       * control in this file is decorative - so this asserts both that the
       * write is refused and that the role never actually changes.
       * ---------------------------------------------------------------- */
      if (row.check === "privilege_escalation") {
        const escalate = await apiCall(row.method, paths[0], token, {
          name: "FR12 escalation probe",
          shipping_address: "1 Le Loi, Q1, TP.HCM",
          phone: "0900000000",
          role: "admin",
        });

        // Everything below runs inside try/finally: if the escalation succeeds
        // the very first assertion fails, and this account is by then a real
        // admin in the SUT - it must be removed whether the test passes or not.
        try {
          // The endpoint is documented as "chỉ cho phép cập nhật thông tin cá
          // nhân cơ bản", so a role field must never be honoured. Whether it is
          // rejected outright or silently ignored, the role must not move.
          const me = await apiCall("GET", "/api/users/me", token);
          expect(me.status).toBe(200);
          expect(
            me.body?.role,
            `a user promoted itself to "${me.body?.role}" via ` +
              `${row.method} ${paths[0]} (responded ${escalate.status})`,
          ).toBe("user");

          // And the decisive check: a fresh login must not mint an admin token...
          const relogin = await apiCall("POST", "/api/login", "", {
            email: user.email,
            password: FRESH_PASSWORD,
          });
          expect(relogin.status).toBe(200);
          const claims = JSON.parse(
            Buffer.from(relogin.body.token.split(".")[1], "base64url").toString(
              "utf8",
            ),
          );
          expect(
            claims.role,
            "a re-login must not hand out an admin role",
          ).toBe("user");

          // ...and that token must still be refused by the admin API.
          const probe = await apiCall(
            "GET",
            "/api/admin/users",
            relogin.body.token,
          );
          expect(
            DENIED,
            `the escalated account reached GET /api/admin/users (${probe.status})`,
          ).toContain(probe.status);
        } finally {
          await apiCall(
            "DELETE",
            `/api/admin/users/${user.userId}`,
            await adminToken(),
          );
        }
        return;
      }

      throw new Error(`unknown check "${row.check}" in ${row.tc_id}`);
    });
  }
});
