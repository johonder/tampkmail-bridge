import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

await page.goto("https://smailpro.com/temporary-email", { waitUntil: "domcontentloaded", timeout: 30000 });
await page.waitForTimeout(5000);

// Try calling /app/create directly without Turnstile
const result = await page.evaluate(async () => {
  const query = "?username=random&type=alias&domain=melbourne.edu.pl&server=1";
  const url = "https://smailpro.com/app/create" + query;

  // Without captcha
  const r1 = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  });
  const d1 = await r1.json();
  
  // With empty/fake captcha
  const r2 = await fetch(url + "&test=1", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-captcha": "test-token"
    }
  });
  const d2 = await r2.json();
  
  return { withoutCaptcha: d1, withFakeCaptcha: d2 };
});

console.log("API test:", JSON.stringify(result, null, 2));
await browser.close();
