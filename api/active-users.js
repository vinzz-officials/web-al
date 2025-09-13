const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "please-change-me";

let activeUsers = global.__ACTIVE_USERS = global.__ACTIVE_USERS || {};
// format: { userId: { lastSeen, cmds: [] } }

function verifyAdmin(req) {
  const auth = (req.headers && req.headers.authorization) || "";
  if (!auth.startsWith("Bearer ")) return false;
  const token = auth.split(" ")[1];
  try {
    const p = jwt.verify(token, JWT_SECRET);
    return p && p.role === "admin";
  } catch { return false; }
}

module.exports = async (req, res) => {
  if (req.method === "GET") {
    if (!verifyAdmin(req)) return res.status(403).json({ message: "Unauthorized" });

    return res.json({ 
      activeUsers: Object.keys(activeUsers) 
    });
  }

  if (req.method === "POST") {
    // user register/update lastSeen
    let body = {};
    try {
      const chunks = [];
      for await (const c of req) chunks.push(c);
      body = JSON.parse(Buffer.concat(chunks).toString() || "{}");
    } catch {}

    const { userId } = body;
    if (!userId) return res.status(400).json({ message: "Missing userId" });

    activeUsers[userId] = { lastSeen: Date.now(), cmds: activeUsers[userId]?.cmds || [] };
    return res.json({ ok: true });
  }

  return res.status(405).json({ message: "Method not allowed" });
};
