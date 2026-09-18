import { NextFunction, Request, Response } from "express";
import { AppError } from "../lib/app-error";
import { verifyAccessToken } from "../lib/jwt";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userEmail?: string;
    }
  }
}

/**
 * Reads the access token from the Authorization header (Bearer scheme),
 * verifies it, and attaches userId/userEmail to the request. Everything
 * downstream (files, folders, shares) scopes its DB queries by req.userId —
 * that's the single choke point that guarantees users only ever touch
 * their own data.
 */
export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    throw AppError.unauthorized("Missing or malformed Authorization header");
  }

  const token = header.slice("Bearer ".length);

  try {
    const payload = verifyAccessToken(token);
    req.userId = payload.sub;
    req.userEmail = payload.email;
    next();
  } catch {
    throw AppError.unauthorized("Invalid or expired token", "TOKEN_INVALID");
  }
}
