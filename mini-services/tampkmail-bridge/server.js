import express from "express";
import { chromium } from "playwright";

const app = express();
app.use(express.json({ limit: "10mb" }));

const IS_HEADLESS = !process.env.DISPLAY && !process.env.XVFB_RUNNING;

let browser = null;
let context = null;
let browserError = null;
let sessionReady = false;

const DOMAINS = ["melbourne.edu.pl", "sydney.edu.pl", "tokyo.edu.pl"];

async function getContext() {
  if (context && !context.pages().every((p) => p.isClosed())) return context;
  const b = await getBrowser();
  context = await b.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    locale: "en-US",
    viewport: { width: 1280, height: 800 },
    extraHTTPHeaders: {
      "sec-ch-ua": '"Google Chrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"Windows"',
    },
  });
  await context.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => false });
    if (!window.chrome) window.chrome = {};
    window.chrome.runtime = { id: "fake" };
    const gp = WebGLRenderingContext.prototype.getParameter;
    WebGLRenderingContext.prototype.getParameter = function (p) {
      if (p === 37445) return "Intel Inc.";
      if (p === 37446) return "Intel Iris OpenGL Engine";
      return gp.call(this, p);
    };
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
        "--disable-blink-features=AutomationControlled",
        ...(IS_HEADLESS ? ["--disable-gpu"] : []),
      ],
    });
    browserError = null;
  } catch (err) {
    browserError = err.message;
    throw err;
  }
  return browser;
}

let sessionInitPromise = null;

async function ensureSession() {
  if (sessionReady) return;
  if (sessionInitPromise) return sessionInitPromise;
  
  sessionInitPromise = (async () => {
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const ctx = await getContext();
        const page = await ctx.newPage();
        try {
          await page.goto("https://smailpro.com/temporary-email", {
            waitUntil: "domcontentloaded",
            timeout: 30000,
          });
          await page.waitForTimeout(3000);
          sessionReady = true;
          console.log("Session initialized successfully");
          return;
        } finally {
          await page.close().catch(() => {});
        }
      } catch (err) {
        console.log(`Session init attempt ${attempt + 1} failed:`, err.message);
        await new Promise((r) => setTimeout(r, 2000));
      }
    }
    throw new Error("Failed to initialize session after 5 attempts");
  })();
  
  return sessionInitPromise;
}

function generateAddress(domain) {
  const rand = Math.random().toString(36).substring(2, 10);
  const timestamp = Date.now().toString(36).substring(-4);
  return `${rand}${timestamp}@${domain}`;
}

app.get("/", (req, res) => {
  res.json({
    name: "Tampkmail Bridge v2",
    version: "2.0.0",
    status: browser ? (browser.isConnected() ? "ready" : "disconnected") : "starting",
    browserError,
    headless: IS_HEADLESS,
    sessionReady,
    endpoints: [
      "GET /",
      "GET /health",
      "POST /create-email",
      "POST /check-inbox",
    ],
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

  try {
    await ensureSession();
    const address = generateAddress(domain);

    // Verify the address works by checking inbox
    const ctx = await getContext();
    const page = await ctx.newPage();
    try {
      const checkResult = await page.evaluate(async (addr) => {
        const r = await fetch("https://smailpro.com/app/inbox", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify([
            {
              address: addr,
              timestamp: Math.floor(Date.now() / 1000),
              key: "init-" + Math.random().toString(36),
            },
          ]),
        });
        return { status: r.status, body: (await r.text()).substring(0, 100) };
      }, address);

      if (checkResult.status !== 200) {
        throw new Error("Inbox check failed: " + checkResult.body);
      }

      await page.close();
      return res.json({
        success: true,
        address,
        domain,
        message:
          "Email generated locally. Inbox polling will use active session.",
      });
    } catch (err) {
      await page.close().catch(() => {});
      throw err;
    }
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/check-inbox", async (req, res) => {
  const { address, domain } = req.body;
  if (!address || !domain) {
    return res
      .status(400)
      .json({ success: false, error: "address and domain required" });
  }

  try {
    await ensureSession();
    const ctx = await getContext();
    const page = await ctx.newPage();
    try {
      const result = await page.evaluate(async (addr) => {
        const r = await fetch("https://smailpro.com/app/inbox", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify([
            {
              address: addr,
              timestamp: Math.floor(Date.now() / 1000),
              key: "check-" + Math.random().toString(36),
            },
          ]),
        });
        if (!r.ok) return { status: r.status, body: (await r.text()).substring(0, 200) };
        const data = await r.json();
        return { status: r.status, data };
      }, address);

      if (result.status !== 200) {
        throw new Error("Inbox check failed: " + JSON.stringify(result));
      }

      const inboxData = result.data[0];
      const messages = [];

      if (inboxData && inboxData.payload) {
        // Fetch decoded messages from sonjj inbox API
        const type = domain && domain.includes("gmail") ? "temp_gmail"
          : domain && domain.includes("outlook") ? "temp_outlook"
          : "temp_email";
        
        const sonjjResp = await page.evaluate(async ({ p, t }) => {
          const r = await fetch(
            `https://api.sonjj.com/v1/${t}/inbox?payload=${encodeURIComponent(p)}`
          );
          if (!r.ok) return { error: (await r.text()).substring(0, 200) };
          return await r.json();
        }, { p: inboxData.payload, t: type });

        if (sonjjResp.messages) {
          for (const msg of sonjjResp.messages) {
            messages.push({
              mid: msg.mid,
              from: msg.from,
              subject: msg.subject,
              body: msg.body,
              html: msg.html,
              attachments: msg.attachments,
              date: msg.date,
              timestamp: msg.timestamp,
            });
          }
        }
      }

      await page.close();
      return res.json({
        success: true,
        address,
        hasPayload: !!inboxData?.payload,
        messages,
        key: inboxData?.key || null,
      });
    } catch (err) {
      await page.close().catch(() => {});
      throw err;
    }
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    browser: browser
      ? browser.isConnected()
        ? "connected"
        : "disconnected"
      : "not_started",
    browserError,
    headless: IS_HEADLESS,
    sessionReady,
  });
});

const PORT = parseInt(process.env.PORT || "3000");
app.listen(PORT, async () => {
  console.log(`Bridge v2 running on port ${PORT}`);
  // Wait for browser to fully launch
  try {
    await getBrowser();
    console.log("Browser launched (headless:", IS_HEADLESS, ")");
    // Now initialize session
    try {
      await ensureSession();
      console.log("Session ready");
    } catch (e) {
      console.error("Session init failed:", e.message);
    }
  } catch (err) {
    console.error("Failed to launch browser:", err);
  }
});

process.on("SIGTERM", async () => {
  if (browser) await browser.close();
  process.exit(0);
});
