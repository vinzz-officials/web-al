export function requireAdmin(req, res) {
  const token = req.cookies?.adminToken;
  if (token !== "Control Web by Vinzz") {
    res.writeHead(302, { Location: "/login.html" });
    res.end();
    return null;
  }
  return { username: "Vinzz" };
}
