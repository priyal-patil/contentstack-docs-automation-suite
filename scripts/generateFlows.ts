import fs from "fs";
import path from "path";

const urlsPath = path.resolve(__dirname, "../urls.json");
const flowsBasePath = path.resolve(__dirname, "../flows");

type UrlEntry = { id: string; module: string; url: string };
type UrlConfig = {
  independent?: UrlEntry[];
  groups?: { id: string; module: string; urls: string[] }[];
};

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function inferStage(id: string, source: any): string {
  const sId = (id || "").toLowerCase();
  const src = Array.isArray(source) ? source.join(" ") : String(source || "");
  const sSrc = src.toLowerCase();

  if (sId.startsWith("delete-")) return "delete";
  if (sSrc.includes("/delete-") || sSrc.includes("/delete/") || sSrc.includes("delete-a-")) return "delete";
  return "main";
}

function writeTemplateFlow(filePath: string, id: string, module: string, source: any) {
  const template = {
    id,
    module,
    stage: inferStage(id, source),
    source,
    type: "executable",
    steps: []
  };
  fs.writeFileSync(filePath, JSON.stringify(template, null, 2), "utf-8");
}

async function generateFlows(): Promise<void> {
  console.log("=== generateFlows.ts DEBUG ===");
  console.log("Resolved urlsPath:", urlsPath);
  console.log("Resolved flowsBasePath:", flowsBasePath);

  console.log("urls.json exists?", fs.existsSync(urlsPath));
  if (!fs.existsSync(urlsPath)) throw new Error(`urls.json not found at: ${urlsPath}`);

  ensureDir(flowsBasePath);

  const raw = fs.readFileSync(urlsPath, "utf-8");
  console.log("urls.json raw content:\n", raw);

  const config: UrlConfig = JSON.parse(raw);
  console.log("Parsed config:", JSON.stringify(config, null, 2));

  const independent = config.independent || [];
  const groups = config.groups || [];

  console.log("Independent count:", independent.length);
  console.log("Groups count:", groups.length);

  for (const entry of independent) {
    const moduleDir = path.join(flowsBasePath, entry.module);
    ensureDir(moduleDir);

    const filePath = path.join(moduleDir, `${entry.id}.json`);

    if (!fs.existsSync(filePath)) {
      writeTemplateFlow(filePath, entry.id, entry.module, entry.url);
      console.log(`✅ Created template flow: ${filePath}`);
    } else {
      console.log(`ℹ️ Already exists, skipped: ${filePath}`);
    }
  }

  for (const group of groups) {
    const moduleDir = path.join(flowsBasePath, group.module);
    ensureDir(moduleDir);

    const filePath = path.join(moduleDir, `${group.id}.json`);

    if (!fs.existsSync(filePath)) {
      writeTemplateFlow(filePath, group.id, group.module, group.urls);
      console.log(`✅ Created template grouped flow: ${filePath}`);
    } else {
      console.log(`ℹ️ Already exists, skipped: ${filePath}`);
    }
  }

  console.log("🎉 Flow templates generated successfully.");
}

generateFlows().catch((e) => {
  console.error("❌ generateFlows failed:", e);
  process.exit(1);
});
