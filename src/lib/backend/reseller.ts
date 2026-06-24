import { db } from "./db";
import { generateApiKey, getEmailTypes, getDomainType } from "./core";

export interface ResellerRateLimit {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export async function verifyApiKey(key: string): Promise<{ valid: boolean; apiKeyId?: string; error?: string }> {
  if (!key || key.length < 10) {
    return { valid: false, error: "Invalid API key format" };
  }

  const record = await db.apiKey.findUnique({
    where: { key },
  });

  if (!record) {
    return { valid: false, error: "API key not found" };
  }

  if (!record.active) {
    return { valid: false, error: "API key is disabled" };
  }

  await db.apiKey.update({
    where: { id: record.id },
    data: { lastUsedAt: new Date(), usageCount: { increment: 1 } },
  });

  return { valid: true, apiKeyId: record.id };
}

export async function checkRateLimit(
  apiKeyId: string,
  maxRequests: number = 60,
  windowSeconds: number = 60
): Promise<ResellerRateLimit> {
  const windowStart = new Date(Date.now() - windowSeconds * 1000);

  const count = await db.usageRecord.count({
    where: {
      apiKeyId,
      createdAt: { gte: windowStart },
    },
  });

  const resetAt = Math.floor(windowStart.getTime() / 1000) + windowSeconds;

  return {
    allowed: count < maxRequests,
    remaining: Math.max(0, maxRequests - count),
    resetAt,
  };
}

export async function logUsage(
  apiKeyId: string,
  action: string,
  email?: string,
  ip?: string
): Promise<void> {
  await db.usageRecord.create({
    data: { apiKeyId, action, email, ip },
  });
}

export async function createResellerKey(
  label: string,
  email?: string,
  rateLimit?: number,
  domainAccess?: string[]
): Promise<{ key: string; id: string }> {
  const apiKey = generateApiKey();

  const record = await db.apiKey.create({
    data: {
      key: apiKey,
      label,
      email,
      rateLimit: rateLimit || 60,
    },
  });

  if (domainAccess && domainAccess.length > 0) {
    for (const domain of domainAccess) {
      await db.domainAccess.create({
        data: {
          apiKeyId: record.id,
          domain,
        },
      });
    }
  }

  return { key: apiKey, id: record.id };
}

export async function listResellerKeys(): Promise<Array<{
  id: string;
  label: string;
  key: string;
  email: string | null;
  active: boolean;
  usageCount: number;
  lastUsedAt: Date | null;
  createdAt: Date;
}>> {
  return db.apiKey.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function revokeApiKey(id: string): Promise<boolean> {
  try {
    await db.apiKey.update({
      where: { id },
      data: { active: false },
    });
    return true;
  } catch {
    return false;
  }
}

export async function getResellerStats(apiKeyId: string): Promise<{
  totalEmails: number;
  totalMessages: number;
  recentActivity: Array<{ action: string; email: string | null; createdAt: Date }>;
}> {
  const recentActivity = await db.usageRecord.findMany({
    where: { apiKeyId },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const totalEmails = await db.usageRecord.count({
    where: { apiKeyId, action: "create" },
  });

  const totalMessages = await db.usageRecord.count({
    where: { apiKeyId, action: { in: ["inbox", "message"] } },
  });

  return { totalEmails, totalMessages, recentActivity };
}
