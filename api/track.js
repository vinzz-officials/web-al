// api/track.js
let activeUsers = global.__ACTIVE_USERS = global.__ACTIVE_USERS || [];

module.exports = (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });
  const { userId } = req.body || {};
  if (!userId) return res.status(400).json({ message: 'Missing userId' });

  if (!activeUsers.includes(userId)) activeUsers.push(userId);
  return res.json({ success: true, activeUsers });
};
