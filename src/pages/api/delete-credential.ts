import { NextApiRequest, NextApiResponse } from "next";
import { deleteCredential } from "../../utils/credentials";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    deleteCredential(res);
    return res.status(200).json({ message: "Credential deleted successfully" });
  } catch (error) {
    console.error("Error deleting credential:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
