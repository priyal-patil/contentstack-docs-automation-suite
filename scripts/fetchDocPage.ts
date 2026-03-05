/**
 * One-off: fetch a docs page (with optional login), extract title and actionable steps.
 * Usage: npx ts-node scripts/fetchDocPage.ts [username] [password]
 */

import { chromium } from "playwright";
import * as cheerio from "cheerio";

const DOCS_URL = "https://stag-contentstack-com.contentstackapps.com/docs/agent-os/managing-projects";
const BASE_URL = "https://stag-contentstack-com.contentstackapps.com";
const USERNAME = process.argv[2] || "nexus";
const PASSWORD = process.argv[3] || "letmein";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    httpCredentials: { username: USERNAME, password: PASSWORD },
  });
  const page = await context.newPage();

  // With HTTP Basic Auth, go directly to docs URL
  await page.goto(DOCS_URL, { waitUntil: "networkidle", timeout: 30_000 });
  let html = await page.content();
  const finalUrl = page.url();

  // If redirected to login and we have login form, try form login
  const bodyText = (await page.textContent("body").catch(() => null)) ?? "";
  const isLoginPage = /account log in|log in to contentstack/i.test(bodyText) || finalUrl.includes("/login");
  if (isLoginPage) {
    await page.click('button:has-text("Accept All Cookies")').catch(() => {});
    await page.waitForTimeout(500);
    await page.click('button:has-text("North America")').catch(() => {});
    await page.waitForTimeout(1500);
    const emailInput = page.locator('input[type="email"], input[name="email"], input[name="username"]').first();
    const passInput = page.locator('input[type="password"], input[name="password"]').first();
    if ((await emailInput.count()) > 0) await emailInput.fill(USERNAME);
    if ((await passInput.count()) > 0) await passInput.fill(PASSWORD);
    await page.locator('button[type="submit"], [type="submit"]').first().click();
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(5000);
    await page.goto(DOCS_URL, { waitUntil: "networkidle", timeout: 30_000 });
    html = await page.content();
  }
  await browser.close();

  const $ = cheerio.load(html);
  const title =
    $("h1").first().text().trim() ||
    $("title").text().trim() ||
    $('[role="main"] h1').first().text().trim() ||
    "";

  const main =
    $('article, [role="main"], .documentation, .doc-content, .content-area, .markdown-body, main').first() || $("body");

  const steps: string[] = [];
  const labels: string[] = [];

  main.find("ol li").each((_, el) => {
    const t = $(el).text().replace(/\s+/g, " ").trim().replace(/^\d+\.\s*/, "");
    if (t.length > 5) steps.push(t);
  });

  main.find("ol").each((_, ol) => {
    $(ol)
      .find("> li")
      .each((_, li) => {
        const t = $(li).text().replace(/\s+/g, " ").trim().replace(/^\d+\.\s*/, "");
        if (t.length > 5 && !steps.includes(t)) steps.push(t);
      });
  });

  main.find('button, [role="button"], input[type="submit"], a.btn').each((_, el) => {
    const t = $(el).text().trim();
    if (t && t.length < 50) labels.push(`Button: ${t}`);
  });

  main.find('input[type="text"], input[type="email"], input[placeholder], label').each((_, el) => {
    const label = $(el).attr("aria-label") || $(el).attr("placeholder") || $(el).text().trim();
    if (label && label.length < 80) labels.push(`Input/Label: ${label}`);
  });

  const navCues: string[] = [];
  main.find('[class*="nav"], [class*="sidebar"], [role="navigation"]').each((_, el) => {
    const cls = $(el).attr("class") || "";
    if (/top|left|sidebar|nav/i.test(cls)) navCues.push(cls.split(" ")[0] || "nav");
  });

  const result = {
    pageTitle: title,
    orderedSteps: steps,
    labelsButtonsInputs: [...new Set(labels)],
    navCues: [...new Set(navCues)],
  };

  console.log(JSON.stringify(result, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
