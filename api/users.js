// /api/users.js
export default async function handler(req, res) {
  const store = global.__ACTIVE_USERS = global.__ACTIVE_USERS || {};
  const blocked = global.__BLOCKED_IPS || [];

  const ip = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').split(',')[0].trim();
  const ua = req.headers['user-agent'] || 'unknown';

  const cleanup = () => {
    const now = Date.now();
    for (const k of Object.keys(store)) {
      if (!store[k].lastSeen || now - store[k].lastSeen > 60000) delete store[k];
    }
  };

  if (req.method === 'POST') {
    let body = {};
    try {
      body = req.body || JSON.parse(await new Promise((r) => {
        let d = '';
        req.on('data', (c) => (d += c));
        req.on('end', () => r(d));
      }));
    } catch {}

    const userId = body.userId;
    if (!userId) return res.status(400).json({ error: 'Missing userId' });
    if (blocked.includes(ip)) return res.status(403).json({ error: 'IP blocked' });

    store[userId] = store[userId] || { cmds: [] };
    store[userId] = { ...store[userId], id: userId, ip, ua, lastSeen: Date.now() };

    cleanup();
    return res.status(200).json({ success: true, id: userId });
  }

  if (req.method === 'GET') {
    cleanup();
    return res.status(200).json({ users: Object.values(store) });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
