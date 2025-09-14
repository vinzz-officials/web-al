// Clients poll this endpoint to fetch pending commands for their userId.
// GET ?userId=<id>  (returns { cmds: [...] })
// POST ?ack=true  with body { userId, cmdId } to ack (remove) a cmd
let activeUsers = global.__ACTIVE_USERS = global.__ACTIVE_USERS || {};

async function parseBody(req){
  const chunks = [];
  for await (const c of req) chunks.push(c);
  try {
    return JSON.parse(Buffer.concat(chunks).toString() || "{}");
  } catch {
    return {};
  }
}

module.exports = async (req, res) => {
  const method = req.method;
  const url = req.url || "";
  const params = Object.fromEntries((new URL("http://localhost"+url)).searchParams.entries());
  const userId = params.userId || params.id;

  if (!userId) return res.status(400).json({ message: "Missing userId param" });

  if (method === "GET") {
    const u = activeUsers[userId] || { cmds: [] };
    return res.json({ ok: true, cmds: u.cmds || [] });
  }

  if (method === "POST") {
    const body = await parseBody(req);
    if (body.ack && body.cmdId) {
      const list = (activeUsers[userId] && activeUsers[userId].cmds) || [];
      activeUsers[userId].cmds = list.filter(c => c.id !== body.cmdId);
      return res.json({ ok: true });
    }
    return res.status(400).json({ message: "Bad request" });
  }

  return res.status(405).json({ message: "Method not allowed" });
};
