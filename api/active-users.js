let activeUsers = new Map();

export default function handler(req, res) {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const ua = req.headers['user-agent'] || 'unknown';
  const id = req.query.id || crypto.randomUUID();

  // Update user info
  activeUsers.set(id, { id, ip, ua, lastSeen: Date.now() });

  // Hapus yang expired (60 detik tidak aktif)
  const now = Date.now();
  for (const [uid, user] of activeUsers) {
    if (now - user.lastSeen > 60000) activeUsers.delete(uid);
  }

  if (req.method === 'GET') {
    return res.status(200).json({ users: [...activeUsers.values()] });
  }

  res.status(200).json({ success: true, id });
}
