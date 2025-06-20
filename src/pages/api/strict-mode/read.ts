import { NextApiRequest, NextApiResponse } from "next";
import { getStrictMode } from "../../../utils/strict-mode";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const strictMode = getStrictMode(req);
    console.log("strictMode: ", strictMode);
    return res.status(200).json(strictMode);
  } catch (error) {
    console.error("Error retrieving strictMode:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
