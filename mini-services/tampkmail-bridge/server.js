import express from "express";
import { chromium } from "playwright";

const app = express();
app.use(express.json({ limit: "10mb" }));

const IS_HEADLESS = !process.env.DISPLAY && !process.env.XVFB_RUNNING;

let browser = null;
let context = null;
let browserError = null;

async function getContext() {
  if (context && !context.pages().every((p) => p.isClosed())) return context;
  const b = await getBrowser();
  context = await b.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    locale: "en-US",
    viewport: { width: 1280, height: 800 },
  });
  return context;
}

async function getBrowser() {
  if (browser && browser.isConnected()) return browser;
  try {
    browser = await chromium.launch({
      headless: IS_HEADLESS,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        ...(IS_HEADLESS ? ["--disable-gpu"] : []),
      ],
    });
    browserError = null;
    console.log("Browser launched (headless:", IS_HEADLESS, ")");
  } catch (err) {
    browserError = err.message;
    console.error("Browser launch failed:", err.message);
    throw err;
  }
  return browser;
}

const DOMAINS = ["melbourne.edu.pl", "sydney.edu.pl", "tokyo.edu.pl"];

app.get("/", (req, res) => {
  res.json({
    name: "Tampkmail Bridge",
    version: "1.0.0",
    status: browser ? (browser.isConnected() ? "ready" : "disconnected") : "starting",
    browserError,
    headless: IS_HEADLESS,
    display: process.env.DISPLAY || "none",
    endpoints: ["GET /health", "GET /", "POST /create-email", "POST /get-message"],
  });
});

app.post("/create-email", async (req, res) => {
  const { domain } = req.body;
  if (!domain || !DOMAINS.includes(domain)) {
    return res.status(400).json({
      success: false,
      error: `Invalid domain. Use: ${DOMAINS.join(", ")}`,
    });
  }

  const ctx = await getContext();
  const page = await ctx.newPage();

  try {
    const respPromise = page.waitForResponse(
      (r) => r.url().includes("/app/create") && r.status() === 200,
      { timeout: 60000 }
    );

    await page.goto("https://smailpro.com/temporary-email", {
      waitUntil: "networkidle",
      timeout: 30000,
    });

    await page.waitForTimeout(2000);

    const otherBtn = page.locator("button").filter({ hasText: "Other" });
    if (await otherBtn.count() > 0) {
      await otherBtn.click();
      await page.waitForTimeout(500);
    }

    if (domain !== "melbourne.edu.pl") {
      const selects = page.locator("select");
      const count = await selects.count();
      if (count > 0) {
        await selects.first().selectOption(domain);
        await page.waitForTimeout(300);
      }
    }

    const generateBtn = page.locator("button").filter({ hasText: "Generate" });
    await generateBtn.waitFor({ state: "visible", timeout: 10000 });
    await generateBtn.click();

    const resp = await respPromise;
    const data = await resp.json();

    await page.close();
    return res.json({
      success: true,
      address: data.address,
      timestamp: data.timestamp,
      key: data.key,
    });
  } catch (err) {
    await page.close().catch(() => {});
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/get-message", async (req, res) => {
  const { address, mid, domain } = req.body;
  if (!address || !mid) {
    return res.status(400).json({ success: false, error: "address and mid required" });
  }

  const ctx = await getContext();
  const page = await ctx.newPage();

  try {
    const respPromise = page.waitForResponse(
      (r) => r.url().includes("temp_email/message") && r.status() === 200,
      { timeout: 60000 }
    );

    const msgUrl = `https://smailpro.com/app/message?email=${encodeURIComponent(address)}&mid=${encodeURIComponent(mid)}`;
    const msgResp = await page.goto(msgUrl, { waitUntil: "networkidle", timeout: 30000 });
    const payload = await page.evaluate(() => document.body.innerText);

    if (!payload || payload.includes("captcha") || payload.includes("error")) {
      throw new Error("Failed to get message payload: " + payload);
    }

    const type = domain && (domain.includes("gmail") || domain.includes("googlemail"))
      ? "temp_gmail"
      : domain && (domain.includes("outlook") || domain.includes("hotmail"))
        ? "temp_outlook"
        : "temp_email";

    const apiResp = await page.evaluate(async (p) => {
      const r = await fetch(`https://api.sonjj.com/v1/temp_email/message?payload=${encodeURIComponent(p)}`);
      return await r.json();
    }, payload);

    await page.close();
    return res.json({ success: true, body: apiResp.body, attachments: apiResp.attachments });
  } catch (err) {
    await page.close().catch(() => {});
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    browser: browser ? (browser.isConnected() ? "connected" : "disconnected") : "not_started",
    browserError,
    headless: IS_HEADLESS,
  });
});

const PORT = parseInt(process.env.PORT || "3000");
app.listen(PORT, async () => {
  console.log(`Bridge running on port ${PORT}`);
  try {
    await getBrowser();
    console.log("Browser launched");
  } catch (err) {
    console.error("Failed to launch browser:", err);
  }
});

process.on("SIGTERM", async () => {
  if (browser) await browser.close();
  process.exit(0);
});
