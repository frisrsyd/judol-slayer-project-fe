import { signJwt, verifyJwt } from "./jwt";

function setBlockedWords(blockedWordsJson: Record<string, any>, res: any) {
  console.log("blockedWordsJson: ", blockedWordsJson);
  const blockedWordsJwt = signJwt(blockedWordsJson, 60 * 60 * 24 * 365); // 1 year

  res.setHeader(
    "Set-Cookie",
    `blockedWords=${blockedWordsJwt}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${
      60 * 60 * 24 * 365
    }`
  );
}

function getBlockedWords(req: any) {
  const cookie = req.cookies?.blockedWords;
  if (!cookie) {
    return { blockedWords: [] };
    throw new Error("BlockedWords not found in cookies");
  }
  const verifiedBlockedWords = verifyJwt(cookie);
  console.log("verifiedBlockedWords: ", verifiedBlockedWords);
  return verifiedBlockedWords;
}

function isBlockedWordsValid(req: any) {
  const cookie = req.cookies?.blockedWords;
  console.log("cookie blockedWords: ", cookie);
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

function deleteBlockedWords(res: any) {
  res.setHeader(
    "Set-Cookie",
    `blockedWords=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`
  );
}

export {
  setBlockedWords,
  getBlockedWords,
  deleteBlockedWords,
  isBlockedWordsValid,
};
