import express from "express";
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";

const app = express();
app.use(express.json({ limit: "10mb" }));

const __dirname = dirname(fileURLToPath(import.meta.url));
const INDEX_HTML = readFileSync(join(__dirname, "index.html"), "utf-8");

const MAILTM = "https://api.mail.tm";
const ACCOUNTS = new Map();
const EDU_DOMAINS = ["nullsto.edu.pl", "melbourne.edu.pl", "sydney.edu.pl", "tokyo.edu.pl"];
const NULLSTO_BRIDGE = join(__dirname, "nullsto_bridge.py");

let MAILTM_DOMAINS = [];

async function fetchMailTM(path, opts = {}) {
  const r = await fetch(`${MAILTM}${path}`, {
    ...opts,
    headers: { "Content-Type": "application/json", ...opts.headers },
  });
  const text = await r.text();
  try {
    return { ok: r.ok, status: r.status, data: JSON.parse(text) };
  } catch {
    return { ok: r.ok, status: r.status, data: text };
  }
}

async function initDomains() {
  const res = await fetchMailTM("/domains");
  if (res.ok && Array.isArray(res.data?.["hydra:member"])) {
    MAILTM_DOMAINS = res.data["hydra:member"].map((d) => d.domain);
  }
  if (!MAILTM_DOMAINS.length) MAILTM_DOMAINS = ["web-library.net"];
}
initDomains();

function randStr(n) {
  const c = "abcdefghijklmnopqrstuvwxyz0123456789";
  let s = "";
  for (let i = 0; i < n; i++) s += c[Math.floor(Math.random() * c.length)];
  return s;
}

function nullstoRequest(cmd) {
  return new Promise((resolve, reject) => {
    if (!existsSync(NULLSTO_BRIDGE)) {
      return reject(new Error("Nullsto bridge script not found"));
    }
    const action = cmd.action;
    const args = ["python3", NULLSTO_BRIDGE, action];
    if (action === "inbox") {
      args.push(cmd.id || "", cmd.secret || "");
    }
    const proc = spawn(args[0], args.slice(1), {
      stdio: ["pipe", "pipe", "pipe"],
      timeout: 60000,
    });
    let stdout = "", stderr = "";
    proc.stdout.on("data", (d) => { stdout += d.toString(); });
    proc.stderr.on("data", (d) => { stderr += d.toString(); });
    proc.on("close", (code) => {
      if (code !== 0) {
        return reject(new Error(`Nullsto exit ${code}: ${stderr.slice(0, 200)}`));
      }
      try {
        const resp = JSON.parse(stdout);
        resolve(resp);
      } catch {
        reject(new Error(`Invalid JSON: ${stdout.slice(0, 200)}`));
      }
    });
    proc.on("error", reject);
  });
}

app.get("/", (req, res) => {
  const accept = req.headers.accept || "";
  if (accept.includes("text/html")) {
    return res.type("html").send(INDEX_HTML);
  }
  res.json({
    name: "Tampkmail Bridge v5",
    version: "5.0.0",
    backends: ["mail.tm"],
    domains: [...MAILTM_DOMAINS, ...EDU_DOMAINS],
    accounts: ACCOUNTS.size,
    endpoints: ["GET /", "GET /health", "POST /create-email", "POST /check-inbox"],
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", accounts: ACCOUNTS.size });
});

app.post("/create-email", async (req, res) => {
  const { domain } = req.body || {};
  // Use a real mail.tm domain for account creation (edu/nullsto domains aren't on mail.tm)
  const actualDomain = MAILTM_DOMAINS.includes(domain) ? domain : MAILTM_DOMAINS[0];
  const address = `${randStr(12)}@${actualDomain}`;
  const password = randStr(20);
  const ac = await fetchMailTM("/accounts", {
    method: "POST",
    body: JSON.stringify({ address, password }),
  });
  if (!ac.ok) {
    return res.status(500).json({ success: false, error: typeof ac.data === "string" ? ac.data.slice(0, 200) : JSON.stringify(ac.data).slice(0, 200) });
  }
  const tk = await fetchMailTM("/token", {
    method: "POST",
    body: JSON.stringify({ address, password }),
  });
  if (!tk.ok) {
    return res.status(500).json({ success: false, error: typeof tk.data === "string" ? tk.data.slice(0, 200) : JSON.stringify(tk.data).slice(0, 200) });
  }
  ACCOUNTS.set(address, { password, token: tk.data.token, backend: "mailtm" });
  return res.json({
    success: true,
    address,
    domain: actualDomain,
    backend: "mail.tm",
    message: "Ready to receive emails.",
  });
});

app.post("/check-inbox", async (req, res) => {
  const { address } = req.body || {};
  if (!address) return res.status(400).json({ success: false, error: "address required" });

  const acct = ACCOUNTS.get(address);
  const acc = acct || { token: null };
  if (!acc.token) {
    return res.json({ success: true, address, messages: [], count: 0 });
  }
  const msgsRes = await fetchMailTM("/messages", {
    headers: { Authorization: `Bearer ${acc.token}` },
  });
  if (!msgsRes.ok) {
    return res.status(500).json({ success: false, error: "Failed to fetch messages" });
  }
  const raw = Array.isArray(msgsRes.data?.["hydra:member"])
    ? msgsRes.data["hydra:member"]
    : [];
  const messages = [];
  for (const m of raw.slice(0, 50)) {
    const mid = m.id || "";
    let detail = null;
    if (mid) {
      const d = await fetchMailTM(`/messages/${mid}`, {
        headers: { Authorization: `Bearer ${acc.token}` },
      });
      if (d.ok) detail = d.data;
    }
    messages.push({
      mid,
      from: detail?.from?.address || "",
      subject: m.subject || "",
      body: detail?.textBody || detail?.htmlBody || "",
      html: detail?.htmlBody || "",
      date: m.createdAt || "",
      intro: m.intro || "",
    });
  }
  res.json({ success: true, address, messages, count: messages.length });
});

const PORT = parseInt(process.env.PORT || "3000");
app.listen(PORT, () => {
  console.log(`Bridge v5 running on port ${PORT}`);
  console.log(`Domains: ${[...MAILTM_DOMAINS, ...EDU_DOMAINS].join(", ")}`);
  console.log(`Nullsto: ${existsSync(NULLSTO_BRIDGE) ? "available" : "not available"}`);
});

process.on("SIGTERM", () => {
  process.exit(0);
});
