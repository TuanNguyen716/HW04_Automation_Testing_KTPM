#!/usr/bin/env python3
"""ai-audit-logger - maintain an AI-collaboration audit trail for testing work.

Source of truth: ai-audit-log.json.  AI_Audit_Report.md is generated from it.
Stdlib only.  Every write command reads a JSON object from stdin.

  audit.py init            < session.json
  audit.py log             < interaction.json
  audit.py update A001     < patch.json
  audit.py issue  A001     < issue.json
  audit.py list
  audit.py validate
  audit.py report [-o AI_Audit_Report.md]
  audit.py selftest
"""
import argparse, json, os, re, sys, tempfile
from datetime import datetime

REQUIRED = ["ai_tool", "timestamp", "prompt", "ai_output"]

# Credential shapes we refuse to store verbatim.  Redacted by default; --no-redact
# keeps the raw text (use only for obviously fake values kept as deliberate evidence).
SECRET_PATTERNS = [
    re.compile(r"(?i)\b(?:password|passwd|pwd|secret|api[_-]?key|access[_-]?token|refresh[_-]?token|client[_-]?secret)\b\s*[=:]\s*['\"]?([^\s'\",;]{4,})"),
    re.compile(r"(?i)\bauthorization\s*:\s*(?:bearer|basic)\s+(\S+)"),
    re.compile(r"(?i)\b(?:set-)?cookie\s*:\s*(\S+)"),
    re.compile(r"\b(sk-[A-Za-z0-9_-]{16,}|ghp_[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16}|eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,})\b"),
]


def now():
    return datetime.now().astimezone().strftime("%Y-%m-%d %H:%M:%S %z")


def load(path):
    if not os.path.exists(path):
        sys.exit("ERROR: %s not found. Run `audit.py init` first." % path)
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def save(path, doc):
    doc["updated_at"] = now()
    with open(path, "w", encoding="utf-8") as f:
        json.dump(doc, f, indent=2, ensure_ascii=False)
        f.write("\n")


def read_stdin_json():
    raw = sys.stdin.read().strip()
    if not raw:
        sys.exit("ERROR: expected a JSON object on stdin.")
    try:
        obj = json.loads(raw)
    except json.JSONDecodeError as e:
        sys.exit("ERROR: stdin is not valid JSON: %s" % e)
    if not isinstance(obj, dict):
        sys.exit("ERROR: stdin JSON must be an object.")
    return obj


# --- secret handling -------------------------------------------------------

def _redact_text(text, hits, where):
    for pat in SECRET_PATTERNS:
        def sub(m):
            hits.append("%s: %s" % (where, m.group(0)[:40]))
            return m.group(0).replace(m.group(1), "[REDACTED]")
        text = pat.sub(sub, text)
    return text


def scrub(node, hits, where="", redact=True):
    """Walk a JSON value, redacting credential-shaped substrings in place."""
    if isinstance(node, str):
        new = _redact_text(node, hits, where)
        return new if redact else node
    if isinstance(node, dict):
        return {k: scrub(v, hits, "%s.%s" % (where, k) if where else k, redact) for k, v in node.items()}
    if isinstance(node, list):
        return [scrub(v, hits, "%s[%d]" % (where, i), redact) for i, v in enumerate(node)]
    return node


def apply_scrub(entry, redact):
    hits = []
    cleaned = scrub(entry, hits, redact=redact)
    if hits:
        sys.stderr.write("SECURITY: credential-shaped content detected:\n")
        for h in hits:
            sys.stderr.write("  - %s\n" % h)
        sys.stderr.write("  -> %s\n" % ("redacted before storing (use --no-redact to keep raw)"
                                        if redact else "STORED RAW at your request"))
    return cleaned


# --- commands --------------------------------------------------------------

def cmd_init(args):
    session = apply_scrub(read_stdin_json(), not args.no_redact)
    if os.path.exists(args.path):
        doc = load(args.path)
        doc["session"].update(session)          # merge, never drop interactions
        print("Merged session metadata into existing %s" % args.path)
    else:
        session.setdefault("started_at", now())
        doc = {"schema": "ai-audit-log/1", "session": session,
               "created_at": now(), "interactions": []}
        print("Created %s" % args.path)
    save(args.path, doc)


def next_id(doc):
    n = len(doc["interactions"]) + 1
    used = {i.get("id") for i in doc["interactions"]}
    while "A%03d" % n in used:
        n += 1
    return "A%03d" % n


def cmd_log(args):
    doc = load(args.path)
    entry = apply_scrub(read_stdin_json(), not args.no_redact)
    entry.setdefault("id", next_id(doc))
    entry.setdefault("timestamp", now())
    entry.setdefault("ai_tool", doc["session"].get("ai_tool"))
    entry.setdefault("issues", [])
    entry.setdefault("status", "pending_review")
    if any(i.get("id") == entry["id"] for i in doc["interactions"]):
        sys.exit("ERROR: interaction %s already exists." % entry["id"])
    doc["interactions"].append(entry)
    save(args.path, doc)
    print("Logged %s (%s)" % (entry["id"], entry.get("category", "uncategorised")))


def find(doc, iid):
    for i in doc["interactions"]:
        if i.get("id") == iid:
            return i
    sys.exit("ERROR: no interaction with id %s" % iid)


def cmd_update(args):
    doc = load(args.path)
    entry = find(doc, args.id)
    patch = apply_scrub(read_stdin_json(), not args.no_redact)
    patch.pop("id", None)
    entry.update(patch)
    entry.setdefault("reviewed_at", now())
    save(args.path, doc)
    print("Updated %s: %s" % (args.id, ", ".join(sorted(patch))))


def cmd_issue(args):
    doc = load(args.path)
    entry = find(doc, args.id)
    issue = apply_scrub(read_stdin_json(), not args.no_redact)
    issue.setdefault("severity", "unspecified")
    entry.setdefault("issues", []).append(issue)
    save(args.path, doc)
    print("Recorded issue on %s (severity: %s)" % (args.id, issue["severity"]))


def cmd_list(args):
    doc = load(args.path)
    if not doc["interactions"]:
        print("(no interactions logged yet)")
    for i in doc["interactions"]:
        print("%-6s %-19s %-28s %-14s %s" % (
            i.get("id"), (i.get("timestamp") or "")[:19],
            (i.get("category") or "-")[:28], (i.get("status") or "-")[:14],
            (i.get("feature") or "")[:30]))


def cmd_validate(args):
    doc = load(args.path)
    errors = warnings = passes = 0
    lines = []

    missing_session = [k for k in ("student_id", "homework_id", "ai_tool") if not doc["session"].get(k)]
    if missing_session:
        warnings += 1
        lines.append("WARNING: session metadata missing: %s" % ", ".join(missing_session))

    if not doc["interactions"]:
        errors += 1
        lines.append("ERROR:   no interactions recorded - the audit trail is empty.")

    for i in doc["interactions"]:
        iid = i.get("id", "?")
        missing = [f for f in REQUIRED if not str(i.get(f) or "").strip()]
        if missing:
            errors += 1
            lines.append("ERROR:   Interaction %s is missing %s." % (iid, ", ".join(missing)))
            continue
        soft = []
        if not str(i.get("human_review") or "").strip():
            soft.append("no human review recorded")
        if not str(i.get("human_action") or "").strip():
            soft.append("no human decision/action recorded")
        if i.get("status") in (None, "", "pending_review"):
            soft.append("final status still pending")
        if i.get("accepted") is False and not str(i.get("human_action") or "").strip():
            soft.append("output rejected but no correction recorded")
        for issue in i.get("issues", []):
            if not str(issue.get("human_correction") or "").strip():
                soft.append("issue %r has no human correction" % str(issue.get("description", ""))[:40])
        if soft:
            warnings += 1
            lines.append("WARNING: Interaction %s: %s." % (iid, "; ".join(soft)))
        else:
            passes += 1
            lines.append("PASS:    Interaction %s contains all required fields." % iid)

    print("\n".join(lines))
    print("\n%d pass, %d warning, %d error" % (passes, warnings, errors))
    return 1 if errors else 0


# --- report ----------------------------------------------------------------

NP = "_Not provided_"


def v(d, k, default=NP):
    val = d.get(k)
    return val if str(val or "").strip() else default


def fence(text, lang=""):
    text = str(text or "").rstrip()
    if not text:
        return NP
    f = "`" * max(3, max((len(m) for m in re.findall(r"`+", text)), default=0) + 1)
    return "%s%s\n%s\n%s" % (f, lang, text, f)


def cmd_report(args):
    doc = load(args.path)
    s, items = doc["session"], doc["interactions"]
    out = args.output
    L = []
    A = L.append

    A("# AI Audit Report\n")
    A("> Generated from `%s` by the `ai-audit-logger` Agent Skill on %s.\n"
      "> Every entry below was recorded at the time of the interaction; fields that were\n"
      "> never recorded are shown as %s and are **not** reconstructed after the fact.\n" % (
          os.path.basename(args.path), now(), NP))

    A("## 1. AI Usage Declaration\n")
    A("AI tools were used as a **collaborator** in this assignment, not as an unreviewed code generator.")
    A("Every AI-generated artifact listed in this report was read, reviewed and, where necessary,")
    A("corrected by the student before being accepted into the deliverable. The prompt, the raw AI")
    A("output, the human review and the resulting human action are recorded separately for each")
    A("interaction so the contribution of each party is traceable.\n")
    A("Declared by: %s (%s)\n" % (v(s, "student_name"), v(s, "student_id")))

    A("## 2. Project / Homework Information\n")
    A("| Field | Value |")
    A("| --- | --- |")
    for label, key in [("Student name", "student_name"), ("Student ID", "student_id"),
                       ("Homework", "homework_id"), ("Course", "course"),
                       ("Project", "project_name"), ("Repository / path", "repo_path"),
                       ("System under test", "sut"), ("Feature(s) under test", "feature"),
                       ("Audit started", "started_at")]:
        A("| %s | %s |" % (label, v(s, key)))
    A("| Audit last updated | %s |" % doc.get("updated_at", NP))
    A("| Interactions recorded | %d |\n" % len(items))

    A("## 3. AI Tools Used\n")
    tools = {}
    for i in items:
        t = str(i.get("ai_tool") or "Unspecified")
        tools.setdefault(t, []).append(i)
    if not tools:
        A(NP + "\n")
    else:
        A("| AI tool | Interactions | Used for |")
        A("| --- | --- | --- |")
        for t, group in sorted(tools.items()):
            cats = sorted({str(g.get("category") or "uncategorised") for g in group})
            A("| %s | %d | %s |" % (t, len(group), ", ".join(cats)))
        A("")

    A("## 4. AI Interaction Log\n")
    if not items:
        A(NP + "\n")
    for i in items:
        A("### %s - %s\n" % (i.get("id", "?"), v(i, "purpose", v(i, "category", "AI interaction"))))
        A("| Field | Value |")
        A("| --- | --- |")
        for label, key in [("Date / time", "timestamp"), ("AI tool", "ai_tool"),
                           ("Category", "category"), ("Feature", "feature"),
                           ("Test case ID", "test_case_id"), ("File modified", "file_modified"),
                           ("Commit", "commit"), ("Output accepted", "accepted"),
                           ("Output modified", "modified"), ("Related interaction", "related_id"),
                           ("Final status", "status")]:
            val = i.get(key)
            if isinstance(val, bool):
                val = "Yes" if val else "No"
            A("| %s | %s |" % (label, val if str(val or "").strip() else NP))
        A("\n**Prompt**\n")
        A(fence(i.get("prompt")))
        A("\n**AI output**\n")
        A(fence(i.get("ai_output"), i.get("output_lang", "")))
        A("\n**Human review**\n")
        A(v(i, "human_review", NP + " (no review was recorded for this interaction)"))
        A("\n**Human decision / action**\n")
        A(v(i, "human_action"))
        if str(i.get("reason_for_modification") or "").strip():
            A("\n**Reason for modification**\n")
            A(i["reason_for_modification"])
        if str(i.get("follow_up_prompt") or "").strip():
            A("\n**Follow-up prompt**\n")
            A(fence(i["follow_up_prompt"]))
        if i.get("issues"):
            A("\n**Issues found in this output:** %s" % ", ".join(
                "%s (%s)" % (str(x.get("description", "?"))[:60], x.get("severity", "?")) for x in i["issues"]))
        A("\n---\n")

    A("## 5. Human Review and Corrections\n")
    reviewed = [i for i in items if str(i.get("human_review") or "").strip()]
    if not reviewed:
        A("No human review was recorded. " + NP + "\n")
    else:
        A("| ID | AI proposed | Human review | Human action | Status |")
        A("| --- | --- | --- | --- | --- |")
        for i in reviewed:
            A("| %s | %s | %s | %s | %s |" % (
                i.get("id"), cell(i.get("ai_output")), cell(i.get("human_review")),
                cell(i.get("human_action")), v(i, "status")))
        A("")
        A("Interactions where AI output was accepted unchanged: %d of %d.\n" % (
            sum(1 for i in items if i.get("accepted") and not i.get("modified")), len(items)))

    A("## 6. AI Mistakes / Missed Issues\n")
    issues = [(i, x) for i in items for x in i.get("issues", [])]
    if not issues:
        A("No AI mistakes or missed issues were recorded.\n")
    else:
        A("| ID | Issue | Severity | Why AI produced/missed it | Human correction | Resolution |")
        A("| --- | --- | --- | --- | --- | --- |")
        for i, x in issues:
            A("| %s | %s | %s | %s | %s | %s |" % (
                i.get("id"), cell(x.get("description")), x.get("severity", NP),
                cell(x.get("why")), cell(x.get("human_correction")), cell(x.get("resolution"))))
        A("")
        sev = {}
        for _, x in issues:
            sev[str(x.get("severity", "unspecified"))] = sev.get(str(x.get("severity", "unspecified")), 0) + 1
        A("Issues by severity: %s\n" % ", ".join("%s=%d" % kv for kv in sorted(sev.items())))

    A("## 7. Summary of AI Assistance\n")
    cats = {}
    for i in items:
        c = str(i.get("category") or "uncategorised")
        cats[c] = cats.get(c, 0) + 1
    A("| Metric | Value |")
    A("| --- | --- |")
    A("| Total AI interactions | %d |" % len(items))
    A("| Interactions with human review recorded | %d |" % len(reviewed))
    A("| AI outputs accepted as-is | %d |" % sum(1 for i in items if i.get("accepted") and not i.get("modified")))
    A("| AI outputs accepted after human modification | %d |" % sum(1 for i in items if i.get("modified")))
    A("| AI outputs rejected | %d |" % sum(1 for i in items if i.get("accepted") is False))
    A("| Issues found during human review | %d |" % len(issues))
    A("")
    if cats:
        A("**AI usage by category**\n")
        A("| Category | Interactions |")
        A("| --- | --- |")
        for c, n in sorted(cats.items(), key=lambda kv: (-kv[1], kv[0])):
            A("| %s | %d |" % (c, n))
        A("")

    A("## 8. Final Notes\n")
    A(v(s, "final_notes", "No additional notes were recorded."))
    A("")
    A("**Scope of this report.** It reproduces only what was recorded in `%s`. It is evidence of the"
      % os.path.basename(args.path))
    A("AI-use process, not a guarantee that the assignment's audit requirements are met - the student")
    A("remains responsible for checking the submission against the HW04 specification.")
    if s.get("sensitive_note"):
        A("\n%s" % s["sensitive_note"])

    text = "\n".join(L) + "\n"
    with open(out, "w", encoding="utf-8") as f:
        f.write(text)
    print("Wrote %s (%d interactions)" % (out, len(items)))


def cell(text, n=90):
    """Squash free text into a markdown table cell."""
    t = " ".join(str(text or "").split())
    if not t:
        return NP
    t = t.replace("|", "\\|")
    return t if len(t) <= n else t[: n - 1] + "…"


# --- selftest --------------------------------------------------------------

def cmd_selftest(args):
    import subprocess
    here = os.path.abspath(__file__)
    with tempfile.TemporaryDirectory() as d:
        log = os.path.join(d, "ai-audit-log.json")
        rep = os.path.join(d, "AI_Audit_Report.md")

        def run(argv, stdin=""):
            return subprocess.run([sys.executable, here] + argv + ["--path", log],
                                  input=stdin, capture_output=True, text=True)

        assert run(["init"], '{"student_id":"X","homework_id":"HW04","ai_tool":"Claude"}').returncode == 0
        r = run(["log"], json.dumps({"category": "Automation script generation", "prompt": "p",
                                     "ai_output": "o", "feature": "FR-01"}))
        assert "A001" in r.stdout, r.stdout
        # required-field enforcement
        run(["log"], '{"prompt":"p2","ai_output":""}')
        out = run(["validate"]).stdout
        assert "ERROR:   Interaction A002 is missing ai_output." in out, out
        assert "WARNING: Interaction A001" in out, out          # no human review yet
        assert run(["validate"]).returncode == 1
        # human review clears the warning
        run(["update", "A001"], '{"human_review":"fragile","human_action":"fixed","status":"accepted_with_modification"}')
        out = run(["validate"]).stdout
        assert "PASS:    Interaction A001" in out, out
        # issues surface in validation until corrected
        run(["issue", "A001"], '{"description":"fragile selector","severity":"medium"}')
        assert "no human correction" in run(["validate"]).stdout
        # secrets are redacted, not stored
        run(["log"], '{"prompt":"use password: hunter2xyz","ai_output":"ok"}')
        assert "hunter2xyz" not in open(log, encoding="utf-8").read()
        # report generation
        assert run(["report", "-o", rep]).returncode == 0
        md = open(rep, encoding="utf-8").read()
        for section in ["## 1. AI Usage Declaration", "## 4. AI Interaction Log",
                        "## 6. AI Mistakes / Missed Issues", "## 8. Final Notes"]:
            assert section in md, section
        assert NP in md                                          # missing fields marked, not invented
        assert "A001" in md and "fragile selector" in md
    print("selftest OK")
    return 0


def main():
    common = argparse.ArgumentParser(add_help=False)
    common.add_argument("--path", default="ai-audit-log.json", help="path to the JSON audit log")
    common.add_argument("--no-redact", action="store_true",
                        help="store credential-shaped text verbatim instead of redacting it")
    p = argparse.ArgumentParser(prog="audit.py", description=__doc__,
                                formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = p.add_subparsers(dest="cmd", required=True)
    for name, fn, extra in [("init", cmd_init, None), ("log", cmd_log, None),
                            ("update", cmd_update, "id"), ("issue", cmd_issue, "id"),
                            ("list", cmd_list, None), ("validate", cmd_validate, None),
                            ("selftest", cmd_selftest, None)]:
        sp = sub.add_parser(name, parents=[common])
        if extra:
            sp.add_argument(extra)
        sp.set_defaults(fn=fn)
    sp = sub.add_parser("report", parents=[common])
    sp.add_argument("-o", "--output", default="AI_Audit_Report.md")
    sp.set_defaults(fn=cmd_report)
    args = p.parse_args()
    sys.exit(args.fn(args) or 0)


if __name__ == "__main__":
    main()
