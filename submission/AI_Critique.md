# AI Critique — HW04 Automation Testing

**Where the AI got it wrong.** Three failures, each of a different kind.

*Wrong answer from a dirty starting state.* The first lockout probe ran against the shared `test@eshop.com` account and reported confidently that the account locks after **2** failed logins. The measurement was repeatable and wrong: that account already carried failures from an earlier manual attempt. Re-measured on a freshly registered account, the threshold is the 3rd attempt — the real defect being a counter that increments by 2 (§6, bug 1).

*A test whose own bookkeeping was never tested.* The generated FR-12 teardown recorded a wrongly-created row **after** the assertion that the row must not exist. The assertion throws on exactly the case that creates the row, so cleanup could only run when there was nothing to clean. The suite's pass/fail output looked identical either way; the leak surfaced only by comparing the database against its seed state — 8 stray products and a self-promoted admin account.

*A claim checked in the wrong place.* Twice the AI concluded the `Run by` stamp was missing from a report where it was present — first by grepping compressed output, then by reading the wrong key — and was ready to "fix" a working configuration.

**Why it failed to catch them.** All three share one shape: the AI verified the output it could see and never questioned the conditions that produced it — a clean fixture, a code path that actually executes, the right place to look. It optimises for producing an answer, not for whether that answer could be proven false.

**Principle learned.** Delegate generation, keep the oracle. Before accepting any AI claim about a stateful system, the human must ask: was the starting state clean, and would this check have failed if the claim were wrong?
