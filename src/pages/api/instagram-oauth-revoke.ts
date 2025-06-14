import { NextApiRequest, NextApiResponse } from "next";
import { handleInstagramAuth } from "@/utils/instagram";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "DELETE") {
    try {
      const response = await handleInstagramAuth(req, res);
      return res
        .status(200)
        .json({ message: "Google OAuth token revoked successfully", response });
    } catch (error) {
      console.error("Error during Google OAuth token revocation:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
