const fs = require("fs");
const path = require("path");
const JWT = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "please-change-me";
const blockedFile = path.join(__dirname, "..", "blocked_ips.json");

function verifyAdmin(req) {
  const auth = (req.headers && req.headers.authorization) || "";
  if (!auth.startsWith("Bearer ")) return false;
  const token = auth.split(" ")[1];
  try {
    const p = JWT.verify(token, JWT_SECRET);
    return p && p.role === "admin";
  } catch { return false; }
}

function readBlocked(){
  try {
    return JSON.parse(fs.readFileSync(blockedFile,'utf-8'));
  } catch { return { blocked: [] }; }
}
function writeBlocked(obj){
  fs.writeFileSync(blockedFile, JSON.stringify(obj, null, 2));
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
  if (!verifyAdmin(req)) return res.status(401).json({ message: "Unauthorized" });
  const method = req.method;
  const body = await parseBody(req);

  const store = readBlocked();
  if (method === "GET") {
    return res.json(store);
  }

  if (method === "POST") {
    const { ip } = body;
    if (!ip) return res.status(400).json({ message: "Missing ip" });
    if (!store.blocked.includes(ip)) store.blocked.push(ip);
    writeBlocked(store);
    return res.json({ ok: true, blocked: store.blocked });
  }

  if (method === "DELETE") {
    const { ip } = body;
    if (!ip) return res.status(400).json({ message: "Missing ip" });
    store.blocked = store.blocked.filter(x => x !== ip);
    writeBlocked(store);
    return res.json({ ok: true, blocked: store.blocked });
  }

  return res.status(405).json({ message: "Method not allowed" });
};
