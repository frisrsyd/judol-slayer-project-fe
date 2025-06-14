import { signJwt, verifyJwt } from "./jwt";

function setToken(tokenJson: Record<string, any>, res: any) {
  console.log("tokenJson: ", tokenJson);
  const expiredAt = 60 * 60; // 1 hour
  const refreshToken = tokenJson.refresh_token_instagram
    ? signJwt({ refresh_token_instagram: tokenJson?.refresh_token_instagram }, 60 * 60)
    : null;
  const tokenJwt = signJwt(tokenJson, 60 * 60); // 1 year
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
      `token_instagram=${tokenJwt}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${expiredAt}`,
      refreshToken
        ? `refresh_token_instagram=${refreshToken}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${expiredAt}`
        : "",
    ].filter(Boolean)
  ); // Filter out empty strings
}
interface VerifiedToken {
  access_token?: string;
  permissions?: string;
  user_id?: string;
  expiry_date?: number;
  refresh_token_instagram?: string;
  refresh_token_expires_in?: number;
  iat?: number;
  exp?: number;
  haveRefreshToken?: boolean;
}

interface VerifiedRefreshToken {
  refresh_token_instagram?: string;
}

function getToken(req: any) {
  const cookie = req.cookies?.token_instagram;
  if (!cookie) {
    throw new Error("Token not found in cookies");
  }
  const verifiedToken = verifyJwt(cookie);
  if (!(verifiedToken as VerifiedToken)?.refresh_token_instagram) {
    const refreshToken = req.cookies?.refresh_token_instagram;
    if (!refreshToken) {
      // throw new Error("Refresh token not found in cookies");
      (verifiedToken as VerifiedToken).haveRefreshToken = false;
    }
    const verifiedRefreshToken = refreshToken ? verifyJwt(refreshToken) : null;
    if (verifiedRefreshToken as VerifiedRefreshToken) {
      (verifiedToken as VerifiedToken).refresh_token_instagram = (
        verifiedRefreshToken as VerifiedRefreshToken
      )?.refresh_token_instagram;
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
  const cookie = req.cookies?.token_instagram;
  const refreshToken = req.cookies?.refresh_token_instagram;
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
    `token_instagram=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`
  );
}

export { setToken, getToken, deleteToken, isTokenValid };
