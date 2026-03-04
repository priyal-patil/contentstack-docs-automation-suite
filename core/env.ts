import path from "path";
import fs from "fs";
import dotenv from "dotenv";

let loadedEnvPath: string | null = null;

function resolveEnvFile(): string {
  const cwd = process.cwd();
  const explicit = process.env.ENV_FILE?.trim();
  const targetEnv = process.env.TARGET_ENV?.trim();

  const candidates: string[] = [];

  if (explicit) {
    candidates.push(path.isAbsolute(explicit) ? explicit : path.resolve(cwd, explicit));
  }
  if (targetEnv) {
    candidates.push(path.resolve(cwd, `.env.${targetEnv}`));
  }
  candidates.push(path.resolve(cwd, ".env"));

  const found = candidates.find((p) => fs.existsSync(p));
  if (!found) {
    throw new Error(`No env file found. Tried: ${candidates.join(", ")}`);
  }
  return found;
}

export function loadRuntimeEnv(): string {
  if (loadedEnvPath) return loadedEnvPath;
  const envPath = resolveEnvFile();
  dotenv.config({ path: envPath });
  loadedEnvPath = envPath;
  return envPath;
}

export function getAppOrigin(): string {
  const v = (process.env.CS_APP_ORIGIN || "https://app.contentstack.com").trim();
  return v.replace(/\/+$/, "");
}

export function appUrl(hashPath: string): string {
  const suffix = hashPath.startsWith("/") ? hashPath : `/${hashPath}`;
  return `${getAppOrigin()}${suffix}`;
}
