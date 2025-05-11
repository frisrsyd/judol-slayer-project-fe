import { signJwt, verifyJwt } from "./jwt";

function setCredential(credentialJson: Record<string, any>, res: any) {
  const credentialJwt = signJwt(credentialJson, 60 * 60 * 24 * 365); // 1 year

  res.setHeader(
    "Set-Cookie",
    `credential=${credentialJwt}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${
      60 * 60 * 24 * 365
    }`
  );
}

function getCredential(req: any) {
  const cookie = req.cookies?.credential;
  if (!cookie) {
    throw new Error("Credential not found in cookies");
  }
  const verifiedCredential = verifyJwt(cookie);
  console.log("verifiedCredential: ", verifiedCredential);
  return verifiedCredential;
}

function isCredentialValidOld(req: any) {
  const cookie = req.cookies?.credential;
  console.log("cookie credential: ", cookie);
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

function isCredentialValid(req: any) {
  // const cookie = req.cookies?.credential;
  // console.log("cookie credential: ", cookie);
  const credentialsWeb = process.env.NEXT_PUBLIC_GOOGLE_CREDENTIALS;
  // if (!cookie) {
  //   return false;
  // }
  if (!credentialsWeb) {
    return false;
  }
  return true;
  // try {
  //   // verifyJwt(cookie);
  //   return true;
  // } catch (error) {
  //   return false;
  // }
}

function deleteCredential(res: any) {
  res.setHeader(
    "Set-Cookie",
    `credential=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`
  );
}

export { setCredential, getCredential, deleteCredential, isCredentialValid };
