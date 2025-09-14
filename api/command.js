// api/command.js
const parseBody = async (req) => {
  if (req.body) return req.body;
  const chunks = [];
  for await (const c of req) chunks.push(c);
  try { return JSON.parse(Buffer.concat(chunks).toString() || "{}"); } catch { return {}; }
};

export default async function handler(req, res) {
  const store = global.__ACTIVE_USERS = global.__ACTIVE_USERS || {};

  if (req.method === 'POST') {
    const body = await parseBody(req);
    const { targetId, type, message } = body;

    if (!targetId || !type) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    if (!store[targetId]) store[targetId] = { cmds: [] };
    store[targetId].cmds = store[targetId].cmds || [];
    store[targetId].cmds.push({ type, message });

    return res.status(200).json({ success: true });
  }

  if (req.method === 'GET') {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'Missing userId' });

    if (!store[userId]) store[userId] = { cmds: [] };
    const cmds = store[userId].cmds || [];
    store[userId].cmds = []; // kosongkan setelah dikirim biar sekali jalan

    return res.status(200).json({ cmds });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
