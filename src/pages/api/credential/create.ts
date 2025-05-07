import { NextApiRequest, NextApiResponse } from "next";
import { setCredential } from "../../../utils/credentials";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { credential } = req.body;

  console.log("req body: ", req.body);
  console.log("credential: ", credential);

  if (!credential) {
    return res.status(400).json({ error: "Credential is required" });
  }

  try {
    setCredential(credential, res);
    return res.status(200).json({ message: "Credential set successfully" });
  } catch (error) {
    console.error("Error setting credential:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
