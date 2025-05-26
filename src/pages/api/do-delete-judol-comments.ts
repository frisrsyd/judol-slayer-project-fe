import { NextApiRequest, NextApiResponse } from "next";
import { doDeleteJudolComment } from "@/utils/comments";

export const dynamic = "force-dynamic";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // Send a keep-alive message every 30 seconds to prevent timeouts
  const keepAliveInterval = setInterval(() => {
    res.write(`data: ${JSON.stringify({ log: "💓 Keep-alive" })}\n\n`);
    res.flushHeaders?.();
  }, 30000);

  try {
    await doDeleteJudolComment(req, res, (log: string) => {
      res.write(`data: ${JSON.stringify({ log })}\n\n`);
      res.flushHeaders?.();
    });
    res.write(
      `data: ${JSON.stringify({
        log: "✅✅✅ Deletion completed.",
        message: "Selected comments have been deleted.",
      })}\n\n`
    );
    res.flushHeaders?.();
    res.end();
  } catch (error) {
    console.error("Error deleting Judol comments:", error);
    res.write(
      `data: ${JSON.stringify({
        log: `❌ Error: ${(error as Error).message}`,
      })}\n\n`
    );
    res.flushHeaders?.();
    res.end();
  } finally {
    clearInterval(keepAliveInterval);
  }
}
