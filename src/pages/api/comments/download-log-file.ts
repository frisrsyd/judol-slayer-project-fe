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

  const textContent = logList.join("\n");
  const buffer = Buffer.from(textContent, "utf-8");

  res.setHeader("Content-Type", "text/plain");
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=judol-slayer-log.txt"
  );
  res.status(200).send(buffer);
}
