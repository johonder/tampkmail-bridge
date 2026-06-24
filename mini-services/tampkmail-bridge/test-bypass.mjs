import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

await page.goto("https://smailpro.com/temporary-email", { waitUntil: "domcontentloaded", timeout: 30000 });
await page.waitForTimeout(5000);

// Open modal + select type + domain
await page.evaluate(() => {
  Array.from(document.querySelectorAll("button")).find(b => b.textContent.trim() === "Create")?.click();
});
await page.waitForTimeout(1000);

await page.evaluate(() => {
  Array.from(document.querySelectorAll(".fixed.inset-0 button")).find(b => b.textContent.includes("Other"))?.click();
});
await page.waitForTimeout(500);

await page.locator("select").first().selectOption("melbourne.edu.pl");
await page.waitForTimeout(500);

// Set isLoggedIn = true and call generate
const result = await page.evaluate(async () => {
  const els = document.querySelectorAll("[x-data]");
  const createEl = Array.from(els).find(el => el.getAttribute("x-data") === "create()");
  const tempEl = Array.from(els).find(el => el.getAttribute("x-data") === "TemporaryEmail()");

  // Set isLoggedIn on both components
  if (createEl && window.Alpine) {
    window.Alpine.$data(createEl).isLoggedIn = true;
  }
  if (tempEl && window.Alpine) {
    window.Alpine.$data(tempEl).isLoggedIn = true;
  }

  const data = window.Alpine.$data(createEl);

  // Intercept fetch
  window.__createResp = null;
  const origFetch = window.fetch;
  window.fetch = function(...args) {
    return origFetch.apply(this, args).then(r => {
      if (typeof args[0] === "string" && args[0].includes("/app/create")) {
        r.clone().json().then(d => { window.__createResp = d; });
      }
      return r;
    });
  };

  data.generate();

  return await new Promise((resolve) => {
    const check = setInterval(() => {
      if (window.__createResp) {
        clearInterval(check);
        resolve(window.__createResp);
      }
    }, 500);
    setTimeout(() => {
      clearInterval(check);
      resolve(window.__createResp ? window.__createResp : "Timeout");
    }, 45000);
  });
});

console.log("Result:", JSON.stringify(result, null, 2));
await browser.close();
