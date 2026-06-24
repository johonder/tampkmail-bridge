import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "dev-secret-change-in-production-min-32-chars!!"
);

export interface BackendConfig {
  name: string;
  version: string;
  supportEmail: string;
  sessionTTL: number;
  keepaliveInterval: number;
  webhookSecret: string;
}

export const config: BackendConfig = {
  name: "TempMail API",
  version: "1.0.0",
  supportEmail: process.env.SUPPORT_EMAIL || "support@example.com",
  sessionTTL: parseInt(process.env.SESSION_TTL || "86400"),
  keepaliveInterval: parseInt(process.env.KEEPALIVE_INTERVAL || "300"),
  webhookSecret: process.env.WEBHOOK_SECRET || "change-me",
};

export interface JwtPayload {
  email: string;
  domain: string;
  domainType: string;
  exp?: number;
}

export async function signToken(payload: JwtPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(`${config.sessionTTL}s`)
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JwtPayload;
  } catch {
    return null;
  }
}

export function generateApiKey(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let key = "tmp_";
  for (let i = 0; i < 40; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

export function generateEmailAddress(domain: string): string {
  const adj = ["swift","bright","cool","quick","fresh","neon","cyber","star","nova","pixel","cloud","wave","blaze","frost","solar","lunar","turbo","hyper","ultra","mega","rapid","prime","elite","super","alpha","beta","gamma","delta","omega","zero","nova","cosmo","astro","flux","surge","spark","glow","beacon","cipher","forge"];
  const noun = ["fox","wolf","hawk","bear","lion","eagle","tiger","shark","raven","cobra","panda","owl","falcon","panther","lynx","jaguar","phoenix","dragon","viper","orca","bison","crane","elm","oak","pulse","vertex","nexus","aegis","lens","core","vault","peak","ridge","valley","creek","stone","forge","grove"];
  const local = `${adj[Math.floor(Math.random() * adj.length)]}${noun[Math.floor(Math.random() * noun.length)]}${Math.floor(Math.random() * 9000 + 1000)}`;
  return `${local}@${domain}`;
}

export function getDomainType(domain: string): string {
  if (["gmail.com","googlemail.com"].includes(domain)) return "google";
  if (["outlook.com","hotmail.com","outlook.kr","outlook.fr","outlook.com.vn",
       "outlook.co.id","outlook.co.th","outlook.com.ar","outlook.co.il"].includes(domain)) return "microsoft";
  if (["melbourne.edu.pl","sydney.edu.pl","tokyo.edu.pl"].includes(domain)) return "edu";
  return "other";
}

export function getEmailTypes(): string[] {
  return ["other", "edu", "google", "microsoft"];
}

export function isGoogleDomain(domain: string): boolean {
  return ["gmail.com","googlemail.com"].includes(domain);
}

export function isMicrosoftDomain(domain: string): boolean {
  return ["outlook.com","hotmail.com","outlook.kr","outlook.fr","outlook.com.vn",
          "outlook.co.id","outlook.co.th","outlook.com.ar","outlook.co.il"].includes(domain);
}

export function isRegularDomain(domain: string): boolean {
  return !isGoogleDomain(domain) && !isMicrosoftDomain(domain);
}

export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const masked = local.length > 3
    ? local.slice(0, 3) + "***"
    : local.slice(0, 1) + "***";
  return `${masked}@${domain}`;
}
