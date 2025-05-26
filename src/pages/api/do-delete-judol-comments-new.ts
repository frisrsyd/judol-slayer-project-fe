import { NextApiRequest, NextApiResponse } from "next";
import { doDetectJudolComment } from "@/utils/comments";
import { NextResponse } from "next/server";

// export const runtime = 'nodejs';
export const dynamic = "force-dynamic";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  // res.setHeader("Content-Type", "text/event-stream");
  // res.setHeader("Cache-Control", "no-cache");
  // res.setHeader("Connection", "keep-alive");

  // Send a keep-alive message every 30 seconds to prevent timeouts
  const keepAliveInterval = setInterval(() => {
    // res.write(`data: ${JSON.stringify({ log: "💓 Keep-alive" })}\n\n`);
    // res.flushHeaders; // Ensure the keep-alive message is sent immediately
    writer.write(`data: ${JSON.stringify({ log: "💓 Keep-alive" })}\n\n`);
  }, 30000);

  try {
    await doDetectJudolComment(
      req,
      res,
      (log: string) => {
        writer.write(`data: ${JSON.stringify({ log })}\n\n`);
        res.flushHeaders?.(); // Ensure each log is sent immediately
      },
      (comment) => {
        writer.write(
          `data: ${JSON.stringify({ detectedComment: comment })}\n\n`
        );
        res.flushHeaders?.(); // Ensure each detected comment is sent immediately
        // res.write(`data: ${JSON.stringify({ log })}\n\n`);
        // res.flushHeaders; // Ensure each log is sent immediately
      }
    );
    // res.write(
    //   `data: ${JSON.stringify({ log: "✅✅✅ Process completed." })}\n\n`
    // );
    // res.flushHeaders; // Ensure the completion message is sent immediately
    // res.end();
    writer.write(
      `data: ${JSON.stringify({ log: "✅✅✅ Process completed." })}\n\n`
    );
  } catch (error) {
    console.error("Error deleting Judol comments:", error);
    // res.write(
    //   `data: ${JSON.stringify({
    //     log: `❌ Error: ${(error as Error).message}`,
    //   })}\n\n`
    // );
    // res.flushHeaders; // Ensure the error message is sent immediately
    // res.end();
    writer.write(
      `data: ${JSON.stringify({
        log: `❌ Error: ${(error as Error).message}`,
      })}\n\n`
    );
  } finally {
    clearInterval(keepAliveInterval);
    writer.close();
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  stream.readable.pipeTo(
    new WritableStream({
      write(chunk) {
        res.write(chunk);
      },
      close() {
        res.end();
      },
    })
  );
}
