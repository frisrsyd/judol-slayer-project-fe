import { signJwt, verifyJwt } from "./jwt";

function setToken(tokenJson: Record<string, any>, res: any) {
  console.log("tokenJson: ", tokenJson);
  const expiredAt = 60 * 60 * 24 * 365; // 1 year
  const refreshToken = tokenJson.refresh_token
    ? signJwt({ refresh_token: tokenJson?.refresh_token }, 60 * 60 * 24 * 365)
    : null;
  const tokenJwt = signJwt(tokenJson, 60 * 60 * 24 * 365); // 1 year
  console.log("tokenJwt: ", tokenJwt);
  console.log("refreshToken: ", refreshToken);

  // let cookies = `token=${tokenJwt}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${expiredAt}`;
  // if (!!refreshToken) {
  //   cookies += `, refresh_token=${refreshToken}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${expiredAt}`;
  // }

  // res.setHeader("Set-Cookie", cookies);
  // Set cookies individually
  res.setHeader(
    "Set-Cookie",
    [
      `token=${tokenJwt}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${expiredAt}`,
      refreshToken
        ? `refresh_token=${refreshToken}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${expiredAt}`
        : "",
    ].filter(Boolean)
  ); // Filter out empty strings
}
interface VerifiedToken {
  refresh_token?: string;
  access_token?: string;
  scope?: string;
  token_type?: string;
  expiry_date?: number;
  refresh_token_expires_in?: number;
  iat?: number;
  exp?: number;
  haveRefreshToken?: boolean;
}

interface VerifiedRefreshToken {
  refresh_token?: string;
}

function getToken(req: any) {
  const cookie = req.cookies?.token;
  if (!cookie) {
    throw new Error("Token not found in cookies");
  }
  const verifiedToken = verifyJwt(cookie);
  if (!(verifiedToken as VerifiedToken)?.refresh_token) {
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) {
      // throw new Error("Refresh token not found in cookies");
      (verifiedToken as VerifiedToken).haveRefreshToken = false;
    }
    const verifiedRefreshToken = refreshToken ? verifyJwt(refreshToken) : null;
    if (verifiedRefreshToken as VerifiedRefreshToken) {
      (verifiedToken as VerifiedToken).refresh_token = (
        verifiedRefreshToken as VerifiedRefreshToken
      )?.refresh_token;
      (verifiedToken as VerifiedToken).haveRefreshToken = true;
    } else {
      // throw new Error("Invalid refresh token");
      (verifiedToken as VerifiedToken).haveRefreshToken = false;
    }
  } else {
    (verifiedToken as VerifiedToken).haveRefreshToken = true;
  }
  console.log("verifiedToken: ", verifiedToken);
  return verifiedToken;
}

function isTokenValid(req: any) {
  const cookie = req.cookies?.token;
  const refreshToken = req.cookies?.refresh_token;
  console.log("cookie token: ", cookie);
  if (!cookie) {
    return { isValid: false, haveRefreshToken: !!refreshToken };
  }
  try {
    verifyJwt(cookie);
    return { isValid: true, haveRefreshToken: !!refreshToken };
  } catch (error) {
    return { isValid: false, haveRefreshToken: !!refreshToken };
  }
}

function deleteToken(res: any) {
  res.setHeader(
    "Set-Cookie",
    `token=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`
  );
}

export { setToken, getToken, deleteToken, isTokenValid };
