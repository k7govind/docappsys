import { Request, Response } from "express";
import bcrypt from "bcrypt";
import User from "../models/user.model.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
} from "../utils/token.js";

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || "12", 10);
const COOKIE_NAME = process.env.COOKIE_NAME || "jid";
const COOKIE_SECURE = (process.env.COOKIE_SECURE === "true") || false;
const COOKIE_PATH = process.env.COOKIE_PATH || "/api/auth/refresh";

export async function register(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ error: "Email already registered" });

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({ email: email.toLowerCase(), passwordHash });

    res.status(201).json({ id: user._id, email: user.email, role: user.role });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const accessToken = signAccessToken({ userId: user._id, role: user.role });
    const refreshToken = signRefreshToken({ userId: user._id });

    user.refreshTokenHash = hashToken(refreshToken);
    await user.save();

    res.cookie(COOKIE_NAME, refreshToken, {
      httpOnly: true,
      secure: COOKIE_SECURE,
      sameSite: "lax",
      path: COOKIE_PATH,
    });

    res.json({ accessToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}

export async function refreshToken(req: Request, res: Response) {
  try {
    const token = req.cookies?.[COOKIE_NAME] || req.body?.refreshToken;
    if (!token) return res.status(401).json({ error: "No refresh token provided" });

    let payload;
    try {
      payload = verifyRefreshToken(token);
    } catch (e) {
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    const userId = payload.userId;
    const user = await User.findById(userId);
    if (!user || !user.refreshTokenHash) return res.status(401).json({ error: "Invalid session" });

    const tokenHash = hashToken(token);
    if (tokenHash !== user.refreshTokenHash) {
      user.refreshTokenHash = null;
      await user.save();
      return res.status(401).json({ error: "Refresh token reuse detected" });
    }

    const newAccess = signAccessToken({ userId: user._id, role: user.role });
    const newRefresh = signRefreshToken({ userId: user._id });
    user.refreshTokenHash = hashToken(newRefresh);
    await user.save();

    res.cookie(COOKIE_NAME, newRefresh, {
      httpOnly: true,
      secure: COOKIE_SECURE,
      sameSite: "lax",
      path: COOKIE_PATH,
    });

    res.json({ accessToken: newAccess });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}

export async function logout(req: Request, res: Response) {
  try {
    const token = req.cookies?.[COOKIE_NAME] || req.body?.refreshToken;
    let userId: string | null = null;
    if (token) {
      try {
        const payload = verifyRefreshToken(token);
        userId = payload.userId;
      } catch (_e) {
        userId = null;
      }
    }
    if (userId) {
      await User.findByIdAndUpdate(userId, { refreshTokenHash: null });
    }
    res.clearCookie(COOKIE_NAME, { path: COOKIE_PATH });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}