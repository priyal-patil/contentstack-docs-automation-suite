#!/usr/bin/env python3
"""Writer-facing HTML report for a whole docs section (checklist + style guide only).

  REPORT_DIR=reports/billing python3 scripts/buildSectionReport.py <out.html> "<Section name>" "<section url>"

Authored for the Artifact wrapper: no doctype/html/head/body tags.
"""
import glob, html, json, os, re, sys

out_path, section_name, section_url = sys.argv[1], sys.argv[2], sys.argv[3]
REPORT_DIR = os.environ.get("REPORT_DIR", "reports/latest")
e = lambda s: html.escape(str(s if s is not None else ""))

REG = open("core/checklist/registry.ts").read()
def meta(cid):
    m = re.search(r'\{\s*id:\s*"' + re.escape(cid) + r'",(.*?)\n  \}', REG, re.S)
    if not m: return {}
    blk = m.group(1)
    g = lambda k: (re.search(k + r':\s*"((?:[^"\\]|\\.)*)"', blk) or [None, ""])[1]
    return {"reference": g("reference"), "title": g("title"), "tier": g("tier"), "source": g("source")}

docs = []
for f in sorted(glob.glob(os.path.join(REPORT_DIR, "checklist-per-doc", "*.json"))):
    docs.append(json.load(open(f)))
docs.sort(key=lambda d: d["docUrl"])

# ONLY_URL renders a single page's report instead of the whole section.
only = os.environ.get("ONLY_URL")
if only:
    docs = [d for d in docs if d["docUrl"].rstrip("/") == only.rstrip("/")]

# roll up: which rules fire, and where
by_rule = {}
for d in docs:
    for r in d["results"]:
        if r["status"] in ("WARN", "FAIL"):
            by_rule.setdefault(r["id"], []).append((d, r))
ranked = sorted(by_rule.items(), key=lambda kv: (-len(kv[1]), kv[0]))

total_find = sum(len(v) for v in by_rule.values())
total_pass = sum(d["counts"]["PASS"] for d in docs)
clean_pages = [d for d in docs if d["counts"]["WARN"] == 0 and d["counts"]["FAIL"] == 0]
slug = lambda u: u.rstrip("/").split("/")[-1] or "section landing page"

def evid(r, limit=4):
    if not r.get("evidence"): return ""
    rows = "".join(
        f"<tr><td>{e(x.get('where'))}</td><td>{e(x.get('expected') or '—')}</td><td>{e(x.get('actual') or '—')}</td></tr>"
        for x in r["evidence"][:limit])
    more = f'<tr><td colspan="3" class="more">…and {len(r["evidence"])-limit} more</td></tr>' if len(r["evidence"]) > limit else ""
    return ('<div class="scroll"><table class="ev"><thead><tr><th>Where</th><th>Should be</th><th>Is</th>'
            f'</tr></thead><tbody>{rows}{more}</tbody></table></div>')

# ---- rule-first section (what to fix, grouped by rule)
rule_blocks = []
for cid, hits in ranked:
    m = meta(cid)
    pages = "".join(
        f'<li><a href="{e(d["docUrl"])}" target="_blank" rel="noopener">{e(slug(d["docUrl"]))}</a>'
        f'<span class="det">{e(r["summary"])}</span>{evid(r)}</li>' for d, r in hits)
    fix = next((r.get("suggestedFix") for _, r in hits if r.get("suggestedFix")), "")
    why = next((r.get("rootCause") for _, r in hits if r.get("rootCause")), "")
    rule_blocks.append(f'''<article class="rule">
  <header><code class="cid">{e(cid)}</code>
    <span class="count">{len(hits)} page{"s" if len(hits)!=1 else ""}</span>
    <span class="src">{e(m.get("reference"))} · <em>{e(m.get("tier"))}</em></span></header>
  <h3>{e(m.get("title") or cid)}</h3>
  {f'<dl class="fix"><dt>Why</dt><dd>{e(why)}</dd><dt>Fix</dt><dd>{e(fix)}</dd></dl>' if fix else ''}
  <ul class="pages">{pages}</ul>
</article>''')

# ---- doc-first blocks: one per page, its own findings
STATUS_LABEL = {"WARN": "Fix", "FAIL": "Blocker"}
doc_blocks = []
for d in docs:
    finds = [r for r in d["results"] if r["status"] in ("WARN", "FAIL")]
    c = d["counts"]
    if finds:
        items = ""
        for r in finds:
            m = meta(r["id"])
            items += f'''<article class="find {r["status"]}">
  <header><span class="tag {r["status"]}">{STATUS_LABEL[r["status"]]}</span>
    <code class="cid">{e(r["id"])}</code>
    <span class="src">{e(m.get("reference"))} · <em>{e(m.get("tier"))}</em></span></header>
  <h4>{e(m.get("title") or r["id"])}</h4>
  <p class="sum">{e(r["summary"])}</p>
  {evid(r)}
  {f'<dl class="fix"><dt>Why</dt><dd>{e(r.get("rootCause"))}</dd><dt>Fix</dt><dd>{e(r.get("suggestedFix"))}</dd></dl>' if r.get("suggestedFix") else ""}
</article>'''
        body = items
    else:
        body = '<p class="clean">No findings on this page.</p>'
    doc_blocks.append(f'''<section class="doc">
  <div class="dochead">
    <h3><a href="{e(d["docUrl"])}" target="_blank" rel="noopener">{e(slug(d["docUrl"]))}</a></h3>
    <div class="docmeta">{e(d["pageTitle"])}</div>
    <div class="counts"><span class="pill warn">{len(finds)} to fix</span>
      <span class="pill pass">{c["PASS"]} passed</span>
      <span class="pill muted">{c["NA"]} n/a</span></div>
  </div>
  {body}
</section>''')

# ---- per-page summary table
page_rows = "".join(
    f'''<tr class="{'clean' if d["counts"]["WARN"]+d["counts"]["FAIL"]==0 else ''}">
  <td><a href="{e(d["docUrl"])}" target="_blank" rel="noopener">{e(slug(d["docUrl"]))}</a>
      <div class="ttl">{e(d["pageTitle"])}</div></td>
  <td class="n">{d["counts"]["WARN"]+d["counts"]["FAIL"]}</td>
  <td class="n">{d["counts"]["PASS"]}</td>
  <td class="n muted">{d["counts"]["NA"]}</td>
  <td class="ids">{e(", ".join(sorted({r["id"] for r in d["results"] if r["status"] in ("WARN","FAIL")}, key=str)))}</td>
</tr>''' for d in docs)

nc = docs[0]["counts"]["NOT_CHECKED"] if docs else 0
nc_list = "".join(f'<li><code>{e(r["id"])}</code> {e(meta(r["id"]).get("title") or "")}</li>'
                  for r in (docs[0]["results"] if docs else []) if r["status"] == "NOT_CHECKED")

HTML = f'''<title>Billing Docs QA</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,600&family=Source+Sans+3:wght@400;600;700&family=JetBrains+Mono:wght@400;600&display=swap">
<style>
  :root {{
    --ground:#f7f8fb; --surface:#fff; --surface-2:#f0f2f7;
    --ink:#171a21; --ink-2:#4a5160; --ink-3:#767e8f; --rule:#dfe3ec;
    --accent:#5566d8; --accent-soft:#e7eaff;
    --pass:#1f7a4d; --warn:#a2620c; --fail:#b3261e;
    --display:"Newsreader",Georgia,serif; --body:"Source Sans 3",-apple-system,BlinkMacSystemFont,Arial,sans-serif;
    --mono:"JetBrains Mono",ui-monospace,Menlo,monospace;
  }}
  @media (prefers-color-scheme:dark) {{ :root:not([data-theme="light"]) {{
    --ground:#12141a; --surface:#191c24; --surface-2:#21252f;
    --ink:#eceef3; --ink-2:#b3b9c6; --ink-3:#858d9d; --rule:#2b3038;
    --accent:#8f9bf7; --accent-soft:#232842;
    --pass:#5fca92; --warn:#e0a94a; --fail:#f08a80; }} }}
  :root[data-theme="dark"] {{
    --ground:#12141a; --surface:#191c24; --surface-2:#21252f;
    --ink:#eceef3; --ink-2:#b3b9c6; --ink-3:#858d9d; --rule:#2b3038;
    --accent:#8f9bf7; --accent-soft:#232842;
    --pass:#5fca92; --warn:#e0a94a; --fail:#f08a80; }}
  *,*::before,*::after {{ box-sizing:border-box; }}
  body {{ margin:0; background:var(--ground); color:var(--ink); font-family:var(--body); font-size:16px; line-height:1.6; }}
  .wrap {{ max-width:60rem; margin:0 auto; padding:3rem 1.25rem 5rem; display:flex; flex-direction:column; gap:2.5rem; }}
  a {{ color:var(--accent); }}
  code {{ font-family:var(--mono); font-size:.86em; }}
  :focus-visible {{ outline:2px solid var(--accent); outline-offset:2px; border-radius:3px; }}
  .eyebrow {{ font-size:.75rem; letter-spacing:.09em; text-transform:uppercase; color:var(--ink-3); font-weight:600; }}
  h1 {{ font-family:var(--display); font-weight:600; font-size:clamp(2rem,4.4vw,2.9rem); line-height:1.12;
        margin:.4rem 0 .5rem; text-wrap:balance; }}
  h2 {{ font-family:var(--display); font-weight:600; font-size:1.55rem; margin:0 0 .25rem; }}
  h3 {{ font-family:var(--body); font-weight:700; font-size:1.04rem; margin:.5rem 0 .4rem; }}
  .lede {{ color:var(--ink-2); max-width:40em; margin:0; }}
  .band {{ display:grid; grid-template-columns:repeat(auto-fit,minmax(8rem,1fr)); gap:1px;
           background:var(--rule); border:1px solid var(--rule); border-radius:10px; overflow:hidden; }}
  .band > div {{ background:var(--surface); padding:1rem 1.1rem; }}
  .band .k {{ font-size:.72rem; letter-spacing:.08em; text-transform:uppercase; color:var(--ink-3); font-weight:600; }}
  .band .v {{ font-family:var(--display); font-size:1.85rem; font-weight:600; font-variant-numeric:tabular-nums; }}
  .band .v.warn {{ color:var(--warn); }} .band .v.pass {{ color:var(--pass); }}
  section {{ display:flex; flex-direction:column; gap:1rem; }}
  .sechead {{ border-bottom:2px solid var(--rule); padding-bottom:.6rem; }}
  .sechead p {{ margin:.3rem 0 0; color:var(--ink-2); font-size:.94rem; max-width:44em; }}
  table {{ width:100%; border-collapse:collapse; font-size:.93rem; }}
  thead th {{ text-align:left; font-size:.72rem; letter-spacing:.07em; text-transform:uppercase; color:var(--ink-3);
              padding:.45rem .6rem; border-bottom:1px solid var(--rule); font-weight:600; }}
  tbody td {{ padding:.6rem; border-bottom:1px solid var(--rule); vertical-align:top; }}
  td.n {{ width:4.5rem; text-align:right; font-variant-numeric:tabular-nums; font-weight:600; }}
  td.n.muted {{ color:var(--ink-3); font-weight:400; }}
  td.ids {{ font-family:var(--mono); font-size:.78rem; color:var(--ink-3); }}
  tr.clean td {{ color:var(--ink-3); }} tr.clean td.n {{ color:var(--pass); }}
  .ttl {{ font-size:.8rem; color:var(--ink-3); }}
  .scroll {{ overflow-x:auto; }}
  .rule {{ background:var(--surface); border:1px solid var(--rule); border-left:4px solid var(--warn);
           border-radius:10px; padding:1.1rem 1.2rem; }}
  .rule header {{ display:flex; gap:.6rem; align-items:center; flex-wrap:wrap; }}
  .rule .cid {{ font-weight:600; color:var(--ink-2); }}
  .rule .count {{ font-size:.72rem; font-weight:700; text-transform:uppercase; letter-spacing:.04em;
                  color:var(--warn); border:1px solid currentColor; border-radius:99px; padding:.1rem .5rem; }}
  .rule .src {{ font-size:.78rem; color:var(--ink-3); }}
  dl.fix {{ display:grid; grid-template-columns:3.2rem 1fr; gap:.3rem .8rem; margin:.2rem 0 .8rem;
            padding:.8rem 1rem; background:var(--surface-2); border-radius:8px; font-size:.9rem; }}
  dl.fix dt {{ font-size:.7rem; letter-spacing:.07em; text-transform:uppercase; color:var(--ink-3); font-weight:700; padding-top:.15rem; }}
  dl.fix dd {{ margin:0; }}
  ul.pages {{ list-style:none; margin:0; padding:0; display:grid; gap:.7rem; }}
  ul.pages > li {{ border-top:1px solid var(--rule); padding-top:.6rem; }}
  ul.pages .det {{ display:block; font-size:.88rem; color:var(--ink-2); margin-top:.15rem; }}
  table.ev {{ font-size:.84rem; margin:.4rem 0 .2rem; }}
  table.ev td:first-child {{ font-family:var(--mono); font-size:.78rem; color:var(--ink-2); }}
  td.more {{ color:var(--ink-3); font-style:italic; }}
  details {{ background:var(--surface); border:1px solid var(--rule); border-radius:10px; padding:.85rem 1.1rem; }}
  summary {{ cursor:pointer; font-weight:600; }}
  details ul {{ list-style:none; margin:.8rem 0 0; padding:0; display:grid; gap:.4rem; font-size:.92rem; }}
  details li {{ display:flex; gap:.55rem; flex-wrap:wrap; }}
  details li code {{ color:var(--ink-2); font-weight:600; min-width:5.2rem; }}
  .doc {{ background:var(--surface); border:1px solid var(--rule); border-radius:10px; padding:1.1rem 1.2rem; gap:.9rem; }}
  .dochead {{ display:flex; flex-wrap:wrap; align-items:baseline; gap:.5rem 1rem; border-bottom:1px solid var(--rule); padding-bottom:.6rem; }}
  .dochead h3 {{ margin:0; font-family:var(--display); font-size:1.2rem; font-weight:600; }}
  .docmeta {{ font-size:.82rem; color:var(--ink-3); flex:1 1 100%; }}
  .counts {{ display:flex; gap:.4rem; }}
  .pill {{ font-size:.7rem; font-weight:700; text-transform:uppercase; letter-spacing:.04em;
           border:1px solid currentColor; border-radius:99px; padding:.1rem .5rem; }}
  .pill.warn {{ color:var(--warn); }} .pill.pass {{ color:var(--pass); }} .pill.muted {{ color:var(--ink-3); }}
  .find {{ border-left:3px solid var(--warn); padding:.2rem 0 .2rem .9rem; }}
  .find.FAIL {{ border-left-color:var(--fail); }}
  .find header {{ display:flex; gap:.55rem; align-items:center; flex-wrap:wrap; }}
  .find h4 {{ margin:.3rem 0 .2rem; font-size:1rem; font-weight:700; }}
  .find .sum {{ margin:0 0 .4rem; color:var(--ink-2); font-size:.93rem; }}
  .tag {{ font-size:.68rem; font-weight:700; text-transform:uppercase; letter-spacing:.04em;
          border:1px solid currentColor; border-radius:99px; padding:.05rem .45rem; color:var(--warn); }}
  .tag.FAIL {{ color:var(--fail); }}
  .find .cid {{ font-weight:600; color:var(--ink-2); }}
  .find .src {{ font-size:.76rem; color:var(--ink-3); }}
  .clean {{ color:var(--pass); font-weight:600; margin:.4rem 0 0; }}
  .rules {{ display:grid; gap:1rem; margin-top:.9rem; }}
  footer {{ border-top:1px solid var(--rule); padding-top:1.1rem; color:var(--ink-3); font-size:.85rem;
            display:flex; flex-direction:column; gap:.4rem; }}
  @media (prefers-reduced-motion:reduce) {{ * {{ animation:none!important; transition:none!important; }} }}
</style>

<div class="wrap">
  <header>
    <p class="eyebrow">Contentstack docs QA · {e(section_name)}</p>
    <h1>{e(section_name)}</h1>
    <p class="lede">Every page in the section, checked against the Doc Testing Checklist and the Technical
      Documentation Style Guide v1.0.3. Documented procedures were not executed — this is a page audit only.
      Findings are listed per document, with a by-rule view underneath for the ones that repeat.</p>
    <p><a href="{e(section_url)}" target="_blank" rel="noopener">{e(section_url)}</a></p>
  </header>

  <div class="band">
    <div><div class="k">{"Page" if os.environ.get("ONLY_URL") else "Pages checked"}</div><div class="v">{len(docs)}</div></div>
    <div><div class="k">Fixes needed</div><div class="v warn">{total_find}</div></div>
    <div><div class="k">Distinct rules</div><div class="v warn">{len(by_rule)}</div></div>
    <div><div class="k">Checks passed</div><div class="v pass">{total_pass}</div></div>
    <div><div class="k">Clean pages</div><div class="v pass">{len(clean_pages)}</div></div>
  </div>

  <section>
    <div class="sechead"><h2>Page by page</h2>
      <p>Where the work is. Rule IDs in the last column link up with the fixes below.</p></div>
    <div class="scroll"><table>
      <thead><tr><th>Page</th><th class="n">Fixes</th><th class="n">Passed</th><th class="n">N/A</th><th>Rules</th></tr></thead>
      <tbody>{page_rows}</tbody>
    </table></div>
  </section>

  <section>
    <div class="sechead"><h2>Issues by document</h2>
      <p>Each page with its own findings — the rule, what was found, and the change to make.</p></div>
    {"".join(doc_blocks)}
  </section>

  <section>
    <div class="sechead"><h2>Same issues, grouped by rule</h2>
      <p>The other way round — useful for spotting the ones that repeat across the section,
         where a single fix clears several pages.</p></div>
    <details><summary>{len(by_rule)} rules, most widespread first</summary>
      <div class="rules">{"".join(rule_blocks) if rule_blocks else "<p>No findings.</p>"}</div>
    </details>
  </section>

  <section>
    <div class="sechead"><h2>Not checked</h2></div>
    <details><summary>{nc} rules automation does not judge</summary><ul>{nc_list}</ul>
      <p class="lede" style="margin-top:.8rem">These need a person or a vision model. They are listed rather than
         left out, so this report does not imply coverage it does not have.</p></details>
  </section>

  <footer>
    <div>Checklist and style-guide audit only — no documented procedure was executed for these pages.</div>
    <div>Measured at 1440×900 in headless Chromium. Colour values are the docs site's dark-theme rendering.</div>
  </footer>
</div>
'''
open(out_path, "w").write(HTML)
print(f"wrote {out_path} ({len(HTML)} bytes)")
print(f"pages {len(docs)} | findings {total_find} | rules {len(by_rule)} | clean {len(clean_pages)}")
