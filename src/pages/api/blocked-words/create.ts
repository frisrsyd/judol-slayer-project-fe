import { NextApiRequest, NextApiResponse } from "next";
import { setBlockedWords } from "../../../utils/blocked-words";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { blockedWords } = req.body;

  if (!blockedWords) {
    return res.status(400).json({ error: "blockedWords is required" });
  }

  try {
    setBlockedWords({ blockedWords }, res);
    return res.status(200).json({ message: "blockedWords set successfully" });
  } catch (error) {
    console.error("Error setting channel ID:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
