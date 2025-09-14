import cookie from "cookie";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  // Pastikan body ada
  const { password } = req.body || {};
  console.log("Password diterima:", password); // DEBUG

  if (password === "Control Web by Vinzz") {
    res.setHeader(
      "Set-Cookie",
      cookie.serialize("adminToken", "Control Web by Vinzz", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24, // 1 hari
        path: "/",
      })
    );
    return res.status(200).json({ success: true });
  }

  return res.status(401).json({ error: "Password salah" });
}
