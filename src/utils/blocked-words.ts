import { signJwt, verifyJwt } from "./jwt";

function setBlockedWords(blokedWordsJson: Record<string, any>, res: any) {
  console.log("blokedWordsJson: ", blokedWordsJson);
  const blokedWordsJwt = signJwt(blokedWordsJson, 60 * 60 * 24 * 365); // 1 year

  res.setHeader(
    "Set-Cookie",
    `blokedWords=${blokedWordsJwt}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${
      60 * 60 * 24 * 365
    }`
  );
}

function getBlockedWords(req: any) {
  const cookie = req.cookies?.blokedWords;
  if (!cookie) {
    return { blokedWords: [] };
    throw new Error("BlockedWords not found in cookies");
  }
  const verifiedBlockedWords = verifyJwt(cookie);
  console.log("verifiedBlockedWords: ", verifiedBlockedWords);
  return verifiedBlockedWords;
}

function isBlockedWordsValid(req: any) {
  const cookie = req.cookies?.blokedWords;
  console.log("cookie blokedWords: ", cookie);
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
    `blokedWords=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`
  );
}

export {
  setBlockedWords,
  getBlockedWords,
  deleteBlockedWords,
  isBlockedWordsValid,
};
