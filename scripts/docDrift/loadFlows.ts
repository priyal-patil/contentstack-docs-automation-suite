/**
 * Discover and load flow JSON + the per-project doc URL inventory.
 */

import * as fs from "fs";
import * as path from "path";
import type { Flow, FlowFile } from "./types";

const PROJECTS_DIR = "projects";
const LEGACY_FLOWS_DIR = "flows";

/** Recursively collect *.flow.json under a directory. */
function walkFlowFiles(dir: string, out: string[] = []): string[] {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkFlowFiles(full, out);
    else if (entry.name.endsWith(".flow.json")) out.push(full);
  }
  return out;
}

export function listProjects(): string[] {
  if (!fs.existsSync(PROJECTS_DIR)) return [];
  return fs
    .readdirSync(PROJECTS_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();
}

/**
 * Load flows for a project. Returns parse failures as findings-worthy entries with `flow: {}`.
 */
export function loadFlows(project: string): { files: FlowFile[]; parseErrors: Array<{ path: string; error: string }> } {
  const files: FlowFile[] = [];
  const parseErrors: Array<{ path: string; error: string }> = [];

  for (const p of walkFlowFiles(path.join(PROJECTS_DIR, project))) {
    try {
      files.push({ path: p, flow: JSON.parse(fs.readFileSync(p, "utf8")) as Flow });
    } catch (e) {
      parseErrors.push({ path: p, error: e instanceof Error ? e.message : String(e) });
    }
  }

  return { files: files.sort((a, b) => a.path.localeCompare(b.path)), parseErrors };
}

/** URL inventory from `flows/<Project>/docs.json`. */
export function loadDocsInventory(project: string): string[] {
  const p = path.join(LEGACY_FLOWS_DIR, project, "docs.json");
  if (!fs.existsSync(p)) return [];
  try {
    const parsed = JSON.parse(fs.readFileSync(p, "utf8")) as { urls?: string[] };
    return Array.isArray(parsed.urls) ? parsed.urls : [];
  } catch {
    return [];
  }
}

export const normalizeUrl = (url: string): string => url.trim().replace(/\/+$/, "");
