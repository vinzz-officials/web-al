// middleware/requireAdmin.js
export function requireAdmin(req, res) {
  const isLoggedIn = req.cookies?.adminToken === process.env.ADMIN_SECRET;
  if (!isLoggedIn) {
    res.writeHead(302, { Location: "/login" });
    res.end();
    return null;
  }
  return { username: "Vinzz" };
}
