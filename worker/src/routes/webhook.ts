import { Hono } from "hono";
import { supabaseQuery, buildQuery } from "../lib/db";

export const webhookRoutes = new Hono();

webhookRoutes.post("/incoming", async (c) => {
  try {
    const contentType = c.req.header("content-type") || "";
    let from = "", to = "", subject = "", text = "", html = "";

    if (contentType.includes("multipart/form-data")) {
      const form = await c.req.parseBody();
      from = (form.from as string) || "";
      to = (form.to as string) || "";
      subject = (form.subject as string) || "";
      text = (form.text as string) || "";
      html = (form.html as string) || "";
    } else {
      const json = await c.req.json();
      from = json.from || json.sender || json.From || "";
      to = json.to || json.recipient || json.To || "";
      subject = json.subject || json.Subject || "";
      text = json.text || json.strippedText || json["stripped-text"] || "";
      html = json.html || json.strippedHtml || json["stripped-html"] || "";
    }

    if (!to) return c.json({ error: "Recipient required" }, 400);
    const emailAddr = to.includes("@") ? to.toLowerCase() : to;

    const { data: sessions } = await supabaseQuery("GET",
      buildQuery("EmailSession", { address: `eq.${emailAddr}`, select: "id" }));
    const session = Array.isArray(sessions) && sessions.length > 0 ? sessions[0] : null;
    if (!session) return c.json({ error: "No session found" }, 404);

    const mid = `ext-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    await supabaseQuery("POST", "EmailMessage", {
      id: crypto.randomUUID(),
      sessionId: session.id,
      mid,
      fromAddress: from,
      fromName: from.split("@")[0] || from,
      subject: subject || "(No Subject)",
      intro: text?.slice(0, 150) || "",
      body: text || "",
      bodyHtml: html || "",
      seen: false,
      starred: false,
      hasAttachments: false,
    });

    return c.json({ status: "ok", messageId: mid });
  } catch (err) {
    console.error("Webhook error:", err);
    return c.json({ error: "Webhook failed" }, 500);
  }
});
