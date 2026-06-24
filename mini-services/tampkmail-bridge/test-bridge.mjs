import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

await page.goto("https://smailpro.com/temporary-email", { waitUntil: "domcontentloaded", timeout: 30000 });
await page.waitForTimeout(5000);

await page.evaluate(() => {
  const btn = Array.from(document.querySelectorAll("button")).find(b => b.textContent.trim() === "Create");
  if (btn) btn.click();
});
await page.waitForTimeout(1000);

await page.evaluate(() => {
  const btn = Array.from(document.querySelectorAll(".fixed.inset-0 button")).find(b => b.textContent.includes("Other"));
  if (btn) btn.click();
});
await page.waitForTimeout(500);

await page.locator("select").first().selectOption("melbourne.edu.pl");
await page.waitForTimeout(500);

// Add captcha container to the page
await page.evaluate(() => {
  const el = document.createElement("div");
  el.id = "captcha";
  el.style.position = "fixed";
  el.style.top = "0";
  el.style.left = "0";
  el.style.width = "1px";
  el.style.height = "1px";
  el.style.opacity = "0.01";
  el.style.overflow = "hidden";
  document.body.appendChild(el);
});

const result = await page.evaluate(async () => {
  const el = Array.from(document.querySelectorAll("[x-data]")).find(el => el.getAttribute("x-data") === "create()");
  if (!el) return "No create component found";

  const data = window.Alpine.$data(el);

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
      const resp = window.__createResp;
      resolve(resp ? resp : "Timeout - no create response");
    }, 60000);
  });
});

console.log("Result:", JSON.stringify(result, null, 2));
await browser.close();
