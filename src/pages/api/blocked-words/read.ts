import { NextApiRequest, NextApiResponse } from "next";
import { getBlockedWords } from "../../../utils/blocked-words";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const blockedWords = getBlockedWords(req);
    console.log("blockedWords: ", blockedWords);
    return res.status(200).json(blockedWords);
  } catch (error) {
    console.error("Error retrieving blockedWords:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
