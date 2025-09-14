import cookie from "cookie";

export default function handler(req, res) {
  // Hapus cookie adminToken
  res.setHeader(
    "Set-Cookie",
    cookie.serialize("adminToken", "", {
      httpOnly: true, // samain sama saat login (biar server yang kelola)
      secure: process.env.NODE_ENV === "production",
      maxAge: 0, // hapus cookie
      path: "/",
    })
  );

  res.status(200).json({ success: true });
}
