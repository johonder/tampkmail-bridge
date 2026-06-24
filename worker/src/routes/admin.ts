import { Hono } from "hono";
import { supabaseQuery, buildQuery } from "../lib/db";
import { adminMiddleware } from "../middleware/auth";

export const adminRoutes = new Hono();

adminRoutes.use("*", adminMiddleware);

adminRoutes.get("/dashboard", async (c) => {
  try {
    const [users, emails, sessions] = await Promise.all([
      supabaseQuery("GET", buildQuery("User", { select: "id", limit: "1" })),
      supabaseQuery("GET", buildQuery("EmailMessage", { select: "id", limit: "1" })),
      supabaseQuery("GET", buildQuery("EmailSession", { select: "id", limit: "1" })),
    ]);

    return c.json({
      totalUsers: Array.isArray(users.data) ? users.data.length : 0,
      totalEmails: Array.isArray(emails.data) ? emails.data.length : 0,
      totalSessions: Array.isArray(sessions.data) ? sessions.data.length : 0,
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    return c.json({ error: "Failed to fetch dashboard" }, 500);
  }
});

adminRoutes.get("/users", async (c) => {
  try {
    const path = buildQuery("User", { order: "createdAt.desc" });
    const { data } = await supabaseQuery("GET", path);
    return c.json({ users: Array.isArray(data) ? data : [] });
  } catch {
    return c.json({ error: "Failed to fetch users" }, 500);
  }
});

adminRoutes.get("/users/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const { data: users } = await supabaseQuery("GET", buildQuery("User", { id: `eq.${id}`, select: "*" }));
    const user = Array.isArray(users) && users.length > 0 ? users[0] : null;
    if (!user) return c.json({ error: "User not found" }, 404);
    return c.json(user);
  } catch {
    return c.json({ error: "Failed to fetch user" }, 500);
  }
});

adminRoutes.patch("/users/:id/suspend", async (c) => {
  try {
    const id = c.req.param("id");
    const { suspended } = await c.req.json();
    const { data } = await supabaseQuery("PATCH", buildQuery("User", { id: `eq.${id}` }), {
      suspended,
      updatedAt: new Date().toISOString(),
    });
    return c.json(Array.isArray(data) ? data[0] : data || {});
  } catch {
    return c.json({ error: "Failed to update user" }, 500);
  }
});

adminRoutes.get("/api-keys", async (c) => {
  try {
    const path = buildQuery("ApiKey", { order: "createdAt.desc" });
    const { data } = await supabaseQuery("GET", path);
    return c.json({ keys: Array.isArray(data) ? data : [] });
  } catch {
    return c.json({ error: "Failed to fetch keys" }, 500);
  }
});

adminRoutes.get("/sessions", async (c) => {
  try {
    const path = buildQuery("EmailSession", { order: "createdAt.desc", limit: "100" });
    const { data } = await supabaseQuery("GET", path);
    return c.json({ sessions: Array.isArray(data) ? data : [] });
  } catch {
    return c.json({ error: "Failed to fetch sessions" }, 500);
  }
});

adminRoutes.get("/emails", async (c) => {
  try {
    const path = buildQuery("EmailMessage", { order: "createdAt.desc", limit: "100" });
    const { data } = await supabaseQuery("GET", path);
    return c.json({ emails: Array.isArray(data) ? data : [] });
  } catch {
    return c.json({ error: "Failed to fetch emails" }, 500);
  }
});

adminRoutes.get("/uploads", async (c) => {
  try {
    const path = buildQuery("EmailAttachment", { order: "createdAt.desc", limit: "100" });
    const { data } = await supabaseQuery("GET", path);
    return c.json({
      uploads: (Array.isArray(data) ? data : []).map((a: Record<string, unknown>) => ({
        id: a.id,
        filename: a.filename,
        mimeType: a.mimeType,
        size: a.size,
        createdAt: a.createdAt,
      })),
    });
  } catch {
    return c.json({ error: "Failed to fetch uploads" }, 500);
  }
});

adminRoutes.delete("/uploads/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await supabaseQuery("DELETE", buildQuery("EmailAttachment", { id: `eq.${id}` }));
    return c.json({ status: "ok" });
  } catch {
    return c.json({ error: "Failed to delete upload" }, 500);
  }
});

adminRoutes.get("/pool-accounts", async (c) => {
  try {
    const path = buildQuery("PoolAccount", { order: "createdAt.desc" });
    const { data } = await supabaseQuery("GET", path);
    return c.json({
      accounts: (Array.isArray(data) ? data : []).map((a: Record<string, unknown>) => ({
        id: a.id,
        email: a.email,
        type: a.type,
        server: a.server,
        active: a.active,
        inUse: a.inUse,
        lastUsedAt: a.lastUsedAt,
        createdAt: a.createdAt,
        expiresAt: a.expiresAt,
      })),
    });
  } catch {
    return c.json({ error: "Failed to fetch pool accounts" }, 500);
  }
});

adminRoutes.post("/pool-accounts", async (c) => {
  try {
    const { email, type, password, server } = await c.req.json();
    if (!email || !type || !password) return c.json({ error: "email, type, password required" }, 400);

    const now = new Date().toISOString();
    const { data, error } = await supabaseQuery("POST", "PoolAccount", {
      id: crypto.randomUUID(),
      email,
      type,
      credentials: JSON.stringify({ password }),
      server: server || (type === "google" ? "imap.gmail.com" : "outlook.office365.com"),
      active: true,
      inUse: false,
      createdAt: now,
      lastUsedAt: null,
      expiresAt: null,
      refreshToken: null,
    });

    if (error) return c.json({ error: "Failed to create pool account" }, 500);
    const created = Array.isArray(data) ? data[0] : data;
    return c.json({
      account: {
        id: created.id,
        email: created.email,
        type: created.type,
        server: created.server,
        active: created.active,
        createdAt: created.createdAt,
      },
    });
  } catch (err) {
    console.error("Create pool account error:", err);
    return c.json({ error: "Failed to create pool account" }, 500);
  }
});

adminRoutes.delete("/pool-accounts/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await supabaseQuery("DELETE", buildQuery("PoolAccount", { id: `eq.${id}` }));
    return c.json({ status: "ok" });
  } catch {
    return c.json({ error: "Failed to delete pool account" }, 500);
  }
});

adminRoutes.patch("/pool-accounts/:id/toggle", async (c) => {
  try {
    const id = c.req.param("id");
    const { data: accounts } = await supabaseQuery("GET", buildQuery("PoolAccount", { id: `eq.${id}`, select: "active" }));
    const account = Array.isArray(accounts) && accounts.length > 0 ? accounts[0] : null;
    if (!account) return c.json({ error: "Account not found" }, 404);
    
    await supabaseQuery("PATCH", buildQuery("PoolAccount", { id: `eq.${id}` }), {
      active: !account.active,
    });
    return c.json({ status: "ok", active: !account.active });
  } catch {
    return c.json({ error: "Failed to toggle account" }, 500);
  }
});
