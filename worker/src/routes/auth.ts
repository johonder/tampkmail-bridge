import { Hono } from "hono";
import { supabaseQuery, buildQuery } from "../lib/db";
import { signToken, authMiddleware } from "../middleware/auth";

export const authRoutes = new Hono();

authRoutes.post("/register", async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    if (!email || !password) return c.json({ error: "Email and password required" }, 400);

    const { data: existing } = await supabaseQuery("GET", buildQuery("User", { email: `eq.${email}`, select: "id" }));
    if (Array.isArray(existing) && existing.length > 0) {
      return c.json({ error: "Email already registered" }, 409);
    }

    const now = new Date().toISOString();
    const passwordHash = await hashPassword(password);
    const { data, error } = await supabaseQuery("POST", "User", {
      id: crypto.randomUUID(),
      email,
      passwordHash: passwordHash,
      name: name || email.split("@")[0],
      role: "user",
      createdAt: now,
      updatedAt: now,
    });

    if (error) return c.json({ error: "Registration failed" }, 500);
    const user = Array.isArray(data) ? data[0] : data;
    if (!user) return c.json({ error: "Registration failed" }, 500);

    const token = await signToken({ userId: user.id, email: user.email, role: user.role });
    return c.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (err) {
    console.error("Register error:", err);
    return c.json({ error: "Registration failed" }, 500);
  }
});

authRoutes.post("/login", async (c) => {
  try {
    const { email, password } = await c.req.json();
    if (!email || !password) return c.json({ error: "Email and password required" }, 400);

    const { data: users } = await supabaseQuery("GET", buildQuery("User", { email: `eq.${email}`, select: "*" }));
    const user = Array.isArray(users) && users.length > 0 ? users[0] : null;
    if (!user) return c.json({ error: "Invalid credentials" }, 401);

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) return c.json({ error: "Invalid credentials" }, 401);

    const token = await signToken({ userId: user.id, email: user.email, role: user.role });
    return c.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (err) {
    console.error("Login error:", err);
    return c.json({ error: "Login failed" }, 500);
  }
});

authRoutes.get("/me", authMiddleware, async (c) => {
  const user = c.get("user");
  const { data: users } = await supabaseQuery("GET", buildQuery("User", { id: `eq.${user.userId}`, select: "*" }));
  const u = Array.isArray(users) && users.length > 0 ? users[0] : null;
  if (!u) return c.json({ error: "User not found" }, 404);
  return c.json({ id: u.id, email: u.email, name: u.name, role: u.role });
});

async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(password + "tampkemail-salt");
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return (await hashPassword(password)) === hash;
}
