import { NextApiRequest, NextApiResponse } from "next";
import { deleteBlockedWords } from "../../../utils/blocked-words";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    deleteBlockedWords(res);
    return res.status(200).json({ message: "Channel ID deleted successfully" });
  } catch (error) {
    console.error("Error deleting blockedWords:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
