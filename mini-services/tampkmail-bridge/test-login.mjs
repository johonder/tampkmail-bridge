import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

await page.goto("https://smailpro.com/temporary-email", { waitUntil: "domcontentloaded", timeout: 30000 });
await page.waitForTimeout(5000);

// Check what login/profile endpoints exist
const loginInfo = await page.evaluate(() => {
  const scripts = document.querySelectorAll("script");
  const results = [];

  for (const s of scripts) {
    if (!s.textContent) continue;
    // Find fetch calls to /app/
    const matches = s.textContent.match(/\/app\/[a-zA-Z\/_?-]+/g);
    if (matches) results.push(...matches);
  }

  return [...new Set(results)].slice(0, 50);
});

console.log("API endpoints found:", loginInfo);

// Try to call login with the sessionToken
const sessionToken = "f4a29380e733818a1391120a2f2cabbf94c5b020c6d0a14b9272af8720ec24f8";
console.log("\nTrying login call...");

const loginResult = await page.evaluate(async (token) => {
  try {
    const r = await fetch("/app/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token })
    });
    const d = await r.json();
    return { status: r.status, data: d };
  } catch(e) {
    return { error: e.message };
  }
}, sessionToken);

console.log("Login result:", JSON.stringify(loginResult));

// Now check isLoggedIn again
const loggedIn = await page.evaluate(() => {
  const els = document.querySelectorAll("[x-data]");
  const createEl = Array.from(els).find(el => el.getAttribute("x-data") === "create()");
  const tempEl = Array.from(els).find(el => el.getAttribute("x-data") === "TemporaryEmail()");

  return {
    create: createEl && window.Alpine ? window.Alpine.$data(createEl).isLoggedIn : null,
    temp: tempEl && window.Alpine ? window.Alpine.$data(tempEl).isLoggedIn : null
  };
});

console.log("After login:", JSON.stringify(loggedIn));

await browser.close();
