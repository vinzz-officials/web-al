import cookie from "cookie";

export default function handler(req, res) {
  const cookies = cookie.parse(req.headers.cookie || "");
  if (cookies.adminToken === "Control Web by Vinzz") {
    return res.status(200).json({ loggedIn: true });
  }
  return res.status(401).json({ loggedIn: false });
}
