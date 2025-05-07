import { NextApiRequest, NextApiResponse } from "next";
import { signJwt } from "../../utils/jwt";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { payload, expiresIn } = req.body;

  if (!payload || !expiresIn) {
    return res
      .status(400)
      .json({ error: "Payload and expiresIn are required" });
  }

  try {
    const token = signJwt(payload, expiresIn);
    return res.status(200).json({ token });
  } catch (error) {
    console.error("Error signing JWT:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
