import { Hono } from "hono";
import { supabaseQuery, buildQuery } from "../lib/db";

export const v1Routes = new Hono();

const BRIDGE_URL = "http://localhost:3000";
const SMALLPRO_INBOX = "https://smailpro.com/app/inbox";
const SONJJ_INBOX = "https://api.sonjj.com/v1/temp_email/inbox";

const DOMAINS = [
  { domain: "gmail.com", type: "google", label: "Gmail" },
  { domain: "googlemail.com", type: "google", label: "Gmail" },
  { domain: "outlook.com", type: "microsoft", label: "Outlook" },
  { domain: "hotmail.com", type: "microsoft", label: "Outlook" },
  { domain: "outlook.kr", type: "microsoft", label: "Outlook" },
  { domain: "outlook.fr", type: "microsoft", label: "Outlook" },
  { domain: "outlook.com.vn", type: "microsoft", label: "Outlook" },
  { domain: "outlook.co.id", type: "microsoft", label: "Outlook" },
  { domain: "outlook.co.th", type: "microsoft", label: "Outlook" },
  { domain: "outlook.com.ar", type: "microsoft", label: "Outlook" },
  { domain: "outlook.co.il", type: "microsoft", label: "Outlook" },
  { domain: "nullsto.edu.pl", type: "edu", label: "Edu" },
  { domain: "melbourne.edu.pl", type: "edu", label: "Edu" },
  { domain: "sydney.edu.pl", type: "edu", label: "Edu" },
  { domain: "tokyo.edu.pl", type: "edu", label: "Edu" },
  { domain: "storegmail.net", type: "other", label: "Regular" },
  { domain: "corhash.net", type: "other", label: "Regular" },
  { domain: "eartin.net", type: "other", label: "Regular" },
  { domain: "solerbe.net", type: "other", label: "Regular" },
  { domain: "tumroc.net", type: "other", label: "Regular" },
  { domain: "upsnab.net", type: "other", label: "Regular" },
  { domain: "drewzen.com", type: "other", label: "Regular" },
  { domain: "ewebrus.com", type: "other", label: "Regular" },
  { domain: "odeask.com", type: "other", label: "Regular" },
  { domain: "ofanda.com", type: "other", label: "Regular" },
  { domain: "woopros.com", type: "other", label: "Regular" },
  { domain: "libreok.com", type: "other", label: "Regular" },
  { domain: "webshid.com", type: "other", label: "Regular" },
  { domain: "thewite.com", type: "other", label: "Regular" },
  { domain: "googeb.com", type: "other", label: "Regular" },
  { domain: "inkthe.com", type: "other", label: "Regular" },
  { domain: "bussaco.com", type: "other", label: "Regular" },
  { domain: "momroad.org", type: "other", label: "Regular" },
  { domain: "damphen.org", type: "other", label: "Regular" },
  { domain: "comproa.org", type: "other", label: "Regular" },
  { domain: "brajraj.org", type: "other", label: "Regular" },
  { domain: "tomspal.com", type: "other", label: "Regular" },
  { domain: "amokrun.com", type: "other", label: "Regular" },
  { domain: "bakulab.com", type: "other", label: "Regular" },
  { domain: "sousor.com", type: "other", label: "Regular" },
  { domain: "newszig.com", type: "other", label: "Regular" },
  { domain: "meltcoo.com", type: "other", label: "Regular" },
  { domain: "fordemy.com", type: "other", label: "Regular" },
  { domain: "animoby.com", type: "other", label: "Regular" },
  { domain: "devmant.com", type: "other", label: "Regular" },
  { domain: "appbott.com", type: "other", label: "Regular" },
];

function getBridgeUrl(c: any): string {
  try { return (c.env?.BRIDGE_URL as string) || BRIDGE_URL; } catch { return BRIDGE_URL; }
}

v1Routes.get("/domains", (c) => {
  return c.json({
    domains: DOMAINS.map(d => ({
      ...d,
      id: `${d.type}-${d.domain.replace(/\./g, "-")}`,
      isActive: true,
    })),
    types: ["other", "edu", "google", "microsoft"],
  });
});

v1Routes.post("/create", async (c) => {
  try {
    const { domain } = await c.req.json();
    if (!domain) return c.json({ error: "Domain is required" }, 400);

    const domainInfo = DOMAINS.find(d => d.domain === domain);

    if (domainInfo?.type === "edu") {
      const bridgeUrl = getBridgeUrl(c);
      const bridgeResp = await fetch(`${bridgeUrl}/create-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain }),
      });

      if (!bridgeResp.ok) {
        const err = await bridgeResp.json();
        return c.json({ error: err.error || "Bridge unavailable" }, 502);
      }

      const bridgeData = await bridgeResp.json();
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 86400000);

      const metadata: Record<string, unknown> = {};
      if (bridgeData.secret && bridgeData.id) {
        metadata.nullstoId = bridgeData.id;
        metadata.nullstoSecret = bridgeData.secret;
      }

      const { data, error } = await supabaseQuery("POST", "EmailSession", {
        id: crypto.randomUUID(),
        address: bridgeData.address,
        domain,
        domainType: "edu",
        isActive: true,
        createdAt: now.toISOString(),
        expiredAt: expiresAt.toISOString(),
        keepaliveAt: now.toISOString(),
        metadata: JSON.stringify(metadata),
      });

      if (error || !data?.[0]) {
        return c.json({ error: "Failed to save edu session" }, 500);
      }

      const session = Array.isArray(data) ? data[0] : data;
      return c.json({
        email: {
          address: session.address,
          timestamp: Math.floor(new Date(session.createdAt).getTime() / 1000),
          key: session.id,
          domain: session.domain,
          domainType: "edu",
        },
      });
    }

    const address = `${generateName()}@${domain}`;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 86400000);

    const { data, error } = await supabaseQuery("POST", "EmailSession", {
      id: crypto.randomUUID(),
      address,
      domain,
      domainType: domainInfo?.type || "temp",
      isActive: true,
      createdAt: now.toISOString(),
      expiredAt: expiresAt.toISOString(),
      keepaliveAt: now.toISOString(),
    });

    if (error || !data?.[0]) {
      return c.json({ error: "Failed to create email session" }, 500);
    }

    const session = Array.isArray(data) ? data[0] : data;
    return c.json({
      email: {
        address: session.address,
        timestamp: Math.floor(new Date(session.createdAt).getTime() / 1000),
        key: session.id,
        domain: session.domain,
        domainType: session.domainType,
      },
    });
  } catch (err) {
    console.error("Create error:", err);
    return c.json({ error: "Failed to create email" }, 500);
  }
});

v1Routes.post("/inbox", async (c) => {
  try {
    const { address, key, domain } = await c.req.json();
    let sessionId = key;

    if (!sessionId && address) {
      const path = buildQuery("EmailSession", { address: `eq.${address}`, select: "id,address,isActive,domainType,metadata" });
      const { data: sessions } = await supabaseQuery("GET", path);
      if (Array.isArray(sessions) && sessions.length > 0) {
        const s = sessions[0];
        if (!s.isActive) return c.json({ error: "Session expired" }, 410);
        sessionId = s.id;
      }
    }

    if (!sessionId && domain) {
      const path = buildQuery("EmailSession", { domain: `eq.${domain}`, isActive: `eq.true`, order: "createdAt.desc", limit: "1", select: "id,address,domainType,metadata" });
      const { data: sessions } = await supabaseQuery("GET", path);
      if (Array.isArray(sessions) && sessions.length > 0) {
        sessionId = sessions[0].id;
      }
    }

    if (!sessionId) return c.json({ error: "No active session found" }, 404);

    const sessionPath = buildQuery("EmailSession", { id: `eq.${sessionId}`, select: "id,address,domainType,metadata" });
    const { data: sessionData } = await supabaseQuery("GET", sessionPath);
    const session = Array.isArray(sessionData) && sessionData.length > 0 ? sessionData[0] : null;
    if (!session) return c.json({ error: "Session not found" }, 404);

    if (session.domainType === "edu") {
      let meta: Record<string, unknown> = {};
      try { meta = JSON.parse(session.metadata || "{}"); } catch {}

      const nullstoId = meta.nullstoId as string;
      const nullstoSecret = meta.nullstoSecret as string;

      // If Nullsto metadata exists, use bridge check
      if (nullstoId && nullstoSecret) {
        const bridgeUrl = getBridgeUrl(c);
        const inboxResp = await fetch(`${bridgeUrl}/check-inbox`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            address: session.address,
            id: nullstoId,
            secret: nullstoSecret,
          }),
        });

        if (!inboxResp.ok) {
          return c.json({ error: "Nullsto inbox unavailable" }, 502);
        }

        const inboxData = await inboxResp.json() as { messages?: Array<Record<string, unknown>> };
        const bridgeMessages = inboxData.messages || [];

        // Save messages to DB
        for (const msg of bridgeMessages) {
          const mid = (msg.mid as string) || (msg.id as string) || crypto.randomUUID();
          const existingPath = buildQuery("EmailMessage", { mid: `eq.${mid}`, select: "id" });
          const { data: existing } = await supabaseQuery("GET", existingPath);
          if (Array.isArray(existing) && existing.length > 0) continue;

          await supabaseQuery("POST", "EmailMessage", {
            id: crypto.randomUUID(),
            sessionId,
            mid,
            fromAddress: (msg.from as string) || (msg.fromAddress as string) || "",
            fromName: (msg.fromName as string) || "",
            subject: (msg.subject as string) || "(No Subject)",
            intro: (msg.intro as string) || "",
            body: (msg.body as string) || "",
            bodyHtml: (msg.html as string) || "",
            seen: false,
            starred: false,
            hasAttachments: false,
            receivedAt: new Date().toISOString(),
          });
        }

        const dbPath = buildQuery("EmailMessage", { sessionId: `eq.${sessionId}`, order: "receivedAt.desc", limit: "50" });
        const { data: dbMessages } = await supabaseQuery("GET", dbPath);

        return c.json({
          messages: (Array.isArray(dbMessages) ? dbMessages : []).map(m => {
            const fromName = m.fromName || (m.fromAddress ? m.fromAddress.split("@")[0]
              ?.replace(/[._-]/g, " ")
              .replace(/\b\w/g, (c: string) => c.toUpperCase()) : "") || "Unknown";
            return {
              id: m.mid,
              mid: m.mid,
              from: { address: m.fromAddress, name: fromName },
              to: [{ address: "", name: "" }],
              subject: m.subject || "(No Subject)",
              intro: m.intro || "",
              seen: m.seen,
              isDeleted: false,
              hasAttachments: m.hasAttachments,
              size: 0,
              downloadUrl: null,
              createdAt: m.receivedAt || m.createdAt,
            };
          }),
          count: Array.isArray(dbMessages) ? dbMessages.length : 0,
          address: session.address,
          key: sessionId,
        });
      }

      // Legacy smailpro flow for other edu domains
      const smailproKey = meta.smailproKey as string;
      const smailproTs = meta.smailproTs as number;

      if (!smailproKey || !smailproTs) {
        return c.json({ messages: [], count: 0, address: session.address, key: sessionId });
      }

      const inboxBody = [{ address: session.address, timestamp: smailproTs, key: smailproKey }];
      const inboxResp = await fetch(SMALLPRO_INBOX, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inboxBody),
      });

      if (!inboxResp.ok) {
        return c.json({ error: "Bridge inbox unavailable" }, 502);
      }

      const inboxData = await inboxResp.json() as Array<Record<string, unknown>>;
      if (!Array.isArray(inboxData) || inboxData.length === 0) {
        return c.json({ messages: [], count: 0, address: session.address, key: sessionId });
      }

      const entry = inboxData[0];
      const payload = entry.payload as string;
      const newKey = entry.key as string;

      meta.smailproKey = newKey;
      await supabaseQuery("PATCH", buildQuery("EmailSession", { id: `eq.${sessionId}` }), {
        metadata: JSON.stringify(meta),
      });

      const sonjjResp = await fetch(`${SONJJ_INBOX}?payload=${encodeURIComponent(payload)}`);
      if (!sonjjResp.ok) {
        return c.json({ messages: [], count: 0, address: session.address, key: sessionId });
      }

      const sonjjData = await sonjjResp.json() as { messages?: Array<Record<string, unknown>> };
      const sonjjMessages = sonjjData.messages || [];

      for (const msg of sonjjMessages) {
        const mid = msg.mid as string;
        const existingPath = buildQuery("EmailMessage", { mid: `eq.${mid}`, select: "id" });
        const { data: existing } = await supabaseQuery("GET", existingPath);
        if (Array.isArray(existing) && existing.length > 0) continue;

        await supabaseQuery("POST", "EmailMessage", {
          id: crypto.randomUUID(),
          sessionId,
          mid,
          fromAddress: (msg.from as string) || "",
          fromName: (msg.fromName as string) || "",
          subject: (msg.subject as string) || "(No Subject)",
          intro: (msg.intro as string) || "",
          body: (msg.body as string) || "",
          bodyHtml: (msg.html as string) || "",
          seen: false,
          starred: false,
          hasAttachments: !!(msg.attachments as Array<unknown>)?.length,
          receivedAt: new Date().toISOString(),
        });
      }

      const dbPath = buildQuery("EmailMessage", { sessionId: `eq.${sessionId}`, order: "receivedAt.desc", limit: "50" });
      const { data: dbMessages } = await supabaseQuery("GET", dbPath);

      return c.json({
        messages: (Array.isArray(dbMessages) ? dbMessages : []).map(m => {
          const fromName = m.fromName || (m.fromAddress ? m.fromAddress.split("@")[0]
            ?.replace(/[._-]/g, " ")
            .replace(/\b\w/g, (c: string) => c.toUpperCase()) : "") || "Unknown";
          return {
            id: m.mid,
            mid: m.mid,
            from: { address: m.fromAddress, name: fromName },
            to: [{ address: "", name: "" }],
            subject: m.subject || "(No Subject)",
            intro: m.intro || "",
            seen: m.seen,
            isDeleted: false,
            hasAttachments: m.hasAttachments,
            size: 0,
            downloadUrl: null,
            createdAt: m.receivedAt || m.createdAt,
          };
        }),
        count: Array.isArray(dbMessages) ? dbMessages.length : 0,
        address: session.address,
        key: sessionId,
      });
    }

    const msgPath = buildQuery("EmailMessage", {
      sessionId: `eq.${sessionId}`,
      order: "receivedAt.desc",
      limit: "50",
    });
    const { data: messages } = await supabaseQuery("GET", msgPath);

    return c.json({
      messages: (Array.isArray(messages) ? messages : []).map(m => {
        const fromName = m.fromName || (m.fromAddress ? m.fromAddress.split("@")[0]
          ?.replace(/[._-]/g, " ")
          .replace(/\b\w/g, (c: string) => c.toUpperCase()) : "") || "Unknown";
        return {
          id: m.mid,
          mid: m.mid,
          from: { address: m.fromAddress, name: fromName },
          to: [{ address: "", name: "" }],
          subject: m.subject || "(No Subject)",
          intro: m.intro || "",
          seen: m.seen,
          isDeleted: false,
          hasAttachments: m.hasAttachments,
          size: 0,
          downloadUrl: null,
          createdAt: m.receivedAt || m.createdAt,
        };
      }),
      count: Array.isArray(messages) ? messages.length : 0,
      address: session.address,
      key: sessionId,
    });
  } catch (err) {
    console.error("Inbox error:", err);
    return c.json({ error: "Failed to fetch inbox" }, 500);
  }
});

v1Routes.get("/message/:mid", async (c) => {
  try {
    const mid = c.req.param("mid");
    const path = buildQuery("EmailMessage", {
      mid: `eq.${mid}`,
      select: "*,EmailAttachment(*)",
    });
    const { data: messages } = await supabaseQuery("GET", path);

    if (!Array.isArray(messages) || messages.length === 0) {
      return c.json({ error: "Message not found" }, 404);
    }

    const msg = messages[0];

    await supabaseQuery("PATCH", buildQuery("EmailMessage", { id: `eq.${msg.id}` }), { seen: true });

    const fromName = msg.fromName || (msg.fromAddress ? msg.fromAddress.split("@")[0]
      ?.replace(/[._-]/g, " ")
      .replace(/\b\w/g, (c: string) => c.toUpperCase()) : "") || "Unknown";

    return c.json({
      message: {
        id: msg.mid,
        mid: msg.mid,
        from: { address: msg.fromAddress, name: fromName },
        to: [{ address: "", name: "" }],
        subject: msg.subject || "(No Subject)",
        intro: msg.intro || "",
        seen: true,
        isDeleted: false,
        hasAttachments: msg.hasAttachments,
        size: 0,
        downloadUrl: null,
        createdAt: msg.receivedAt || msg.createdAt,
        text: msg.body || "",
        html: msg.bodyHtml || null,
        attachments: (msg.EmailAttachment || []).map((a: Record<string, unknown>) => ({
          id: a.id,
          filename: a.filename,
          contentType: a.mimeType,
          size: a.size,
          downloadUrl: null,
        })),
      },
    });
  } catch (err) {
    console.error("Message error:", err);
    return c.json({ error: "Failed to fetch message" }, 500);
  }
});

v1Routes.post("/upload", async (c) => {
  try {
    const { sessionKey, filename, mimeType, data: b64data } = await c.req.json();
    if (!sessionKey || !filename || !b64data) return c.json({ error: "sessionKey, filename, and data required" }, 400);

    const binaryStr = atob(b64data);
    const size = binaryStr.length;
    if (size > 10_485_760) return c.json({ error: "File too large (max 10MB)" }, 413);

    const id = crypto.randomUUID();
    const { error } = await supabaseQuery("POST", "EmailAttachment", {
      id,
      messageId: sessionKey,
      filename,
      mimeType: mimeType || "application/octet-stream",
      size,
      data: b64data,
      storageUrl: null,
      createdAt: new Date().toISOString(),
    });

    if (error) return c.json({ error: "Upload failed" }, 500);
    return c.json({ attachment: { id, filename, mimeType: mimeType || "application/octet-stream", size } });
  } catch (err) {
    console.error("Upload error:", err);
    return c.json({ error: "Upload failed" }, 500);
  }
});

v1Routes.get("/uploads/:sessionId", async (c) => {
  try {
    const sessionId = c.req.param("sessionId");
    const path = buildQuery("EmailAttachment", { messageId: `eq.${sessionId}`, order: "createdAt.desc" });
    const { data } = await supabaseQuery("GET", path);
    return c.json({
      attachments: (Array.isArray(data) ? data : []).map((a: Record<string, unknown>) => ({
        id: a.id,
        filename: a.filename,
        mimeType: a.mimeType,
        size: a.size,
        createdAt: a.createdAt,
      })),
    });
  } catch (err) {
    console.error("List uploads error:", err);
    return c.json({ error: "Failed to list uploads" }, 500);
  }
});

v1Routes.delete("/uploads/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await supabaseQuery("DELETE", buildQuery("EmailAttachment", { id: `eq.${id}` }));
    return c.json({ status: "ok" });
  } catch (err) {
    console.error("Delete upload error:", err);
    return c.json({ error: "Failed to delete upload" }, 500);
  }
});

v1Routes.get("/keepalive", async (c) => {
  try {
    const key = c.req.query("key") || c.req.query("address");
    if (!key) return c.json({ error: "Key or address required" }, 400);

    const { data } = await supabaseQuery("PATCH", buildQuery("EmailSession", { id: `eq.${key}` }), {
      keepaliveAt: new Date().toISOString(),
      expiredAt: new Date(Date.now() + 86400000).toISOString(),
    });

    if (!data) return c.json({ error: "Session not found" }, 404);
    return c.json({ status: "ok" });
  } catch (err) {
    console.error("Keepalive error:", err);
    return c.json({ error: "Keepalive failed" }, 500);
  }
});

v1Routes.get("/mt-domains", async (c) => {
  try {
    const resp = await fetch("https://api.mail.tm/domains");
    const data = await resp.json();
    return c.json(data);
  } catch {
    return c.json({ domains: DOMAINS.map(d => ({ domain: d.domain, type: d.type })) });
  }
});

v1Routes.post("/mt-account", async (c) => {
  try {
    const body = await c.req.json();
    const resp = await fetch("https://api.mail.tm/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await resp.json();
    return c.json(data, resp.status);
  } catch (err) {
    console.error("MT account error:", err);
    return c.json({ error: "Failed to create account" }, 500);
  }
});

function generateName(): string {
  const adjs = ["happy","sunny","cool","fast","wise","brave","calm","dark","eager","fancy","gold","keen","lazy","neat","odd","proud","rich","shy","tiny","vivid","wild","young","bold","cosy","deep","epic","fair","glad","huge","idle","jade","kind","lite","mild"];
  const nouns = ["tiger","eagle","panda","dolphin","falcon","heron","jaguar","koala","lemur","otter","pilot","raven","snake","talon","viper","whale","zebra","bison","crane","drake","finch","gecko","hound","joker","kraken","lunar","mantis","nova","orbit","pulse","quark","ridge","stone","thunder","valley"];
  const adj = adjs[Math.floor(Math.random() * adjs.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adj}${noun}${Math.floor(Math.random() * 9999)}`;
}
