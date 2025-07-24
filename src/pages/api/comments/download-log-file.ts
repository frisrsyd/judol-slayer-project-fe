import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { logList } = req.body;

  if (!Array.isArray(logList)) {
    res.status(400).json({ error: "logList must be an array" });
    return;
  }

  // Convert LogEntry objects to strings for download
  const logStrings = logList.map((entry: any) => {
    if (typeof entry === "string") {
      return entry;
    }
    // If it's a LogEntry object, extract the log text
    return entry?.log || JSON.stringify(entry);
  });

  const textContent = logStrings.join("\n");
  const buffer = Buffer.from(textContent, "utf-8");

  res.setHeader("Content-Type", "text/plain");
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=judol-slayer-log.txt"
  );
  res.status(200).send(buffer);
}
