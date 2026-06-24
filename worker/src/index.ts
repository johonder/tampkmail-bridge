import { Hono } from "hono";
import { cors } from "hono/cors";
import { jwt } from "hono/jwt";
import { v1Routes } from "./routes/v1";
import { authRoutes } from "./routes/auth";
import { adminRoutes } from "./routes/admin";
import { webhookRoutes } from "./routes/webhook";
import { apiKeyRoutes } from "./routes/api-keys";

const app = new Hono();

app.use("*", cors({
  origin: ["https://tampkemail.pages.dev", "http://localhost:5173", "http://localhost:3000"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
  exposeHeaders: ["Content-Length"],
  maxAge: 86400,
}));

app.get("/", (c) => c.json({ name: "TampKemail API", version: "1.0.0", status: "ok" }));
app.get("/health", (c) => c.json({ status: "ok", timestamp: new Date().toISOString() }));

app.route("/api/v1", v1Routes);
app.route("/api/auth", authRoutes);
app.route("/api/admin", adminRoutes);
app.route("/api/webhook", webhookRoutes);
app.route("/api/keys", apiKeyRoutes);

app.notFound((c) => c.json({ error: "Not found" }, 404));

app.onError((err, c) => {
  console.error("Unhandled error:", err);
  return c.json({ error: "Internal server error" }, 500);
});

export default app;
