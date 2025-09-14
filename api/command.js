// POST { type, target, message? }
// type = "alert" | "block"
const parseBody = async (req) => {
  if (req.body) return req.body
  const chunks = []
  for await (const c of req) chunks.push(c)
  try { return JSON.parse(Buffer.concat(chunks).toString() || "{}") } catch { return {} }
}

export default async function handler(req, res) {
  const store = global.__ACTIVE_USERS = global.__ACTIVE_USERS || {}
  const blocked = global.__BLOCKED_IPS = global.__BLOCKED_IPS || []

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const body = await parseBody(req)
  const { type, target, message } = body

  if (type === 'block') {
    // target bisa berupa IP atau userId
    let ip = target
    if (store[target]) ip = store[target].ip
    if (ip && !blocked.includes(ip)) blocked.push(ip)

    return res.json({ success: true, blocked })
  }

  if (type === 'alert') {
    if (!store[target]) return res.status(404).json({ error: 'User not found' })
    store[target].cmds = store[target].cmds || []
    store[target].cmds.push({ type: 'alert', message, ts: Date.now() })
    return res.json({ success: true })
  }

  return res.status(400).json({ error: 'Invalid command' })
}
