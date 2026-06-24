const MIME_TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
};

async function handleRequest(event: FetchEvent): Promise<Response> {
  const request = event.request;
  const url = new URL(request.url);
  let path = url.pathname;
  
  if (path === "/") path = "/index.html";
  
  try {
    const ns = (self as any)['FRONTEND_KV'];
    if (!ns) {
      return new Response("KV not bound", { status: 500 });
    }
    
    const val = await ns.get(path.substring(1), "arrayBuffer");
    
    if (val === null) {
      const index = await ns.get("index.html", "arrayBuffer");
      if (!index) {
        return new Response("Not Found", { status: 404 });
      }
      return new Response(index, {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-cache",
        },
      });
    }
    
    const ext = path.substring(path.lastIndexOf("."));
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    const cacheControl = path.startsWith("/_next/")
      ? "public, max-age=31536000, immutable"
      : "no-cache";
    
    return new Response(val, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": cacheControl,
      },
    });
  } catch (e) {
    console.error("Static serve error:", e);
    return new Response("Internal Server Error", { status: 500 });
  }
}

self.addEventListener("fetch", (event: FetchEvent) => {
  event.respondWith(handleRequest(event));
});
