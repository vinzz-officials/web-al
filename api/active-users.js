// Unified active-users API
// GET  -> returns current active users
// POST -> update (heartbeats) from clients: { userId }
const parseBody = async (req) => {
  if (req.body) return req.body;
  const chunks = [];
  for await (const c of req) chunks.push(c);
  try { return JSON.parse(Buffer.concat(chunks).toString() || "{}"); } catch { return {}; }
};

export default async function handler(req, res) {
  // store as plain object for compatibility with other APIs in this project
  const store = global.__ACTIVE_USERS = global.__ACTIVE_USERS || {};
  const blocked = global.__BLOCKED_IPS || [];

  const ip = (req.headers['x-forwarded-for'] || req.socket && req.socket.remoteAddress || '').split(',')[0].trim();
  const ua = req.headers['user-agent'] || 'unknown';

  // Cleanup helper
  const cleanup = () => {
    const now = Date.now();
    for (const k of Object.keys(store)) {
      const u = store[k];
      if (!u || !u.lastSeen || now - u.lastSeen > 60000) delete store[k];
    }
  };

  if (req.method === 'POST') {
    const body = await parseBody(req);
    const userId = body && body.userId;
    if (!userId) return res.status(400).json({ error: 'Missing userId' });

    if (blocked.includes(ip)) return res.status(403).json({ error: 'IP blocked' });

    store[userId] = store[userId] || { cmds: [] };
    // preserve cmds array if present
    const cmds = store[userId].cmds || [];
    store[userId] = { id: userId, ip, ua, lastSeen: Date.now(), cmds };

    cleanup();
    return res.status(200).json({ success: true, id: userId });
  }

  if (req.method === 'GET') {
    cleanup();
    const users = Object.values(store).map(u => ({
      id: u.id,
      ip: u.ip,
      ua: u.ua,
      lastSeen: u.lastSeen || 0,
      hasCmds: Array.isArray(u.cmds) && u.cmds.length > 0
    }));
    return res.status(200).json({ users });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
