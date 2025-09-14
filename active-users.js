const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "please-change-me";

let activeUsers = global.__ACTIVE_USERS = global.__ACTIVE_USERS || {};
// format: { userId: { lastSeen, ip, meta, cmds: [] } }

function verifyAdmin(req) {
  const auth = (req.headers && req.headers.authorization) || "";
  if (!auth.startsWith("Bearer ")) return false;
  const token = auth.split(" ")[1];
  try {
    const p = jwt.verify(token, JWT_SECRET);
    return p && p.role === "admin";
  } catch { return false; }
}

async function parseBody(req){
  const chunks = [];
  for await (const c of req) chunks.push(c);
  try {
    return JSON.parse(Buffer.concat(chunks).toString() || "{}");
  } catch {
    return {};
  }
}

module.exports = async (req, res) => {
  // This endpoint manages heartbeats from clients and listing for admins.
  // POST (client heartbeat): { userId, meta? }
  // GET (admin): returns list of active users
  if (req.method === "POST") {
    const body = await parseBody(req);
    const userId = body.userId || body.id;
    if (!userId) return res.status(400).json({ message: "Missing userId" });
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || "";
    activeUsers[userId] = activeUsers[userId] || { cmds: [] };
    activeUsers[userId].lastSeen = Date.now();
    activeUsers[userId].ip = ip;
    activeUsers[userId].meta = body.meta || {};
    return res.json({ ok: true, userId });
  }

  if (req.method === "GET") {
    if (!verifyAdmin(req)) return res.status(401).json({ message: "Unauthorized" });
    // return array of users
    const rows = Object.keys(activeUsers).map(id => ({
      id,
      lastSeen: activeUsers[id].lastSeen,
      ip: activeUsers[id].ip,
      meta: activeUsers[id].meta,
      pendingCmds: (activeUsers[id].cmds || []).length
    }));
    return res.json({ ok: true, users: rows });
  }

  return res.status(405).json({ message: "Method not allowed" });
};
