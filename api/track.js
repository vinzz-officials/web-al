let activeUsers = global.__ACTIVE_USERS = global.__ACTIVE_USERS || [];

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  // --- Manual parse body (Vercel) ---
  let body = {};
  try {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    body = JSON.parse(Buffer.concat(chunks).toString() || "{}");
  } catch {
    return res.status(400).json({ message: "Invalid JSON" });
  }

  const { userId } = body;
  if (!userId) return res.status(400).json({ message: "Missing userId" });

  if (!activeUsers.includes(userId)) activeUsers.push(userId);
  return res.json({ success: true, activeUsers });
};
