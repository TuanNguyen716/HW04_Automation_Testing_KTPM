# HW04 – Main Report Template

> **Purpose:** Concise template for the required Main Report.  
> **Source:** HW04 – Automation Testing specification. Items marked **[REQUIRED]** are explicitly required by the document; **[SUGGESTED]** are recommended additions.

## 1. Overview

- Student ID: `20127420`
- Homework: `HW04 – Automation Testing`
- AI tools: `Claude / ...`
- Automation tool: `Playwright`
- Selected features:
  - Feature A: `...`
  - Feature B: `...`
  - Feature C: `...`

## 2. Feature & Test Case Selection [REQUIRED]

> **Requirement:** For each of the 3 features, convert at least 12 test cases into automation scripts. The 12 may include positive, negative, and edge cases.

| Feature | Requirement/FR | Test cases | Automated |
|---|---|---:|---:|
| A | `FR-xx` | 12 | 12 |
| B | `FR-xx` | 12 | 12 |
| C | `FR-xx` | 12 | 12 |

[SUGGESTED] Briefly state how the 12 test cases were designed and their positive/negative/edge distribution.

## 3. Automation Approach [REQUIRED]

### 3.1 AI-first workflow

> **Requirement:** Use AI step-by-step, not a single generic prompt, to convert the test cases into automation scripts. Review, fix, and take full responsibility for the final scripts.

Workflow:

`Human test cases → AI generation → AI review → Human review/fix → Execution → Result analysis`

### 3.2 Data-driven testing

> **Requirement:** Test data must be stored in a separate `.csv` or `.json` file. Hardcoded inline arrays/objects are not accepted.

- Data format: `.csv`
- Data files: `...`
- Approach: `...`

### 3.3 Assertion patterns

> **Requirement:** Use at least 3 distinct assertion patterns.

| Assertion | Usage |
|---|---|
| `...` | `...` |
| `...` | `...` |
| `...` | `...` |

### 3.4 Multi-browser execution

> **Requirement:** Each feature must run on at least 3 browsers; minimum 9 browser runs across the suite.

- Chrome: ✓
- Edge: ✓
- Firefox: ✓
- Total browser runs: `9+`

### 3.5 HTML reports

> **Requirement:** Each run must produce an HTML report using Allure or Playwright HTML Reporter and visibly display `Run by: {StudentID}`.

- Reporter: `Playwright HTML Reporter`
- Student ID shown: `Run by: 20127420`
- Reports: `...`

## 4. Human Review & Gap Analysis [REQUIRED]

> **Requirement:** Critically review and correct AI-generated scripts. Report what AI got wrong/missed and explain why.

| Issue | AI output/problem | Human correction | Reason |
|---|---|---|---|
| `...` | `...` | `...` | `...` |

[SUGGESTED] Include only meaningful findings: fragile selectors, weak/missing assertions, missing edge cases, flaky waits, incorrect assumptions, etc.

## 5. Execution Results [REQUIRED]

[SUGGESTED concise summary; the specification requires the multi-browser reports/evidence.]

| Feature | Browser | Passed | Failed | Report |
|---|---|---:|---:|---|
| A | Chrome | `x` | `x` | `...` |
| A | Edge | `x` | `x` | `...` |
| A | Firefox | `x` | `x` | `...` |

Repeat for B and C.

## 6. Bugs & Unautomated Cases [REQUIRED where applicable]

> **Requirement:** If a failing assertion reveals a genuine defect, report it in Markdown and GitHub Issues, with a screenshot attached to each issue. Document test cases that could not be automated and explain why.

### Genuine bugs

| Bug | Test case | Evidence | GitHub Issue |
|---|---|---|---|
| `...` | `TC-...` | Screenshot | `...` |

If no genuine bugs were found:

`No genuine product defects were identified during execution.`

### Unautomated test cases

| Test case | Reason |
|---|---|
| `TC-...` | `...` |

If all were automated:

`All selected test cases were automated.`

## 7. Agent Skills [REQUIRED / ASSESSED]

> **Requirement:** The assignment encourages Agent Skills applying the data-driven, multi-browser script generation and maintenance workflow, reusable for additional features. Submit the Skill with a demonstration video showing end-to-end use on a complete feature.

Agent Skills used:

1. `ai-audit-logger` – records AI interactions and audit information.
2. `automation-test-builder` – converts test cases into data-driven Playwright tests.
3. `automation-reviewer` – reviews generated automation and identifies gaps/issues.

[SUGGESTED] Briefly explain one end-to-end example of reuse on a feature.

## 8. Bloom-AI Alignment [SUGGESTED]

The required levels are **G9.2 (Apply), G9.3 (Analyse), G9.4 (Collaborate)**.

| Level | Evidence |
|---|---|
| G9.2 Apply | Applied AI to generate Playwright automation. |
| G9.3 Analyse | Reviewed AI output, identified gaps/errors, and corrected scripts. |
| G9.4 Collaborate | Iteratively worked with AI through prompts, review, feedback, and refinement. |

## 9. Summary [SUGGESTED]

| Metric | Result |
|---|---:|
| Features | 3 |
| Test cases | `...` |
| Automated | `...` |
| Executed | `...` |
| Passed | `...` |
| Failed | `...` |
| Browser runs | `...` |
| Genuine bugs | `...` |

## 10. Evidence & Links [REQUIRED]

- Public GitHub repository: `...`
- HTML reports: `...`
- Unlisted YouTube demo: `...`

> The demo must be at least 5 minutes, narrated in Vietnamese, demonstrate one script end-to-end including multi-browser execution and HTML report, and narrate at least one AI-generated-script fix. It must show either face-cam or `whoami` + `hostname`.

---

# Appendix A – AI Audit Report [REQUIRED]

> The specification requires this appendix. For each AI interaction include:
> - Name of AI tool
> - Date and time
> - Your prompt
> - AI output

Use the separate `AI_Audit_Report.md` if preferred.

# Appendix B – AI Critique [REQUIRED]

> **200–300 words.** Address:
> 1. Where did AI get something wrong, biased, or incomplete?
> 2. Why did it fail to catch the issue?
> 3. What principle did you learn about collaborating with AI?

Use the separate `AI_Critique.md` if preferred.

# Submission Checklist

- [ ] Main report: Markdown + PDF
- [ ] Public GitHub repository link
- [ ] Scripts + CSV data + HTML reports
- [ ] Multi-browser HTML reports
- [ ] Unlisted YouTube demo link
- [ ] AI Audit Report: Markdown + PDF
- [ ] AI Critique: Markdown + PDF
- [ ] Git commit log text file
- [ ] Bug reports + screenshots, if genuine bugs exist
- [ ] README.md with self-assessment + test summary
- [ ] Agent Skills + demonstration video
