const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "please-change-me";
let activeUsers = global.__ACTIVE_USERS = global.__ACTIVE_USERS || [];

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

module.exports = (req, res) => {
  if (req.method !== "GET") return res.status(405).json({ message: "Method not allowed" });
  if (!verifyAdmin(req)) return res.status(403).json({ message: "Unauthorized" });
  return res.json({ activeUsers });
};
