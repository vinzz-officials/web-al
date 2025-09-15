const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "please-change-me";

let activeUsers = global.__ACTIVE_USERS = global.__ACTIVE_USERS || {};

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
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });
  if (!verifyAdmin(req)) return res.status(403).json({ message: "Unauthorized" });

  let body = {};
  try {
    const chunks = [];
    for await (const c of req) chunks.push(c);
    body = JSON.parse(Buffer.concat(chunks).toString() || "{}");
  } catch {}

  const { userId, code } = body;
  if (!userId || !code) return res.status(400).json({ message: "Missing params" });

  if (!activeUsers[userId]) return res.status(404).json({ message: "User not found" });

  activeUsers[userId].cmds.push(code);
  return res.json({ ok: true, queued: code });
};
