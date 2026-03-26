import fs from "fs";
import path from "path";

/** Walk `projects/` and load `<flowId>.flow.json` if present. */
export function loadFlowById(flowId: string): Record<string, unknown> | null {
  const root = process.cwd();
  const projectsDir = path.join(root, "projects");
  if (!fs.existsSync(projectsDir)) return null;

  const walk = (dir: string): string | null => {
    for (const n of fs.readdirSync(dir)) {
      const p = path.join(dir, n);
      const st = fs.statSync(p);
      if (st.isDirectory()) {
        const found = walk(p);
        if (found) return found;
      } else if (n === `${flowId}.flow.json`) return p;
    }
    return null;
  };

  const file = walk(projectsDir);
  if (!file || !fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, "utf-8")) as Record<string, unknown>;
  } catch {
    return null;
  }
}
