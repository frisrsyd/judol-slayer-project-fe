import { NextApiRequest, NextApiResponse } from "next";
import { getChannelId } from "../../../utils/channel-id";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const channelId = getChannelId(req);
    console.log("channelId: ", channelId);
    return res.status(200).json(channelId);
  } catch (error) {
    console.error("Error retrieving channel ID:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
