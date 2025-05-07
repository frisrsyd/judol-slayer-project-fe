import { NextApiRequest, NextApiResponse } from "next";
import { setChannelId } from "../../../utils/channel-id";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { channelId } = req.body;

  if (!channelId) {
    return res.status(400).json({ error: "Channel ID is required" });
  }

  try {
    setChannelId({ channelId }, res);
    return res.status(200).json({ message: "Channel ID set successfully" });
  } catch (error) {
    console.error("Error setting channel ID:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
