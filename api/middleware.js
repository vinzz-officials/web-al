// Example middleware for Express-like frameworks to block IPs.
// Usage (Express):
// const { blockMiddleware } = require('./api/middleware');
// app.use(blockMiddleware);

const fs = require("fs");
const path = require("path");
const blockedFile = path.join(__dirname, "..", "blocked_ips.json");

function readBlocked(){
  try {
    return JSON.parse(fs.readFileSync(blockedFile,'utf-8')).blocked || [];
  } catch { return []; }
}

function blockMiddleware(req, res, next) {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || "";
  const blocked = readBlocked();
  if (blocked.includes(ip)) {
    res.statusCode = 403;
    res.end("Forbidden");
    return;
  }
  if (typeof next === "function") return next();
  return;
}

module.exports = { blockMiddleware };
