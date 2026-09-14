# Example - FR-00 Login (fictional)

Three files, one per deliverable kind:

| File | Role |
| --- | --- |
| `login.csv` | the separate test-data file - 4 datasets, no data in the spec |
| `login.spec.ts` | one data-driven flow, looped over the CSV rows |
| `demo-app/` | a fictional 2-page SUT so the example is runnable offline |

Assumed SUT contract (this is what a real feature spec must supply, otherwise mark it TODO):

- `GET /login.html` - inputs labelled **Email** / **Password**, button **Sign in**
- valid `test@demo.com` / `Test1234!` -> `/dashboard.html`, heading **Welcome back**
- invalid -> stays on `/login.html`, message in a `role="alert"` element

## Run it

```bash
cp ../../templates/fixtures.ts ../../templates/playwright.config.ts .   # into your project
mkdir -p tests data && cp login.spec.ts tests/ && cp login.csv data/
npx http-server .claude/skills/automation-test-builder/examples/login/demo-app -p 8080   # or any static server
BASE_URL=http://localhost:8080 npx playwright test
npx playwright show-report
```

4 datasets x 3 browsers = 12 tests. The report header reads `Run by: 20127420 - Nguyễn Trần Minh Tuấn`,
and each test's detail page carries the same string as a `Run by` annotation.
