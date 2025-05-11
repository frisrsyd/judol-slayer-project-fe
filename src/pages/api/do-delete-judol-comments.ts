import { NextApiRequest, NextApiResponse } from "next";
import { doDeleteJudolComment } from "@/utils/comments";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const logs = await doDeleteJudolComment(req, res);
    return res
      .status(200)
      .json({ message: "Judol comments deleted successfully", logs });
  } catch (error) {
    console.error("Error deleting Judol comments:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
