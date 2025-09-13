const jwt = require('jsonwebtoken');

const ADMIN_USER = process.env.ADMIN_USER || 'cpanel';
const ADMIN_PASS = process.env.ADMIN_PASS || 'web dev';
const JWT_SECRET = process.env.JWT_SECRET || 'please-change-me';

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // parse body secara manual
  let body = {};
  try {
    body = req.body;
    if (!body || Object.keys(body).length === 0) {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      body = JSON.parse(Buffer.concat(chunks).toString());
    }
  } catch (err) {
    return res.status(400).json({ message: 'Invalid JSON' });
  }

  const { username, password } = body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Missing credentials' });
  }

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    const token = jwt.sign({ sub: username, role: 'admin' }, JWT_SECRET, { expiresIn: '2h' });
    return res.status(200).json({ success: true, token });
  }

  return res.status(401).json({ success: false, message: 'Invalid credentials' });
};
