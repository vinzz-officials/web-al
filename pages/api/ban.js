import { serialize } from "cookie";

export default function handler(req, res) {
  const { action } = req.body;

  if (action === "ban") {
    res.setHeader(
      "Set-Cookie",
      serialize("banned_session", "true", {
        path: "/",
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 30, // 30 hari
      })
    );
    return res.status(200).json({ success: true, banned: true });
  }

  if (action === "unban") {
    res.setHeader(
      "Set-Cookie",
      serialize("banned_session", "", {
        path: "/",
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        maxAge: 0,
      })
    );
    return res.status(200).json({ success: true, banned: false });
  }

  res.status(400).json({ error: "Invalid action" });
}
