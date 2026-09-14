/**
 * Unit check for the hand-written CSV parser in fixtures.ts - no browser needed.
 * Run it on its own:  npx playwright test tests/fixtures.check.spec.ts
 * Keep it in tests/ so a full run also proves the parser works on every browser
 * project; delete it if the report must contain feature tests only.
 */
import { test, expect, parseCsv, isTrue } from './fixtures';

test('parseCsv handles quotes, escapes, CRLF and blank cells', () => {
  expect(parseCsv('a,b\r\n1,"x, y"\n2,"he said ""hi"""\n\n')).toEqual([
    { a: '1', b: 'x, y' },
    { a: '2', b: 'he said "hi"' },
  ]);
  expect(parseCsv('a,b\n,2')).toEqual([{ a: '', b: '2' }]);
  expect(parseCsv('')).toEqual([]);
  expect(isTrue('TRUE')).toBe(true);
  expect(isTrue('')).toBe(false);
});
