// pages/api/blocked-store.js

// Simpan data block di global memory (sementara, kalau butuh permanen → DB/Edge Config)
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
  if (!verifyAdmin(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // ✅ GET → lihat daftar IP yang di-block
  if (req.method === "GET") {
    return res.status(200).json({ blocked: global.blockedIPs });
  }

  // ✅ POST → tambah / hapus IP
  if (req.method === "POST") {
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
      global.blockedIPs = global.blockedIPs.filter(i => i !== ip);
    }

    return res.status(200).json({ blocked: global.blockedIPs });
  }

  return res.status(405).json({ error: "Method not allowed" });
}

// Helper buat baca body request di serverless
async function streamToString(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  return Buffer.concat(chunks).toString();
        }
