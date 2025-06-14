import { getToken, setToken } from "./token-instagram";

const redirect_uris = process.env.NEXT_PUBLIC_INSTAGRAM_REDIRECT_URIS;
const SCOPES = ["instagram_business_manage_comments"];

async function handleInstagramAuth(req: any, res: any) {
  const credentialsWeb = process.env.NEXT_PUBLIC_INSTAGRAM_CREDENTIALS;
  const {
    client_secret,
    client_id,
    auth_uri,
    token_uri,
    access_token_uri,
    refresh_access_token_uri,
  } = JSON.parse(credentialsWeb || "{}").web;

  try {
    const token = getToken(req);
    console.log("Existing token found:", token);
    const parsedToken = typeof token === "string" ? JSON.parse(token) : token;

    return parsedToken;
  } catch (error) {
    console.log("No token found, initiating login flow...");
  }

  if (req.method === "GET") {
    const params = new URLSearchParams({
      enable_fb_login: "0",
      force_authentication: "1",
      client_id: String(client_id),
      redirect_uri: String(redirect_uris ?? ""),
      response_type: "code",
      scope: SCOPES.join(","),
    });

    const authUrl = `${auth_uri}?${params.toString()}`;

    res.setHeader("Content-Type", "application/json");
    return res.status(200).json({ url: authUrl });
  }

  if (req.method === "POST") {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: "Authorization code is required" });
    }

    const token = await new Promise((resolve, reject) => {
      fetch(token_uri, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: String(client_id),
          client_secret: String(client_secret),
          grant_type: "authorization_code",
          redirect_uri: String(redirect_uris ?? ""),
          code: String(code),
        }),
      })
        .then(async (response) => {
          if (!response.ok) {
            const errorData = await response.json();
            return reject(errorData);
          }
          const data = await response.json();
          resolve(data);
        })
        .catch((err) => reject(err));
    });

    setToken(token as any, res);
    console.log("Token retrieved and set successfully:", token);

    return token;
  }

  if (req.method === "DELETE") {
    try {
      const token = getToken(req);
      if (!token) {
        return res.status(400).json({ error: "No token found to revoke" });
      }

      const parsedToken = typeof token === "string" ? JSON.parse(token) : token;
      // const postData = parsedToken.access_token;

      return res.status(200).json({ message: "Token revoked successfully" });
    } catch (error) {
      console.error("Error revoking token:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
export { handleInstagramAuth };
