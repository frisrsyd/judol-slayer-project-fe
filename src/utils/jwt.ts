import jwt from "jsonwebtoken";

const privateKey = process.env.NEXT_PUBLIC_APP_SECRET_KEY?.toLowerCase();

function signJwt(payload: object, expiresIn: number): string {
  if (!privateKey) {
    throw new Error("Private key is not defined");
  }
  const signed = jwt.sign(payload, privateKey, {
    algorithm: "HS256",
    expiresIn,
  });
  console.log("JWT signed:", signed);
  return signed;
}

function verifyJwt(token: string): object | string {
  try {
    if (!privateKey) {
      throw new Error("Private key is not defined");
    }
    const verified = jwt.verify(token, privateKey, { algorithms: ["HS256"] });
    console.log("JWT verified:", verified);
    return verified;
  } catch (error) {
    console.error("JWT verification failed:", error);
    throw new Error("Invalid token");
  }
}

export { signJwt, verifyJwt };
