export-ips { addBlocked, removeBlocked, getBlocked } from "../../blocked-ips.js";

export default async function handler(req, res) {
  const { ip, action } = req.body;

  if (!ip || !action) return res.status(400).json({ error: "Missing parameters" });

  if (action === "add") addBlocked(ip);
  if (action === "remove") removeBlocked(ip);

  return res.status(200).json({ success: true, blocked: getBlocked() });
}
