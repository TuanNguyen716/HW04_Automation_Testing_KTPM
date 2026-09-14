# Field dictionary, categories and issue types

## Session fields (`init`)
All optional - omit what is unknown, never guess.

| Field | Meaning |
| --- | --- |
| `student_name`, `student_id` | who is declaring the AI use |
| `homework_id` | e.g. `HW04` |
| `course` | course code/name |
| `project_name` | project or repo name |
| `repo_path` | path or URL of the repository |
| `sut` | system under test (URL or app name) |
| `feature` | feature(s) under test, e.g. `FR-01 Registration` |
| `ai_tool` | default AI tool, used when an interaction omits one |
| `started_at` | set automatically if omitted |
| `final_notes` | free text for section 8 of the report |
| `sensitive_note` | note appended to the report about redaction |

## Interaction fields (`log`, `update`)

**Required by HW04** (the validator errors without them):
`ai_tool`, `timestamp`, `prompt`, `ai_output`.
`id` and `timestamp` are auto-filled; `ai_tool` falls back to the session default.

| Field | Meaning |
| --- | --- |
| `id` | `A001`, `A002`, … (auto) |
| `timestamp` | local time with offset (auto) |
| `ai_tool` | e.g. `Claude`, `ChatGPT`, `Copilot`, `Gemini` - per interaction |
| `category` | see list below |
| `purpose` | one line: what was being asked for |
| `prompt` | the prompt **verbatim** |
| `ai_output` | the AI output **verbatim** (code included) |
| `output_lang` | fence language for the report, e.g. `ts`, `json`, `bash` |
| `human_review` | what the human judged about the output - **not** what the AI said |
| `human_action` | what the human actually did as a result |
| `reason_for_modification` | why the output was changed |
| `accepted` | `true` / `false` |
| `modified` | `true` / `false` |
| `status` | `accepted`, `accepted_with_modification`, `rejected`, `pending_review` |
| `feature` | e.g. `FR-01 Registration` |
| `test_case_id` | e.g. `TC-01` |
| `file_modified` | path touched as a result |
| `commit` | commit hash if the result was committed |
| `follow_up_prompt` | the corrective prompt sent back to the AI |
| `related_id` | another interaction this one continues |
| `issues` | list of issue objects (use `issue <ID>`) |

## Issue fields (`issue <ID>`)

| Field | Meaning |
| --- | --- |
| `description` | what was wrong or missing |
| `severity` | `low`, `medium`, `high`, `critical` |
| `why` | why the AI produced or missed it |
| `human_correction` | the correction applied |
| `resolution` | final state, e.g. "fixed, test green on 3 browsers" |
| `type` | optional, from the issue-type list below |

## Categories (open list - extend when nothing fits)

Test case analysis · Test data generation · Automation script generation ·
Data-driven testing · Assertion design · Selector design · Multi-browser configuration ·
Debugging · Code review · Test maintenance · HTML report generation · Bug analysis ·
Documentation · Other

## Issue types seen in AI-generated test code

Fragile selector · Missing assertion · Weak assertion · Missing edge case ·
Missing negative case · Incorrect assumption about SUT · Incorrect test data ·
Flaky wait · Hardcoded test data · Incorrect Playwright API usage ·
Browser compatibility problem · Incomplete coverage · Reasoning error ·
Implementation error · Other

## Redaction

Credential-shaped text (`password: …`, `api_key=…`, `Authorization: Bearer …`,
`Cookie: …`, `sk-…`, `ghp_…`, `AKIA…`, JWTs) is replaced with `[REDACTED]` before the
entry is written, and the match is reported on stderr. `--no-redact` keeps it raw -
use only for values that are deliberately fake and worth keeping as evidence.
