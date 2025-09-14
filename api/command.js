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
    const target = body.userId;
    const type = body.type; // "alert" atau "block"
    const message = body.message || '';

    if (!target || !type) {
      return res.status(400).json({ error: 'Missing target or type' });
    }

    // masukkan command ke user
    if (store[target]) {
      store[target].cmds = store[target].cmds || [];
      store[target].cmds.push({ type, message });
    }

    return res.status(200).json({ success: true });
  }

  if (req.method === 'GET') {
    const { userId } = req.query;
    if (!userId || !store[userId]) {
      return res.status(200).json({ cmds: [] });
    }

    const cmds = store[userId].cmds || [];
    // setelah dikirim ke client, kosongkan agar tidak spam
    store[userId].cmds = [];
    return res.status(200).json({ cmds });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
