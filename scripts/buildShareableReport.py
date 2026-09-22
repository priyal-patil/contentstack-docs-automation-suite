#!/usr/bin/env python3
"""Build a shareable, writer-facing HTML report from a run's JSON artifacts.

Output is authored for the Artifact wrapper: no doctype/html/head/body tags.

  python3 scripts/buildShareableReport.py <flow-id> <doc-url> <out.html>
"""
import base64, html, json, os, re, sys

flow_id, doc_url, out_path = sys.argv[1], sys.argv[2], sys.argv[3]
REPORT_DIR = os.environ.get("REPORT_DIR", "reports/latest")
e = lambda s: html.escape(str(s if s is not None else ""))

def jload(p, d=None):
    return json.load(open(p)) if p and os.path.exists(p) else d

def find_flow(root, fid):
    for dirpath, _, files in os.walk(os.path.join(root, "projects")):
        if f"{fid}.flow.json" in files:
            return os.path.join(dirpath, f"{fid}.flow.json")
    return None

flow = jload(find_flow(".", flow_id), {"steps": []})
fails = [f for f in (jload(os.path.join(REPORT_DIR, "doc-step-failures.json"), {}) or {}).get("failures", []) if f.get("flowId") == flow_id]
warns_raw = jload(os.path.join(REPORT_DIR, "doc-step-warnings.json"), []) or []
warns = [w for w in (warns_raw if isinstance(warns_raw, list) else warns_raw.get("warnings", [])) if w.get("flowId") == flow_id]
first_fail = min([f["stepNumber"] for f in fails], default=None)
warn_by_step = {w["stepNumber"]: w.get("warningMessage", "") for w in warns}

name = base64.b64encode(doc_url.encode()).decode().replace("/", "_").replace("+", "_").replace("=", "_")
audit = jload(os.path.join(REPORT_DIR, "checklist-per-doc", f"{name}.json"), None)

REG = open("core/checklist/registry.ts").read()
def reg_meta(cid):
    m = re.search(r'\{\s*id:\s*"' + re.escape(cid) + r'",(.*?)\n  \}', REG, re.S)
    if not m: return {}
    blk = m.group(1)
    g = lambda k: (re.search(k + r':\s*"((?:[^"\\]|\\.)*)"', blk) or [None, ""])[1]
    return {"reference": g("reference"), "title": g("title"), "tier": g("tier"), "rationale": g("rationale")}

# A hand-run verification file, when present, takes precedence over the flow-suite run:
# it records a browser walk of the doc's CURRENT procedure, step-numbered as the doc numbers them.
verif = jload(os.path.join(REPORT_DIR, "step-verification.json"), None)
if verif and verif.get("docUrl") == doc_url:
    steps = [{"n": st["n"], "action": "", "target": st["text"], "value": None,
              "shot": st.get("shot"), "shotCaption": st.get("shotCaption"),
              "status": {"passed": "passed", "not-executed": "skipped", "partial": "warning",
                         "failed": "failed"}.get(st["status"], st["status"]),
              "note": st.get("detail", "")} for st in verif["steps"]]
else:
    verif = None
    steps = []
for i, s in enumerate([] if verif else flow.get("steps", []), start=1):
    f = next((x for x in fails if x["stepNumber"] == i), None)
    if f: status, note = "failed", f.get("missingElementSummary", "")
    elif first_fail and i > first_fail: status, note = "skipped", f"Not run — step {first_fail} stopped the flow."
    elif i in warn_by_step: status, note = "warning", warn_by_step[i]
    else: status, note = "passed", s.get("note", "")
    steps.append({"n": i, "action": s.get("action", ""), "target": s.get("target", ""),
                  "value": s.get("value"), "status": status, "note": note})

tally = lambda st: sum(1 for x in steps if x["status"] == st)
counts = audit["counts"] if audit else {"PASS": 0, "WARN": 0, "FAIL": 0, "NA": 0, "NOT_CHECKED": 0}
findings = [r for r in (audit["results"] if audit else []) if r["status"] in ("WARN", "FAIL")]
checked_ok = [r for r in (audit["results"] if audit else []) if r["status"] == "PASS"]
not_applicable = [r for r in (audit["results"] if audit else []) if r["status"] == "NA"]
not_checked = [r for r in (audit["results"] if audit else []) if r["status"] == "NOT_CHECKED"]

def finding_card(r, idx):
    m = reg_meta(r["id"])
    ev = ""
    if r.get("evidence"):
        rows = "".join(
            f"<tr><td>{e(x.get('where'))}</td><td>{e(x.get('expected') or '—')}</td><td>{e(x.get('actual') or '—')}</td></tr>"
            for x in r["evidence"])
        ev = ('<div class="scroll"><table class="ev"><thead><tr><th>Where</th><th>Should be</th>'
              f'<th>Is</th></tr></thead><tbody>{rows}</tbody></table></div>')
    fix = ""
    if r.get("issue"):
        fix = (f'<dl class="fix"><dt>Issue</dt><dd>{e(r["issue"])}</dd>'
               f'<dt>Why</dt><dd>{e(r.get("rootCause"))}</dd>'
               f'<dt>Fix</dt><dd>{e(r.get("suggestedFix"))}</dd></dl>')
    return f'''<article class="card {r['status']}">
  <header>
    <span class="chip {r['status']}">{'Fix needed' if r['status']=='WARN' else 'Blocker'}</span>
    <code class="cid">{e(r['id'])}</code>
    <span class="src">{e(m.get('reference'))}</span>
  </header>
  <h3>{e(m.get('title') or r['id'])}</h3>
  <p class="sum">{e(r['summary'])}</p>
  {ev}{fix}
</article>'''

def shot_html(s):
    if not s.get("shot"):
        return ""
    path = os.path.join(REPORT_DIR, "shots", s["shot"])
    if not os.path.exists(path):
        return ""
    import base64 as _b64
    uri = "data:image/png;base64," + _b64.b64encode(open(path, "rb").read()).decode()
    return (f'<figure class="shot"><img src="{uri}" alt="{e(s.get("shotCaption") or "Screenshot")}" loading="lazy">'
            f'<figcaption>{e(s.get("shotCaption") or "")}</figcaption></figure>')

step_rows = "".join(
    f'''<tr class="{s['status']}">
  <td class="num">{s['n']}</td>
  <td class="act"><code>{e(s['action'])}</code></td>
  <td>{e(s['target'])}{f'<span class="val">typed <code>{e(s["value"])}</code></span>' if s.get('value') else ''}
      {f'<p class="note">{e(s["note"])}</p>' if s['note'] else ''}{shot_html(s)}</td>
  <td class="st"><span class="chip {s['status']}">{s['status'].capitalize()}</span></td>
</tr>''' for s in steps)

passed_list = "".join(f'<li><code>{e(r["id"])}</code> {e(reg_meta(r["id"]).get("title") or "")}</li>' for r in checked_ok)
na_list = "".join(f'<li><code>{e(r["id"])}</code> {e(reg_meta(r["id"]).get("title") or "")} <span class="why">{e(r["summary"])}</span></li>' for r in not_applicable)
nc_list = "".join(f'<li><code>{e(r["id"])}</code> {e(reg_meta(r["id"]).get("title") or "")} <span class="why">{e(r["summary"])}</span></li>' for r in not_checked)

STEPS_NOTE = os.environ.get("STEPS_NOTE", "")
VERIF_FOOT = ""
NO_STEPS_SECTION = ""
EYEBROW = os.environ.get("EYEBROW", "Contentstack docs QA · CMS / Entries")
PAGE_H1 = os.environ.get("PAGE_H1", "Find and Replace Entries in Bulk")
DOC_TITLE = os.environ.get("DOC_TITLE", "Find and Replace Docs QA")
STEPS_SECTION_CLASS = ""

if verif:
    VERIF_FOOT = (f'Steps walked in the browser on {verif["verifiedAt"]} against the '
                  f'{verif["docRevision"]} revision of the page — {e(verif["mode"])}. ')
    if verif.get("appNote"):
        STEPS_NOTE = f'<p class="stale">{e(verif["appNote"])}</p>'

if not steps:
    STEPS_SECTION_CLASS = "hidden"
    NO_STEPS_SECTION = (
        '<section><div class="sechead"><h2>What the page tells you to do</h2></div>'
        '<p class="stale">' + os.environ.get("NO_STEPS_NOTE",
        "The documented procedure was not executed for this page — only the published page was audited.")
        + '</p></section>')

HTML = f'''<title>{DOC_TITLE}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,600;1,6..72,400&family=Source+Sans+3:wght@400;600;700&family=JetBrains+Mono:wght@400;600&display=swap">
<style>
  :root {{
    --ground:#f7f8fb; --surface:#ffffff; --surface-2:#f0f2f7;
    --ink:#171a21; --ink-2:#4a5160; --ink-3:#767e8f; --rule:#dfe3ec;
    --accent:#5566d8; --accent-soft:#e7eaff;
    --pass:#1f7a4d; --warn:#a2620c; --fail:#b3261e; --skip:#6b7280; --nc:#6d4bb5;
    --display:"Newsreader",Georgia,"Times New Roman",serif;
    --body:"Source Sans 3",-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif;
    --mono:"JetBrains Mono",ui-monospace,SFMono-Regular,Menlo,monospace;
  }}
  @media (prefers-color-scheme:dark) {{
    :root:not([data-theme="light"]) {{
      --ground:#12141a; --surface:#191c24; --surface-2:#21252f;
      --ink:#eceef3; --ink-2:#b3b9c6; --ink-3:#858d9d; --rule:#2b3038;
      --accent:#8f9bf7; --accent-soft:#232842;
      --pass:#5fca92; --warn:#e0a94a; --fail:#f08a80; --skip:#8b93a2; --nc:#b8a3f0;
    }}
  }}
  :root[data-theme="dark"] {{
    --ground:#12141a; --surface:#191c24; --surface-2:#21252f;
    --ink:#eceef3; --ink-2:#b3b9c6; --ink-3:#858d9d; --rule:#2b3038;
    --accent:#8f9bf7; --accent-soft:#232842;
    --pass:#5fca92; --warn:#e0a94a; --fail:#f08a80; --skip:#8b93a2; --nc:#b8a3f0;
  }}
  *,*::before,*::after {{ box-sizing:border-box; }}
  body {{ margin:0; background:var(--ground); color:var(--ink); font-family:var(--body);
    font-size:16px; line-height:1.6; -webkit-font-smoothing:antialiased; }}
  .wrap {{ max-width:60rem; margin:0 auto; padding:3rem 1.25rem 5rem;
    display:flex; flex-direction:column; gap:2.5rem; }}
  a {{ color:var(--accent); }}
  code {{ font-family:var(--mono); font-size:.86em; }}
  :focus-visible {{ outline:2px solid var(--accent); outline-offset:2px; border-radius:3px; }}

  .eyebrow {{ font-size:.75rem; letter-spacing:.09em; text-transform:uppercase;
    color:var(--ink-3); font-weight:600; }}
  h1 {{ font-family:var(--display); font-weight:600; font-size:clamp(2rem,4.4vw,2.9rem);
    line-height:1.12; margin:.4rem 0 .5rem; text-wrap:balance; letter-spacing:-.01em; }}
  h2 {{ font-family:var(--display); font-weight:600; font-size:1.55rem; margin:0 0 .25rem;
    text-wrap:balance; }}
  h3 {{ font-family:var(--body); font-weight:700; font-size:1.03rem; margin:.45rem 0 .3rem; }}
  .lede {{ color:var(--ink-2); max-width:38em; margin:0; }}
  .docref {{ font-family:var(--mono); font-size:.8rem; color:var(--ink-3); word-break:break-all; }}

  .band {{ display:grid; grid-template-columns:repeat(auto-fit,minmax(8.5rem,1fr)); gap:1px;
    background:var(--rule); border:1px solid var(--rule); border-radius:10px; overflow:hidden; }}
  .band > div {{ background:var(--surface); padding:1rem 1.1rem; }}
  .band .k {{ font-size:.72rem; letter-spacing:.08em; text-transform:uppercase;
    color:var(--ink-3); font-weight:600; }}
  .band .v {{ font-family:var(--display); font-size:1.85rem; font-weight:600;
    font-variant-numeric:tabular-nums; line-height:1.1; }}
  .band .v.pass {{ color:var(--pass); }} .band .v.warn {{ color:var(--warn); }}
  .band .v.fail {{ color:var(--fail); }} .band .v.skip {{ color:var(--skip); }}

  section {{ display:flex; flex-direction:column; gap:1rem; }}
  .sechead {{ border-bottom:2px solid var(--rule); padding-bottom:.6rem; }}
  .sechead p {{ margin:.3rem 0 0; color:var(--ink-2); font-size:.94rem; max-width:44em; }}

  .chip {{ display:inline-block; padding:.1rem .5rem; border-radius:99px; font-size:.7rem;
    font-weight:700; letter-spacing:.04em; text-transform:uppercase; white-space:nowrap;
    border:1px solid currentColor; }}
  .chip.passed,.chip.PASS {{ color:var(--pass); }}
  .chip.warning,.chip.WARN {{ color:var(--warn); }}
  .chip.failed,.chip.FAIL {{ color:var(--fail); }}
  .chip.skipped {{ color:var(--skip); }}

  .scroll {{ overflow-x:auto; }}
  table {{ width:100%; border-collapse:collapse; font-size:.93rem; }}
  thead th {{ text-align:left; font-size:.72rem; letter-spacing:.07em; text-transform:uppercase;
    color:var(--ink-3); padding:.45rem .6rem; border-bottom:1px solid var(--rule); font-weight:600; }}
  tbody td {{ padding:.6rem; border-bottom:1px solid var(--rule); vertical-align:top; }}
  td.num {{ font-family:var(--mono); color:var(--ink-3); width:2.6rem;
    font-variant-numeric:tabular-nums; }}
  td.act {{ width:5.5rem; color:var(--ink-2); }}
  tbody td:nth-child(3) {{ min-width:22rem; }}
  td.st {{ width:6.5rem; text-align:right; }}
  tr.failed td.num {{ box-shadow:inset 3px 0 0 var(--fail); }}
  tr.warning td.num {{ box-shadow:inset 3px 0 0 var(--warn); }}
  tr.skipped td {{ color:var(--ink-3); }}
  .val {{ display:block; font-size:.82rem; color:var(--ink-3); }}
  .note {{ margin:.35rem 0 0; font-size:.84rem; color:var(--ink-2); }}

  .card {{ background:var(--surface); border:1px solid var(--rule); border-radius:10px;
    padding:1.1rem 1.2rem; display:flex; flex-direction:column; gap:.2rem;
    border-left:4px solid var(--warn); }}
  .card.FAIL {{ border-left-color:var(--fail); }}
  .card header {{ display:flex; align-items:center; gap:.6rem; flex-wrap:wrap; }}
  .card .cid {{ color:var(--ink-2); font-weight:600; }}
  .card .src {{ font-size:.78rem; color:var(--ink-3); }}
  .card .sum {{ margin:0 0 .5rem; color:var(--ink-2); }}
  table.ev {{ font-size:.86rem; margin:.2rem 0 .7rem; }}
  table.ev td:first-child {{ font-family:var(--mono); font-size:.8rem; color:var(--ink-2); }}
  dl.fix {{ display:grid; grid-template-columns:4.4rem 1fr; gap:.3rem .8rem; margin:0;
    padding:.85rem 1rem; background:var(--surface-2); border-radius:8px; font-size:.9rem; }}
  dl.fix dt {{ font-size:.7rem; letter-spacing:.07em; text-transform:uppercase;
    color:var(--ink-3); font-weight:700; padding-top:.15rem; }}
  dl.fix dd {{ margin:0; }}

  details {{ background:var(--surface); border:1px solid var(--rule); border-radius:10px;
    padding:.85rem 1.1rem; }}
  summary {{ cursor:pointer; font-weight:600; }}
  details ul {{ list-style:none; margin:.8rem 0 0; padding:0; display:grid; gap:.4rem;
    font-size:.92rem; }}
  details li {{ display:flex; gap:.55rem; flex-wrap:wrap; align-items:baseline; }}
  details li code {{ color:var(--ink-2); font-weight:600; min-width:5.2rem; }}
  .why {{ color:var(--ink-3); font-size:.86rem; }}
  .clean {{ color:var(--pass); font-weight:600; }}

  figure.shot {{ margin:.8rem 0 .2rem; }}
  figure.shot img {{ width:100%; max-width:100%; border:1px solid var(--rule); border-radius:8px; display:block; }}
  figure.shot figcaption {{ font-size:.8rem; color:var(--ink-3); margin-top:.4rem; }}
  .hidden {{ display:none; }}
  .stale {{ margin:.6rem 0 0; padding:.7rem .95rem; border-left:3px solid var(--accent);
    background:var(--accent-soft); border-radius:0 8px 8px 0; font-size:.9rem; color:var(--ink-2); }}
  .stale strong {{ color:var(--ink); }}
  footer {{ border-top:1px solid var(--rule); padding-top:1.1rem; color:var(--ink-3);
    font-size:.85rem; display:flex; flex-direction:column; gap:.4rem; }}
  @media (prefers-reduced-motion:reduce) {{ * {{ animation:none!important; transition:none!important; }} }}
</style>

<div class="wrap">
  <header>
    <p class="eyebrow">{EYEBROW}</p>
    <h1>{PAGE_H1}</h1>
    <p class="lede">The documented procedure was run against the live app, and the published page
      was checked against the Doc Testing Checklist and the Technical Documentation Style Guide v1.0.3.
      Everything below is either a step that did not behave as written, or a rule the page does not meet.</p>
    <p class="docref"><a href="{e(doc_url)}">{e(doc_url)}</a></p>
  </header>

  <div class="band">
    <div><div class="k">Steps run</div><div class="v">{len(steps)}</div></div>
    <div><div class="k">Behaved as written</div><div class="v pass">{tally("passed")}</div></div>
    <div><div class="k">Step mismatches</div><div class="v warn">{tally("warning") + tally("failed")}</div></div>
    <div><div class="k">Page fixes needed</div><div class="v warn">{counts.get("WARN", 0)}</div></div>
    <div><div class="k">Rules met</div><div class="v pass">{counts.get("PASS", 0)}</div></div>
  </div>

  {NO_STEPS_SECTION}
  <section class="{STEPS_SECTION_CLASS}">
    <div class="sechead">
      <h2>What the page tells you to do</h2>
      <p>Each numbered row is one action from the doc's procedure, in order, performed on the QA stack.
         A mismatch means the doc says something the app does not do.</p>
      {STEPS_NOTE}
    </div>
    <div class="scroll">
      <table>
        <thead><tr><th>#</th><th></th><th>Step, as the page words it</th><th>Result</th></tr></thead>
        <tbody>{step_rows}</tbody>
      </table>
    </div>
  </section>

  <section>
    <div class="sechead">
      <h2>Page fixes</h2>
      <p>Checklist and style-guide rules this page does not currently meet. Each card names the rule,
         shows what was found, and states the change to make.</p>
    </div>
    {"".join(finding_card(r, i) for i, r in enumerate(findings)) if findings else '<p class="clean">No page-level findings.</p>'}
  </section>

  <section>
    <div class="sechead"><h2>Everything else that was checked</h2></div>
    <details><summary>Rules met — {len(checked_ok)}</summary><ul>{passed_list}</ul></details>
    <details><summary>Not applicable to this page — {len(not_applicable)}</summary><ul>{na_list}</ul></details>
    <details><summary>Needs a human — {len(not_checked)}</summary><ul>{nc_list}</ul></details>
  </section>

  <footer>
    <div>{VERIF_FOOT}Doc steps executed on the QA stack <code>PriyalDocsStack</code>, headless Chromium.
      Page audited at 1440×900. Colour values are the docs site's dark-theme rendering.</div>
    <div>Rules listed under “Needs a human” are not attempted by automation — they need a person
      or a vision model, and are reported rather than assumed to pass.</div>
  </footer>
</div>
'''

open(out_path, "w").write(HTML)
print(f"wrote {out_path} ({len(HTML)} bytes)")
print(f"steps: {len(steps)} | passed {tally('passed')} warning {tally('warning')} failed {tally('failed')} skipped {tally('skipped')}")
print(f"audit: {counts} | findings {len(findings)}")
