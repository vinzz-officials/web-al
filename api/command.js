// api/command.js
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'please-change-me';
let activeUsers = global.__ACTIVE_USERS = global.__ACTIVE_USERS || [];

// whitelist command keys (NOT raw shell)
const WHITELIST = {
  clearUsers: { desc: 'Clear active users' },
  ping: { desc: 'Simulated ping' }
};

function verifyAdmin(req) {
  const auth = (req.headers && req.headers.authorization) || '';
  if (!auth.startsWith('Bearer ')) return false;
  const token = auth.split(' ')[1];
  try {
    const p = jwt.verify(token, JWT_SECRET);
    return p && p.role === 'admin';
  } catch (e) { return false; }
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });
  if (!verifyAdmin(req)) return res.status(403).json({ message: 'Unauthorized' });

  const { cmd } = req.body || {};
  if (!cmd || !WHITELIST[cmd]) return res.status(400).json({ message: 'Unknown or disallowed command' });

  // ---- SIMULATE behavior (Vercel) ----
  if (cmd === 'clearUsers' || cmd === 'clearUsers'.toString()) {
    global.__ACTIVE_USERS = [];
    return res.json({ ok: true, output: 'activeUsers cleared (simulated)' });
  }
  if (cmd === 'ping') {
    return res.json({ ok: true, output: 'pong (simulated)' });
  }

  // unreachable fallback
  return res.json({ ok: false, output: 'no-op' });
};

/*
If you run this on a VPS and want to execute real scripts:
- Replace the simulate blocks above with child_process.execFile
  Example (on VPS only, never on serverless):
  const { execFile } = require('child_process');
  const scriptMap = { clearUsers: '/path/to/clear-users.sh', ping: '/path/to/ping.sh' };
  execFile(scriptMap[cmd], { timeout: 5000 }, (err, stdout, stderr) => { ... });

- IMPORTANT SECURITY:
  * Never use user-supplied strings as shell commands.
  * Use execFile with fixed script paths.
  * Restrict which user can run the Node process, and manage sudoers if needed.
*/
