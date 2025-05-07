import { signJwt, verifyJwt } from "./jwt";

function setChannelId(channelIdJson: Record<string, any>, res: any) {
  console.log("channelIdJson: ", channelIdJson);
  const channelIdJwt = signJwt(channelIdJson, 60 * 60 * 24 * 365); // 1 year

  res.setHeader(
    "Set-Cookie",
    `channelId=${channelIdJwt}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${
      60 * 60 * 24 * 365
    }`
  );
}

function getChannelId(req: any) {
  const cookie = req.cookies?.channelId;
  if (!cookie) {
    throw new Error("ChannelId not found in cookies");
  }
  const verifiedChannelId = verifyJwt(cookie);
  console.log("verifiedChannelId: ", verifiedChannelId);
  return verifiedChannelId;
}

function isChannelIdValid(req: any) {
  const cookie = req.cookies?.channelId;
  console.log("cookie channelId: ", cookie);
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

function deleteChannelId(res: any) {
  res.setHeader(
    "Set-Cookie",
    `channelId=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`
  );
}

export { setChannelId, getChannelId, deleteChannelId, isChannelIdValid };
