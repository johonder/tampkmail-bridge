const API_BASE = (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL)
  || "https://tampkemail-api.miraz-help.workers.dev";

export const FRONTEND_URL = "https://tampkemail-frontend.miraz-help.workers.dev";

export async function api(path: string, options?: RequestInit) {
  const url = `${API_BASE}${path}`;
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(url, { ...options, headers });
  if (res.status === 401 && typeof window !== "undefined") {
    localStorage.removeItem("auth_token");
  }
  return res;
}

export function setApiBase(url: string) {
  Object.assign(API_BASE_REF, { value: url });
}

const API_BASE_REF = { value: API_BASE };
export { API_BASE_REF };
