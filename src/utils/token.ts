import jwt from "jsonwebtoken";
import crypto from "crypto";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET as string;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;
const ACCESS_EXP = process.env.ACCESS_TOKEN_EXPIRY || "15m";
const REFRESH_EXP = process.env.REFRESH_TOKEN_EXPIRY || "7d";

export function signAccessToken(payload: object) {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXP });
}

export function signRefreshToken(payload: object) {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXP });
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, ACCESS_SECRET) as any;
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, REFRESH_SECRET) as any;
}

export function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}