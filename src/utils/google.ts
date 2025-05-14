import { google } from "googleapis";
import { getToken, setToken } from "./token";

const redirect_uris = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URIS;
const SCOPES = ["https://www.googleapis.com/auth/youtube.force-ssl"];

async function handleGoogleAuth(req: any, res: any) {
  const credentialsWeb = process.env.NEXT_PUBLIC_GOOGLE_CREDENTIALS;
  const { client_secret, client_id } = JSON.parse(credentialsWeb || "{}").web;

  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris
  );

  try {
    const token = getToken(req);
    console.log("Existing token found:", token);
    const parsedToken = typeof token === "string" ? JSON.parse(token) : token;
    oAuth2Client.setCredentials(parsedToken);
    return oAuth2Client;
  } catch (error) {
    console.log("No token found, initiating login flow...");
  }

  if (req.method === "GET") {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope: SCOPES,
    });

    res.setHeader("Content-Type", "application/json");
    return res.status(200).json({ url: authUrl });
  }

  if (req.method === "POST") {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: "Authorization code is required" });
    }

    const token = await new Promise((resolve, reject) => {
      oAuth2Client.getToken(code, (err: any, token: any) => {
        if (err) {
          console.error("Error retrieving access token", err);
          reject(err);
          return;
        }
        resolve(token);
      });
    });

    oAuth2Client.setCredentials(token as any);
    setToken(token as any, res);
    console.log("Token retrieved and set successfully:", token);

    return oAuth2Client;
  }

  if (req.method === "DELETE") {
    try {
      const token = getToken(req);
      if (!token) {
        return res.status(400).json({ error: "No token found to revoke" });
      }

      const parsedToken = typeof token === "string" ? JSON.parse(token) : token;
      // const postData = parsedToken.access_token;

      const response = oAuth2Client.revokeCredentials(parsedToken.access_token);
      console.log("Response from revokeToken:", response);
      return response;
    } catch (error) {
      console.error("Error revoking token:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
export { handleGoogleAuth };
