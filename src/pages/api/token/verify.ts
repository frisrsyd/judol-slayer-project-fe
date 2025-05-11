import { NextApiRequest, NextApiResponse } from "next";
import { isTokenValid } from "@/utils/token";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const isValid = isTokenValid(req);
    return res.status(200).json({ isValid });
  } catch (error) {
    console.error("Error checking credential validity:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
