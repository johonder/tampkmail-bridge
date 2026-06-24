import { Hono } from "hono";
import { supabaseQuery, buildQuery } from "../lib/db";
import { authMiddleware } from "../middleware/auth";

export const apiKeyRoutes = new Hono();

apiKeyRoutes.use("*", authMiddleware);

apiKeyRoutes.get("/", async (c) => {
  try {
    const user = c.get("user");
    const path = buildQuery("ApiKey", {
      userId: `eq.${user.userId}`,
      order: "createdAt.desc",
    });
    const { data } = await supabaseQuery("GET", path);
    return c.json({
      keys: (Array.isArray(data) ? data : []).map(k => ({ ...k, key: maskKey(k.key) }))
    });
  } catch {
    return c.json({ error: "Failed to fetch keys" }, 500);
  }
});

apiKeyRoutes.post("/", async (c) => {
  try {
    const user = c.get("user");
    const { label, permissions, rateLimit } = await c.req.json();
    if (!label) return c.json({ error: "Label is required" }, 400);

    const key = `tmp_${generateKey()}`;
    const { data, error } = await supabaseQuery("POST", "ApiKey", {
      key,
      label,
      email: user.email,
      rateLimit: rateLimit || 60,
      active: true,
    });

    if (error) return c.json({ error: "Failed to create key" }, 500);
    const created = Array.isArray(data) ? data[0] : data;
    return c.json({
      id: created.id,
      label: created.label,
      key,
      permissions: created.permissions,
      rateLimit: created.rate_limit,
      createdAt: created.created_at,
    });
  } catch {
    return c.json({ error: "Failed to create key" }, 500);
  }
});

apiKeyRoutes.delete("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const user = c.get("user");
    const path = buildQuery("ApiKey", {
      id: `eq.${id}`,
      userId: `eq.${user.userId}`,
    });
    await supabaseQuery("DELETE", path);
    return c.json({ success: true });
  } catch {
    return c.json({ error: "Failed to delete key" }, 500);
  }
});

apiKeyRoutes.patch("/:id/toggle", async (c) => {
  try {
    const id = c.req.param("id");
    const user = c.get("user");
    const { data: keys } = await supabaseQuery("GET", buildQuery("ApiKey", {
      id: `eq.${id}`, userId: `eq.${user.userId}`, select: "active",
    }));
    const existing = Array.isArray(keys) && keys.length > 0 ? keys[0] : null;
    if (!existing) return c.json({ error: "Key not found" }, 404);

    const { data } = await supabaseQuery("PATCH", buildQuery("ApiKey", {
      id: `eq.${id}`, userId: `eq.${user.userId}`,
    }), { active: !existing.active });
    return c.json(Array.isArray(data) ? data[0] : data || {});
  } catch {
    return c.json({ error: "Failed to toggle key" }, 500);
  }
});

function generateKey(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length: 32 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function maskKey(key: string): string {
  if (key.length <= 8) return key;
  return key.slice(0, 4) + "****" + key.slice(-4);
}
