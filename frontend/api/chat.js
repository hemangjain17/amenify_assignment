/**
 * api/chat.js
 * -----------
 * Vercel Serverless Function — secure proxy between the React frontend
 * and the FastAPI backend.
 *
 * Responsibilities:
 *  1. Rate-limit per IP (simple in-memory counter — upgrade to Upstash Redis
 *     for multi-instance deployments).
 *  2. Inject the backend API key (never exposed to the browser).
 *  3. Forward the request body to the FastAPI /api/chat endpoint.
 *  4. Stream the SSE response back to the client transparently.
 *
 * Environment variables (set in Vercel dashboard):
 *   BACKEND_URL        — e.g. https://your-backend.onrender.com
 *   BACKEND_API_KEY    — Bearer token expected by FastAPI BearerAuthMiddleware
 *   ALLOWED_ORIGIN     — e.g. https://your-app.vercel.app  (optional, defaults to *)
 *   RATE_LIMIT         — max requests per minute per IP (default: 20)
 */

// ---------------------------------------------------------------------------
// Simple in-memory rate limiter
// NOTE: resets on cold-start — use Upstash Redis for production multi-instance
// ---------------------------------------------------------------------------
const _rateLimitStore = new Map(); // ip -> { count, windowStart }

function checkRateLimit(ip, limit = 20, windowMs = 60_000) {
  const now = Date.now();
  const entry = _rateLimitStore.get(ip) ?? { count: 0, windowStart: now };

  // Reset window if expired
  if (now - entry.windowStart > windowMs) {
    entry.count = 0;
    entry.windowStart = now;
  }

  entry.count += 1;
  _rateLimitStore.set(ip, entry);

  return entry.count <= limit;
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------
export default async function handler(req, res) {
  // Only POST is valid
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // CORS headers
  const allowedOrigin = process.env.ALLOWED_ORIGIN ?? "*";
  res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Rate limiting
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ??
    req.socket?.remoteAddress ??
    "unknown";
  const limit = parseInt(process.env.RATE_LIMIT ?? "20", 10);
  if (!checkRateLimit(ip, limit)) {
    return res.status(429).json({ error: "Too many requests. Please slow down." });
  }

  // Validate required env vars
  const backendUrl = process.env.BACKEND_URL;
  if (!backendUrl) {
    console.error("[chat proxy] BACKEND_URL is not set.");
    return res.status(500).json({ error: "Server misconfiguration." });
  }

  // Forward to FastAPI
  const targetUrl = `${backendUrl.replace(/\/$/, "")}/api/chat`;
  const headers = {
    "Content-Type": "application/json",
    "X-Client-IP": ip,
  };

  const backendApiKey = process.env.BACKEND_API_KEY;
  if (backendApiKey) {
    headers["Authorization"] = `Bearer ${backendApiKey}`;
  }

  try {
    const backendRes = await fetch(targetUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(req.body),
    });

    // Proxy status + SSE headers
    res.status(backendRes.status);
    res.setHeader("Content-Type", backendRes.headers.get("content-type") ?? "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("X-Accel-Buffering", "no");

    // Stream body through
    const reader = backendRes.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(decoder.decode(value, { stream: true }));
    }

    res.end();
  } catch (err) {
    console.error("[chat proxy] Upstream error:", err);
    return res.status(502).json({ error: "Backend unreachable." });
  }
}
