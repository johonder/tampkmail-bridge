import { db } from "./db";

export interface IncomingEmail {
  from: string;
  to: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    contentType: string;
    size: number;
    data: string;
  }>;
}

export async function processIncomingEmail(email: IncomingEmail): Promise<{ success: boolean; sessionId?: string; messageId?: string }> {
  try {
    const toLocal = email.to.toLowerCase().trim();
    const parts = toLocal.split("@");
    if (parts.length !== 2) return { success: false };

    const local = parts[0];
    const domain = parts[1];

    let session = await db.emailSession.findUnique({
      where: { address: toLocal },
    });

    if (!session) {
      session = await db.emailSession.findFirst({
        where: {
          address: { contains: `@${domain}` },
          isActive: true,
          expiredAt: null,
        },
      });
    }

    if (!session) {
      const wildcardSession = await db.emailSession.findFirst({
        where: {
          domain,
          isActive: true,
        },
        orderBy: { createdAt: "desc" },
      });

      if (!wildcardSession) return { success: false };
      session = wildcardSession;
    }

    if (session.address !== email.to) {
      const newSession = await db.emailSession.create({
        data: {
          address: email.to,
          domain: session.domain,
          domainType: session.domainType,
          isActive: true,
        },
      });
      session = newSession;
    }

    const subject = email.subject || "(No Subject)";
    const isHtml = !!(email.html && email.html.trim().length > 0);
    const body = isHtml ? email.html! : email.text || "";
    const mid = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const message = await db.emailMessage.create({
      data: {
        sessionId: session.id,
        mid,
        fromAddress: email.from,
        fromName: email.from.split("@")[0]?.replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()).trim() || "Unknown",
        subject,
        intro: body.replace(/<[^>]*>/g, "").slice(0, 200).trim(),
        body: isHtml ? "" : body,
        bodyHtml: isHtml ? body : null,
        hasAttachments: !!(email.attachments && email.attachments.length > 0),
        receivedAt: new Date(),
      },
    });

    if (email.attachments && email.attachments.length > 0) {
      for (const att of email.attachments) {
        await db.emailAttachment.create({
          data: {
            messageId: message.id,
            filename: att.filename,
            mimeType: att.contentType,
            size: att.size,
          },
        });
      }
    }

    return { success: true, sessionId: session.id, messageId: message.id };
  } catch (err) {
    console.error("[webhook] process error:", err);
    return { success: false };
  }
}

export async function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string
): Promise<boolean> {
  if (!secret) return true;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );
  const expectedSig = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(body)
  );
  const expectedHex = Array.from(new Uint8Array(expectedSig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return signature === expectedHex;
}
