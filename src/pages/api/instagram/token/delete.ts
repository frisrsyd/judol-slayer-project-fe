import { NextApiRequest, NextApiResponse } from "next";
import { deleteToken } from "../../../../utils/token-instagram";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    deleteToken(res);
    return res.status(200).json({ message: "Token deleted successfully" });
  } catch (error) {
    console.error("Error deleting Token:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
