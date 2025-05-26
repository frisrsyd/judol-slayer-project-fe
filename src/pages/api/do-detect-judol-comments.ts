import { NextApiRequest, NextApiResponse } from "next";
import { doDetectJudolComment } from "@/utils/comments";

export const dynamic = "force-dynamic";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // Send a keep-alive message every 30 seconds to prevent timeouts
  const keepAliveInterval = setInterval(() => {
    res.write(`data: ${JSON.stringify({ log: "💓 Keep-alive" })}\n\n`);
    res.flushHeaders; // Ensure the keep-alive message is sent immediately`
  }, 30000);

  try {
    // await doDeleteJudolComment(req, res, (log: string) => {
    //   res.write(`data: ${JSON.stringify({ log })}\n\n`);
    //   res.flushHeaders; // Ensure each log is sent immediately
    // });
    await doDetectJudolComment(
      req,
      res,
      (log: string) => {
        res.write(`data: ${JSON.stringify({ log })}\n\n`);
        res.flushHeaders?.();
      },
      (comment) => {
        res.write(`data: ${JSON.stringify({ detectedComment: comment })}\n\n`);
        res.flushHeaders?.();
      }
    );
    res.write(
      `data: ${JSON.stringify({
        log: "✅✅✅ Process completed.",
        message:
          "Detecting comments has been completed, please review the comments and submit for deletion !!!.",
      })}\n\n`
    );
    res.flushHeaders; // Ensure the completion message is sent immediately
    res.end();
  } catch (error) {
    console.error("Error deleting Judol comments:", error);
    res.write(
      `data: ${JSON.stringify({
        log: `❌ Error: ${(error as Error).message}`,
      })}\n\n`
    );
    res.flushHeaders; // Ensure the error message is sent immediately
    res.end();
  } finally {
    clearInterval(keepAliveInterval);
  }
}
