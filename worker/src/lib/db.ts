const SUPABASE_URL = "https://xszyfsvrohjqdseywcet.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhzenlmc3Zyb2hqcWRzZXl3Y2V0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjIxNzg5OSwiZXhwIjoyMDk3NzkzODk5fQ.us_Ux5bS2SOiuVwEcwzwRt8DzpxHBbKbfENjsNV4IXw";

export async function supabaseQuery(method: string, path: string, body?: unknown) {
  const url = `${SUPABASE_URL}/rest/v1/${path}`;
  const headers: Record<string, string> = {
    "apikey": SUPABASE_KEY,
    "Authorization": `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json",
    "Prefer": "return=representation",
  };

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  try {
    return { data: text ? JSON.parse(text) : null, error: null, status: res.status };
  } catch {
    return { data: null, error: text, status: res.status };
  }
}

export function buildQuery(path: string, query?: Record<string, string>) {
  if (!query) return path;
  const params = new URLSearchParams(query);
  return `${path}?${params.toString()}`;
}
