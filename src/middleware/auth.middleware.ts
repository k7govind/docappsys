import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/token.js";

export interface AuthenticatedRequest extends Request {
  user?: { id: string; role?: string };
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No authorization header" });

  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) return res.status(401).json({ error: "Invalid authorization format" });

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.userId, role: payload.role };
    return next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function requireRole(role: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    if (req.user.role !== role) return res.status(403).json({ error: "Forbidden" });
    next();
  };
}