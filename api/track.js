// endpoint used by client pages to announce presence
// POST { userId }
let store = global.__ACTIVE_USERS = global.__ACTIVE_USERS || {};
const parseBody = async (req) => {
  if (req.body) return req.body;
  const chunks = [];
  for await (const c of req) chunks.push(c);
  try { return JSON.parse(Buffer.concat(chunks).toString() || "{}"); } catch { return {}; }
};

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const body = await parseBody(req);
  const userId = body && body.userId;
  if (!userId) return res.status(400).json({ message: 'Missing userId' });

  const ip = (req.headers['x-forwarded-for'] || req.socket && req.socket.remoteAddress || '').split(',')[0].trim();
  const ua = req.headers['user-agent'] || 'unknown';
  const blocked = global.__BLOCKED_IPS || [];

  if (blocked.includes(ip)) return res.status(403).json({ message: 'IP blocked' });

  store[userId] = store[userId] || { cmds: [] };
  const cmds = store[userId].cmds || [];
  store[userId] = { id: userId, ip, ua, lastSeen: Date.now(), cmds };

  // cleanup expired (60s)
  const now = Date.now();
  for (const k of Object.keys(store)) {
    if (!store[k].lastSeen || now - store[k].lastSeen > 60000) delete store[k];
  }

  return res.json({ success: true });
};
