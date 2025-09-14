const jwt = require("jsonwebtoken");
const fs = require("fs");
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
  // POST { userId, type: "alert"|"custom", payload: {...} }
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });
  if (!verifyAdmin(req)) return res.status(401).json({ message: "Unauthorized" });
  const body = await parseBody(req);
  const { userId, type, payload } = body;
  if (!userId || !type) return res.status(400).json({ message: "Missing userId or type" });
  activeUsers[userId] = activeUsers[userId] || { cmds: [] };
  const cmd = { id: Date.now().toString(36), type, payload, ts: Date.now() };
  activeUsers[userId].cmds.push(cmd);
  return res.json({ ok: true, cmd });
};
