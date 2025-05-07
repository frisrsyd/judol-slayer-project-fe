import { NextApiRequest, NextApiResponse } from "next";
import { deleteChannelId } from "../../../utils/channel-id";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    deleteChannelId(res);
    return res.status(200).json({ message: "Channel ID deleted successfully" });
  } catch (error) {
    console.error("Error deleting channel ID:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
