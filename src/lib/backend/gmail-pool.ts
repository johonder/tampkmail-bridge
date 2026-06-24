import { db } from "./db";

export interface GmailCredentials {
  email: string;
  accessToken: string;
  refreshToken: string;
  clientId: string;
  clientSecret: string;
}

export interface GmailMessage {
  id: string;
  threadId: string;
  from: string;
  to: string;
  subject: string;
  date: string;
  body: string;
  bodyHtml?: string;
}

export class GmailPoolManager {
  private accounts: Map<string, GmailCredentials> = new Map();

  async initialize(): Promise<void> {
    const poolAccounts = await db.poolAccount.findMany({
      where: { type: "gmail", active: true },
    });

    for (const account of poolAccounts) {
      try {
        const creds: GmailCredentials = JSON.parse(account.credentials);
        this.accounts.set(account.email, creds);
      } catch {
        console.error(`[gmail-pool] invalid credentials for ${account.email}`);
      }
    }

    console.log(`[gmail-pool] initialized with ${this.accounts.size} accounts`);
  }

  async getAvailableAccount(): Promise<GmailCredentials | null> {
    const account = await db.poolAccount.findFirst({
      where: { type: "gmail", active: true, inUse: false },
      orderBy: { lastUsedAt: "asc" },
    });

    if (!account) return null;

    try {
      const creds: GmailCredentials = JSON.parse(account.credentials);
      await db.poolAccount.update({
        where: { id: account.id },
        data: { inUse: true, lastUsedAt: new Date() },
      });
      return creds;
    } catch {
      return null;
    }
  }

  async releaseAccount(email: string): Promise<void> {
    await db.poolAccount.update({
      where: { email },
      data: { inUse: false },
    });
  }

  async fetchInbox(creds: GmailCredentials): Promise<GmailMessage[]> {
    try {
      const res = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=20&q=is:unread`,
        {
          headers: {
            Authorization: `Bearer ${creds.accessToken}`,
          },
        }
      );

      if (!res.ok) {
        if (res.status === 401) {
          const refreshed = await this.refreshAccessToken(creds);
          if (refreshed) return this.fetchInbox(creds);
        }
        return [];
      }

      const data = await res.json();
      const messages: GmailMessage[] = [];

      for (const msg of data.messages || []) {
        const detail = await this.fetchMessage(creds, msg.id);
        if (detail) messages.push(detail);
      }

      return messages;
    } catch {
      return [];
    }
  }

  async fetchMessage(creds: GmailCredentials, messageId: string): Promise<GmailMessage | null> {
    try {
      const res = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`,
        {
          headers: { Authorization: `Bearer ${creds.accessToken}` },
        }
      );

      if (!res.ok) return null;
      const data = await res.json();

      let subject = "";
      let from = "";
      let to = "";
      let date = "";
      let body = "";
      let bodyHtml = "";

      for (const header of data.payload?.headers || []) {
        if (header.name === "Subject") subject = header.value;
        if (header.name === "From") from = header.value;
        if (header.name === "To") to = header.value;
        if (header.name === "Date") date = header.value;
      }

      const parts = data.payload?.parts || [data.payload];
      for (const part of parts) {
        if (part.mimeType === "text/plain" && part.body?.data) {
          body = Buffer.from(part.body.data, "base64").toString("utf-8");
        } else if (part.mimeType === "text/html" && part.body?.data) {
          bodyHtml = Buffer.from(part.body.data, "base64").toString("utf-8");
        }
      }

      return { id: data.id, threadId: data.threadId, from, to, subject, date, body, bodyHtml };
    } catch {
      return null;
    }
  }

  private async refreshAccessToken(creds: GmailCredentials): Promise<boolean> {
    try {
      const res = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: creds.clientId,
          client_secret: creds.clientSecret,
          refresh_token: creds.refreshToken,
          grant_type: "refresh_token",
        }),
      });

      if (!res.ok) return false;
      const data = await res.json();
      creds.accessToken = data.access_token;

      await db.poolAccount.update({
        where: { email: creds.email },
        data: { credentials: JSON.stringify(creds) },
      });

      return true;
    } catch {
      return false;
    }
  }

  async createEmailForSession(domain: string): Promise<string | null> {
    const account = await this.getAvailableAccount();
    if (!account) return null;

    const local = Array.from({ length: 10 }, () =>
      "abcdefghijklmnopqrstuvwxyz0123456789".charAt(Math.floor(Math.random() * 36))
    ).join("");

    const address = `${local}@${domain}`;
    return address;
  }
}

export const gmailPool = new GmailPoolManager();
