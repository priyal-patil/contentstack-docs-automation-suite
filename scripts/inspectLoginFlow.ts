/**
 * Inspect login flow: visibility of email/password, selectors, redirects/SSO.
 * Usage: npx ts-node scripts/inspectLoginFlow.ts <url>
 */

import { chromium } from "playwright";

const LOGIN_URL = process.argv[2] || "https://dev14-app.csnonprod.com/#!/login";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const redirects: string[] = [];
  page.on("framenavigated", (frame) => {
    if (frame === page.mainFrame() && frame.url()) redirects.push(frame.url());
  });

  await page.goto(LOGIN_URL, { waitUntil: "domcontentloaded", timeout: 45_000 });
  await page.waitForTimeout(8000);

  const result: Record<string, unknown> = {
    url: page.url(),
    redirects: [...new Set(redirects)],
    emailPasswordVisibility: "unknown",
    emailSelectors: [] as string[],
    passwordSelectors: [] as string[],
    submitSelectors: [] as string[],
    ssoSteps: [] as string[],
  };

  const emailCandidates = [
    { sel: 'input[type="email"]', desc: "input[type=email]" },
    { sel: 'input[name="email"]', desc: "input[name=email]" },
    { sel: 'input[name="username"]', desc: "input[name=username]" },
    { sel: 'input[autocomplete="username"]', desc: "input[autocomplete=username]" },
    { sel: '[data-test-id*="email"]', desc: "data-test-id contains email" },
    { sel: '[data-testid*="email"]', desc: "data-testid contains email" },
    { sel: 'input[placeholder*="mail" i]', desc: "placeholder contains mail" },
    { sel: 'input[placeholder*="email" i]', desc: "placeholder contains email" },
    { sel: 'input[aria-label*="mail" i]', desc: "aria-label contains mail" },
  ];

  const passwordCandidates = [
    { sel: 'input[type="password"]', desc: "input[type=password]" },
    { sel: 'input[name="password"]', desc: "input[name=password]" },
    { sel: 'input[autocomplete="current-password"]', desc: "input[autocomplete=current-password]" },
    { sel: '[data-test-id*="password"]', desc: "data-test-id contains password" },
    { sel: '[data-testid*="password"]', desc: "data-testid contains password" },
  ];

  const submitCandidates = [
    { sel: 'button[type="submit"]', desc: "button[type=submit]" },
    { sel: 'input[type="submit"]', desc: "input[type=submit]" },
    { sel: 'button:has-text("Log in")', desc: "button text Log in" },
    { sel: 'button:has-text("Sign in")', desc: "button text Sign in" },
    { sel: 'button:has-text("Continue")', desc: "button text Continue" },
    { sel: 'button:has-text("Next")', desc: "button text Next" },
    { sel: '[data-test-id*="submit"]', desc: "data-test-id contains submit" },
    { sel: '[data-test-id*="login"]', desc: "data-test-id contains login" },
  ];

  const emailVisible = await page.locator('input[type="email"], input[name="email"], input[name="username"]').first().isVisible().catch(() => false);
  const passwordVisible = await page.locator('input[type="password"], input[name="password"]').first().isVisible().catch(() => false);

  result.emailPasswordVisibility = emailVisible && passwordVisible
    ? "both_directly_visible"
    : emailVisible && !passwordVisible
      ? "email_visible_password_hidden"
      : !emailVisible && passwordVisible
        ? "email_hidden_password_visible"
        : "both_hidden_or_behind_button";

  for (const c of emailCandidates) {
    const el = page.locator(c.sel).first();
    if ((await el.count()) > 0) {
      const visible = await el.isVisible().catch(() => false);
      const attrs: Record<string, string> = {};
      try {
        const elHandle = await el.elementHandle();
        if (elHandle) {
          const name = await elHandle.getAttribute("name");
          const id = await elHandle.getAttribute("id");
          const dataTestId = await elHandle.getAttribute("data-test-id");
          const dataTestid = await elHandle.getAttribute("data-testid");
          const placeholder = await elHandle.getAttribute("placeholder");
          const ariaLabel = await elHandle.getAttribute("aria-label");
          if (name) attrs.name = name;
          if (id) attrs.id = id;
          if (dataTestId) attrs["data-test-id"] = dataTestId;
          if (dataTestid) attrs["data-testid"] = dataTestid;
          if (placeholder) attrs.placeholder = placeholder;
          if (ariaLabel) attrs["aria-label"] = ariaLabel;
        }
      } catch {}
      (result.emailSelectors as unknown[]).push({
        selector: c.sel,
        visible,
        attributes: attrs,
      });
    }
  }

  for (const c of passwordCandidates) {
    const el = page.locator(c.sel).first();
    if ((await el.count()) > 0) {
      const visible = await el.isVisible().catch(() => false);
      const attrs: Record<string, string> = {};
      try {
        const elHandle = await el.elementHandle();
        if (elHandle) {
          const name = await elHandle.getAttribute("name");
          const id = await elHandle.getAttribute("id");
          const dataTestId = await elHandle.getAttribute("data-test-id");
          const dataTestid = await elHandle.getAttribute("data-testid");
          if (name) attrs.name = name;
          if (id) attrs.id = id;
          if (dataTestId) attrs["data-test-id"] = dataTestId;
          if (dataTestid) attrs["data-testid"] = dataTestid;
        }
      } catch {}
      (result.passwordSelectors as unknown[]).push({
        selector: c.sel,
        visible,
        attributes: attrs,
      });
    }
  }

  for (const c of submitCandidates) {
    const el = page.locator(c.sel).first();
    if ((await el.count()) > 0) {
      const visible = await el.isVisible().catch(() => false);
      let text = "";
      try {
        text = (await el.textContent())?.trim() || "";
      } catch {}
      (result.submitSelectors as unknown[]).push({
        selector: c.sel,
        visible,
        text,
      });
    }
  }

  const ssoIndicators = [
    /sso|single sign|saml|oauth|google|microsoft|okta|azure ad/i,
    /continue with|sign in with|log in with/i,
  ];
  const bodyText = (await page.textContent("body"))?.toLowerCase() || "";
  for (const re of ssoIndicators) {
    if (re.test(bodyText)) (result.ssoSteps as string[]).push(re.source);
  }

  const ssoButtons = await page.locator('button:has-text("Google"), button:has-text("Microsoft"), button:has-text("SSO"), a:has-text("SSO")').allTextContents();
  if (ssoButtons.length > 0) result.ssoButtons = ssoButtons;

  const allInputs = await page.locator("input").evaluateAll((els) =>
    els.map((el) => ({
      type: el.getAttribute("type"),
      name: el.getAttribute("name"),
      id: el.getAttribute("id"),
      placeholder: el.getAttribute("placeholder"),
      "data-test-id": el.getAttribute("data-test-id"),
    }))
  );
  result.allInputs = allInputs;

  const allButtons = await page.locator("button, [role=button]").evaluateAll((els) =>
    els.slice(0, 20).map((el) => ({ text: el.textContent?.trim().slice(0, 50), type: el.getAttribute("type") }))
  );
  result.allButtons = allButtons;

  const iframeCount = await page.frames().length;
  result.iframeCount = iframeCount;

  await browser.close();

  console.log(JSON.stringify(result, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
