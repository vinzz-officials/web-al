import { addBlocked, removeBlocked, getBlocked } from "../blocked-ips.js";

const parseBody = async (req) => {
  if (req.body) return req.body;
  const chunks = [];
  for await (const c of req) chunks.push(c);
  try { return JSON.parse(Buffer.concat(chunks).toString() || "{}"); } catch { return {}; }
};

function parseCookies(cookieHeader) {
  const out = {};
  if (!cookieHeader) return out;
  for (const part of cookieHeader.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const val = decodeURIComponent(part.slice(idx+1).trim());
    out[key] = val;
  }
  return out;
}

function verifyAdmin(req) {
  const auth = (req.headers && req.headers.authorization) || '';
  if (auth.startsWith('Bearer ')) return true;

  const cookies = parseCookies(req.headers && req.headers.cookie || '');
  if (cookies.adminToken && cookies.adminToken === 'Control Web by Vinzz') return true;

  return false;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!verifyAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });

  const body = await parseBody(req);
  const { ip, action } = body || {};

  if (!action) {
    return res.status(400).json({ error: 'Missing action' });
  }

  if (action === 'add') {
    if (!ip) return res.status(400).json({ error: 'Missing IP' });
    addBlocked(ip);
  }

  if (action === 'remove') {
    if (!ip) return res.status(400).json({ error: 'Missing IP' });
    removeBlocked(ip);
  }

  if (action === 'list') {
    return res.status(200).json({ success: true, blocked: getBlocked() });
  }

  return res.status(200).json({ success: true, blocked: getBlocked() });
}
