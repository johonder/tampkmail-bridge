import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

await page.goto("https://smailpro.com/temporary-email", { waitUntil: "domcontentloaded", timeout: 30000 });
await page.waitForTimeout(5000);

const state = await page.evaluate(() => {
  const els = document.querySelectorAll("[x-data]");
  const createEl = Array.from(els).find(el => el.getAttribute("x-data") === "create()");
  const tempEl = Array.from(els).find(el => el.getAttribute("x-data") === "TemporaryEmail()");

  const result = {};

  if (createEl && window.Alpine) {
    const d = window.Alpine.$data(createEl);
    result.create = { isLoggedIn: d.isLoggedIn, emailType: d.emailType, generating: d.generating };
  }

  if (tempEl && window.Alpine) {
    const d = window.Alpine.$data(tempEl);
    result.temp = { isLoggedIn: d.isLoggedIn };
  }

  // Check Alpine store
  if (window.Alpine && window.Alpine._stores) {
    result.stores = Object.keys(window.Alpine._stores);
    if (window.Alpine._stores.user) {
      result.userStore = window.Alpine._stores.user;
    }
  }

  return result;
});

console.log("State:", JSON.stringify(state, null, 2));
await browser.close();
