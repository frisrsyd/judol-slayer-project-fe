import { NextApiRequest, NextApiResponse } from "next";
import { deleteToken } from "@/utils/token";
import { deleteCredential } from "@/utils/credentials";
import { deleteChannelId } from "@/utils/channel-id";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    deleteToken(res);
    deleteCredential(res);
    deleteChannelId(res);
    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Error during logout:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
