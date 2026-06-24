import { db } from "./db";

export interface OutlookCredentials {
  email: string;
  accessToken: string;
  refreshToken: string;
  clientId: string;
  clientSecret: string;
  tenantId?: string;
}

export interface OutlookMessage {
  id: string;
  from: string;
  to: string;
  subject: string;
  date: string;
  body: string;
  bodyHtml?: string;
}

export class OutlookPoolManager {
  private accounts: Map<string, OutlookCredentials> = new Map();

  async initialize(): Promise<void> {
    const poolAccounts = await db.poolAccount.findMany({
      where: { type: "outlook", active: true },
    });

    for (const account of poolAccounts) {
      try {
        const creds: OutlookCredentials = JSON.parse(account.credentials);
        this.accounts.set(account.email, creds);
      } catch {
        console.error(`[outlook-pool] invalid credentials for ${account.email}`);
      }
    }

    console.log(`[outlook-pool] initialized with ${this.accounts.size} accounts`);
  }

  async getAvailableAccount(): Promise<OutlookCredentials | null> {
    const account = await db.poolAccount.findFirst({
      where: { type: "outlook", active: true, inUse: false },
      orderBy: { lastUsedAt: "asc" },
    });

    if (!account) return null;

    try {
      const creds: OutlookCredentials = JSON.parse(account.credentials);
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

  async fetchInbox(creds: OutlookCredentials): Promise<OutlookMessage[]> {
    try {
      const res = await fetch(
        `https://graph.microsoft.com/v1.0/me/mailFolders/Inbox/messages?$top=20&$filter=isRead eq false&$orderby=receivedDateTime desc`,
        {
          headers: {
            Authorization: `Bearer ${creds.accessToken}`,
            Prefer: 'outlook.body-content-type="text"',
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
      return (data.value || []).map((msg: Record<string, unknown>) => ({
        id: msg.id as string,
        from: (msg.from?.emailAddress?.address as string) || "",
        to: (msg.toRecipients?.[0]?.emailAddress?.address as string) || "",
        subject: (msg.subject as string) || "",
        date: (msg.receivedDateTime as string) || "",
        body: (msg.body?.content as string) || "",
        bodyHtml: "",
      }));
    } catch {
      return [];
    }
  }

  private async refreshAccessToken(creds: OutlookCredentials): Promise<boolean> {
    const tenant = creds.tenantId || "common";
    try {
      const res = await fetch(
        `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`,
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id: creds.clientId,
            client_secret: creds.clientSecret,
            refresh_token: creds.refreshToken,
            grant_type: "refresh_token",
            scope: "https://graph.microsoft.com/Mail.Read",
          }),
        }
      );

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
    const local = Array.from({ length: 10 }, () =>
      "abcdefghijklmnopqrstuvwxyz0123456789".charAt(Math.floor(Math.random() * 36))
    ).join("");
    return `${local}@${domain}`;
  }
}

export const outlookPool = new OutlookPoolManager();
