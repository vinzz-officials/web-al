import cookie from "cookie";

export default function handler(req, res) {
  // Hapus cookie client
  res.setHeader(
    "Set-Cookie",
    cookie.serialize("adminToken", "", {
      httpOnly: false, 
      secure: process.env.NODE_ENV === "production",
      maxAge: 0,
      path: "/",
    })
  );

  res.status(200).json({ success: true });
}
