import { NextApiRequest, NextApiResponse } from "next";
import { setStrictMode } from "../../../utils/strict-mode";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { strictMode } = req.body;

  if (strictMode === undefined || strictMode === null || typeof strictMode !== "boolean") {
    return res.status(400).json({ error: "strictMode is required" });
  }

  try {
    setStrictMode({ strictMode }, res);
    return res.status(200).json({ message: "strictMode set successfully" });
  } catch (error) {
    console.error("Error setting StrictMode:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
