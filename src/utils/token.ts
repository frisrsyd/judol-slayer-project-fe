import { signJwt, verifyJwt } from "./jwt";

function setToken(tokenJson: Record<string, any>, res: any) {
  console.log("tokenJson: ", tokenJson);
  const tokenJwt = signJwt(tokenJson, 60 * 60 * 24 * 365); // 1 year

  res.setHeader(
    "Set-Cookie",
    `token=${tokenJwt}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${
      60 * 60 * 24 * 365
    }`
  );
}

function getToken(req: any) {
  const cookie = req.cookies?.token;
  if (!cookie) {
    throw new Error("Token not found in cookies");
  }
  const verifiedToken = verifyJwt(cookie);
  console.log("verifiedToken: ", verifiedToken);
  return verifiedToken;
}

function isTokenValid(req: any) {
  const cookie = req.cookies?.token;
  console.log("cookie token: ", cookie);
  if (!cookie) {
    return false;
  }
  try {
    verifyJwt(cookie);
    return true;
  } catch (error) {
    return false;
  }
}

function deleteToken(res: any) {
  res.setHeader(
    "Set-Cookie",
    `token=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`
  );
}

export { setToken, getToken, deleteToken, isTokenValid };
