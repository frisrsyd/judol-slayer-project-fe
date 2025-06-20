import { signJwt, verifyJwt } from "./jwt";

function setStrictMode(strictModeJson: Record<string, any>, res: any) {
  console.log("strictModeJson: ", strictModeJson);
  const strictModeJwt = signJwt(strictModeJson, 60 * 60 * 24 * 365); // 1 year

  res.setHeader(
    "Set-Cookie",
    `strictMode=${strictModeJwt}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${
      60 * 60 * 24 * 365
    }`
  );
}

function getStrictMode(req: any) {
  const cookie = req.cookies?.strictMode;
  if (!cookie) {
    return { strictMode: null };
    throw new Error("StrictMode not found in cookies");
  }
  const verifiedStrictMode = verifyJwt(cookie);
  console.log("verifiedStrictMode: ", verifiedStrictMode);
  return verifiedStrictMode;
}

function isStrictModeValid(req: any) {
  const cookie = req.cookies?.strictMode;
  console.log("cookie strictMode: ", cookie);
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

function deleteStrictMode(res: any) {
  res.setHeader(
    "Set-Cookie",
    `strictMode=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`
  );
}

export {
  setStrictMode,
  getStrictMode,
  deleteStrictMode,
  isStrictModeValid,
};
