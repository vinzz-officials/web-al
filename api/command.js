const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "please-change-me";
let activeUsers = global.__ACTIVE_USERS = global.__ACTIVE_USERS || [];

// Whitelisted commands
const WHITELIST = {
  clearUsers: { desc: "Clear active users" },
  ping: { desc: "Simulated ping" },
};

function verifyAdmin(req) {
  const auth = (req.headers && req.headers.authorization) || "";
  if (!auth.startsWith("Bearer ")) return false;
  const token = auth.split(" ")[1];
  try {
    const p = jwt.verify(token, JWT_SECRET);
    return p && p.role === "admin";
  } catch {
    return false;
  }
}

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });
  if (!verifyAdmin(req)) return res.status(403).json({ message: "Unauthorized" });

  // --- Manual parse body (Vercel) ---
  let body = {};
  try {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    body = JSON.parse(Buffer.concat(chunks).toString() || "{}");
  } catch {
    return res.status(400).json({ message: "Invalid JSON" });
  }

  const { cmd } = body;
  if (!cmd || !WHITELIST[cmd]) return res.status(400).json({ message: "Unknown or disallowed command" });

  if (cmd === "clearUsers") {
    global.__ACTIVE_USERS = [];
    return res.json({ ok: true, output: "activeUsers cleared (simulated)" });
  }
  if (cmd === "ping") {
    return res.json({ ok: true, output: "pong (simulated)" });
  }

  return res.json({ ok: false, output: "no-op" });
};
