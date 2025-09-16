// pages/api/blocked-store.js

global.blockedIPs = global.blockedIPs || [];

const API_KEY = process.env.ADMIN_API_KEY || "changeme";

function parseCookies(cookieHeader) {
  const out = {};
  if (!cookieHeader) return out;
  for (const part of cookieHeader.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const val = decodeURIComponent(part.slice(idx + 1).trim());
    out[key] = val;
  }
  return out;
}

function verifyAdmin(req) {
  const auth = (req.headers && req.headers.authorization) || "";
  if (auth.startsWith("Bearer ") && auth.slice(7) === API_KEY) return true;

  const cookies = parseCookies(req.headers && req.headers.cookie || "");
  if (cookies.adminToken && cookies.adminToken === "Control Web by Vinzz") return true;

  return false;
}

export default async function handler(req, res) {
  const clientIp =
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.socket?.remoteAddress ||
    "unknown";

  // ✅ GET
  if (req.method === "GET") {
    if (verifyAdmin(req)) {
      // Admin → lihat semua IP
      return res.status(200).json({ blocked: global.blockedIPs });
    } else {
      // Client → cek apakah dia diblok
      const isBlocked = global.blockedIPs.includes(clientIp);
      return res.status(200).json({ blocked: isBlocked, ip: clientIp });
    }
  }

  // ✅ POST (admin only)
  if (req.method === "POST") {
    if (!verifyAdmin(req)) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    let body = {};
    try {
      body = req.body || JSON.parse(await streamToString(req));
    } catch (e) {}

    const { action, ip } = body || {};
    if (!action || !ip) {
      return res.status(400).json({ error: "Missing action or IP" });
    }

    if (action === "add") {
      if (!global.blockedIPs.includes(ip)) {
        global.blockedIPs.push(ip);
      }
    }
    if (action === "remove") {
      global.blockedIPs = global.blockedIPs.filter((i) => i !== ip);
    }

    return res.status(200).json({ blocked: global.blockedIPs });
  }

  return res.status(405).json({ error: "Method not allowed" });
}

// Helper
async function streamToString(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  return Buffer.concat(chunks).toString();
      }
