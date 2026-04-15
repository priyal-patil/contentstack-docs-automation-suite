/*
 * Copyright (c) 2024 ContentStack, Inc.
 * All rights reserved.
 *
 * This software and its documentation are confidential and proprietary
 * information of ContentStack, Inc. Unauthorized use, duplication,
 * or distribution is strictly prohibited.
 */

/**
 * Node.js port of {@code com.contentstack.api.common.security.AESEncryptionManager}.
 *
 * Maps to Java:
 * - {@code generateSecureSalt()} → {@link generateSecureSalt}
 * - {@code getSecretKeySpec()} / PBKDF2WithHmacSHA256, 65536 iter, 256-bit key → {@link deriveSecretKeySpec}
 * - {@code encrypt()} → Base64(nonce 12 || cipher.doFinal) = nonce || ciphertext || tag → {@link encryptContentstackAesGcm}
 * - {@code decrypt()} → {@link decryptContentstackAesGcm}
 *
 * Password bytes for PBKDF2: OpenJDK {@code PBEKeySpec} uses 2 bytes per char (UTF-16BE); we try {@code utf16be} first, then UTF-8.
 *
 * Excel / xlsx: values may be stored as {@code encrypt_} + base64 (prefix is not in Java; it namespaces keys in the sheet).
 * Master secret: {@code ENCRYPTION_SECRET_KEY} env or row {@code encryption.secretKey} — same as
 * {@code ConfigManager.getConfig().getEncryptionSecretKey()}.
 */
import fs from "fs";
import path from "path";
import crypto from "crypto";
import * as XLSX from "xlsx";

const ENCRYPT_PREFIX = "encrypt_";

/** Default under project root. Override with env {@code ENCRYPTION_DATA_XLSX} (relative or absolute path). */
export const DEFAULT_ENCRYPTION_DATA_XLSX = "encryption_data.xlsx";

/**
 * Absolute path to the encryption workbook. No caching — each call reflects current env and cwd.
 */
export function getEncryptionDataXlsxPath(cwd: string): string {
  const rel = process.env.ENCRYPTION_DATA_XLSX?.trim() || DEFAULT_ENCRYPTION_DATA_XLSX;
  return path.isAbsolute(rel) ? rel : path.resolve(cwd, rel);
}

/** Logs which file will be read and its last modified time (helps confirm Excel save location after edits). */
export function logEncryptionWorkbookPath(cwd: string): void {
  const p = getEncryptionDataXlsxPath(cwd);
  if (!fs.existsSync(p)) {
    // eslint-disable-next-line no-console
    console.log(
      `Encryption workbook: ${p} (not found — place the file here or set ENCRYPTION_DATA_XLSX to its path)`
    );
    return;
  }
  const st = fs.statSync(p);
  // eslint-disable-next-line no-console
  console.log(`Encryption workbook: ${p} (modified ${st.mtime.toISOString()})`);
}

const PBKDF2_ALGORITHM = "sha256";
const PBKDF2_ITERATIONS = 65536;
const KEY_LENGTH_BITS = 256;
const KEY_LENGTH_BYTES = KEY_LENGTH_BITS / 8;
const GCM_NONCE_LENGTH = 12;
const GCM_TAG_LENGTH = 16;

/**
 * Mirrors Java generateSecureSalt(): second SHA-256 over (firstHash || saltSource UTF-8 bytes).
 */
export function generateSecureSalt(encryptionSecretKey: string | undefined): Buffer {
  const saltSource =
    encryptionSecretKey && encryptionSecretKey.length > 0 ? encryptionSecretKey : "defaultSaltSource";
  const h1 = crypto.createHash("sha256").update(saltSource, "utf8").digest();
  return crypto.createHash("sha256").update(Buffer.concat([h1, Buffer.from(saltSource, "utf8")])).digest();
}

/** UTF-8 password bytes (fallback if UTF-16BE does not match your JDK). */
function passwordBytesUtf8(password: string): Buffer {
  return Buffer.from(password, "utf8");
}

/** Matches OpenJDK PBEKeySpec char[] → PKCS#5 password octets (UTF-16BE per code unit). */
function passwordBytesUtf16Be(password: string): Buffer {
  const buf = Buffer.allocUnsafe(password.length * 2);
  for (let i = 0; i < password.length; i++) {
    buf.writeUInt16BE(password.charCodeAt(i), i * 2);
  }
  return buf;
}

function deriveSecretKeySpec(encryptionSecretKey: string, salt: Buffer, passwordEncoding: "utf8" | "utf16be"): Buffer {
  const passBuf = passwordEncoding === "utf8" ? passwordBytesUtf8(encryptionSecretKey) : passwordBytesUtf16Be(encryptionSecretKey);
  return crypto.pbkdf2Sync(passBuf, salt, PBKDF2_ITERATIONS, KEY_LENGTH_BYTES, PBKDF2_ALGORITHM);
}

/**
 * Decrypt base64(nonce || ciphertext+tag) produced by Java encrypt().
 */
export function decryptContentstackAesGcm(encryptedBase64: string, encryptionSecretKey: string): string {
  if (!encryptionSecretKey) {
    throw new Error("ENCRYPTION_SECRET_KEY is empty");
  }
  const salt = generateSecureSalt(encryptionSecretKey);
  const decoded = Buffer.from(encryptedBase64.trim(), "base64");
  if (decoded.length < GCM_NONCE_LENGTH + GCM_TAG_LENGTH + 1) {
    throw new Error("Encrypted payload is too short.");
  }

  const nonce = decoded.subarray(0, GCM_NONCE_LENGTH);
  const ciphertextWithTag = decoded.subarray(GCM_NONCE_LENGTH);
  const tag = ciphertextWithTag.subarray(-GCM_TAG_LENGTH);
  const ciphertext = ciphertextWithTag.subarray(0, -GCM_TAG_LENGTH);

  for (const enc of ["utf16be", "utf8"] as const) {
    try {
      const key = deriveSecretKeySpec(encryptionSecretKey, salt, enc);
      const decipher = crypto.createDecipheriv("aes-256-gcm", key, nonce);
      decipher.setAuthTag(tag);
      const plain = Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
      return plain;
    } catch {
      /* try next password encoding */
    }
  }
  throw new Error("Decryption failed (wrong ENCRYPTION_SECRET_KEY or corrupt/tampered data).");
}

/**
 * Encrypt to the same wire format as Java (for tooling/tests). Returns base64 without prefix.
 */
export function encryptContentstackAesGcm(plaintext: string, encryptionSecretKey: string, passwordEncoding: "utf8" | "utf16be" = "utf16be"): string {
  if (!encryptionSecretKey) {
    throw new Error("ENCRYPTION_SECRET_KEY is empty");
  }
  const salt = generateSecureSalt(encryptionSecretKey);
  const key = deriveSecretKeySpec(encryptionSecretKey, salt, passwordEncoding);
  const nonce = crypto.randomBytes(GCM_NONCE_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, nonce);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  const encryptedData = Buffer.concat([ciphertext, tag]);
  return Buffer.concat([nonce, encryptedData]).toString("base64");
}

/** Row keys in encryption_data.xlsx for the Contentstack master secret (plain text, not encrypt_*). */
const SECRET_ROW_KEYS = [
  "encryption.secretKey",
  "encryptionSecretKey",
  "ENCRYPTION_SECRET_KEY",
  "contentstack.encryptionSecretKey",
] as const;

export function resolveEncryptionSecretKeyFromMap(map: Map<string, string>): string | undefined {
  for (const key of SECRET_ROW_KEYS) {
    const v = map.get(key)?.trim();
    if (v) return v;
  }
  return undefined;
}

/**
 * Master secret: env ENCRYPTION_SECRET_KEY first, else first matching row in encryption_data.xlsx.
 */
export function resolveEncryptionSecretKey(cwd: string): string | undefined {
  const env = process.env.ENCRYPTION_SECRET_KEY?.trim();
  if (env) return env;

  const abs = getEncryptionDataXlsxPath(cwd);
  if (!fs.existsSync(abs)) return undefined;

  const map = readEncryptionDataMap(abs);
  return resolveEncryptionSecretKeyFromMap(map);
}

export function maybeDecryptEncryptValue(value: string, encryptionSecretKey?: string): string {
  const v = value.trim();
  if (!v.startsWith(ENCRYPT_PREFIX)) return v;

  const b64Payload = v.slice(ENCRYPT_PREFIX.length);
  try {
    const asUtf8 = Buffer.from(b64Payload, "base64").toString("utf8");
    if (/^xox[bap]-/.test(asUtf8.trim())) return asUtf8.trim();
  } catch {
    /* not plain base64-wrapped token */
  }

  const secret = encryptionSecretKey?.trim();
  if (!secret) {
    throw new Error(
      `Easiest: put a plain Slack bot token (xoxb-...) in slack.authToken. ` +
        `Or for Contentstack encrypt_* values, add encryption.secretKey (plain master secret) in the same xlsx or set ENCRYPTION_SECRET_KEY.`
    );
  }

  return decryptContentstackAesGcm(b64Payload, secret).trim();
}

export function readEncryptionDataMap(xlsxPath: string): Map<string, string> {
  const wb = XLSX.readFile(xlsxPath);
  const sheetName = wb.SheetNames.includes("Default") ? "Default" : wb.SheetNames[0];
  const sheet = wb.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" }) as unknown[][];
  const m = new Map<string, string>();
  for (const row of rows) {
    const k = String(row[0] ?? "").trim();
    const val = String(row[1] ?? "").trim();
    if (!k || k === "Key") continue;
    m.set(k, val);
  }
  return m;
}

/**
 * Resolve Slack bot token: SLACK_BOT_TOKEN env first, else slack.authToken from encryption_data.xlsx.
 * Path: ENCRYPTION_DATA_XLSX or <cwd>/encryption_data.xlsx
 */
const DEFAULT_SLACK_CHANNEL_ID = "C09GMK1NL14";

/** Channel: SLACK_CHANNEL_ID env, or slack.channelId / slack.channel in encryption_data.xlsx, else default. */
export function resolveSlackChannelId(cwd: string): string {
  const fromEnv = process.env.SLACK_CHANNEL_ID?.trim();
  if (fromEnv) return fromEnv;

  const abs = getEncryptionDataXlsxPath(cwd);
  if (fs.existsSync(abs)) {
    const map = readEncryptionDataMap(abs);
    const c = map.get("slack.channelId")?.trim() || map.get("slack.channel")?.trim();
    if (c) return c;
  }

  return DEFAULT_SLACK_CHANNEL_ID;
}

export function resolveSlackBotToken(cwd: string): string | undefined {
  const abs = getEncryptionDataXlsxPath(cwd);

  let map: Map<string, string> | undefined;
  if (fs.existsSync(abs)) {
    map = readEncryptionDataMap(abs);
  }

  const secret =
    process.env.ENCRYPTION_SECRET_KEY?.trim() ||
    (map ? resolveEncryptionSecretKeyFromMap(map) : resolveEncryptionSecretKey(cwd));

  const envTok = process.env.SLACK_BOT_TOKEN?.trim();
  if (envTok) {
    try {
      return maybeDecryptEncryptValue(envTok, secret);
    } catch (e) {
      throw new Error(`SLACK_BOT_TOKEN: ${(e as Error).message}`);
    }
  }

  if (!map) return undefined;

  const raw = map.get("slack.authToken")?.trim();
  if (!raw) return undefined;

  try {
    return maybeDecryptEncryptValue(raw, secret);
  } catch (e) {
    throw new Error(`encryption_data.xlsx slack.authToken: ${(e as Error).message}`);
  }
}
